/*
  Warnings:

  - A unique constraint covering the columns `[txn_ref]` on the table `payment_transactions` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "payment_transactions" ADD COLUMN     "txn_ref" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "payment_transactions_txn_ref_key" ON "payment_transactions"("txn_ref");

-- CreateIndex
CREATE INDEX "payment_transactions_recipient_idx" ON "payment_transactions"("recipient");

-- CreateIndex
CREATE INDEX "payment_transactions_status_idx" ON "payment_transactions"("status");

-- CreateIndex
CREATE INDEX "payment_transactions_type_idx" ON "payment_transactions"("type");

-- CreateIndex
CREATE INDEX "payment_transactions_method_idx" ON "payment_transactions"("method");

-- CreateIndex
CREATE INDEX "payment_transactions_category_idx" ON "payment_transactions"("category");
