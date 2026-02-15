"use server";
import prisma from "@/lib/prisma";
import { getWalletBalance, getWalletBalanceBeforeDate } from "./wallet";
export const getAdmins = async () => {
  try {
    const response = await prisma.user.findMany({
      where: {
        privilege: "super_admin",
      },
      select: {
        id: true,
        name: true,
      },
    });
    return response;
  } catch (error) {
    console.error("Error fetching admins:", error);
    return [];
  }
};

export const getAdminById = async (id: number) => {
  try {
    const response = await prisma.user.findUnique({
      where: {
        id,
      },
    });
    return response;
  } catch (error) {
    console.error("Error fetching admin by ID:", error);
    return null;
  }
};

export const assignAdmin = async (id: number) => {
  try {
    const response = await prisma.user.update({
      where: {
        id,
      },
      data: {
        privilege: "super_admin",
      },
    });
    return response;
  } catch (error) {
    console.error("Error assigning admin:", error);
    return null;
  }
};

export const getAdminDashboardStats = async () => {
  try {
    const { getUserSession } = await import("./session");
    const user = await getUserSession();

    // Verify super_admin privilege
    if (!user || user.privilege !== "super_admin") {
      throw new Error("Unauthorized: Super admin access required");
    }

    // Calculate date ranges for trend comparison
    const now = new Date();
    const oneWeekAgo = new Date(now);
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    // Fetch all stats in parallel
    const [
      totalRevenue,
      totalUsers,
      activeDisputes,
      pendingTransactions,
      previousWeekRevenue,
      previousWeekUsers,
    ] = await Promise.all([
      // Total Revenue: Sum of all wallet balances for super admin
      getWalletBalance(user.id),
      // Total Users: Count all users
      prisma.user.count(),
      // Active Disputes: Count disputes with OPEN status
      prisma.dispute.count({
        where: { status: "OPEN" },
      }),
      // Pending Transactions: Count pending transactions
      prisma.transaction.count({
        where: { status: "PENDING" },
      }),
      // Previous week revenue (wallets created before one week ago)
      getWalletBalanceBeforeDate(user.id, oneWeekAgo),
      // Previous week users (users created before one week ago)
      prisma.user.count({
        where: { created_at: { lt: oneWeekAgo } },
      }),
    ]);

    const currentRevenue = totalRevenue?.balance || 0;
    const previousRevenue = previousWeekRevenue?.balance || 0;
    const revenueDiff = currentRevenue - previousRevenue;
    const revenuePercentChange =
      previousRevenue > 0 ? (revenueDiff / previousRevenue) * 100 : 0;

    const usersDiff = totalUsers - previousWeekUsers;

    return {
      totalRevenue: currentRevenue,
      totalUsers,
      activeDisputes,
      pendingTransactions,
      revenueTrend: {
        value: revenuePercentChange,
        direction: revenueDiff >= 0 ? "up" : "down",
        label: `${revenueDiff >= 0 ? "+" : ""}${revenuePercentChange.toFixed(1)}%`,
      },
      usersTrend: {
        value: usersDiff,
        direction: usersDiff >= 0 ? "up" : "down",
        label: `${usersDiff >= 0 ? "+" : ""}${usersDiff} this week`,
      },
    };
  } catch (error) {
    console.error("Error fetching admin dashboard stats:", error);
    return null;
  }
};

type Period = "daily" | "weekly" | "monthly";

type FinancialData = {
  name: string;
  revenue: number;
  volume: number;
  previous: number;
};

/**
 * Get revenue and volume data for charts
 * @param period - daily (last 7 days), weekly (last 4 weeks), or monthly (last 12 months)
 * @returns Financial data for revenue volume charts
 */
export const getRevenueVolumeData = async (period: Period = "daily") => {
  try {
    const { getUserSession } = await import("./session");
    const user = await getUserSession();
    if (!user || user.privilege !== "super_admin") {
      return [];
    }

    const now = new Date();
    const currentDataMap = new Map<
      string,
      { revenue: number; volume: number }
    >();
    const previousDataMap = new Map<
      string,
      { revenue: number; volume: number }
    >();

    // Helper to format date key
    const formatDateKey = (date: Date, type: Period): string => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");

      if (type === "daily") return `${year}-${month}-${day}`;
      if (type === "monthly") return `${year}-${month}`;

      // Weekly: IYYY-IW (ISO Week)
      // Simple approximation for grouping: use year-week number
      const d = new Date(
        Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()),
      );
      const dayNum = d.getUTCDay() || 7;
      d.setUTCDate(d.getUTCDate() + 4 - dayNum);
      const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
      const weekNo = Math.ceil(
        ((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7,
      );
      return `${d.getUTCFullYear()}-${String(weekNo).padStart(2, "0")}`;
    };

    // Calculate ranges and generate empty structure
    let startDate: Date;
    let previousStartDate: Date;
    let groupByFormat: string;

    // Prepare result array structure
    const labels: { label: string; currentKey: string; previousKey: string }[] =
      [];

    if (period === "daily") {
      startDate = new Date(now);
      startDate.setDate(now.getDate() - 6);
      startDate.setHours(0, 0, 0, 0);

      previousStartDate = new Date(startDate);
      previousStartDate.setDate(startDate.getDate() - 7);

      groupByFormat = "YYYY-MM-DD";

      // Generate last 7 days keys
      for (let i = 0; i < 7; i++) {
        const d = new Date(startDate);
        d.setDate(startDate.getDate() + i);

        const prevD = new Date(d);
        prevD.setDate(d.getDate() - 7);

        labels.push({
          label: d.toLocaleDateString("en-US", { weekday: "short" }), // Mon, Tue
          currentKey: formatDateKey(d, "daily"),
          previousKey: formatDateKey(prevD, "daily"),
        });
      }
    } else if (period === "weekly") {
      startDate = new Date(now);
      startDate.setDate(now.getDate() - 27); // approx 4 weeks
      previousStartDate = new Date(startDate);
      previousStartDate.setDate(startDate.getDate() - 28);

      groupByFormat = "YYYY-IW"; // Postgres ISO Week

      // Generate last 4 weeks keys
      for (let i = 0; i < 4; i++) {
        const d = new Date(now);
        d.setDate(now.getDate() - (3 - i) * 7);

        const prevD = new Date(d);
        prevD.setDate(d.getDate() - 28);

        labels.push({
          label: `Week ${i + 1}`,
          currentKey: formatDateKey(d, "weekly"),
          previousKey: formatDateKey(prevD, "weekly"),
        });
      }
    } else {
      // Monthly
      startDate = new Date(now);
      startDate.setMonth(now.getMonth() - 11);
      startDate.setDate(1); // Start of month

      previousStartDate = new Date(startDate);
      previousStartDate.setFullYear(startDate.getFullYear() - 1);

      groupByFormat = "YYYY-MM";

      // Generate last 12 months keys
      for (let i = 0; i < 12; i++) {
        const d = new Date(startDate);
        d.setMonth(startDate.getMonth() + i);

        const prevD = new Date(d);
        prevD.setFullYear(d.getFullYear() - 1);

        labels.push({
          label: d.toLocaleDateString("en-US", { month: "short" }),
          currentKey: formatDateKey(d, "monthly"),
          previousKey: formatDateKey(prevD, "monthly"),
        });
      }
    }

    // Fetch data from DB
    // NOTE: Using SUM(fee) for Admin Revenue
    // Fetch Revenue from Wallet (CREDITs to Admin)
    const currentRevenueResult = await prisma.$queryRaw<
      { date: string; revenue: number }[]
    >`
      SELECT 
        TO_CHAR("createdAt", ${groupByFormat}) as date,
        COALESCE(SUM(amount), 0) as revenue
      FROM payment_wallets
      WHERE "userId" = ${user.id}
        AND type = 'CREDIT'
        AND "createdAt" >= ${startDate}
        AND "createdAt" <= ${now}
      GROUP BY date
      ORDER BY date;
    `;

    const previousRevenueResult = await prisma.$queryRaw<
      { date: string; revenue: number }[]
    >`
      SELECT 
        TO_CHAR("createdAt", ${groupByFormat}) as date,
        COALESCE(SUM(amount), 0) as revenue
      FROM payment_wallets
      WHERE "userId" = ${user.id}
        AND type = 'CREDIT'
        AND "createdAt" >= ${previousStartDate}
        AND "createdAt" < ${startDate}
      GROUP BY date
      ORDER BY date;
    `;

    // Fetch Volume from Transactions
    const currentVolumeResult = await prisma.$queryRaw<
      { date: string; volume: number }[]
    >`
      SELECT 
        TO_CHAR("createdAt", ${groupByFormat}) as date,
        COUNT(id) as volume
      FROM payment_transactions
      WHERE "createdAt" >= ${startDate}
        AND "createdAt" <= ${now}
        AND status = 'COMPLETED'
      GROUP BY date
      ORDER BY date;
    `;

    const previousVolumeResult = await prisma.$queryRaw<
      { date: string; volume: number }[]
    >`
      SELECT 
        TO_CHAR("createdAt", ${groupByFormat}) as date,
        COUNT(id) as volume
      FROM payment_transactions
      WHERE "createdAt" >= ${previousStartDate}
        AND "createdAt" < ${startDate}
        AND status = 'COMPLETED'
      GROUP BY date
      ORDER BY date;
    `;

    // Populate maps
    currentRevenueResult.forEach((row) => {
      const existing = currentDataMap.get(row.date) || {
        revenue: 0,
        volume: 0,
      };
      currentDataMap.set(row.date, {
        ...existing,
        revenue: Number(row.revenue),
      });
    });

    currentVolumeResult.forEach((row) => {
      const existing = currentDataMap.get(row.date) || {
        revenue: 0,
        volume: 0,
      };
      currentDataMap.set(row.date, { ...existing, volume: Number(row.volume) });
    });

    previousRevenueResult.forEach((row) => {
      const existing = previousDataMap.get(row.date) || {
        revenue: 0,
        volume: 0,
      };
      previousDataMap.set(row.date, {
        ...existing,
        revenue: Number(row.revenue),
      });
    });

    previousVolumeResult.forEach((row) => {
      const existing = previousDataMap.get(row.date) || {
        revenue: 0,
        volume: 0,
      };
      previousDataMap.set(row.date, {
        ...existing,
        volume: Number(row.volume),
      });
    });

    // Construct final data array
    const financialData: FinancialData[] = labels.map((item) => {
      const current = currentDataMap.get(item.currentKey) || {
        revenue: 0,
        volume: 0,
      };
      const previous = previousDataMap.get(item.previousKey) || {
        revenue: 0,
        volume: 0,
      };

      return {
        name: item.label,
        revenue: current.revenue,
        volume: current.volume,
        previous: previous.revenue,
      };
    });

    return financialData;
  } catch (error) {
    console.error("Error fetching revenue volume data:", error);
    return [];
  }
};

/**
 * Get system-wide category distribution
 * @param period - daily, weekly, or monthly
 * @returns Top 10 categories with spending amount and count
 */
export const getSystemCategoryDistribution = async (
  period: Period = "daily",
) => {
  try {
    const { getUserSession } = await import("./session");
    const { CATEGORY_COLORS } = await import("@/constants");
    const user = await getUserSession();
    if (!user || user.privilege !== "super_admin") {
      return [];
    }

    const now = new Date();
    let startDate: Date;

    // Configure date range
    if (period === "daily") {
      startDate = new Date(now);
      startDate.setDate(now.getDate() - 6); // Last 7 days
      startDate.setHours(0, 0, 0, 0);
    } else if (period === "weekly") {
      startDate = new Date(now);
      startDate.setDate(now.getDate() - 27); // Last 4 weeks
      startDate.setHours(0, 0, 0, 0);
    } else {
      startDate = new Date(now);
      startDate.setMonth(now.getMonth() - 11); // Last 12 months
      startDate.setDate(1);
      startDate.setHours(0, 0, 0, 0);
    }

    const stats = await prisma.transaction.groupBy({
      by: ["category"],
      where: {
        status: "COMPLETED",
        createdAt: {
          gte: startDate,
          lte: now,
        },
      },
      _sum: {
        amount: true,
      },
      _count: {
        id: true,
      },
      orderBy: {
        _sum: {
          amount: "desc",
        },
      },
      take: 10, // Top 10
    });

    return stats.map((stat, index) => ({
      name: stat.category,
      value: Number(stat._sum.amount),
      count: stat._count.id,
      color: CATEGORY_COLORS[index % CATEGORY_COLORS.length],
    }));
  } catch (error) {
    console.error("Error fetching category distribution:", error);
    return [];
  }
};
