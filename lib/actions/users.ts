"use server";

import prisma from "@/lib/prisma";

export const getUserById = async (id: number) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id },
    });
    return user;
  } catch (error) {
    console.error("Error fetching user:", error);
    return null;
  }
};

// export const getUserWallet = async (id: number) => {
//   try {
//     const wallet = await prisma.wallet.findUnique({
//       where: { userId: id },
//     });
//     return wallet;
//   } catch (error) {
//     console.error("Error fetching user wallet:", error);
//     return null;
//   }
// };

export const getuserByEmail = async (email: string) => {
  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });
    return user;
  } catch (error) {
    console.error("Error fetching user:", error);
    return null;
  }
};

export const getUserTransactions = async (id: number) => {
  try {
    const transactions = await prisma.transaction.findMany({
      where: { userId: id },
    });
    return transactions;
  } catch (error) {
    console.error("Error fetching user transactions:", error);
    return [];
  }
};

export const getUserNotifications = async (id: number) => {
  try {
    const notifications = await prisma.systemNotification.findMany({
      where: { toUserId: id },
    });
    return notifications;
  } catch (error) {
    console.error("Error fetching user notifications:", error);
    return [];
  }
};

/**
 * Find user by email or phone number for P2P transfers
 * @param identifier - Email address or phone number
 * @returns User with wallet information or error
 */
export const findUserByEmailOrPhone = async (identifier: string) => {
  try {
    // Trim whitespace
    const trimmedIdentifier = identifier.trim();

    // Simple email validation (contains @ symbol)
    const isEmail = trimmedIdentifier.includes("@");

    let user;
    if (isEmail) {
      user = await prisma.user.findUnique({
        where: { email: trimmedIdentifier },
        select: {
          id: true,
          name: true,
          email: true,
          tel: true,
          wallet: {
            select: {
              id: true,
              amount: true,
            },
          },
        },
      });
    } else {
      // Search by phone number
      user = await prisma.user.findFirst({
        where: { tel: trimmedIdentifier },
        select: {
          id: true,
          name: true,
          email: true,
          tel: true,
          wallet: {
            select: {
              id: true,
              amount: true,
            },
          },
        },
      });
    }

    if (!user) {
      return {
        success: false,
        message: isEmail
          ? "No user found with this email address"
          : "No user found with this phone number",
        user: null,
      };
    }

    // Since wallet is an array but userId is unique, take the first wallet
    const userWallet = user.wallet?.[0];

    if (!userWallet) {
      return {
        success: false,
        message: "User does not have a wallet set up",
        user: null,
      };
    }

    return {
      success: true,
      message: "User found",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        tel: user.tel,
        walletId: userWallet.id,
      },
    };
  } catch (error) {
    console.error("Error finding user:", error);
    return {
      success: false,
      message: "An error occurred while searching for the user",
      user: null,
    };
  }
};
