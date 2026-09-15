/*
  Warnings:

  - The values [DISPUTED] on the enum `TransactionStatus` will be removed. If these variants are still used in the database, this will fail.
  - A unique constraint covering the columns `[externalReference]` on the table `payment_transactions` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "MobileMoneyProvider" AS ENUM ('MTN', 'AIRTEL');

-- AlterEnum
BEGIN;
CREATE TYPE "TransactionStatus_new" AS ENUM ('COMPLETED', 'PENDING', 'FAILED', 'INDETERMINATE');
ALTER TABLE "public"."payment_transactions" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "payment_transactions" ALTER COLUMN "status" TYPE "TransactionStatus_new" USING ("status"::text::"TransactionStatus_new");
ALTER TYPE "TransactionStatus" RENAME TO "TransactionStatus_old";
ALTER TYPE "TransactionStatus_new" RENAME TO "TransactionStatus";
DROP TYPE "public"."TransactionStatus_old";
ALTER TABLE "payment_transactions" ALTER COLUMN "status" SET DEFAULT 'PENDING';
COMMIT;

-- DropIndex
DROP INDEX "payment_transactions_txn_ref_idx";

-- AlterTable
ALTER TABLE "payment_transactions" ADD COLUMN     "externalReference" TEXT,
ADD COLUMN     "msisdn" TEXT,
ADD COLUMN     "networkRef" TEXT,
ADD COLUMN     "provider" "MobileMoneyProvider",
ADD COLUMN     "providerRef" TEXT;

-- AlterTable
ALTER TABLE "payment_wallets" ADD COLUMN     "mobileMoneyProvider" "MobileMoneyProvider";

-- CreateTable
CREATE TABLE "processed_transactions" (
    "id" TEXT NOT NULL,
    "externalReference" TEXT NOT NULL,
    "transactionReference" TEXT,
    "processed" BOOLEAN NOT NULL DEFAULT false,
    "processedAt" TIMESTAMP(3),
    "checks" INTEGER NOT NULL DEFAULT 0,
    "lastCheckedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "processed_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "processed_transactions_externalReference_key" ON "processed_transactions"("externalReference");

-- CreateIndex
CREATE INDEX "processed_transactions_processed_createdAt_idx" ON "processed_transactions"("processed", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "payment_transactions_externalReference_key" ON "payment_transactions"("externalReference");

-- CreateIndex
CREATE INDEX "payment_transactions_providerRef_idx" ON "payment_transactions"("providerRef");

-- CreateIndex
CREATE INDEX "payment_transactions_msisdn_idx" ON "payment_transactions"("msisdn");

-- CreateIndex
CREATE INDEX "payment_transactions_status_createdAt_idx" ON "payment_transactions"("status", "createdAt");

-- CreateIndex
CREATE INDEX "payment_transactions_type_status_createdAt_idx" ON "payment_transactions"("type", "status", "createdAt");

-- CreateIndex
CREATE INDEX "payment_transactions_userId_type_status_createdAt_idx" ON "payment_transactions"("userId", "type", "status", "createdAt");

-- CreateIndex
CREATE INDEX "payment_wallets_mobileMoneyProvider_idx" ON "payment_wallets"("mobileMoneyProvider");
