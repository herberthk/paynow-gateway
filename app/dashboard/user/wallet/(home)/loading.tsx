import { Wallet, CreditCard, Send } from "lucide-react";

export default function Loading() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Wallet Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Balance Card Skeleton */}
        <div className="bg-gray-200 dark:bg-slate-800 rounded-2xl p-6 h-[240px] relative overflow-hidden">
          <div className="absolute top-0 right-0 p-3 opacity-5">
            <Wallet size={120} />
          </div>
          <div className="relative z-10 space-y-4">
            <div>
              <div className="h-4 w-32 bg-gray-300 dark:bg-slate-700 rounded mb-2" />
              <div className="h-10 w-56 bg-gray-300 dark:bg-slate-700 rounded-xl" />
            </div>

            <div className="pt-2">
              <div className="h-4 w-24 bg-gray-300 dark:bg-slate-700 rounded mb-2" />
              <div className="h-7 w-40 bg-gray-300 dark:bg-slate-700 rounded-lg" />
            </div>
          </div>

          <div className="mt-8 flex gap-3 relative z-10">
            <div className="flex-1 h-10 bg-gray-300 dark:bg-slate-700 rounded-lg" />
            <div className="flex-1 h-10 bg-gray-300 dark:bg-slate-700 rounded-lg" />
          </div>
        </div>

        {/* Linked Methods Card Skeleton */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <CreditCard
              size={20}
              className="text-gray-200 dark:text-slate-700"
            />
            <div className="h-5 w-40 bg-gray-200 dark:bg-slate-800 rounded" />
          </div>
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <div
                key={i}
                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-800/50 rounded-lg border border-gray-100 dark:border-slate-800"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-200 dark:bg-slate-700 rounded-full" />
                  <div className="space-y-2">
                    <div className="h-4 w-32 bg-gray-200 dark:bg-slate-700 rounded" />
                    <div className="h-3 w-24 bg-gray-200 dark:bg-slate-700 rounded" />
                  </div>
                </div>
                <div className="h-3 w-12 bg-gray-200 dark:bg-slate-700 rounded" />
              </div>
            ))}
            <div className="w-full h-12 border-2 border-dashed border-gray-100 dark:border-slate-800 rounded-lg" />
          </div>
        </div>
      </div>

      {/* Quick Transfer Skeleton */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 p-8 shadow-sm">
        <div className="flex items-center gap-2 mb-8">
          <Send size={20} className="text-gray-200 dark:text-slate-700" />
          <div className="h-6 w-48 bg-gray-200 dark:bg-slate-800 rounded-lg" />
        </div>

        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex-1 space-y-3">
            <div className="h-4 w-40 bg-gray-200 dark:bg-slate-800 rounded" />
            <div className="h-12 w-full bg-gray-50 dark:bg-slate-800/50 rounded-xl" />
          </div>
          <div className="w-full md:w-48 space-y-3">
            <div className="h-4 w-20 bg-gray-200 dark:bg-slate-800 rounded" />
            <div className="h-12 w-full bg-gray-50 dark:bg-slate-800/50 rounded-xl" />
          </div>
          <div className="flex items-end">
            <div className="h-12 w-full md:w-32 bg-gray-200 dark:bg-slate-800 rounded-xl" />
          </div>
        </div>

        <div className="mt-6 flex items-center gap-2">
          <div className="w-2 h-2 bg-gray-200 dark:bg-slate-700 rounded-full" />
          <div className="h-3 w-64 bg-gray-100 dark:bg-slate-800/50 rounded" />
        </div>
      </div>
    </div>
  );
}
