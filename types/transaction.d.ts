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
    totalIncome: number;
    totalSpent: number;
  };

  type AnalyticsProps = {
    cashFlowData: { name: string; income: number; spend: number }[];
    categoryData: { name: string; value: number; color: string }[];
    totalIncome: number;
    totalSpent: number;
  };
}

export {};
