/*
  Warnings:

  - You are about to drop the column `timestamp` on the `payment_audit_logs` table. All the data in the column will be lost.
  - The `currency` column on the `payment_disputes` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `currency` column on the `payment_fees` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `recipient` on the `payment_transactions` table. All the data in the column will be lost.
  - The `currency` column on the `payment_transactions` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Added the required column `updatedAt` to the `payment_audit_logs` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `payment_system_notifications` table without a default value. This is not possible if the table is not empty.
  - Added the required column `recipientId` to the `payment_transactions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `recipientName` to the `payment_transactions` table without a default value. This is not possible if the table is not empty.
  - Made the column `txn_ref` on table `payment_transactions` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "Currency" AS ENUM ('UGX', 'USD');

-- DropForeignKey
ALTER TABLE "payment_transactions" DROP CONSTRAINT "payment_transactions_userId_fkey";

-- DropIndex
DROP INDEX "payment_methods_userId_key";

-- DropIndex
DROP INDEX "payment_system_notifications_userId_idx";

-- DropIndex
DROP INDEX "payment_transactions_recipient_idx";

-- DropIndex
DROP INDEX "payment_transactions_userId_idx";

-- AlterTable
ALTER TABLE "payment_audit_logs" DROP COLUMN "timestamp",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "deleted_at" TIMESTAMP(3),
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "payment_disputes" ADD COLUMN     "deleted_at" TIMESTAMP(3),
DROP COLUMN "currency",
ADD COLUMN     "currency" "Currency" NOT NULL DEFAULT 'UGX';

-- AlterTable
ALTER TABLE "payment_fees" ADD COLUMN     "deleted_at" TIMESTAMP(3),
DROP COLUMN "currency",
ADD COLUMN     "currency" "Currency" NOT NULL DEFAULT 'UGX';

-- AlterTable
ALTER TABLE "payment_system_notifications" ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "payment_transactions" DROP COLUMN "recipient",
ADD COLUMN     "deleted_at" TIMESTAMP(3),
ADD COLUMN     "recipientId" INTEGER NOT NULL,
ADD COLUMN     "recipientName" TEXT NOT NULL,
DROP COLUMN "currency",
ADD COLUMN     "currency" "Currency" NOT NULL DEFAULT 'UGX',
ALTER COLUMN "txn_ref" SET NOT NULL;

-- CreateIndex
CREATE INDEX "Payment_otp_expiresAt_idx" ON "Payment_otp"("expiresAt");

-- CreateIndex
CREATE INDEX "payment_audit_logs_createdAt_idx" ON "payment_audit_logs"("createdAt");

-- CreateIndex
CREATE INDEX "payment_disputes_createdAt_status_idx" ON "payment_disputes"("createdAt", "status");

-- CreateIndex
CREATE INDEX "payment_methods_userId_createdAt_idx" ON "payment_methods"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "payment_system_notifications_userId_type_idx" ON "payment_system_notifications"("userId", "type");

-- CreateIndex
CREATE INDEX "payment_system_notifications_createdAt_idx" ON "payment_system_notifications"("createdAt");

-- CreateIndex
CREATE INDEX "payment_transactions_recipientId_idx" ON "payment_transactions"("recipientId");

-- CreateIndex
CREATE INDEX "payment_transactions_recipientName_idx" ON "payment_transactions"("recipientName");

-- CreateIndex
CREATE INDEX "payment_transactions_txn_ref_idx" ON "payment_transactions"("txn_ref");

-- CreateIndex
CREATE INDEX "payment_transactions_userId_createdAt_idx" ON "payment_transactions"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "payment_wallets_createdAt_idx" ON "payment_wallets"("createdAt");

-- AddForeignKey
ALTER TABLE "payment_transactions" ADD CONSTRAINT "payment_transactions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_transactions" ADD CONSTRAINT "payment_transactions_recipientId_fkey" FOREIGN KEY ("recipientId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
