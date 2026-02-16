/*
  Warnings:

  - The values [API] on the enum `FeeCategory` will be removed. If these variants are still used in the database, this will fail.
  - A unique constraint covering the columns `[category]` on the table `payment_fees` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "FeeCategory_new" AS ENUM ('DEPOSIT', 'WITHDRAWAL', 'TRANSFER', 'PAYMENT');
ALTER TABLE "payment_fees" ALTER COLUMN "category" TYPE "FeeCategory_new" USING ("category"::text::"FeeCategory_new");
ALTER TYPE "FeeCategory" RENAME TO "FeeCategory_old";
ALTER TYPE "FeeCategory_new" RENAME TO "FeeCategory";
DROP TYPE "public"."FeeCategory_old";
COMMIT;

-- AlterTable
ALTER TABLE "payment_fees" ALTER COLUMN "category" SET DEFAULT 'TRANSFER';

-- CreateIndex
CREATE UNIQUE INDEX "payment_fees_category_key" ON "payment_fees"("category");
