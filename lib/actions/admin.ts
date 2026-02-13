"use server";
import prisma from "@/lib/prisma";
export const getAdmins = async () => {
  try {
    const response = await prisma.user.findMany({
      where: {
        privilege: "super_admin",
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
      prisma.wallet.aggregate({
        _sum: { balance: true },
        where: { user: { privilege: "super_admin" } },
      }),
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
      prisma.wallet.aggregate({
        _sum: { balance: true },
        where: {
          user: { privilege: "super_admin" },
          createdAt: { lt: oneWeekAgo },
        },
      }),
      // Previous week users (users created before one week ago)
      prisma.user.count({
        where: { created_at: { lt: oneWeekAgo } },
      }),
    ]);

    const currentRevenue = totalRevenue._sum.balance?.toNumber() || 0;
    const previousRevenue = previousWeekRevenue._sum.balance?.toNumber() || 0;
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
