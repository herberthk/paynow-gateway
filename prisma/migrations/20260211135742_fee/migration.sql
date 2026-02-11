/*
  Warnings:

  - Made the column `path` on table `payment_system_notifications` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "payment_system_notifications" ALTER COLUMN "path" SET NOT NULL;

-- AlterTable
ALTER TABLE "payment_transactions" ADD COLUMN     "fee" INTEGER NOT NULL DEFAULT 0;
