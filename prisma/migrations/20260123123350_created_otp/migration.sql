-- CreateTable
CREATE TABLE "Payment_otp" (
    "id" TEXT NOT NULL,
    "otp" TEXT NOT NULL,
    "expired" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Payment_otp_pkey" PRIMARY KEY ("id")
);
