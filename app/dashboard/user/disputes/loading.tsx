import { Card, CardContent, CardHeader } from "@/components/ui";

export default function Loading() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="h-8 w-48 bg-gray-200 dark:bg-slate-700 rounded mb-2 animate-pulse" />
          <div className="h-4 w-64 bg-gray-200 dark:bg-slate-700 rounded animate-pulse" />
        </div>
        <div className="h-10 w-40 bg-gray-200 dark:bg-slate-700 rounded-lg animate-pulse" />
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 h-12 bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 animate-pulse" />
        <div className="flex gap-1 bg-white dark:bg-slate-800 p-1 rounded-xl border border-gray-200 dark:border-slate-700">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="h-8 w-20 bg-gray-200 dark:bg-slate-700 rounded-lg animate-pulse"
            />
          ))}
        </div>
      </div>

      {/* Disputes List */}
      <div className="grid gap-4">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-gray-200 dark:border-slate-700 animate-pulse"
          >
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center gap-3">
                <div className="h-6 w-24 bg-gray-200 dark:bg-slate-700 rounded animate-pulse" />
                <div className="h-6 w-20 bg-gray-200 dark:bg-slate-700 rounded animate-pulse" />
                <div className="h-4 w-16 bg-gray-200 dark:bg-slate-700 rounded animate-pulse" />
              </div>
              <div className="h-4 w-24 bg-gray-200 dark:bg-slate-700 rounded animate-pulse" />
            </div>

            <div className="h-6 w-3/4 bg-gray-200 dark:bg-slate-700 rounded mb-3 animate-pulse" />

            <div className="bg-gray-50 dark:bg-slate-700/50 p-2 rounded flex justify-between">
              <div className="h-5 w-32 bg-gray-200 dark:bg-slate-600 rounded animate-pulse" />
              <div className="h-5 w-24 bg-gray-200 dark:bg-slate-600 rounded animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
