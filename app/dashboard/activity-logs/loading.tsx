import { Card, CardContent, CardHeader } from "@/components/ui";

export default function Loading() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="h-7 w-48 bg-gray-200 dark:bg-slate-700 rounded mb-2 animate-pulse" />
          <div className="h-4 w-64 bg-gray-200 dark:bg-slate-700 rounded animate-pulse" />
        </div>
        <div className="h-9 w-32 bg-gray-200 dark:bg-slate-700 rounded animate-pulse" />
      </div>

      {/* Activity List */}
      <Card className="bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700">
        <CardHeader>
          <div className="h-6 w-40 bg-gray-200 dark:bg-slate-700 rounded animate-pulse" />
        </CardHeader>
        <CardContent className="space-y-4">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="flex items-start gap-4 p-4 rounded-lg bg-gray-50 dark:bg-slate-700/50 animate-pulse"
            >
              <div className="h-10 w-10 bg-gray-200 dark:bg-slate-600 rounded-full shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-3/4 bg-gray-200 dark:bg-slate-600 rounded" />
                <div className="h-3 w-32 bg-gray-200 dark:bg-slate-600 rounded" />
              </div>
              <div className="h-3 w-20 bg-gray-200 dark:bg-slate-600 rounded" />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
