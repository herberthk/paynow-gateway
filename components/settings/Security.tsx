import { Lock, AlertTriangle } from "lucide-react";
import { useState } from "react";
import { updatePassword } from "@/lib";
import FeedbackModal from "./FeedbackModal";
import { useNotificationStore } from "@/store";

const Security = () => {
  const notify = useNotificationStore((state) => state.notify);
  const [isSaving, setIsSaving] = useState(false);

  const [feedback, setFeedback] = useState<{
    isOpen: boolean;
    type: "success" | "error";
    title: string;
    message: string;
  }>({
    isOpen: false,
    type: "success",
    title: "",
    message: "",
  });

  // Security State
  const [passwords, setPasswords] = useState({
    current: "",
    new: "",
    confirm: "",
  });

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwords.new.length < 8 || passwords.current.length < 8) {
      notify("info", "Password must be at least 8 characters long.");
      return;
    }
    if (passwords.new !== passwords.confirm) {
      notify("info", "Passwords do not match");
      return;
    }
    setIsSaving(true);
    try {
      const res = await updatePassword({
        currentPassword: passwords.current,
        newPassword: passwords.new,
      });

      if (res.type === "error") {
        setFeedback({
          isOpen: true,
          type: "error",
          title: "Update Failed",
          message: res.message,
        });
      } else {
        setFeedback({
          isOpen: true,
          type: "success",
          title: "Password Updated",
          message: res.message,
        });
        setPasswords({ current: "", new: "", confirm: "" });
      }
      setIsSaving(false);
    } catch (e) {
      console.log(e);
      setFeedback({
        isOpen: true,
        type: "error",
        title: "Error",
        message: "Something went wrong",
      });
      setIsSaving(false);
    }
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
  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm p-6 transition-colors">
        <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Lock size={20} className="text-indigo-600 dark:text-indigo-400" />
          Change Password
        </h3>
        <form onSubmit={handlePasswordUpdate} className="space-y-4 max-w-lg">
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
            disabled={isSaving}
            className="bg-gray-900 hover:bg-black dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100 text-white font-medium py-2 px-6 rounded-lg transition-colors"
          >
            {isSaving ? "Saving..." : "Update Password"}
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
  );
};

export default Security;
