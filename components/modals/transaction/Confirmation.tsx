import { CheckCircle, AlertCircle, Loader2 } from "lucide-react";

export const ConfirmationModal = ({
  recipientData,
  amount,
  isTransferring,
  handleCancelTransfer,
  handleConfirmTransfer,
  fee,
}: {
  recipientData: RecipientUser;
  amount: string;
  isTransferring: boolean;
  fee: number;
  handleCancelTransfer: () => void;
  handleConfirmTransfer: () => void;
}) => {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-md w-full border border-gray-200 dark:border-slate-700 overflow-hidden">
        {/* Header */}
        <div className="bg-linear-to-r from-indigo-600 to-purple-600 p-6 text-white">
          <h3 className="text-xl font-bold flex items-center gap-2">
            <CheckCircle size={24} />
            Confirm Transfer
          </h3>
          <p className="text-indigo-100 text-sm mt-1">
            Please review the transfer details
          </p>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          {/* Recipient Info */}
          <div className="bg-gray-50 dark:bg-slate-700 rounded-lg p-4 border border-gray-200 dark:border-slate-600">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
              Recipient
            </p>
            <p className="font-bold text-gray-900 dark:text-white text-lg">
              {recipientData.name || "Unknown User"}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
              {recipientData.email || recipientData.tel}
            </p>
          </div>

          {/* Amount Details */}
          <div className="space-y-2">
            <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-slate-600">
              <span className="text-gray-600 dark:text-gray-300">
                Transfer Amount
              </span>
              <span className="font-semibold text-gray-900 dark:text-white">
                UGX {parseFloat(amount).toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-slate-600">
              <span className="text-gray-600 dark:text-gray-300">Fee</span>
              <span className="font-semibold text-orange-600 dark:text-orange-400">
                UGX {fee.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between items-center py-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg px-3 mt-2">
              <span className="font-semibold text-gray-900 dark:text-white">
                Total Debit
              </span>
              <span className="font-bold text-indigo-600 dark:text-indigo-400 text-lg">
                UGX {(parseFloat(amount) + fee).toLocaleString()}
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
        </div>

        {/* Footer */}
        <div className="bg-gray-50 dark:bg-slate-700 p-4 flex gap-3">
          <button
            onClick={handleCancelTransfer}
            disabled={isTransferring}
            className="flex-1 px-4 py-2 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-100 dark:hover:bg-slate-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirmTransfer}
            disabled={isTransferring}
            className="flex-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2 disabled:cursor-not-allowed"
          >
            {isTransferring ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <CheckCircle size={16} />
                Confirm Transfer
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
