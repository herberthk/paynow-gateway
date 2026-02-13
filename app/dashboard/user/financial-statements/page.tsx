import Link from "next/link";
import { TrendingUp, Wallet, ArrowRight } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Financial Statements | PayNow",
  description: "View your financial reports",
};

export default function FinancialStatementsHub() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Financial Statements
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-2">
          Select a report to view.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link
          href="/dashboard/user/financial-statements/income-statement"
          className="group block p-6 bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-all hover:border-indigo-500 dark:hover:border-indigo-500"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg group-hover:bg-indigo-100 dark:group-hover:bg-indigo-900/40 transition-colors">
              <TrendingUp
                className="text-indigo-600 dark:text-indigo-400"
                size={24}
              />
            </div>
            <ArrowRight
              className="text-gray-400 group-hover:text-indigo-500 group-hover:translate-x-1 transition-all"
              size={20}
            />
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            Income Statement
          </h2>
          <p className="text-gray-500 dark:text-gray-400">
            View your comprehensive income, including revenue, expenses, and net
            profit over time.
          </p>
        </Link>

        <Link
          href="/dashboard/user/financial-statements/balance-sheet"
          className="group block p-6 bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-all hover:border-blue-500 dark:hover:border-blue-500"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg group-hover:bg-blue-100 dark:group-hover:bg-blue-900/40 transition-colors">
              <Wallet className="text-blue-600 dark:text-blue-400" size={24} />
            </div>
            <ArrowRight
              className="text-gray-400 group-hover:text-blue-500 group-hover:translate-x-1 transition-all"
              size={20}
            />
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            Statement of Financial Position
          </h2>
          <p className="text-gray-500 dark:text-gray-400">
            View your assets, liabilities, and equity as of a specific date.
          </p>
        </Link>
      </div>
    </div>
  );
}
