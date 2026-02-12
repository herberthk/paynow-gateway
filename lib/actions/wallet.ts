"use server";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
export const getUserWallet = async (id: number) => {
  const wallet = await prisma.wallet.findUnique({
    where: {
      userId: id,
    },
    select: {
      balance: true,
      id: true,
      updatedAt: true,
      createdAt: true,
      userId: true,
    },
  });
  return {
    ...wallet,
    balance: Number(wallet?.balance),
    createdAt: wallet?.createdAt.toDateString(),
    updatedAt: wallet?.updatedAt.toDateString(),
  };
};

/**
 * Process P2P transfer between two wallets
 * @param senderId - User ID of sender
 * @param recipientId - User ID of recipient
 * @param amount - Amount to transfer
 * @returns Success/error status with updated balances
 */
export const processP2PTransfer = async (
  senderId: number,
  recipientId: number,
  amount: number,
) => {
  try {
    // Validate amount
    if (amount <= 0) {
      return {
        success: false,
        message: "Transfer amount must be greater than zero",
      };
    }

    // Prevent self-transfer
    if (senderId === recipientId) {
      return {
        success: false,
        message: "You cannot transfer money to yourself",
      };
    }

    // Use Prisma transaction to ensure atomicity
    const result = await prisma.$transaction(async (tx) => {
      // Get sender wallet
      const senderWallet = await tx.wallet.findUnique({
        where: { userId: senderId },
      });

      if (!senderWallet) {
        return {
          success: false,
          message: "Sender wallet not found",
        };
      }

      const senderBalance = senderWallet.balance.toNumber();

      // Transaction fee
      const TRANSACTION_FEE = 200;
      const totalDeduction = amount + TRANSACTION_FEE;

      // Check sufficient balance
      if (senderBalance < totalDeduction) {
        return {
          success: false,
          message: `Insufficient balance. Available: UGX ${senderBalance.toLocaleString()} (Required: UGX ${totalDeduction.toLocaleString()} including fee)`,
        };
      }

      // Get recipient wallet
      const recipientWallet = await tx.wallet.findUnique({
        where: { userId: recipientId },
      });

      if (!recipientWallet) {
        return {
          success: false,
          message: "Recipient wallet not found",
        };
      }

      // Debit sender (Amount + Fee)
      const updatedSenderWallet = await tx.wallet.update({
        where: { userId: senderId },
        data: {
          balance: {
            decrement: totalDeduction,
          },
        },
      });

      // Credit recipient
      const updatedRecipientWallet = await tx.wallet.update({
        where: { userId: recipientId },
        data: {
          balance: {
            increment: amount,
          },
        },
      });

      return {
        senderBalance: updatedSenderWallet.balance.toNumber(),
        recipientBalance: updatedRecipientWallet.balance.toNumber(),
      };
    });
    revalidatePath("/dashboard/user/wallet");
    return {
      success: true,
      message: "Transfer completed successfully",
      senderBalance: result.senderBalance,
      recipientBalance: result.recipientBalance,
    };
  } catch (error: unknown) {
    console.error("Error processing P2P transfer:", error);
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Failed to process transfer",
    };
  }
};

export const creditWallet = async (id: number, amount: number) => {
  try {
    const wallet = await prisma.wallet.update({
      where: { userId: id },
      data: { balance: { increment: amount } },
    });
    return wallet;
  } catch (error) {
    console.error("Error crediting wallet:", error);
    return null;
  }
};

export const debitWallet = async (id: number, amount: number) => {
  try {
    const wallet = await prisma.wallet.update({
      where: { userId: id },
      data: { balance: { decrement: amount } },
    });
    return wallet;
  } catch (error) {
    console.error("Error debiting wallet:", error);
    return null;
  }
};
