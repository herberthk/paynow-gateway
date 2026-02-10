/*
  Warnings:

  - You are about to drop the column `userId` on the `payment_system_notifications` table. All the data in the column will be lost.
  - Added the required column `fromUserId` to the `payment_system_notifications` table without a default value. This is not possible if the table is not empty.
  - Added the required column `toUserId` to the `payment_system_notifications` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "payment_system_notifications" DROP CONSTRAINT "payment_system_notifications_userId_fkey";

-- DropIndex
DROP INDEX "payment_system_notifications_userId_type_idx";

-- AlterTable
ALTER TABLE "payment_system_notifications" DROP COLUMN "userId",
ADD COLUMN     "fromUserId" INTEGER NOT NULL,
ADD COLUMN     "toUserId" INTEGER NOT NULL;

-- CreateIndex
CREATE INDEX "payment_system_notifications_fromUserId_type_toUserId_idx" ON "payment_system_notifications"("fromUserId", "type", "toUserId");
