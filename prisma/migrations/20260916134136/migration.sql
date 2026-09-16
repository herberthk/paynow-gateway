-- DropIndex
DROP INDEX "processed_transactions_processed_createdAt_idx";

-- CreateIndex
CREATE INDEX "payment_transactions_externalReference_idx" ON "payment_transactions"("externalReference");

-- CreateIndex
CREATE INDEX "processed_transactions_processed_createdAt_externalReferenc_idx" ON "processed_transactions"("processed", "createdAt", "externalReference");
