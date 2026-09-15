"use server";
import prisma from "@/lib/prisma";
import { getUserSession } from "./session";
import {
  _processMobileMoneySupport,
  _processWalletSupportCore,
} from "@/lib/server/support-core";

/**
 * Process Support via Wallet Balance (P2P Support) — public Server Action.
 * Authenticates the caller via session cookie, then delegates to the core.
 */
export const processWalletSupport = async ({
  senderId,
  recipientId,
  amount,
}: {
  senderId: number;
  recipientId: number;
  amount: number;
  method?: string;
}) => {
  const sender = await getUserSession();
  if (!sender || sender.id !== senderId) {
    return {
      success: false,
      message: "Unauthorized",
      amount: 0,
      currency: "UGX",
      refference: "",
      fee: 0,
    };
  }
  return _processWalletSupportCore({ sender, senderId, recipientId, amount });
};
/**
 * Process Mobile Money Support — public Server Action.
 */
export const processMobileMoneySupport = async ({
  amount,
  toUserId,
}: {
  amount: number;
  toUserId: number;
}): Promise<{ success: boolean; refference?: string; message: string }> => {
  try {
    const user = await getUserSession();
    if (!user) return { success: false, message: "Unauthorized" };
    return _processMobileMoneySupport(user, amount, toUserId);
  } catch (error) {
    console.error("Error processing mobile money support:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Support failed",
    };
  }
};

/**
 * Fetch support history for a user (sent and received)
 */
export const getSupportHistory = async ({
  userId,
  page = 1,
  pageSize = 10,
}: {
  userId: number;
  page?: number;
  pageSize?: number;
}) => {
  try {
    const skip = (page - 1) * pageSize;

    const [supportTransactions, totalCount] = await Promise.all([
      prisma.supportUser.findMany({
        where: {
          OR: [{ fromUserId: userId }, { toUserId: userId }],
        },
        orderBy: {
          createdAt: "desc",
        },
        skip,
        take: pageSize,
      }),
      prisma.supportUser.count({
        where: {
          OR: [{ fromUserId: userId }, { toUserId: userId }],
        },
      }),
    ]);

    // Get unique user IDs to fetch names
    const userIds = Array.from(
      new Set(
        supportTransactions.flatMap((tx) => [tx.fromUserId, tx.toUserId]),
      ),
    );

    const users = await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, name: true, email: true },
    });

    const userMap = new Map(users.map((u) => [u.id, u]));

    const enhancedRecords = supportTransactions.map((record) => {
      const sender = userMap.get(record.fromUserId);
      const recipient = userMap.get(record.toUserId);

      return {
        ...record,
        amount: Number(record.amount), // Decimal to number
        senderName: sender?.name || "Unknown",
        senderEmail: sender?.email,
        recipientName: recipient?.name || "Unknown",
        recipientEmail: recipient?.email,
        type: record.fromUserId === userId ? "SENT" : "RECEIVED",
      };
    });

    return {
      success: true,
      data: enhancedRecords,
      pagination: {
        total: totalCount,
        page,
        pageSize,
        totalPages: Math.ceil(totalCount / pageSize),
      },
    };
  } catch (error) {
    console.error("Error fetching support history:", error);
    return {
      success: false,
      message: "Failed to fetch support history",
      data: [],
      pagination: { total: 0, page: 1, pageSize: 10, totalPages: 0 },
    };
  }
};
