/*
  Warnings:

  - You are about to drop the column `recipientName` on the `payment_transactions` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "payment_transactions_recipientName_idx";

-- DropIndex
DROP INDEX "payment_transactions_userId_createdAt_idx";

-- AlterTable
ALTER TABLE "payment_transactions" DROP COLUMN "recipientName",
ADD COLUMN     "displayName" TEXT,
ADD COLUMN     "reason" TEXT;

-- CreateIndex
CREATE INDEX "payment_transactions_userId_idx" ON "payment_transactions"("userId");

-- CreateIndex
CREATE INDEX "payment_transactions_createdAt_idx" ON "payment_transactions"("createdAt");
