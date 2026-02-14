-- DropIndex
DROP INDEX "payment_wallets_refference_key";

-- CreateIndex
CREATE INDEX "payment_wallets_refference_idx" ON "payment_wallets"("refference");
