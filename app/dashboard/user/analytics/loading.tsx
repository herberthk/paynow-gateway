import { Card, CardContent, CardHeader } from "@/components/ui";

export default function Loading() {
  return (
    <div className="space-y-6">
      {/* Summary Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card
            key={i}
            className="animate-pulse bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700"
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="h-5 w-32 bg-gray-200 dark:bg-slate-700 rounded" />
              <div className="h-5 w-5 bg-gray-200 dark:bg-blue-900/20 rounded" />
            </CardHeader>
            <CardContent>
              <div className="h-8 w-28 bg-gray-200 dark:bg-slate-700 rounded mb-2" />
              <div className="h-3 w-24 bg-gray-200 dark:bg-slate-700 rounded" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Cash Flow Chart */}
      <Card className="animate-pulse bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700">
        <CardHeader>
          <div className="flex items-center gap-2 mb-2">
            <div className="h-6 w-6 bg-gray-200 dark:bg-blue-900/20 rounded" />
            <div className="h-6 w-48 bg-gray-200 dark:bg-slate-700 rounded" />
          </div>
          <div className="h-4 w-64 bg-gray-200 dark:bg-slate-700 rounded" />
        </CardHeader>
        <CardContent>
          <div className="h-[400px] bg-gray-200 dark:bg-slate-700 rounded" />
        </CardContent>
      </Card>

      {/* Category & Pie Chart Row */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Category Breakdown */}
        <Card className="animate-pulse bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700">
          <CardHeader>
            <div className="flex items-center gap-2 mb-2">
              <div className="h-6 w-6 bg-gray-200 dark:bg-blue-900/20 rounded" />
              <div className="h-6 w-44 bg-gray-200 dark:bg-slate-700 rounded" />
            </div>
            <div className="h-4 w-56 bg-gray-200 dark:bg-slate-700 rounded" />
          </CardHeader>
          <CardContent>
            <div className="h-[300px] bg-gray-200 dark:bg-slate-700 rounded" />
          </CardContent>
        </Card>

        {/* Spending Distribution */}
        <Card className="animate-pulse bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700">
          <CardHeader>
            <div className="flex items-center gap-2 mb-2">
              <div className="h-6 w-6 bg-gray-200 dark:bg-blue-900/20 rounded" />
              <div className="h-6 w-48 bg-gray-200 dark:bg-slate-700 rounded" />
            </div>
            <div className="h-4 w-64 bg-gray-200 dark:bg-slate-700 rounded" />
          </CardHeader>
          <CardContent>
            <div className="h-[300px] bg-gray-200 dark:bg-slate-700 rounded" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
