import { Card, CardContent, CardHeader } from "@/components/ui";

export default function Loading() {
  return (
    <div className="space-y-6">
      {/* Header with Search and Filters */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="h-7 w-56 bg-gray-200 dark:bg-slate-700 rounded animate-pulse" />
        <div className="flex gap-3">
          <div className="h-10 w-64 bg-gray-200 dark:bg-slate-700 rounded animate-pulse" />
          <div className="h-10 w-32 bg-gray-200 dark:bg-slate-700 rounded animate-pulse" />
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card
            key={i}
            className="bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 animate-pulse"
          >
            <CardContent className="p-4">
              <div className="h-4 w-24 bg-gray-200 dark:bg-slate-700 rounded mb-2" />
              <div className="h-7 w-32 bg-gray-200 dark:bg-slate-700 rounded" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Transactions Table */}
      <Card className="bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700">
        <CardHeader>
          <div className="h-6 w-40 bg-gray-200 dark:bg-slate-700 rounded animate-pulse" />
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

          {/* Table Rows */}
          <div className="space-y-3">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="grid grid-cols-6 gap-4 items-center">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-gray-200 dark:bg-slate-700 rounded-full animate-pulse" />
                  <div className="space-y-2">
                    <div className="h-4 w-28 bg-gray-200 dark:bg-slate-700 rounded animate-pulse" />
                    <div className="h-3 w-20 bg-gray-200 dark:bg-slate-700 rounded animate-pulse" />
                  </div>
                </div>
                <div className="h-4 w-24 bg-gray-200 dark:bg-slate-700 rounded animate-pulse" />
                <div className="h-4 w-20 bg-gray-200 dark:bg-slate-700 rounded animate-pulse" />
                <div className="h-4 w-28 bg-gray-200 dark:bg-slate-700 rounded animate-pulse" />
                <div className="h-6 w-20 bg-gray-200 dark:bg-slate-700 rounded-full animate-pulse" />
                <div className="h-8 w-20 bg-gray-200 dark:bg-slate-700 rounded animate-pulse" />
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
