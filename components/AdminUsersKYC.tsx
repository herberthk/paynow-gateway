"use client";
import { useState, useEffect } from "react";
import { mockUsers } from "@/services/mockData";
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

const AdminUsersKYC = () => {
  const notify = useNotificationStore((state) => state.notify);
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [filter, setFilter] = useState<"ALL" | "PENDING" | "VERIFIED">("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [currentUserData, setCurrentUserData] = useState<Partial<User>>({
    name: "",
    email: "",
    role: "USER",
    kycStatus: "UNVERIFIED",
    wallet: { balanceUGX: 0, balanceUSD: 0, linkedMethods: [] },
  });

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const handleStatusChange = (
    userId: string,
    status: User["kycStatus"],
    e: React.MouseEvent,
  ) => {
    e.stopPropagation();
    setUsers(
      users.map((u) => (u.id === userId ? { ...u, kycStatus: status } : u)),
    );
    const message =
      status === "VERIFIED"
        ? "User approved successfully."
        : "User KYC rejected.";
    notify(status === "VERIFIED" ? "success" : "info", message);
  };

  const handleDeleteUser = (userId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (
      window.confirm(
        "Are you sure you want to remove this user? This action is irreversible.",
      )
    ) {
      setUsers(users.filter((u) => u.id !== userId));
      notify("info", "User deleted successfully.");
    }
  };

  const openCreateModal = () => {
    setModalMode("create");
    setCurrentUserData({
      name: "",
      email: "",
      role: "USER",
      kycStatus: "UNVERIFIED",
      wallet: { balanceUGX: 0, balanceUSD: 0, linkedMethods: [] },
    });
    setIsModalOpen(true);
  };

  const openEditModal = (user: User, e: React.MouseEvent) => {
    e.stopPropagation();
    setModalMode("edit");
    setCurrentUserData({ ...user });
    setIsModalOpen(true);
  };

  const handleSaveUser = () => {
    if (!currentUserData.name || !currentUserData.email) {
      notify("error", "Please fill in all required fields.");
      return;
    }

    if (modalMode === "create") {
      const newUser: User = {
        ...(currentUserData as User),
        id: `u_${Date.now()}`,
        joinDate: new Date().toISOString().split("T")[0],
        wallet: { balanceUGX: 0, balanceUSD: 0, linkedMethods: [] },
      };
      setUsers([newUser, ...users]);
      notify("success", "User account created successfully.");
    } else {
      setUsers(
        users.map((u) =>
          u.id === currentUserData.id ? { ...u, ...currentUserData } : u,
        ),
      );
      notify("success", "User profile updated.");
    }
    setIsModalOpen(false);
  };

  const filteredUsers = users.filter((u) => {
    const matchesFilter = filter === "ALL" || u.kycStatus === filter;
    const matchesSearch =
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  // Pagination Logic
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCurrentPage(1);
    setExpandedId(null);
  }, [filter, searchTerm]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "VERIFIED":
        return "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800";
      case "PENDING":
        return "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800";
      case "REJECTED":
        return "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800";
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
          <button
            onClick={openCreateModal}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
          >
            <Plus size={16} /> Add User
          </button>
          {/* Filter Tabs */}
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
        <div className="p-4 border-b border-gray-200 dark:border-slate-700 flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500"
              size={18}
            />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-white border border-gray-200 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white dark:focus:bg-slate-600 transition-all text-sm"
            />
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
              {paginatedUsers.map((user) => (
                <React.Fragment key={user.id}>
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
                          {user.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-white">
                            {user.name}
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
                          user.role === "ADMIN"
                            ? "bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border-purple-100 dark:border-purple-800"
                            : "bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-100 dark:border-blue-800"
                        }`}
                      >
                        {user.role === "ADMIN" && <Shield size={10} />}
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(user.kycStatus)}`}
                      >
                        {user.kycStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-500 dark:text-gray-400">
                      <div className="flex items-center gap-2">
                        <Calendar
                          size={14}
                          className="text-gray-400 dark:text-gray-500"
                        />
                        {user.joinDate || "2023-01-01"}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {user.kycStatus === "PENDING" && (
                          <>
                            <button
                              onClick={(e) =>
                                handleStatusChange(user.id, "VERIFIED", e)
                              }
                              className="p-1.5 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded hover:bg-green-100 dark:hover:bg-green-900/40 transition-colors"
                              title="Approve KYC"
                            >
                              <Check size={16} />
                            </button>
                            <button
                              onClick={(e) =>
                                handleStatusChange(user.id, "REJECTED", e)
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
                                    {user.wallet.balanceUGX.toLocaleString()}
                                  </span>
                                </div>
                                <div className="flex justify-between items-center">
                                  <span className="text-sm text-gray-600 dark:text-gray-400">
                                    USD
                                  </span>
                                  <span className="font-bold text-gray-900 dark:text-white">
                                    ${user.wallet.balanceUSD.toLocaleString()}
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
                                  <Phone size={14} className="text-gray-400" />
                                  {user.id === "u123"
                                    ? "+256 772 123 456"
                                    : "+256 700 000 000"}
                                </div>
                                <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                                  <MapPin size={14} className="text-gray-400" />
                                  Kampala, Uganda
                                </div>
                                <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                                  <Mail size={14} className="text-gray-400" />
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
                                {user.wallet.linkedMethods &&
                                user.wallet.linkedMethods.length > 0 ? (
                                  user.wallet.linkedMethods.map((m) => (
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
              {paginatedUsers.length === 0 && (
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
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {filteredUsers.length > 0 && (
          <div className="bg-gray-50 dark:bg-slate-700/30 border-t border-gray-200 dark:border-slate-700 px-6 py-4 flex items-center justify-between">
            <span className="text-xs text-gray-500 dark:text-gray-400">
              Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
              {Math.min(currentPage * itemsPerPage, filteredUsers.length)} of{" "}
              {filteredUsers.length} users
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-1.5 border border-gray-300 dark:border-slate-600 rounded hover:bg-white dark:hover:bg-slate-700 disabled:opacity-50 text-gray-600 dark:text-gray-300"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                disabled={currentPage === totalPages}
                className="p-1.5 border border-gray-300 dark:border-slate-600 rounded hover:bg-white dark:hover:bg-slate-700 disabled:opacity-50 text-gray-600 dark:text-gray-300"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

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

            <div className="space-y-4">
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
                  className="w-full bg-white dark:bg-slate-700 text-gray-900 dark:text-white border border-gray-300 dark:border-slate-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Role
                  </label>
                  <select
                    value={currentUserData.role}
                    onChange={(e) =>
                      setCurrentUserData({
                        ...currentUserData,
                        role: e.target.value as "USER" | "ADMIN",
                      })
                    }
                    className="w-full bg-white dark:bg-slate-700 text-gray-900 dark:text-white border border-gray-300 dark:border-slate-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  >
                    <option value="USER">User</option>
                    <option value="ADMIN">Admin</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Status
                  </label>
                  <select
                    value={currentUserData.kycStatus}
                    onChange={(e) =>
                      setCurrentUserData({
                        ...currentUserData,
                        kycStatus: e.target.value as never,
                      })
                    }
                    className="w-full bg-white dark:bg-slate-700 text-gray-900 dark:text-white border border-gray-300 dark:border-slate-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  >
                    <option value="UNVERIFIED">Unverified</option>
                    <option value="PENDING">Pending</option>
                    <option value="VERIFIED">Verified</option>
                    <option value="REJECTED">Rejected</option>
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
                  onClick={handleSaveUser}
                  className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium flex items-center justify-center gap-2"
                >
                  <Save size={16} /> Save User
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsersKYC;
