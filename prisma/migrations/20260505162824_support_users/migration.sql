-- CreateTable
CREATE TABLE "support_users" (
    "id" TEXT NOT NULL,
    "fromUserId" INTEGER NOT NULL,
    "toUserId" INTEGER NOT NULL,
    "reference" TEXT NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "currency" "Currency" NOT NULL DEFAULT 'UGX',
    "paymentMethod" "PaymentMethodType" NOT NULL DEFAULT 'MOBILE_MONEY',
    "reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "support_users_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "support_users_fromUserId_idx" ON "support_users"("fromUserId");

-- CreateIndex
CREATE INDEX "support_users_toUserId_idx" ON "support_users"("toUserId");

-- CreateIndex
CREATE INDEX "support_users_reference_idx" ON "support_users"("reference");

-- CreateIndex
CREATE INDEX "support_users_createdAt_idx" ON "support_users"("createdAt");
