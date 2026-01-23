"use server";

import prisma from "@/lib/prisma";

export const login = async (email: string, password: string) => {
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

export const sendOtp = async (email: string) => {
  const user = await prisma.user.create({
    data: { email },
  });
  return user;
};
