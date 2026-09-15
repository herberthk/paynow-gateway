import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/prisma", () => ({
  default: {
    fee: {
      findUnique: vi.fn(),
    },
  },
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

import prisma from "@/lib/prisma";
import { seedFees } from "@/utils/seed";
import { getTransactionFee } from "./fee";

const findUnique = vi.mocked(prisma.fee.findUnique);

beforeEach(() => {
  vi.clearAllMocks();
});

describe("getTransactionFee", () => {
  it("computes a FIXED fee with ceil", async () => {
    findUnique.mockResolvedValueOnce({ value: 500, type: "FIXED" } as never);
    await expect(
      getTransactionFee({ amount: 10000, type: "TRANSFER" }),
    ).resolves.toEqual({ success: true, amount: 500 });
  });

  it("ceils a fractional FIXED fee", async () => {
    findUnique.mockResolvedValueOnce({ value: 499.2, type: "FIXED" } as never);
    await expect(
      getTransactionFee({ amount: 10000, type: "TRANSFER" }),
    ).resolves.toEqual({ success: true, amount: 500 });
  });

  it("applies PERCENTAGE fees as percent-of-amount (value 1.5 on 10000 → 150)", async () => {
    // CORRECTED semantics: seed stores percent values (see utils/seed.ts —
    // WITHDRAWAL PERCENTAGE value 1.5, described as "1.5%" in the audit-log
    // seed). fee.ts must divide by 100. This test encodes the intended
    // behavior and FAILS against the unfixed `amount * value` code until
    // the /100 fix lands (sibling task owns fee.ts — not touched here).
    findUnique.mockResolvedValueOnce({
      value: 1.5,
      type: "PERCENTAGE",
    } as never);
    await expect(
      getTransactionFee({ amount: 10000, type: "WITHDRAWAL" }),
    ).resolves.toEqual({ success: true, amount: 150 });
  });

  it("returns Fee not found when no active fee row exists", async () => {
    findUnique.mockResolvedValueOnce(null);
    await expect(
      getTransactionFee({ amount: 10000, type: "TRANSFER" }),
    ).resolves.toEqual({ success: false, message: "Fee not found" });
  });

  it("returns a failure result when prisma throws", async () => {
    findUnique.mockRejectedValueOnce(new Error("db down"));
    await expect(
      getTransactionFee({ amount: 10000, type: "TRANSFER" }),
    ).resolves.toEqual({
      success: false,
      message: "Failed to fetch transaction fee",
    });
  });
});

describe("seedFees regression", () => {
  it("keeps PERCENTAGE values below 100, FIXED values positive integers, categories unique", () => {
    const categories = seedFees.map((fee) => fee.category);
    expect(new Set(categories).size).toBe(categories.length);
    for (const fee of seedFees) {
      if (fee.type === "PERCENTAGE") {
        expect(fee.value).toBeGreaterThan(0);
        expect(fee.value).toBeLessThan(100);
      } else {
        expect(Number.isInteger(fee.value)).toBe(true);
        expect(fee.value).toBeGreaterThan(0);
      }
    }
  });
});
