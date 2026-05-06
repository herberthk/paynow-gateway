"use server";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getUserSession } from "./session";
import { generateTxRef } from "@/utils";
import { getAdmins } from "./admin";
import { getTransactionFee } from "./fee";
import {
  sendSupportEmail,
  sendSupportReceiptEmail,
  sendAdminTransferEmail,
} from "./email";
import { getWalletBalance } from "./wallet";

/**
 * Core logic to finalize a support deposit in the database
 * Used by Stripe and Mobile Money for support.
 */
export const finalizeSupportDeposit = async ({
  userId,
  toUserId,
  amount,
  refference,
  method,
  reason,
  receiptUrl,
  paymentMethod,
  stripeEventId,
}: {
  userId: number; // The person giving support
  toUserId: number; // The person receiving support
  amount: number;
  refference: string;
  method: string;
  reason: string;
  receiptUrl?: string;
  stripeEventId?: string;
  paymentMethod: PaymentMethodType;
}): Promise<{ success: boolean; refference: string; message: string }> => {
  try {
    const sender = await prisma.user.findUnique({ where: { id: userId } });
    const recipient = await prisma.user.findUnique({ where: { id: toUserId } });

    if (!sender || !recipient) {
      throw new Error(
        "Sender or Recipient not found during support finalization",
      );
    }

    const feeResult = await getTransactionFee({ amount, type: "SUPPORT" });
    const fee = feeResult.success ? feeResult.amount || 0 : 0;
    const admins = await getAdmins();
    const isAdmin = sender.privilege === "super_admin";
    const TRANSACTION_FEE = isAdmin ? 0 : fee;

    const totalRecipientAmount = amount; // In deposits, amount is what recipient gets. Wait, if it's external, sender paid amount + fee already.

    await prisma.$transaction(async (tx) => {
      // 1. Mark event as processed INSIDE the transaction
      if (stripeEventId) {
        await tx.processedWebhookEvent.create({
          data: { stripeEventId },
        });
      }

      // 2. Credit recipient wallet
      await tx.wallet.create({
        data: {
          userId: toUserId,
          amount: totalRecipientAmount,
          type: "CREDIT",
          reason: reason || `Received support from ${sender.name || "Unknown"}`,
          refference,
          paymentMethod: paymentMethod || "MOBILE_MONEY",
        },
      });

      // 3. Create SupportUser record
      await tx.supportUser.create({
        data: {
          fromUserId: userId,
          toUserId: toUserId,
          reference: refference,
          amount: totalRecipientAmount,
          currency: "UGX",
          paymentMethod: paymentMethod || "MOBILE_MONEY",
          reason,
        },
      });

      // 4. Credit transaction fee to admins
      if (TRANSACTION_FEE > 0 && admins.length > 0) {
        await tx.wallet.createMany({
          data: admins.map((admin) => ({
            userId: admin.id,
            amount: TRANSACTION_FEE,
            type: "CREDIT",
            reason: `Transaction fee from support: ${refference}`,
            refference,
          })),
        });

        await tx.systemNotification.createMany({
          data: admins.map((admin) => ({
            fromUserId: userId,
            toUserId: admin.id,
            title: "New Support Fee",
            message: `You received a fee of UGX ${TRANSACTION_FEE.toLocaleString()} from a support transaction.`,
            type: "SUCCESS",
            path: `/dashboard/user/transactions?query=${refference}`,
          })),
        });
      }

      // 5. Create transaction record for both
      await tx.transaction.create({
        data: {
          userId: userId,
          recipientId: toUserId,
          displayName: sender.name || "System",
          amount: totalRecipientAmount,
          currency: "UGX",
          type: "SUPPORT",
          status: "COMPLETED",
          category: "Support",
          method,
          txn_ref: refference,
          fee: TRANSACTION_FEE,
          reason: reason || `Supported ${recipient.name || "Unknown"}`,
          receiptUrl,
        },
      });

      // 6. System Notifications
      await tx.systemNotification.createMany({
        data: [
          {
            fromUserId: userId,
            toUserId: userId,
            title: "Support Successful",
            message: `You successfully supported ${recipient.name} with UGX ${totalRecipientAmount.toLocaleString()}.`,
            type: "SUCCESS",
            path: `/dashboard/user/transactions?query=${refference}`,
          },
          {
            fromUserId: userId,
            toUserId: toUserId,
            title: "Support Received",
            message: `You received UGX ${totalRecipientAmount.toLocaleString()} in support from ${sender.name}.`,
            type: "SUCCESS",
            path: `/dashboard/user/transactions?query=${refference}`,
          },
        ],
      });
    });

    // Send emails
    if (recipient.email) {
      await sendSupportEmail({
        email: recipient.email,
        userName: recipient.name || "User",
        senderName: sender.name || "Someone",
        amount: totalRecipientAmount,
        reference: refference,
      });
    }

    if (sender.email) {
      await sendSupportReceiptEmail({
        email: sender.email,
        userName: sender.name || "User",
        recipientName: recipient.name || "Someone",
        amount: totalRecipientAmount,
        reference: refference,
        fee: TRANSACTION_FEE,
        method,
      });
    }

    revalidatePath("/dashboard/user/wallet");
    revalidatePath("/dashboard/user/transactions");

    return { success: true, refference, message: "Support Successful!" };
  } catch (error) {
    console.error("Error finalizing support:", error);
    throw error;
  }
};

/**
 * Process Support via Wallet Balance (P2P Support)
 */
export const processWalletSupport = async ({
  senderId,
  recipientId,
  amount,
  providedUser,
}: {
  senderId: number;
  recipientId: number;
  amount: number;
  method?: string;
  providedUser?: User;
}) => {
  try {
    const sender = providedUser || (await getUserSession());
    if (!sender || sender.id !== senderId) {
      return {
        success: false,
        message: "Unauthorized",
        amount: 0,
        currency: "UGX",
        refference: "",
        fee: 0,
      };
    }

    if (amount <= 1000) {
      return {
        success: false,
        message: "Support amount must be greater than 1000",
        amount: 0,
        currency: "UGX",
        refference: "",
        fee: 0,
      };
    }

    if (senderId === recipientId) {
      return {
        success: false,
        message: "You cannot support yourself",
        amount: 0,
        currency: "UGX",
        refference: "",
        fee: 0,
      };
    }

    const feeResult = await getTransactionFee({ amount, type: "SUPPORT" });
    if (!feeResult.success || !feeResult.amount) {
      return {
        success: false,
        message: feeResult.message,
        amount: 0,
        currency: "UGX",
        refference: "",
        fee: 0,
      };
    }

    const admins = await getAdmins();
    const refference = await generateTxRef();

    // Get sender balance
    const senderBalance = (await getWalletBalance(senderId)).balance ?? 0;
    const isAdmin = sender.privilege === "super_admin";
    const TRANSACTION_FEE = isAdmin ? 0 : feeResult.amount;
    const totalDeduction = amount + TRANSACTION_FEE;

    const result = await prisma.$transaction(async (tx) => {
      if (senderBalance < totalDeduction) {
        throw new Error(
          `Insufficient balance. Available UGX ${senderBalance.toLocaleString()}, Required UGX ${totalDeduction.toLocaleString()}`,
        );
      }

      const recipient = await tx.user.findUnique({
        where: { id: recipientId },
        select: { name: true, email: true },
      });

      // Debit sender
      await tx.wallet.create({
        data: {
          userId: senderId,
          amount: totalDeduction,
          type: "DEBIT",
          reason: `Supported ${recipient?.name || "Unknown"} with UGX ${amount.toLocaleString()}`,
          refference,
        },
      });

      // Credit recipient
      await tx.wallet.create({
        data: {
          userId: recipientId,
          amount,
          type: "CREDIT",
          reason: `Received support of UGX ${amount.toLocaleString()} from ${sender?.name || "Unknown"}`,
          refference,
        },
      });

      console.log({ senderId, recipientId, amount, name: recipient?.name });
      // Create SupportUser record
      await tx.supportUser.create({
        data: {
          fromUserId: senderId,
          toUserId: recipientId,
          reference: refference,
          amount,
          currency: "UGX",
          paymentMethod: "MOBILE_MONEY", // Defaulting internal wallet transfer to MOBILE_MONEY or we could add WALLET to enum
          reason: `Supported ${recipient?.name || "Unknown"}`,
        },
      });

      // Create transaction record
      await tx.transaction.create({
        data: {
          userId: senderId,
          recipientId,
          displayName: sender?.name || "Unknown",
          amount,
          currency: "UGX",
          type: "SUPPORT",
          status: "COMPLETED",
          category: "Support",
          method: "Wallet Balance",
          txn_ref: refference,
          fee: TRANSACTION_FEE,
          reason: `Supported ${recipient?.name || "Unknown"}`,
        },
      });

      // Fee handling
      if (TRANSACTION_FEE > 0 && admins.length > 0) {
        await tx.wallet.createMany({
          data: admins.map((admin) => ({
            userId: admin.id,
            amount: TRANSACTION_FEE,
            type: "CREDIT",
            reason: `Transaction fee for support to ${recipient?.name || "Unknown"}`,
            refference,
          })),
        });

        await tx.systemNotification.createMany({
          data: admins.map((admin) => ({
            fromUserId: senderId,
            toUserId: admin.id,
            title: "Support Transaction Fee",
            message: `You received UGX ${TRANSACTION_FEE.toLocaleString()} from a support transaction.`,
            type: "SUCCESS",
            path: `/dashboard/user/transactions?query=${refference}`,
          })),
        });
      }

      await tx.systemNotification.createMany({
        data: [
          {
            fromUserId: senderId,
            toUserId: senderId,
            title: "Support Sent",
            message: `You supported ${recipient?.name ?? "Unknown"} with UGX ${amount.toLocaleString()}`,
            type: "SUCCESS",
            path: `/dashboard/user/transactions?query=${refference}`,
          },
          {
            fromUserId: senderId,
            toUserId: recipientId,
            title: "Support Received",
            message: `You received support of UGX ${amount.toLocaleString()} from ${sender.name ?? "Unknown"}`,
            type: "SUCCESS",
            path: `/dashboard/user/transactions?query=${refference}`,
          },
        ],
      });

      return {
        success: true,
        message: "Support completed successfully",
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
      if (result.recipientEmail) {
        sendSupportEmail({
          email: result.recipientEmail,
          userName: result.recipientName || "User",
          amount: result.amount!,
          senderName: result.senderName || "Unknown",
          reference: result.refference!,
        });
      }

      if (result.senderEmail) {
        sendSupportReceiptEmail({
          email: result.senderEmail,
          userName: result.senderName || "User",
          amount: result.amount!,
          recipientName: result.recipientName || "Unknown",
          reference: result.refference!,
          fee: TRANSACTION_FEE,
          method: "Wallet Balance",
        });
      }

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
  } catch (error) {
    console.error("Error processing Wallet Support:", error);
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Failed to process support",
    };
  }
};

/**
 * Process Mobile Money Support
 */
export const processMobileMoneySupport = async ({
  amount,
  providedUser,
  toUserId,
}: {
  amount: number;
  providedUser?: User;
  toUserId: number;
}): Promise<{ success: boolean; refference?: string; message: string }> => {
  try {
    const user = providedUser || (await getUserSession());
    if (!user) {
      return { success: false, message: "Unauthorized" };
    }

    if (amount < 500) {
      return { success: false, message: "Minimum support amount is UGX 500" };
    }

    const refference = await generateTxRef();

    return await finalizeSupportDeposit({
      userId: user.id,
      toUserId,
      amount,
      refference,
      method: "Mobile Money",
      reason: "Mobile Money Support",
      paymentMethod: "MOBILE_MONEY",
    });
  } catch (error) {
    console.error("Error processing mobile money support:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Support failed",
    };
  }
};

/**
 * Fetch support history for a user (sent and received)
 */
export const getSupportHistory = async ({
  userId,
  page = 1,
  pageSize = 10,
}: {
  userId: number;
  page?: number;
  pageSize?: number;
}) => {
  try {
    const skip = (page - 1) * pageSize;

    const [supportTransactions, totalCount] = await Promise.all([
      prisma.supportUser.findMany({
        where: {
          OR: [{ fromUserId: userId }, { toUserId: userId }],
        },
        orderBy: {
          createdAt: "desc",
        },
        skip,
        take: pageSize,
      }),
      prisma.supportUser.count({
        where: {
          OR: [{ fromUserId: userId }, { toUserId: userId }],
        },
      }),
    ]);

    // Get unique user IDs to fetch names
    const userIds = Array.from(
      new Set(
        supportTransactions.flatMap((tx) => [tx.fromUserId, tx.toUserId]),
      ),
    );

    const users = await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, name: true, email: true },
    });

    const userMap = new Map(users.map((u) => [u.id, u]));

    const enhancedRecords = supportTransactions.map((record) => {
      const sender = userMap.get(record.fromUserId);
      const recipient = userMap.get(record.toUserId);

      return {
        ...record,
        amount: Number(record.amount), // Decimal to number
        senderName: sender?.name || "Unknown",
        senderEmail: sender?.email,
        recipientName: recipient?.name || "Unknown",
        recipientEmail: recipient?.email,
        type: record.fromUserId === userId ? "SENT" : "RECEIVED",
      };
    });

    return {
      success: true,
      data: enhancedRecords,
      pagination: {
        total: totalCount,
        page,
        pageSize,
        totalPages: Math.ceil(totalCount / pageSize),
      },
    };
  } catch (error) {
    console.error("Error fetching support history:", error);
    return {
      success: false,
      message: "Failed to fetch support history",
      data: [],
      pagination: { total: 0, page: 1, pageSize: 10, totalPages: 0 },
    };
  }
};
