export default function Loading() {
  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div className="h-7 w-48 bg-gray-200 dark:bg-slate-700 rounded animate-pulse" />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm animate-pulse"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 rounded-lg bg-gray-200 dark:bg-blue-900/20 w-12 h-12" />
              <div className="h-6 w-16 bg-gray-200 dark:bg-slate-700 rounded-full" />
            </div>
            <div>
              <div className="h-4 w-24 bg-gray-200 dark:bg-slate-700 rounded mb-2" />
              <div className="h-7 w-32 bg-gray-200 dark:bg-slate-700 rounded mb-2" />
              <div className="h-3 w-20 bg-gray-200 dark:bg-slate-700 rounded" />
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 md:grid-cols-2">
        {[...Array(2)].map((_, i) => (
          <div
            key={i}
            className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm animate-pulse"
          >
            <div className="h-6 w-40 bg-gray-200 dark:bg-slate-700 rounded mb-4" />
            <div className="h-[300px] bg-gray-200 dark:bg-slate-700 rounded" />
          </div>
        ))}
      </div>

      {/* Large Chart */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm animate-pulse">
        <div className="h-6 w-48 bg-gray-200 dark:bg-slate-700 rounded mb-4" />
        <div className="h-[400px] bg-gray-200 dark:bg-slate-700 rounded" />
      </div>

      {/* Activity Section */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm animate-pulse">
        <div className="h-6 w-36 bg-gray-200 dark:bg-slate-700 rounded mb-4" />
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center justify-between py-3">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 bg-gray-200 dark:bg-slate-700 rounded" />
                <div className="space-y-2">
                  <div className="h-4 w-48 bg-gray-200 dark:bg-slate-700 rounded" />
                  <div className="h-3 w-32 bg-gray-200 dark:bg-slate-700 rounded" />
                </div>
              </div>
              <div className="h-3 w-24 bg-gray-200 dark:bg-slate-700 rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
