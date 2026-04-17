import { Card, CardContent, CardHeader } from "@/components/ui";

export default function Loading() {
  return (
    <div className="space-y-6 p-6">
      {/* Stats Cards Skeleton */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
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

      {/* Analytics Chart Skeleton */}
      <Card className="animate-pulse bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700">
        <CardHeader>
          <div className="h-6 w-48 bg-gray-200 dark:bg-slate-700 rounded mb-2" />
          <div className="h-4 w-64 bg-gray-200 dark:bg-slate-700 rounded" />
        </CardHeader>
        <CardContent>
          <div className="h-[300px] bg-gray-200 dark:bg-slate-700 rounded" />
        </CardContent>
      </Card>

      {/* Transaction Table Skeleton */}
      <Card className="animate-pulse bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700">
        <CardHeader>
          <div className="h-6 w-36 bg-gray-200 dark:bg-slate-700 rounded mb-2" />
          <div className="h-4 w-56 bg-gray-200 dark:bg-slate-700 rounded" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="h-10 w-10 bg-gray-200 dark:bg-slate-700 rounded-full" />
                  <div>
                    <div className="h-4 w-32 bg-gray-200 dark:bg-slate-700 rounded mb-2" />
                    <div className="h-3 w-24 bg-gray-200 dark:bg-slate-700 rounded" />
                  </div>
                </div>
                <div className="h-4 w-20 bg-gray-200 dark:bg-slate-700 rounded" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
