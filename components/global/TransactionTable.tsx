"use client";
import React, { useState, useEffect } from "react";
import { generateTransactionReceiptPDF } from "@/utils/pdf-generator";
import {
  Search,
  Filter,
  Download,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Copy,
  FileText,
  AlertCircle,
  Share2,
  CheckCircle2,
  Clock,
  XCircle,
  CreditCard,
  Smartphone,
  Loader2,
} from "lucide-react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import Link from "next/link";

interface TransactionTableProps {
  transactions: Transaction[];
  limit?: number;
  onViewAll?: () => void;
  title?: string;
  totalPages?: number;
  currentPage?: number;
  totalTransactions?: number;
}

const TransactionTable: React.FC<TransactionTableProps> = ({
  title = "Recent Transactions",
  transactions,
  limit,
  totalPages = 1,
  currentPage = 1,
}) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const [filter, setFilter] = useState(searchParams.get("query") || "");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      const currentQuery = searchParams.get("query") || "";
      if (filter !== currentQuery) {
        const params = new URLSearchParams(searchParams);
        if (filter) {
          params.set("query", filter);
        } else {
          params.delete("query");
        }
        params.set("page", "1"); // Reset to page 1 on search
        router.push(`${pathname}?${params.toString()}`);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [filter, router, pathname, searchParams]);

  // Update filter if URL changes externally
  useEffect(() => {
    const query = searchParams.get("query");
    if (query !== null && query !== filter) {
      setFilter(query);
    }
  }, [searchParams]);

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", newPage.toString());
    router.push(`${pathname}?${params.toString()}`);
  };

  const currentTransactions = transactions; // Use props directly

  const getStatusColor = (status: TransactionStatus) => {
    switch (status) {
      case "COMPLETED":
        return "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400";
      case "PENDING":
        return "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400";
      case "FAILED":
        return "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400";
      case "DISPUTED":
        return "bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400";
      default:
        return "bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300";
    }
  };

  const getStatusIcon = (status: TransactionStatus) => {
    switch (status) {
      case "COMPLETED":
        return <CheckCircle2 size={16} className="mr-1.5" />;
      case "PENDING":
        return <Clock size={16} className="mr-1.5" />;
      case "FAILED":
        return <XCircle size={16} className="mr-1.5" />;
      case "DISPUTED":
        return <AlertCircle size={16} className="mr-1.5" />;
      default:
        return null;
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const copyToClipboard = (text: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopiedId(text);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDownloadReceipt = async (tx: Transaction) => {
    setDownloadingId(tx.id);

    // Simulate delay for generating PDF
    await new Promise((resolve) => setTimeout(resolve, 1500));

    try {
      generateTransactionReceiptPDF(tx);
    } catch (error) {
      console.error("PDF generation failed", error);
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm overflow-hidden flex flex-col h-full transition-colors">
      <div className="p-5 border-b border-gray-200 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h3 className="font-bold text-lg text-gray-900 dark:text-white">
          {title}
        </h3>
        <div className="flex gap-2">
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500"
              size={16}
            />
            <input
              type="text"
              placeholder="Search..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="pl-9 pr-4 py-2 bg-white dark:bg-slate-700 text-gray-900 dark:text-white border border-gray-300 dark:border-slate-600 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none w-full sm:w-64 placeholder-gray-500 dark:placeholder-gray-400"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={searchParams.get("type") || "ALL"}
              onChange={(e) => {
                const params = new URLSearchParams(searchParams);
                if (e.target.value === "ALL") {
                  params.delete("type");
                } else {
                  params.set("type", e.target.value);
                }
                params.set("page", "1");
                router.push(`${pathname}?${params.toString()}`);
              }}
              className="px-3 py-2 bg-white dark:bg-slate-700 text-gray-900 dark:text-white border border-gray-300 dark:border-slate-600 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            >
              <option value="ALL">All Types</option>
              <option value="DEPOSIT">Deposit</option>
              <option value="WITHDRAWAL">Withdrawal</option>
              <option value="TRANSFER">Transfer</option>
              <option value="PAYMENT">Payment</option>
            </select>

            <select
              value={searchParams.get("status") || "ALL"}
              onChange={(e) => {
                const params = new URLSearchParams(searchParams);
                if (e.target.value === "ALL") {
                  params.delete("status");
                } else {
                  params.set("status", e.target.value);
                }
                params.set("page", "1");
                router.push(`${pathname}?${params.toString()}`);
              }}
              className="px-3 py-2 bg-white dark:bg-slate-700 text-gray-900 dark:text-white border border-gray-300 dark:border-slate-600 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            >
              <option value="ALL">All Status</option>
              <option value="COMPLETED">Completed</option>
              <option value="PENDING">Pending</option>
              <option value="FAILED">Failed</option>
              <option value="DISPUTED">Disputed</option>
            </select>
          </div>
          <button className="p-2 border border-gray-300 dark:border-slate-600 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 text-gray-600 dark:text-gray-300 transition-colors">
            <Filter size={18} />
          </button>
          <button className="p-2 border border-gray-300 dark:border-slate-600 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 text-gray-600 dark:text-gray-300 transition-colors">
            <Download size={18} />
          </button>
        </div>
      </div>

      <div className="overflow-x-auto flex-1">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 dark:bg-slate-700/50 text-gray-500 dark:text-gray-400 font-medium border-b border-gray-200 dark:border-slate-700">
            <tr>
              <th className="px-6 py-4">Transaction Details</th>
              <th className="px-6 py-4">Category</th>
              <th className="px-6 py-4">Date</th>
              <th className="px-6 py-4">Amount</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 w-10"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
            {currentTransactions.map((tx) => (
              <React.Fragment key={tx.id}>
                <tr
                  onClick={() => toggleExpand(tx.id)}
                  className={`group cursor-pointer transition-all duration-200 border-l-4 ${
                    expandedId === tx.id
                      ? "bg-indigo-50/50 dark:bg-indigo-900/10 border-l-indigo-500"
                      : "hover:bg-gray-50 dark:hover:bg-slate-700/50 border-l-transparent"
                  }`}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                          tx.type === "DEPOSIT"
                            ? "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400"
                            : tx.type === "WITHDRAWAL"
                              ? "bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400"
                              : "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
                        }`}
                      >
                        {tx.method.includes("Mobile") ? (
                          <Smartphone size={18} />
                        ) : (
                          <CreditCard size={18} />
                        )}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white">
                          {tx.displayName}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {tx.method} • {tx.type}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-slate-700 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-slate-600">
                      {tx.category}
                    </span>
                  </td>
                  <td
                    className="px-6 py-4 text-gray-500 dark:text-gray-400"
                    suppressHydrationWarning
                  >
                    {new Date(tx.createdAt).toLocaleDateString()}
                    <div
                      className="text-xs text-gray-400 dark:text-gray-500"
                      suppressHydrationWarning
                    >
                      {new Date(tx.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`font-medium ${
                        tx.type === "WITHDRAWAL" ||
                        tx.type === "PAYMENT" ||
                        tx.type === "TRANSFER"
                          ? "text-gray-900 dark:text-white"
                          : "text-emerald-600 dark:text-emerald-400"
                      }`}
                    >
                      {tx.type === "WITHDRAWAL" ||
                      tx.type === "PAYMENT" ||
                      tx.type === "TRANSFER"
                        ? "-"
                        : "+"}
                      {tx.currency} {tx.amount.toLocaleString()}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(tx.status)}`}
                    >
                      {getStatusIcon(tx.status)}
                      {tx.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-400">
                    {expandedId === tx.id ? (
                      <ChevronUp size={20} />
                    ) : (
                      <ChevronDown size={20} />
                    )}
                  </td>
                </tr>

                {/* Expanded Details Row */}
                {expandedId === tx.id && (
                  <tr className="bg-gray-50/50 dark:bg-slate-800/50">
                    <td colSpan={6} className="px-6 py-0">
                      <div className="py-6 border-t border-dashed border-gray-200 dark:border-slate-700 animate-fade-in-up">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                          {/* Col 1: Transaction Summary */}
                          <div className="space-y-4">
                            <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
                              Transaction Reference
                            </h4>
                            <div className="flex items-center gap-2 bg-white dark:bg-slate-900 p-2 rounded border border-gray-200 dark:border-slate-700 w-fit">
                              <code className="text-xs font-mono text-gray-700 dark:text-gray-300">
                                {tx.txn_ref}
                              </code>
                              <button
                                onClick={(e) => copyToClipboard(tx.txn_ref!, e)}
                                className="text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                                title="Copy ID"
                              >
                                {copiedId === tx.txn_ref ? (
                                  <CheckCircle2
                                    size={14}
                                    className="text-green-500"
                                  />
                                ) : (
                                  <Copy size={14} />
                                )}
                              </button>
                            </div>

                            <div className="space-y-1">
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                Payment Method
                              </p>
                              <p className="text-sm font-medium text-gray-900 dark:text-white flex items-center gap-2">
                                {tx.method.includes("Mobile") ? (
                                  <Smartphone
                                    size={16}
                                    className="text-gray-400"
                                  />
                                ) : (
                                  <CreditCard
                                    size={16}
                                    className="text-gray-400"
                                  />
                                )}
                                {tx.method}
                              </p>
                            </div>

                            <div className="space-y-1">
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                Sender
                              </p>
                              <p className="text-sm font-medium text-gray-900 dark:text-white">
                                {tx.displayName}
                              </p>
                            </div>
                          </div>

                          {/* Col 2: Financial Details */}
                          <div className="space-y-4">
                            <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
                              Financials
                            </h4>
                            <div className="space-y-3">
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-600 dark:text-gray-400">
                                  Amount
                                </span>
                                <span className="font-medium text-gray-900 dark:text-white">
                                  {tx.currency} {tx.amount.toLocaleString()}
                                </span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-600 dark:text-gray-400">
                                  Fee
                                </span>
                                <span className="font-medium text-gray-900 dark:text-white">
                                  {tx.currency} {tx.fee.toLocaleString()}
                                </span>
                              </div>
                              <div className="flex justify-between text-sm pt-2 border-t border-gray-200 dark:border-slate-700">
                                <span className="font-bold text-gray-900 dark:text-white">
                                  Total
                                </span>
                                <span className="font-bold text-indigo-600 dark:text-indigo-400">
                                  {tx.currency}{" "}
                                  {(tx.amount * 1.01).toLocaleString()}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Col 3: Actions */}
                          <div className="flex flex-col gap-3 justify-center">
                            <button
                              onClick={() => handleDownloadReceipt(tx)}
                              disabled={downloadingId === tx.id}
                              className="flex items-center justify-center gap-2 w-full py-2 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-600 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                              {downloadingId === tx.id ? (
                                <Loader2 size={16} className="animate-spin" />
                              ) : (
                                <FileText size={16} />
                              )}
                              {downloadingId === tx.id
                                ? "Generating PDF..."
                                : "Download Receipt"}
                            </button>
                            <button className="flex items-center justify-center gap-2 w-full py-2 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-600 transition-colors">
                              <Share2 size={16} />
                              Share Details
                            </button>
                            <button className="flex items-center justify-center gap-2 w-full py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-sm font-medium transition-colors">
                              <AlertCircle size={16} />
                              Report Issue
                            </button>
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
            {currentTransactions.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="px-6 py-8 text-center text-gray-500 dark:text-gray-400"
                >
                  {transactions.length === 0 && !filter ? (
                    <div className="flex flex-col items-center gap-4">
                      <p>No transactions found. database is empty.</p>
                      <button
                        // onClick={handleSeed}
                        disabled={downloadingId === "seeding"}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                      >
                        {downloadingId === "seeding"
                          ? "Seeding..."
                          : "Seed Mock Data"}
                      </button>
                    </div>
                  ) : (
                    "No transactions found matching your criteria."
                  )}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="bg-gray-50 dark:bg-slate-700/30 px-6 py-4 border-t border-gray-200 dark:border-slate-700">
        {limit ? (
          <Link
            href="/dashboard/user/transactions"
            className="w-full text-indigo-600 dark:text-indigo-400 text-sm font-medium hover:text-indigo-800 dark:hover:text-indigo-300 transition-colors text-center block"
          >
            View All Transactions
          </Link>
        ) : (
          <div className="flex items-center justify-between">
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
              Showing{" "}
              <span className="font-medium">{(currentPage - 1) * 8 + 1}</span>{" "}
              to{" "}
              <span className="font-medium">
                {Math.min(
                  currentPage * 8, // Assuming limit is 8 in action call
                  currentPage * 8 -
                    currentTransactions.length +
                    currentTransactions.length +
                    (totalPages > currentPage ? 1 : 0), // tricky to get total count here without prop
                )}
                {/* Better to use totalTransactions prop if we had it, but we can infer or pass it */}
              </span>{" "}
              of{" "}
              <span className="font-medium">
                {totalPages * 8} {/* Approximation */}
              </span>{" "}
              results
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="p-1.5 sm:p-2 border border-gray-300 dark:border-slate-600 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed text-gray-600 dark:text-gray-300 transition-colors"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={() =>
                  handlePageChange(Math.min(totalPages, currentPage + 1))
                }
                disabled={currentPage === totalPages}
                className="p-1.5 sm:p-2 border border-gray-300 dark:border-slate-600 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed text-gray-600 dark:text-gray-300 transition-colors"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TransactionTable;
