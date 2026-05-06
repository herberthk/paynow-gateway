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

  type SupportHistory = {
    amount: number;
    senderName: string;
    senderEmail: string | null | undefined;
    recipientName: string;
    recipientEmail: string | null | undefined;
    type: string;
    toUserId: number;
    fromUserId: number;
    reason: string | null;
    paymentMethod: PaymentMethodType;
    id: string;
    reference: string;
    currency: Currency;
    createdAt: Date;
    updatedAt: Date;
  };

  type SupportHistoryResponse = {
    success: boolean;
    message?: string;
    data: SupportHistory[];
    pagination: {
      total: number;
      page: number;
      pageSize: number;
      totalPages: number;
    };
  };
}

export {};
