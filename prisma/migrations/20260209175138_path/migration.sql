-- AlterTable
ALTER TABLE "payment_audit_logs" ADD COLUMN     "path" TEXT;

-- AlterTable
ALTER TABLE "payment_system_notifications" ADD COLUMN     "path" TEXT;
