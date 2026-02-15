"use server";

import prisma from "@/lib/prisma";
import { getUserSession } from "./session";

export const getUserLedger = async ({
  page = 1,
  limit = 10,
  query = "",
  startDate,
  endDate,
  minAmount,
  maxAmount,
  type,
  account,
}: {
  page?: number;
  limit?: number;
  query?: string;
  startDate?: string;
  endDate?: string;
  minAmount?: number;
  maxAmount?: number;
  type?: "DEBIT" | "CREDIT" | "ALL";
  account?: string;
}) => {
  try {
    const user = await getUserSession();
    if (!user) {
      return {
        entries: [],
        totalPages: 0,
        currentPage: 1,
        totalEntries: 0,
      };
    }

    const skip = (page - 1) * limit;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {
      userId: user.id,
    };

    // 1. Search Logic (Description, Account, Transaction Ref)
    if (query) {
      where.OR = [
        { description: { contains: query, mode: "insensitive" } },
        { account: { contains: query, mode: "insensitive" } },
        {
          transaction: {
            txn_ref: { contains: query, mode: "insensitive" },
          },
        },
      ];
    }

    // 2. Date Range Logic
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt.gte = new Date(startDate);
      }
      if (endDate) {
        // Set end date to end of day
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        where.createdAt.lte = end;
      }
    }

    // 3. Amount Logic
    if (minAmount !== undefined || maxAmount !== undefined) {
      where.amount = {};
      if (minAmount !== undefined) where.amount.gte = minAmount;
      if (maxAmount !== undefined) where.amount.lte = maxAmount;
    }

    // 4. Type Logic
    if (type && type !== "ALL") {
      where.type = type;
    }

    // 5. Account Logic
    if (account && account !== "ALL") {
      where.account = account;
    }

    const [entries, total] = await Promise.all([
      prisma.ledger.findMany({
        where,
        include: {
          transaction: {
            select: {
              txn_ref: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.ledger.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      entries: entries.map((entry) => ({
        ...entry,
        amount: entry.amount.toNumber(),
        balanceAfter: entry.balanceAfter?.toNumber() || 0,
        createdAt: entry.createdAt.toISOString(),
      })),
      totalPages,
      currentPage: page,
      totalEntries: total,
    };
  } catch (error) {
    console.error("Error fetching user ledger:", error);
    return {
      entries: [],
      totalPages: 0,
      currentPage: 1,
      totalEntries: 0,
    };
  }
};

/**
 * Helper to record a double entry for a transaction
 * This should be used within a transaction or after a successful transaction
 */
export const createLedgerEntry = async ({
  transactionId,
  senderId,
  recipientId,
  amount,
  type,
  description,
  senderAccount = "Wallet",
  recipientAccount = "Wallet",
  recipientName,
}: {
  transactionId: string;
  senderId: number;
  recipientId: number;
  amount: number;
  type: TransactionType;
  description: string;
  senderAccount?: string;
  recipientAccount?: string;
  recipientName?: string;
}) => {
  try {
    // 1. Sender Entry (Credit Wallet/Asset, Debit Expense/Liability)
    // For a transfer: Sender's Wallet decreases (Credit), Expense/Transfer Out increases (Debit)
    // Wait, in accounting:
    // Asset (Wallet) Decrease = Credit
    // Expense (Transfer) Increase = Debit

    // We want to show the USER'S perspective.
    // Sender Perspective:
    // - Wallet: Credit (Decrease)
    // - Transfer Out: Debit (Increase/Cost)

    // However, usually a ledger shows "What happened to my accounts".
    // A simple ledger for a user usually shows:
    // Date | Description | Account | Debit | Credit | Balance

    // For Sender:
    // Entry 1: Account: "Wallet", Credit: Amount (Money left)
    // Entry 2: Account: "Transfer Out", Debit: Amount (Expense incurred)

    // For Recipient:
    // Entry 1: Account: "Wallet", Debit: Amount (Money received)
    // Entry 2: Account: "Transfer In", Credit: Amount (Income earned)

    // Let's record these.

    await prisma.$transaction(async (tx) => {
      // Logic based on Transaction Type
      switch (type) {
        case "TRANSFER":
        case "PAYMENT":
          // SENDER: Money leaves wallet (Asset Decrease = Credit) -> Goes to Expense/Transfer (Expense Increase = Debit)
          // 1. Credit Sender Wallet
          await tx.ledger.create({
            data: {
              transactionId,
              userId: senderId,
              type: "CREDIT",
              amount,
              account: senderAccount, // "Wallet"
              description: `Sent to ${type === "TRANSFER" ? recipientName : "merchant"} #${recipientId}`,
            },
          });
          // 2. Debit Sender Expense
          await tx.ledger.create({
            data: {
              transactionId,
              userId: senderId,
              type: "DEBIT",
              amount,
              account: type === "TRANSFER" ? "Transfer Out" : "Payment",
              description: `Sent to ${type === "TRANSFER" ? recipientName : "merchant"} #${recipientId}`,
            },
          });

          // RECIPIENT: Money enters wallet (Asset Increase = Debit) -> Comes from Income/Transfer (Income Increase = Credit)
          // 1. Debit Recipient Wallet
          await tx.ledger.create({
            data: {
              transactionId,
              userId: recipientId,
              type: "DEBIT",
              amount,
              account: recipientAccount, // "Wallet"
              description: `Received from ${type === "TRANSFER" ? recipientName : "merchant"} #${senderId}`,
            },
          });
          // 2. Credit Recipient Income
          await tx.ledger.create({
            data: {
              transactionId,
              userId: recipientId,
              type: "CREDIT",
              amount,
              account: type === "TRANSFER" ? "Transfer In" : "Sales/Revenue",
              description: description,
            },
          });
          break;

        case "DEPOSIT":
          // RECIPIENT (Self) Only: Money enters wallet (Debit) -> Source is External/Bank (Credit)
          await tx.ledger.create({
            data: {
              transactionId,
              userId: recipientId,
              type: "DEBIT",
              amount,
              account: recipientAccount, // "Wallet"
              description: "Deposit",
            },
          });
          await tx.ledger.create({
            data: {
              transactionId,
              userId: recipientId,
              type: "CREDIT",
              amount,
              account: "Bank/External", // Source of funds
              description: description,
            },
          });
          break;

        case "WITHDRAWAL":
          // SENDER (Self) Only: Money leaves wallet (Credit) -> Goes to External/Bank (Debit)
          await tx.ledger.create({
            data: {
              transactionId,
              userId: senderId,
              type: "CREDIT",
              amount,
              account: senderAccount, // "Wallet"
              description: "Withdrawal",
            },
          });
          await tx.ledger.create({
            data: {
              transactionId,
              userId: senderId,
              type: "DEBIT",
              amount,
              account: "Bank/External", // Destination
              description: description,
            },
          });
          break;
      }
    });

    return { success: true };
  } catch (error) {
    console.error("Error creating ledger entries:", error);
    return { success: false, error };
  }
};

export const getWalletLedger = async ({
  page = 1,
  limit = 10,
  query = "",
  startDate,
  endDate,
  minAmount,
  maxAmount,
  type,
  account,
}: {
  page?: number;
  limit?: number;
  query?: string;
  startDate?: string;
  endDate?: string;
  minAmount?: number;
  maxAmount?: number;
  type?: "DEBIT" | "CREDIT" | "ALL";
  account?: string;
}) => {
  try {
    const user = await getUserSession();
    if (!user) {
      return {
        entries: [],
        totalPages: 0,
        currentPage: 1,
        totalEntries: 0,
      };
    }

    const skip = (page - 1) * limit;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {
      userId: user.id,
    };

    if (query?.startsWith("TX_")) {
      const tx = await prisma.wallet.findFirst({
        where: { refference: query },
      });

      return {
        transactions: tx
          ? [
              {
                ...tx,
                amount: tx.amount.toNumber(),
                // balanceAfter: tx.balanceAfter?.toNumber() || 0,
                createdAt: tx.createdAt.toISOString(),
              },
            ]
          : [],
        totalPages: 1,
        currentPage: 1,
        totalTransactions: tx ? 1 : 0,
      };
    }
    // 1. Search Logic (Description, Account, Transaction Ref)
    if (query && !query.startsWith("TX_")) {
      where.OR = [
        { reason: { contains: query, mode: "insensitive" } },
        { type: { contains: query } },
      ];
    }

    // 2. Date Range Logic
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt.gte = new Date(startDate);
      }
      if (endDate) {
        // Set end date to end of day
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        where.createdAt.lte = end;
      }
    }

    // 3. Amount Logic
    if (minAmount !== undefined || maxAmount !== undefined) {
      where.amount = {};
      if (minAmount !== undefined) where.amount.gte = minAmount;
      if (maxAmount !== undefined) where.amount.lte = maxAmount;
    }

    // 4. Type Logic
    if (type && type !== "ALL") {
      where.type = type;
    }

    // 5. Account Logic
    if (account && account !== "ALL") {
      where.account = account;
    }

    const [entries, total] = await Promise.all([
      prisma.wallet.findMany({
        where,
        // include: {
        //   transaction: {
        //     select: {
        //       txn_ref: true,
        //     },
        //   },
        // },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.wallet.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      entries: entries.map((entry) => ({
        ...entry,
        amount: entry.amount.toNumber(),
        // balanceAfter: entry.balanceAfter?.toNumber() || 0,
        createdAt: entry.createdAt.toISOString(),
      })),
      totalPages,
      currentPage: page,
      totalEntries: total,
    };
  } catch (error) {
    console.error("Error fetching user ledger:", error);
    return {
      entries: [],
      totalPages: 0,
      currentPage: 1,
      totalEntries: 0,
    };
  }
};
