import { beforeEach, describe, expect, it, vi } from "vitest";

const acDepositFunds = vi.fn();

vi.mock("server-only", () => ({}));
vi.mock("@/lib/prisma", () => ({
  default: {
    user: { findFirst: vi.fn() },
    transaction: {
      findUnique: vi.fn(),
      count: vi.fn(),
      create: vi.fn(),
    },
    processedTransaction: { create: vi.fn() },
    $transaction: vi.fn(),
  },
}));
vi.mock("@/lib/actions/session", () => ({ getUserSession: vi.fn() }));
vi.mock("@/lib/server/support-core", () => ({
  _processMobileMoneySupport: vi.fn(),
  _processWalletSupportCore: vi.fn(),
}));
vi.mock("@/lib/yo/client", () => ({
  getYoClient: vi.fn(() => ({ acDepositFunds })),
  configureDepositRequest: vi.fn(),
}));
vi.mock("@/lib/actions/fee", () => ({
  getTransactionFee: vi.fn(),
}));
vi.mock("@/utils", () => ({ generateTxRef: vi.fn() }));
vi.mock("@/sdk/index", () => ({
  default: { verify: vi.fn() },
}));
vi.mock("@/lib/actions/yo", () => ({ finalizeYoFailure: vi.fn() }));

import prisma from "@/lib/prisma";
import { getUserSession } from "@/lib/actions/session";
import { getTransactionFee } from "@/lib/actions/fee";
import { getYoClient } from "@/lib/yo/client";
import verifyNumber from "@/sdk/index";
import { generateTxRef } from "@/utils";
import { initiateYoSupport } from "@/lib/actions/support";

const request = {
  amount: 5_000,
  toUserId: 2,
  payerMsisdn: "256779123456",
  recipientMsisdn: "256772123456",
  requestKey: "2ed78304-a660-4c79-9426-5535633b7457",
  narrative: "Support for Bob",
};

const existingTransaction = {
  userId: 1,
  recipientId: 2,
  type: "SUPPORT",
  amount: { toNumber: () => 5_000 },
  fee: { toNumber: () => 100 },
  msisdn: request.payerMsisdn,
  provider: "MTN",
  externalReference: "TX_EXISTING",
  txn_ref: "TX_EXISTING",
};

const findRecipient = vi.mocked(prisma.user.findFirst);
const findTransaction = vi.mocked(prisma.transaction.findUnique);
const countTransactions = vi.mocked(prisma.transaction.count);
const persistTransaction = vi.mocked(prisma.$transaction);
const mockSession = vi.mocked(getUserSession);
const mockFee = vi.mocked(getTransactionFee);
const mockVerify = vi.mocked(verifyNumber.verify);
const mockGenerateTxRef = vi.mocked(generateTxRef);
const mockGetYoClient = vi.mocked(getYoClient);

beforeEach(() => {
  vi.clearAllMocks();
  mockSession.mockResolvedValue({ id: 1, privilege: "none" } as User);
  findRecipient.mockResolvedValue({
    id: 2,
    name: "Bob",
    tel: request.recipientMsisdn,
  } as never);
  countTransactions.mockResolvedValue(0);
  mockFee.mockResolvedValue({ success: true, amount: 100 });
  mockVerify.mockResolvedValue({ response: "OK", data: {} } as never);
  mockGenerateTxRef.mockResolvedValue("TX_NEW");
});

describe("initiateYoSupport idempotency", () => {
  it("returns an existing request without generating a ref or dispatching", async () => {
    findTransaction.mockResolvedValue(existingTransaction as never);

    const result = await initiateYoSupport(request);

    expect(result).toEqual({
      success: true,
      externalRef: "TX_EXISTING",
      provider: "MTN",
      fee: 100,
      totalCharged: 5_100,
    });
    expect(findRecipient).toHaveBeenCalledWith({
      where: { id: 2, deleted_at: null },
      select: { id: true, name: true, tel: true },
    });
    expect(mockGenerateTxRef).not.toHaveBeenCalled();
    expect(mockGetYoClient).not.toHaveBeenCalled();
    expect(acDepositFunds).not.toHaveBeenCalled();
  });

  it("returns the winner after a concurrent request-key conflict", async () => {
    findTransaction
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(existingTransaction as never);
    persistTransaction.mockRejectedValueOnce({ code: "P2002" });

    const result = await initiateYoSupport(request);

    expect(result).toMatchObject({
      success: true,
      externalRef: "TX_EXISTING",
    });
    expect(mockGenerateTxRef).toHaveBeenCalledTimes(1);
    expect(acDepositFunds).not.toHaveBeenCalled();
  });
});
