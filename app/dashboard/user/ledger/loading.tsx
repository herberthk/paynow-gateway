export default function Loading() {
  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div className="flex flex-col gap-2">
        <div className="h-8 w-48 bg-gray-200 dark:bg-slate-700 rounded animate-pulse" />
        <div className="h-4 w-96 bg-gray-200 dark:bg-slate-700 rounded animate-pulse" />
      </div>

      {/* Ledger Table Skeleton */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm h-full">
        <div className="p-5 border-b border-gray-200 dark:border-slate-700 flex flex-col gap-4">
          {/* Header and Controls Skeleton */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="h-7 w-32 bg-gray-200 dark:bg-slate-700 rounded animate-pulse" />
            <div className="flex gap-2">
              <div className="h-10 w-64 bg-gray-200 dark:bg-slate-700 rounded animate-pulse" />
              <div className="h-10 w-24 bg-gray-200 dark:bg-slate-700 rounded animate-pulse" />
              <div className="h-10 w-10 bg-gray-200 dark:bg-slate-700 rounded animate-pulse" />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          {/* Table Header */}
          <div className="grid grid-cols-6 gap-4 p-4 border-b border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-700/50">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="h-4 bg-gray-200 dark:bg-slate-600 rounded animate-pulse"
              />
            ))}
          </div>

          {/* Table Rows */}
          <div className="divide-y divide-gray-100 dark:divide-slate-700">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="grid grid-cols-6 gap-4 p-4 items-center">
                {/* Date */}
                <div className="space-y-1">
                  <div className="h-4 w-24 bg-gray-200 dark:bg-slate-700 rounded animate-pulse" />
                  <div className="h-3 w-16 bg-gray-200 dark:bg-slate-700 rounded animate-pulse" />
                </div>
                {/* Reference */}
                <div className="h-4 w-20 bg-gray-200 dark:bg-slate-700 rounded animate-pulse" />
                {/* Description */}
                <div className="h-4 w-32 bg-gray-200 dark:bg-slate-700 rounded animate-pulse" />
                {/* Account */}
                <div className="h-6 w-20 bg-gray-200 dark:bg-slate-700 rounded-full animate-pulse" />
                {/* Debit */}
                <div className="h-4 w-20 bg-gray-200 dark:bg-slate-700 rounded animate-pulse ml-auto" />
                {/* Credit */}
                <div className="h-4 w-20 bg-gray-200 dark:bg-slate-700 rounded animate-pulse ml-auto" />
              </div>
            ))}
          </div>
        </div>
        {/* Footer/Pagination */}
        <div className="bg-gray-50 dark:bg-slate-700/30 px-6 py-4 border-t border-gray-200 dark:border-slate-700 flex justify-between items-center">
          <div className="h-4 w-32 bg-gray-200 dark:bg-slate-700 rounded animate-pulse" />
          <div className="flex gap-2">
            <div className="h-8 w-8 bg-gray-200 dark:bg-slate-700 rounded animate-pulse" />
            <div className="h-8 w-8 bg-gray-200 dark:bg-slate-700 rounded animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
}
