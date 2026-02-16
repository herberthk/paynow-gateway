-- DropForeignKey
ALTER TABLE "payment_disputes" DROP CONSTRAINT "payment_disputes_transactionRef_fkey";

-- AlterTable
ALTER TABLE "payment_disputes" ALTER COLUMN "transactionRef" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "payment_disputes" ADD CONSTRAINT "payment_disputes_transactionRef_fkey" FOREIGN KEY ("transactionRef") REFERENCES "payment_transactions"("txn_ref") ON DELETE SET NULL ON UPDATE CASCADE;
