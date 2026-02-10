"use server";

import prisma from "@/lib/prisma";

export const getTransactions = async ({
  page = 1,
  limit = 10,
  query = "",
  status,
  type,
}: {
  page?: number;
  limit?: number;
  query?: string;
  status?: string;
  type?: string;
}): Promise<{
  transactions: Transaction[];
  totalPages: number;
  currentPage: number;
  totalTransactions: number;
}> => {
  try {
    const skip = (page - 1) * limit;

    const where = {};

    if (query?.startsWith("TX_")) {
      const tx = await prisma.transaction.findUnique({
        where: { txn_ref: query },
      });

      return {
        transactions: tx
          ? [
              {
                ...tx,
                amount: tx.amount.toNumber(),
                createdAt: tx.createdAt.toISOString(),
                currency: tx.currency as Currency,
                txn_ref: tx.txn_ref!,
              },
            ]
          : [],
        totalPages: 1,
        currentPage: 1,
        totalTransactions: tx ? 1 : 0,
      };
    }
    if (query) {
      //@ts-ignore
      where.OR = [
        { recipientName: { contains: query, mode: "insensitive" } },
        { method: { contains: query, mode: "insensitive" } },
        { category: { contains: query, mode: "insensitive" } },
      ];
    }

    if (status && status !== "ALL") {
      //@ts-ignore
      where.status = status;
    }

    if (type && type !== "ALL") {
      //@ts-ignore
      where.type = type;
    }

    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          createdAt: "desc",
        },
      }),
      prisma.transaction.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    // Serialize for client component
    const serializedTransactions: Transaction[] = transactions.map((tx) => ({
      ...tx,
      amount: tx.amount.toNumber(),
      createdAt: tx.createdAt.toISOString(),
      // Ensure type alignment
      type: tx.type as TransactionType,
      status: tx.status as TransactionStatus,
      currency: tx.currency as Currency,
      txn_ref: tx.txn_ref!,
    }));

    return {
      transactions: serializedTransactions,
      totalPages,
      currentPage: page,
      totalTransactions: total,
    };
  } catch (error) {
    console.error("Error fetching transactions:", error);
    return {
      transactions: [],
      totalPages: 0,
      currentPage: 1,
      totalTransactions: 0,
    };
  }
};

// export const seedTransactions = async () => {
//   try {
//     const transactionCount = await prisma.transaction.count();

//     if (transactionCount > 0) {
//       return { success: true, message: "Database already populated" };
//     }

//     // Find or create a user to attach transactions to
//     let user = await prisma.user.findFirst();
//     if (!user) {
//       // Create a default demo user if none exists
//       user = await prisma.user.create({
//         data: {
//           name: "Demo User",
//           email: "demo@example.com",
//           status: true,
//         },
//       });
//     }

//     const categories = [
//       "Transport",
//       "Rent",
//       "Utilities",
//       "Entertainment",
//       "Groceries",
//       "Shopping",
//       "Dining",
//       "Business",
//     ];
//     const methods = [
//       "MTN MoMo",
//       "Airtel Money",
//       "Visa **** 4242",
//       "Mastercard **** 8899",
//       "Wallet Transfer",
//     ];
//     const recipients = [
//       "Uber",
//       "Jumia Food",
//       "Shell Station",
//       "National Water",
//       "Umeme Ltd",
//       "Netflix",
//       "Shoprite",
//       "KFC",
//       "Cafe Javas",
//       "Total Energies",
//     ];

//     const seededRandom = (seed: number) => {
//       let value = seed;
//       return () => {
//         value = (value * 9301 + 49297) % 233280;
//         return value / 233280;
//       };
//     };

//     const random = seededRandom(12345);
//     const transactions = [];
//     const notifications = [];

//     for (let i = 0; i < 50; i++) {
//       const date = new Date(
//         new Date().getTime() - Math.floor(random() * 60) * 24 * 60 * 60 * 1000,
//       );
//       const amount = Math.floor(random() * 200000) + 5000;
//       const type =
//         random() > 0.7 ? "PAYMENT" : random() > 0.5 ? "DEPOSIT" : "TRANSFER";
//       const status = random() > 0.9 ? "FAILED" : "COMPLETED"; // 10% failure rate

//       transactions.push({
//         userId: user.id,
//         date: date,
//         amount: amount,
//         currency: random() > 0.9 ? "USD" : "UGX",
//         type: type as TransactionType,
//         status: status as TransactionStatus,
//         recipient: recipients[Math.floor(random() * recipients.length)],
//         category: categories[Math.floor(random() * categories.length)],
//         method: methods[Math.floor(random() * methods.length)],
//       });

//       // Generate a notification for some transactions
//       if (i % 3 === 0) {
//         notifications.push({
//           userId: user.id,
//           title: `${type} ${status === "COMPLETED" ? "Successful" : "Failed"}`,
//           message: `Your transaction of ${amount} to ${recipients[Math.floor(random() * recipients.length)]} has ${status.toLowerCase()}.`,
//           type: status === "FAILED" ? "ALERT" : "SUCCESS",
//           read: false,
//           createdAt: date, // Match transaction date roughly
//         });
//       }
//     }

//     await prisma.$transaction([
//       prisma.transaction.createMany({ data: transactions }),
//       prisma.systemNotification.createMany({ data: notifications as any }),
//     ]);

//     revalidatePath("/dashboard/user/transactions");
//     return { success: true, message: "Transactions seeded successfully" };
//   } catch (error) {
//     console.error("Error seeding transactions:", error);
//     return { success: false, error: "Failed to seed transactions" };
//   }
// };
