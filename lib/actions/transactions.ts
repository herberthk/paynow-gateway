"use server";

import prisma from "@/lib/prisma";
import type { Prisma } from "@/lib/generated/prisma/client";
import { getTransactionFee } from "./fee";
import { getUserSession } from "./session";

export const getTransactions = async ({
  page = 1,
  limit = 10,
  query = "",
  status,
  type,
  providedUser,
}: {
  page?: number;
  limit?: number;
  query?: string;
  status?: string;
  type?: string;
  providedUser?: User;
}): Promise<{
  transactions: Transaction[];
  totalPages: number;
  currentPage: number;
  totalTransactions: number;
}> => {
  try {
    const user = providedUser || (await getUserSession());
    if (!user) {
      return {
        transactions: [],
        totalPages: 0,
        currentPage: 1,
        totalTransactions: 0,
      };
    }
    const isAdmin = user.privilege === "super_admin";
    const skip = (page - 1) * limit;
    // if user is admin, fetch all transactions, else fetch only user's transactions
    let where: Prisma.TransactionWhereInput = isAdmin
      ? {}
      : {
          OR: [{ userId: user.id }, { recipientId: user.id }],
        };

    if (query?.startsWith("TX_")) {
      // Resolve by txn_ref first, then fall back to externalReference
      // (consistent with wallet.ts getTransactionByRef).
      const tx =
        (await prisma.transaction.findUnique({
          where: { txn_ref: query },
        })) ??
        (await prisma.transaction.findUnique({
          where: { externalReference: query },
        }));

      const isOwner =
        !!tx && (tx.userId === user.id || tx.recipientId === user.id);
      if (!tx || (!isOwner && !isAdmin)) {
        return {
          transactions: [],
          totalPages: 0,
          currentPage: 1,
          totalTransactions: 0,
        };
      }

      return {
        transactions: [
          {
            ...tx,
            amount: tx.amount.toNumber(),
            createdAt: tx.createdAt.toISOString(),
            updatedAt: tx.updatedAt.toISOString(),
            currency: tx.currency as Currency,
            txn_ref: tx.txn_ref ?? undefined,
            fee: tx.fee.toNumber(),
            displayName: tx.displayName ?? "",
            reason: tx.reason ?? undefined,
            receiptUrl: tx.receiptUrl ?? undefined,
          },
        ],
        totalPages: 1,
        currentPage: 1,
        totalTransactions: 1,
      };
    }
    if (query) {
      const search: Prisma.TransactionWhereInput = {
        OR: [
          { displayName: { contains: query, mode: "insensitive" } },
          { method: { contains: query, mode: "insensitive" } },
          { category: { contains: query, mode: "insensitive" } },
        ],
      };
      if (isAdmin) {
        where = search;
      } else {
        where = {
          AND: [
            { OR: [{ userId: user.id }, { recipientId: user.id }] },
            search,
          ],
        };
      }
    }

    const VALID_STATUSES = [
      "COMPLETED",
      "PENDING",
      "FAILED",
      "INDETERMINATE",
      "DISPUTED",
    ] as const;
    if (
      status &&
      status !== "ALL" &&
      (VALID_STATUSES as readonly string[]).includes(status)
    ) {
      where.status =
        status as Prisma.TransactionWhereInput["status"];
    }

    const VALID_TYPES = [
      "DEPOSIT",
      "WITHDRAWAL",
      "TRANSFER",
      "PAYMENT",
      "SUBSCRIPTION",
      "SUPPORT",
    ] as const;
    if (
      type &&
      type !== "ALL" &&
      (VALID_TYPES as readonly string[]).includes(type)
    ) {
      where.type = type as Prisma.TransactionWhereInput["type"];
    }

    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where,
        include: {
          sender: { select: { name: true } },
          recipient: { select: { name: true } },
        },
        skip,
        take: limit,
        orderBy: {
          createdAt: "desc",
        },
      }),
      prisma.transaction.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    // Serialize for client component
    const serializedTransactions: Transaction[] = transactions.map((tx) => {
      const isSender = tx.userId === user.id;
      const isRecipient = tx.recipientId === user.id;
      const isSelf = tx.userId === tx.recipientId;
      const isAdmin = user.privilege === "super_admin";

      let resolvedDisplayName = tx.displayName || "Unknown";
      const senderName = tx.sender?.name || `User #${tx.userId}`;
      const recipientName = tx.recipient?.name || `User #${tx.recipientId}`;

      if (tx.type === "TRANSFER" || tx.type === "SUPPORT") {
        if (isAdmin) {
          resolvedDisplayName = `${senderName} -> ${recipientName}`;
        } else if (isSender && !isSelf) {
          resolvedDisplayName = recipientName;
        } else if (isRecipient && !isSelf) {
          resolvedDisplayName = senderName;
        }
      }

      return {
        ...tx,
        amount: tx.amount.toNumber(),
        createdAt: tx.createdAt.toISOString(),
        updatedAt: tx.updatedAt.toISOString(),
        // Ensure type alignment
        type: tx.type as TransactionType,
        status: tx.status as TransactionStatus,
        currency: tx.currency as Currency,
        txn_ref: tx.txn_ref ?? undefined,
        fee: tx.fee.toNumber(),
        displayName: resolvedDisplayName,
        reason: tx.reason ?? undefined,
        receiptUrl: tx.receiptUrl ?? undefined,
        ...(isAdmin ? { senderName, recipientName } : {}),
      };
    });

    return {
      transactions: serializedTransactions,
      totalPages,
      currentPage: page,
      totalTransactions: total,
    };
  } catch (error) {
    console.error("Error fetching transactions:", error);
    return {
      transactions: [],
      totalPages: 0,
      currentPage: 1,
      totalTransactions: 0,
    };
  }
};

/**
 * Create a P2P transaction record
 * @param senderId - User ID of sender
 * @param recipientId - User ID of recipient
 * @param recipientName - Name of recipient
 * @param amount - Transfer amount
 * @param currency - Currency (default UGX)
 * @returns Created transaction
 */
export const createP2PTransaction = async ({
  senderId,
  recipientId,
  displayName,
  amount,
  currency = "UGX",
  txn_ref,
}: {
  senderId: number;
  recipientId: number;
  displayName: string;
  amount: number;
  currency?: "UGX" | "USD";
  txn_ref: string;
}) => {
  try {
    const user = await getUserSession();
    if (!user) {
      return {
        success: false,
        message: "User not found",
        transaction: null,
      };
    }
    const fee = await getTransactionFee({ amount, type: "TRANSFER" });
    if (!fee.success) {
      return {
        success: false,
        message: fee.message,
        transaction: null,
      };
    }
    const transaction = await prisma.transaction.create({
      data: {
        userId: senderId,
        recipientId,
        displayName,
        amount,
        currency,
        type: "TRANSFER",
        status: "COMPLETED",
        category: "Transfer",
        method: "Wallet P2P Transfer",
        txn_ref,
        fee: fee.amount,
      },
    });

    // Create Ledger Entries
    // await createLedgerEntry({
    //   transactionId: transaction.id,
    //   senderId,
    //   recipientId,
    //   amount,
    //   type: "TRANSFER",
    //   description: `Sent to ${recipientName} #${recipientId}`,
    //   senderAccount: "Wallet",
    //   recipientAccount: "Wallet",
    //   recipientName,
    // });

    return {
      success: true,
      message: "Transaction recorded successfully",
      transaction: {
        id: transaction.id,
        txn_ref: transaction.txn_ref,
        amount: transaction.amount.toNumber(),
        createdAt: transaction.createdAt.toISOString(),
        currency: transaction.currency,
        fee: transaction.fee.toNumber(),
      },
    };
  } catch (error) {
    console.error("Error creating P2P transaction:", error);
    return {
      success: false,
      message: "Failed to record transaction",
      transaction: null,
    };
  }
};

export const updateTransaction = async (
  id: string,
  transaction: Transaction,
): Promise<{ success: boolean; message?: string; transaction?: unknown }> => {
  const admin = await getUserSession();
  if (!admin || admin.privilege !== "super_admin") {
    return { success: false, message: "Unauthorized" };
  }

  // Strip client-only/display fields. "DISPUTED" is display-only
  // (TransactionTable) with no Prisma counterpart — refuse it loudly.
  // Thrown OUTSIDE the try so it isn't swallowed by the catch below.
  if (transaction.status === "DISPUTED") {
    throw new Error("DISPUTED is display-only and cannot be persisted");
  }
  // receiptUrl must be https-only when non-empty — also thrown OUTSIDE the
  // try so a bad URL isn't swallowed into a generic failure.
  if (
    transaction.receiptUrl !== undefined &&
    transaction.receiptUrl !== "" &&
    !transaction.receiptUrl.startsWith("https://")
  ) {
    throw new Error("receiptUrl must be an https:// URL");
  }

  // Terminal credits must only come from settlement paths — block direct
  // transitions TO COMPLETED via this generic admin edit path.
  if (transaction.status === "COMPLETED") {
    return {
      success: false,
      message: "Cannot mark COMPLETED directly — use settlement flow",
    };
  }
  // Cap free-text/display field lengths (reject like DISPUTED, outside try).
  // receiptUrl allows 2048 chars (signed URLs exceed 120); all others 120.
  const CAPPED_FIELDS = [
    "method",
    "category",
    "reason",
    "displayName",
    "networkRef",
  ] as const;
  for (const field of CAPPED_FIELDS) {
    const value = transaction[field];
    if (typeof value === "string" && value.length > 120) {
      throw new Error(`${field} must be at most 120 characters`);
    }
  }
  if (
    typeof transaction.receiptUrl === "string" &&
    transaction.receiptUrl.length > 2048
  ) {
    throw new Error("receiptUrl must be at most 2048 characters");
  }

  try {
    // Immutable once COMPLETED: read the CURRENT row first. FAILED rows may
    // still be edited (e.g. manual reconcile notes).
    const current = await prisma.transaction.findUnique({
      where: { id },
      select: { status: true },
    });
    if (current?.status === "COMPLETED") {
      return {
        success: false,
        message: "Completed transactions are immutable",
      };
    }
    // Allowlist writable fields only. Never allow amount/fee/userId/
    // recipientId/txn_ref/externalReference/providerRef/msisdn/provider/
    // type/currency. COMPLETED is intentionally excluded (see guard above).
    const data: Prisma.TransactionUpdateInput = {};
    const ALLOWED_STATUSES = ["PENDING", "FAILED", "INDETERMINATE"] as const;
    if (
      transaction.status &&
      (ALLOWED_STATUSES as readonly string[]).includes(transaction.status)
    ) {
      data.status =
        transaction.status as Prisma.TransactionUpdateInput["status"];
    }
    if (transaction.category !== undefined) {
      data.category = transaction.category;
    }
    if (transaction.method !== undefined) {
      data.method = transaction.method;
    }
    if (transaction.reason !== undefined) {
      data.reason = transaction.reason;
    }
    if (transaction.displayName !== undefined) {
      data.displayName = transaction.displayName;
    }
    if (transaction.networkRef !== undefined) {
      data.networkRef = transaction.networkRef;
    }
    if (transaction.receiptUrl !== undefined) {
      data.receiptUrl = transaction.receiptUrl;
    }
    const updatedTransaction = await prisma.transaction.update({
      where: { id },
      data,
    });
    // Best-effort audit trail — must never fail the update.
    try {
      await prisma.auditLog.create({
        data: {
          action: "transaction.update",
          adminId: admin.id,
          details: `Updated transaction ${id}`,
        },
      });
    } catch (auditError) {
      console.warn("Audit log write failed:", auditError);
    }
    return { success: true, transaction: updatedTransaction };
  } catch (error) {
    console.error("Error updating transaction:", error);
    return { success: false, message: "Failed to update transaction" };
  }
};

export const getTransactionByReference = async (txn_ref: string, providedUser?: User) => {
  try {
    const user = providedUser || (await getUserSession());
    if (!user) return { error: "User not authenticated" };

    const transaction = await prisma.transaction.findUnique({
      where: { txn_ref: txn_ref },
    });

    if (!transaction)
      return { error: `Transaction with reference ${txn_ref} not found.` };

    // Security check: Ensure the user is either the sender, recipient, or admin
    const isOwner =
      transaction.userId === user.id || transaction.recipientId === user.id;
    const isAdmin = user.privilege === "super_admin";

    if (!isOwner && !isAdmin) {
      return { error: "Not authorized to access this information" };
    }

    return {
      ...transaction,
      amount: transaction.amount.toNumber(),
      fee: transaction.fee.toNumber(),
      createdAt: transaction.createdAt.toISOString(),
    };
  } catch (error) {
    console.error("Error fetching transaction by reference:", error);
    return { error: "An error occurred while fetching the transaction." };
  }
};
