"use client";
import { useState, type FC } from "react";
import {
  transactions as allTransactions,
  linkedMethods,
} from "@/services/mockData";
import TransactionTable from "./TransactionTable";
import {
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Shield,
  CreditCard,
  Smartphone,
  AlertTriangle,
  Edit,
  Save,
  Ban,
  MessageSquare,
  FileText,
} from "lucide-react";
import { useNotificationStore } from "@/store";

type Props = {
  user: User;
};
const AdminUserProfile: FC<Props> = ({ user }) => {
  // Find user or fallback to first user for safety
  // const initialUser = mockUsers.find((u) => u.id === "u123") || mockUsers[0];
  const notify = useNotificationStore((state) => state.notify);
  const [currentUser, setUser] = useState<User>(user);
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "overview" | "transactions" | "notes"
  >("overview");
  const [adminNote, setAdminNote] = useState("");
  const [notes, setNotes] = useState<
    { id: string; text: string; date: string; author: string }[]
  >([
    {
      id: "1",
      text: "User requested limit increase. Pending review.",
      date: "2023-10-20",
      author: "System",
    },
  ]);

  // Filter transactions for this user
  // In a real app, this would be an API call
  const userTransactions = allTransactions.filter(
    (t) =>
      t.recipient === user.name ||
      t.id.includes(String(currentUser.id)) ||
      // eslint-disable-next-line react-hooks/purity
      Math.random() > 0.7, // Mocking ownership
  );

  const handleSaveProfile = () => {
    setIsEditing(false);
    notify("success", "User profile updated successfully.");
  };

  const toggleUserStatus = () => {
    // Determine logic for suspension (Mock)
    const action = "suspended";
    notify("warning", `User has been ${action}.`);
  };

  const handleAddNote = () => {
    if (!adminNote.trim()) return;
    const newNote = {
      id: Date.now().toString(),
      text: adminNote,
      date: new Date().toISOString().split("T")[0],
      author: "Admin",
    };
    setNotes([newNote, ...notes]);
    setAdminNote("");
    notify("success", "Note added to user file.");
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header / Nav */}
      <div className="flex items-center gap-4">
        <button
          // onClick={onBack}
          className="p-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
            User Profile
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Viewing details for {user.name}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Profile Card */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm p-6 text-center">
            <div className="w-24 h-24 bg-indigo-100 dark:bg-indigo-900/50 rounded-full flex items-center justify-center text-indigo-700 dark:text-indigo-300 font-bold text-3xl mx-auto mb-4 border-4 border-white dark:border-slate-700 shadow-sm">
              {user.name.charAt(0)}
            </div>

            {isEditing ? (
              <input
                type="text"
                value={user.name}
                onChange={(e) => setUser({ ...user, name: e.target.value })}
                className="text-center font-bold text-xl w-full bg-gray-50 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded px-2 py-1 mb-1 focus:ring-2 focus:ring-indigo-500 outline-none dark:text-white"
              />
            ) : (
              <h3 className="font-bold text-xl text-gray-900 dark:text-white">
                {user.name}
              </h3>
            )}

            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              Customer ID: {user.id}
            </p>

            <div className="flex justify-center gap-2 mb-6">
              <span
                // className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wide border ${
                //   currentUser.status
                //     ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800"
                //     : user.kycStatus === "PENDING"
                //       ? "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800"
                //       : "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800"
                // }`}
                className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wide border ${
                  currentUser.status
                    ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800"
                    : "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800"
                }`}
              >
                {user.status ? "VERIFIED" : "PENDING"}
              </span>
              <span className="px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wide bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-slate-600">
                {user.privilege === "super_admin" ? "ADMIN" : "USER"}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {isEditing ? (
                <button
                  onClick={handleSaveProfile}
                  className="flex items-center justify-center gap-2 w-full py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  <Save size={16} /> Save
                </button>
              ) : (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center justify-center gap-2 w-full py-2 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-white hover:bg-gray-50 dark:hover:bg-slate-600 rounded-lg text-sm font-medium transition-colors"
                >
                  <Edit size={16} /> Edit
                </button>
              )}

              <button
                onClick={toggleUserStatus}
                className="flex items-center justify-center gap-2 w-full py-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 rounded-lg text-sm font-medium transition-colors"
              >
                <Ban size={16} /> Suspend
              </button>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm p-6">
            <h4 className="font-bold text-gray-900 dark:text-white mb-4 text-sm uppercase tracking-wider">
              Contact Info
            </h4>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gray-100 dark:bg-slate-700 rounded text-gray-500 dark:text-gray-400">
                  <Mail size={16} />
                </div>
                <div className="flex-1 overflow-hidden">
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Email Address
                  </p>
                  <p
                    className="text-sm font-medium text-gray-900 dark:text-white truncate"
                    title={user.email}
                  >
                    {user.email}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gray-100 dark:bg-slate-700 rounded text-gray-500 dark:text-gray-400">
                  <Phone size={16} />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Phone
                  </p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    +256 772 123 456
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gray-100 dark:bg-slate-700 rounded text-gray-500 dark:text-gray-400">
                  <MapPin size={16} />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Location
                  </p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    Kampala, Uganda
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gray-100 dark:bg-slate-700 rounded text-gray-500 dark:text-gray-400">
                  <Calendar size={16} />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Joined Date
                  </p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {user.created_at || "Jan 15, 2023"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Details Tabs */}
        <div className="lg:col-span-2 space-y-6">
          {/* Tabs */}
          <div className="flex bg-white dark:bg-slate-800 rounded-lg p-1 border border-gray-200 dark:border-slate-700 shadow-sm">
            {["overview", "transactions", "notes"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as never)}
                className={`flex-1 py-2 text-sm font-medium rounded-md transition-all capitalize ${
                  activeTab === tab
                    ? "bg-indigo-50 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 shadow-sm"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm overflow-hidden min-h-[500px]">
            {activeTab === "overview" && (
              <div className="p-6 space-y-8">
                {/* Financial Summary */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/20 p-5 rounded-xl border border-indigo-100 dark:border-indigo-800">
                    <p className="text-indigo-600 dark:text-indigo-400 text-sm font-semibold mb-1">
                      Wallet Balance (UGX)
                    </p>
                    <h3 className="text-3xl font-bold text-gray-900 dark:text-white">
                      {user?.wallet?.balance.toLocaleString()}
                    </h3>
                  </div>
                  <div className="bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 p-5 rounded-xl border border-emerald-100 dark:border-emerald-800">
                    <p className="text-emerald-600 dark:text-emerald-400 text-sm font-semibold mb-1">
                      Wallet Balance (USD)
                    </p>
                    <h3 className="text-3xl font-bold text-gray-900 dark:text-white">
                      ${(Number(user?.wallet?.balance) / 3670).toLocaleString()}
                    </h3>
                  </div>
                </div>

                {/* Linked Methods */}
                <div>
                  <h4 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <CreditCard size={18} /> Linked Payment Methods
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {linkedMethods.length > 0 ? (
                      linkedMethods.map((method) => (
                        <div
                          key={method.id}
                          className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-700/50 rounded-lg border border-gray-200 dark:border-slate-700"
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={`p-2 rounded-lg ${method.type === "MOBILE_MONEY" ? "bg-yellow-100 text-yellow-600" : "bg-blue-100 text-blue-600"}`}
                            >
                              {method.type === "MOBILE_MONEY" ? (
                                <Smartphone size={20} />
                              ) : (
                                <CreditCard size={20} />
                              )}
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900 dark:text-white text-sm">
                                {method.name}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                {method.detail}
                              </p>
                            </div>
                          </div>
                          <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
                            Verified
                          </span>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-gray-500 italic">
                        No linked payment methods.
                      </p>
                    )}
                  </div>
                </div>

                {/* KYC Documents */}
                <div>
                  <h4 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <Shield size={18} /> KYC Documentation
                  </h4>
                  <div className="border border-gray-200 dark:border-slate-700 rounded-lg overflow-hidden">
                    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-700/30 border-b border-gray-200 dark:border-slate-700">
                      <div className="flex items-center gap-3">
                        <FileText className="text-gray-500" size={20} />
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            National_ID_Front.jpg
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Uploaded on Jan 20, 2023
                          </p>
                        </div>
                      </div>
                      <button className="text-indigo-600 dark:text-indigo-400 text-sm hover:underline font-medium">
                        View Document
                      </button>
                    </div>
                    {user.status && (
                      <div className="p-4 bg-yellow-50 dark:bg-yellow-900/10 flex items-center justify-between">
                        <div className="flex items-center gap-2 text-yellow-700 dark:text-yellow-400 text-sm">
                          <AlertTriangle size={16} />
                          <span>Verification Required</span>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() =>
                              notify("success", "Document approved")
                            }
                            className="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => notify("error", "Document rejected")}
                            className="px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700"
                          >
                            Reject
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === "transactions" && (
              <div className="h-full flex flex-col">
                <TransactionTable
                  transactions={userTransactions}
                  limit={8}
                  title={`History for ${user.name}`}
                />
              </div>
            )}

            {activeTab === "notes" && (
              <div className="p-6 h-full flex flex-col">
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Add Admin Note
                  </label>
                  <div className="flex gap-2">
                    <textarea
                      value={adminNote}
                      onChange={(e) => setAdminNote(e.target.value)}
                      placeholder="Enter details about account actions, support calls, etc."
                      className="flex-1 bg-gray-50 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg p-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none text-gray-900 dark:text-white resize-none"
                      rows={3}
                    />
                  </div>
                  <div className="flex justify-end mt-2">
                    <button
                      onClick={handleAddNote}
                      disabled={!adminNote.trim()}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      <MessageSquare size={16} /> Add Note
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-bold text-gray-900 dark:text-white text-sm uppercase tracking-wider">
                    Note History
                  </h4>
                  {notes.length > 0 ? (
                    notes.map((note) => (
                      <div
                        key={note.id}
                        className="bg-gray-50 dark:bg-slate-700/50 p-4 rounded-lg border border-gray-200 dark:border-slate-700"
                      >
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-semibold text-xs text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 px-2 py-0.5 rounded">
                            {note.author}
                          </span>
                          <span className="text-xs text-gray-400 dark:text-gray-500">
                            {note.date}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                          {note.text}
                        </p>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-12 text-gray-400">
                      No notes recorded for this user.
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminUserProfile;
