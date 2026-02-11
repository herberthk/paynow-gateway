import { Card, CardContent, CardHeader } from "@/components/ui";

export default function Loading() {
  return (
    <div className="space-y-6">
      {/* Header with Search and Export */}
      <div className="flex justify-between items-center">
        <div>
          <div className="h-7 w-40 bg-gray-200 dark:bg-slate-700 rounded mb-2 animate-pulse" />
          <div className="h-4 w-64 bg-gray-200 dark:bg-slate-700 rounded animate-pulse" />
        </div>
        <div className="flex gap-3">
          <div className="h-10 w-48 bg-gray-200 dark:bg-slate-700 rounded animate-pulse" />
          <div className="h-10 w-32 bg-gray-200 dark:bg-slate-700 rounded animate-pulse" />
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-3">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="h-10 w-32 bg-gray-200 dark:bg-slate-700 rounded animate-pulse"
          />
        ))}
      </div>

      {/* Audit Logs Table */}
      <Card className="bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="h-6 w-48 bg-gray-200 dark:bg-slate-700 rounded animate-pulse" />
            <div className="h-4 w-32 bg-gray-200 dark:bg-slate-700 rounded animate-pulse" />
          </div>
        </CardHeader>
        <CardContent>
          {/* Table Header */}
          <div className="grid grid-cols-5 gap-4 pb-3 border-b border-gray-200 dark:border-slate-700 mb-4">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="h-4 bg-gray-200 dark:bg-slate-700 rounded animate-pulse"
              />
            ))}
          </div>

          {/* Log Entries */}
          <div className="space-y-3">
            {[...Array(12)].map((_, i) => (
              <div
                key={i}
                className="grid grid-cols-5 gap-4 items-center py-3 border-b border-gray-100 dark:border-slate-700/50 last:border-0"
              >
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 bg-gray-200 dark:bg-slate-700 rounded animate-pulse" />
                  <div className="space-y-2">
                    <div className="h-4 w-32 bg-gray-200 dark:bg-slate-700 rounded animate-pulse" />
                    <div className="h-3 w-24 bg-gray-200 dark:bg-slate-700 rounded animate-pulse" />
                  </div>
                </div>
                <div className="h-4 w-40 bg-gray-200 dark:bg-slate-700 rounded animate-pulse" />
                <div className="h-4 w-28 bg-gray-200 dark:bg-slate-700 rounded animate-pulse" />
                <div className="h-6 w-16 bg-gray-200 dark:bg-slate-700 rounded-full animate-pulse" />
                <div className="h-4 w-24 bg-gray-200 dark:bg-slate-700 rounded animate-pulse" />
              </div>
            ))}
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between pt-6 mt-6 border-t border-gray-200 dark:border-slate-700">
            <div className="h-4 w-48 bg-gray-200 dark:bg-slate-700 rounded animate-pulse" />
            <div className="flex gap-2">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="h-9 w-9 bg-gray-200 dark:bg-slate-700 rounded animate-pulse"
                />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
