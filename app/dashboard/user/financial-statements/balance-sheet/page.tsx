import { getBalanceSheet } from "@/lib/actions/financial-statements";
import BalanceSheetReport from "@/components/user/BalanceSheetReport";
import type { Metadata } from "next";
import { getLastMonthRange } from "@/utils";

export const metadata: Metadata = {
  title: "Balance Sheet | ConnectPay payment gateway",
  description: "View your Statement of Financial Position",
};

const BalanceSheetPage = async (props: {
  searchParams?: Promise<{
    asOfDate?: string;
  }>;
}) => {
  const searchParams = await props.searchParams;

  // Default to end of last month if not provided
  const defaults = getLastMonthRange();

  // Format for the API and Input: YYYY-MM-DD
  const format = (d: Date) => d.toISOString().split("T")[0];

  const asOfDate = searchParams?.asOfDate || format(defaults.end);

  const data = await getBalanceSheet({ asOfDate });

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Statement of Financial Position
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-2">
          View your assets, liabilities, and equity as of a specific date.
        </p>
      </div>

      <BalanceSheetReport data={data} />
    </div>
  );
};

export default BalanceSheetPage;
