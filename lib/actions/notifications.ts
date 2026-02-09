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
      userId,
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
        userId,
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
}: {
  userId: number;
  title: string;
  message: string;
  type: NotificationType;
}) => {
  try {
    const notification = await prisma.systemNotification.create({
      data: {
        userId,
        title,
        message,
        type,
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
        userId,
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
        userId,
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
        userId,
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
        userId,
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
        userId,
      },
    });
    return notifications;
  } catch (error) {
    console.log(error);
  }
};
