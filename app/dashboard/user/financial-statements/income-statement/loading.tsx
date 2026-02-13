export default function Loading() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl animate-pulse space-y-8">
      {/* Header Skeleton */}
      <div className="mb-8 space-y-2">
        <div className="h-8 w-64 bg-gray-200 dark:bg-slate-700 rounded" />
        <div className="h-4 w-96 bg-gray-200 dark:bg-slate-700 rounded" />
      </div>

      {/* Controls Skeleton */}
      <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm flex flex-col md:flex-row gap-4 justify-between">
        <div className="flex gap-4">
          <div className="h-14 w-32 bg-gray-200 dark:bg-slate-700 rounded" />
          <div className="h-14 w-32 bg-gray-200 dark:bg-slate-700 rounded" />
          <div className="h-10 w-32 bg-gray-200 dark:bg-slate-700 rounded md:mt-auto" />
        </div>
        <div className="h-10 w-32 bg-gray-200 dark:bg-slate-700 rounded" />
      </div>

      {/* Report Skeleton */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm overflow-hidden h-[500px]">
        <div className="p-6 border-b border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-700/50 space-y-2">
          <div className="h-6 w-48 bg-gray-200 dark:bg-slate-600 rounded" />
          <div className="h-4 w-64 bg-gray-200 dark:bg-slate-600 rounded" />
        </div>
        <div className="p-6 space-y-8">
          {/* Section 1 */}
          <div className="space-y-4">
            <div className="h-4 w-24 bg-gray-200 dark:bg-slate-700 rounded" />
            <div className="space-y-2">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex justify-between">
                  <div className="h-4 w-32 bg-gray-200 dark:bg-slate-700 rounded" />
                  <div className="h-4 w-24 bg-gray-200 dark:bg-slate-700 rounded" />
                </div>
              ))}
            </div>
          </div>
          {/* Section 2 */}
          <div className="space-y-4">
            <div className="h-4 w-24 bg-gray-200 dark:bg-slate-700 rounded" />
            <div className="space-y-2">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex justify-between">
                  <div className="h-4 w-32 bg-gray-200 dark:bg-slate-700 rounded" />
                  <div className="h-4 w-24 bg-gray-200 dark:bg-slate-700 rounded" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
