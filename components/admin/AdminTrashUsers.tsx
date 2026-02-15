"use client";
import { useState, useEffect, useCallback } from "react";
import {
  getTrashUsers,
  restoreUser,
  permanentlyDeleteUser,
} from "@/lib/actions/admin";
import {
  Trash2,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  ArrowLeft,
} from "lucide-react";
import { useNotificationStore } from "@/store";
import Link from "next/link";
import ActionModal from "@/components/ActionModal";

type User = {
  id: number;
  name: string;
  email: string;
  privilege: "none" | "admin" | "super_admin";
  status: boolean;
  wallet: {
    balance: number;
    id: string;
  };
  deleted_at: string;
  created_at: string;
};

const AdminTrashUsers = () => {
  const notify = useNotificationStore((state) => state.notify);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  // Action Modal State
  const [actionModal, setActionModal] = useState<{
    isOpen: boolean;
    type: "danger" | "warning" | "success" | "info";
    title: string;
    description: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    type: "danger",
    title: "",
    description: "",
    onConfirm: () => {},
  });

  const closeActionModal = () => {
    setActionModal((prev) => ({ ...prev, isOpen: false }));
  };

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const itemsPerPage = 6;

  const fetchTrashUsers = useCallback(async () => {
    setLoading(true);
    try {
      const { users, totalPages, totalUsers } = await getTrashUsers(
        currentPage,
        itemsPerPage,
      );
      setUsers(users as User[]);
      setTotalPages(totalPages);
      setTotalUsers(totalUsers);
    } catch (error) {
      console.error("Error fetching trash users:", error);
      notify("ALERT", "Failed to fetch trash users.");
    } finally {
      setLoading(false);
    }
  }, [currentPage, notify]);

  useEffect(() => {
    fetchTrashUsers();
  }, [fetchTrashUsers]);

  const handleRestoreUser = async (userId: number) => {
    setActionModal({
      isOpen: true,
      type: "info",
      title: "Restore User?",
      description:
        "Are you sure you want to restore this user? They will be moved back to the active users list.",
      onConfirm: async () => {
        const result = await restoreUser(userId);
        if (result.success) {
          setUsers(users.filter((u) => u.id !== userId));
          notify("SUCCESS", "User restored successfully.");
          fetchTrashUsers();
        } else {
          notify("ALERT", result.message || "Failed to restore user.");
        }
        closeActionModal();
      },
    });
  };

  const handlePermanentDelete = async (userId: number) => {
    setActionModal({
      isOpen: true,
      type: "danger",
      title: "Permanently Delete User?",
      description:
        "WARNING: This action is PERMANENT and cannot be undone. Are you sure you want to permanently delete this user and all associated data?",
      onConfirm: async () => {
        const result = await permanentlyDeleteUser(userId);
        if (result.success) {
          setUsers(users.filter((u) => u.id !== userId));
          notify("SUCCESS", "User permanently deleted.");
          fetchTrashUsers();
        } else {
          notify("ALERT", result.message || "Failed to delete user.");
        }
        closeActionModal();
      },
    });
  };

  const getStatusColor = (status: boolean) => {
    return status
      ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800"
      : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800";
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Trash2 className="text-red-500" /> Deleted Users (Trash)
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Manage deleted users. Restore them or permanently delete.
          </p>
        </div>
        <Link
          href="/dashboard/admin/kyc"
          className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-slate-700 transition"
        >
          <ArrowLeft size={16} /> Back to Users
        </Link>
      </div>

      {/* Users Table */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 dark:bg-slate-700/50 border-b border-gray-100 dark:border-slate-700">
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  User
                </th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Example Role
                </th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Status
                </th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Deleted At
                </th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
              {loading ? (
                // Loading Skeletons
                Array.from({ length: itemsPerPage }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-gray-200 dark:bg-slate-700 rounded-full"></div>
                        <div className="space-y-2">
                          <div className="h-4 w-24 bg-gray-200 dark:bg-slate-700 rounded"></div>
                          <div className="h-3 w-32 bg-gray-200 dark:bg-slate-700 rounded"></div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-6 w-16 bg-gray-200 dark:bg-slate-700 rounded-full"></div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-6 w-16 bg-gray-200 dark:bg-slate-700 rounded-full"></div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-4 w-20 bg-gray-200 dark:bg-slate-700 rounded"></div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <div className="w-8 h-8 bg-gray-200 dark:bg-slate-700 rounded"></div>
                        <div className="w-8 h-8 bg-gray-200 dark:bg-slate-700 rounded"></div>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <>
                  {users.map((user) => (
                    <tr
                      key={user.id}
                      className="hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 bg-red-100 dark:bg-red-900/50 rounded-full flex items-center justify-center text-red-700 dark:text-red-300 font-bold shrink-0">
                            {user.name?.charAt(0) || "U"}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900 dark:text-white">
                              {user.name || "Unknown User"}
                            </p>
                            <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                              {user.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-slate-700 dark:text-gray-300">
                          {user.privilege}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(
                            user.status,
                          )}`}
                        >
                          {user.status ? "VERIFIED" : "PENDING"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-500 dark:text-gray-400 text-sm">
                        {user.deleted_at}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleRestoreUser(user.id)}
                            className="p-1.5 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 rounded transition-colors"
                            title="Restore User"
                          >
                            <RefreshCw size={16} />
                          </button>
                          <button
                            onClick={() => handlePermanentDelete(user.id)}
                            className="p-1.5 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                            title="Delete Permanently"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {!loading && users.length === 0 && (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-6 py-12 text-center text-gray-500 dark:text-gray-400"
                      >
                        <Trash2
                          size={32}
                          className="mx-auto text-gray-300 dark:text-gray-600 mb-2"
                        />
                        Trash is empty.
                      </td>
                    </tr>
                  )}
                </>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {totalUsers > 0 && (
          <div className="bg-gray-50 dark:bg-slate-700/30 border-t border-gray-200 dark:border-slate-700 px-6 py-4 flex items-center justify-between">
            <span className="text-xs text-gray-500 dark:text-gray-400">
              Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
              {Math.min(currentPage * itemsPerPage, totalUsers)} of {totalUsers}{" "}
              users
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1 || loading}
                className="p-1.5 border border-gray-300 dark:border-slate-600 rounded hover:bg-white dark:hover:bg-slate-700 disabled:opacity-50 text-gray-600 dark:text-gray-300"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                disabled={currentPage === totalPages || loading}
                className="p-1.5 border border-gray-300 dark:border-slate-600 rounded hover:bg-white dark:hover:bg-slate-700 disabled:opacity-50 text-gray-600 dark:text-gray-300"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 flex gap-3 text-sm text-yellow-800 dark:text-yellow-200">
        <AlertTriangle className="shrink-0" size={20} />
        <div>
          <h4 className="font-semibold">Warning: Permanent Deletion</h4>
          <p className="mt-1 opacity-90">
            Items in the trash can be restored. However, permanently deleting a
            user will remove all their data, including wallet history and
            transaction logs, from the database forever. This action cannot be
            undone.
          </p>
        </div>
      </div>

      {/* Action Modal */}
      <ActionModal
        isOpen={actionModal.isOpen}
        onClose={closeActionModal}
        onConfirm={actionModal.onConfirm}
        title={actionModal.title}
        description={actionModal.description}
        type={actionModal.type}
        confirmLabel="Yes, Proceed"
        cancelLabel="Cancel"
      />
    </div>
  );
};

export default AdminTrashUsers;
