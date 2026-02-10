import prisma from "@/lib/prisma";
export const dropTables = async () => {
  console.log("🗑️  Clearing existing payment data...");
  await prisma.systemNotification.deleteMany();
  console.log("🗑️  Clearing existing payment data...");
};

await dropTables();
