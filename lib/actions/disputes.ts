"use server";

import prisma from "@/lib/prisma";
import { getUserSession } from "@/lib/actions/session";
import { revalidatePath } from "next/cache";
import { notifyAdmins } from "./notifications";

export type CreateTicketInput = {
  amount?: number;
  currency?: "UGX" | "USD";
  reason: string;
  transactionRef?: string;
  evidence?: string;
  type: "TRANSACTION" | "GENERAL";
};

export async function createTicket(data: CreateTicketInput) {
  try {
    const user = await getUserSession();
    if (!user) throw new Error("Unauthorized");

    //if transactionRef is provided, check if it exists and belongs to the user
    if (data.transactionRef) {
      const transaction = await prisma.transaction.findUnique({
        where: { txn_ref: data.transactionRef },
      });
      if (!transaction)
        return { success: false, error: "Transaction not found" };
      // if (transaction.userId !== user.id) return { success: false, error: "Unauthorized" };
    }

    const dispute = await prisma.dispute.create({
      data: {
        ...data,
        userId: user.id,
      },
    });

    // Nofify admins about new ticket
    await notifyAdmins({
      title: "New Dispute Ticket",
      message: `A new dispute ticket has been created by ${user.name}`,
      path: `/dashboard/admin/disputes?id=${dispute.id}`,
      fromUserId: user.id,
    });
    revalidatePath(`/dashboard/user/disputes`);
    return { success: true };
  } catch (error) {
    console.error("Failed to create ticket:", error);
    return { success: false, error: "Failed to create ticket" };
  }
}

export async function getUserTickets() {
  try {
    const currentUser = await getUserSession();
    if (!currentUser) throw new Error("Unauthorized");

    const disputes = await prisma.dispute.findMany({
      where: { userId: currentUser.id },
      orderBy: { createdAt: "desc" },
      include: {
        transaction: {
          select: {
            txn_ref: true,
            amount: true,
            currency: true,
          },
        },
      },
    });

    const tickets = disputes.map((dispute) => ({
      ...dispute,
      amount: dispute.amount ? Number(dispute.amount) : null,
      transactionRef: dispute.transactionRef!,
      transaction: dispute.transaction
        ? {
            ...dispute.transaction,
            amount: Number(dispute.transaction.amount),
          }
        : null,
      createdAt: dispute.createdAt.toISOString(),
    }));
    return { success: true, data: tickets };
  } catch (error) {
    console.error("Failed to fetch user tickets:", error);
    return { success: false, error: "Failed to fetch tickets" };
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function getAllTickets(filter?: {
  status?: "OPEN" | "RESOLVED" | "REJECTED" | "ALL";
  search?: string;
}) {
  try {
    const user = await getUserSession();
    if (!user) throw new Error("Unauthorized");
    if (user.privilege !== "admin" && user.privilege !== "super_admin") {
      throw new Error("Forbidden: Admin access required");
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {};

    if (filter?.status && filter.status !== "ALL") {
      where.status = filter.status;
    }

    if (filter?.search) {
      where.OR = [
        { user: { name: { contains: filter.search, mode: "insensitive" } } },
        { transactionId: { contains: filter.search, mode: "insensitive" } },
        {
          transaction: {
            txn_ref: { contains: filter.search, mode: "insensitive" },
          },
        },
        { reason: { contains: filter.search, mode: "insensitive" } },
      ];
    }

    const disputes = await prisma.dispute.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
        transaction: {
          select: {
            txn_ref: true,
            amount: true,
            currency: true,
          },
        },
      },
    });
    return { success: true, data: disputes };
  } catch (error) {
    console.error("Failed to fetch all tickets:", error);
    return { success: false, error: "Failed to fetch tickets" };
  }
}

export async function resolveTicket(
  ticketId: string,
  status: "RESOLVED" | "REJECTED",
) {
  try {
    const user = await getUserSession();
    if (!user) throw new Error("Unauthorized");
    if (user.privilege !== "admin" && user.privilege !== "super_admin") {
      throw new Error("Forbidden: Admin access required");
    }

    const dispute = await prisma.dispute.update({
      where: { id: ticketId },
      data: { status },
    });

    revalidatePath("/dashboard/admin/disputes");
    revalidatePath("/dashboard/user/disputes");
    return { success: true, data: dispute };
  } catch (error) {
    console.error("Failed to resolve ticket:", error);
    return { success: false, error: "Failed to resolve ticket" };
  }
}

export async function getUserRecentTransactions() {
  try {
    const user = await getUserSession();
    if (!user) throw new Error("Unauthorized");

    const transactions = await prisma.transaction.findMany({
      where: {
        OR: [{ userId: user.id }, { recipientId: user.id }],
        status: "COMPLETED",
      },
      orderBy: { createdAt: "desc" },
      take: 20,
      select: {
        id: true,
        txn_ref: true,
        amount: true,
        currency: true,
        type: true,
        displayName: true,
        createdAt: true,
      },
    });

    return { success: true, data: transactions };
  } catch (error) {
    console.error("Failed to fetch recent transactions:", error);
    return { success: false, error: "Failed to fetch transactions" };
  }
}
