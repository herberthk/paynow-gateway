import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/prisma", () => ({
  default: {
    transaction: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      count: vi.fn(),
    },
  },
}));

vi.mock("server-only", () => ({}));

// session.ts imports jose + next/headers — mock the module itself so tests
// control getUserSession per-test without touching those dependencies.
vi.mock("@/lib/actions/session", () => ({
  getUserSession: vi.fn(),
}));

// Transitive via ./fee (imported by transactions.ts).
vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

import prisma from "@/lib/prisma";
import { getUserSession } from "@/lib/actions/session";
import { getTransactions } from "@/lib/actions/transactions";

const findUnique = vi.mocked(prisma.transaction.findUnique);
const findMany = vi.mocked(prisma.transaction.findMany);
const count = vi.mocked(prisma.transaction.count);
const mockSession = vi.mocked(getUserSession);

const owner = { id: 1, privilege: "none" } as unknown as User;
const stranger = { id: 2, privilege: "none" } as unknown as User;
const superAdmin = { id: 99, privilege: "super_admin" } as unknown as User;

const stubTx = (overrides: Record<string, unknown> = {}) => ({
  id: "tx_1",
  userId: 1,
  recipientId: 1,
  displayName: "Self",
  amount: { toNumber: () => 1234 },
  currency: "UGX",
  type: "DEPOSIT",
  status: "COMPLETED",
  category: "Transfer",
  method: "Wallet P2P Transfer",
  txn_ref: "TX_ABC123",
  externalReference: null,
  fee: { toNumber: () => 50 },
  reason: null,
  receiptUrl: null,
  createdAt: new Date("2026-09-01T10:00:00.000Z"),
  updatedAt: new Date("2026-09-02T10:00:00.000Z"),
  ...overrides,
});

beforeEach(() => {
  vi.clearAllMocks();
});

describe("getTransactions TX_ ref lookup + serializer", () => {
  it("returns the row for the owner", async () => {
    mockSession.mockResolvedValueOnce(owner);
    findUnique.mockResolvedValueOnce(stubTx() as never);
    const res = await getTransactions({ query: "TX_ABC123" });
    expect(res.totalTransactions).toBe(1);
    expect(res.totalPages).toBe(1);
    expect(res.transactions).toHaveLength(1);
    expect(res.transactions[0]).toMatchObject({
      txn_ref: "TX_ABC123",
      amount: 1234,
      fee: 50,
    });
  });

  it("returns the empty shape for a non-owner non-admin", async () => {
    mockSession.mockResolvedValueOnce(stranger);
    findUnique.mockResolvedValueOnce(stubTx() as never);
    await expect(getTransactions({ query: "TX_ABC123" })).resolves.toEqual({
      transactions: [],
      totalPages: 0,
      currentPage: 1,
      totalTransactions: 0,
    });
  });

  it("returns the empty shape when the ref is not found", async () => {
    mockSession.mockResolvedValueOnce(owner);
    findUnique.mockResolvedValue(null);
    await expect(getTransactions({ query: "TX_NOPE" })).resolves.toEqual({
      transactions: [],
      totalPages: 0,
      currentPage: 1,
      totalTransactions: 0,
    });
  });

  it("returns a foreign row for a super_admin", async () => {
    mockSession.mockResolvedValueOnce(superAdmin);
    findUnique.mockResolvedValueOnce(
      stubTx({ userId: 1, recipientId: 1 }) as never,
    );
    const res = await getTransactions({ query: "TX_ABC123" });
    expect(res.totalTransactions).toBe(1);
    expect(res.transactions).toHaveLength(1);
    expect(res.transactions[0]).toMatchObject({ txn_ref: "TX_ABC123" });
  });

  it("serializes Decimals to numbers and nulls to undefined", async () => {
    mockSession.mockResolvedValueOnce(owner);
    findUnique.mockResolvedValueOnce(
      stubTx({
        amount: { toNumber: () => 7500 },
        fee: { toNumber: () => 0 },
        receiptUrl: null,
        reason: null,
      }) as never,
    );
    const res = await getTransactions({ query: "TX_ABC123" });
    const row = res.transactions[0];
    expect(row.amount).toBe(7500);
    expect(row.fee).toBe(0);
    expect(row.createdAt).toBe("2026-09-01T10:00:00.000Z");
    expect(row.receiptUrl).toBeUndefined();
    expect(row.reason).toBeUndefined();
  });
});

describe("getTransactions pagination", () => {
  it("caps the page size before querying", async () => {
    mockSession.mockResolvedValueOnce(owner);
    findMany.mockResolvedValueOnce([]);
    count.mockResolvedValueOnce(0);

    const result = await getTransactions({ page: 2, limit: 1_000_000 });

    expect(findMany).toHaveBeenCalledWith(
      expect.objectContaining({ skip: 100, take: 100 }),
    );
    expect(result.currentPage).toBe(2);
  });

  it("defaults invalid page and limit values before querying", async () => {
    mockSession.mockResolvedValueOnce(owner);
    findMany.mockResolvedValueOnce([]);
    count.mockResolvedValueOnce(0);

    const result = await getTransactions({ page: 1.5, limit: 0 });

    expect(findMany).toHaveBeenCalledWith(
      expect.objectContaining({ skip: 0, take: 10 }),
    );
    expect(result.currentPage).toBe(1);
  });
});
