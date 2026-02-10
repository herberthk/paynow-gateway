"use client";
import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  Menu,
  Bell,
  Search,
  ChevronDown,
  Sun,
  Moon,
  LogOut,
  Wallet,
  Shield,
} from "lucide-react";
import NotificationPopup from "./NotificationPopup";
import { useThemeStore } from "@/store";
import { useAppStore, useNotificationStore } from "@/store";
import { logout } from "@/lib";
import {
  getNotifications,
  getUnreadNotificationsCount,
  markAllNotificationsAsRead,
  deleteAllNotifications,
} from "@/lib/actions/notifications";

type UserProps = {
  user: User;
};

const Header: React.FC<UserProps> = ({ user }) => {
  // const logout = useAppStore((state) => state.logout);
  const setIsOpen = useAppStore((state) => state.setIsSidebarOpen);
  const isOpen = useAppStore((state) => state.isSidebarOpen);
  // const setActiveTab = useAppStore((state) => state.setActiveTab);
  const notify = useNotificationStore((state) => state.notify);
  const theme = useThemeStore((state) => state.theme);
  const toggleTheme = useThemeStore((state) => state.toggleTheme);
  const [notifications, setNotifications] = useState<SystemNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  // const [initialLoad, setInitialLoad] = useState(true);

  const notificationRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  const fetchData = useCallback(async () => {
    if (!user?.id) return;
    try {
      const [{ notifications }, count] = await Promise.all([
        getNotifications({ userId: user.id, limit: 4 }),
        getUnreadNotificationsCount({ userId: user.id }),
      ]);
      setNotifications(notifications as SystemNotification[]);
      setUnreadCount(count);
    } catch (error) {
      console.error("Failed to fetch notifications", error);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchData();
    // Optional: Poll for new notifications
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const handleMarkAllRead = async () => {
    if (!user?.id) return;
    setIsLoading(true);
    await markAllNotificationsAsRead({ userId: user.id });
    await fetchData(); // Refresh to ensure state sync, or optimistically update
    setIsLoading(false);
    notify("success", "All notifications marked as read");
  };

  const handleClear = async () => {
    if (!user?.id) return;
    setIsLoading(true);
    await deleteAllNotifications({ userId: user.id });
    await fetchData();
    setIsLoading(false);
    notify("success", "Notifications cleared");
  };

  // Close popup when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target as Node)
      ) {
        setIsNotificationsOpen(false);
      }
      if (
        profileRef.current &&
        !profileRef.current.contains(event.target as Node)
      ) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getKycStatusColor = (status?: string) => {
    switch (status) {
      case "VERIFIED":
        return "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300";
      case "PENDING":
        return "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300";
      default:
        return "bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300";
    }
  };
  const handleLogout = async () => {
    await logout();
    notify("info", "You have been logged out.");
  };
  // useEffect(() => {
  //   if (isNotificationsOpen) {
  //     fetchData();
  //   }
  // }, [isNotificationsOpen]);
  // console.log("is loading", isLoading);
  return (
    <header className="bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 h-16 flex items-center justify-between px-4 lg:px-8 sticky top-0 z-10 transition-colors duration-200">
      <div className="flex items-center gap-4">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="lg:hidden p-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg text-gray-600 dark:text-gray-300"
        >
          <Menu size={24} />
        </button>

        {/* Search Bar - Hidden on small mobile */}
        <div className="hidden md:flex items-center bg-gray-100 dark:bg-slate-700 rounded-full px-4 py-2 w-64 lg:w-96 transition-colors">
          <Search size={18} className="text-gray-400 dark:text-gray-500 mr-2" />
          <input
            type="text"
            placeholder="Search transactions, users..."
            className="bg-transparent border-none focus:outline-none text-sm w-full text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
          />
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-4">
        {/* Role Badge */}
        {/* <div
          className={`hidden sm:block px-3 py-1 rounded-full text-xs font-semibold border ${
            user?.role === "ADMIN"
              ? "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800"
              : "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800"
          }`}
        >
          {user?.role}
        </div> */}

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-slate-700 rounded-full text-gray-600 dark:text-gray-300 transition-colors"
          title={
            theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"
          }
        >
          {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
        </button>

        {/* Notifications */}
        <div className="relative" ref={notificationRef}>
          <button
            onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
            className="relative p-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-slate-700 rounded-full text-gray-600 dark:text-gray-300 transition-colors"
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-2 flex min-w-[20px] min-h-[20px] items-center text-center justify-center rounded-full bg-red-500 text-[11px] font-medium text-white ring-2 ring-white dark:ring-slate-800 animate-pulse">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>

          <NotificationPopup
            isOpen={isNotificationsOpen}
            notifications={notifications}
            onMarkAllRead={handleMarkAllRead}
            onClear={handleClear}
            onClose={() => setIsNotificationsOpen(false)}
            unreadCount={unreadCount}
            isLoading={isLoading}
          />
        </div>

        {/* User Profile */}
        <div
          className="relative pl-2 sm:pl-4 border-l border-gray-200 dark:border-slate-700"
          ref={profileRef}
        >
          <button
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-700/50 p-2 rounded-lg transition-colors outline-none"
          >
            <div className="hidden md:block text-right">
              <p className="text-sm font-semibold text-gray-900 dark:text-white">
                {user?.name}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {user?.email}
              </p>
            </div>
            <div className="w-9 h-9 bg-indigo-100 dark:bg-indigo-900/50 rounded-full flex items-center justify-center text-indigo-700 dark:text-indigo-300 font-bold border border-indigo-200 dark:border-indigo-800">
              {user?.name.charAt(0)}
            </div>
            <ChevronDown
              size={16}
              className={`text-gray-400 dark:text-gray-500 transition-transform duration-200 ${isProfileOpen ? "rotate-180" : ""} hidden md:block`}
            />
          </button>

          {isProfileOpen && (
            <div className="absolute right-0 top-14 w-72 bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-gray-100 dark:border-slate-700 z-50 overflow-hidden animate-fade-in-up origin-top-right transition-colors">
              {/* Header */}
              <div className="p-4 border-b border-gray-100 dark:border-slate-700 flex items-center gap-4 bg-gray-50/50 dark:bg-slate-700/50">
                <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/50 rounded-full flex items-center justify-center text-indigo-700 dark:text-indigo-300 font-bold text-lg border border-indigo-200 dark:border-indigo-800">
                  {user?.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-gray-900 dark:text-white truncate">
                    {user?.name}
                  </h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    {user?.email}
                  </p>
                  <span
                    className={`text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded mt-1 inline-block border ${
                      user?.privilege === "super_admin"
                        ? "bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border-purple-100 dark:border-purple-800"
                        : "bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-100 dark:border-blue-800"
                    }`}
                  >
                    {user?.privilege !== "super_admin" ? "USER" : "ADMIN"}
                  </span>
                </div>
              </div>

              {/* Body */}
              <div className="p-4 space-y-3">
                <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-slate-700/50 rounded-lg border border-gray-100 dark:border-slate-700">
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                    <Wallet size={16} className="text-indigo-500" />
                    <span>Balance</span>
                  </div>
                  <span className="font-bold text-indigo-600 dark:text-indigo-400 text-sm">
                    UGX {user?.wallet?.balance.toLocaleString()}
                  </span>
                </div>

                <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-slate-700/50 rounded-lg border border-gray-100 dark:border-slate-700">
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                    <Shield size={16} className="text-gray-500" />
                    <span>KYC Status</span>
                  </div>
                  <span
                    className={`text-xs px-2 py-1 rounded-full font-bold ${getKycStatusColor(user?.status ? "VERIFIED" : "PENDING")}`}
                  >
                    {user?.status ? "VERIFIED" : "PENDING"}
                  </span>
                </div>
              </div>

              {/* Footer */}
              <div className="p-2 border-t border-gray-100 dark:border-slate-700 bg-gray-50/50 dark:bg-slate-700/30">
                <button
                  onClick={handleLogout}
                  className="w-full flex cursor-pointer items-center justify-center gap-2 p-2.5 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors text-sm font-medium"
                >
                  <LogOut size={16} /> Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
