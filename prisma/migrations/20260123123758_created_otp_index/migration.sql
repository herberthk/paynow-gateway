/*
  Warnings:

  - A unique constraint covering the columns `[otp]` on the table `Payment_otp` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Payment_otp_otp_key" ON "Payment_otp"("otp");
