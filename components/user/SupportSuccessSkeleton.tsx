import { Heart, Calendar, Wallet } from "lucide-react";

export default function SupportSuccessSkeleton() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-12 lg:py-20 animate-pulse">
      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 lg:p-12 shadow-2xl border border-gray-100 dark:border-slate-800 relative overflow-hidden">
        {/* Success Icon Placeholder */}
        <div className="flex flex-col items-center text-center mb-10">
          <div className="w-24 h-24 bg-indigo-50 dark:bg-indigo-950/30 rounded-full flex items-center justify-center mb-6">
            <Heart size={48} className="text-indigo-200 dark:text-indigo-800" />
          </div>
          <div className="h-10 w-56 bg-gray-200 dark:bg-slate-800 rounded-xl mb-3" />
          <div className="h-5 w-64 bg-gray-100 dark:bg-slate-800/50 rounded-lg" />
        </div>

        {/* Transaction Card Placeholder */}
        <div className="bg-gray-50 dark:bg-slate-800/50 rounded-3xl p-6 lg:p-8 mb-10 border border-gray-100 dark:border-slate-800">
          <div className="flex justify-between items-center mb-8">
            <div className="h-4 w-28 bg-gray-200 dark:bg-slate-700 rounded" />
            <div className="flex flex-col items-end gap-2">
              <div className="h-10 w-44 bg-gray-200 dark:bg-slate-700 rounded-xl" />
              <div className="h-4 w-28 bg-emerald-100 dark:bg-emerald-950/40 rounded" />
            </div>
          </div>

          <div className="space-y-5 pt-6 border-t border-gray-200 dark:border-slate-700">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex justify-between items-center py-1">
                <div className="h-4 w-32 bg-gray-100 dark:bg-slate-700/50 rounded" />
                <div className="h-4 w-28 bg-gray-200 dark:bg-slate-700 rounded" />
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons Placeholder */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="h-[64px] bg-gray-200 dark:bg-slate-800 rounded-2xl flex items-center justify-center gap-2">
            <Calendar size={20} className="text-gray-300 dark:text-slate-700" />
            <div className="h-5 w-24 bg-gray-300 dark:bg-slate-700 rounded" />
          </div>
          <div className="h-[64px] bg-gray-100 dark:bg-slate-800/50 border-2 border-dashed border-gray-200 dark:border-slate-700 rounded-2xl flex items-center justify-center gap-2">
            <Wallet size={20} className="text-gray-300 dark:text-slate-700" />
            <div className="h-5 w-24 bg-gray-200 dark:bg-slate-700 rounded" />
          </div>
        </div>
      </div>
    </div>
  );
}
