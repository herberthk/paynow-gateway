import { CheckCircle2, Wallet, Download } from "lucide-react";

export default function TopupSuccessSkeleton() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-12 lg:py-20 animate-pulse">
      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 lg:p-12 shadow-2xl border border-gray-100 dark:border-slate-800 relative overflow-hidden">
        {/* Success Icon Placeholder */}
        <div className="flex flex-col items-center text-center mb-10">
          <div className="w-24 h-24 bg-gray-200 dark:bg-slate-800 rounded-full flex items-center justify-center mb-6">
            <CheckCircle2 size={48} className="text-gray-300 dark:text-slate-700" />
          </div>
          <div className="h-10 w-64 bg-gray-200 dark:bg-slate-800 rounded-xl mb-4" />
          <div className="h-6 w-48 bg-gray-100 dark:bg-slate-800/50 rounded-lg" />
        </div>

        {/* Transaction Card Placeholder */}
        <div className="bg-gray-50 dark:bg-slate-800/50 rounded-3xl p-6 lg:p-8 mb-10 border border-gray-100 dark:border-slate-800">
          <div className="flex justify-between items-center mb-8">
            <div className="h-4 w-24 bg-gray-200 dark:bg-slate-700 rounded" />
            <div className="flex flex-col items-end gap-2">
              <div className="h-10 w-40 bg-gray-200 dark:bg-slate-700 rounded-xl" />
              <div className="h-4 w-24 bg-gray-100 dark:bg-slate-700/50 rounded" />
            </div>
          </div>

          <div className="space-y-6 pt-6 border-t border-gray-200 dark:border-slate-700">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 bg-gray-200 dark:bg-slate-700 rounded-full" />
                  <div className="h-4 w-32 bg-gray-100 dark:bg-slate-700/50 rounded" />
                </div>
                <div className="h-4 w-24 bg-gray-200 dark:bg-slate-700 rounded" />
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons Placeholder */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="h-[68px] bg-gray-200 dark:bg-slate-800 rounded-2xl flex items-center justify-center gap-2">
            <Wallet size={20} className="text-gray-300 dark:text-slate-700" />
            <div className="h-5 w-24 bg-gray-300 dark:bg-slate-700 rounded" />
          </div>
          <div className="h-[68px] bg-gray-100 dark:bg-slate-800/50 border-2 border-dashed border-gray-200 dark:border-slate-700 rounded-2xl flex items-center justify-center gap-2">
            <Download size={20} className="text-gray-300 dark:text-slate-700" />
            <div className="h-5 w-24 bg-gray-200 dark:bg-slate-700 rounded" />
          </div>
        </div>
      </div>
    </div>
  );
}
