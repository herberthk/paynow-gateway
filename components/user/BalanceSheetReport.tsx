"use client";

import { useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Calendar, Download, Wallet } from "lucide-react";
import { generateBalanceSheetPDF } from "@/utils/pdf-generator";

interface BalanceSheetData {
  asOf: Date;
  assets: { name: string; amount: number }[];
  totalAssets: number;
  liabilities: { name: string; amount: number }[];
  totalLiabilities: number;
  equity: { name: string; amount: number }[];
  totalEquity: number;
}

const BalanceSheetReport = ({ data }: { data: BalanceSheetData | null }) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Format date for input (YYYY-MM-DD)
  const formatDate = (date: Date) => {
    try {
      return new Date(date).toISOString().split("T")[0];
    } catch (e) {
      return "";
    }
  };

  // Balance sheet uses 'asOf' date, typically 'endDate' semantics
  const defaultDate = data?.asOf ? formatDate(data.asOf) : "";

  const [date, setDate] = useState(searchParams.get("asOfDate") || defaultDate);

  const handleFilter = () => {
    const params = new URLSearchParams(searchParams);
    if (date) params.set("asOfDate", date);
    else params.delete("asOfDate");
    router.push(`${pathname}?${params.toString()}`);
  };

  if (!data) {
    return (
      <div className="p-8 text-center text-gray-500 bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700">
        <p>No balance sheet data available for this date.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Controls */}
      <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm flex flex-col md:flex-row gap-4 items-end md:items-center justify-between">
        <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-500 dark:text-gray-400">
              As Of Date
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
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
          onClick={() => data && generateBalanceSheetPDF(data)}
          className="px-4 py-2 border border-gray-300 dark:border-slate-600 hover:bg-gray-50 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-lg transition-colors flex items-center gap-2"
        >
          <Download size={16} />
          Export PDF
        </button>
      </div>

      {/* Balance Sheet */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-200 dark:border-slate-700 bg-gray-50/50 dark:bg-slate-700/30">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Wallet className="text-blue-500" size={24} />
            Statement of Financial Position
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            As of {new Date(data.asOf).toLocaleDateString()}
          </p>
        </div>

        <div className="p-6 space-y-6">
          {/* Assets */}
          <div>
            <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
              Assets
            </h3>
            <div className="space-y-2">
              {data.assets.map((item, idx) => (
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
              <div className="pt-2 mt-2 border-t border-gray-100 dark:border-slate-700 flex justify-between items-center font-bold">
                <span className="text-gray-900 dark:text-white">
                  Total Assets
                </span>
                <span className="text-blue-600 dark:text-blue-400">
                  UGX {data.totalAssets.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Liabilities */}
          <div>
            <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
              Liabilities
            </h3>
            <div className="space-y-2">
              {data.liabilities.length > 0 ? (
                data.liabilities.map((item, idx) => (
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
                ))
              ) : (
                <p className="text-sm text-gray-400 italic">
                  No liabilities recorded
                </p>
              )}
              <div className="pt-2 mt-2 border-t border-gray-100 dark:border-slate-700 flex justify-between items-center font-bold">
                <span className="text-gray-900 dark:text-white">
                  Total Liabilities
                </span>
                <span className="text-gray-900 dark:text-white">
                  UGX {data.totalLiabilities.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Equity */}
          <div>
            <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
              Equity
            </h3>
            <div className="space-y-2">
              {data.equity.map((item, idx) => (
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
              <div className="pt-2 mt-2 border-t border-gray-100 dark:border-slate-700 flex justify-between items-center font-bold">
                <span className="text-gray-900 dark:text-white">
                  Total Equity
                </span>
                <span className="text-purple-600 dark:text-purple-400">
                  UGX {data.totalEquity.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t-2 border-gray-200 dark:border-slate-600 flex justify-between items-center font-bold text-lg">
            <span className="text-gray-900 dark:text-white">
              Total Liabilities & Equity
            </span>
            <span className="text-gray-900 dark:text-white">
              UGX {(data.totalLiabilities + data.totalEquity).toLocaleString()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BalanceSheetReport;
