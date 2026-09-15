"use server";
import prisma from "@/lib/prisma";
import { getCachedAdmins } from "@/lib/admin/cached-admins";
import { getUserSession } from "./session";
import {
  _getTransactionByRefCore,
  _processMobileMoneyDepositCore,
  _processP2PTransferCore,
  getWalletBalance as getWalletBalanceForUser,
} from "@/lib/server/wallet-core";

/**
 * Process Mobile Money deposit for a user
 * @deprecated Simulated instant-credit flow. New top-ups must use
 * `initiateYoDeposit` from `@/lib/actions/yo` (real Yo! Payments with
 * PENDING → webhook/poll settlement). Kept for the legacy v1 API route.
 */
export const processMobileMoneyDeposit = async ({
  amount,
}: {
  amount: number;
}): Promise<{ success: boolean; refference?: string; message: string }> => {
  try {
    const user = await getUserSession();
    if (!user) return { success: false, message: "Unauthorized" };
    return _processMobileMoneyDepositCore(user, amount);
  } catch (error) {
    console.error("Error processing deposit:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Deposit failed",
    };
  }
};

export const getWalletBalance = async (userId: number) =>
  getWalletBalanceForUser(userId);

/**
 * Calculate total available balance for a user before a specific date
 * Used for trend analysis
 * @param userId - User ID
 * @param beforeDate - Calculate balance before this date
 * @returns Total available balance before the specified date
 */
export const getWalletBalanceBeforeDate = async (
  userId: number,
  beforeDate: Date,
) => {
  try {
    const result = await prisma.$queryRaw<{ balance: number }[]>`
      SELECT 
        COALESCE(
          SUM(
            CASE 
              WHEN type = 'CREDIT' THEN amount
              WHEN type = 'DEBIT' THEN -amount
              ELSE 0
            END
          ), 
          0
        ) AS balance
      FROM payment_wallets
      WHERE "userId" = ${userId}
        AND "createdAt" < ${beforeDate};
    `;

    return {
      success: true,
      balance: Number(result[0]?.balance ?? 0),
    };
  } catch (error) {
    console.error("Error calculating balance before date:", error);
    return {
      success: false,
      balance: 0,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
};
/**
 * Process P2P wallet transfer — public Server Action.
 * Authenticates via session cookie then delegates to the core.
 */
export const processP2PTransfer = async (
  recipientId: number,
  amount: number,
) => {
  const sender = await getUserSession();
  if (!sender) {
    return {
      success: false,
      message: "User not found",
      amount: 0,
      currency: "UGX",
      refference: "",
      fee: 0,
    };
  }
  return _processP2PTransferCore(sender, recipientId, amount);
};

type CreateWalletTransaction = {
  refference: string;
  amount: number;
  type?: LedgerType;
  reason: string;
  userId: number;
};

export const createWalletTransaction = async ({
  refference,
  amount,
  type = "CREDIT",
  reason,
  userId,
}: CreateWalletTransaction) => {
  try {
    const wallet = await prisma.wallet.create({
      data: {
        userId,
        amount,
        type,
        reason,
        refference,
      },
    });
    return wallet;
  } catch (error) {
    console.error("Error crediting wallet:", error);
    return null;
  }
};

type CreditAdminWallet = {
  amount: number;
  reason: string;
  refference: string;
};
// Credit admin wallets with transaction fee
export const creditAdminWallet = async ({
  amount,
  reason,
  refference,
}: CreditAdminWallet) => {
  try {
    const admins = await getCachedAdmins();
    await prisma.wallet.createMany({
      data: admins.map((admin) => ({
        userId: admin.id,
        amount,
        reason,
        refference,
      })),
    });
    return true;
  } catch (error) {
    console.error("Error crediting admin wallet:", error);
    return null;
  }
};
/**
 * Fetch transaction details by reference.
 * Resolves by `txn_ref` first, then falls back to `externalReference`
 * (Yo! top-ups use the same value for both, but external callers may
 * pass either).
 */
export const getTransactionByRef = async ({
  reference,
}: {
  reference: string;
}) => {
  const user = await getUserSession();
  if (!user) return { success: false as const, message: "Unauthorized" };
  return _getTransactionByRefCore(user, reference);
};
