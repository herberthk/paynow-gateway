-- CreateEnum
CREATE TYPE "DisputeType" AS ENUM ('TRANSACTION', 'GENERAL');

-- DropForeignKey
ALTER TABLE "payment_disputes" DROP CONSTRAINT "payment_disputes_transactionId_fkey";

-- DropIndex
DROP INDEX "payment_disputes_transactionId_key";

-- AlterTable
ALTER TABLE "payment_disputes" ADD COLUMN     "type" "DisputeType" NOT NULL DEFAULT 'TRANSACTION',
ALTER COLUMN "transactionId" DROP NOT NULL,
ALTER COLUMN "amount" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "payment_disputes" ADD CONSTRAINT "payment_disputes_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "payment_transactions"("id") ON DELETE SET NULL ON UPDATE CASCADE;
