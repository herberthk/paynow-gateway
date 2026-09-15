import "server-only";

import prisma from "@/lib/prisma";
import type { Prisma } from "@/lib/generated/prisma/client";

const MAX_TRANSACTION_PAGE_SIZE = 100;

/**
 * Core transaction query logic. Server-only — not a Server Action.
 * Used by the exported `getTransactions` Server Action (session-authenticated)
 * and by the v1 API route (which authenticates via its own mechanism and
 * passes a trusted user object).
 */
export const fetchTransactionsForUser = async (
  user: User,
  {
    page = 1,
    limit = 10,
    query = "",
    status,
    type,
  }: {
    page?: number;
    limit?: number;
    query?: string;
    status?: string;
    type?: string;
  },
): Promise<{
  transactions: Transaction[];
  totalPages: number;
  currentPage: number;
  totalTransactions: number;
}> => {
  const validatedPage = Number.isSafeInteger(page) && page > 0 ? page : 1;
  const validatedLimit =
    Number.isSafeInteger(limit) && limit > 0
      ? Math.min(limit, MAX_TRANSACTION_PAGE_SIZE)
      : 10;
  const isAdmin = user.privilege === "super_admin";
  const skip = (validatedPage - 1) * validatedLimit;
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
    "INDETERMINATE"
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
      take: validatedLimit,
      orderBy: {
        createdAt: "desc",
      },
    }),
    prisma.transaction.count({ where }),
  ]);

  const totalPages = Math.ceil(total / validatedLimit);

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
    currentPage: validatedPage,
    totalTransactions: total,
  };
};

/** Fetch a transaction for a trusted, pre-authenticated user. */
export const getTransactionByReferenceForUser = async (
  user: User,
  txn_ref: string,
) => {
  try {
    const transaction = await prisma.transaction.findUnique({
      where: { txn_ref },
    });

    if (!transaction) {
      return { error: `Transaction with reference ${txn_ref} not found.` };
    }

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
