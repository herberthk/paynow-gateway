declare global {
  type CashFlowData = {
    name: string; // Date (e.g., "Mon", "Tue" or "Jan 1")
    income: number;
    spend: number;
  };

  type CategoryData = {
    name: string;
    value: number;
    color: string;
  };

  type AnalyticsData = {
    cashFlow: CashFlowData[];
    categories: CategoryData[];
    incomeCategories: CategoryData[];
    totalIncome: number;
    totalSpent: number;
  };

  type AnalyticsProps = {
    userId: number;
    cashFlowData: { name: string; income: number; spend: number }[];
    categoryData: { name: string; value: number; color: string }[];
    incomeCategoryData: { name: string; value: number; color: string }[];
    totalIncome: number;
    totalSpent: number;
  };

  type RecipientUser = {
    id: number;
    name: string | null;
    email: string | null;
    tel: string | null;
    walletId: string;
  };

  type PreviewTransaction = {
    amount: number;
    currency: string;
    txn_ref: string;
    fee: number;
  };

  type WalletResult = {
    success: boolean;
    balance: number;
  };

  type FinancialData = {
    name: string;
    revenue: number;
    volume: number;
    previous: number;
  };
  type FeeCategory =
    | "DEPOSIT"
    | "WITHDRAWAL"
    | "TRANSFER"
    | "PAYMENT"
    | "SUPPORT";
  type FeeType = "FIXED" | "PERCENTAGE";

  type PaymentMethodType = "CARD" | "MOBILE_MONEY" | "BANK";
}

export {};
