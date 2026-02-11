import { Card, CardContent, CardHeader } from "@/components/ui";

export default function Loading() {
  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="flex justify-between items-start">
        <div>
          <div className="h-7 w-56 bg-gray-200 dark:bg-slate-700 rounded mb-2 animate-pulse" />
          <div className="h-4 w-72 bg-gray-200 dark:bg-slate-700 rounded animate-pulse" />
        </div>
        <div className="grid grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="bg-white dark:bg-slate-800 p-4 rounded-lg border border-gray-200 dark:border-slate-700 animate-pulse"
            >
              <div className="h-3 w-20 bg-gray-200 dark:bg-slate-700 rounded mb-2" />
              <div className="h-6 w-12 bg-gray-200 dark:bg-slate-700 rounded" />
            </div>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-3">
        <div className="h-10 flex-1 max-w-md bg-gray-200 dark:bg-slate-700 rounded animate-pulse" />
        {[...Array(2)].map((_, i) => (
          <div
            key={i}
            className="h-10 w-32 bg-gray-200 dark:bg-slate-700 rounded animate-pulse"
          />
        ))}
      </div>

      {/* KYC Submissions Table */}
      <Card className="bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700">
        <CardHeader>
          <div className="h-6 w-48 bg-gray-200 dark:bg-slate-700 rounded animate-pulse" />
        </CardHeader>
        <CardContent>
          {/* Table Header */}
          <div className="grid grid-cols-6 gap-4 pb-3 border-b border-gray-200 dark:border-slate-700 mb-4">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="h-4 bg-gray-200 dark:bg-slate-700 rounded animate-pulse"
              />
            ))}
          </div>

          {/* KYC Entries */}
          <div className="space-y-4">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="grid grid-cols-6 gap-4 items-center p-4 rounded-lg bg-gray-50 dark:bg-slate-700/30"
              >
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 bg-gray-200 dark:bg-slate-700 rounded-full animate-pulse" />
                  <div className="space-y-2">
                    <div className="h-4 w-32 bg-gray-200 dark:bg-slate-600 rounded animate-pulse" />
                    <div className="h-3 w-24 bg-gray-200 dark:bg-slate-600 rounded animate-pulse" />
                  </div>
                </div>
                <div className="h-4 w-28 bg-gray-200 dark:bg-slate-600 rounded animate-pulse" />
                <div className="h-4 w-32 bg-gray-200 dark:bg-slate-600 rounded animate-pulse" />
                <div className="h-6 w-20 bg-gray-200 dark:bg-slate-600 rounded-full animate-pulse" />
                <div className="h-4 w-24 bg-gray-200 dark:bg-slate-600 rounded animate-pulse" />
                <div className="flex gap-2">
                  <div className="h-8 w-20 bg-gray-200 dark:bg-slate-600 rounded animate-pulse" />
                  <div className="h-8 w-20 bg-gray-200 dark:bg-slate-600 rounded animate-pulse" />
                </div>
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
