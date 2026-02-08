"use client";
import React from "react";
import { LogOut } from "lucide-react";
import { useAppStore, useNotificationStore } from "@/store";
import { logout } from "@/lib";
import Link from "next/link";
import { menuItems } from "@/constants";
import { usePathname } from "next/navigation";

type UserProps = {
  user: User;
};
const Sidebar: React.FC<UserProps> = ({ user }) => {
  const notify = useNotificationStore((state) => state.notify);
  const isOpen = useAppStore((state) => state.isSidebarOpen);
  const setIsOpen = useAppStore((state) => state.setIsSidebarOpen);
  const handleLogout = async () => {
    await logout();
    notify("info", "You have been logged out.");
  };
  const pathname = usePathname();
  const items = menuItems(user.privilege);

  return (
    <>
      {/* Mobile Overlay */}
      <div
        className={`fixed inset-0 bg-black/50 z-20 lg:hidden transition-opacity ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}
        onClick={() => setIsOpen(false)}
      />

      {/* Sidebar Content */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-30 w-64 bg-white dark:bg-slate-900 border-r border-gray-200 dark:border-slate-700 transform transition-transform duration-300 ease-in-out ${isOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0 flex flex-col`}
      >
        <div className="p-6 border-b border-gray-200 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center font-bold text-white shadow-md">
              P
            </div>
            <span className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">
              PayNow
            </span>
          </div>
          <p className="text-xs text-gray-500 dark:text-slate-400 mt-1 ml-1">
            Enterprise Gateway
          </p>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {items.map((item) => (
            <Link
              key={item.id}
              href={item.href}
              onClick={() => {
                // setActiveTab(item.id);
                setIsOpen(false);
              }}
              className={`flex items-center w-full px-3 py-3 rounded-lg transition-all duration-200 cursor-pointer ${
                pathname === item.href
                  ? "bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 font-semibold"
                  : "text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-800"
              }`}
            >
              <item.icon
                size={20}
                className={`mr-3 ${pathname === item.href ? "text-indigo-600 dark:text-indigo-400" : "text-gray-400 dark:text-slate-500"}`}
              />
              <span className="text-sm">{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-200 dark:border-slate-800">
          <button
            onClick={handleLogout}
            className="flex items-center cursor-pointer w-full px-3 py-3 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
          >
            <LogOut size={20} className="mr-3" />
            <span className="font-medium text-sm">Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
