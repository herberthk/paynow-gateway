"use server";

import prisma from "@/lib/prisma";
import { invalidateAdminCache } from "@/lib/admin/cached-admins";

export const getAdmins = async () => {
  try {
    const { getUserSession } = await import("../session");
    const session = await getUserSession();
    if (!session || session.privilege !== "super_admin") {
      return [];
    }
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

export const assignAdmin = async (id: number) => {
  try {
    const { getUserSession } = await import("../session");
    const session = await getUserSession();
    if (!session || session.privilege !== "super_admin") {
      return null;
    }

    const response = await prisma.user.update({
      where: {
        id,
      },
      data: {
        privilege: "super_admin",
      },
    });
    // Role changed — invalidate the cached admin list.
    invalidateAdminCache();
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

    // Role changed — invalidate the cached admin list.
    invalidateAdminCache();

    return { success: true, message: "User role updated" };
  } catch (error) {
    console.error("Error updating user privilege:", error);
    return { success: false, message: "Failed to update role" };
  }
};
