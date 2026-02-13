-- CreateEnum
CREATE TYPE "LedgerType" AS ENUM ('DEBIT', 'CREDIT');

-- CreateTable
CREATE TABLE "payment_ledger" (
    "id" TEXT NOT NULL,
    "transactionId" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "type" "LedgerType" NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "account" TEXT NOT NULL,
    "description" TEXT,
    "balanceAfter" DECIMAL(12,2),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payment_ledger_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "payment_ledger_userId_createdAt_idx" ON "payment_ledger"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "payment_ledger_type_idx" ON "payment_ledger"("type");

-- CreateIndex
CREATE INDEX "payment_ledger_account_idx" ON "payment_ledger"("account");

-- AddForeignKey
ALTER TABLE "payment_ledger" ADD CONSTRAINT "payment_ledger_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "payment_transactions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_ledger" ADD CONSTRAINT "payment_ledger_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
