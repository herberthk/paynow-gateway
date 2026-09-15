import "server-only";
import prisma from "@/lib/prisma";

type AdminRow = { id: number; name: string | null; email: string | null };

const ADMIN_CACHE_TTL_MS = 60_000;
let adminCache: { at: number; rows: AdminRow[] } | null = null;

/**
 * Fetch active super admins directly from the database.
 * Server-only — not exposed as a Server Action.
 */
export const fetchAdminsDirect = async (): Promise<AdminRow[]> => {
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

/**
 * Cached admin list for hot paths (IPN/poll/cron settlement). The admin set
 * changes rarely; a 60s instance-local TTL avoids a DB round-trip per settle.
 * Use `fetchAdminsDirect` directly where strict freshness matters.
 */
export const getCachedAdmins = async (): Promise<AdminRow[]> => {
  if (adminCache && Date.now() - adminCache.at < ADMIN_CACHE_TTL_MS) {
    return adminCache.rows;
  }
  const rows = await fetchAdminsDirect();
  adminCache = { at: Date.now(), rows };
  return rows;
};

/** Invalidate the instance-local admin cache (call after role changes). */
export const invalidateAdminCache = () => {
  adminCache = null;
};
