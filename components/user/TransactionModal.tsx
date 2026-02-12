"use client";
import {
  AlertCircle,
  CheckCircle,
  X,
  PartyPopper,
  ArrowRight,
  Send,
  Loader2,
} from "lucide-react";

type TransactionModalProps = {
  isOpen: boolean;
  type: "success" | "error" | "confirm";
  onClose: () => void;
  onAction?: () => void;
  // Success props
  recipientName?: string;
  recipientContact?: string;
  amount?: number;
  fee?: number;
  transactionRef?: string;
  // Error props
  errorMessage?: string;
  // Confirm props
  isProcessing?: boolean;
  // Action buttons
  actionLabel?: string;
  dismissLabel?: string;
};

const TransactionModal = ({
  isOpen,
  type,
  onClose,
  onAction,
  recipientName,
  recipientContact,
  amount = 0,
  fee = 200,
  transactionRef,
  errorMessage = "An error occurred",
  isProcessing = false,
  actionLabel,
  dismissLabel = "Dismiss",
}: TransactionModalProps) => {
  if (!isOpen) return null;

  const isSuccess = type === "success";
  const isConfirm = type === "confirm";

  // Color schemes
  const colors = {
    success: {
      gradient: "from-green-600 to-emerald-600",
      bg: "from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20",
      border: "border-green-200 dark:border-green-800",
      text: "text-green-600 dark:text-green-400",
      icon: "bg-green-100 dark:bg-green-900/30",
      button: "bg-green-600 hover:bg-green-700",
      accent: "text-green-100",
    },
    error: {
      gradient: "from-red-600 to-rose-600",
      bg: "from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20",
      border: "border-red-200 dark:border-red-800",
      text: "text-red-600 dark:text-red-400",
      icon: "bg-red-100 dark:bg-red-900/30",
      button: "bg-red-600 hover:bg-red-700",
      accent: "text-red-100",
    },
    confirm: {
      gradient: "from-indigo-600 to-purple-600",
      bg: "from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20",
      border: "border-indigo-200 dark:border-indigo-800",
      text: "text-indigo-600 dark:text-indigo-400",
      icon: "bg-indigo-100 dark:bg-indigo-900/30",
      button: "bg-indigo-600 hover:bg-indigo-700",
      accent: "text-indigo-100",
    },
  };

  const theme = isSuccess
    ? colors.success
    : isConfirm
      ? colors.confirm
      : colors.error;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-md w-full border border-gray-200 dark:border-slate-700 overflow-hidden animate-in zoom-in duration-300">
        {/* Header with gradient */}
        <div
          className={`bg-linear-to-br ${theme.gradient} p-8 text-white relative overflow-hidden`}
        >
          {/* Background pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-40 h-40 bg-white rounded-full -mr-20 -mt-20"></div>
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-white rounded-full -ml-16 -mb-16"></div>
          </div>

          <div className="relative z-10 text-center">
            {isConfirm ? (
              // Confirmation - left-aligned header
              <div className="text-left">
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <Send size={24} />
                  Confirm Transfer
                </h3>
                <p className={`${theme.accent} text-sm mt-1`}>
                  Please review the transfer details
                </p>
              </div>
            ) : (
              // Success/Error - center-aligned header
              <>
                <div
                  className={`inline-flex items-center justify-center w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full mb-4 ${isSuccess ? "animate-bounce" : ""}`}
                >
                  {isSuccess ? (
                    <PartyPopper size={40} className="text-white" />
                  ) : (
                    <AlertCircle size={40} className="text-white" />
                  )}
                </div>
                <h3 className="text-2xl font-bold mb-2">
                  {isSuccess ? "Transfer Successful!" : "Transfer Failed"}
                </h3>
                <p className={theme.accent}>
                  {isSuccess
                    ? "Your money is on its way"
                    : "Something went wrong"}
                </p>
              </>
            )}
          </div>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          {isConfirm ? (
            <>
              {/* Confirmation: Recipient and Amount Details */}
              <div className="bg-gray-50 dark:bg-slate-700 rounded-lg p-4 border border-gray-200 dark:border-slate-600">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                  Recipient
                </p>
                <p className="font-bold text-gray-900 dark:text-white text-lg">
                  {recipientName || "Unknown User"}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                  {recipientContact}
                </p>
              </div>

              {/* Amount Details */}
              <div className="space-y-2">
                <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-slate-600">
                  <span className="text-gray-600 dark:text-gray-300">
                    Transfer Amount
                  </span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    UGX {amount.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-slate-600">
                  <span className="text-gray-600 dark:text-gray-300">Fee</span>
                  <span className="font-semibold text-orange-600 dark:text-orange-400">
                    UGX {fee}
                  </span>
                </div>
                <div className="flex justify-between items-center py-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg px-3 mt-2">
                  <span className="font-semibold text-gray-900 dark:text-white">
                    Total Debit
                  </span>
                  <span className="font-bold text-indigo-600 dark:text-indigo-400 text-lg">
                    UGX {(amount + fee).toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Warning */}
              <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3 flex items-start gap-2">
                <AlertCircle
                  size={16}
                  className="text-amber-600 dark:text-amber-400 mt-0.5"
                />
                <p className="text-xs text-amber-800 dark:text-amber-200">
                  This action cannot be undone. Please ensure the details are
                  correct.
                </p>
              </div>
            </>
          ) : (
            <>
              {/* Icon */}
              <div className="flex justify-center">
                <div
                  className={`w-16 h-16 ${theme.icon} rounded-full flex items-center justify-center`}
                >
                  {isSuccess ? (
                    <CheckCircle size={32} className={theme.text} />
                  ) : (
                    <X size={32} className={theme.text} />
                  )}
                </div>
              </div>

              {/* Content */}
              {isSuccess ? (
                <>
                  {/* Success: Transfer Details */}
                  <div
                    className={`bg-gradient-to-br ${theme.bg} rounded-xl p-5 border ${theme.border}`}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex-1">
                        <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                          Sent to
                        </p>
                        <p className="font-bold text-gray-900 dark:text-white text-lg">
                          {recipientName || "Unknown User"}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          {recipientContact}
                        </p>
                      </div>
                      <ArrowRight className={theme.text + " mx-3"} size={24} />
                      <div className="text-right">
                        <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                          Amount Sent
                        </p>
                        <p className={`font-bold ${theme.text} text-xl`}>
                          UGX {amount.toLocaleString()}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          + UGX {fee} Fee
                        </p>
                      </div>
                    </div>

                    <div
                      className={`pt-4 border-t ${theme.border.replace("border-", "border-t-")}`}
                    >
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-gray-600 dark:text-gray-400">
                          Transaction ID
                        </span>
                        <span className="font-mono text-gray-900 dark:text-white font-medium">
                          {transactionRef}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">
                          Status
                        </span>
                        <span
                          className={`flex items-center gap-1 ${theme.text} font-semibold`}
                        >
                          <CheckCircle size={14} />
                          Completed
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Success Info */}
                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 flex items-start gap-2">
                    <AlertCircle
                      size={16}
                      className="text-blue-600 dark:text-blue-400 mt-0.5"
                    />
                    <p className="text-xs text-blue-800 dark:text-blue-200">
                      Both you and the recipient will receive a notification
                      about this transfer.
                    </p>
                  </div>
                </>
              ) : (
                <>
                  {/* Error: Error Message */}
                  <div
                    className={`bg-gradient-to-br ${theme.bg} rounded-xl p-5 border ${theme.border}`}
                  >
                    <div className="text-center">
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                        Error Details
                      </p>
                      <p className="text-base font-semibold text-gray-900 dark:text-white">
                        {errorMessage}
                      </p>
                    </div>
                  </div>

                  {/* Error Info */}
                  <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3 flex items-start gap-2">
                    <AlertCircle
                      size={16}
                      className="text-amber-600 dark:text-amber-400 mt-0.5"
                    />
                    <p className="text-xs text-amber-800 dark:text-amber-200">
                      Don&apos;t worry, no money was deducted from your account.
                      Please try again or contact support if the issue persists.
                    </p>
                  </div>
                </>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 dark:bg-slate-700 p-4 flex gap-3">
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="flex-1 px-4 py-2 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-100 dark:hover:bg-slate-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {dismissLabel}
          </button>
          {onAction && (
            <button
              onClick={onAction}
              disabled={isProcessing}
              className={`flex-1 px-4 py-2 ${theme.button} disabled:opacity-50 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2 disabled:cursor-not-allowed`}
            >
              {isProcessing ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Processing...
                </>
              ) : isSuccess ? (
                actionLabel || "Done"
              ) : (
                <>
                  <Send size={16} />
                  {actionLabel ||
                    (isConfirm ? "Confirm Transfer" : "Try Again")}
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default TransactionModal;
