"use server";

import { CATEGORY_COLORS } from "@/constants";
import prisma from "@/lib/prisma";

export const getAnalyticsData = async (
  userId: number,
): Promise<AnalyticsData> => {
  try {
    const now = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(now.getDate() - 30);

    // Fetch all completed transactions relevant to the user in the last 30 days
    const transactions = await prisma.transaction.findMany({
      where: {
        OR: [
          { userId: userId }, // Sender
          { recipientId: userId }, // Recipient
        ],
        status: "COMPLETED",
        createdAt: {
          gte: thirtyDaysAgo,
          lte: now,
        },
      },
      orderBy: {
        createdAt: "asc",
      },
      select: {
        amount: true,
        type: true,
        category: true,
        createdAt: true,
        userId: true,
        recipientId: true,
      },
    });

    // 1. Process Cash Flow Data (Group by Day)
    const cashFlowMap = new Map<string, { income: number; spend: number }>();
    let totalIncome = 0;
    let totalSpent = 0;

    // Initialize map for the last 30 days to ensure continuity in the chart
    for (let i = 0; i <= 30; i++) {
      const d = new Date(thirtyDaysAgo);
      d.setDate(d.getDate() + i);
      const dateKey = d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }); // e.g., "Jan 1"
      cashFlowMap.set(dateKey, { income: 0, spend: 0 });
    }

    // 2. Process Category Data (Group by Category)
    const categoryMap = new Map<string, number>();

    transactions.forEach((tx) => {
      const amount = tx.amount.toNumber();
      const dateKey = tx.createdAt.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });

      // Ensure date exists in map (it should, but just in case of timezone edge cases)
      if (!cashFlowMap.has(dateKey)) {
        cashFlowMap.set(dateKey, { income: 0, spend: 0 });
      }

      const dayStats = cashFlowMap.get(dateKey)!;

      if (tx.recipientId === userId) {
        // Income (Transfer received, Deposit, etc.)
        // Filter types if necessary, but generally money IN is income
        if (["TRANSFER", "DEPOSIT", "PAYMENT"].includes(tx.type)) {
          dayStats.income += amount;
          totalIncome += amount;
        }
      } else if (tx.userId === userId) {
        // Expense (Transfer sent, Payment, Withdrawal)
        if (
          ["TRANSFER", "PAYMENT", "WITHDRAWAL", "SUBSCRIPTION"].includes(
            tx.type,
          )
        ) {
          dayStats.spend += amount;
          totalSpent += amount;

          // Add to Category Data (Only for expenses)
          const catName = tx.category || "Uncategorized";
          categoryMap.set(catName, (categoryMap.get(catName) || 0) + amount);
        }
      }
    });

    // Format Cash Flow for Recharts
    const cashFlow: CashFlowData[] = Array.from(cashFlowMap.entries()).map(
      ([name, stats]) => ({
        name,
        income: stats.income,
        spend: stats.spend,
      }),
    );

    // Format Category Data for Recharts
    const categories: CategoryData[] = Array.from(categoryMap.entries())
      .map(([name, value], index) => ({
        name,
        value,
        color: CATEGORY_COLORS[index % CATEGORY_COLORS.length],
      }))
      .sort((a, b) => b.value - a.value); // Sort by highest spend

    return {
      cashFlow,
      categories,
      totalIncome,
      totalSpent,
    };
  } catch (error) {
    console.error("Error fetching analytics data:", error);
    return {
      cashFlow: [],
      categories: [],
      totalIncome: 0,
      totalSpent: 0,
    };
  }
};

export const getDashboardAnalyticsData = async (
  userId: number,
): Promise<AnalyticsData> => {
  try {
    const now = new Date();
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(now.getDate() - 7);

    // Fetch all completed transactions relevant to the user in the last 7 days
    const transactions = await prisma.transaction.findMany({
      where: {
        OR: [
          { userId: userId }, // Sender
          { recipientId: userId }, // Recipient
        ],
        status: "COMPLETED",
        createdAt: {
          gte: sevenDaysAgo,
          lte: now,
        },
      },
      orderBy: {
        createdAt: "asc",
      },
      select: {
        amount: true,
        type: true,
        category: true,
        createdAt: true,
        userId: true,
        recipientId: true,
      },
    });

    // 1. Process Cash Flow Data (Group by Day)
    const cashFlowMap = new Map<string, { income: number; spend: number }>();
    let totalIncome = 0;
    let totalSpent = 0;

    // Initialize map for the last 7 days to ensure continuity in the chart
    for (let i = 0; i <= 7; i++) {
      const d = new Date(sevenDaysAgo);
      d.setDate(d.getDate() + i);
      const dateKey = d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }); // e.g., "Jan 1"
      cashFlowMap.set(dateKey, { income: 0, spend: 0 });
    }

    // 2. Process Category Data (Group by Category)
    const categoryMap = new Map<string, number>();

    transactions.forEach((tx) => {
      const amount = tx.amount.toNumber();
      const dateKey = tx.createdAt.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });

      // Ensure date exists in map (it should, but just in case of timezone edge cases)
      if (!cashFlowMap.has(dateKey)) {
        cashFlowMap.set(dateKey, { income: 0, spend: 0 });
      }

      const dayStats = cashFlowMap.get(dateKey)!;

      if (tx.recipientId === userId) {
        // Income (Transfer received, Deposit, etc.)
        // Filter types if necessary, but generally money IN is income
        if (["TRANSFER", "DEPOSIT", "PAYMENT"].includes(tx.type)) {
          dayStats.income += amount;
          totalIncome += amount;
        }
      } else if (tx.userId === userId) {
        // Expense (Transfer sent, Payment, Withdrawal)
        if (
          ["TRANSFER", "PAYMENT", "WITHDRAWAL", "SUBSCRIPTION"].includes(
            tx.type,
          )
        ) {
          dayStats.spend += amount;
          totalSpent += amount;

          // Add to Category Data (Only for expenses)
          const catName = tx.category || "Uncategorized";
          categoryMap.set(catName, (categoryMap.get(catName) || 0) + amount);
        }
      }
    });

    // Format Cash Flow for Recharts
    const cashFlow: CashFlowData[] = Array.from(cashFlowMap.entries()).map(
      ([name, stats]) => ({
        name,
        income: stats.income,
        spend: stats.spend,
      }),
    );

    // Format Category Data for Recharts
    const categories: CategoryData[] = Array.from(categoryMap.entries())
      .map(([name, value], index) => ({
        name,
        value,
        color: CATEGORY_COLORS[index % CATEGORY_COLORS.length],
      }))
      .sort((a, b) => b.value - a.value); // Sort by highest spend

    return {
      cashFlow,
      categories,
      totalIncome,
      totalSpent,
    };
  } catch (error) {
    console.error("Error fetching analytics data:", error);
    return {
      cashFlow: [],
      categories: [],
      totalIncome: 0,
      totalSpent: 0,
    };
  }
};
