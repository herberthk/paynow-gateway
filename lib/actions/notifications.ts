"use server";
import prisma from "@/lib/prisma";

export const getNotifications = async ({
  userId,
  page = 1,
  limit = 8,
  type,
}: {
  userId: number;
  page?: number;
  limit?: number;
  type?: NotificationType | "ALL";
}) => {
  try {
    const where = {
      toUserId: userId,
    };
    if (type && type !== "ALL") {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      where.type = type;
    }

    const [notifications, total] = await Promise.all([
      prisma.systemNotification.findMany({
        where,
        take: limit,
        skip: (page - 1) * limit,
        orderBy: {
          createdAt: "desc",
        },
      }),
      prisma.systemNotification.count({ where }),
    ]);

    return {
      notifications,
      total,
      totalPages: Math.ceil(total / limit),
    };
  } catch (error) {
    console.log(error);
    return {
      notifications: [],
      total: 0,
      totalPages: 0,
    };
  }
};

export const markNotificationAsRead = async ({ id }: { id: string }) => {
  try {
    const notification = await prisma.systemNotification.update({
      where: {
        id,
      },
      data: {
        read: true,
      },
    });
    return notification;
  } catch (error) {
    console.log(error);
  }
};

export const markAllNotificationsAsRead = async ({
  userId,
}: {
  userId: number;
}) => {
  try {
    const notifications = await prisma.systemNotification.updateMany({
      where: {
        toUserId: userId,
      },
      data: {
        read: true,
      },
    });
    return notifications;
  } catch (error) {
    console.log(error);
  }
};

export const deleteNotification = async ({ id }: { id: string }) => {
  try {
    const notification = await prisma.systemNotification.delete({
      where: {
        id,
      },
    });
    return notification;
  } catch (error) {
    console.log(error);
  }
};

export const createNotification = async ({
  userId,
  title,
  message,
  type,
  path,
}: {
  userId: number;
  title: string;
  message: string;
  type: NotificationType;
  path: string;
}) => {
  try {
    const notification = await prisma.systemNotification.create({
      data: {
        toUserId: userId,
        fromUserId: userId,
        title,
        message,
        type,
        path,
      },
    });
    return notification;
  } catch (error) {
    console.log(error);
  }
};

export const getUnreadNotificationsCount = async ({
  userId,
}: {
  userId: number;
}) => {
  try {
    const notifications = await prisma.systemNotification.count({
      where: {
        toUserId: userId,
        read: false,
      },
    });
    return notifications;
  } catch (error) {
    console.log(error);
    return 0;
  }
};

export const getNotificationById = async ({ id }: { id: string }) => {
  try {
    const notification = await prisma.systemNotification.findUnique({
      where: {
        id,
      },
    });
    return notification;
  } catch (error) {
    console.log(error);
  }
};

export const getNotificationByUserId = async ({
  userId,
}: {
  userId: number;
}) => {
  try {
    const notifications = await prisma.systemNotification.findMany({
      where: {
        toUserId: userId,
      },
    });
    return notifications;
  } catch (error) {
    console.log(error);
    return [];
  }
};

export const getNotificationByUserIdAndId = async ({
  userId,
  id,
}: {
  userId: number;
  id: string;
}) => {
  try {
    const notification = await prisma.systemNotification.findUnique({
      where: {
        toUserId: userId,
        id,
      },
    });
    return notification;
  } catch (error) {
    console.log(error);
  }
};

export const getNotificationByUserIdAndIdAndRead = async ({
  userId,
  id,
  read,
}: {
  userId: number;
  id: string;
  read: boolean;
}) => {
  try {
    const notification = await prisma.systemNotification.findUnique({
      where: {
        toUserId: userId,
        id,
        read,
      },
    });
    return notification;
  } catch (error) {
    console.log(error);
  }
};

export const deleteAllNotifications = async ({
  userId,
}: {
  userId: number;
}) => {
  try {
    const notifications = await prisma.systemNotification.deleteMany({
      where: {
        toUserId: userId,
      },
    });
    return notifications;
  } catch (error) {
    console.log(error);
  }
};

/**
 * Create notifications for P2P transfer
 * @param senderId - User ID of sender
 * @param recipientId - User ID of recipient
 * @param recipientName - Name of recipient
 * @param senderName - Name of sender
 * @param amount - Transfer amount
 * @param txn_ref - Transaction reference
 */
export const createTransferNotifications = async ({
  senderId,
  recipientId,
  recipientName,
  senderName,
  amount,
  txn_ref,
}: {
  senderId: number;
  recipientId: number;
  recipientName: string;
  senderName: string;
  amount: number;
  txn_ref: string;
}) => {
  try {
    // Notification for sender
    const senderNotification = await prisma.systemNotification.create({
      data: {
        fromUserId: senderId,
        toUserId: senderId,
        title: "Transfer Sent",
        message: `You successfully sent UGX ${amount.toLocaleString()} to ${recipientName}`,
        type: "SUCCESS",
        path: `/dashboard/user/transactions?query=${txn_ref}`,
      },
    });
    // Notification for recipient
    const recipientNotification = await prisma.systemNotification.create({
      data: {
        fromUserId: senderId,
        toUserId: recipientId,
        title: "Money Received",
        message: `You received UGX ${amount.toLocaleString()} from ${senderName}`,
        type: "SUCCESS",
        path: `/dashboard/user/transactions?query=${txn_ref}`,
      },
    });

    return {
      success: true,
      senderNotification,
      recipientNotification,
    };
  } catch (error) {
    console.error("Error creating transfer notifications:", error);
    return {
      success: false,
      error,
    };
  }
};
