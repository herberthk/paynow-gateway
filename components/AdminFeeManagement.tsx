"use client";
import React, { useState, useEffect } from "react";

import { mockFees } from "@/services/mockData";
import {
  Edit2,
  Plus,
  Save,
  X,
  DollarSign,
  Percent,
  ToggleLeft,
  ToggleRight,
  Trash2,
} from "lucide-react";
import { useNotificationStore } from "@/store";

const AdminFeeManagement: React.FC = () => {
  const [fees, setFees] = useState<Fee[]>(mockFees);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<number>(0);
  const notify = useNotificationStore((state) => state.notify);

  // New Fee State
  const [isAdding, setIsAdding] = useState(false);
  const [newFee, setNewFee] = useState<Partial<Fee>>({
    name: "",
    type: "PERCENTAGE",
    value: 0,
    category: "PAYMENT",
    active: true,
  });

  // Keyboard shortcut for adding new fee
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "n") {
        e.preventDefault();
        setIsAdding(true);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleToggleActive = (id: string) => {
    setFees(fees.map((f) => (f.id === id ? { ...f, active: !f.active } : f)));
  };

  const startEdit = (fee: Fee) => {
    setEditingId(fee.id);
    setEditValue(fee.value);
  };

  const saveEdit = (id: string) => {
    setFees(
      fees.map((f) =>
        f.id === id
          ? {
              ...f,
              value: editValue,
              lastUpdated: new Date().toISOString().split("T")[0],
            }
          : f,
      ),
    );
    setEditingId(null);
    notify("success", "Fee updated successfully");
  };

  const handleAddFee = () => {
    if (!newFee.name || newFee.value === undefined) {
      notify("error", "Please fill in all fields");
      return;
    }
    const fee: Fee = {
      id: `fee_${Date.now()}`,
      name: newFee.name!,
      type: newFee.type as "PERCENTAGE" | "FIXED",
      value: newFee.value,
      category: newFee.category!,
      active: true,
      lastUpdated: new Date().toISOString().split("T")[0],
      currency: "UGX",
    };
    setFees([...fees, fee]);
    setIsAdding(false);
    setNewFee({
      name: "",
      type: "PERCENTAGE",
      value: 0,
      category: "PAYMENT",
      active: true,
    });
    notify("success", "New fee rule added");
  };

  const deleteFee = (id: string) => {
    setFees(fees.filter((f) => f.id !== id));
    notify("info", "Fee rule removed");
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
            Fee Management
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Configure global transaction fees and limits.
          </p>
        </div>
        <button
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          title="Press Ctrl+N to add new fee"
        >
          <Plus size={16} /> Add Fee Rule
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {fees.map((fee) => (
          <div
            key={fee.id}
            className={`bg-white dark:bg-slate-800 rounded-xl border p-6 shadow-sm relative group transition-all ${fee.active ? "border-gray-200 dark:border-slate-700" : "border-gray-100 dark:border-slate-800 opacity-75"}`}
          >
            <div className="flex justify-between items-start mb-4">
              <div
                className={`p-2.5 rounded-lg ${
                  fee.category === "WITHDRAWAL"
                    ? "bg-orange-50 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400"
                    : fee.category === "PAYMENT"
                      ? "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                      : "bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400"
                }`}
              >
                {fee.type === "PERCENTAGE" ? (
                  <Percent size={20} />
                ) : (
                  <DollarSign size={20} />
                )}
              </div>
              <button
                onClick={() => handleToggleActive(fee.id)}
                className={`text-2xl transition-colors ${fee.active ? "text-indigo-600 dark:text-indigo-400" : "text-gray-300 dark:text-gray-600"}`}
              >
                {fee.active ? (
                  <ToggleRight size={32} />
                ) : (
                  <ToggleLeft size={32} />
                )}
              </button>
            </div>

            <div className="mb-4">
              <h3 className="font-bold text-gray-900 dark:text-white mb-1">
                {fee.name}
              </h3>
              <span className="text-xs font-semibold px-2 py-0.5 bg-gray-100 dark:bg-slate-700 text-gray-500 dark:text-gray-400 rounded uppercase tracking-wide">
                {fee.category}
              </span>
            </div>

            <div className="flex items-end justify-between border-t border-gray-100 dark:border-slate-700 pt-4">
              {editingId === fee.id ? (
                <div className="flex items-center gap-2 w-full">
                  <input
                    type="number"
                    value={editValue}
                    onChange={(e) => setEditValue(parseFloat(e.target.value))}
                    className="w-full bg-white dark:bg-slate-700 text-gray-900 dark:text-white border border-indigo-300 dark:border-indigo-500 rounded px-2 py-1 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    autoFocus
                  />
                  <button
                    onClick={() => saveEdit(fee.id)}
                    className="p-1.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded hover:bg-green-200 dark:hover:bg-green-900/50"
                  >
                    <Save size={14} />
                  </button>
                  <button
                    onClick={() => setEditingId(null)}
                    className="p-1.5 bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-400 rounded hover:bg-gray-200 dark:hover:bg-slate-600"
                  >
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-bold text-gray-900 dark:text-white">
                    {fee.type === "FIXED" && fee.currency === "UGX"
                      ? "UGX "
                      : ""}
                    {fee.value}
                  </span>
                  <span className="text-gray-500 dark:text-gray-400 font-medium">
                    {fee.type === "PERCENTAGE"
                      ? "%"
                      : fee.currency === "USD"
                        ? "USD"
                        : ""}
                  </span>
                </div>
              )}

              {!editingId && (
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => startEdit(fee)}
                    className="p-2 text-gray-400 dark:text-gray-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={() => deleteFee(fee.id)}
                    className="p-2 text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Add Fee Modal (Simplified as inline for demo) */}
      {isAdding && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl w-full max-w-md p-6 animate-fade-in-up transition-colors">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
              Add New Fee Rule
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Fee Name
                </label>
                <input
                  type="text"
                  value={newFee.name}
                  onChange={(e) =>
                    setNewFee({ ...newFee, name: e.target.value })
                  }
                  className="w-full bg-white dark:bg-slate-700 text-gray-900 dark:text-white border border-gray-300 dark:border-slate-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  placeholder="e.g. International Transfer"
                  autoFocus
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Type
                  </label>
                  <select
                    value={newFee.type}
                    onChange={(e) =>
                      setNewFee({ ...newFee, type: e.target.value as never })
                    }
                    className="w-full bg-white dark:bg-slate-700 text-gray-900 dark:text-white border border-gray-300 dark:border-slate-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  >
                    <option value="PERCENTAGE">Percentage (%)</option>
                    <option value="FIXED">Fixed Amount</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Value
                  </label>
                  <input
                    type="number"
                    value={newFee.value}
                    onChange={(e) =>
                      setNewFee({
                        ...newFee,
                        value: parseFloat(e.target.value),
                      })
                    }
                    className="w-full bg-white dark:bg-slate-700 text-gray-900 dark:text-white border border-gray-300 dark:border-slate-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Category
                </label>
                <select
                  value={newFee.category}
                  onChange={(e) =>
                    setNewFee({ ...newFee, category: e.target.value as never })
                  }
                  className="w-full bg-white dark:bg-slate-700 text-gray-900 dark:text-white border border-gray-300 dark:border-slate-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                >
                  <option value="PAYMENT">Payment</option>
                  <option value="WITHDRAWAL">Withdrawal</option>
                  <option value="TRANSFER">Transfer</option>
                  <option value="API">API / Developer</option>
                </select>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setIsAdding(false)}
                  className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddFee}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium"
                >
                  Create Rule
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminFeeManagement;
