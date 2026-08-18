import { getIncomeStatement } from "@/lib/actions/financial-statements";
import IncomeStatementReport from "@/components/user/IncomeStatementReport";
import type { Metadata } from "next";
import { getLastMonthRange } from "@/utils";

export const metadata: Metadata = {
  title: "Income Statement | ConnectPay payment gateway",
  description: "View your Comprehensive Income Statement",
};

const IncomeStatementPage = async (props: {
  searchParams?: Promise<{
    startDate?: string;
    endDate?: string;
  }>;
}) => {
  const searchParams = await props.searchParams;

  // Default to last month if not provided
  const defaults = getLastMonthRange();

  // Format for the API and Input: YYYY-MM-DD
  const format = (d: Date) => d.toISOString().split("T")[0];

  const startDate = searchParams?.startDate || format(defaults.start);
  const endDate = searchParams?.endDate || format(defaults.end);

  const data = await getIncomeStatement({ startDate, endDate });

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Income Statement
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-2">
          View your revenues, expenses, and net income for a specific period.
        </p>
      </div>

      <IncomeStatementReport data={data} />
    </div>
  );
};

export default IncomeStatementPage;
