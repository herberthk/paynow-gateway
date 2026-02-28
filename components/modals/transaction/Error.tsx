import { AlertCircle, X, Send } from "lucide-react";

export const ErrorModal = ({
  error,
  onClose,
}: {
  error: string;
  onClose: () => void;
}) => {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-md w-full border border-gray-200 dark:border-slate-700 overflow-hidden animate-in zoom-in duration-300">
        {/* Header with gradient */}
        <div className="bg-linear-to-br from-red-600 to-rose-600 p-8 text-white relative overflow-hidden">
          {/* Background pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-40 h-40 bg-white rounded-full -mr-20 -mt-20"></div>
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-white rounded-full -ml-16 -mb-16"></div>
          </div>

          <div className="relative z-10 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full mb-4">
              <AlertCircle size={40} className="text-white" />
            </div>
            <h3 className="text-2xl font-bold mb-2">Transfer Failed</h3>
            <p className="text-red-100">Something went wrong</p>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          {/* Error Icon */}
          {/* <div className="flex justify-center">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
              <X size={32} className="text-red-600 dark:text-red-400" />
            </div>
          </div> */}

          {/* Error Message */}
          <div className="bg-linear-to-br from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20 rounded-xl p-5 border border-red-200 dark:border-red-800">
            <div className="text-center">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                Error Details
              </p>
              <p className="text-base font-semibold text-gray-900 dark:text-white">
                {error}
              </p>
            </div>
          </div>

          {/* Info message */}
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3 flex items-start gap-2">
            <AlertCircle
              size={16}
              className="text-amber-600 dark:text-amber-400 mt-0.5"
            />
            <p className="text-xs text-amber-800 dark:text-amber-200">
              Don&apos;t worry, no money was deducted from your account. Please
              try again or contact support if the issue persists.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 dark:bg-slate-700 p-4 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-100 dark:hover:bg-slate-600 transition-colors"
          >
            Dismiss
          </button>
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <Send size={16} />
            Try Again
          </button>
        </div>
      </div>
    </div>
  );
};
