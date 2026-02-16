"use client";
import { useState } from "react";
import {
  Search,
  Filter,
  CheckCircle,
  AlertCircle,
  FileText,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useNotificationStore } from "@/store";
import { resolveTicket } from "@/lib/actions";

// Define the Ticket type based on what getAllTickets returns
type Ticket = {
  id: string;
  user: {
    name: string | null;
    email: string | null;
  };
  userId: number;
  transaction?: {
    txn_ref: string;
    amount: number; // Decimal
    currency: string;
  } | null;
  transactionId?: string | null;
  amount?: number; // Decimal from prisma
  currency: string;
  reason: string;
  status: "OPEN" | "RESOLVED" | "REJECTED";
  createdAt: Date | string; // Handle both
  evidence: string | null;
  type: "TRANSACTION" | "GENERAL";
};

type AdminDisputesProps = {
  tickets: Ticket[];
};

type FilterType = "ALL" | "OPEN" | "RESOLVED";
const filters: FilterType[] = ["ALL", "OPEN", "RESOLVED"];

const AdminDisputes = ({ tickets }: AdminDisputesProps) => {
  const notify = useNotificationStore((state) => state.notify);
  // const [disputes, setDisputes] = useState<Ticket[]>(tickets);
  const [filter, setFilter] = useState<FilterType>("OPEN");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDispute, setSelectedDispute] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const handleResolve = async (
    id: string,
    decision: "RESOLVED" | "REJECTED",
  ) => {
    setIsLoading(true);
    try {
      const res = await resolveTicket(id, decision);
      setIsLoading(false);
      if (res.error) {
        notify("ALERT", "Failed to update ticket status.");
        return;
      }
      setSelectedDispute(null);
      notify(
        decision === "RESOLVED" ? "SUCCESS" : "INFO",
        decision === "RESOLVED" ? "Dispute resolved." : "Dispute rejected.",
      );
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
      notify("ALERT", "Failed to update ticket status.");
    }
  };

  const filteredDisputes = tickets.filter((d) => {
    const matchesFilter = filter === "ALL" || d.status === filter;
    const matchesSearch =
      (d.user.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (d.transaction?.txn_ref || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      d.id.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  // Pagination Logic - Reset to page 1 when filters change
  const effectiveCurrentPage = currentPage;
  const totalPages = Math.ceil(filteredDisputes.length / itemsPerPage);

  // Auto-reset to page 1 if current page exceeds total pages
  const safePage =
    effectiveCurrentPage > totalPages && totalPages > 0
      ? 1
      : effectiveCurrentPage;
  const paginatedDisputes = filteredDisputes.slice(
    (safePage - 1) * itemsPerPage,
    safePage * itemsPerPage,
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
          Dispute Resolution
        </h2>
        <div className="flex gap-2">
          <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg p-1 flex">
            {filters.map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                  filter === f
                    ? "bg-indigo-50 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300"
                    : "text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                }`}
              >
                {f.charAt(0) + f.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm flex items-center gap-4 transition-colors">
        <Search className="text-gray-400 dark:text-gray-500" size={20} />
        <input
          type="text"
          placeholder="Search by User, Transaction Ref or ID..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 bg-transparent text-gray-900 dark:text-white focus:outline-none text-sm placeholder-gray-500 dark:placeholder-gray-400"
        />
        <Filter
          className="text-gray-400 dark:text-gray-500 cursor-pointer hover:text-gray-600 dark:hover:text-gray-300"
          size={20}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Dispute List with Pagination */}
        <div className="lg:col-span-2 flex flex-col h-[600px]">
          <div className="flex-1 space-y-4 overflow-y-auto pr-2">
            {paginatedDisputes.length === 0 ? (
              <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-xl border border-dashed border-gray-300 dark:border-slate-700">
                <div className="mx-auto w-12 h-12 bg-gray-100 dark:bg-slate-700 rounded-full flex items-center justify-center text-gray-400 dark:text-gray-500 mb-3">
                  <CheckCircle size={24} />
                </div>
                <p className="text-gray-500 dark:text-gray-400 font-medium">
                  No disputes found matching your criteria.
                </p>
              </div>
            ) : (
              paginatedDisputes.map((dispute) => (
                <div
                  key={dispute.id}
                  onClick={() => setSelectedDispute(dispute.id)}
                  className={`bg-white dark:bg-slate-800 rounded-xl border p-5 cursor-pointer transition-all hover:shadow-md ${
                    selectedDispute === dispute.id
                      ? "border-indigo-500 ring-1 ring-indigo-500 dark:ring-indigo-400 dark:border-indigo-400"
                      : "border-gray-200 dark:border-slate-700"
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          dispute.status === "OPEN"
                            ? "bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300"
                            : dispute.status === "RESOLVED"
                              ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300"
                              : "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300"
                        }`}
                      >
                        {dispute.status}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          dispute.type === "TRANSACTION"
                            ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
                            : "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300"
                        }`}
                      >
                        {dispute.type}
                      </span>
                      <span className="text-xs text-gray-400 dark:text-gray-500">
                        #{dispute.id.slice(0, 8)}...
                      </span>
                    </div>
                    {dispute.amount && (
                      <span className="text-sm font-bold text-gray-900 dark:text-white">
                        {dispute.currency}{" "}
                        {Number(dispute.amount).toLocaleString()}
                      </span>
                    )}
                  </div>

                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-semibold text-gray-800 dark:text-gray-200">
                        {dispute.user.name || "Unknown User"}
                      </h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {dispute.reason}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-400 dark:text-gray-500">
                        {new Date(dispute.createdAt).toLocaleDateString()}
                      </p>
                      {dispute.transaction && (
                        <p className="text-xs font-mono text-indigo-600 dark:text-indigo-400 mt-1">
                          Ref: {dispute.transaction.txn_ref}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Pagination Controls */}
          {filteredDisputes.length > 0 && (
            <div className="pt-4 flex items-center justify-between border-t border-gray-200 dark:border-slate-700 mt-2">
              <span className="text-xs text-gray-500 dark:text-gray-400">
                Page {safePage} of {totalPages}
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    const newPage = Math.max(1, safePage - 1);
                    setCurrentPage(newPage);
                  }}
                  disabled={safePage === 1}
                  className="p-2 border border-gray-200 dark:border-slate-700 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed text-gray-600 dark:text-gray-300"
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  onClick={() => {
                    const newPage = Math.min(totalPages, safePage + 1);
                    setCurrentPage(newPage);
                  }}
                  disabled={safePage === totalPages}
                  className="p-2 border border-gray-200 dark:border-slate-700 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed text-gray-600 dark:text-gray-300"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Detail Panel */}
        <div className="lg:col-span-1">
          {selectedDispute ? (
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 shadow-lg p-6 sticky top-6 animate-fade-in-up transition-colors">
              <div className="pb-4 border-b border-gray-100 dark:border-slate-700 mb-4 flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-white">
                    Dispute Details
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Review details before taking action
                  </p>
                </div>
                {/* Delete button disabled for now */}
                {/* <button
                  onClick={() => handleDelete(selectedDispute)}
                  className="p-1.5 text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                >
                  <Trash2 size={16} />
                </button> */}
              </div>

              {(() => {
                const d = tickets.find((x) => x.id === selectedDispute)!;
                return (
                  <div className="space-y-4">
                    <div>
                      <label className="text-xs text-gray-500 dark:text-gray-400 uppercase font-semibold">
                        Reason
                      </label>
                      <p className="text-sm text-gray-800 dark:text-gray-200 bg-gray-50 dark:bg-slate-700 p-3 rounded-lg mt-1 border border-gray-100 dark:border-slate-600">
                        {d.reason}
                      </p>
                    </div>

                    {d.evidence && (
                      <div>
                        <label className="text-xs text-gray-500 dark:text-gray-400 uppercase font-semibold">
                          Evidence
                        </label>
                        <div className="flex items-center gap-2 mt-1 p-2 border border-gray-200 dark:border-slate-600 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 cursor-pointer transition-colors">
                          <FileText
                            size={16}
                            className="text-indigo-600 dark:text-indigo-400"
                          />
                          <span className="text-sm text-gray-700 dark:text-gray-300 underline decoration-indigo-200 dark:decoration-indigo-700">
                            {d.evidence}
                          </span>
                        </div>
                      </div>
                    )}

                    <div>
                      <label className="text-xs text-gray-500 dark:text-gray-400 uppercase font-semibold">
                        Transaction Info
                      </label>
                      <div className="grid grid-cols-2 gap-2 mt-1">
                        <div className="bg-gray-50 dark:bg-slate-700 p-2 rounded">
                          <p className="text-[10px] text-gray-400 dark:text-gray-500">
                            TX ID
                          </p>
                          <p className="text-xs font-mono font-medium text-gray-900 dark:text-gray-200 overflow-hidden text-ellipsis">
                            {d.transaction
                              ? d.transaction.txn_ref
                              : d.transactionId || "N/A"}
                          </p>
                        </div>
                        <div className="bg-gray-50 dark:bg-slate-700 p-2 rounded">
                          <p className="text-[10px] text-gray-400 dark:text-gray-500">
                            Date
                          </p>
                          <p className="text-xs font-medium text-gray-900 dark:text-gray-200">
                            {new Date(d.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>

                    {d.status === "OPEN" && (
                      <div className="pt-4 flex gap-3">
                        <button
                          disabled={isLoading}
                          onClick={() => handleResolve(d.id, "REJECTED")}
                          className="flex-1 py-2 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-sm font-medium transition-colors"
                        >
                          {isLoading ? "Rejecting..." : "Reject"}
                        </button>
                        <button
                          disabled={isLoading}
                          onClick={() => handleResolve(d.id, "RESOLVED")}
                          className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors"
                        >
                          {isLoading ? "Resolving..." : "Resolve / Refund"}
                        </button>
                      </div>
                    )}

                    {d.status !== "OPEN" && (
                      <div
                        className={`p-3 rounded-lg text-center text-sm font-medium ${
                          d.status === "RESOLVED"
                            ? "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400"
                            : "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400"
                        }`}
                      >
                        This dispute has been {d.status.toLowerCase()}.
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>
          ) : (
            <div className="bg-gray-50 dark:bg-slate-800/50 rounded-xl border border-dashed border-gray-200 dark:border-slate-700 p-8 text-center text-gray-400 dark:text-gray-500 h-64 flex flex-col items-center justify-center transition-colors">
              <AlertCircle size={32} className="mb-2 opacity-50" />
              <p>Select a dispute to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDisputes;
