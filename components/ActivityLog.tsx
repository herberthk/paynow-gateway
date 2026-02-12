"use client";
import React, { useEffect, useState, useCallback } from "react";
import {
  AlertCircle,
  CheckCircle,
  Info,
  ChevronLeft,
  ChevronRight,
  Clock,
  Bell,
  Trash2,
  Check,
  Loader2,
} from "lucide-react";
import {
  getNotifications,
  markNotificationAsRead,
  deleteNotification,
} from "../lib/actions/notifications";
import { getUserSession } from "@/lib/actions/session";
import Link from "next/link";

const notificationFilters: NotificationFilter[] = [
  "ALL",
  "ALERT",
  "INFO",
  "SUCCESS",
];

// Define SystemNotification interface based on prisma model if not available globally
// interface SystemNotification {
//   id: string;
//   userId: number;
//   title: string;
//   message: string;
//   type: NotificationType;
//   read: boolean;
//   createdAt: Date;
// }

const ActivityLog: React.FC = () => {
  const [notifications, setNotifications] = useState<SystemNotification[]>([]);
  const [filter, setFilter] = useState<NotificationFilter>("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState<number | null>(null);

  const itemsPerPage = 8;

  useEffect(() => {
    const fetchUser = async () => {
      const session = await getUserSession();
      if (session && session.id) {
        setUserId(session.id);
      }
    };
    fetchUser();
  }, []);

  const fetchNotifications = useCallback(async () => {
    if (!userId) return;
    setIsLoading(true);
    try {
      const { notifications, totalPages } = await getNotifications({
        userId,
        page: currentPage,
        limit: itemsPerPage,
        type: filter,
      });
      setNotifications(notifications as SystemNotification[]); // Casting might be needed if types don't perfectly align
      setTotalPages(totalPages);
    } catch (error) {
      console.error("Failed to fetch notifications", error);
    } finally {
      setIsLoading(false);
    }
  }, [userId, currentPage, filter]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const handleMarkAsRead = async (id: string) => {
    await markNotificationAsRead({ id });
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
    );
  };

  const handleDelete = async (id: string) => {
    await deleteNotification({ id });
    fetchNotifications(); // Re-fetch to update list and pagination
  };

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

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
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
        <div className="flex-1 relative">
          {isLoading && (
            <div className="absolute inset-0 bg-white/50 dark:bg-slate-800/50 flex items-center justify-center z-10">
              <Loader2 className="animate-spin text-indigo-500" size={32} />
            </div>
          )}
          {notifications.length > 0 ? (
            <div className="divide-y divide-gray-100 dark:divide-slate-700">
              {notifications.map((notification) => (
                <Link
                  key={notification.id}
                  href={notification.path}
                  className="p-5 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors flex gap-4 items-start group"
                >
                  <div
                    className={`mt-1 shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${getBgColor(notification.type)}`}
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
                        <Clock size={12} /> {formatDate(notification.createdAt)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed mb-2">
                      {notification.message}
                    </p>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      {!notification.read && (
                        <button
                          onClick={() => handleMarkAsRead(notification.id)}
                          className="text-xs flex items-center gap-1 text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
                        >
                          <Check size={14} /> Mark as read
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(notification.id)}
                        className="text-xs flex items-center gap-1 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                      >
                        <Trash2 size={14} /> Delete
                      </button>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            !isLoading && (
              <div className="flex flex-col items-center justify-center h-full py-20 text-gray-400 dark:text-gray-500">
                <Bell size={48} className="mb-4 opacity-50" />
                <p>No activity found for this category.</p>
              </div>
            )
          )}
        </div>

        {/* Pagination Footer */}
        {totalPages > 0 && (
          <div className="bg-gray-50 dark:bg-slate-700/30 border-t border-gray-200 dark:border-slate-700 px-6 py-4 flex items-center justify-between">
            <span className="text-xs text-gray-500 dark:text-gray-400">
              Page {currentPage} of {totalPages}
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
