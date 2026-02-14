/*
  Warnings:

  - A unique constraint covering the columns `[type]` on the table `payment_wallets` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `refference` to the `payment_wallets` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "payment_wallets_userId_key";

-- AlterTable
ALTER TABLE "payment_wallets" ADD COLUMN     "reason" TEXT,
ADD COLUMN     "refference" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "payment_wallets_refference_idx" ON "payment_wallets"("refference");

-- CreateIndex
CREATE INDEX "payment_wallets_userId_idx" ON "payment_wallets"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "payment_wallets_type_key" ON "payment_wallets"("type");
