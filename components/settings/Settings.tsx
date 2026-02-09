"use client";

import Profile from "./Profile";
import Security from "./Security";
import { useAppStore } from "@/store";
type UserProps = {
  user: User;
};
const Settings = ({ user }: UserProps) => {
  const activeTab = useAppStore((state) => state.activeSecurityTab);
  const setActiveTab = useAppStore((state) => state.setActiveSecurityTab);

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
          {(["profile", "security"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
                activeTab === tab
                  ? "bg-indigo-50 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 shadow-sm"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-slate-700"
              }`}
            >
              {tab === "profile" ? "Profile" : "Security"}
            </button>
          ))}
        </div>
      </div>

      {activeTab === "profile" && <Profile user={user} />}

      {activeTab === "security" && <Security />}
    </div>
  );
};

export default Settings;
