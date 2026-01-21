"use client";
import React, { useState, useEffect } from "react";
import {
  Upload,
  CheckCircle,
  Shield,
  User as UserIcon,
  Mail,
  Phone,
  MapPin,
  Save,
  Loader2,
  Lock,
  AlertTriangle,
  FileCheck,
} from "lucide-react";
import { useAppStore, useNotificationStore } from "@/store";
type UserProps = {
  user: User;
};
const KYCModule = ({ user }: UserProps) => {
  const [activeTab, setActiveTab] = useState<"profile" | "kyc" | "security">(
    "profile",
  );

  const notify = useNotificationStore((state) => state.notify);
  const updateUser = useAppStore((state) => state.handleUpdateUser);
  // Profile State
  const [formData, setFormData] = useState({
    name: user?.name,
    email: user?.email,
    phone: "+256 700 000000", // Mock data as it's not in User type
    address: "Kampala, Uganda", // Mock data
  });
  const [isSaving, setIsSaving] = useState(false);

  // KYC State
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<string | null>(null);

  // Security State
  const [passwords, setPasswords] = useState({
    current: "",
    new: "",
    confirm: "",
  });
  const handleUpdateUser = (updatedData: Partial<User>) => {
    if (user) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      //@ts-expect-error
      updateUser(updatedData);
      notify("success", "Profile updated successfully.");
    }
  };
  // Sync prop changes to local state
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setFormData((prev) => ({
      ...prev,
      name: user?.name,
      email: user?.email,
    }));
  }, [user]);

  // CRUD: Update Profile
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    // Simulate API call
    setTimeout(() => {
      handleUpdateUser({ name: formData?.name, email: formData?.email });
      setIsSaving(false);
    }, 1500);
  };

  // CRUD: Create/Update Verification Document
  const handleFileUpload = () => {
    setIsUploading(true);
    setUploadProgress(0);

    // Simulate upload progress
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 10;
      });
    }, 200);

    setTimeout(() => {
      setIsUploading(false);
      setUploadedFile("national_id_front.jpg");
      handleUpdateUser({ kycStatus: "PENDING" }); // Update status to pending
      notify(
        "success",
        "Document uploaded successfully. Verification in progress.",
      );
    }, 2500);
  };

  // CRUD: Delete Account (Simulation)
  const handleDeleteAccount = () => {
    if (
      window.confirm(
        "Are you sure you want to delete your account? This action cannot be undone.",
      )
    ) {
      notify("info", "Request received. Support will contact you shortly.");
    }
  };

  const handlePasswordUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwords.new !== passwords.confirm) {
      notify("error", "New passwords do not match.");
      return;
    }
    notify("success", "Password updated successfully.");
    setPasswords({ current: "", new: "", confirm: "" });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
            Account Settings
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Manage your personal information and security.
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex bg-white dark:bg-slate-800 p-1 rounded-lg border border-gray-200 dark:border-slate-700 shadow-sm transition-colors">
          {(["profile", "kyc", "security"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
                activeTab === tab
                  ? "bg-indigo-50 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 shadow-sm"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-slate-700"
              }`}
            >
              {tab === "profile"
                ? "Profile"
                : tab === "kyc"
                  ? "Verification"
                  : "Security"}
            </button>
          ))}
        </div>
      </div>

      {activeTab === "profile" && (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm overflow-hidden animate-fade-in-up transition-colors">
          <div className="p-6 border-b border-gray-100 dark:border-slate-700 bg-gray-50/50 dark:bg-slate-700/30">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 bg-indigo-100 dark:bg-indigo-900/50 rounded-full flex items-center justify-center text-indigo-600 dark:text-indigo-300 font-bold text-3xl border-4 border-white dark:border-slate-800 shadow-sm">
                {user?.name.charAt(0)}
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  {user?.name}
                </h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                  Personal Account • {user?.role}
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSaveProfile} className="p-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <UserIcon
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500"
                    size={18}
                  />
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full bg-white dark:bg-slate-700 text-gray-900 dark:text-white pl-10 pr-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500"
                    size={18}
                  />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="w-full bg-white dark:bg-slate-700 text-gray-900 dark:text-white pl-10 pr-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500"
                    size={18}
                  />
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    className="w-full bg-white dark:bg-slate-700 text-gray-900 dark:text-white pl-10 pr-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Address
                </label>
                <div className="relative">
                  <MapPin
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500"
                    size={18}
                  />
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) =>
                      setFormData({ ...formData, address: e.target.value })
                    }
                    className="w-full bg-white dark:bg-slate-700 text-gray-900 dark:text-white pl-10 pr-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <button
                type="submit"
                disabled={isSaving}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 px-6 rounded-lg transition-all flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isSaving ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <Save size={18} />
                )}
                {isSaving ? "Saving Changes..." : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      )}

      {activeTab === "kyc" && (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm p-8 animate-fade-in-up transition-colors">
          <div className="text-center mb-8">
            <div
              className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
                user?.kycStatus === "VERIFIED"
                  ? "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400"
                  : "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
              }`}
            >
              <Shield size={32} />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Identity Verification
            </h2>
            <p className="text-gray-500 dark:text-gray-400 mt-2">
              Current Status:{" "}
              <span
                className={`font-bold ${
                  user?.kycStatus === "VERIFIED"
                    ? "text-green-600 dark:text-green-400"
                    : user?.kycStatus === "PENDING"
                      ? "text-yellow-600 dark:text-yellow-400"
                      : "text-gray-600 dark:text-gray-300"
                }`}
              >
                {user?.kycStatus}
              </span>
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20 p-4 rounded-lg text-center">
              <CheckCircle
                className="mx-auto text-green-500 dark:text-green-400 mb-2"
                size={24}
              />
              <h3 className="font-bold text-gray-900 dark:text-white">
                Tier 1
              </h3>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Phone Verified
              </p>
              <p className="text-xs font-semibold text-green-700 dark:text-green-400 mt-2">
                Active
              </p>
            </div>
            <div
              className={`border-2 p-4 rounded-lg text-center relative shadow-sm transition-colors ${
                user?.kycStatus === "VERIFIED"
                  ? "border-green-500 dark:border-green-600 bg-green-50/30 dark:bg-green-900/10"
                  : "border-indigo-500 dark:border-indigo-600 bg-white dark:bg-slate-700"
              }`}
            >
              {user?.kycStatus !== "VERIFIED" && (
                <div className="absolute top-0 right-0 bg-indigo-500 text-white text-xs px-2 py-1 rounded-bl-lg">
                  Current
                </div>
              )}
              {user?.kycStatus === "VERIFIED" ? (
                <CheckCircle
                  className="mx-auto text-green-500 dark:text-green-400 mb-2"
                  size={24}
                />
              ) : (
                <Upload
                  className="mx-auto text-indigo-500 dark:text-indigo-400 mb-2"
                  size={24}
                />
              )}
              <h3 className="font-bold text-gray-900 dark:text-white">
                Tier 2
              </h3>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                National ID Upload
              </p>
              <p
                className={`text-xs font-semibold mt-2 ${user?.kycStatus === "VERIFIED" ? "text-green-700 dark:text-green-400" : "text-indigo-700 dark:text-indigo-400"}`}
              >
                {user?.kycStatus === "VERIFIED" ? "Verified" : "Required"}
              </p>
            </div>
            <div className="border border-gray-200 dark:border-slate-700 p-4 rounded-lg text-center opacity-60">
              <Shield
                className="mx-auto text-gray-400 dark:text-gray-500 mb-2"
                size={24}
              />
              <h3 className="font-bold text-gray-900 dark:text-white">
                Tier 3
              </h3>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Proof of Address
              </p>
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mt-2">
                Locked
              </p>
            </div>
          </div>

          {user?.kycStatus !== "VERIFIED" && user?.kycStatus !== "PENDING" && (
            <div className="space-y-4">
              {!isUploading && !uploadedFile ? (
                <div
                  onClick={handleFileUpload}
                  className="border-2 border-dashed border-gray-300 dark:border-slate-600 rounded-xl p-8 text-center hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors cursor-pointer group"
                >
                  <div className="w-12 h-12 bg-gray-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-indigo-100 dark:group-hover:bg-indigo-900/30 transition-colors">
                    <Upload
                      className="text-gray-400 dark:text-gray-500 group-hover:text-indigo-600 dark:group-hover:text-indigo-400"
                      size={24}
                    />
                  </div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    Click to upload National ID
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    JPG, PNG or PDF (Max 5MB)
                  </p>
                </div>
              ) : (
                <div className="border border-gray-200 dark:border-slate-600 rounded-xl p-6 bg-gray-50 dark:bg-slate-700">
                  <div className="flex items-center gap-3 mb-2">
                    <FileCheck
                      className="text-indigo-600 dark:text-indigo-400"
                      size={24}
                    />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {uploadedFile || "Uploading document..."}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        2.4 MB
                      </p>
                    </div>
                    {isUploading && (
                      <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                        {uploadProgress}%
                      </span>
                    )}
                  </div>
                  {isUploading && (
                    <div className="w-full bg-gray-200 dark:bg-slate-600 rounded-full h-2">
                      <div
                        className="bg-indigo-600 dark:bg-indigo-500 h-2 rounded-full transition-all duration-200"
                        style={{ width: `${uploadProgress}%` }}
                      ></div>
                    </div>
                  )}
                  {!isUploading && (
                    <div className="text-green-600 dark:text-green-400 text-sm font-medium flex items-center gap-1 mt-2">
                      <CheckCircle size={14} /> Upload Complete
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {user?.kycStatus === "PENDING" && (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 text-center">
              <Loader2
                className="animate-spin text-yellow-600 dark:text-yellow-400 mx-auto mb-2"
                size={24}
              />
              <h3 className="font-bold text-yellow-800 dark:text-yellow-200">
                Verification in Progress
              </h3>
              <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                Our team is reviewing your documents. This usually takes 24-48
                hours.
              </p>
            </div>
          )}
        </div>
      )}

      {activeTab === "security" && (
        <div className="space-y-6 animate-fade-in-up">
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm p-6 transition-colors">
            <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Lock
                size={20}
                className="text-indigo-600 dark:text-indigo-400"
              />
              Change Password
            </h3>
            <form
              onSubmit={handlePasswordUpdate}
              className="space-y-4 max-w-lg"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Current Password
                </label>
                <input
                  type="password"
                  value={passwords.current}
                  onChange={(e) =>
                    setPasswords({ ...passwords, current: e.target.value })
                  }
                  className="w-full bg-white dark:bg-slate-700 text-gray-900 dark:text-white px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  value={passwords.new}
                  onChange={(e) =>
                    setPasswords({ ...passwords, new: e.target.value })
                  }
                  className="w-full bg-white dark:bg-slate-700 text-gray-900 dark:text-white px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={passwords.confirm}
                  onChange={(e) =>
                    setPasswords({ ...passwords, confirm: e.target.value })
                  }
                  className="w-full bg-white dark:bg-slate-700 text-gray-900 dark:text-white px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
              <button
                type="submit"
                className="bg-gray-900 hover:bg-black dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100 text-white font-medium py-2 px-6 rounded-lg transition-colors"
              >
                Update Password
              </button>
            </form>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl border border-red-200 dark:border-red-900/50 shadow-sm p-6 transition-colors">
            <h3 className="font-bold text-red-600 dark:text-red-400 mb-2 flex items-center gap-2">
              <AlertTriangle size={20} />
              Danger Zone
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Once you delete your account, there is no going back. Please be
              certain.
            </p>
            <button
              onClick={handleDeleteAccount}
              className="border border-red-300 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 font-medium py-2 px-6 rounded-lg transition-colors"
            >
              Delete Account
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default KYCModule;
