"use server";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getUserSession } from "./session";
import { generateTxRef } from "@/utils";
import { getAdmins } from "./admin";
import { getTransactionFee } from "./fee";
import { sendAdminTransferEmail, sendTransferEmail } from "./email";
// export const getUserWallet = async (id: number) => {
//   const wallet = await prisma.wallet.findFirst({
//     where: {
//       userId: id,
//     },
//     select: {
//       amount: true,
//       id: true,
//       updatedAt: true,
//       createdAt: true,
//       userId: true,
//       type: true,
//       reason: true,
//       refference: true,
//     },
//   });
//   return {
//     ...wallet,
//     balance: Number(wallet?.amount),
//     createdAt: wallet?.createdAt.toDateString(),
//     updatedAt: wallet?.updatedAt.toDateString(),
//   };
// };

/**
 * Calculate total available balance for a user across all wallets
 * CREDIT wallets = cash in (positive balance)
 * DEBIT wallets = cash out (negative balance)
 * @param userId - User ID
 * @returns Total available balance
 */
export const getWalletBalance = async (userId: number) => {
  try {
    const result = await prisma.$queryRaw<
      { balance: number; walletCount: number }[]
    >`
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
      WHERE "userId" = ${userId};
    `;

    return {
      success: true,
      balance: Number(result[0]?.balance ?? 0),
    };
  } catch (error) {
    console.error("Error calculating total balance:", error);
    return {
      success: false,
      balance: 0,
    };
  }
};

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
    // Validate amount
    if (amount <= 500) {
      return {
        success: false,
        message: "Transfer amount must be greater than 500",
        amount: 0,
        currency: "UGX",
        refference: "",
        fee: 0,
      };
    }

    // Prevent self-transfer
    if (senderId === recipientId) {
      return {
        success: false,
        message: "You cannot transfer money to yourself",
        amount: 0,
        currency: "UGX",
        refference: "",
        fee: 0,
      };
    }

    // Transaction fee
    const fee = await getTransactionFee({ amount, type: "TRANSFER" });
    if (!fee.success || !fee.amount) {
      return {
        success: false,
        message: fee.message,
        amount: 0,
        currency: "UGX",
        refference: "",
        fee: 0,
      };
    }

    const admins = await getAdmins(); // pre-fetch
    // Generate transaction reference
    const refference = await generateTxRef();
    const senderBalance = (await getWalletBalance(senderId)).balance;
    // calculate fee based on type
    const TRANSACTION_FEE = fee.amount;
    // Use Prisma transaction to ensure atomicity
    const result = await prisma.$transaction(async (tx) => {
      const totalDeduction = amount + TRANSACTION_FEE;

      // Check sufficient balance
      if (senderBalance < totalDeduction) {
        throw new Error(
          `Insufficient balance. Available UGX ${senderBalance.toLocaleString()}, Required UGX ${totalDeduction.toLocaleString()}`,
        );
      }
      const recipient = await tx.user.findUnique({
        where: { id: recipientId },
        select: { name: true, email: true },
      });

      // Debit sender (Amount + Fee)
      await tx.wallet.create({
        data: {
          userId: senderId,
          amount: totalDeduction,
          type: "DEBIT",
          reason: `Transfered UGX ${amount.toLocaleString()} to ${recipient?.name || "Unknown"}`,
          refference,
        },
      });

      // Credit recipient
      await tx.wallet.create({
        data: {
          userId: recipientId,
          amount,
          type: "CREDIT",
          reason: `Received UGX ${amount.toLocaleString()} from ${sender?.name || "Unknown"}`,
          refference,
        },
      });

      // Create transaction record for both sender and recipient
      await tx.transaction.create({
        data: {
          userId: senderId,
          recipientId,
          displayName: sender?.name || "Unknown",
          amount,
          currency: "UGX",
          type: "TRANSFER",
          status: "COMPLETED",
          category: "Transfer",
          method: "Wallet P2P Transfer",
          txn_ref: refference,
          fee: TRANSACTION_FEE,
          reason: `Received UGX ${amount.toLocaleString()} from ${sender?.name || "Unknown"}`,
        },
      });

      // Create ledger entries for the transfer
      // Sender: Credit Wallet (money out), Debit Transfer Out (expense)
      // await tx.ledger.create({
      //   data: {
      //     transactionId: transaction.id,
      //     userId: senderId,
      //     type: "CREDIT",
      //     amount,
      //     account: "Wallet",
      //     description: `Sent to ${recipient?.name || "Unknown"}`,
      //   },
      // });
      // await tx.ledger.create({
      //   data: {
      //     transactionId: transaction.id,
      //     userId: senderId,
      //     type: "DEBIT",
      //     amount,
      //     account: "Transfer Out",
      //     description: `Sent to ${recipient?.name || "Unknown"}`,
      //   },
      // });

      // Recipient: Debit Wallet (money in), Credit Transfer In (income)
      // await tx.ledger.create({
      //   data: {
      //     transactionId: transaction.id,
      //     userId: recipientId,
      //     type: "DEBIT",
      //     amount,
      //     account: "Wallet",
      //     description: `Received from ${sender?.name || "Unknown"}`,
      //   },
      // });
      // await tx.ledger.create({
      //   data: {
      //     transactionId: transaction.id,
      //     userId: recipientId,
      //     type: "CREDIT",
      //     amount,
      //     account: "Transfer In",
      //     description: `Received from ${sender?.name || "Unknown"}`,
      //   },
      // });

      // Create ledger entries for the fee
      if (TRANSACTION_FEE > 0) {
        // Credit admin wallet
        await tx.wallet.createMany({
          data: admins.map((admin) => ({
            userId: admin.id,
            amount: TRANSACTION_FEE,
            type: "CREDIT",
            reason: `Transaction fee for transfer to ${recipient?.name || "Unknown"}`,
            refference,
          })),
        });

        // Send notification to admin
        await tx.systemNotification.createMany({
          data: admins.map((admin) => ({
            fromUserId: senderId,
            toUserId: admin.id,
            title: "Transaction Fee",
            message: `You received UGX ${TRANSACTION_FEE.toLocaleString()} from ${sender?.name || "Unknown"}`,
            type: "SUCCESS",
            path: `/dashboard/user/transactions?query=${refference}`,
          })),
        });
        // await tx.ledger.create({
        //   data: {
        //     transactionId: transaction.id,
        //     userId: senderId,
        //     type: "CREDIT",
        //     amount: TRANSACTION_FEE,
        //     account: "Wallet",
        //     description: "Transaction fee",
        //   },
        // });
        // await tx.ledger.create({
        //   data: {
        //     transactionId: transaction.id,
        //     userId: senderId,
        //     type: "DEBIT",
        //     amount: TRANSACTION_FEE,
        //     account: "Fee Expense",
        //     description: "Transaction fee",
        //   },
        // });
      }
      // Notification for sender and recipient
      await tx.systemNotification.createMany({
        data: [
          {
            fromUserId: senderId,
            toUserId: senderId,
            title: "Transfer Sent",
            message: `You sent UGX ${amount.toLocaleString()} to ${recipient?.name ?? "Unknown"}`,
            type: "SUCCESS",
            path: `/dashboard/user/transactions?query=${refference}`,
          },
          {
            fromUserId: senderId,
            toUserId: recipientId,
            title: "Money Received",
            message: `You received UGX ${amount.toLocaleString()} from ${sender.name ?? "Unknown"}`,
            type: "SUCCESS",
            path: `/dashboard/user/transactions?query=${refference}`,
          },
        ],
      });

      return {
        success: true,
        message: "Transfer completed successfully",
        amount,
        refference,
        fee: TRANSACTION_FEE,
        currency: "UGX",
        recipientEmail: recipient?.email,
        recipientName: recipient?.name,
      };
    });

    if (result.success) {
      // Send background emails
      if (result.recipientEmail) {
        sendTransferEmail({
          email: result.recipientEmail,
          userName: result.recipientName || "User",
          amount: result.amount!,
          senderName: sender?.name || "Unknown",
          reference: result.refference!,
        });
      }

      // Notify admins
      if (TRANSACTION_FEE > 0) {
        admins.forEach((admin) => {
          if (admin.email) {
            sendAdminTransferEmail({
              email: admin.email,
              adminName: admin.name || "Admin",
              amount: result.amount!,
              senderName: sender?.name || "Unknown",
              recipientName: result.recipientName || "Unknown",
              reference: result.refference!,
              fee: TRANSACTION_FEE,
            });
          }
        });
      }
    }

    revalidatePath("/dashboard/user/wallet");
    return result;
  } catch (error: unknown) {
    console.error("Error processing P2P transfer:", error);
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Failed to process transfer",
    };
  }
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
    const admins = await getAdmins();
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
