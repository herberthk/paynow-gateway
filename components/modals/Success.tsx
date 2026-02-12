"use client";
import { useNotificationStore } from "@/store";
import {
  CheckCircle,
  AlertCircle,
  PartyPopper,
  ArrowRight,
} from "lucide-react";
import type { Dispatch, SetStateAction } from "react";

export const SuccessModal = ({
  recipientData,
  setShowSuccessModal,
  setRecipientData,
  transaction,
}: {
  recipientData: RecipientUser;
  setShowSuccessModal: (value: boolean) => void;
  setRecipientData: Dispatch<SetStateAction<RecipientUser | null>>;
  transaction: PreviewTransaction;
}) => {
  const notify = useNotificationStore((state) => state.notify);
  const { amount, currency, txn_ref, fee } = transaction;
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-20 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-md w-full border border-gray-200 dark:border-slate-700 overflow-hidden animate-in zoom-in duration-300">
        {/* Header with gradient and animation */}
        <div className="bg-linear-to-br from-green-600 to-emerald-600 p-8 text-white relative overflow-hidden">
          {/* Background pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-40 h-40 bg-white rounded-full -mr-20 -mt-20"></div>
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-white rounded-full -ml-16 -mb-16"></div>
          </div>

          <div className="relative z-10 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full mb-4 animate-bounce">
              <PartyPopper size={40} className="text-white" />
            </div>
            <h3 className="text-2xl font-bold mb-2">Transfer Successful!</h3>
            <p className="text-green-100">Your money is on its way</p>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          {/* Success checkmark animation */}
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
              <CheckCircle
                size={32}
                className="text-green-600 dark:text-green-400"
              />
            </div>
          </div>

          {/* Transfer Details */}
          <div className="bg-linear-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-5 border border-green-200 dark:border-green-800">
            <div className="flex items-center justify-between mb-4">
              <div className="flex-1">
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                  Sent to
                </p>
                <p className="font-bold text-gray-900 dark:text-white text-lg">
                  {recipientData.name || "Unknown User"}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {recipientData.email || recipientData.tel}
                </p>
              </div>
              <ArrowRight
                className="text-green-600 dark:text-green-400 mx-3"
                size={24}
              />
              <div className="text-right">
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                  Amount Sent
                </p>
                <p className="font-bold text-green-600 dark:text-green-400 text-xl">
                  {currency}
                  {parseFloat(String(amount) || "0").toLocaleString()}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  + {currency} {fee} Fee
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-green-200 dark:border-green-800">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600 dark:text-gray-400">
                  Transaction Reference
                </span>
                <span className="font-mono text-gray-900 dark:text-white font-medium">
                  {txn_ref}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Status</span>
                <span className="flex items-center gap-1 text-green-600 dark:text-green-400 font-semibold">
                  <CheckCircle size={14} />
                  Completed
                </span>
              </div>
            </div>
          </div>

          {/* Info message */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 flex items-start gap-2">
            <AlertCircle
              size={16}
              className="text-blue-600 dark:text-blue-400 mt-0.5"
            />
            <p className="text-xs text-blue-800 dark:text-blue-200">
              Both you and the recipient will receive a notification about this
              transfer.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 dark:bg-slate-700 p-4 flex gap-3">
          <button
            onClick={() => {
              navigator.clipboard.writeText(txn_ref);
              notify("SUCCESS", "Transaction reference copied to clipboard");
            }}
            className="flex-1 px-4 py-2 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-100 dark:hover:bg-slate-600 transition-colors"
          >
            Copy Ref
          </button>
          <button
            onClick={() => {
              setShowSuccessModal(false);
              setRecipientData(null);
              notify("SUCCESS", "Transfer completed successfully");
            }}
            className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
