/*
  Warnings:

  - You are about to drop the column `expired` on the `Payment_otp` table. All the data in the column will be lost.
  - You are about to drop the column `otp` on the `Payment_otp` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[userId]` on the table `Payment_otp` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `otpHash` to the `Payment_otp` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `Payment_otp` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Payment_otp_otp_key";

-- AlterTable
ALTER TABLE "Payment_otp" DROP COLUMN "expired",
DROP COLUMN "otp",
ADD COLUMN     "attempts" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "otpHash" TEXT NOT NULL,
ADD COLUMN     "userId" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Payment_otp_userId_key" ON "Payment_otp"("userId");

-- AddForeignKey
ALTER TABLE "Payment_otp" ADD CONSTRAINT "Payment_otp_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
