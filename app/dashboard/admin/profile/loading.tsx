import { Card, CardContent } from "@/components/ui";

export default function Loading() {
  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-pulse">
      {/* Header */}
      <div>
        <div className="h-7 w-40 bg-gray-200 dark:bg-slate-700 rounded mb-2" />
        <div className="h-4 w-64 bg-gray-200 dark:bg-slate-700 rounded" />
      </div>

      {/* Profile Card */}
      <Card className="bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700">
        <CardContent className="pt-6 space-y-6">
          {/* Avatar Section */}
          <div className="flex items-center gap-4">
            <div className="h-20 w-20 bg-gray-200 dark:bg-blue-900/20 rounded-full" />
            <div className="space-y-2">
              <div className="h-6 w-48 bg-gray-200 dark:bg-slate-700 rounded" />
              <div className="h-4 w-64 bg-gray-200 dark:bg-slate-700 rounded" />
            </div>
          </div>

          {/* Profile Details Grid */}
          <div className="grid gap-6 md:grid-cols-2">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="h-4 w-24 bg-gray-200 dark:bg-slate-700 rounded" />
                <div className="h-10 w-full bg-gray-200 dark:bg-slate-700 rounded" />
              </div>
            ))}
          </div>

          {/* Role & Status */}
          <div className="grid gap-6 md:grid-cols-2 pt-4 border-t border-gray-200 dark:border-slate-700">
            <div className="space-y-2">
              <div className="h-4 w-16 bg-gray-200 dark:bg-slate-700 rounded" />
              <div className="h-6 w-28 bg-gray-200 dark:bg-slate-700 rounded-full" />
            </div>
            <div className="space-y-2">
              <div className="h-4 w-20 bg-gray-200 dark:bg-slate-700 rounded" />
              <div className="h-6 w-24 bg-gray-200 dark:bg-slate-700 rounded-full" />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4">
            <div className="h-10 w-24 bg-gray-200 dark:bg-slate-700 rounded" />
            <div className="h-10 w-32 bg-gray-200 dark:bg-slate-700 rounded" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
