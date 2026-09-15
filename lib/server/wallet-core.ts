import "server-only";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { generateTxRef } from "@/utils";
import { getCachedAdmins } from "@/lib/admin/cached-admins";
import { getTransactionFee } from "@/lib/actions/fee";
import { creditDepositFee } from "@/lib/actions/deposit-fee";
import {
  sendAdminTransferEmail,
  sendDepositEmail,
  sendAdminDepositNoticeEmail,
  sendSenderTransferEmail,
  sendTransferEmail,
} from "@/lib/actions/email";
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
    const admins = await getCachedAdmins();

    await prisma.$transaction(async (tx) => {
      // ✅ Mark event as processed INSIDE the transaction so it rolls back
      // atomically if anything below fails.
      // console.log("Stripe Event ID from finalizeDeposit", stripeEventId);
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

      // 2. Credit transaction fee to all admins (shared helper)
      await creditDepositFee(tx, {
        fromUserId: userId,
        externalRef: refference,
        fee,
        admins,
      });

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
 * Core logic — accepts a pre-authenticated user.
 * Used by the Server Action and the v1 API route.
 * @internal
 */
export const _processMobileMoneyDepositCore = async (
  user: User,
  amount: number,
): Promise<{ success: boolean; refference?: string; message: string }> => {
  if (amount < 500) {
    return { success: false, message: "Minimum deposit amount is UGX 500" };
  }
  const refference = await generateTxRef();
  return finalizeDeposit({
    userId: user.id,
    amount,
    refference,
    method: "Mobile Money",
    reason: "Mobile Money Deposit",
    paymentMethod: "MOBILE_MONEY",
  });
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
 * Process P2P transfer between two wallets
 * @param senderId - User ID of sender
 * @param recipientId - User ID of recipient
 * @param amount - Amount to transfer
 * @returns Success/error status with updated balances
 */
/**
 * Core P2P transfer logic — accepts a pre-authenticated sender.
 * @internal
 */
export const _processP2PTransferCore = async (
  sender: User,
  recipientId: number,
  amount: number,
) => {
  try {
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
    const senderId = sender.id;
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

    const admins = await getCachedAdmins(); // pre-fetch
    // Generate transaction reference
    const refference = await generateTxRef();
    const senderBalance = (await getWalletBalance(senderId)).balance;
    // calculate fee based on type
    const isAdmin = sender?.privilege === "super_admin";
    const TRANSACTION_FEE = isAdmin ? 0 : fee.amount;
    // Outer fast-fail pre-check on a possibly-stale read (fast UX failure
    // without opening a DB transaction). The authoritative check re-reads
    // the balance inside the interactive transaction below.
    if (senderBalance < amount + TRANSACTION_FEE) {
      return {
        success: false,
        message: `Insufficient balance. Available UGX ${senderBalance.toLocaleString()}, Required UGX ${(amount + TRANSACTION_FEE).toLocaleString()}`,
        amount: 0,
        currency: "UGX",
        refference: "",
        fee: 0,
      };
    }
    // Use Prisma transaction to ensure atomicity
    const result = await prisma.$transaction(async (tx) => {
      const totalDeduction = amount + TRANSACTION_FEE;

      // Advisory lock on the sender's wallet — serializes concurrent transfers
      // from the same user to prevent double-spend race conditions.
      await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext('wallet_debit'), ${senderId})`;

      // Fresh balance re-read inside the transaction immediately after acquiring
      // the lock. The advisory lock ensures only one transfer per sender
      // executes this block at a time.
      const freshRows = await tx.$queryRaw<{ balance: number }[]>`
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
        WHERE "userId" = ${senderId};
      `;
      const freshBalance = Number(freshRows[0]?.balance ?? 0);

      // Check sufficient balance
      if (freshBalance < totalDeduction) {
        throw new Error(
          `Insufficient balance. Available UGX ${freshBalance.toLocaleString()}, Required UGX ${totalDeduction.toLocaleString()}`,
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
/**
 * Core logic — accepts a pre-authenticated user.
 * @internal
 */
export const _getTransactionByRefCore = async (
  user: User,
  reference: string,
) => {
  try {
    const transaction =
      (await prisma.transaction.findUnique({
        where: { txn_ref: reference },
      })) ??
      (await prisma.transaction.findUnique({
        where: { externalReference: reference },
      }));

    if (!transaction)
      return { success: false as const, message: "Transaction not found" };

    // Security check: owner (sender/recipient) or super_admin
    const isOwner =
      transaction.userId === user.id || transaction.recipientId === user.id;
    const isSuperAdmin = user.privilege === "super_admin";
    if (!isOwner && !isSuperAdmin) {
      return {
        success: false as const,
        message: "Unauthorized access to transaction",
      };
    }

    return {
      success: true as const,
      transaction: {
        ...transaction,
        amount: transaction.amount.toNumber(),
        fee: transaction.fee.toNumber(),
        createdAt: transaction.createdAt.toISOString(),
        updatedAt: transaction.updatedAt.toISOString(),
        receiptUrl: transaction.receiptUrl ?? undefined,
        displayName: transaction.displayName ?? "",
        reason: transaction.reason ?? undefined,
      },
    };
  } catch (error) {
    console.error("Error fetching transaction:", error);
    return { success: false as const, message: "Failed to fetch transaction" };
  }
};
