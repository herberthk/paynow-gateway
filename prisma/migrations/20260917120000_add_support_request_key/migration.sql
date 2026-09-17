-- AlterTable
ALTER TABLE "payment_transactions" ADD COLUMN "requestKey" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "payment_transactions_requestKey_key" ON "payment_transactions"("requestKey");

-- CreateIndex
CREATE INDEX "payment_transactions_requestKey_idx" ON "payment_transactions"("requestKey");
