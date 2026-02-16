-- DropForeignKey
ALTER TABLE "payment_disputes" DROP CONSTRAINT "payment_disputes_transactionRef_fkey";

-- AddForeignKey
ALTER TABLE "payment_disputes" ADD CONSTRAINT "payment_disputes_transactionRef_fkey" FOREIGN KEY ("transactionRef") REFERENCES "payment_transactions"("txn_ref") ON DELETE RESTRICT ON UPDATE CASCADE;
