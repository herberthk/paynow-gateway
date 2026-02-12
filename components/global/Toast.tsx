"use client";
import React, { useEffect } from "react";
import { CheckCircle, AlertCircle, Info, X, AlertTriangle } from "lucide-react";
import { useNotificationStore } from "@/store/notification";

const Toast = () => {
  const notifications = useNotificationStore((state) => state.notifications);
  const removeNotification = useNotificationStore(
    (state) => state.removeNotification,
  );

  return (
    <div className="fixed top-4 right-4 z-100 flex flex-col gap-3">
      {notifications.map((notification) => (
        <ToastItem
          key={notification.id}
          notification={notification}
          remove={() => removeNotification(notification.id)}
        />
      ))}
    </div>
  );
};

const ToastItem: React.FC<{
  notification: Notifications;
  remove: () => void;
}> = ({ notification, remove }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      remove();
    }, 4000);
    return () => clearTimeout(timer);
  }, [remove]);

  const icons = {
    SUCCESS: (
      <CheckCircle className="text-green-500 dark:text-green-400" size={20} />
    ),
    ALERT: (
      <AlertTriangle className="text-red-500 dark:text-red-400" size={20} />
    ),
    INFO: <Info className="text-blue-500 dark:text-blue-400" size={20} />,
    WARNING: (
      <AlertCircle className="text-orange-500 dark:text-orange-400" size={20} />
    ),
  };

  const colors = {
    SUCCESS:
      "border-l-4 border-green-500 dark:border-green-600 bg-white dark:bg-slate-800",
    ALERT:
      "border-l-4 border-red-500 dark:border-red-600 bg-white dark:bg-slate-800",
    INFO: "border-l-4 border-blue-500 dark:border-blue-600 bg-white dark:bg-slate-800",
    WARNING:
      "border-l-4 border-orange-500 dark:border-orange-600 bg-white dark:bg-slate-800",
  };

  return (
    <div
      className={`flex items-start gap-3 p-4 rounded-lg shadow-lg border border-gray-100 dark:border-slate-700 min-w-[300px] transform transition-all animate-fade-in-left ${colors[notification.type]}`}
    >
      <div className="mt-0.5">{icons[notification.type]}</div>
      <div className="flex-1">
        <p
          className={`font-medium text-sm ${notification.type === "ALERT" ? "text-red-800 dark:text-red-200" : "text-gray-800 dark:text-gray-100"}`}
        >
          {notification.message}
        </p>
      </div>
      <button
        onClick={remove}
        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
      >
        <X size={16} />
      </button>
    </div>
  );
};

export default Toast;
