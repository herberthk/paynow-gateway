-- AlterTable
ALTER TABLE "payment_wallets" ADD COLUMN     "paymentMethod" "PaymentMethodType" NOT NULL DEFAULT 'MOBILE_MONEY';

-- CreateIndex
CREATE INDEX "payment_wallets_paymentMethod_idx" ON "payment_wallets"("paymentMethod");
