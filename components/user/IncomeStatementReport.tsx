"use client";

import { useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Calendar, Download, TrendingUp } from "lucide-react";
import { generateIncomeStatementPDF } from "@/utils/pdf-generator";

interface IncomeStatementData {
  period: {
    start: Date;
    end: Date;
  };
  revenues: { name: string; amount: number }[];
  totalRevenue: number;
  expenses: { name: string; amount: number }[];
  totalExpenses: number;
  netIncome: number;
}

const IncomeStatementReport = ({
  data,
}: {
  data: IncomeStatementData | null;
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  // console.log("IncomeStatementReport", data);
  // Format date for input (YYYY-MM-DD)
  const formatDate = (date: Date) => {
    try {
      return new Date(date).toISOString().split("T")[0];
    } catch (e) {
      return "";
    }
  };

  const defaultStart = data?.period.start ? formatDate(data.period.start) : "";
  const defaultEnd = data?.period.end ? formatDate(data.period.end) : "";

  const [startDate, setStartDate] = useState(
    searchParams.get("startDate") || defaultStart,
  );
  const [endDate, setEndDate] = useState(
    searchParams.get("endDate") || defaultEnd,
  );

  const handleFilter = () => {
    const params = new URLSearchParams(searchParams);
    if (startDate) params.set("startDate", startDate);
    else params.delete("startDate");
    if (endDate) params.set("endDate", endDate);
    else params.delete("endDate");
    router.push(`${pathname}?${params.toString()}`);
  };

  if (!data) {
    return (
      <div className="p-8 text-center text-gray-500 bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700">
        <p>No income statement data available for this period.</p>
      </div>
    );
  }

  const isProfit = data.netIncome >= 0;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Controls */}
      <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm flex flex-col md:flex-row gap-4 items-end md:items-center justify-between">
        <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-500 dark:text-gray-400">
              Start Date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="px-3 py-2 bg-gray-50 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-500 dark:text-gray-400">
              End Date
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="px-3 py-2 bg-gray-50 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>
          <button
            onClick={handleFilter}
            className="md:self-end px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2"
          >
            <Calendar size={16} />
            Update Report
          </button>
        </div>
        <button
          onClick={() => data && generateIncomeStatementPDF(data)}
          className="px-4 py-2 border border-gray-300 dark:border-slate-600 hover:bg-gray-50 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-lg transition-colors flex items-center gap-2"
        >
          <Download size={16} />
          Export PDF
        </button>
      </div>

      {/* Income Statement */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-200 dark:border-slate-700 bg-gray-50/50 dark:bg-slate-700/30">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <TrendingUp className="text-indigo-500" size={24} />
            Statement of Comprehensive Income
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            For the period {new Date(data.period.start).toLocaleDateString()} to{" "}
            {new Date(data.period.end).toLocaleDateString()}
          </p>
        </div>

        <div className="p-6 space-y-6">
          {/* Revenue */}
          <div>
            <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
              Revenue
            </h3>
            <div className="space-y-2">
              {data.revenues.map((item, idx) => (
                <div
                  key={idx}
                  className="flex justify-between items-center text-sm"
                >
                  <span className="text-gray-700 dark:text-gray-300">
                    {item.name}
                  </span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    UGX {item.amount.toLocaleString()}
                  </span>
                </div>
              ))}
              {data.revenues.length === 0 && (
                <p className="text-sm text-gray-400 italic">
                  No revenue recorded
                </p>
              )}
              <div className="pt-2 mt-2 border-t border-gray-100 dark:border-slate-700 flex justify-between items-center font-bold">
                <span className="text-gray-900 dark:text-white">
                  Total Revenue
                </span>
                <span className="text-green-600 dark:text-green-400">
                  UGX {data.totalRevenue.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Expenses */}
          <div>
            <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
              Expenses
            </h3>
            <div className="space-y-2">
              {data.expenses.map((item, idx) => (
                <div
                  key={idx}
                  className="flex justify-between items-center text-sm"
                >
                  <span className="text-gray-700 dark:text-gray-300">
                    {item.name}
                  </span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    UGX {item.amount.toLocaleString()}
                  </span>
                </div>
              ))}
              {data.expenses.length === 0 && (
                <p className="text-sm text-gray-400 italic">
                  No expenses recorded
                </p>
              )}
              <div className="pt-2 mt-2 border-t border-gray-100 dark:border-slate-700 flex justify-between items-center font-bold">
                <span className="text-gray-900 dark:text-white">
                  Total Expenses
                </span>
                <span className="text-red-500 dark:text-red-400">
                  (UGX {data.totalExpenses.toLocaleString()})
                </span>
              </div>
            </div>
          </div>

          {/* Net Income */}
          <div
            className={`p-4 rounded-lg mt-4 ${
              isProfit
                ? "bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800"
                : "bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800"
            }`}
          >
            <div className="flex justify-between items-center">
              <span
                className={`font-bold text-lg ${
                  isProfit
                    ? "text-green-800 dark:text-green-300"
                    : "text-red-800 dark:text-red-300"
                }`}
              >
                Net Income
              </span>
              <span
                className={`font-bold text-lg ${
                  isProfit
                    ? "text-green-800 dark:text-green-300"
                    : "text-red-800 dark:text-red-300"
                }`}
              >
                UGX {data.netIncome.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IncomeStatementReport;
