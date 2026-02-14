import { DollarSign, TrendingUp, Download } from "lucide-react";
import {
  ResponsiveContainer,
  ComposedChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Bar,
  Area,
  Line,
} from "recharts";

type RevenueVolumeProps = {
  financialData: FinancialData[];
};

const CustomTooltip = ({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { color: string; name: string; value: number }[];
  label?: string;
}) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-slate-800 p-4 border border-gray-100 dark:border-slate-700 shadow-xl rounded-lg">
        <p className="font-bold text-gray-900 dark:text-white mb-2">{label}</p>
        {payload.map((p, index: number) => (
          <div key={index} className="flex items-center gap-2 text-sm mb-1">
            <div
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: p.color }}
            />
            <span className="text-gray-500 dark:text-gray-400 capitalize">
              {p?.name}:
            </span>
            <span className="font-mono font-medium text-gray-900 dark:text-gray-200">
              {p?.name === "revenue" || p?.name === "previous" ? "$" : ""}
              {p?.value.toLocaleString()}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};
const RevenueVolume = ({ financialData }: RevenueVolumeProps) => {
  // Calculate trend from financial data
  const currentTotal = financialData.reduce(
    (sum, item) => sum + item.revenue,
    0,
  );
  const previousTotal = financialData.reduce(
    (sum, item) => sum + item.previous,
    0,
  );
  const trendPercent =
    previousTotal > 0
      ? ((currentTotal - previousTotal) / previousTotal) * 100
      : 0;
  const isPositive = trendPercent >= 0;

  return (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm transition-colors">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg text-indigo-600 dark:text-indigo-400">
            <DollarSign size={20} />
          </div>
          <div>
            <h3 className="font-bold text-gray-900 dark:text-white">
              Revenue & Volume
            </h3>
            <div className="flex items-center gap-2 text-sm">
              <span
                className={`font-medium flex items-center gap-1 ${
                  isPositive
                    ? "text-green-600 dark:text-green-400"
                    : "text-red-600 dark:text-red-400"
                }`}
              >
                <TrendingUp
                  size={14}
                  className={isPositive ? "" : "rotate-180"}
                />
                {isPositive ? "+" : ""}
                {trendPercent.toFixed(1)}%
              </span>
              <span className="text-gray-400 dark:text-gray-500">
                vs previous period
              </span>
            </div>
          </div>
        </div>
        <button className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300">
          <Download size={18} />
        </button>
      </div>

      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={financialData}>
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.1} />
                <stop offset="95%" stopColor="#4F46E5" stopOpacity={0} />
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
              tick={{ fill: "#9CA3AF", fontSize: 12 }}
              dy={10}
            />
            <YAxis
              yAxisId="left"
              orientation="left"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#9CA3AF", fontSize: 12 }}
              tickFormatter={(value) => `$${value / 1000}k`}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#9CA3AF", fontSize: 12 }}
              hide
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend verticalAlign="top" height={36} iconType="circle" />

            <Bar
              yAxisId="right"
              dataKey="volume"
              name="Tx Volume"
              fill="#E5E7EB" // Consider dark mode fill if necessary
              radius={[4, 4, 0, 0]}
              barSize={20}
            />
            <Area
              yAxisId="left"
              type="monotone"
              dataKey="revenue"
              name="Revenue"
              stroke="#4F46E5"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#colorRevenue)"
            />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="previous"
              name="Previous"
              stroke="#9CA3AF"
              strokeDasharray="5 5"
              dot={false}
              strokeWidth={2}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default RevenueVolume;
