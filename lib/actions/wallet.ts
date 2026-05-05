"use server";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getUserSession } from "./session";
import { generateTxRef } from "@/utils";
import { getAdmins } from "./admin";
import { getTransactionFee } from "./fee";
import {
  sendAdminTransferEmail,
  sendDepositEmail,
  sendAdminDepositNoticeEmail,
  sendSenderTransferEmail,
  sendTransferEmail,
} from "./email";

/**
 * Core logic to finalize a deposit in the database
 * Used by different payment providers (Mobile Money, Stripe,etc)
 */
export const finalizeDeposit = async ({
  userId,
  amount,
  refference,
  method,
  reason,
  receiptUrl,
  paymentMethod,
  stripeEventId,
}: {
  userId: number;
  amount: number;
  refference: string;
  method: string;
  reason: string;
  receiptUrl?: string;
  stripeEventId?: string;
  paymentMethod: PaymentMethodType;
}): Promise<{ success: boolean; refference: string; message: string }> => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new Error("User not found during deposit finalization");
    }

    const feeResult = await getTransactionFee({ amount, type: "DEPOSIT" });
    const fee = feeResult.success ? feeResult.amount || 0 : 0;
    const admins = await getAdmins();

    await prisma.$transaction(async (tx) => {
      // ✅ Mark event as processed INSIDE the transaction so it rolls back
      // atomically if anything below fails.
      console.log("Stripe Event ID from finalizeDeposit", stripeEventId);
      if (stripeEventId) {
        await tx.processedWebhookEvent.create({
          data: { stripeEventId },
        });
      }
      // 1. Credit user wallet
      await tx.wallet.create({
        data: {
          userId,
          amount,
          type: "CREDIT",
          reason,
          refference,
          paymentMethod: paymentMethod || "MOBILE_MONEY",
        },
      });

      // 2. Credit transaction fee to all admins
      if (fee > 0 && admins.length > 0) {
        await tx.wallet.createMany({
          data: admins.map((admin) => ({
            userId: admin.id,
            amount: fee,
            type: "CREDIT",
            reason: `Transaction fee from deposit: ${refference}`,
            refference,
          })),
        });

        // Send notification to admins
        await tx.systemNotification.createMany({
          data: admins.map((admin) => ({
            fromUserId: userId,
            toUserId: admin.id,
            title: "New Deposit Fee",
            message: `You received a transaction fee of UGX ${fee.toLocaleString()} from a deposit.`,
            type: "SUCCESS",
            path: `/dashboard/user/transactions?query=${refference}`,
          })),
        });
      }

      // 3. Create transaction record
      await tx.transaction.create({
        data: {
          userId,
          recipientId: userId,
          displayName: user.name || "System",
          amount,
          currency: "UGX",
          type: "DEPOSIT",
          status: "COMPLETED",
          category: "Deposit",
          method,
          txn_ref: refference,
          fee,
          reason,
          receiptUrl,
        },
      });

      // 4. System Notification for user
      await tx.systemNotification.create({
        data: {
          fromUserId: userId,
          toUserId: userId,
          title: "Deposit Successful",
          message: `Your deposit of UGX ${amount.toLocaleString()} has been processed successfully.`,
          type: "SUCCESS",
          path: `/dashboard/user/transactions?query=${refference}`,
        },
      });
    });

    // Send emails
    if (user.email) {
      await sendDepositEmail({
        email: user.email,
        userName: user.name || "User",
        amount,
        reference: refference,
        fee,
        receiptUrl,
        method,
      });
    }

    if (admins.length > 0) {
      await Promise.all(
        admins.map(async (admin) => {
          if (admin.email) {
            await sendAdminDepositNoticeEmail({
              email: admin.email,
              userName: user.name || "User",
              adminName: admin.name || "Admin",
              amount,
              reference: refference,
              fee,
              receiptUrl,
              method,
            });
          }
        }),
      );
    }

    revalidatePath("/dashboard/user/wallet");
    revalidatePath("/dashboard/user/transactions");

    return { success: true, refference, message: "Deposit Successful!" };
  } catch (error) {
    console.error("Error finalizing deposit:", error);
    throw error;
  }
};

/**
 * Process Mobile Money deposit for a user
 * @param userId - User ID
 * @param amount - Amount to deposit
 * @returns Success/error status
 */
export const processMobileMoneyDeposit = async ({
  amount,
  providedUser,
}: {
  amount: number;
  providedUser?: User;
}): Promise<{ success: boolean; refference?: string; message: string }> => {
  try {
    const user = providedUser || (await getUserSession());
    if (!user) {
      return { success: false, message: "Unauthorized" };
    }

    if (amount < 500) {
      return {
        success: false,
        message: "Minimum deposit amount is UGX 500",
      };
    }

    const refference = await generateTxRef();

    // In a real mobile money flow, you would call an API here
    // For now, we simulate success and finalize the deposit

    return await finalizeDeposit({
      userId: user.id,
      amount,
      refference,
      method: "Mobile Money",
      reason: "Mobile Money Deposit",
      paymentMethod: "MOBILE_MONEY",
    });
  } catch (error) {
    console.error("Error processing deposit:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Deposit failed",
    };
  }
};

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
    const isAdmin = sender?.privilege === "super_admin";
    const TRANSACTION_FEE = isAdmin ? 0 : fee.amount;
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
        senderEmail: sender?.email,
        senderName: sender?.name,
      };
    });

    if (result.success) {
      // Send background emails
      if (result.recipientEmail) {
        sendTransferEmail({
          email: result.recipientEmail,
          userName: result.recipientName || "User",
          amount: result.amount!,
          senderName: result.senderName || "Unknown",
          reference: result.refference!,
        });
      }

      // Notify sender
      if (result.senderEmail) {
        sendSenderTransferEmail({
          email: result.senderEmail,
          userName: result.senderName || "User",
          amount: result.amount!,
          recipientName: result.recipientName || "Unknown",
          reference: result.refference!,
          fee: TRANSACTION_FEE,
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

/**
 * Fetch transaction details by reference
 */
export const getTransactionByRef = async (ref: string) => {
  try {
    const session = await getUserSession();
    if (!session) throw new Error("Unauthorized");

    const transaction = await prisma.transaction.findUnique({
      where: { txn_ref: ref },
    });

    if (!transaction)
      return { success: false, message: "Transaction not found" };

    // Security check: Ensure the transaction belongs to the user
    if (
      transaction.userId !== session.id &&
      transaction.recipientId !== session.id
    ) {
      return { success: false, message: "Unauthorized access to transaction" };
    }

    return {
      success: true,
      transaction: {
        ...transaction,
        amount: transaction.amount.toNumber(),
        fee: transaction.fee.toNumber(),
        createdAt: transaction.createdAt.toISOString(),
        updatedAt: transaction.updatedAt.toISOString(),
        receiptUrl: transaction.receiptUrl!,
        displayName: transaction.displayName!,
        reason: transaction.reason!,
      },
    };
  } catch (error) {
    console.error("Error fetching transaction:", error);
    return { success: false, message: "Failed to fetch transaction" };
  }
};
