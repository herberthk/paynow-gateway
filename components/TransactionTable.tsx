"use client";
import React, { useState, useEffect } from "react";

import { jsPDF } from "jspdf";
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
import Link from "next/link";

interface TransactionTableProps {
  transactions: Transaction[];
  limit?: number;
  onViewAll?: () => void;
  title?: string;
}

const TransactionTable: React.FC<TransactionTableProps> = ({
  transactions,
  limit,
  title = "Recent Transactions",
}) => {
  const [filter, setFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const itemsPerPage = 8;

  // Reset to first page when filter changes
  useEffect(() => {
    setCurrentPage(1);
    setExpandedId(null);
  }, [filter]);

  const filteredTransactions = transactions.filter(
    (t) =>
      t.recipient.toLowerCase().includes(filter.toLowerCase()) ||
      t.method.toLowerCase().includes(filter.toLowerCase()),
  );

  // Pagination Logic
  const totalPages = limit
    ? 1
    : Math.ceil(filteredTransactions.length / itemsPerPage);

  const displayedTransactions = limit
    ? filteredTransactions.slice(0, limit)
    : filteredTransactions.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage,
      );

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
      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      // --- Styling Constants ---
      const primaryColor = "#4F46E5"; // Indigo 600
      const secondaryColor = "#111827"; // Gray 900
      const grayColor = "#6B7280"; // Gray 500
      const lightGray = "#F9FAFB"; // Gray 50

      // --- Header Background ---
      doc.setFillColor(primaryColor);
      doc.rect(0, 0, 210, 50, "F");

      // --- Logo / Branding ---
      doc.setTextColor("#FFFFFF");
      doc.setFontSize(26);
      doc.setFont("helvetica", "bold");
      doc.text("PayNow", 20, 28);

      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text("Enterprise Payment Gateway", 20, 36);

      // --- Receipt Label ---
      doc.setFontSize(14);
      doc.text("TRANSACTION RECEIPT", 190, 28, { align: "right" });
      doc.setFontSize(10);
      doc.text(`#${tx.id}`, 190, 36, { align: "right" });

      // --- Main Content Start ---
      let y = 75;

      // --- Status Badge ---
      const statusColor =
        tx.status === "COMPLETED"
          ? "#10B981"
          : tx.status === "FAILED"
            ? "#EF4444"
            : "#F59E0B";
      doc.setDrawColor(statusColor);
      doc.setFillColor(statusColor);
      // Small rounded rectangle for status
      doc.roundedRect(85, 55, 40, 8, 2, 2, "F");

      doc.setTextColor("#FFFFFF");
      doc.setFontSize(9);
      doc.setFont("helvetica", "bold");
      doc.text(tx.status, 105, 60, { align: "center" });

      // --- Main Amount ---
      doc.setTextColor(primaryColor);
      doc.setFontSize(40);
      doc.setFont("helvetica", "bold");
      const amountString = `${tx.currency} ${tx.amount.toLocaleString()}`;
      doc.text(amountString, 105, y, { align: "center" });

      y += 10;
      doc.setTextColor(grayColor);
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text(new Date(tx.date).toLocaleString(), 105, y, { align: "center" });

      y += 20;

      // --- Divider ---
      doc.setDrawColor("#E5E7EB");
      doc.line(20, y, 190, y);
      y += 15;

      // --- Transaction Details Grid ---
      const addRow = (label: string, value: string) => {
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        doc.setTextColor(grayColor);
        doc.text(label, 20, y);

        doc.setFont("helvetica", "bold");
        doc.setTextColor(secondaryColor);
        doc.text(value, 190, y, { align: "right" });
        y += 12; // increased spacing
      };

      addRow("Recipient", tx.recipient);
      addRow("Category", tx.category);
      addRow("Payment Method", tx.method);
      addRow("Transaction Type", tx.type);

      y += 5;
      doc.line(20, y, 190, y);
      y += 15;

      // --- Payment Breakdown ---
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(secondaryColor);
      doc.text("Payment Breakdown", 20, y);
      y += 15;

      const fee = tx.amount * 0.01;
      const total = tx.amount + fee;

      // Subtotal
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(grayColor);
      doc.text("Subtotal", 20, y);
      doc.setTextColor(secondaryColor);
      doc.text(`${tx.currency} ${tx.amount.toLocaleString()}`, 190, y, {
        align: "right",
      });
      y += 10;

      // Fee
      doc.setTextColor(grayColor);
      doc.text("Service Fee (1.0%)", 20, y);
      doc.setTextColor(secondaryColor);
      doc.text(`${tx.currency} ${fee.toLocaleString()}`, 190, y, {
        align: "right",
      });
      y += 15;

      // Total Highlight Box
      doc.setFillColor(lightGray);
      doc.rect(20, y - 8, 170, 18, "F"); // Background box

      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(primaryColor);
      doc.text("Total Paid", 25, y + 4);
      doc.text(`${tx.currency} ${total.toLocaleString()}`, 185, y + 4, {
        align: "right",
      });

      // --- Footer ---
      const pageHeight = doc.internal.pageSize.height;
      doc.setFontSize(9);
      doc.setTextColor(grayColor);
      doc.setFont("helvetica", "normal");

      doc.text("Thank you for using PayNow Gateway.", 105, pageHeight - 25, {
        align: "center",
      });
      doc.text(
        "For support, please contact support@paynow-gateway.com",
        105,
        pageHeight - 20,
        { align: "center" },
      );

      // Bottom branding line
      doc.setDrawColor(primaryColor);
      doc.setLineWidth(1);
      doc.line(0, pageHeight - 5, 210, pageHeight - 5);

      // Save PDF
      doc.save(`PayNow_Receipt_${tx.id}.pdf`);
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
            {displayedTransactions.map((tx) => (
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
                          {tx.recipient}
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
                    {new Date(tx.date).toLocaleDateString()}
                    <div
                      className="text-xs text-gray-400 dark:text-gray-500"
                      suppressHydrationWarning
                    >
                      {new Date(tx.date).toLocaleTimeString([], {
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
                              Transaction ID
                            </h4>
                            <div className="flex items-center gap-2 bg-white dark:bg-slate-900 p-2 rounded border border-gray-200 dark:border-slate-700 w-fit">
                              <code className="text-xs font-mono text-gray-700 dark:text-gray-300">
                                {tx.id}
                              </code>
                              <button
                                onClick={(e) => copyToClipboard(tx.id, e)}
                                className="text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                                title="Copy ID"
                              >
                                {copiedId === tx.id ? (
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
                                Recipient
                              </p>
                              <p className="text-sm font-medium text-gray-900 dark:text-white">
                                {tx.recipient}
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
                                  {tx.currency}{" "}
                                  {(tx.amount * 0.01).toLocaleString()}
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
            {displayedTransactions.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="px-6 py-8 text-center text-gray-500 dark:text-gray-400"
                >
                  No transactions found matching your criteria.
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
              <span className="font-medium">
                {(currentPage - 1) * itemsPerPage + 1}
              </span>{" "}
              to{" "}
              <span className="font-medium">
                {Math.min(
                  currentPage * itemsPerPage,
                  filteredTransactions.length,
                )}
              </span>{" "}
              of{" "}
              <span className="font-medium">{filteredTransactions.length}</span>{" "}
              results
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-1.5 sm:p-2 border border-gray-300 dark:border-slate-600 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed text-gray-600 dark:text-gray-300 transition-colors"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
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
