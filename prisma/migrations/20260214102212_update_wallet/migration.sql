/*
  Warnings:

  - You are about to drop the column `balance` on the `payment_wallets` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "payment_wallets" DROP COLUMN "balance",
ADD COLUMN     "amount" DECIMAL(12,2) NOT NULL DEFAULT 0,
ADD COLUMN     "currency" "Currency" NOT NULL DEFAULT 'UGX',
ADD COLUMN     "type" "LedgerType" NOT NULL DEFAULT 'CREDIT';
