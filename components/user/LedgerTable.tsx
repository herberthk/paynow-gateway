"use client";
import React, { useEffect, useState } from "react";
import {
  Search,
  Filter,
  Download,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

interface LedgerTableProps {
  entries: LedgerEntry[]; // Define LedgerEntry type or import it
  limit?: number;
  totalPages?: number;
  currentPage?: number;
  totalEntries?: number;
}

// Minimal type definition if not available globally yet
type LedgerEntry = {
  id: string;
  // transactionId: string;
  userId: number;
  type: "DEBIT" | "CREDIT";
  amount: number;
  // account: string;
  reason: string | null;
  // balanceAfter: number;
  createdAt: string;
  refference: string;
};

const LedgerTable: React.FC<LedgerTableProps> = ({
  entries,
  limit,
  totalPages = 1,
  currentPage = 1,
  totalEntries = 0,
}) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  // Local state for filters to avoid constant URL updates on typing
  const [query, setQuery] = useState(searchParams.get("query") || "");
  const [startDate, setStartDate] = useState(
    searchParams.get("startDate") || "",
  );
  const [endDate, setEndDate] = useState(searchParams.get("endDate") || "");
  const [minAmount, setMinAmount] = useState(
    searchParams.get("minAmount") || "",
  );
  const [maxAmount, setMaxAmount] = useState(
    searchParams.get("maxAmount") || "",
  );
  const [type, setType] = useState(searchParams.get("type") || "ALL");
  const [account, setAccount] = useState(searchParams.get("account") || "ALL");
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Debounce search and apply filters
  useEffect(() => {
    const timer = setTimeout(() => {
      const params = new URLSearchParams(searchParams);
      if (query) params.set("query", query);
      else params.delete("query");

      if (startDate) params.set("startDate", startDate);
      else params.delete("startDate");

      if (endDate) params.set("endDate", endDate);
      else params.delete("endDate");

      if (minAmount) params.set("minAmount", minAmount);
      else params.delete("minAmount");

      if (maxAmount) params.set("maxAmount", maxAmount);
      else params.delete("maxAmount");

      if (type && type !== "ALL") params.set("type", type);
      else params.delete("type");

      if (account && account !== "ALL") params.set("account", account);
      else params.delete("account");

      params.set("page", "1"); // Reset to page 1 on filter change

      // Only push if params changed from current URL to avoid loops/redundant pushes
      if (params.toString() !== searchParams.toString()) {
        router.push(`${pathname}?${params.toString()}`);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [
    query,
    startDate,
    endDate,
    minAmount,
    maxAmount,
    type,
    account,
    router,
    pathname,
    searchParams,
  ]);

  // Handle CSV Download
  const handleDownload = () => {
    if (!entries.length) return;

    // Define CSV headers
    const headers = [
      "Date",
      "Time",
      "Reference",
      "Description",
      "Account",
      "Type",
      "Amount (UGX)",
    ];

    // Map entries to CSV rows
    const csvRows = entries.map((entry) => {
      const date = new Date(entry.createdAt).toLocaleDateString();
      const time = new Date(entry.createdAt).toLocaleTimeString();
      return [
        date,
        time,
        entry.refference || "N/A",
        `"${(entry.reason || "").replace(/"/g, '""')}"`, // Escape quotes
        // entry.account,
        entry.type,
        entry.amount,
      ].join(",");
    });

    // Combine headers and rows
    const csvContent = [headers.join(","), ...csvRows].join("\n");

    // Create a blob and trigger download
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute(
      "download",
      `ledger_export_${new Date().toISOString().split("T")[0]}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm flex flex-col h-full transition-colors">
      <div className="p-5 border-b border-gray-200 dark:border-slate-700 flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h3 className="font-bold text-lg text-gray-900 dark:text-white flex items-center gap-2">
            Ledger Book
            <span className="text-xs font-normal text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-slate-700 px-2 py-0.5 rounded-full">
              {totalEntries} entries
            </span>
          </h3>
          <div className="flex gap-2">
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500"
                size={16}
              />
              <input
                type="text"
                placeholder="Search description, ref..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="pl-9 pr-4 py-2 bg-white dark:bg-slate-700 text-gray-900 dark:text-white border border-gray-300 dark:border-slate-600 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none w-full sm:w-64 placeholder-gray-500 dark:placeholder-gray-400"
              />
            </div>
            <button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className={`p-2 border rounded-lg transition-colors flex items-center gap-2 text-sm font-medium ${
                isFilterOpen
                  ? "bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-400"
                  : "border-gray-300 dark:border-slate-600 hover:bg-gray-50 dark:hover:bg-slate-700 text-gray-600 dark:text-gray-300"
              }`}
            >
              <Filter size={18} />
              Filters
            </button>
            <button
              onClick={handleDownload}
              className="p-2 border border-gray-300 dark:border-slate-600 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 text-gray-600 dark:text-gray-300 transition-colors"
              title="Download CSV"
            >
              <Download size={18} />
            </button>
          </div>
        </div>

        {/* Expanded Filters */}
        {isFilterOpen && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-gray-100 dark:border-slate-700/50 animate-in fade-in slide-in-from-top-2">
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-500 dark:text-gray-400">
                Date Range
              </label>
              <div className="flex gap-2">
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-700 text-gray-900 dark:text-white border border-gray-300 dark:border-slate-600 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-700 text-gray-900 dark:text-white border border-gray-300 dark:border-slate-600 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-500 dark:text-gray-400">
                Amount Range
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={minAmount}
                  onChange={(e) => setMinAmount(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-700 text-gray-900 dark:text-white border border-gray-300 dark:border-slate-600 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
                <input
                  type="number"
                  placeholder="Max"
                  value={maxAmount}
                  onChange={(e) => setMaxAmount(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-700 text-gray-900 dark:text-white border border-gray-300 dark:border-slate-600 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-500 dark:text-gray-400">
                Entry Type
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-slate-700 text-gray-900 dark:text-white border border-gray-300 dark:border-slate-600 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              >
                <option value="ALL">All Types</option>
                <option value="DEBIT">Debit</option>
                <option value="CREDIT">Credit</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-500 dark:text-gray-400">
                Account
              </label>
              <select
                value={account}
                onChange={(e) => setAccount(e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-slate-700 text-gray-900 dark:text-white border border-gray-300 dark:border-slate-600 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              >
                <option value="ALL">All Accounts</option>
                <option value="Wallet">Wallet</option>
                <option value="Income">Income</option>
                <option value="Expense">Expense</option>
                <option value="Transfer Out">Transfer Out</option>
                <option value="Transfer In">Transfer In</option>
                <option value="Payment">Payment</option>
                <option value="Sales/Revenue">Sales/Revenue</option>
                <option value="Bank/External">Bank/External</option>
              </select>
            </div>
          </div>
        )}
      </div>

      <div className="overflow-x-auto flex-1 w-full">
        <table className="w-full text-sm text-left border-collapse min-w-[800px]">
          <thead className="bg-gray-50 dark:bg-slate-700/50 text-gray-500 dark:text-gray-400 font-medium border-b border-gray-200 dark:border-slate-700 sticky top-0 z-10">
            <tr>
              <th className="px-6 py-4 whitespace-nowrap">DATE</th>
              <th className="px-6 py-4 whitespace-nowrap">REFERENCE</th>
              <th className="px-6 py-4 whitespace-nowrap w-auto">
                DESCRIPTION
              </th>
              {/* <th className="px-6 py-4 whitespace-nowrap">ACCOUNT</th> */}
              <th className="pr-2 text-right py-4 whitespace-nowrap bg-gray-50 dark:bg-slate-700/50">
                DEBIT(UGX)
              </th>
              <th className="pr-2 text-right py-4 whitespace-nowrap bg-gray-50 dark:bg-slate-700/50">
                CREDIT(UGX)
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
            {entries && entries.length > 0 ? (
              entries.map((entry) => (
                <tr
                  key={entry.id}
                  className="hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors group"
                >
                  <td className="px-6 py-4 text-gray-500 dark:text-gray-400 whitespace-nowrap">
                    <span className="block text-gray-900 dark:text-gray-200 font-medium">
                      {new Date(entry.createdAt).toLocaleDateString()}
                    </span>
                    <span className="text-xs text-gray-400 dark:text-gray-500 block">
                      {new Date(entry.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-mono text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-slate-800 px-2 py-1 rounded select-all">
                      {entry.refference || "N/A"}
                    </span>
                  </td>
                  <td
                    className="px-6 py-4 text-gray-700 dark:text-gray-300 font-medium truncate"
                    title={entry.reason || ""}
                  >
                    {entry.reason || "-"}
                  </td>
                  {/* <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border
                      ${
                        entry.account === "Wallet"
                          ? "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800"
                          : entry.account.includes("Transfer")
                            ? "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/20 dark:text-purple-300 dark:border-purple-800"
                            : "bg-gray-100 text-gray-700 border-gray-200 dark:bg-slate-700 dark:text-gray-300 dark:border-slate-600"
                      }`}
                    >
                      {entry.account}
                    </span>
                  </td> */}
                  <td
                    className={`pr-2 py-4 text-right font-medium relative ${entry.type === "DEBIT" ? "bg-red-50/30 dark:bg-red-900/5" : ""}`}
                  >
                    {entry.type === "DEBIT" ? (
                      <span className="text-gray-900 dark:text-white">
                        {/* <span className="text-xs text-gray-400 mr-1">UGX</span> */}
                        {entry.amount.toLocaleString()}
                      </span>
                    ) : (
                      <span className="text-gray-300 dark:text-gray-600 text-center">
                        -
                      </span>
                    )}
                  </td>
                  <td
                    className={`pr-2 py-4 text-right font-medium relative ${entry.type === "CREDIT" ? "bg-green-50/30 dark:bg-green-900/5" : ""}`}
                  >
                    {entry.type === "CREDIT" ? (
                      <span className="text-gray-900 dark:text-white">
                        {/* <span className="text-xs text-gray-400 mr-1">UGX</span> */}
                        {entry.amount.toLocaleString()}
                      </span>
                    ) : (
                      <span className="text-gray-300 dark:text-gray-600 text-center">
                        -
                      </span>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={6}
                  className=" py-12 text-center text-gray-500 dark:text-gray-400"
                >
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Search
                      className="text-gray-300 dark:text-slate-600"
                      size={32}
                    />
                    <p>No ledger entries found matching your criteria.</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="bg-gray-50 dark:bg-slate-700/30 px-6 py-4 border-t border-gray-200 dark:border-slate-700">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
            Showing page <span className="font-medium">{currentPage}</span> of{" "}
            <span className="font-medium">{totalPages}</span>
          </p>
          <div className="flex gap-2">
            <Link
              href={{
                pathname: pathname,
                query: {
                  ...Object.fromEntries(searchParams.entries()),
                  page: Math.max(1, currentPage - 1),
                },
              }}
              className={`p-1.5 sm:p-2 border border-gray-300 dark:border-slate-600 rounded-lg transition-all
                ${
                  currentPage <= 1
                    ? "opacity-50 cursor-not-allowed bg-gray-50 dark:bg-slate-800"
                    : "hover:bg-white dark:hover:bg-slate-600 bg-white dark:bg-slate-700 shadow-sm"
                }`}
            >
              <ChevronLeft size={16} />
            </Link>
            <Link
              href={{
                pathname: pathname,
                query: {
                  ...Object.fromEntries(searchParams.entries()),
                  page: Math.min(totalPages, currentPage + 1),
                },
              }}
              className={`p-1.5 sm:p-2 border border-gray-300 dark:border-slate-600 rounded-lg transition-all
                ${
                  currentPage >= totalPages
                    ? "opacity-50 cursor-not-allowed bg-gray-50 dark:bg-slate-800"
                    : "hover:bg-white dark:hover:bg-slate-600 bg-white dark:bg-slate-700 shadow-sm"
                }`}
            >
              <ChevronRight size={16} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LedgerTable;
