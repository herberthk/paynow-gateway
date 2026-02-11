import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { TrendingUp, PieChart as PieIcon } from "lucide-react";
import millify from "millify";

const CustomTooltip = ({
  active,
  payload,
  label,
}: {
  active: boolean;
  payload: {
    color: string;
    name: string;
    value: number;
  }[];
  label: string;
}) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-slate-800 p-3 border border-gray-100 dark:border-slate-700 shadow-lg rounded-lg text-xs">
        <p className="font-bold text-gray-900 dark:text-white mb-1">{label}</p>
        {payload.map(
          (
            p: { color: string; name: string; value: number },
            index: number,
          ) => (
            <div key={index} className="flex items-center gap-2 mb-1">
              <div
                className="w-1.5 h-1.5 rounded-full"
                style={{ backgroundColor: p.color }}
              />
              <span className="text-gray-500 dark:text-gray-400 capitalize">
                {p.name}:
              </span>
              <span className="font-mono font-medium text-gray-900 dark:text-gray-200">
                UGX {p.value.toLocaleString()}
              </span>
            </div>
          ),
        )}
      </div>
    );
  }
  return null;
};

interface DashboardChartsProps {
  analyticsData: AnalyticsData;
}
const DashboardCharts = ({ analyticsData }: DashboardChartsProps) => {
  const { cashFlow, categories, totalIncome, totalSpent } = analyticsData;
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Spending Trend Chart */}
      <div className="lg:col-span-2 bg-white dark:bg-slate-800 p-6 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm transition-colors">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg text-indigo-600 dark:text-indigo-400">
              <TrendingUp size={20} />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 dark:text-white">
                Weekly Cash Flow
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Income vs Spending (Last 7 Days)
              </p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="text-right">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Total Income
              </p>
              <p className="font-bold text-green-600 dark:text-green-400">
                +UGX {(totalIncome / 1000).toFixed(1)}k
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Total Spent
              </p>
              <p className="font-bold text-red-500 dark:text-red-400">
                -UGX {(totalSpent / 1000).toFixed(1)}k
              </p>
            </div>
          </div>
        </div>

        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={cashFlow}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.1} />
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorSpend" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#EF4444" stopOpacity={0.1} />
                  <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#374151"
                strokeOpacity={0.2}
              />
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#9CA3AF", fontSize: 11 }}
                dy={10}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#9CA3AF", fontSize: 11 }}
                tickFormatter={(value) => `${value / 1000}k`}
              />
              <Tooltip
                content={
                  <CustomTooltip active={false} payload={[]} label={""} />
                }
              />
              <Legend
                verticalAlign="top"
                height={36}
                iconType="circle"
                wrapperStyle={{ fontSize: "12px" }}
              />

              <Area
                type="monotone"
                dataKey="income"
                name="Income"
                stroke="#10B981"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorIncome)"
              />
              <Area
                type="monotone"
                dataKey="spend"
                name="Spending"
                stroke="#EF4444"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorSpend)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Expense Breakdown Chart */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm flex flex-col transition-colors">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-purple-50 dark:bg-purple-900/30 rounded-lg text-purple-600 dark:text-purple-400">
            <PieIcon size={20} />
          </div>
          <h3 className="font-bold text-gray-900 dark:text-white">
            Expenditure
          </h3>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
          Top 3 spending categories (Last 7 days)
        </p>

        <div className="flex-1 min-h-[200px] relative">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={categories}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {categories.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.color}
                    strokeWidth={0}
                  />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
            <span className="block text-xl font-bold text-gray-900 dark:text-white">
              {millify(
                Math.round(
                  categories.reduce((acc, curr) => acc + curr.value, 0) /
                    categories.length,
                ),
              )}
            </span>
            <span className="block text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-wide">
              Avg spend
            </span>
          </div>
        </div>

        <div className="mt-4 space-y-2">
          {categories.slice(0, 3).map((category, index) => (
            <div
              key={index}
              className="flex items-center justify-between text-sm"
            >
              <div className="flex items-center gap-2">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: category.color }}
                />
                <span className="text-gray-600 dark:text-gray-300">
                  {category.name}
                </span>
              </div>
              <span className="font-medium text-gray-900 dark:text-white">
                {Math.round(
                  (category.value /
                    categories.reduce((a, b) => a + b.value, 0)) *
                    100,
                )}
                %
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DashboardCharts;
