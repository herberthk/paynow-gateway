import { PrismaClient } from "@/lib/generated/prisma/client";
import { withAccelerate } from "@prisma/extension-accelerate";

const prisma = new PrismaClient({
  accelerateUrl: process.env.DATABASE_URL!,
}).$extends(withAccelerate());

export default prisma;

// bunx prisma migrate resolve --applied 0_init
