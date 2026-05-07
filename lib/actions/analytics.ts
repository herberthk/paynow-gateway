"use server";

import { CATEGORY_COLORS } from "@/constants";
import prisma from "@/lib/prisma";

export const getAnalyticsData = async (
  userId: number,
  period: DashboardPeriod = "30days"
): Promise<AnalyticsData> => {
  try {
    const now = new Date();
    const startDate = new Date();
    let endDate = new Date();
    let daysToIterate = 29; // Default for 30 days (0 to 29)

    switch (period) {
      case "today":
        startDate.setHours(0, 0, 0, 0);
        daysToIterate = 0;
        break;
      case "yesterday":
        startDate.setDate(now.getDate() - 1);
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date(startDate);
        endDate.setHours(23, 59, 59, 999);
        daysToIterate = 0;
        break;
      case "7days":
        startDate.setDate(now.getDate() - 6);
        daysToIterate = 6;
        break;
      case "30days":
        startDate.setDate(now.getDate() - 29);
        daysToIterate = 29;
        break;
      case "all":
        startDate.setFullYear(now.getFullYear() - 1);
        daysToIterate = 365;
        break;
      default:
        startDate.setDate(now.getDate() - 29);
        daysToIterate = 29;
        break;
    }

    // Fetch all completed transactions relevant to the user in the specified period
    const transactions = await prisma.transaction.findMany({
      where: {
        OR: [
          { userId: userId }, // Sender
          { recipientId: userId }, // Recipient
        ],
        status: "COMPLETED",
        createdAt: {
          gte: startDate,
          lte: period === "yesterday" ? endDate : now,
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

    // Initialize map for the period to ensure continuity in the chart
    if (period !== "all") {
      for (let i = 0; i <= daysToIterate; i++) {
        const d = new Date(startDate);
        d.setDate(d.getDate() + i);
        const dateKey = d.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        }); // e.g., "Jan 1"
        cashFlowMap.set(dateKey, { income: 0, spend: 0 });
      }
    }

    // 2. Process Category Data (Group by Category)
    const categoryMap = new Map<string, number>();
    const incomeCategoryMap = new Map<string, number>();

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
        if (["TRANSFER", "DEPOSIT", "PAYMENT", "SUPPORT"].includes(tx.type)) {
          dayStats.income += amount;
          totalIncome += amount;

          // Add to Income Category Data
          const catName = tx.category || "Uncategorized";
          incomeCategoryMap.set(
            catName,
            (incomeCategoryMap.get(catName) || 0) + amount,
          );
        }
      } else if (tx.userId === userId) {
        // Expense (Transfer sent, Payment, Withdrawal)
        if (
          ["TRANSFER", "PAYMENT", "WITHDRAWAL", "SUBSCRIPTION", "SUPPORT"].includes(
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

    // Format Category Data for Recharts (Expenses)
    const categories: CategoryData[] = Array.from(categoryMap.entries())
      .map(([name, value], index) => ({
        name,
        value,
        color: CATEGORY_COLORS[index % CATEGORY_COLORS.length],
      }))
      .sort((a, b) => b.value - a.value); // Sort by highest spend

    // Format Income Category Data for Recharts
    const incomeCategories: CategoryData[] = Array.from(
      incomeCategoryMap.entries(),
    )
      .map(([name, value], index) => ({
        name,
        value,
        color: CATEGORY_COLORS[index % CATEGORY_COLORS.length],
      }))
      .sort((a, b) => b.value - a.value); // Sort by highest income

    return {
      cashFlow,
      categories,
      incomeCategories,
      totalIncome,
      totalSpent,
    };
  } catch (error) {
    console.error("Error fetching analytics data:", error);
    return {
      cashFlow: [],
      categories: [],
      incomeCategories: [],
      totalIncome: 0,
      totalSpent: 0,
    };
  }
};

export type DashboardPeriod = "today" | "yesterday" | "7days" | "30days" | "all";

export const getDashboardAnalyticsData = async (
  userId: number,
  period: DashboardPeriod = "7days"
): Promise<AnalyticsData> => {
  try {
    const now = new Date();
    const startDate = new Date();
    let endDate = new Date();
    let daysToIterate = 6; // Default for 7 days (0 to 6)

    switch (period) {
      case "today":
        startDate.setHours(0, 0, 0, 0);
        daysToIterate = 0; // Only today
        break;
      case "yesterday":
        startDate.setDate(now.getDate() - 1);
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date(startDate);
        endDate.setHours(23, 59, 59, 999);
        daysToIterate = 0; // Only yesterday
        break;
      case "30days":
        startDate.setDate(now.getDate() - 29);
        daysToIterate = 29;
        break;
      case "all":
        // For 'all', we might want to just fetch everything, but we need a sensible start date for the chart if we want continuous days.
        // Let's set it to 1 year ago for the chart continuous fill, or just rely on the data.
        startDate.setFullYear(now.getFullYear() - 1); 
        daysToIterate = 365;
        break;
      case "7days":
      default:
        startDate.setDate(now.getDate() - 6);
        daysToIterate = 6;
        break;
    }

    // Fetch all completed transactions relevant to the user in the specified period
    const transactions = await prisma.transaction.findMany({
      where: {
        OR: [
          { userId: userId }, // Sender
          { recipientId: userId }, // Recipient
        ],
        status: "COMPLETED",
        createdAt: {
          gte: startDate,
          lte: period === "yesterday" ? endDate : now,
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

    // Initialize map for the period to ensure continuity in the chart (skip for 'all' to avoid max constraints, or limit it)
    if (period !== "all") {
      for (let i = 0; i <= daysToIterate; i++) {
        const d = new Date(startDate);
        d.setDate(d.getDate() + i);
        const dateKey = d.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        }); // e.g., "Jan 1"
        cashFlowMap.set(dateKey, { income: 0, spend: 0 });
      }
    }

    // 2. Process Category Data (Group by Category)
    const categoryMap = new Map<string, number>();
    const incomeCategoryMap = new Map<string, number>();

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
        if (["TRANSFER", "DEPOSIT", "PAYMENT", "SUPPORT"].includes(tx.type)) {
          dayStats.income += amount;
          totalIncome += amount;

          // Add to Income Category Data
          const catName = tx.category || "Uncategorized";
          incomeCategoryMap.set(
            catName,
            (incomeCategoryMap.get(catName) || 0) + amount,
          );
        }
      } else if (tx.userId === userId) {
        // Expense (Transfer sent, Payment, Withdrawal)
        if (
          ["TRANSFER", "PAYMENT", "WITHDRAWAL", "SUBSCRIPTION", "SUPPORT"].includes(
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

    // Format Category Data for Recharts (Top 3 only for expenses)
    const categories: CategoryData[] = Array.from(categoryMap.entries())
      .map(([name, value], index) => ({
        name,
        value,
        color: CATEGORY_COLORS[index % CATEGORY_COLORS.length],
      }))
      .sort((a, b) => b.value - a.value) // Sort by highest spend
      .slice(0, 3); // Return only top 3 categories

    // Format Income Category Data for Recharts (Top 3 only)
    const incomeCategories: CategoryData[] = Array.from(
      incomeCategoryMap.entries(),
    )
      .map(([name, value], index) => ({
        name,
        value,
        color: CATEGORY_COLORS[index % CATEGORY_COLORS.length],
      }))
      .sort((a, b) => b.value - a.value) // Sort by highest income
      .slice(0, 3); // Return only top 3 categories

    return {
      cashFlow,
      categories,
      incomeCategories,
      totalIncome,
      totalSpent,
    };
  } catch (error) {
    console.error("Error fetching analytics data:", error);
    return {
      cashFlow: [],
      categories: [],
      incomeCategories: [],
      totalIncome: 0,
      totalSpent: 0,
    };
  }
};
