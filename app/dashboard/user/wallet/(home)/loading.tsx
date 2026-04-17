import { Card, CardContent } from "@/components/ui";

export default function Loading() {
  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Wallet Balance Card */}
      <Card className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white border-0 animate-pulse">
        <CardContent className="p-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="h-4 w-32 bg-white/30 rounded mb-3" />
              <div className="h-10 w-48 bg-white/30 rounded" />
            </div>
            <div className="h-12 w-12 bg-white/30 rounded-full" />
          </div>
          <div className="flex items-center gap-2">
            <div className="h-4 w-24 bg-white/30 rounded" />
            <div className="h-4 w-40 bg-white/30 rounded" />
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card
            key={i}
            className="bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 hover:shadow-lg transition-shadow cursor-pointer animate-pulse"
          >
            <CardContent className="p-6 text-center space-y-3">
              <div className="h-12 w-12 bg-gray-200 dark:bg-blue-900/20 rounded-full mx-auto" />
              <div className="h-4 w-20 bg-gray-200 dark:bg-slate-700 rounded mx-auto" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        {[...Array(3)].map((_, i) => (
          <Card
            key={i}
            className="bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 animate-pulse"
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-3">
                <div className="h-4 w-28 bg-gray-200 dark:bg-slate-700 rounded" />
                <div className="h-5 w-5 bg-gray-200 dark:bg-blue-900/20 rounded" />
              </div>
              <div className="h-7 w-32 bg-gray-200 dark:bg-slate-700 rounded mb-2" />
              <div className="h-3 w-24 bg-gray-200 dark:bg-slate-700 rounded" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Activity */}
      <Card className="bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700">
        <CardContent className="p-6">
          <div className="h-6 w-40 bg-gray-200 dark:bg-slate-700 rounded mb-6 animate-pulse" />
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-slate-700 last:border-0 animate-pulse"
              >
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 bg-gray-200 dark:bg-slate-700 rounded-full" />
                  <div className="space-y-2">
                    <div className="h-4 w-40 bg-gray-200 dark:bg-slate-700 rounded" />
                    <div className="h-3 w-32 bg-gray-200 dark:bg-slate-700 rounded" />
                  </div>
                </div>
                <div className="h-5 w-24 bg-gray-200 dark:bg-slate-700 rounded" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
