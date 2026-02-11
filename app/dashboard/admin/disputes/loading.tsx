import { Card, CardContent, CardHeader } from "@/components/ui";

export default function Loading() {
  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="flex justify-between items-center">
        <div>
          <div className="h-7 w-48 bg-gray-200 dark:bg-slate-700 rounded mb-2 animate-pulse" />
          <div className="h-4 w-64 bg-gray-200 dark:bg-slate-700 rounded animate-pulse" />
        </div>
        <div className="grid grid-cols-4 gap-3">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="bg-white dark:bg-slate-800 p-3 rounded-lg border border-gray-200 dark:border-slate-700 text-center animate-pulse"
            >
              <div className="h-3 w-16 bg-gray-200 dark:bg-slate-700 rounded mb-2 mx-auto" />
              <div className="h-6 w-10 bg-gray-200 dark:bg-slate-700 rounded mx-auto" />
            </div>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-3">
        <div className="h-10 flex-1 max-w-md bg-gray-200 dark:bg-slate-700 rounded animate-pulse" />
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="h-10 w-32 bg-gray-200 dark:bg-slate-700 rounded animate-pulse"
          />
        ))}
      </div>

      {/* Disputes List */}
      <div className="space-y-4">
        {[...Array(6)].map((_, i) => (
          <Card
            key={i}
            className="bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700"
          >
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex items-start gap-4 flex-1">
                  <div className="h-12 w-12 bg-gray-200 dark:bg-blue-900/20 rounded-full animate-pulse" />
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-3">
                      <div className="h-5 w-40 bg-gray-200 dark:bg-slate-700 rounded animate-pulse" />
                      <div className="h-5 w-24 bg-gray-200 dark:bg-slate-700 rounded-full animate-pulse" />
                    </div>
                    <div className="h-4 w-56 bg-gray-200 dark:bg-slate-700 rounded animate-pulse" />
                    <div className="flex gap-4">
                      <div className="h-3 w-32 bg-gray-200 dark:bg-slate-700 rounded animate-pulse" />
                      <div className="h-3 w-28 bg-gray-200 dark:bg-slate-700 rounded animate-pulse" />
                    </div>
                  </div>
                </div>
                <div className="h-7 w-28 bg-gray-200 dark:bg-slate-700 rounded animate-pulse" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="h-4 w-full bg-gray-200 dark:bg-slate-700 rounded animate-pulse" />
                <div className="h-4 w-3/4 bg-gray-200 dark:bg-slate-700 rounded animate-pulse" />
                <div className="flex justify-end gap-2 pt-3">
                  <div className="h-9 w-24 bg-gray-200 dark:bg-slate-700 rounded animate-pulse" />
                  <div className="h-9 w-28 bg-gray-200 dark:bg-slate-700 rounded animate-pulse" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pagination */}
      <div className="flex justify-center">
        <div className="flex gap-2">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="h-9 w-9 bg-gray-200 dark:bg-slate-700 rounded animate-pulse"
            />
          ))}
        </div>
      </div>
    </div>
  );
}
