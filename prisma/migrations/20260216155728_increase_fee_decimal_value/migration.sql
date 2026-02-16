/*
  Warnings:

  - You are about to alter the column `value` on the `payment_fees` table. The data in that column could be lost. The data in that column will be cast from `Decimal(12,2)` to `Decimal(12,4)`.

*/
-- AlterTable
ALTER TABLE "payment_fees" ALTER COLUMN "value" SET DATA TYPE DECIMAL(12,4);
