"use server";

import prisma from "@/lib/prisma";
import { generateTxRef, hashPassword } from "@/utils";

type UsersFilter = "ALL" | "PENDING" | "VERIFIED";

/**
 * Get paginated users with advanced filtering and search
 */
export const getPaginatedUsers = async (
  page: number = 1,
  limit: number = 6,
  query: string = "",
  filter: UsersFilter = "ALL",
) => {
  try {
    const { getUserSession } = await import("../session");
    const user = await getUserSession();
    if (!user || user.privilege !== "super_admin") {
      return { users: [], totalPages: 0, totalUsers: 0 };
    }

    const skip = (page - 1) * limit;

    // Build where clause

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const whereClause: any = {
      OR: [
        { name: { contains: query, mode: "insensitive" } },
        { email: { contains: query, mode: "insensitive" } },
      ],
    };

    // Apply status filter
    // Note: In UI, TRUE = VERIFIED, FALSE = PENDING
    if (filter === "VERIFIED") {
      whereClause.status = true;
    } else if (filter === "PENDING") {
      whereClause.status = false;
    }

    // Exclude soft deleted users
    whereClause.deleted_at = null;

    // Exclude current user from the list
    if (user.id) {
      whereClause.id = { not: user.id };
    }

    // Parallel fetch: Users (with wallets) and Count
    const [users, totalUsers] = await Promise.all([
      prisma.user.findMany({
        where: whereClause,
        include: {
          wallet: true,
          paymentMethods: true,
        },
        skip,
        take: limit,
        orderBy: { created_at: "desc" },
      }),
      prisma.user.count({ where: whereClause }),
    ]);

    // Process users to calculate balance specific to Admin View
    // (Sum of all wallet entries for that user)
    const processedUsers = users.map((u) => {
      // Calculate total balance
      const balance = u.wallet.reduce((acc, w) => {
        const amount = Number(w.amount);
        return w.type === "CREDIT" ? acc + amount : acc - amount;
      }, 0);

      // Find the latest wallet ID for reference (or just use first)
      const walletId = u.wallet[0]?.id || "N/A";

      return {
        id: u.id,
        name: u.name || "Unknown",
        email: u.email || "No Email",
        privilege: u.privilege || "none",
        status: u.status,
        created_at: u.created_at
          ? new Date(u.created_at).toISOString().split("T")[0]
          : "N/A",
        wallet: {
          balance: balance,
          id: walletId,
        },
        tel: u.tel,
        paymentMethods: u.paymentMethods.map((pm) => ({
          id: pm.id,
          type: pm.type,
          name: pm.name,
          detail: pm.detail,
        })),
      };
    });

    const totalPages = Math.ceil(totalUsers / limit);

    return {
      users: processedUsers,
      totalPages,
      totalUsers,
    };
  } catch (error) {
    console.error("Error fetching paginated users:", error);
    return { users: [], totalPages: 0, totalUsers: 0 };
  }
};

/**
 * Update user status (KYC Approval/Rejection)
 */
export const updateUserStatus = async (userId: number, status: boolean) => {
  try {
    const { getUserSession } = await import("../session");
    const admin = await getUserSession();
    if (!admin || admin.privilege !== "super_admin") {
      return { success: false, message: "Unauthorized" };
    }

    await prisma.user.update({
      where: { id: userId },
      data: { status },
    });

    return { success: true, message: "User status updated" };
  } catch (error) {
    console.error("Error updating user status:", error);
    return { success: false, message: "Failed to update status" };
  }
};

/**
 * Soft Delete user
 */
export const deleteUser = async (userId: number) => {
  try {
    const { getUserSession } = await import("../session");
    const admin = await getUserSession();
    if (!admin || admin.privilege !== "super_admin") {
      return { success: false, message: "Unauthorized" };
    }

    await prisma.user.update({
      where: { id: userId },
      data: { deleted_at: new Date() },
    });

    return { success: true, message: "User moved to trash successfully" };
  } catch (error) {
    console.error("Error deleting user:", error);
    return { success: false, message: "Failed to delete user" };
  }
};

/**
 * Create a new user (System Admin Action)
 */
export const createSystemUser = async (data: Partial<User>) => {
  try {
    const { getUserSession } = await import("../session");
    const admin = await getUserSession();
    if (!admin || admin.privilege !== "super_admin") {
      return { success: false, message: "Unauthorized" };
    }

    // Check existing
    const existing = await prisma.user.findUnique({
      where: { email: data.email },
    });
    if (existing) {
      return { success: false, message: "User with this email already exists" };
    }

    // Auto-generate some properties
    const newUser = await prisma.user.create({
      data: {
        ...data,
        password: await hashPassword("1245689"),
        // Create a default wallet for them
        wallet: {
          create: {
            amount: 0,
            type: "CREDIT", // Initial entry
            refference: await generateTxRef(),
            reason: "Initial Wallet Creation",
          },
        },
      },
    });

    return {
      success: true,
      message: "User created successfully",
      user: newUser,
    };
  } catch (error) {
    console.error("Error creating user:", error);
    return { success: false, message: "Failed to create user" };
  }
};

/**
 * Update user details (Name, Email, Role, Status)
 */
export const updateSystemUser = async (
  userId: number,
  data: {
    name?: string;
    email?: string;
    privilege?: "none" | "admin" | "super_admin";
    status?: boolean;
  },
) => {
  try {
    const { getUserSession } = await import("../session");
    const admin = await getUserSession();
    if (!admin || admin.privilege !== "super_admin") {
      return { success: false, message: "Unauthorized" };
    }

    await prisma.user.update({
      where: { id: userId },
      data: {
        name: data.name,
        email: data.email,
        privilege: data.privilege,
        status: data.status,
      },
    });

    return { success: true, message: "User updated successfully" };
  } catch (error) {
    console.error("Error updating user:", error);
    return { success: false, message: "Failed to update user" };
  }
};

/**
 * Get Trash Users (Soft Deleted)
 */
export const getTrashUsers = async (page: number = 1, limit: number = 6) => {
  try {
    const { getUserSession } = await import("../session");
    const user = await getUserSession();
    if (!user || user.privilege !== "super_admin") {
      return { users: [], totalPages: 0, totalUsers: 0 };
    }

    const skip = (page - 1) * limit;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const whereClause: any = {
      deleted_at: { not: null },
    };

    const [users, totalUsers] = await Promise.all([
      prisma.user.findMany({
        where: whereClause,
        include: {
          wallet: true,
        },
        skip,
        take: limit,
        orderBy: { deleted_at: "desc" },
      }),
      prisma.user.count({ where: whereClause }),
    ]);

    const processedUsers = users.map((u) => {
      const balance = u.wallet.reduce((acc, w) => {
        const amount = Number(w.amount);
        return w.type === "CREDIT" ? acc + amount : acc - amount;
      }, 0);
      const walletId = u.wallet[0]?.id || "N/A";

      return {
        id: u.id,
        name: u.name || "Unknown",
        email: u.email || "No Email",
        privilege: u.privilege || "none",
        status: u.status,
        deleted_at: u.deleted_at
          ? new Date(u.deleted_at).toISOString().split("T")[0]
          : "N/A",
        created_at: u.created_at
          ? new Date(u.created_at).toISOString().split("T")[0]
          : "N/A",
        wallet: {
          balance: balance,
          id: walletId,
        },
      };
    });

    const totalPages = Math.ceil(totalUsers / limit);

    return {
      users: processedUsers,
      totalPages,
      totalUsers,
    };
  } catch (error) {
    console.error("Error fetching trash users:", error);
    return { users: [], totalPages: 0, totalUsers: 0 };
  }
};

/**
 * Restore User from Trash
 */
export const restoreUser = async (userId: number) => {
  try {
    const { getUserSession } = await import("../session");
    const admin = await getUserSession();
    if (!admin || admin.privilege !== "super_admin") {
      return { success: false, message: "Unauthorized" };
    }

    await prisma.user.update({
      where: { id: userId },
      data: { deleted_at: null },
    });

    return { success: true, message: "User restored successfully" };
  } catch (error) {
    console.error("Error restoring user:", error);
    return { success: false, message: "Failed to restore user" };
  }
};

/**
 * Permanently Delete User
 */
export const permanentlyDeleteUser = async (userId: number) => {
  try {
    const { getUserSession } = await import("../session");
    const admin = await getUserSession();
    if (!admin || admin.privilege !== "super_admin") {
      return { success: false, message: "Unauthorized" };
    }

    await prisma.user.delete({
      where: { id: userId },
    });

    return { success: true, message: "User permanently deleted" };
  } catch (error) {
    console.error("Error permanently deleting user:", error);
    return { success: false, message: "Failed to delete user permanently" };
  }
};
