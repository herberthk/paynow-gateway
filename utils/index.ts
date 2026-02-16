export * from "./helpers";

// Helper to get date range for "Last Month" default
export const getLastMonthRange = () => {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const end = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
  return { start, end };
};

export const formatPercentLabel = (value: string | number) => {
  const result = Number(value) * 100;
  return `${parseFloat(result.toFixed(2))}`;
};

export const formatCurrency = (value: string | number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "UGX",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Number(value));
