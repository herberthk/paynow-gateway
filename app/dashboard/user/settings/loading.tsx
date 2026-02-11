import { Card, CardContent } from "@/components/ui";

export default function Loading() {
  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-pulse">
      {/* Header and Tabs */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <div className="h-7 w-48 bg-gray-200 dark:bg-slate-700 rounded mb-2" />
          <div className="h-4 w-72 bg-gray-200 dark:bg-slate-700 rounded" />
        </div>
        <div className="flex bg-white dark:bg-slate-800 p-1 rounded-lg border border-gray-200 dark:border-slate-700 shadow-sm gap-1">
          <div className="h-9 w-24 bg-gray-200 dark:bg-slate-700 rounded-md" />
          <div className="h-9 w-24 bg-gray-200 dark:bg-slate-700 rounded-md" />
        </div>
      </div>

      {/* Profile Form Card */}
      <Card className="bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700">
        <CardContent className="pt-6 space-y-6">
          {/* Avatar Section */}
          <div className="flex items-center gap-4">
            <div className="h-20 w-20 bg-gray-200 dark:bg-blue-900/20 rounded-full" />
            <div className="space-y-2">
              <div className="h-4 w-32 bg-gray-200 dark:bg-slate-700 rounded" />
              <div className="h-9 w-36 bg-gray-200 dark:bg-slate-700 rounded" />
            </div>
          </div>

          {/* Form Fields */}
          <div className="grid gap-6 md:grid-cols-2">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="h-4 w-20 bg-gray-200 dark:bg-slate-700 rounded" />
                <div className="h-10 w-full bg-gray-200 dark:bg-slate-700 rounded" />
              </div>
            ))}
          </div>

          {/* Save Button */}
          <div className="flex justify-end pt-4">
            <div className="h-10 w-32 bg-gray-200 dark:bg-slate-700 rounded" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
