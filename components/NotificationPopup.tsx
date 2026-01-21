"use client";
import React from "react";
import {
  Bell,
  Check,
  Trash2,
  X,
  AlertCircle,
  Info,
  CheckCircle,
} from "lucide-react";
import Link from "next/link";

interface NotificationPopupProps {
  notifications: SystemNotification[];
  onMarkAllRead: () => void;
  onClear: () => void;
  onClose: () => void;
  // onViewAll: () => void;
  isOpen: boolean;
}

const NotificationPopup: React.FC<NotificationPopupProps> = ({
  notifications,
  onMarkAllRead,
  onClear,
  onClose,
  // onViewAll,
  isOpen,
}) => {
  if (!isOpen) return null;

  return (
    <div className="absolute right-0 top-16 mt-2 w-80 md:w-96 bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-gray-100 dark:border-slate-700 z-50 overflow-hidden animate-fade-in-up origin-top-right transition-colors">
      <div className="p-4 border-b border-gray-100 dark:border-slate-700 flex justify-between items-center bg-gray-50/50 dark:bg-slate-700/50">
        <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
          Notifications
          <span className="bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 text-xs px-2 py-0.5 rounded-full">
            {notifications.filter((n) => !n.read).length} new
          </span>
        </h3>
        <div className="flex items-center gap-1">
          <button
            onClick={onMarkAllRead}
            className="p-1.5 text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700"
            title="Mark all as read"
          >
            <Check size={16} />
          </button>
          <button
            onClick={onClear}
            className="p-1.5 text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700"
            title="Clear all"
          >
            <Trash2 size={16} />
          </button>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700"
            title="Close"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      <div className="max-h-[400px] overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="p-8 text-center text-gray-500 dark:text-gray-400 flex flex-col items-center">
            <Bell size={32} className="text-gray-300 dark:text-gray-600 mb-2" />
            <p className="text-sm">No notifications yet</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50 dark:divide-slate-700">
            {notifications.slice(0, 5).map((notification) => (
              <div
                key={notification.id}
                className={`p-4 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors ${!notification.read ? "bg-indigo-50/30 dark:bg-indigo-900/10" : ""}`}
              >
                <div className="flex gap-3">
                  <div
                    className={`mt-1 flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                      notification.type === "ALERT"
                        ? "bg-orange-100 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400"
                        : notification.type === "SUCCESS"
                          ? "bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400"
                          : "bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
                    }`}
                  >
                    {notification.type === "ALERT" && <AlertCircle size={14} />}
                    {notification.type === "SUCCESS" && (
                      <CheckCircle size={14} />
                    )}
                    {notification.type === "INFO" && <Info size={14} />}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-1">
                      <h4
                        className={`text-sm font-semibold ${!notification.read ? "text-gray-900 dark:text-white" : "text-gray-600 dark:text-gray-400"}`}
                      >
                        {notification.title}
                      </h4>
                      <span className="text-[10px] text-gray-400 dark:text-gray-500">
                        {notification.time}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed line-clamp-2">
                      {notification.message}
                    </p>
                  </div>
                  {!notification.read && (
                    <div className="mt-2 w-2 h-2 bg-indigo-500 rounded-full flex-shrink-0"></div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="p-3 border-t border-gray-100 dark:border-slate-700 bg-gray-50/50 dark:bg-slate-700/50 text-center">
        <Link
          href={"/dashboard/activity-logs"}
          onClick={() => {
            onClose();
          }}
          className="text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300"
        >
          View All Activity
        </Link>
      </div>
    </div>
  );
};

export default NotificationPopup;
