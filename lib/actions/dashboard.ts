"use server";

import prisma from "@/lib/prisma";

export const getDashboardStats = async (
  userId: number,
): Promise<DashboardStat[]> => {
  try {
    // 1. Get Wallet Balance (first wallet for user)
    const wallet = await prisma.wallet.findFirst({
      where: { userId },
      select: { amount: true },
    });

    const balance = wallet?.amount.toNumber() || 0;
    // Date Ranges
    const now = new Date();
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const prevMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const prevMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

    // Helper to get sum for a period
    const getSum = async (
      userId: number,
      type: "INCOME" | "EXPENSE",
      startDate: Date,
      endDate: Date,
    ) => {
      const types =
        type === "INCOME"
          ? ["TRANSFER", "DEPOSIT", "PAYMENT"] // Recipient
          : ["TRANSFER", "PAYMENT", "WITHDRAWAL", "SUBSCRIPTION"]; // Sender

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const where: any = {
        status: "COMPLETED",
        type: { in: types },
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      };

      if (type === "INCOME") {
        where.recipientId = userId;
      } else {
        where.userId = userId;
      }

      const agg = await prisma.transaction.aggregate({
        _sum: { amount: true },
        where,
      });

      return agg._sum.amount?.toNumber() || 0;
    };

    // 2. Calculate Stats
    const [currentIncome, prevIncome, currentSpent, prevSpent] =
      await Promise.all([
        getSum(userId, "INCOME", currentMonthStart, now),
        getSum(userId, "INCOME", prevMonthStart, prevMonthEnd),
        getSum(userId, "EXPENSE", currentMonthStart, now),
        getSum(userId, "EXPENSE", prevMonthStart, prevMonthEnd),
      ]);

    // 3. Calculate Trends
    const calculateTrend = (current: number, prev: number) => {
      if (prev === 0) return { trend: "up", value: "+100%" } as const;
      const diff = current - prev;
      const percentage = (diff / prev) * 100;
      return {
        trend: percentage >= 0 ? "up" : ("down" as const),
        value: `${percentage >= 0 ? "+" : ""}${percentage.toFixed(1)}%`,
      };
    };

    const incomeTrend = calculateTrend(currentIncome, prevIncome);
    const spentTrend = calculateTrend(currentSpent, prevSpent);

    // Balance Trend (Simplified: Current Balance vs Start of Month Balance estimate)
    // StartBalance ~= CurrentBalance - (IncomeThisMonth - SpentThisMonth)
    // This is valid assuming no other side effects on wallet balance
    const netFlow = currentIncome - currentSpent;
    const startOfMonthBalance = balance - netFlow;
    const balanceTrend = calculateTrend(balance, startOfMonthBalance);

    // 4. Count Active Payment Methods (Cards)
    const cardCount = await prisma.paymentMethod.count({
      where: {
        userId,
        type: "CARD",
      },
    });

    return [
      {
        title: "Total Balance",
        value: `UGX ${balance.toLocaleString()}`,
        icon: "Wallet",
        color: "blue",
        trend: balanceTrend.trend as Trend,
        trendValue: balanceTrend.value,
      },
      {
        title: "Total Spent", // Changed title to reflect monthly nature often desired, or keep Total
        value: `UGX ${currentSpent.toLocaleString()}`,
        subValue: "This Month", // Added context
        icon: "ArrowUpRight",
        color: "purple",
        trend: spentTrend.trend as Trend,
        trendValue: spentTrend.value,
      },
      {
        title: "Income",
        value: `UGX ${currentIncome.toLocaleString()}`,
        subValue: "This Month",
        icon: "ArrowDownLeft",
        color: "green",
        trend: incomeTrend.trend as Trend,
        trendValue: incomeTrend.value,
      },
      {
        title: "Active Cards",
        value: cardCount.toString(),
        icon: "CreditCard",
        color: "orange",
      },
    ];
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    // Return zero state on error
    return [
      {
        title: "Total Balance",
        value: "UGX 0",
        icon: "Wallet",
        color: "blue",
      },
      {
        title: "Total Spent",
        value: "UGX 0",
        icon: "ArrowUpRight",
        color: "purple",
      },
      {
        title: "Income",
        value: "UGX 0",
        icon: "ArrowDownLeft",
        color: "green",
      },
      {
        title: "Active Cards",
        value: "0",
        icon: "CreditCard",
        color: "orange",
      },
    ];
  }
};
