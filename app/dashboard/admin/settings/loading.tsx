import { Card, CardContent, CardHeader } from "@/components/ui";

export default function Loading() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Page Title */}
      <div>
        <div className="h-7 w-48 bg-gray-200 dark:bg-slate-700 rounded mb-2 animate-pulse" />
        <div className="h-4 w-72 bg-gray-200 dark:bg-slate-700 rounded animate-pulse" />
      </div>

      {/* Fee Configuration Cards */}
      <div className="grid gap-6 md:grid-cols-2">
        {[...Array(4)].map((_, i) => (
          <Card
            key={i}
            className="bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700"
          >
            <CardHeader>
              <div className="flex items-center gap-2 mb-2">
                <div className="h-5 w-5 bg-gray-200 dark:bg-blue-900/20 rounded animate-pulse" />
                <div className="h-5 w-40 bg-gray-200 dark:bg-slate-700 rounded animate-pulse" />
              </div>
              <div className="h-4 w-56 bg-gray-200 dark:bg-slate-700 rounded animate-pulse" />
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="h-4 w-32 bg-gray-200 dark:bg-slate-700 rounded animate-pulse" />
                <div className="h-10 w-full bg-gray-200 dark:bg-slate-700 rounded animate-pulse" />
              </div>
              <div className="space-y-2">
                <div className="h-4 w-28 bg-gray-200 dark:bg-slate-700 rounded animate-pulse" />
                <div className="h-10 w-full bg-gray-200 dark:bg-slate-700 rounded animate-pulse" />
              </div>
              <div className="flex justify-end pt-2">
                <div className="h-9 w-24 bg-gray-200 dark:bg-slate-700 rounded animate-pulse" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* System Settings */}
      <Card className="bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700">
        <CardHeader>
          <div className="h-6 w-44 bg-gray-200 dark:bg-slate-700 rounded animate-pulse" />
        </CardHeader>
        <CardContent className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center justify-between py-3">
              <div className="space-y-2">
                <div className="h-4 w-40 bg-gray-200 dark:bg-slate-700 rounded animate-pulse" />
                <div className="h-3 w-56 bg-gray-200 dark:bg-slate-700 rounded animate-pulse" />
              </div>
              <div className="h-6 w-12 bg-gray-200 dark:bg-slate-700 rounded-full animate-pulse" />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
