import crypto from "node:crypto";
import prisma from "@/lib/prisma";
import type {
  TransactionStatus as PrismaTransactionStatus,
  TransactionType as PrismaTransactionType,
} from "@/lib/generated/prisma/client";
import { hashPassword, hashOTP } from "./helpers";

// ---------------------------------------------------------------------------
// Utilities
// ---------------------------------------------------------------------------

const generateTxRef = (length = 12) => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  const bytes = crypto.getRandomValues(new Uint8Array(length * 2));
  let result = "";
  for (const byte of bytes) {
    if (result.length >= length) break;
    if (byte < 252) result += chars[byte % chars.length];
  }
  return `TX_${result}`;
};

const generateExtRef = (length = 12) => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  const bytes = crypto.getRandomValues(new Uint8Array(length * 2));
  let result = "";
  for (const byte of bytes) {
    if (result.length >= length) break;
    if (byte < 252) result += chars[byte % chars.length];
  }
  return `EXT_${result}`;
};

// ---------------------------------------------------------------------------
// Seed Data – Users (10 total: 2 super_admin, 1 admin, 3 regular, 4 merchants)
// ---------------------------------------------------------------------------

export const seedUsers = [
  // --- Admins (indices 0–2) ---
  {
    name: "Allan Smith",
    email: "herberthtk100@gmail.com",
    tel: "+256700700001",
    password: await hashPassword("1245689"),
    privilege: "super_admin" as const,
    status: true,
    ispaid: true,
    address: "Plot 1, Kampala Road, Kampala",
    created_at: new Date("2024-01-01T08:00:00.000Z"),
    updated_at: new Date("2024-01-01T08:00:00.000Z"),
  },
  {
    name: "Herald Olet",
    email: "connectapp26@gmail.com",
    tel: "+256779700101",
    password: await hashPassword("1245689"),
    privilege: "super_admin" as const,
    status: true,
    ispaid: true,
    address: "Plot 22, Nakasero Hill, Kampala",
    created_at: new Date("2024-01-02T08:00:00.000Z"),
    updated_at: new Date("2024-01-02T08:00:00.000Z"),
  },
  {
    name: "John Doe",
    email: "herbertbruce8@gmail.com",
    tel: "+256700800001",
    password: await hashPassword("1245689"),
    privilege: "admin" as const,
    status: true,
    ispaid: true,
    address: "Plot 5, Kololo, Kampala",
    created_at: new Date("2024-01-03T08:00:00.000Z"),
    updated_at: new Date("2024-01-03T08:00:00.000Z"),
  },
  // --- Regular Users (indices 3–5) ---
  {
    name: "Jane Mukasa",
    email: "jane.mukasa@gmail.com",
    tel: "+256752100001",
    password: await hashPassword("1245689"),
    privilege: "none" as const,
    status: true,
    ispaid: true,
    address: "Ntinda, Kampala",
    created_at: new Date("2024-02-01T08:00:00.000Z"),
    updated_at: new Date("2024-02-01T08:00:00.000Z"),
  },
  {
    name: "David Kato",
    email: "david.kato@gmail.com",
    tel: "+256772200002",
    password: await hashPassword("1245689"),
    privilege: "none" as const,
    status: true,
    ispaid: true,
    address: "Bukoto, Kampala",
    created_at: new Date("2024-02-05T08:00:00.000Z"),
    updated_at: new Date("2024-02-05T08:00:00.000Z"),
  },
  {
    name: "Sarah Namubiru",
    email: "sarah.namubiru@gmail.com",
    tel: "+256704300003",
    password: await hashPassword("1245689"),
    privilege: "none" as const,
    status: true,
    ispaid: true,
    address: "Naguru, Kampala",
    created_at: new Date("2024-02-10T08:00:00.000Z"),
    updated_at: new Date("2024-02-10T08:00:00.000Z"),
  },
  // --- Merchants (indices 6–9) ---
  {
    name: "Kampala Supermarket",
    email: "kampala.supermarket@business.com",
    tel: "+256414400001",
    password: await hashPassword("1245689"),
    privilege: "none" as const,
    status: true,
    ispaid: true,
    address: "Garden City Mall, Kampala",
    created_at: new Date("2024-03-01T08:00:00.000Z"),
    updated_at: new Date("2024-03-01T08:00:00.000Z"),
  },
  {
    name: "City Pharmacy",
    email: "city.pharmacy@business.com",
    tel: "+256414400002",
    password: await hashPassword("1245689"),
    privilege: "none" as const,
    status: true,
    ispaid: true,
    address: "William Street, Kampala",
    created_at: new Date("2024-03-02T08:00:00.000Z"),
    updated_at: new Date("2024-03-02T08:00:00.000Z"),
  },
  {
    name: "Entebbe Cafe",
    email: "entebbe.cafe@business.com",
    tel: "+256414400003",
    password: await hashPassword("1245689"),
    privilege: "none" as const,
    status: true,
    ispaid: true,
    address: "Entebbe Road, Entebbe",
    created_at: new Date("2024-03-03T08:00:00.000Z"),
    updated_at: new Date("2024-03-03T08:00:00.000Z"),
  },
  {
    name: "Tech Haven",
    email: "tech.haven@business.com",
    tel: "+256414400004",
    password: await hashPassword("1245689"),
    privilege: "none" as const,
    status: true,
    ispaid: true,
    address: "Kisementi, Kampala",
    created_at: new Date("2024-03-04T08:00:00.000Z"),
    updated_at: new Date("2024-03-04T08:00:00.000Z"),
  },
];

// ---------------------------------------------------------------------------
// Seed Data – Wallets (one initial credit per user)
// ---------------------------------------------------------------------------

export const seedWallets = (userIds: number[]) => [
  // Admins
  {
    userId: userIds[0],
    amount: 10000000,
    currency: "UGX" as const,
    type: "CREDIT" as const,
    reason: "Initial admin wallet funding",
    refference: generateTxRef(),
    paymentMethod: "MOBILE_MONEY" as const,
  },
  {
    userId: userIds[1],
    amount: 8000000,
    currency: "UGX" as const,
    type: "CREDIT" as const,
    reason: "Initial admin wallet funding",
    refference: generateTxRef(),
    paymentMethod: "MOBILE_MONEY" as const,
  },
  {
    userId: userIds[2],
    amount: 5000000,
    currency: "UGX" as const,
    type: "CREDIT" as const,
    reason: "Initial admin wallet funding",
    refference: generateTxRef(),
    paymentMethod: "MOBILE_MONEY" as const,
  },
  // Regular users
  {
    userId: userIds[3],
    amount: 1200000,
    currency: "UGX" as const,
    type: "CREDIT" as const,
    reason: "Initial wallet funding",
    refference: generateTxRef(),
    paymentMethod: "MOBILE_MONEY" as const,
    mobileMoneyProvider: "MTN" as const,
  },
  {
    userId: userIds[4],
    amount: 850000,
    currency: "UGX" as const,
    type: "CREDIT" as const,
    reason: "Initial wallet funding",
    refference: generateTxRef(),
    paymentMethod: "MOBILE_MONEY" as const,
    mobileMoneyProvider: "AIRTEL" as const,
  },
  {
    userId: userIds[5],
    amount: 2100000,
    currency: "UGX" as const,
    type: "CREDIT" as const,
    reason: "Initial wallet funding",
    refference: generateTxRef(),
    paymentMethod: "MOBILE_MONEY" as const,
    mobileMoneyProvider: "MTN" as const,
  },
  // Merchants
  {
    userId: userIds[6],
    amount: 15000000,
    currency: "UGX" as const,
    type: "CREDIT" as const,
    reason: "Merchant account funding",
    refference: generateTxRef(),
    paymentMethod: "BANK" as const,
  },
  {
    userId: userIds[7],
    amount: 9000000,
    currency: "UGX" as const,
    type: "CREDIT" as const,
    reason: "Merchant account funding",
    refference: generateTxRef(),
    paymentMethod: "BANK" as const,
  },
  {
    userId: userIds[8],
    amount: 4500000,
    currency: "UGX" as const,
    type: "CREDIT" as const,
    reason: "Merchant account funding",
    refference: generateTxRef(),
    paymentMethod: "BANK" as const,
  },
  {
    userId: userIds[9],
    amount: 7200000,
    currency: "UGX" as const,
    type: "CREDIT" as const,
    reason: "Merchant account funding",
    refference: generateTxRef(),
    paymentMethod: "BANK" as const,
  },
];

// ---------------------------------------------------------------------------
// Seed Data – Payment Methods
// ---------------------------------------------------------------------------

export const seedPaymentMethods = (userIds: number[]) => [
  {
    userId: userIds[0],
    type: "MOBILE_MONEY" as const,
    name: "MTN Mobile Money",
    detail: "+256 700 700 001",
  },
  {
    userId: userIds[1],
    type: "MOBILE_MONEY" as const,
    name: "MTN Mobile Money",
    detail: "+256 779 700 101",
  },
  {
    userId: userIds[2],
    type: "CARD" as const,
    name: "Visa Debit",
    detail: "**** **** **** 1234",
  },
  {
    userId: userIds[3],
    type: "MOBILE_MONEY" as const,
    name: "MTN Mobile Money",
    detail: "+256 752 100 001",
  },
  {
    userId: userIds[4],
    type: "MOBILE_MONEY" as const,
    name: "Airtel Money",
    detail: "+256 772 200 002",
  },
  {
    userId: userIds[5],
    type: "MOBILE_MONEY" as const,
    name: "MTN Mobile Money",
    detail: "+256 704 300 003",
  },
  {
    userId: userIds[6],
    type: "BANK" as const,
    name: "Stanbic Bank",
    detail: "ACC: **** 7001",
  },
  {
    userId: userIds[7],
    type: "BANK" as const,
    name: "Equity Bank",
    detail: "ACC: **** 7002",
  },
  {
    userId: userIds[8],
    type: "CARD" as const,
    name: "Mastercard Business",
    detail: "**** **** **** 8003",
  },
  {
    userId: userIds[9],
    type: "MOBILE_MONEY" as const,
    name: "MTN Mobile Money",
    detail: "+256 414 400 004",
  },
];

// ---------------------------------------------------------------------------
// Seed Data – Fees (all 5 FeeCategory values; satisfies fee.test.ts constraints)
// PERCENTAGE values must be between 0 and 100 (stored as percent, e.g. 1.5 = 1.5%).
// FIXED values must be positive integers.
// Each category must be unique (enforced by @unique in schema).
// ---------------------------------------------------------------------------

export const seedFees = [
  {
    name: "Mobile Money Deposit",
    type: "FIXED" as const,
    value: 500, // UGX 500 flat fee
    currency: "UGX" as const,
    category: "DEPOSIT" as const,
    active: true,
  },
  {
    name: "Mobile Money Withdrawal",
    type: "PERCENTAGE" as const,
    value: 1.5, // 1.5%
    currency: "UGX" as const,
    category: "WITHDRAWAL" as const,
    active: true,
  },
  {
    name: "P2P Transfer Fee",
    type: "FIXED" as const,
    value: 500, // UGX 500 flat fee
    currency: "UGX" as const,
    category: "TRANSFER" as const,
    active: true,
  },
  {
    name: "Card Payment Processing",
    type: "PERCENTAGE" as const,
    value: 2.9, // 2.9%
    currency: "UGX" as const,
    category: "PAYMENT" as const,
    active: true,
  },
  {
    name: "Support Disbursement Fee",
    type: "PERCENTAGE" as const,
    value: 1.0, // 1.0%
    currency: "UGX" as const,
    category: "SUPPORT" as const,
    active: true,
  },
];

// ---------------------------------------------------------------------------
// Seed Data – Transactions
// ---------------------------------------------------------------------------

export const seedTransactions = (
  userIds: number[],
  users: { id: number; name: string | null }[],
) => {
  const categories = ["Transport", "Rent", "Utilities", "Entertainment", "Food & Drink", "Health"];
  const methods = ["MTN Mobile Money", "Airtel Money", "Visa **** 4242", "Bank Transfer"];

  // indices 0–2: admins, 3–5: regular users, 6–9: merchants
  const regularUserIds = userIds.slice(3, 6);
  const merchantIds = userIds.slice(6, 10);

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
    type: PrismaTransactionType;
    status: PrismaTransactionStatus;
    category: string;
    method: string;
    txn_ref: string;
    externalReference?: string;
    msisdn?: string;
    provider?: "MTN" | "AIRTEL";
    providerRef?: string;
    fee: number;
    reason: string;
    createdAt: Date;
  }[] = [];

  regularUserIds.forEach((userId) => {
    // PAYMENT transactions (to merchants)
    for (let i = 0; i < 3; i++) {
      const amount = Math.floor(random() * 100000) + 5000;
      const recipientId = merchantIds[Math.floor(random() * merchantIds.length)];
      const status = random() > 0.85 ? "FAILED" : random() > 0.75 ? "PENDING" : "COMPLETED";
      const method = methods[Math.floor(random() * methods.length)];
      const txn_ref = generateTxRef();
      transactions.push({
        userId,
        recipientId,
        displayName: users.find((u) => u.id === recipientId)?.name || "Merchant",
        amount,
        currency: "UGX",
        type: "PAYMENT",
        status: status as PrismaTransactionStatus,
        category: categories[Math.floor(random() * categories.length)],
        method,
        txn_ref,
        externalReference: generateExtRef(),
        fee: Math.ceil(amount * 0.029),
        reason: "Merchant payment",
        createdAt: new Date(Date.now() - Math.floor(random() * 90 * 24 * 60 * 60 * 1000)),
      });
    }

    // TRANSFER transactions (to other regular users)
    for (let i = 0; i < 2; i++) {
      const otherUsers = regularUserIds.filter((id) => id !== userId);
      const recipientId = otherUsers[Math.floor(random() * otherUsers.length)];
      const amount = Math.floor(random() * 200000) + 10000;
      const status = random() > 0.85 ? "FAILED" : "COMPLETED";
      const txn_ref = generateTxRef();
      transactions.push({
        userId,
        recipientId,
        displayName: users.find((u) => u.id === recipientId)?.name || "User",
        amount,
        currency: "UGX",
        type: "TRANSFER",
        status: status as PrismaTransactionStatus,
        category: "Transfer",
        method: "Wallet P2P Transfer",
        txn_ref,
        fee: 500,
        reason: "P2P Transfer",
        createdAt: new Date(Date.now() - Math.floor(random() * 90 * 24 * 60 * 60 * 1000)),
      });
    }

    // DEPOSIT transactions (self)
    for (let i = 0; i < 2; i++) {
      const amount = Math.floor(random() * 500000) + 20000;
      const provider = random() > 0.5 ? "MTN" : "AIRTEL";
      const msisdn = provider === "MTN" ? "256752100001" : "256772200002";
      const txn_ref = generateTxRef();
      const extRef = generateExtRef();
      const status = random() > 0.9 ? "FAILED" : random() > 0.8 ? "PENDING" : "COMPLETED";
      transactions.push({
        userId,
        recipientId: userId,
        displayName: users.find((u) => u.id === userId)?.name || "Self",
        amount,
        currency: "UGX",
        type: "DEPOSIT",
        status: status as PrismaTransactionStatus,
        category: "Deposit",
        method: `${provider} Mobile Money`,
        txn_ref,
        externalReference: extRef,
        msisdn,
        provider,
        providerRef: `YO${Math.floor(random() * 9000000 + 1000000)}`,
        fee: 500,
        reason: "Mobile Money Deposit",
        createdAt: new Date(Date.now() - Math.floor(random() * 90 * 24 * 60 * 60 * 1000)),
      });
    }

    // WITHDRAWAL transactions (self)
    {
      const amount = Math.floor(random() * 300000) + 50000;
      const provider = random() > 0.5 ? "MTN" : "AIRTEL";
      const msisdn = "256752100001";
      const txn_ref = generateTxRef();
      const status = random() > 0.9 ? "FAILED" : "COMPLETED";
      transactions.push({
        userId,
        recipientId: userId,
        displayName: users.find((u) => u.id === userId)?.name || "Self",
        amount,
        currency: "UGX",
        type: "WITHDRAWAL",
        status: status as PrismaTransactionStatus,
        category: "Withdrawal",
        method: `${provider} Mobile Money`,
        txn_ref,
        msisdn,
        provider,
        fee: Math.ceil(amount * 0.015),
        reason: "Mobile Money Withdrawal",
        createdAt: new Date(Date.now() - Math.floor(random() * 90 * 24 * 60 * 60 * 1000)),
      });
    }
  });

  return transactions;
};

// ---------------------------------------------------------------------------
// Seed Data – Support Users
// ---------------------------------------------------------------------------

export const seedSupportUsers = (userIds: number[]) => [
  {
    fromUserId: userIds[3], // Jane → Allan (admin)
    toUserId: userIds[0],
    reference: generateTxRef(),
    amount: 150000,
    currency: "UGX" as const,
    paymentMethod: "MOBILE_MONEY" as const,
    reason: "Community support contribution",
  },
  {
    fromUserId: userIds[4], // David → Herald (admin)
    toUserId: userIds[1],
    reference: generateTxRef(),
    amount: 75000,
    currency: "UGX" as const,
    paymentMethod: "WALLET" as const,
    reason: "Monthly support donation",
  },
];

// ---------------------------------------------------------------------------
// Seed Data – Disputes
// ---------------------------------------------------------------------------

export const seedDisputes = (
  userIds: number[],
  transactions: {
    userId: number;
    recipientId: number;
    txn_ref: string;
    status: PrismaTransactionStatus;
  }[],
) => {
  // Find a COMPLETED transaction where a regular user is sender or recipient
  const userTxn = transactions.find(
    (t) =>
      (t.userId === userIds[3] || t.recipientId === userIds[3]) &&
      t.status === "COMPLETED",
  );
  if (!userTxn) {
    throw new Error("seedDisputes: no COMPLETED transaction found for userIds[3]");
  }

  return [
    {
      userId: userIds[3],
      amount: 75000,
      currency: "UGX" as const,
      reason: "Duplicate charge detected on merchant payment",
      status: "OPEN" as const,
      type: "TRANSACTION" as const,
      evidence: "Receipt screenshot showing single purchase",
      transactionRef: userTxn.txn_ref,
    },
    {
      userId: userIds[4],
      amount: null,
      currency: "UGX" as const,
      reason: "Incorrect amount credited to wallet",
      status: "RESOLVED" as const,
      type: "GENERAL" as const,
      evidence: "Bank statement uploaded",
      transactionRef: null,
    },
    {
      userId: userIds[5],
      amount: 120000,
      currency: "UGX" as const,
      reason: "Payment not received by merchant",
      status: "REJECTED" as const,
      type: "TRANSACTION" as const,
      evidence: null,
      transactionRef: null,
    },
  ];
};

// ---------------------------------------------------------------------------
// Seed Data – Audit Logs
// ---------------------------------------------------------------------------

export const seedAuditLogs = (adminId: number) => [
  {
    action: "Fee Change",
    adminId,
    details: "Changed withdrawal fee from 1.5% to 1.2% then reverted",
    ip: "192.168.1.1",
    path: "/dashboard/admin/fees",
  },
  {
    action: "User Status Update",
    adminId,
    details: "Marked user #5 as paid",
    ip: "192.168.1.1",
    path: "/dashboard/admin/users",
  },
];

// ---------------------------------------------------------------------------
// Seed Data – System Notifications
// ---------------------------------------------------------------------------

export const seedSystemNotifications = (userIds: number[]) => [
  {
    toUserId: userIds[3],
    fromUserId: userIds[0],
    title: "Welcome to ConnectPay",
    message: "Your account has been successfully created. Start making payments today!",
    type: "SUCCESS" as const,
    read: true,
    path: "/dashboard/user/settings",
  },
  {
    toUserId: userIds[4],
    fromUserId: userIds[4],
    title: "Payment Pending",
    message: "Your deposit of UGX 250,000 is being processed.",
    type: "INFO" as const,
    read: false,
    path: "/dashboard/user/wallet",
  },
  {
    toUserId: userIds[5],
    fromUserId: userIds[0],
    title: "Dispute Opened",
    message: "A dispute has been opened for your transaction. We will investigate and get back to you.",
    type: "ALERT" as const,
    read: false,
    path: "/dashboard/user/disputes",
  },
  {
    toUserId: userIds[0],
    fromUserId: userIds[3],
    title: "New Transaction",
    message: "A new payment of UGX 85,000 was received.",
    type: "INFO" as const,
    read: true,
    path: "/dashboard/admin/transactions",
  },
];

// ---------------------------------------------------------------------------
// Seed Data – Otps
// ---------------------------------------------------------------------------

export const seedOtps = async (userIds: number[]) => [
  {
    userId: userIds[3],
    otpHash: await hashOTP("123456"),
    expiresAt: new Date(Date.now() + 15 * 60 * 1000),
    attempts: 0,
  },
];

// ---------------------------------------------------------------------------
// Main Seed Function
// ---------------------------------------------------------------------------

export async function seedDatabase() {
  try {
    console.log("🌱 Starting database seeding...");

    // -----------------------------------------------------------------------
    // 1. Clear existing data in reverse-dependency order
    // -----------------------------------------------------------------------
    console.log("🗑️  Clearing existing data...");
    await prisma.systemNotification.deleteMany();
    await prisma.auditLog.deleteMany();
    await prisma.dispute.deleteMany();
    await prisma.ledger.deleteMany();
    await prisma.supportUser.deleteMany();
    await prisma.processedTransaction.deleteMany();
    await prisma.processedWebhookEvent.deleteMany();
    await prisma.transaction.deleteMany();
    await prisma.otp.deleteMany();
    await prisma.fee.deleteMany();
    await prisma.paymentMethod.deleteMany();
    await prisma.wallet.deleteMany();
    await prisma.user.deleteMany();

    // -----------------------------------------------------------------------
    // 2. Seed Users
    // -----------------------------------------------------------------------
    console.log("👥 Seeding users...");
    const createdUsers = await Promise.all(
      seedUsers.map((user) =>
        prisma.user.upsert({
          where: { email: user.email! },
          update: user,
          create: user,
        }),
      ),
    );
    const userIds = createdUsers.map((u) => u.id);
    console.log(`✅ Created ${userIds.length} users`);

    // -----------------------------------------------------------------------
    // 3. Seed Wallets
    // -----------------------------------------------------------------------
    console.log("💰 Seeding wallets...");
    const wallets = await Promise.all(
      seedWallets(userIds).map((w) => prisma.wallet.create({ data: w })),
    );
    console.log(`✅ Created ${wallets.length} wallets`);

    // -----------------------------------------------------------------------
    // 4. Seed Payment Methods
    // -----------------------------------------------------------------------
    console.log("💳 Seeding payment methods...");
    const paymentMethods = await Promise.all(
      seedPaymentMethods(userIds).map((m) => prisma.paymentMethod.create({ data: m })),
    );
    console.log(`✅ Created ${paymentMethods.length} payment methods`);

    // -----------------------------------------------------------------------
    // 5. Seed Fees (all 5 categories)
    // -----------------------------------------------------------------------
    console.log("💵 Seeding fees...");
    const fees = await Promise.all(
      seedFees.map((fee) => prisma.fee.create({ data: fee })),
    );
    console.log(`✅ Created ${fees.length} fees`);

    // -----------------------------------------------------------------------
    // 6. Seed Transactions
    // -----------------------------------------------------------------------
    console.log("💸 Seeding transactions...");
    const txData = seedTransactions(userIds, createdUsers);
    const transactions = await Promise.all(
      txData.map((t) => prisma.transaction.create({ data: t })),
    );
    console.log(`✅ Created ${transactions.length} transactions`);

    // -----------------------------------------------------------------------
    // 7. Seed ProcessedTransactions (for txns with externalReference)
    // -----------------------------------------------------------------------
    console.log("📦 Seeding processed transactions...");
    const processableExternalRefs = txData
      .filter((t) => t.externalReference && t.status !== "PENDING")
      .map((t) => t.externalReference as string);

    const processedTxns = await Promise.all(
      processableExternalRefs.map((externalReference, idx) =>
        prisma.processedTransaction.create({
          data: {
            externalReference,
            transactionReference: `YO${String(idx + 1000001)}`,
            processed: true,
            processedAt: new Date(),
          },
        }),
      ),
    );
    console.log(`✅ Created ${processedTxns.length} processed transactions`);

    // -----------------------------------------------------------------------
    // 8. Seed ProcessedWebhookEvent (mock Stripe events)
    // -----------------------------------------------------------------------
    console.log("🎣 Seeding processed webhook events...");
    const webhookEvents = await Promise.all([
      prisma.processedWebhookEvent.create({
        data: { stripeEventId: "evt_mock_001_deposit_success" },
      }),
      prisma.processedWebhookEvent.create({
        data: { stripeEventId: "evt_mock_002_subscription_renewed" },
      }),
    ]);
    console.log(`✅ Created ${webhookEvents.length} webhook events`);

    // -----------------------------------------------------------------------
    // 9. Seed Double-Entry Ledger (COMPLETED transactions only)
    // -----------------------------------------------------------------------
    console.log("📒 Seeding ledger entries...");
    let ledgerCount = 0;
    const completedTxns = transactions.filter((t) => t.status === "COMPLETED");

    for (const txn of completedTxns) {
      await prisma.$transaction(async (tx) => {
        switch (txn.type) {
          case "TRANSFER":
          case "PAYMENT": {
            const outAccount = txn.type === "TRANSFER" ? "Transfer Out" : "Payment";
            const inAccount = txn.type === "TRANSFER" ? "Transfer In" : "Sales/Revenue";
            // Sender: debit wallet (money leaves), credit expense account
            await tx.ledger.create({
              data: {
                transactionId: txn.id,
                userId: txn.userId,
                type: "CREDIT",
                amount: txn.amount,
                account: "Wallet",
                description: `Sent to ${txn.displayName}`,
              },
            });
            await tx.ledger.create({
              data: {
                transactionId: txn.id,
                userId: txn.userId,
                type: "DEBIT",
                amount: txn.amount,
                account: outAccount,
                description: `Sent to ${txn.displayName}`,
              },
            });
            // Recipient: credit wallet (money arrives), debit income account
            await tx.ledger.create({
              data: {
                transactionId: txn.id,
                userId: txn.recipientId,
                type: "DEBIT",
                amount: txn.amount,
                account: "Wallet",
                description: `Received from #${txn.userId}`,
              },
            });
            await tx.ledger.create({
              data: {
                transactionId: txn.id,
                userId: txn.recipientId,
                type: "CREDIT",
                amount: txn.amount,
                account: inAccount,
                description: `Received from #${txn.userId}`,
              },
            });
            ledgerCount += 4;
            break;
          }

          case "DEPOSIT": {
            await tx.ledger.create({
              data: {
                transactionId: txn.id,
                userId: txn.recipientId,
                type: "DEBIT",
                amount: txn.amount,
                account: "Wallet",
                description: "Deposit received",
              },
            });
            await tx.ledger.create({
              data: {
                transactionId: txn.id,
                userId: txn.recipientId,
                type: "CREDIT",
                amount: txn.amount,
                account: "Bank/External",
                description: "Funded from external source",
              },
            });
            ledgerCount += 2;
            break;
          }

          case "WITHDRAWAL": {
            await tx.ledger.create({
              data: {
                transactionId: txn.id,
                userId: txn.userId,
                type: "CREDIT",
                amount: txn.amount,
                account: "Wallet",
                description: "Withdrawal sent",
              },
            });
            await tx.ledger.create({
              data: {
                transactionId: txn.id,
                userId: txn.userId,
                type: "DEBIT",
                amount: txn.amount,
                account: "Bank/External",
                description: "Withdrawn to external destination",
              },
            });
            ledgerCount += 2;
            break;
          }

          case "SUPPORT": {
            await tx.ledger.create({
              data: {
                transactionId: txn.id,
                userId: txn.userId,
                type: "CREDIT",
                amount: txn.amount,
                account: "Wallet",
                description: `Support sent to ${txn.displayName}`,
              },
            });
            await tx.ledger.create({
              data: {
                transactionId: txn.id,
                userId: txn.userId,
                type: "DEBIT",
                amount: txn.amount,
                account: "Support Out",
                description: `Support sent to ${txn.displayName}`,
              },
            });
            await tx.ledger.create({
              data: {
                transactionId: txn.id,
                userId: txn.recipientId,
                type: "DEBIT",
                amount: txn.amount,
                account: "Wallet",
                description: `Support received from #${txn.userId}`,
              },
            });
            await tx.ledger.create({
              data: {
                transactionId: txn.id,
                userId: txn.recipientId,
                type: "CREDIT",
                amount: txn.amount,
                account: "Support In",
                description: `Support received from #${txn.userId}`,
              },
            });
            ledgerCount += 4;
            break;
          }

          case "SUBSCRIPTION": {
            await tx.ledger.create({
              data: {
                transactionId: txn.id,
                userId: txn.userId,
                type: "CREDIT",
                amount: txn.amount,
                account: "Wallet",
                description: "Subscription payment",
              },
            });
            await tx.ledger.create({
              data: {
                transactionId: txn.id,
                userId: txn.userId,
                type: "DEBIT",
                amount: txn.amount,
                account: "Subscription Expense",
                description: "Subscription fee",
              },
            });
            await tx.ledger.create({
              data: {
                transactionId: txn.id,
                userId: txn.recipientId,
                type: "DEBIT",
                amount: txn.amount,
                account: "Wallet",
                description: "Subscription revenue received",
              },
            });
            await tx.ledger.create({
              data: {
                transactionId: txn.id,
                userId: txn.recipientId,
                type: "CREDIT",
                amount: txn.amount,
                account: "Subscription Revenue",
                description: "Subscription revenue received",
              },
            });
            ledgerCount += 4;
            break;
          }
        }
      });
    }
    console.log(`✅ Created ${ledgerCount} ledger entries`);

    // -----------------------------------------------------------------------
    // 10. Seed Support Users
    // -----------------------------------------------------------------------
    console.log("🤝 Seeding support users...");
    const supportUsers = await Promise.all(
      seedSupportUsers(userIds).map((s) => prisma.supportUser.create({ data: s })),
    );
    console.log(`✅ Created ${supportUsers.length} support user records`);

    // -----------------------------------------------------------------------
    // 11. Seed Disputes
    // -----------------------------------------------------------------------
    console.log("⚖️  Seeding disputes...");
    const disputes = await Promise.all(
      seedDisputes(userIds, txData).map((d) => prisma.dispute.create({ data: d })),
    );
    console.log(`✅ Created ${disputes.length} disputes`);

    // -----------------------------------------------------------------------
    // 12. Seed Audit Logs
    // -----------------------------------------------------------------------
    console.log("📋 Seeding audit logs...");
    const auditLogs = await Promise.all(
      seedAuditLogs(userIds[0]).map((log) => prisma.auditLog.create({ data: log })),
    );
    console.log(`✅ Created ${auditLogs.length} audit logs`);

    // -----------------------------------------------------------------------
    // 13. Seed System Notifications
    // -----------------------------------------------------------------------
    console.log("🔔 Seeding system notifications...");
    const notifications = await Promise.all(
      seedSystemNotifications(userIds).map((n) =>
        prisma.systemNotification.create({ data: n }),
      ),
    );
    console.log(`✅ Created ${notifications.length} system notifications`);

    // -----------------------------------------------------------------------
    // 14. Seed OTPs
    // -----------------------------------------------------------------------
    console.log("🔐 Seeding OTP records...");
    const otps = await Promise.all(
      (await seedOtps(userIds)).map((o) => prisma.otp.create({ data: o })),
    );
    console.log(`✅ Created ${otps.length} OTP records`);

    console.log("✨ Database seeding completed successfully!");
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// ---------------------------------------------------------------------------
// Entrypoint – works under both Bun (`bun run utils/seed.ts`) and
// tsx (`tsx utils/seed.ts` via prisma.config.ts).
// When the file is imported by unit tests it does NOT auto-execute.
// ---------------------------------------------------------------------------
const isBunMain =
  typeof Bun !== "undefined" &&
  typeof import.meta.main !== "undefined" &&
  import.meta.main;

const isTsxMain =
  typeof process !== "undefined" &&
  process.argv[1] != null &&
  (process.argv[1].endsWith("seed.ts") || process.argv[1].endsWith("seed.js"));

if (isBunMain || isTsxMain) {
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
