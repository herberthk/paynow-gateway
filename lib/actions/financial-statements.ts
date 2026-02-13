"use server";

import prisma from "@/lib/prisma";
import { getUserSession } from "./session";
import { getLastMonthRange } from "@/utils";

// --- 1. Income Statement Action ---
export const getIncomeStatement = async ({
  startDate,
  endDate,
}: {
  startDate?: string;
  endDate?: string;
}) => {
  try {
    const user = await getUserSession();
    if (!user) return null;

    const defaultRange = getLastMonthRange();
    const start = startDate ? new Date(startDate) : defaultRange.start;
    const end = endDate ? new Date(endDate) : defaultRange.end;
    if (endDate) end.setHours(23, 59, 59, 999);

    const incomeAccounts = ["Sales/Revenue", "Transfer In"];
    const expenseAccounts = ["Payment", "Transfer Out"];

    const [revenueEntries, expenseEntries] = await Promise.all([
      prisma.ledger.findMany({
        where: {
          userId: user.id,
          account: { in: incomeAccounts },
          type: "CREDIT",
          createdAt: { gte: start, lte: end },
        },
      }),
      prisma.ledger.findMany({
        where: {
          userId: user.id,
          account: { in: expenseAccounts },
          type: "DEBIT",
          createdAt: { gte: start, lte: end },
        },
      }),
    ]);

    const revenueTotal = revenueEntries.reduce(
      (sum, e) => sum + e.amount.toNumber(),
      0,
    );
    const expenseTotal = expenseEntries.reduce(
      (sum, e) => sum + e.amount.toNumber(),
      0,
    );
    const netIncome = revenueTotal - expenseTotal;

    return {
      period: { start, end },
      revenues: [
        {
          name: "Sales / Revenue",
          amount: revenueEntries
            .filter((e) => e.account === "Sales/Revenue")
            .reduce((s, e) => s + e.amount.toNumber(), 0),
        },
        {
          name: "Transfers In",
          amount: revenueEntries
            .filter((e) => e.account === "Transfer In")
            .reduce((s, e) => s + e.amount.toNumber(), 0),
        },
      ].filter((i) => i.amount > 0),
      expenses: [
        {
          name: "Payments",
          amount: expenseEntries
            .filter((e) => e.account === "Payment")
            .reduce((s, e) => s + e.amount.toNumber(), 0),
        },
        {
          name: "Transfers Out",
          amount: expenseEntries
            .filter((e) => e.account === "Transfer Out")
            .reduce((s, e) => s + e.amount.toNumber(), 0),
        },
      ].filter((i) => i.amount > 0),
      totalRevenue: revenueTotal,
      totalExpenses: expenseTotal,
      netIncome,
    };
  } catch (error) {
    console.error("Error generating Income Statement:", error);
    return null;
  }
};

// --- 2. Balance Sheet Action ---
export const getBalanceSheet = async ({ asOfDate }: { asOfDate?: string }) => {
  try {
    const user = await getUserSession();
    if (!user) return null;

    const defaultRange = getLastMonthRange();
    const end = asOfDate ? new Date(asOfDate) : defaultRange.end;
    if (asOfDate) end.setHours(23, 59, 59, 999);

    const walletEntries = await prisma.ledger.findMany({
      where: {
        userId: user.id,
        account: "Wallet",
        createdAt: { lte: end },
      },
      select: { type: true, amount: true },
    });

    const walletBalance = walletEntries.reduce((acc, entry) => {
      const val = entry.amount.toNumber();
      return entry.type === "DEBIT" ? acc + val : acc - val;
    }, 0);

    const assets = [
      { name: "Cash & Equivalents (Wallet)", amount: walletBalance },
    ];
    const totalAssets = walletBalance;
    const liabilities: { name: string; amount: number }[] = [];
    const totalLiabilities = 0;
    const equity = [
      {
        name: "Retained Earnings / Capital",
        amount: totalAssets - totalLiabilities,
      },
    ];
    const totalEquity = totalAssets - totalLiabilities;

    return {
      asOf: end,
      assets,
      totalAssets,
      liabilities,
      totalLiabilities,
      equity,
      totalEquity,
    };
  } catch (error) {
    console.error("Error generating Balance Sheet:", error);
    return null;
  }
};
