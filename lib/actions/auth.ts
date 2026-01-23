"use server";

import prisma from "@/lib/prisma";

export const getUserData = async (email: string) => {
  try {
    const user = await prisma.user.findUnique({
      where: {
        email: email,
      },
      select: {
        id: true,
        name: true,
        email: true,
        privilege: true,
        created_at: true,
      },
    });
    return user;
  } catch (error) {
    console.log("error", error);
    throw Error("Failed to get user data", { cause: error });
  }
};

// export const createUser = async (email: string, password: string) => {
//   const user = await prisma.users.create({
//     data: { email, password },
//   });
//   return user;
// };
