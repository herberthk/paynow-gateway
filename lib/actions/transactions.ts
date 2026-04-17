"use server";

import prisma from "@/lib/prisma";
import { getTransactionFee } from "./fee";
import { getUserSession } from "./session";
// import { createLedgerEntry } from "./ledger";

export const getTransactions = async ({
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
}): Promise<{
  transactions: Transaction[];
  totalPages: number;
  currentPage: number;
  totalTransactions: number;
}> => {
  try {
    const user = await getUserSession();
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
    const where = isAdmin ? {} : { recipientId: user.id };

    if (query?.startsWith("TX_")) {
      const tx = await prisma.transaction.findUnique({
        where: { txn_ref: query },
      });

      return {
        transactions: tx
          ? [
              {
                ...tx,
                amount: tx.amount.toNumber(),
                createdAt: tx.createdAt.toISOString(),
                currency: tx.currency as Currency,
                txn_ref: tx.txn_ref!,
                fee: tx.fee.toNumber(),
                displayName: tx.displayName!,
                reason: tx.reason!,
                receiptUrl: tx.receiptUrl!,
              },
            ]
          : [],
        totalPages: 1,
        currentPage: 1,
        totalTransactions: tx ? 1 : 0,
      };
    }
    if (query) {
      //@ts-ignore
      where.OR = [
        { recipientName: { contains: query, mode: "insensitive" } },
        { method: { contains: query, mode: "insensitive" } },
        { category: { contains: query, mode: "insensitive" } },
      ];
    }

    if (status && status !== "ALL") {
      //@ts-ignore
      where.status = status;
    }

    if (type && type !== "ALL") {
      //@ts-ignore
      where.type = type;
    }

    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where,
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
    const serializedTransactions: Transaction[] = transactions.map((tx) => ({
      ...tx,
      amount: tx.amount.toNumber(),
      createdAt: tx.createdAt.toISOString(),
      // Ensure type alignment
      type: tx.type as TransactionType,
      status: tx.status as TransactionStatus,
      currency: tx.currency as Currency,
      txn_ref: tx.txn_ref!,
      fee: tx.fee.toNumber(),
      displayName: tx.displayName!,
      reason: tx.reason!,
      receiptUrl: tx.receiptUrl!,
    }));

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
) => {
  try {
    const updatedTransaction = await prisma.transaction.update({
      where: { id },
      data: transaction,
    });
    return updatedTransaction;
  } catch (error) {
    console.error("Error updating transaction:", error);
    return null;
  }
};

export const getTransactionByReference = async (txn_ref: string) => {
  try {
    const user = await getUserSession();
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
