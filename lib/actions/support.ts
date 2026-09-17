"use server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { getUserSession } from "./session";
import {
  _processMobileMoneySupport,
  _processWalletSupportCore,
} from "@/lib/server/support-core";
import { yoAPI } from "@/lib/yo/client";
import { YoAPIError } from "@herberthtk/yo-payments-api";
import { parseTopupMsisdn, methodLabelFor } from "@/lib/yo/phone";
import {
  MAX_TOPUP,
  MAX_PENDING_DEPOSITS,
  RATE_LIMIT_WINDOW_MINUTES,
} from "@/lib/yo/constants";
import { getTransactionFee } from "./fee";
import { generateTxRef } from "@/utils";
import verifyNumber from "@/sdk/index";
import { finalizeYoFailure } from "./yo";

/**
 * Process Support via Wallet Balance (P2P Support) — public Server Action.
 * Authenticates the caller via session cookie, then delegates to the core.
 */
export const processWalletSupport = async ({
  senderId,
  recipientId,
  amount,
}: {
  senderId: number;
  recipientId: number;
  amount: number;
  method?: string;
}) => {
  const sender = await getUserSession();
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
  return _processWalletSupportCore({ sender, senderId, recipientId, amount });
};

const initiateSupportSchema = z.object({
  amount: z.coerce.number().int().min(500, "Minimum support amount is UGX 500").max(MAX_TOPUP),
  toUserId: z.coerce.number().positive("Valid recipient ID is required"),
  payerMsisdn: z.string().trim().min(7).max(16),
  recipientMsisdn: z.string().trim().optional(),
  narrative: z.string().trim().min(2).max(100).optional(),
});

/**
 * Initiate Mobile Money Support:
 * 1. Validates inputs and checks session.
 * 2. Verifies payer phone (and recipient phone if provided) via carrier SDK.
 * 3. Calculates fee and creates PENDING Transaction + ProcessedTransaction.
 * 4. Dispatches USSD prompt to payer's phone via Yo! Payments.
 */
export const initiateYoSupport = async (input: {
  amount: number;
  toUserId: number;
  payerMsisdn: string;
  recipientMsisdn?: string;
  narrative?: string;
}): Promise<
  | {
      success: true;
      externalRef: string;
      provider: "MTN" | "AIRTEL";
      fee: number;
      totalCharged: number;
    }
  | { success: false; message: string }
> => {
  try {
    const user = await getUserSession();
    if (!user) return { success: false, message: "Unauthorized" };

    const parsed = initiateSupportSchema.safeParse(input);
    if (!parsed.success) {
      return {
        success: false,
        message: parsed.error.issues[0]?.message ?? "Invalid input",
      };
    }

    const { amount, toUserId, payerMsisdn, recipientMsisdn, narrative } = parsed.data;

    if (user.id === toUserId) {
      return { success: false, message: "You cannot support yourself" };
    }

    const recipient = await prisma.user.findUnique({
      where: { id: toUserId },
      select: { id: true, name: true, tel: true },
    });
    if (!recipient) {
      return { success: false, message: "Recipient user not found" };
    }

    // 1. Verify Payer Phone (the mobile line that receives the USSD PIN prompt)
    const payerPhone = parseTopupMsisdn(payerMsisdn);
    if (!payerPhone.ok) return { success: false, message: `Payer phone: ${payerPhone.error}` };

    try {
      const payerVerification = await verifyNumber.verify(payerPhone.msisdn);
      if (payerVerification?.response !== "OK" || !payerVerification?.data) {
        return {
          success: false,
          message:
            payerVerification?.message ||
            "Payer phone number verification failed. Ensure the number is active on Mobile Money.",
        };
      }
    } catch (verErr: unknown) {
      console.error("SDK verification error for payer:", verErr);
      return {
        success: false,
        message: "Failed to verify payer phone number on mobile network.",
      };
    }

    // 2. Verify Recipient Phone if provided
    let normRecipientPhone: string | undefined = undefined;
    if (recipientMsisdn) {
      const recPhone = parseTopupMsisdn(recipientMsisdn);
      if (!recPhone.ok) return { success: false, message: `Recipient phone: ${recPhone.error}` };
      normRecipientPhone = recPhone.msisdn;
      try {
        const recVerification = await verifyNumber.verify(recPhone.msisdn);
        if (recVerification?.response !== "OK" || !recVerification?.data) {
          return {
            success: false,
            message:
              recVerification?.message ||
              "Recipient phone number is not registered on Mobile Money.",
          };
        }
      } catch (verErr: unknown) {
        console.error("SDK verification error for recipient:", verErr);
        return {
          success: false,
          message: "Failed to verify recipient phone number on mobile network.",
        };
      }
    }

    // 3. Fee calculation
    const feeResult = await getTransactionFee({
      amount,
      type: "SUPPORT",
    });
    if (!feeResult.success) {
      return {
        success: false,
        message: feeResult.message || "Fee calculation failed",
      };
    }
    const fee = user.privilege === "super_admin" ? 0 : (feeResult.amount || 0);
    const totalCharged = amount + fee;

    // 4. Rate-limiting check
    const windowStart = new Date(Date.now() - RATE_LIMIT_WINDOW_MINUTES * 60_000);
    const pendingCount = await prisma.transaction.count({
      where: {
        userId: user.id,
        type: "SUPPORT",
        status: { in: ["PENDING", "INDETERMINATE"] },
        createdAt: { gt: windowStart },
      },
    });
    if (pendingCount >= MAX_PENDING_DEPOSITS) {
      return {
        success: false,
        message: "Too many pending support transactions. Please wait for them to complete.",
      };
    }

    const method = methodLabelFor(payerPhone.provider);
    const externalRef = await generateTxRef(14);
    const txnReason =
      narrative ||
      `Supported ${recipient.name || "User"}${normRecipientPhone ? ` (${normRecipientPhone})` : ""} via Mobile Money`;

    try {
      await prisma.$transaction([
        prisma.transaction.create({
          data: {
            userId: user.id,
            recipientId: toUserId,
            displayName: user.name || "User",
            amount,
            currency: "UGX",
            type: "SUPPORT",
            status: "PENDING",
            category: "Support",
            method,
            txn_ref: externalRef,
            externalReference: externalRef,
            msisdn: payerPhone.msisdn,
            provider: payerPhone.provider,
            fee,
            reason: txnReason,
          },
        }),
        prisma.processedTransaction.create({
          data: { externalReference: externalRef },
        }),
      ]);
    } catch (error) {
      console.error("yo support initiate persist failed", { error });
      return {
        success: false,
        message: "Could not start support transaction. Please try again.",
      };
    }

    try {
      yoAPI.setExternalReference(externalRef);
      const res = await yoAPI.acDepositFunds(
        payerPhone.msisdn,
        totalCharged,
        `Support for ${recipient.name || "User"}`,
      );
      console.log("yo initiate support res", res);
      if (res.Status === "OK") {
        if (res.TransactionReference) {
          await prisma.$transaction([
            prisma.transaction.updateMany({
              where: { externalReference: externalRef, status: "PENDING" },
              data: { providerRef: res.TransactionReference },
            }),
            prisma.processedTransaction.updateMany({
              where: { externalReference: externalRef, processed: false },
              data: { transactionReference: res.TransactionReference },
            }),
          ]);
        }
        return {
          success: true,
          externalRef,
          provider: payerPhone.provider,
          fee,
          totalCharged,
        };
      }
      await finalizeYoFailure(externalRef);
      return {
        success: false,
        message: res.ErrorMessage || "Support deposit rejected. Please try again.",
      };
    } catch (error) {
      if (error instanceof YoAPIError) {
        console.error("yo support transport error", {
          externalRef,
          message: error.message,
        });
        return {
          success: true,
          externalRef,
          provider: payerPhone.provider,
          fee,
          totalCharged,
        };
      }
      throw error;
    }
  } catch (error) {
    console.error("Error initiating Yo support:", error);
    return { success: false, message: "Could not start support payment" };
  }
};

/**
 * Process Mobile Money Support — public Server Action.
 */
export const processMobileMoneySupport = async ({
  amount,
  toUserId,
}: {
  amount: number;
  toUserId: number;
}): Promise<{ success: boolean; refference?: string; message: string }> => {
  try {
    const user = await getUserSession();
    if (!user) return { success: false, message: "Unauthorized" };
    return _processMobileMoneySupport(user, amount, toUserId);
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
