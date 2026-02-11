export default function Loading() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="h-7 w-48 bg-gray-200 dark:bg-slate-700 rounded animate-pulse" />

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

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm animate-pulse"
          >
            <div className="h-4 w-28 bg-gray-200 dark:bg-slate-700 rounded mb-3" />
            <div className="h-8 w-32 bg-gray-200 dark:bg-slate-700 rounded mb-2" />
            <div className="h-3 w-24 bg-gray-200 dark:bg-slate-700 rounded" />
          </div>
        ))}
      </div>

      {/* Additional Charts Row */}
      <div className="grid gap-6 md:grid-cols-2">
        {[...Array(2)].map((_, i) => (
          <div
            key={i}
            className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm animate-pulse"
          >
            <div className="h-6 w-44 bg-gray-200 dark:bg-slate-700 rounded mb-4" />
            <div className="h-[250px] bg-gray-200 dark:bg-slate-700 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}
