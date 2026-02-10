import prisma from "@/lib/prisma";
import bcrypt from "bcrypt";
import { generateTxRef } from "./helpers";

const hashPassword = async (password: string) =>
  await bcrypt.hash(password, 10);

// Seed data for Users
export const seedUsers = [
  {
    name: "Herbert James",
    email: "herberthtk100@gmail.com",
    tel: "+256700700001",
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
];

// Seed data for Wallets (will be created after users)
export const seedWallets = (userIds: number[]) => [
  {
    userId: userIds[0],
    balance: 5000000, // 5,000,000 UGX
  },
  {
    userId: userIds[1],
    balance: 250000, // 250,000 UGX
  },
  {
    userId: userIds[2],
    balance: 1500000, // 1,500,000 UGX
  },
  {
    userId: userIds[3],
    balance: 75000, // 75,000 UGX
  },
  {
    userId: userIds[4],
    balance: 3200000, // 3,200,000 UGX
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
export const seedTransactions = (userIds: number[]) => {
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
  const recipients = [
    "Uber Uganda",
    "Jumia Food",
    "Shell Station",
    "National Water",
    "Umeme Ltd",
    "Netflix",
    "Shoprite",
    "KFC",
    "Cafe Javas",
    "Total Energies",
    "SafeBoda",
    "Aga Khan Hospital",
    "MultiChoice",
    "LycaMobile",
  ];

  const seededRandom = (seed: number) => {
    let value = seed;
    return () => {
      value = (value * 9301 + 49297) % 233280;
      return value / 233280;
    };
  };

  const random = seededRandom(12345);
  const transactions: Transaction[] = [];

  userIds.forEach((userId) => {
    for (let i = 0; i < 30; i++) {
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

      transactions.push({
        userId,
        amount,
        currency: random() > 0.9 ? "USD" : "UGX",
        type: type as TransactionType,
        status: status as TransactionStatus,
        recipient: recipients[Math.floor(random() * recipients.length)],
        category: categories[Math.floor(random() * categories.length)],
        method: methods[Math.floor(random() * methods.length)],
        txn_ref: generateTxRef(),
        // We'll set a spread of dates across the last 3 months
        //@ts-ignore
        createdAt: new Date(
          Date.now() - Math.floor(random() * 90 * 24 * 60 * 60 * 1000),
        ),
      });
    }
  });

  return transactions;
};

export const seedDisputes = (userIds: number[], transactionIds: string[]) => [
  {
    transactionId: transactionIds[2], // The disputed transaction (userIds[2])
    userId: userIds[2],
    amount: 75000,
    currency: "UGX",
    reason: "Duplicate charge detected",
    status: "OPEN" as const,
    evidence: "Receipt image uploaded showing single purchase",
  },
];

// Seed data for Fees
export const seedFees = [
  {
    name: "Mobile Money Withdrawal",
    type: "PERCENTAGE" as const,
    value: 1.5,
    currency: "UGX",
    category: "WITHDRAWAL" as const,
    active: true,
  },
  {
    name: "Card Payment Processing",
    type: "PERCENTAGE" as const,
    value: 2.9,
    currency: "UGX",
    category: "PAYMENT" as const,
    active: true,
  },
  {
    name: "Wallet Transfer (P2P)",
    type: "FIXED" as const,
    value: 500,
    currency: "UGX",
    category: "TRANSFER" as const,
    active: true,
  },
  {
    name: "Bank Transfer Fee",
    type: "FIXED" as const,
    value: 2000,
    currency: "UGX",
    category: "TRANSFER" as const,
    active: true,
  },
  {
    name: "Deposit Fee",
    type: "PERCENTAGE" as const,
    value: 0.5,
    currency: "UGX",
    category: "DEPOSIT" as const,
    active: true,
  },
  {
    name: "API Call Overage",
    type: "FIXED" as const,
    value: 10,
    currency: "UGX",
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
    userId: userIds[0],
    title: "Welcome to PayNow",
    message:
      "Your account has been successfully created. Start making payments today!",
    type: "SUCCESS" as const,
    read: true,
    path: "/dashboard/user/settings",
  },
  {
    userId: userIds[1],
    title: "Payment Pending",
    message: "Your payment of UGX 25,000 deposit is being processed.",
    type: "INFO" as const,
    read: false,
    path: "/dashboard/user/settings",
  },
  {
    userId: userIds[2],
    title: "Dispute Opened",
    message:
      "A dispute has been opened for your transaction. We will investigate and get back to you.",
    type: "ALERT" as const,
    read: false,
    path: "/dashboard/user/settings",
  },
  {
    userId: userIds[3],
    title: "Payment Successful",
    message: "Your payment of UGX 28,000 to KFC was successful.",
    type: "SUCCESS" as const,
    read: true,
    path: "/dashboard/user/settings",
  },
  {
    userId: userIds[4],
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
      seedTransactions(userIds).map((transaction) =>
        prisma.transaction.create({ data: transaction }),
      ),
    );
    const transactionIds = transactions.map((t) => t.id);
    console.log(`✅ Created ${transactions.length} transactions`);

    // Seed Disputes
    console.log("⚖️  Seeding disputes...");
    const disputes = await Promise.all(
      seedDisputes(userIds, transactionIds).map((dispute) =>
        prisma.dispute.create({ data: dispute }),
      ),
    );
    console.log(`✅ Created ${disputes.length} disputes`);

    // Seed Fees
    console.log("💵 Seeding fees...");
    const fees = await Promise.all(
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
