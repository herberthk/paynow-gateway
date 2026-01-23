/*
  Warnings:

  - A unique constraint covering the columns `[adminId]` on the table `payment_audit_logs` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[transactionId]` on the table `payment_disputes` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[userId]` on the table `payment_disputes` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[userId]` on the table `payment_methods` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[userId]` on the table `payment_system_notifications` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[userId]` on the table `payment_transactions` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "payment_audit_logs_adminId_key" ON "payment_audit_logs"("adminId");

-- CreateIndex
CREATE UNIQUE INDEX "payment_disputes_transactionId_key" ON "payment_disputes"("transactionId");

-- CreateIndex
CREATE UNIQUE INDEX "payment_disputes_userId_key" ON "payment_disputes"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "payment_methods_userId_key" ON "payment_methods"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "payment_system_notifications_userId_key" ON "payment_system_notifications"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "payment_transactions_userId_key" ON "payment_transactions"("userId");
