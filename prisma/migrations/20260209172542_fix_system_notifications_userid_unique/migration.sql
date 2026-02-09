-- DropIndex
DROP INDEX "payment_audit_logs_adminId_key";

-- DropIndex
DROP INDEX "payment_disputes_userId_key";

-- DropIndex
DROP INDEX "payment_transactions_userId_key";

-- CreateIndex
CREATE INDEX "payment_audit_logs_adminId_idx" ON "payment_audit_logs"("adminId");

-- CreateIndex
CREATE INDEX "payment_disputes_userId_idx" ON "payment_disputes"("userId");

-- CreateIndex
CREATE INDEX "payment_system_notifications_userId_idx" ON "payment_system_notifications"("userId");

-- CreateIndex
CREATE INDEX "payment_transactions_userId_idx" ON "payment_transactions"("userId");
