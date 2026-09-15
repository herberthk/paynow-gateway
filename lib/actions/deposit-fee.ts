"use server";

import type { Prisma } from "@/lib/generated/prisma/client";

/**
 * Shared deposit-fee fan-out: credit the fee to every admin wallet and
 * notify them. Runs inside the caller's interactive transaction so fee
 * credit + notification stay atomic with the surrounding settlement.
 */
export const creditDepositFee = async (
  tx: Prisma.TransactionClient,
  opts: {
    fromUserId: number;
    externalRef: string;
    fee: number;
    admins: { id: number }[];
  },
): Promise<void> => {
  const { fromUserId, externalRef, fee, admins } = opts;
  if (fee <= 0) return;
  if (admins.length === 0) {
    console.warn("deposit fee vanished: fee>0 but no admins to credit", {
      externalRef,
      fee,
    });
    return;
  }

  await tx.wallet.createMany({
    data: admins.map((admin) => ({
      userId: admin.id,
      amount: fee,
      type: "CREDIT",
      reason: `Transaction fee from deposit: ${externalRef}`,
      refference: externalRef,
    })),
  });

  await tx.systemNotification.createMany({
    data: admins.map((admin) => ({
      fromUserId,
      toUserId: admin.id,
      title: "New Deposit Fee",
      message: `You received a transaction fee of UGX ${fee.toLocaleString()} from a deposit.`,
      type: "SUCCESS",
      path: `/dashboard/user/transactions?query=${externalRef}`,
    })),
  });
};
