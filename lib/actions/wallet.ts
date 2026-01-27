"use server";
import prisma from "@/lib/prisma";
export const getUserWallet = async (id: number) => {
  const wallet = await prisma.wallet.findUnique({
    where: {
      userId: id,
    },
    select: {
      balance: true,
      id: true,
      updatedAt: true,
      createdAt: true,
      userId: true,
    },
  });
  return {
    ...wallet,
    balance: Number(wallet?.balance),
    createdAt: wallet?.createdAt.toDateString(),
    updatedAt: wallet?.updatedAt.toDateString(),
  };
};
