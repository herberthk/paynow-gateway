"use server";

import prisma from "@/lib/prisma";

export const getAdmins = async () => {
  try {
    const response = await prisma.user.findMany({
      where: {
        privilege: "super_admin",
        deleted_at: null,
      },
      select: {
        id: true,
        name: true,
        email: true,
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

type AdminRow = { id: number; name: string | null; email: string | null };

const ADMIN_CACHE_TTL_MS = 60_000;
let adminCache: { at: number; rows: AdminRow[] } | null = null;

/**
 * Cached admin list for hot paths (IPN/poll/cron settlement). The admin set
 * changes rarely; a 60s instance-local TTL avoids a DB round-trip per settle.
 * Use `getAdmins` directly where strict freshness matters.
 */
export const getCachedAdmins = async (): Promise<AdminRow[]> => {
  if (adminCache && Date.now() - adminCache.at < ADMIN_CACHE_TTL_MS) {
    return adminCache.rows;
  }
  const rows = await getAdmins();
  adminCache = { at: Date.now(), rows };
  return rows;
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
    // Role changed — invalidate the cached admin list (see adminCache above).
    adminCache = null;
    return response;
  } catch (error) {
    console.error("Error assigning admin:", error);
    return null;
  }
};

/**
 * Update user privilege (Role Management)
 */
export const updateUserPrivilege = async (
  userId: number,
  privilege: "none" | "admin" | "super_admin",
) => {
  try {
    const { getUserSession } = await import("../session");
    const admin = await getUserSession();
    if (!admin || admin.privilege !== "super_admin") {
      return { success: false, message: "Unauthorized" };
    }

    await prisma.user.update({
      where: { id: userId },
      data: { privilege },
    });

    // Role changed — invalidate the cached admin list (see adminCache above).
    adminCache = null;

    return { success: true, message: "User role updated" };
  } catch (error) {
    console.error("Error updating user privilege:", error);
    return { success: false, message: "Failed to update role" };
  }
};
