"use client";
import React, { useState } from "react";
import { mockSystemNotifications } from "../services/mockData";
import {
  AlertCircle,
  CheckCircle,
  Info,
  ChevronLeft,
  ChevronRight,
  Clock,
  Bell,
} from "lucide-react";

const notificationFilters: NotificationFilter[] = [
  "ALL",
  "ALERT",
  "INFO",
  "SUCCESS",
];
const ActivityLog: React.FC = () => {
  const [notifications] = useState<SystemNotification[]>(
    mockSystemNotifications,
  );
  const [filter, setFilter] = useState<NotificationFilter>("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const filteredNotifications = notifications.filter(
    (n) => filter === "ALL" || n.type === filter,
  );

  const totalPages = Math.ceil(filteredNotifications.length / itemsPerPage);
  const paginatedNotifications = filteredNotifications.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const getIcon = (type: string) => {
    switch (type) {
      case "ALERT":
        return (
          <AlertCircle
            size={20}
            className="text-orange-600 dark:text-orange-400"
          />
        );
      case "SUCCESS":
        return (
          <CheckCircle
            size={20}
            className="text-green-600 dark:text-green-400"
          />
        );
      default:
        return <Info size={20} className="text-blue-600 dark:text-blue-400" />;
    }
  };

  const getBgColor = (type: string) => {
    switch (type) {
      case "ALERT":
        return "bg-orange-100 dark:bg-orange-900/20";
      case "SUCCESS":
        return "bg-green-100 dark:bg-green-900/20";
      default:
        return "bg-blue-100 dark:bg-blue-900/20";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
            Activity Log
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            View all system notifications and alerts.
          </p>
        </div>

        {/* Filters */}
        <div className="flex bg-white dark:bg-slate-800 rounded-lg p-1 border border-gray-200 dark:border-slate-700 shadow-sm">
          {notificationFilters.map((f) => (
            <button
              key={f}
              onClick={() => {
                setFilter(f);
                setCurrentPage(1);
              }}
              className={`px-4 cursor-pointer py-2 text-xs font-medium rounded-md transition-all ${
                filter === f
                  ? "bg-indigo-50 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-slate-700"
              }`}
            >
              {f.charAt(0) + f.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm overflow-hidden flex flex-col min-h-[600px] transition-colors">
        <div className="flex-1">
          {paginatedNotifications.length > 0 ? (
            <div className="divide-y divide-gray-100 dark:divide-slate-700">
              {paginatedNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className="p-5 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors flex gap-4 items-start group"
                >
                  <div
                    className={`mt-1 flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${getBgColor(notification.type)}`}
                  >
                    {getIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-1">
                      <h3
                        className={`font-semibold text-gray-900 dark:text-white ${!notification.read ? "flex items-center gap-2" : ""}`}
                      >
                        {notification.title}
                        {!notification.read && (
                          <span className="w-2 h-2 bg-indigo-500 rounded-full inline-block"></span>
                        )}
                      </h3>
                      <span className="text-xs text-gray-400 dark:text-gray-500 flex items-center gap-1">
                        <Clock size={12} /> {notification.time}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                      {notification.message}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full py-20 text-gray-400 dark:text-gray-500">
              <Bell size={48} className="mb-4 opacity-50" />
              <p>No activity found for this category.</p>
            </div>
          )}
        </div>

        {/* Pagination Footer */}
        {filteredNotifications.length > 0 && (
          <div className="bg-gray-50 dark:bg-slate-700/30 border-t border-gray-200 dark:border-slate-700 px-6 py-4 flex items-center justify-between">
            <span className="text-xs text-gray-500 dark:text-gray-400">
              Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
              {Math.min(
                currentPage * itemsPerPage,
                filteredNotifications.length,
              )}{" "}
              of {filteredNotifications.length} items
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-2 border cursor-pointer border-gray-300 dark:border-slate-600 rounded hover:bg-white dark:hover:bg-slate-700 disabled:opacity-50 text-gray-600 dark:text-gray-300 transition-colors"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                disabled={currentPage === totalPages}
                className="p-2 border cursor-pointer border-gray-300 dark:border-slate-600 rounded hover:bg-white dark:hover:bg-slate-700 disabled:opacity-50 text-gray-600 dark:text-gray-300 transition-colors"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ActivityLog;
