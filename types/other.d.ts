declare global {
  type TransactionReason = "wallet_topup" | "payment" | "transfer" | "support";

  type StripePaymentRequestBody = {
    userId: number;
    amount: number;
    baseAmount: number;
    type: TransactionReason;
    toUserId?: number;
    fromUserId?: number;
  };

  type TransferMobileRequestBody = {
    userId: number;
    amount: number;
  };
}

export {};
