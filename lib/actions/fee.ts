"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

type FeeProps = {
  amount: number;
  type: FeeCategory;
};

export const getTransactionFee = async ({ amount, type }: FeeProps) => {
  try {
    const fee = await prisma.fee.findUnique({
      where: { category: type, active: true },
      select: {
        value: true,
        type: true,
      },
    });
    if (!fee) {
      return {
        success: false,
        message: "Fee not found",
      };
    }
    let TRANSACTION_FEE = 0;
    if (fee.type === "FIXED") {
      TRANSACTION_FEE = Number(fee.value);
    } else if (fee.type === "PERCENTAGE") {
      TRANSACTION_FEE = amount * Number(fee.value);
    }
    return {
      success: true,
      amount: TRANSACTION_FEE,
    };
  } catch (error) {
    console.error("Failed to fetch transaction fee:", error);
    return {
      success: false,
      message: "Failed to fetch transaction fee",
    };
  }
};

// Get all transaction fees
export const getAllTransactionFees = async () => {
  try {
    const fees = await prisma.fee.findMany({
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        name: true,
        type: true,
        value: true,
        category: true,
        active: true,
        lastUpdated: true,
        currency: true,
      },
    });
    const formattedFees = fees.map((fee) => ({
      ...fee,
      value: Number(fee.value),
      lastUpdated: new Date(fee.lastUpdated).toLocaleDateString(),
    }));
    return formattedFees;
  } catch (error) {
    console.error("Failed to fetch transaction fees:", error);
    return [];
  }
};

// Delete a transaction fee
export const deleteTransactionFee = async (id: string) => {
  try {
    await prisma.fee.delete({ where: { id } });
    revalidatePath("/dashboard/admin/fees");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete transaction fee:", error);
    return { success: false, error: "Failed to delete transaction fee" };
  }
};

// Update a transaction fee
export const updateTransactionFee = async (id: string, value: number) => {
  try {
    await prisma.fee.update({
      where: { id },
      data: { value },
    });
    revalidatePath("/dashboard/admin/fees");
    return { success: true };
  } catch (error) {
    console.error("Failed to update transaction fee:", error);
    return { success: false, error: "Failed to update transaction fee" };
  }
};

// Toggle a transaction fee
export const toggleTransactionFee = async (id: string, active: boolean) => {
  try {
    await prisma.fee.update({ where: { id }, data: { active: !active } });
    revalidatePath("/dashboard/admin/fees");
    return { success: true };
  } catch (error) {
    console.error("Failed to toggle transaction fee:", error);
    return { success: false, error: "Failed to toggle transaction fee" };
  }
};

// Get a transaction fee
export const getTransactionFeeById = async (id: string) => {
  try {
    const fee = await prisma.fee.findUnique({ where: { id } });
    return fee;
  } catch (error) {
    console.error("Failed to fetch transaction fee:", error);
    return null;
  }
};

// Add a transaction fee
export const addTransactionFee = async (fee: Fee) => {
  try {
    // Check if transfer type exists
    const existingFee = await prisma.fee.findUnique({
      where: { category: fee.category },
    });
    if (existingFee) {
      return { success: false, message: "Transfer type already exists" };
    }
    await prisma.fee.create({ data: fee });
    revalidatePath("/dashboard/admin/fees");
    return { success: true, message: "Fee added successfully" };
  } catch (error) {
    console.error("Failed to add transaction fee:", error);
    return { success: false, message: "Failed to add transaction fee" };
  }
};
