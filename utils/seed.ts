import prisma from "@/lib/prisma";
import { hashPassword } from "./helpers";
const generateTxRef = (length = 8) => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  const bytes = crypto.getRandomValues(new Uint8Array(length));

  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars[bytes[i] % chars.length];
  }

  return `TX_${result}`;
};

// Seed data for Users
export const seedUsers = [
  {
    name: "Allan Smith",
    email: "herberthtk100@gmail.com",
    tel: "+256700700001",
    password: await hashPassword("1245689"), // Remember to hash passwords properly
    privilege: "super_admin" as const,
    status: true,
    ispaid: true,
  },
  {
    name: "Herald Olet",
    email: "connectapp26@gmail.com",
    tel: "+256779700101",
    password: await hashPassword("1245689"), // Remember to hash passwords properly
    privilege: "super_admin" as const,
    status: true,
    ispaid: true,
  },
  {
    name: "John Doe",
    email: "herbertbruce8@gmail.com",
    tel: "+256700800001",
    password: await hashPassword("1245689"), // Remember to hash passwords properly
    privilege: "admin" as const,
    status: true,
    ispaid: true,
  },
  {
    name: "John Doe",
    email: "john.doe@example.com",
    tel: "+256700000002",
    password: await hashPassword("1245689"),
    privilege: "none" as const,
    status: true,
    ispaid: false,
  },
  {
    name: "Jane Smith",
    email: "jane.smith@example.com",
    tel: "+256700000003",
    password: await hashPassword("1245689"),
    privilege: "none" as const,
    status: true,
    ispaid: true,
  },
  {
    name: "Bob Johnson",
    email: "bob.johnson@example.com",
    tel: "+256700000004",
    password: await hashPassword("1245689"),
    privilege: "none" as const,
    status: true,
    ispaid: false,
  },
  {
    name: "Alice Williams",
    email: "alice.williams@example.com",
    tel: "+256700000005",
    password: await hashPassword("1245689"),
    privilege: "none" as const,
    status: true,
    ispaid: true,
  },
  // Merchant Users for Transactions
  {
    name: "Uber Uganda",
    email: "payments@uber.ug",
    tel: "+256000000001",
    password: await hashPassword("merchant123"),
    privilege: "none" as const,
    status: true,
    ispaid: true,
  },
  {
    name: "Jumia Food",
    email: "billing@jumia.ug",
    tel: "+256000000002",
    password: await hashPassword("merchant123"),
    privilege: "none" as const,
    status: true,
    ispaid: true,
  },
  {
    name: "National Water",
    email: "bills@nwsc.ug",
    tel: "+256000000003",
    password: await hashPassword("merchant123"),
    privilege: "none" as const,
    status: true,
    ispaid: true,
  },
  {
    name: "Umeme Ltd",
    email: "tokens@umeme.ug",
    tel: "+256000000004",
    password: await hashPassword("merchant123"),
    privilege: "none" as const,
    status: true,
    ispaid: true,
  },
];

// Seed data for Wallets (will be created after users)
export const seedWallets = (userIds: number[]) => [
  {
    userId: userIds[0],
    amount: 5000000, // 5,000,000 UGX
    type: "CREDIT" as const,
    reason: "Primary wallet for user account",
    refference: generateTxRef(),
  },
  {
    userId: userIds[1],
    amount: 250000, // 250,000 UGX
    type: "CREDIT" as const,
    reason: "Primary wallet for user account",
    refference: generateTxRef(),
  },
  {
    userId: userIds[2],
    amount: 1500000, // 1,500,000 UGX
    type: "CREDIT" as const,
    reason: "Primary wallet for user account",
    refference: generateTxRef(),
  },
  {
    userId: userIds[3],
    amount: 75000, // 75,000 UGX
    type: "CREDIT" as const,
    reason: "Primary wallet for user account",
    refference: generateTxRef(),
  },
  {
    userId: userIds[4],
    amount: 3200000, // 3,200,000 UGX
    type: "CREDIT" as const,
    reason: "Primary wallet for user account",
    refference: generateTxRef(),
  },
  {
    userId: userIds[5],
    amount: 1000000,
    type: "CREDIT" as const,
    reason: "Primary wallet for user account",
    refference: generateTxRef(),
  },
  // Merchant wallets
  {
    userId: userIds[6],
    amount: 10000000,
    type: "CREDIT" as const,
    reason: "Merchant payment collection wallet",
    refference: generateTxRef(),
  },
  {
    userId: userIds[7],
    amount: 10000000,
    type: "CREDIT" as const,
    reason: "Merchant payment collection wallet",
    refference: generateTxRef(),
  },
  {
    userId: userIds[8],
    amount: 10000000,
    type: "CREDIT" as const,
    reason: "Merchant payment collection wallet",
    refference: generateTxRef(),
  },
  {
    userId: userIds[9],
    amount: 10000000,
    type: "CREDIT" as const,
    reason: "Merchant payment collection wallet",
    refference: generateTxRef(),
  },
];

export const seedPaymentMethods = (userIds: number[]) => [
  {
    userId: userIds[0],
    type: "MOBILE_MONEY" as const,
    name: "MTN Mobile Money",
    detail: "+256 700 *** 001",
  },
  {
    userId: userIds[1],
    type: "CARD" as const,
    name: "Visa Debit",
    detail: "**** **** **** 1234",
  },
  {
    userId: userIds[2],
    type: "MOBILE_MONEY" as const,
    name: "Airtel Money",
    detail: "+256 700 *** 002",
  },
  {
    userId: userIds[3],
    type: "BANK" as const,
    name: "Stanbic Bank",
    detail: "Account: ****5678",
  },
  {
    userId: userIds[4],
    type: "CARD" as const,
    name: "Mastercard Credit",
    detail: "**** **** **** 9012",
  },
];

// Seed data for Transactions (30 per user)
export const seedTransactions = (
  userIds: number[],
  users: { id: number; name: string | null }[],
) => {
  const categories = [
    "Transport",
    "Rent",
    "Utilities",
    "Entertainment",
    "Groceries",
    "Shopping",
    "Dining",
    "Business",
    "Health",
    "Education",
  ];
  const methods = [
    "MTN Mobile Money",
    "Airtel Money",
    "Visa **** 4242",
    "Mastercard **** 8899",
    "Stanbic Bank",
    "KCB Bank",
    "Bank of Africa",
  ];

  // Merchant users are the last 4 users (indices 6-9)
  const merchantIds = userIds.slice(6);
  const regularUserIds = userIds.slice(0, 6);

  const seededRandom = (seed: number) => {
    let value = seed;
    return () => {
      value = (value * 9301 + 49297) % 233280;
      return value / 233280;
    };
  };

  const random = seededRandom(12345);
  const transactions: {
    userId: number;
    recipientId: number;
    displayName: string;
    amount: number;
    currency: "UGX" | "USD";
    type: TransactionType;
    status: TransactionStatus;
    category: string;
    method: string;
    txn_ref: string;
    createdAt: Date;
  }[] = [];

  regularUserIds.forEach((userId) => {
    for (let i = 0; i < 10; i++) {
      const amount = Math.floor(random() * 500000) + 1000;
      const type =
        random() > 0.7
          ? "PAYMENT"
          : random() > 0.4
            ? "TRANSFER"
            : random() > 0.2
              ? "DEPOSIT"
              : "WITHDRAWAL";
      const status =
        random() > 0.9 ? "FAILED" : random() > 0.8 ? "PENDING" : "COMPLETED";

      let recipientId: number;
      let displayName: string;

      if (type === "PAYMENT") {
        // Payments go to merchants
        recipientId = merchantIds[Math.floor(random() * merchantIds.length)];
        displayName =
          users.find((u) => u.id === recipientId)?.name || "Merchant";
      } else if (type === "TRANSFER") {
        // Transfers go to other regular users
        const otherUsers = regularUserIds.filter((id) => id !== userId);
        recipientId = otherUsers[Math.floor(random() * otherUsers.length)];
        displayName = users.find((u) => u.id === recipientId)?.name || "User";
      } else {
        // Deposit/Withdrawal - recipient is self
        recipientId = userId;
        displayName = users.find((u) => u.id === userId)?.name || "Self";
      }

      transactions.push({
        userId,
        recipientId,
        displayName,
        amount,
        currency: (random() > 0.9 ? "USD" : "UGX") as "UGX" | "USD",
        type: type as TransactionType,
        status: status as TransactionStatus,
        category: categories[Math.floor(random() * categories.length)],
        method: methods[Math.floor(random() * methods.length)],
        txn_ref: generateTxRef(),
        createdAt: new Date(
          Date.now() - Math.floor(random() * 90 * 24 * 60 * 60 * 1000),
        ),
      });
    }
  });

  return transactions;
};

export const seedDisputes = (
  userIds: number[],
  transactions: {
    userId: number;
    recipientId: number;
    txn_ref: string;
  }[],
) => {
  // Find a transaction where userIds[2] is the sender or recipient
  const userTransaction = transactions.find(
    (t) => t.userId === userIds[2] || t.recipientId === userIds[2],
  )!;

  return [
    {
      userId: userIds[2],
      amount: 75000,
      currency: "UGX" as const,
      reason: "Duplicate charge detected",
      status: "OPEN" as const,
      evidence: "Receipt image uploaded showing single purchase",
      transactionRef: userTransaction.txn_ref,
    },
  ];
};

// Seed data for Fees
export const seedFees = [
  {
    name: "Mobile Money Withdrawal",
    type: "PERCENTAGE" as const,
    value: 1.5,
    currency: "UGX" as const,
    category: "WITHDRAWAL" as const,
    active: true,
  },
  {
    name: "Card Payment Processing",
    type: "PERCENTAGE" as const,
    value: 2.9,
    currency: "UGX" as const,
    category: "PAYMENT" as const,
    active: true,
  },
  {
    name: "Wallet Transfer (P2P)",
    type: "FIXED" as const,
    value: 500,
    currency: "UGX" as const,
    category: "TRANSFER" as const,
    active: true,
  },
  {
    name: "Bank Transfer Fee",
    type: "FIXED" as const,
    value: 2000,
    currency: "UGX" as const,
    category: "TRANSFER" as const,
    active: true,
  },
  {
    name: "Deposit Fee",
    type: "PERCENTAGE" as const,
    value: 0.5,
    currency: "UGX" as const,
    category: "DEPOSIT" as const,
    active: true,
  },
  {
    name: "API Call Overage",
    type: "FIXED" as const,
    value: 10,
    currency: "UGX" as const,
    category: "API" as const,
    active: false,
  },
];

export const seedAuditLogs = (adminId: number) => [
  {
    action: "Fee Change",
    adminId: adminId,
    details: "Changed withdrawal fee from 1.5% to 1.2%",
    ip: "192.168.1.1",
  },
];

export const seedSystemNotifications = (userIds: number[]) => [
  {
    toUserId: userIds[0],
    fromUserId: userIds[0],
    title: "Welcome to PayNow",
    message:
      "Your account has been successfully created. Start making payments today!",
    type: "SUCCESS" as const,
    read: true,
    path: "/dashboard/user/settings",
  },
  {
    toUserId: userIds[1],
    fromUserId: userIds[1],
    title: "Payment Pending",
    message: "Your payment of UGX 25,000 deposit is being processed.",
    type: "INFO" as const,
    read: false,
    path: "/dashboard/user/settings",
  },
  {
    toUserId: userIds[2],
    fromUserId: userIds[2],
    title: "Dispute Opened",
    message:
      "A dispute has been opened for your transaction. We will investigate and get back to you.",
    type: "ALERT" as const,
    read: false,
    path: "/dashboard/user/settings",
  },
  {
    toUserId: userIds[3],
    fromUserId: userIds[3],
    title: "Payment Successful",
    message: "Your payment of UGX 28,000 to KFC was successful.",
    type: "SUCCESS" as const,
    read: true,
    path: "/dashboard/user/settings",
  },
  {
    toUserId: userIds[4],
    fromUserId: userIds[4],
    title: "Deposit Completed",
    message: "Your deposit of UGX 500,000 was successful.",
    type: "SUCCESS" as const,
    read: true,
    path: "/dashboard/user/settings",
  },
];

// Main seed function
export async function seedDatabase() {
  try {
    console.log("🌱 Starting database seeding...");

    // Clear existing data (optional - be careful in production!)
    console.log("🗑️  Clearing existing payment data...");
    await prisma.systemNotification.deleteMany();
    await prisma.auditLog.deleteMany();
    await prisma.dispute.deleteMany();
    await prisma.ledger.deleteMany();
    await prisma.transaction.deleteMany();
    await prisma.fee.deleteMany();
    await prisma.paymentMethod.deleteMany();
    await prisma.wallet.deleteMany();
    await prisma.user.deleteMany();
    // Note: We're not deleting users as they might be referenced elsewhere

    // Seed Users
    console.log("👥 Seeding users...");
    const createdUsers = await Promise.all(
      seedUsers.map((user) =>
        prisma.user.upsert({
          where: { email: user.email },
          update: user,
          create: user,
        }),
      ),
    );
    const userIds = createdUsers.map((user) => user.id);
    console.log(`✅ Created ${userIds.length} users`);

    // Seed Wallets
    console.log("💰 Seeding wallets...");
    const wallets = await Promise.all(
      seedWallets(userIds).map((wallet) =>
        prisma.wallet.create({ data: wallet }),
      ),
    );
    console.log(`✅ Created ${wallets.length} wallets`);

    // Seed Payment Methods
    console.log("💳 Seeding payment methods...");
    const paymentMethods = await Promise.all(
      seedPaymentMethods(userIds).map((method) =>
        prisma.paymentMethod.create({ data: method }),
      ),
    );
    console.log(`✅ Created ${paymentMethods.length} payment methods`);

    // Seed Transactions
    console.log("💸 Seeding transactions...");
    const transactions = await Promise.all(
      seedTransactions(userIds, createdUsers).map((transaction) =>
        prisma.transaction.create({ data: transaction }),
      ),
    );

    console.log(`✅ Created ${transactions.length} transactions`);

    // Seed Ledger Entries for each transaction
    console.log("📒 Seeding ledger entries...");
    let ledgerCount = 0;
    for (const transaction of transactions) {
      await prisma.$transaction(async (tx) => {
        switch (transaction.type) {
          case "TRANSFER":
          case "PAYMENT":
            // Sender: Credit Wallet (money out), Debit Expense
            await tx.ledger.create({
              data: {
                transactionId: transaction.id,
                userId: transaction.userId,
                type: "CREDIT",
                amount: transaction.amount,
                account: "Wallet",
                description: `Sent to ${transaction.displayName}`,
              },
            });
            await tx.ledger.create({
              data: {
                transactionId: transaction.id,
                userId: transaction.userId,
                type: "DEBIT",
                amount: transaction.amount,
                account:
                  transaction.type === "TRANSFER" ? "Transfer Out" : "Payment",
                description: `Sent to ${transaction.displayName}`,
              },
            });
            // Recipient: Debit Wallet (money in), Credit Income
            await tx.ledger.create({
              data: {
                transactionId: transaction.id,
                userId: transaction.recipientId,
                type: "DEBIT",
                amount: transaction.amount,
                account: "Wallet",
                description: `Received from sender #${transaction.userId}`,
              },
            });
            await tx.ledger.create({
              data: {
                transactionId: transaction.id,
                userId: transaction.recipientId,
                type: "CREDIT",
                amount: transaction.amount,
                account:
                  transaction.type === "TRANSFER"
                    ? "Transfer In"
                    : "Sales/Revenue",
                description: `Received from sender #${transaction.userId}`,
              },
            });
            ledgerCount += 4;
            break;

          case "DEPOSIT":
            // Debit Wallet (money in), Credit Bank/External
            await tx.ledger.create({
              data: {
                transactionId: transaction.id,
                userId: transaction.recipientId,
                type: "DEBIT",
                amount: transaction.amount,
                account: "Wallet",
                description: "Deposit",
              },
            });
            await tx.ledger.create({
              data: {
                transactionId: transaction.id,
                userId: transaction.recipientId,
                type: "CREDIT",
                amount: transaction.amount,
                account: "Bank/External",
                description: "Deposit from external source",
              },
            });
            ledgerCount += 2;
            break;

          case "WITHDRAWAL":
            // Credit Wallet (money out), Debit Bank/External
            await tx.ledger.create({
              data: {
                transactionId: transaction.id,
                userId: transaction.userId,
                type: "CREDIT",
                amount: transaction.amount,
                account: "Wallet",
                description: "Withdrawal",
              },
            });
            await tx.ledger.create({
              data: {
                transactionId: transaction.id,
                userId: transaction.userId,
                type: "DEBIT",
                amount: transaction.amount,
                account: "Bank/External",
                description: "Withdrawal to external destination",
              },
            });
            ledgerCount += 2;
            break;
        }
      });
    }
    console.log(`✅ Created ${ledgerCount} ledger entries`);

    // Seed Disputes
    console.log("⚖️  Seeding disputes...");
    const disputes = await Promise.all(
      seedDisputes(userIds, transactions).map((dispute) =>
        prisma.dispute.create({ data: dispute }),
      ),
    );
    console.log(`✅ Created ${disputes.length} disputes`);

    // Seed Fees
    console.log("💵 Seeding fees...");
    const fees = await Promise.all(
      // @ts-ignore
      seedFees.map((fee) => prisma.fee.create({ data: fee })),
    );
    console.log(`✅ Created ${fees.length} fees`);

    // Seed Audit Logs (using first admin user)
    const adminId = userIds[0];
    console.log("📋 Seeding audit logs...");
    const auditLogs = await Promise.all(
      seedAuditLogs(adminId).map((log) =>
        prisma.auditLog.create({ data: log }),
      ),
    );
    console.log(`✅ Created ${auditLogs.length} audit logs`);

    // Seed System Notifications
    console.log("🔔 Seeding system notifications...");
    const notifications = await Promise.all(
      seedSystemNotifications(userIds).map((notification) =>
        prisma.systemNotification.create({ data: notification }),
      ),
    );
    console.log(`✅ Created ${notifications.length} system notifications`);

    console.log("✨ Database seeding completed successfully!");
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seed function if this file is executed directly
if (require.main === module) {
  seedDatabase()
    .then(() => {
      console.log("Seeding finished.");
      process.exit(0);
    })
    .catch((error) => {
      console.error("Seeding failed:", error);
      process.exit(1);
    });
}
