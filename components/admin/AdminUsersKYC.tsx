"use client";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import ActionModal from "@/components/ActionModal";

import {
  getPaginatedUsers,
  updateSystemUser,
  createSystemUser,
  deleteUser,
} from "@/lib/actions/admin";
import {
  Check,
  X,
  Search,
  Shield,
  User as UserIcon,
  Calendar,
  Mail,
  Plus,
  Edit,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Save,
  ChevronDown,
  ChevronUp,
  Wallet,
  Smartphone,
  CreditCard,
  MapPin,
  Phone,
} from "lucide-react";
import { useNotificationStore } from "@/store";
import React from "react";

type PaymentMethod = {
  id: string;
  type: string;
  name: string;
  detail: string;
};

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
  address: string | null;
  tel: string | null;
  created_at: string;
  paymentMethods?: PaymentMethod[];
};

type Privilege = "none" | "admin" | "super_admin";

const AdminUsersKYC = () => {
  const notify = useNotificationStore((state) => state.notify);
  const [users, setUsers] = useState<User[]>([]);
  const [filter, setFilter] = useState<"ALL" | "PENDING" | "VERIFIED">("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [loading, setLoading] = useState(true);
  const itemsPerPage = 6;

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [currentUserData, setCurrentUserData] = useState<Partial<User>>({
    name: "",
    email: "",
    privilege: "none",
    tel: "",
    address: "",
    status: false,
    wallet: { balance: 0, id: "" },
  });

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const { users, totalPages, totalUsers } = await getPaginatedUsers(
        currentPage,
        itemsPerPage,
        searchTerm,
        filter,
      );
      setUsers(users as User[]);
      setTotalPages(totalPages);
      setTotalUsers(totalUsers);
    } catch (error) {
      console.error("Error fetching users:", error);
      notify("ALERT", "Failed to fetch users.");
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchTerm, filter, notify]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchUsers();
    }, 500); // Debounce search

    return () => clearTimeout(delayDebounceFn);
  }, [fetchUsers]);

  const toggleExpand = (id: number) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const handleStatusChange = async (
    userId: number,
    status: boolean,
    e: React.MouseEvent,
  ) => {
    e.stopPropagation();
    // Optimistic update
    const previousUsers = [...users];
    setUsers(
      users.map((u) => (u.id === userId ? { ...u, status: status } : u)),
    );

    const result = await updateSystemUser(userId, { status });
    if (result.success) {
      const message = status
        ? "User approved successfully."
        : "User KYC revoked.";
      notify(status === true ? "SUCCESS" : "INFO", message);
      fetchUsers(); // Refresh to be safe
    } else {
      setUsers(previousUsers); // Revert
      notify("ALERT", result.message || "Failed to update status.");
    }
  };

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

  const handleSoftDelete = async (userId: number) => {
    setActionModal({
      isOpen: true,
      type: "warning",
      title: "Move to Trash?",
      description:
        "Are you sure you want to move this user to the trash? They will be deactivated but can be restored later.",
      onConfirm: async () => {
        setIsLoading(true);
        const result = await deleteUser(userId);
        if (result.success) {
          setUsers((prev) => prev.filter((u) => u.id !== userId));
          notify("INFO", "User moved to trash.");
          fetchUsers();
        } else {
          notify("ALERT", result.message || "Failed to delete user.");
        }
        setIsLoading(false);
        closeActionModal();
      },
    });
  };

  const handleDeleteUser = (userId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    handleSoftDelete(userId);
  };

  const openCreateModal = () => {
    setModalMode("create");
    setCurrentUserData({
      name: "",
      email: "",
      privilege: "none",
      status: false,
      wallet: { balance: 0, id: "" },
    });
    setIsModalOpen(true);
  };

  const openEditModal = (user: User, e: React.MouseEvent) => {
    e.stopPropagation();
    setModalMode("edit");
    setCurrentUserData(user);
    setIsModalOpen(true);
  };

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUserData.name || !currentUserData.email) {
      notify("ALERT", "Please fill in all required fields.");
      return;
    }

    if (modalMode === "create") {
      setIsLoading(true);
      try {
        const result = await createSystemUser({
          name: currentUserData.name,
          email: currentUserData.email,
          privilege: currentUserData.privilege || "none",
          status: currentUserData.status || false,
        });
        setIsLoading(false);
        if (result.success) {
          notify("SUCCESS", "User account created successfully.");
          fetchUsers();
          setIsModalOpen(false);
        } else {
          notify("ALERT", result.message || "Failed to create user.");
        }
      } catch (error) {
        notify("ALERT", "Failed to create user.");
        setIsLoading(false);
      } finally {
        setIsLoading(false);
      }
    } else {
      if (!currentUserData.id) return;
      setIsLoading(true);
      try {
        const result = await updateSystemUser(currentUserData.id, {
          name: currentUserData.name,
          email: currentUserData.email,
          privilege: currentUserData.privilege,
          status: currentUserData.status,
        });

        if (result.success) {
          setUsers(
            users.map((u) =>
              u.id === currentUserData.id
                ? { ...(u as User), ...currentUserData }
                : u,
            ),
          );
          notify("SUCCESS", "User profile updated.");
          fetchUsers();
          setIsModalOpen(false);
        } else {
          notify("ALERT", result.message || "Failed to update user.");
        }
      } catch (error) {
        notify("ALERT", "Failed to update user.");
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Reset page when filter/search changes
  useEffect(() => {
    setCurrentPage(1);
    setExpandedId(null);
  }, [filter, searchTerm]);

  const getStatusColor = (status: boolean) => {
    switch (status) {
      case true:
        return "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800";
      case false:
        return "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800";
      default:
        return "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
            User Management
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Manage users, roles, and KYC verification.
          </p>
        </div>
        <div className="flex gap-2">
          {/* <button
            onClick={openCreateModal}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
          >
            <Plus size={16} /> Add User
          </button> */}

          <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg p-1 flex">
            {["ALL", "PENDING", "VERIFIED"].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f as never)}
                className={`px-4 py-2 text-xs font-medium rounded-md transition-all ${
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

      <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm overflow-hidden flex flex-col min-h-[500px] transition-colors">
        {/* Table Header Controls */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="relative flex-1">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                size={20}
              />
              <input
                type="text"
                placeholder="Search users by name, email..."
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all dark:text-white"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={openCreateModal}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors flex items-center gap-2 font-medium"
              >
                <Plus size={18} /> Add New User
              </button>
              <Link
                href="/dashboard/admin/kyc/trash"
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-gray-700 dark:text-gray-200 rounded-lg transition-colors flex items-center gap-2 font-medium"
              >
                <Trash2 size={18} /> Trash
              </Link>
            </div>
          </div>
        </div>

        {/* User Table */}
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 dark:bg-slate-700/50 text-gray-500 dark:text-gray-400 font-medium">
              <tr>
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Joined</th>
                <th className="px-6 py-4 text-right">Actions</th>
                <th className="px-6 py-4 w-10"></th>
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
                    <td className="px-6 py-4"></td>
                  </tr>
                ))
              ) : (
                <>
                  {users.map((user, index) => (
                    <React.Fragment key={`${user.id}-${index}`}>
                      <tr
                        onClick={() => toggleExpand(user.id)}
                        className={`cursor-pointer transition-all duration-200 border-l-4 ${
                          expandedId === user.id
                            ? "bg-indigo-50/50 dark:bg-indigo-900/10 border-l-indigo-500"
                            : "hover:bg-gray-50 dark:hover:bg-slate-700/50 border-l-transparent"
                        }`}
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 bg-indigo-100 dark:bg-indigo-900/50 rounded-full flex items-center justify-center text-indigo-700 dark:text-indigo-300 font-bold shrink-0">
                              {user.name?.charAt(0) || "U"}
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900 dark:text-white">
                                {user.name || "Unknown User"}
                              </p>
                              <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                                <Mail size={10} /> {user.email}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                              user.privilege === "super_admin"
                                ? "bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border-purple-100 dark:border-purple-800"
                                : "bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-100 dark:border-blue-800"
                            }`}
                          >
                            {user.privilege === "super_admin" && (
                              <Shield size={10} />
                            )}
                            {user.privilege === "super_admin"
                              ? "ADMIN"
                              : "USER"}
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
                        <td className="px-6 py-4 text-gray-500 dark:text-gray-400">
                          <div className="flex items-center gap-2">
                            <Calendar
                              size={14}
                              className="text-gray-400 dark:text-gray-500"
                            />
                            {user.created_at || "N/A"}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {!user.status && (
                              <>
                                <button
                                  onClick={(e) =>
                                    handleStatusChange(user.id, true, e)
                                  }
                                  className="p-1.5 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded hover:bg-green-100 dark:hover:bg-green-900/40 transition-colors"
                                  title="Approve KYC"
                                >
                                  <Check size={16} />
                                </button>
                                <button
                                  onClick={(e) =>
                                    handleStatusChange(user.id, false, e)
                                  }
                                  className="p-1.5 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
                                  title="Reject KYC"
                                >
                                  <X size={16} />
                                </button>
                              </>
                            )}
                            <button
                              onClick={(e) => openEditModal(user, e)}
                              className="p-1.5 text-gray-400 dark:text-gray-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded transition-colors"
                              title="Edit User"
                            >
                              <Edit size={16} />
                            </button>
                            <button
                              onClick={(e) => handleDeleteUser(user.id, e)}
                              className="p-1.5 text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                              title="Delete User"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-gray-400">
                          {expandedId === user.id ? (
                            <ChevronUp size={20} />
                          ) : (
                            <ChevronDown size={20} />
                          )}
                        </td>
                      </tr>

                      {/* Expanded User Details */}
                      {expandedId === user.id && (
                        <tr className="bg-gray-50/50 dark:bg-slate-800/50">
                          <td colSpan={6} className="px-6 py-0">
                            <div className="py-6 border-t border-dashed border-gray-200 dark:border-slate-700 animate-fade-in-up">
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                {/* Financials */}
                                <div className="space-y-4">
                                  <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 flex items-center gap-2">
                                    <Wallet size={14} /> Wallet Balances
                                  </h4>
                                  <div className="bg-white dark:bg-slate-900 p-4 rounded-lg border border-gray-200 dark:border-slate-700">
                                    <div className="flex justify-between items-center mb-2">
                                      <span className="text-sm text-gray-600 dark:text-gray-400">
                                        UGX
                                      </span>
                                      <span className="font-bold text-gray-900 dark:text-white">
                                        {user?.wallet?.balance?.toLocaleString() ||
                                          0}
                                      </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                      <span className="text-sm text-gray-600 dark:text-gray-400">
                                        USD
                                      </span>
                                      <span className="font-bold text-gray-900 dark:text-white">
                                        $
                                        {(
                                          Number(user?.wallet?.balance || 0) /
                                          3650
                                        ).toLocaleString(undefined, {
                                          maximumFractionDigits: 2,
                                        })}
                                      </span>
                                    </div>
                                  </div>
                                </div>

                                {/* Contact Info (Simulated) */}
                                <div className="space-y-4">
                                  <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 flex items-center gap-2">
                                    <UserIcon size={14} /> Contact Details
                                  </h4>
                                  <div className="space-y-2">
                                    <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                                      <Phone
                                        size={14}
                                        className="text-gray-400"
                                      />
                                      {user.tel || "N/A"}
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                                      <MapPin
                                        size={14}
                                        className="text-gray-400"
                                      />
                                      {user.address || "N/A"}
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                                      <Mail
                                        size={14}
                                        className="text-gray-400"
                                      />
                                      {user.email}
                                    </div>
                                  </div>
                                </div>

                                {/* Linked Methods */}
                                <div className="space-y-4">
                                  <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 flex items-center gap-2">
                                    <CreditCard size={14} /> Payment Methods
                                  </h4>
                                  <div className="space-y-2">
                                    {user.paymentMethods &&
                                    user.paymentMethods.length > 0 ? (
                                      user.paymentMethods.map((m) => (
                                        <div
                                          key={m.id}
                                          className="flex items-center gap-2 text-sm bg-white dark:bg-slate-900 p-2 rounded border border-gray-100 dark:border-slate-800"
                                        >
                                          {m.type === "MOBILE_MONEY" ? (
                                            <Smartphone
                                              size={14}
                                              className="text-yellow-600"
                                            />
                                          ) : (
                                            <CreditCard
                                              size={14}
                                              className="text-blue-600"
                                            />
                                          )}
                                          <span className="text-gray-700 dark:text-gray-300">
                                            {m.name}
                                          </span>
                                          <span className="text-xs text-gray-400 ml-auto">
                                            {m.detail}
                                          </span>
                                        </div>
                                      ))
                                    ) : (
                                      <p className="text-sm text-gray-500 dark:text-gray-500 italic">
                                        No linked payment methods.
                                      </p>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                  {!loading && users.length === 0 && (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-6 py-12 text-center text-gray-500 dark:text-gray-400"
                      >
                        <UserIcon
                          size={32}
                          className="mx-auto text-gray-300 dark:text-gray-600 mb-2"
                        />
                        No users found matching your search.
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

      {/* Action Modal */}
      <ActionModal
        isOpen={actionModal.isOpen}
        onClose={closeActionModal}
        onConfirm={actionModal.onConfirm}
        title={actionModal.title}
        description={actionModal.description}
        type={actionModal.type}
        confirmLabel="Yes, Process"
        cancelLabel="Cancel"
        isLoading={isLoading}
      />

      {/* Edit/Create Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl w-full max-w-md p-6 animate-fade-in-up transition-colors">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                {modalMode === "create" ? "Add New User" : "Edit Profile"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveUser} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={currentUserData.name}
                  onChange={(e) =>
                    setCurrentUserData({
                      ...currentUserData,
                      name: e.target.value,
                    })
                  }
                  required
                  placeholder="John Doe"
                  className="w-full bg-white dark:bg-slate-700 text-gray-900 dark:text-white border border-gray-300 dark:border-slate-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={currentUserData.email}
                  onChange={(e) =>
                    setCurrentUserData({
                      ...currentUserData,
                      email: e.target.value,
                    })
                  }
                  required
                  placeholder="you@youremail.com"
                  className="w-full bg-white dark:bg-slate-700 text-gray-900 dark:text-white border border-gray-300 dark:border-slate-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Phone number
                </label>
                <input
                  type="text"
                  value={currentUserData.tel!}
                  onChange={(e) =>
                    setCurrentUserData({
                      ...currentUserData,
                      tel: e.target.value,
                    })
                  }
                  required
                  placeholder="0700000000"
                  className="w-full bg-white dark:bg-slate-700 text-gray-900 dark:text-white border border-gray-300 dark:border-slate-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
              <div className="w-full">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Role
                  </label>
                  <select
                    value={currentUserData.privilege}
                    onChange={(e) =>
                      setCurrentUserData({
                        ...currentUserData,
                        privilege: e.target.value as Privilege,
                      })
                    }
                    className="w-full bg-white dark:bg-slate-700 text-gray-900 dark:text-white border border-gray-300 dark:border-slate-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  >
                    <option value="none">User</option>
                    <option value="super_admin">Admin</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2 border border-gray-300 dark:border-slate-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium flex items-center justify-center gap-2"
                >
                  <Save size={16} /> Save User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsersKYC;
