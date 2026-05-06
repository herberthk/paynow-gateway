"use client";

import { useState } from "react";
import {
  ArrowUpRight,
  ArrowDownLeft,
  Calendar,
  Search,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import { useRouter, useSearchParams } from "next/navigation";

interface SupportHistoryViewProps {
  initialData: SupportHistoryResponse;
}

const SupportHistoryView = ({
  initialData,
}: SupportHistoryViewProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [activeTab, setActiveTab] = useState<"ALL" | "SENT" | "RECEIVED">(
    "ALL",
  );

  const data = initialData.data || [];
  const pagination = initialData.pagination || {
    total: 0,
    page: 1,
    pageSize: 10,
    totalPages: 0,
  };

  const filteredData = data.filter((item) => {
    if (activeTab === "ALL") return true;
    return item.type === activeTab;
  });

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", newPage.toString());
    router.push(`?${params.toString()}`);
  };

  return (
    <div className="space-y-8">
      {/* Tabs */}
      <div className="flex items-center gap-2 bg-gray-100/50 dark:bg-slate-800/50 p-1.5 rounded-2xl w-fit border border-gray-100 dark:border-slate-800">
        {(["ALL", "SENT", "RECEIVED"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-2.5 rounded-xl text-sm font-black transition-all ${
              activeTab === tab
                ? "bg-white dark:bg-slate-700 text-indigo-600 shadow-sm"
                : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            }`}
          >
            {tab.charAt(0) + tab.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      {/* History List */}
      <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-gray-100 dark:border-slate-800 shadow-xl shadow-indigo-500/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-50 dark:border-slate-800">
                <th className="px-6 py-5 text-xs font-black text-gray-400 uppercase tracking-widest">
                  Transaction
                </th>
                <th className="px-6 py-5 text-xs font-black text-gray-400 uppercase tracking-widest">
                  Amount
                </th>
                <th className="px-6 py-5 text-xs font-black text-gray-400 uppercase tracking-widest">
                  Date
                </th>
                <th className="px-6 py-5 text-xs font-black text-gray-400 uppercase tracking-widest">
                  Status
                </th>
                <th className="px-6 py-5 text-xs font-black text-gray-400 uppercase tracking-widest text-right">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-slate-800/50">
              <AnimatePresence mode="popLayout">
                {filteredData.map((item, index: number) => (
                  <motion.tr
                    key={item.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: index * 0.03 }}
                    className="group hover:bg-gray-50/50 dark:hover:bg-slate-800/30 transition-colors"
                  >
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-4">
                        <div
                          className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                            item.type === "SENT"
                              ? "bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600"
                              : "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600"
                          }`}
                        >
                          {item.type === "SENT" ? (
                            <ArrowUpRight size={22} />
                          ) : (
                            <ArrowDownLeft size={22} />
                          )}
                        </div>
                        <div>
                          <div className="font-bold text-gray-900 dark:text-white">
                            {item.type === "SENT"
                              ? `To: ${item.recipientName}`
                              : `From: ${item.senderName}`}
                          </div>
                          <div className="text-xs text-gray-500 font-bold font-mono mt-0.5">
                            {item.reference}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex flex-col">
                        <span
                          className={`text-lg font-black ${
                            item.type === "SENT"
                              ? "text-gray-900 dark:text-white"
                              : "text-emerald-600"
                          }`}
                        >
                          {item.type === "SENT" ? "-" : "+"} UGX{" "}
                          {item.amount.toLocaleString()}
                        </span>
                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                          {item.paymentMethod.replace("_", " ")}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                        <Calendar size={14} className="text-gray-400" />
                        <span className="text-sm font-bold">
                          {format(
                            new Date(item.createdAt),
                            "MMM d, yyyy • HH:mm",
                          )}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-emerald-100 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/30">
                        Completed
                      </span>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <button
                        onClick={() =>
                          router.push(
                            `/dashboard/user/wallet/support/success?ref=${item.reference}`,
                          )
                        }
                        className="p-2 hover:bg-white dark:hover:bg-slate-700 rounded-xl text-gray-400 hover:text-indigo-600 shadow-sm hover:shadow-md transition-all border border-transparent hover:border-gray-100 dark:hover:border-slate-600"
                      >
                        <ExternalLink size={18} />
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>

          {filteredData.length === 0 && (
            <div className="py-24 text-center">
              <div className="w-24 h-24 bg-gray-50 dark:bg-slate-800 rounded-3xl flex items-center justify-center mx-auto mb-6">
                <Search size={32} className="text-gray-300" />
              </div>
              <h3 className="text-xl font-black text-gray-900 dark:text-white mb-2">
                No transactions found
              </h3>
              <p className="text-gray-500 text-sm max-w-xs mx-auto">
                We couldn&apos;t find any support transactions in this category.
              </p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="px-6 py-8 border-t border-gray-50 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-gray-500 font-bold">
              Showing{" "}
              <span className="text-gray-900 dark:text-white font-black">
                {data.length}
              </span>{" "}
              of{" "}
              <span className="text-gray-900 dark:text-white font-black">
                {pagination.total}
              </span>{" "}
              records
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
                className="p-3 rounded-xl border border-gray-100 dark:border-slate-800 disabled:opacity-30 hover:bg-gray-50 dark:hover:bg-slate-800 transition-all active:scale-95"
              >
                <ChevronLeft size={20} />
              </button>
              <div className="flex items-center gap-1">
                {[...Array(pagination.totalPages)].map((_, i) => (
                  <button
                    key={i}
                    onClick={() => handlePageChange(i + 1)}
                    className={`w-11 h-11 rounded-xl text-sm font-black transition-all active:scale-95 ${
                      pagination.page === i + 1
                        ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/30"
                        : "hover:bg-gray-50 dark:hover:bg-slate-800 text-gray-500"
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
              <button
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page === pagination.totalPages}
                className="p-3 rounded-xl border border-gray-100 dark:border-slate-800 disabled:opacity-30 hover:bg-gray-50 dark:hover:bg-slate-800 transition-all active:scale-95"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SupportHistoryView;
