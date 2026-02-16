/*
  Warnings:

  - Made the column `transactionRef` on table `payment_disputes` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "payment_disputes" DROP CONSTRAINT "payment_disputes_transactionRef_fkey";

-- AlterTable
ALTER TABLE "payment_disputes" ALTER COLUMN "transactionRef" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "payment_disputes" ADD CONSTRAINT "payment_disputes_transactionRef_fkey" FOREIGN KEY ("transactionRef") REFERENCES "payment_transactions"("txn_ref") ON DELETE RESTRICT ON UPDATE CASCADE;
