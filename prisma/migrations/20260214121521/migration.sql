/*
  Warnings:

  - A unique constraint covering the columns `[refference]` on the table `payment_wallets` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "payment_wallets_refference_idx";

-- DropIndex
DROP INDEX "payment_wallets_type_key";

-- CreateIndex
CREATE UNIQUE INDEX "payment_wallets_refference_key" ON "payment_wallets"("refference");

-- CreateIndex
CREATE INDEX "payment_wallets_type_idx" ON "payment_wallets"("type");
