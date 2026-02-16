"use client";

import { useState } from "react";
import { Plus, Search, CheckCircle, X, Save } from "lucide-react";
import { createTicket } from "@/lib/actions";
import { useNotificationStore } from "@/store";

type Ticket = {
  id: string;
  reason: string;
  status: "OPEN" | "RESOLVED" | "REJECTED";
  amount?: number | null;
  currency?: string | null;
  transactionRef?: string;
  transaction?: {
    txn_ref: string;
    amount: number;
    currency: string;
  } | null;
  createdAt: string;
  evidence?: string | null;
  type: "TRANSACTION" | "GENERAL";
};

type UserDisputesProps = {
  tickets: Ticket[];
};

const UserDisputes = ({ tickets }: UserDisputesProps) => {
  const notify = useNotificationStore((state) => state.notify);
  // const [tickets, setTickets] = useState<Ticket[]>(initialTickets);
  const [filter, setFilter] = useState<"ALL" | "OPEN" | "RESOLVED">("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState<Partial<Dispute>>({
    reason: "",
    amount: "",
    currency: "UGX",
    transactionRef: "",
    type: "GENERAL" as "TRANSACTION" | "GENERAL",
  });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.reason) {
      notify("ALERT", "Please provide a reason.");
      return;
    }
    console.log("formData", formData);
    try {
      setIsLoading(true);

      const res = await createTicket({
        reason: formData.reason,
        amount: formData.amount ? Number(formData.amount) : undefined,
        currency: formData.currency as "UGX" | "USD",
        transactionRef: formData.transactionRef || undefined,
        type: formData.type!,
      });
      console.log("res", res);
      if (res.error) {
        notify("ALERT", res.error || "Failed to create ticket.");
      }
      notify("SUCCESS", "Ticket created successfully.");
      setIsCreating(false);
      setFormData({
        reason: "",
        amount: "",
        currency: "UGX",
        transactionRef: "",
        type: "GENERAL",
      });
      setIsLoading(false);
    } catch (error) {
      notify("ALERT", "Failed to create ticket.");
    } finally {
      setIsLoading(false);
    }
  };

  const filteredTickets = tickets?.filter((t) => {
    const matchesFilter = filter === "ALL" || t.status === filter;
    const matchesSearch =
      t.reason.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (t.transaction?.txn_ref || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      t.id.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
            Support Tickets
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            View and manage your support requests and disputes.
          </p>
        </div>
        <button
          onClick={() => setIsCreating(true)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors flex items-center gap-2"
        >
          <Plus size={16} /> Open New Ticket
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 bg-white dark:bg-slate-800 p-3 rounded-xl border border-gray-200 dark:border-slate-700 flex items-center gap-3">
          <Search className="text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search tickets..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 bg-transparent focus:outline-none text-sm text-gray-900 dark:text-white"
          />
        </div>
        <div className="bg-white dark:bg-slate-800 p-1 rounded-xl border border-gray-200 dark:border-slate-700 flex">
          {(["ALL", "OPEN", "RESOLVED"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 text-xs font-medium rounded-lg transition-all ${
                filter === f
                  ? "bg-indigo-50 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {filteredTickets?.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-xl border border-dashed border-gray-300 dark:border-slate-700">
          <div className="mx-auto w-12 h-12 bg-gray-100 dark:bg-slate-700 rounded-full flex items-center justify-center text-gray-400 dark:text-gray-500 mb-3">
            <CheckCircle size={24} />
          </div>
          <p className="text-gray-500 dark:text-gray-400 font-medium">
            No tickets found.
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredTickets?.map((ticket) => (
            <div
              key={ticket.id}
              className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-gray-200 dark:border-slate-700 hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-3">
                  <span
                    className={`px-2 py-1 rounded text-xs font-bold uppercase ${
                      ticket.type === "TRANSACTION"
                        ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                        : "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300"
                    }`}
                  >
                    {ticket.type}
                  </span>
                  <span
                    className={`px-2 py-1 rounded text-xs font-bold uppercase ${
                      ticket.status === "OPEN"
                        ? "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300"
                        : ticket.status === "RESOLVED"
                          ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
                          : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"
                    }`}
                  >
                    {ticket.status}
                  </span>
                  <span className="text-xs text-gray-400">#{ticket.id}</span>
                </div>
                <span className="text-xs text-gray-400">
                  {new Date(ticket.createdAt).toLocaleDateString()}
                </span>
              </div>

              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                {ticket.reason}
              </h3>

              {ticket.transaction && (
                <div className="mt-2 p-2 bg-gray-50 dark:bg-slate-700/50 rounded text-sm text-gray-600 dark:text-gray-300 flex justify-between">
                  <span>Ref: {ticket.transaction.txn_ref}</span>
                  <span>
                    {ticket.transaction.currency}{" "}
                    {Number(ticket.transaction.amount).toLocaleString()}
                  </span>
                </div>
              )}
              {ticket.amount && !ticket.transaction && (
                <div className="mt-2 p-2 bg-gray-50 dark:bg-slate-700/50 rounded text-sm text-gray-600 dark:text-gray-300 flex justify-between">
                  <span>Claim Amount</span>
                  <span>
                    {ticket.currency} {Number(ticket.amount).toLocaleString()}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Create Modal */}
      {isCreating && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                Create New Ticket
              </h3>
              <button
                onClick={() => setIsCreating(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Type
                </label>
                <select
                  value={formData.type}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      type: e.target.value as "TRANSACTION" | "GENERAL",
                    })
                  }
                  required
                  className="w-full bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg px-3 py-2"
                >
                  <option value="GENERAL">General Inquiry</option>
                  <option value="TRANSACTION">Transaction Dispute</option>
                </select>
              </div>

              {formData.type === "TRANSACTION" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Transaction Reference
                  </label>
                  <input
                    type="text"
                    value={formData.transactionRef}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        transactionRef: e.target.value,
                      })
                    }
                    required
                    className="w-full bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg px-3 py-2"
                    placeholder="Enter Transaction Reference"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Subject / Reason
                </label>
                <textarea
                  value={formData.reason}
                  onChange={(e) =>
                    setFormData({ ...formData, reason: e.target.value })
                  }
                  className="w-full bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg px-3 py-2"
                  rows={3}
                  placeholder="Describe your issue..."
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Amount (Optional)
                  </label>
                  <input
                    type="number"
                    value={formData.amount}
                    onChange={(e) =>
                      setFormData({ ...formData, amount: e.target.value })
                    }
                    className="w-full bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Currency
                  </label>
                  <select
                    value={formData.currency}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        currency: e.target.value as Currency,
                      })
                    }
                    className="w-full bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg px-3 py-2"
                  >
                    <option value="UGX">UGX</option>
                    <option value="USD">USD</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 rounded-lg mt-2 flex items-center justify-center gap-2"
              >
                {isLoading ? "Submitting..." : "Submit Ticket"}{" "}
                <Save size={16} />
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserDisputes;
