"use client";
import React from "react";
import { AlertTriangle, CheckCircle, Trash2 } from "lucide-react";

interface ActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  type?: "danger" | "warning" | "success" | "info";
  isLoading?: boolean;
}

const ActionModal: React.FC<ActionModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  type = "danger",
  isLoading = false,
}) => {
  if (!isOpen) return null;

  const getIcon = () => {
    switch (type) {
      case "danger":
        return <Trash2 className="w-6 h-6 text-red-600" />;
      case "warning":
        return <AlertTriangle className="w-6 h-6 text-yellow-600" />;
      case "success":
        return <CheckCircle className="w-6 h-6 text-green-600" />;
      default:
        return <AlertTriangle className="w-6 h-6 text-blue-600" />;
    }
  };

  const getColors = () => {
    switch (type) {
      case "danger":
        return "bg-red-600 hover:bg-red-700 focus:ring-red-500";
      case "warning":
        return "bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500";
      case "success":
        return "bg-green-600 hover:bg-green-700 focus:ring-green-500";
      default:
        return "bg-blue-600 hover:bg-blue-700 focus:ring-blue-500";
    }
  };

  const getIconBg = () => {
    switch (type) {
      case "danger":
        return "bg-red-100 dark:bg-red-900/30";
      case "warning":
        return "bg-yellow-100 dark:bg-yellow-900/30";
      case "success":
        return "bg-green-100 dark:bg-green-900/30";
      default:
        return "bg-blue-100 dark:bg-blue-900/30";
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div
        className="bg-white dark:bg-slate-800 rounded-xl shadow-xl w-full max-w-sm overflow-hidden transform transition-all animate-fade-in-up"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-headline"
      >
        <div className="p-6">
          <div className="flex items-start gap-4">
            <div
              className={`mx-auto flex h-12 w-12 shrink-0 items-center justify-center rounded-full sm:mx-0 sm:h-10 sm:w-10 ${getIconBg()}`}
            >
              {getIcon()}
            </div>
            <div className="flex-1">
              <h3
                className="text-lg font-bold text-gray-900 dark:text-white"
                id="modal-headline"
              >
                {title}
              </h3>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                {description}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-gray-50 dark:bg-slate-700/30 px-6 py-4 flex flex-row-reverse gap-3">
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className={`inline-flex justify-center w-full sm:w-auto px-4 py-2 text-base font-medium text-white rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 ${getColors()} disabled:opacity-75 disabled:cursor-not-allowed transition-colors`}
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Processing...
              </span>
            ) : (
              confirmLabel
            )}
          </button>
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="inline-flex justify-center w-full sm:w-auto px-4 py-2 text-base font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 rounded-lg shadow-sm hover:bg-gray-50 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
          >
            {cancelLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ActionModal;
