/*
  Warnings:

  - You are about to drop the column `transactionId` on the `payment_disputes` table. All the data in the column will be lost.
  - Added the required column `transactionRef` to the `payment_disputes` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "payment_disputes" DROP CONSTRAINT "payment_disputes_transactionId_fkey";

-- AlterTable
ALTER TABLE "payment_disputes" DROP COLUMN "transactionId",
ADD COLUMN     "transactionRef" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "payment_disputes" ADD CONSTRAINT "payment_disputes_transactionRef_fkey" FOREIGN KEY ("transactionRef") REFERENCES "payment_transactions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
