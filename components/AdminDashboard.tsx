"use client";
import React, { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  ComposedChart,
  Legend,
} from "recharts";
import {
  revenueData,
  monthlyRevenueData,
  categoryData,
  auditLogs,
  successRateData,
  hourlyTrafficData,
  paymentMethodStats,
} from "@/services/mockData";
import {
  FileText,
  Download,
  TrendingUp,
  Activity,
  DollarSign,
  Smartphone,
  CreditCard,
  Landmark,
} from "lucide-react";

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
const AdminDashboard: React.FC = () => {
  const [timeRange, setTimeRange] = useState<"7d" | "30d" | "90d">("7d");

  // Dynamic data based on filter simulation
  const financialData = timeRange === "7d" ? revenueData : monthlyRevenueData;

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Analytics Overview
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Real-time platform performance metrics.
          </p>
        </div>
        <div className="flex items-center bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg p-1 shadow-sm transition-colors">
          {(["7d", "30d", "90d"] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${
                timeRange === range
                  ? "bg-indigo-50 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 shadow-sm"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-slate-700"
              }`}
            >
              {range === "7d" ? "Week" : range === "30d" ? "Month" : "Quarter"}
            </button>
          ))}
        </div>
      </div>

      {/* Main Financial Chart */}
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
                <span className="text-green-600 dark:text-green-400 font-medium flex items-center gap-1">
                  <TrendingUp size={14} /> +12.5%
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Payment Method Health */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm transition-colors">
          <h3 className="font-bold text-gray-900 dark:text-white mb-2">
            Method Performance
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-6">
            Success rates by provider type
          </p>

          <div className="space-y-6">
            {paymentMethodStats.map((stat) => (
              <div key={stat.method}>
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center gap-2">
                    {stat.method === "Mobile Money" && (
                      <Smartphone
                        size={16}
                        className="text-gray-500 dark:text-gray-400"
                      />
                    )}
                    {stat.method === "Credit Card" && (
                      <CreditCard
                        size={16}
                        className="text-gray-500 dark:text-gray-400"
                      />
                    )}
                    {stat.method === "Bank Transfer" && (
                      <Landmark
                        size={16}
                        className="text-gray-500 dark:text-gray-400"
                      />
                    )}
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                      {stat.method}
                    </span>
                  </div>
                  <span
                    className={`text-sm font-bold ${stat.success > 95 ? "text-green-600 dark:text-green-400" : "text-orange-500 dark:text-orange-400"}`}
                  >
                    {stat.success}%
                  </span>
                </div>
                <div className="w-full bg-gray-100 dark:bg-slate-700 rounded-full h-2 mb-1">
                  <div
                    className="h-2 rounded-full transition-all duration-500"
                    style={{
                      width: `${stat.usage}%`,
                      backgroundColor: stat.color,
                    }}
                  ></div>
                </div>
                <div className="text-right text-xs text-gray-400 dark:text-gray-500">
                  {stat.usage}% of Volume
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 pt-6 border-t border-gray-100 dark:border-slate-700">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Total Failed
              </span>
              <span className="text-sm font-mono font-medium text-red-500 dark:text-red-400">
                1.2%
              </span>
            </div>
          </div>
        </div>

        {/* Category Distribution (Donut) */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm transition-colors">
          <h3 className="font-bold text-gray-900 dark:text-white mb-4">
            Spending Categories
          </h3>
          <div className="h-48 relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={70}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
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
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
              <span className="block text-2xl font-bold text-gray-900 dark:text-white">
                1.2k
              </span>
              <span className="block text-xs text-gray-500 dark:text-gray-400">
                Transactions
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 mt-4">
            {categoryData.slice(0, 4).map((entry, index) => (
              <div key={index} className="flex items-center gap-2 text-xs">
                <div
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ backgroundColor: entry.color }}
                ></div>
                <span className="text-gray-600 dark:text-gray-300 truncate">
                  {entry.name}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Peak Hourly Activity */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm transition-colors">
          <h3 className="font-bold text-gray-900 dark:text-white mb-1">
            Peak Traffic
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
            Transactions by hour of day
          </p>
          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={hourlyTrafficData} layout="vertical">
                <CartesianGrid
                  strokeDasharray="3 3"
                  horizontal={true}
                  vertical={false}
                  stroke="#374151"
                  strokeOpacity={0.2}
                />
                <XAxis type="number" hide />
                <YAxis
                  dataKey="hour"
                  type="category"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: "#6B7280" }}
                  width={30}
                />
                <Tooltip
                  cursor={{ fill: "transparent" }}
                  contentStyle={{ fontSize: "12px" }}
                />
                <Bar
                  dataKey="transactions"
                  fill="#6366F1"
                  radius={[0, 4, 4, 0]}
                  barSize={12}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Real-time Health Monitor */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm transition-colors">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Activity
                className="text-indigo-600 dark:text-indigo-400 animate-pulse"
                size={20}
              />
              System Health
            </h3>
            <span className="text-xs font-mono bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-2 py-1 rounded">
              ALL SYSTEMS OPERATIONAL
            </span>
          </div>
          <div className="h-40">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={successRateData}>
                <defs>
                  <linearGradient id="colorRate" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Tooltip />
                <Area
                  type="step"
                  dataKey="rate"
                  stroke="#10B981"
                  strokeWidth={2}
                  fill="url(#colorRate)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-3 gap-4 mt-4 text-center">
            <div className="p-3 bg-gray-50 dark:bg-slate-700 rounded-lg">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Latency
              </p>
              <p className="font-mono font-bold text-gray-900 dark:text-white">
                45ms
              </p>
            </div>
            <div className="p-3 bg-gray-50 dark:bg-slate-700 rounded-lg">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Success Rate
              </p>
              <p className="font-mono font-bold text-green-600 dark:text-green-400">
                99.8%
              </p>
            </div>
            <div className="p-3 bg-gray-50 dark:bg-slate-700 rounded-lg">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Active Nodes
              </p>
              <p className="font-mono font-bold text-indigo-600 dark:text-indigo-400">
                12/12
              </p>
            </div>
          </div>
        </div>

        {/* Recent Audit Logs */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm flex flex-col transition-colors">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <FileText
                className="text-slate-500 dark:text-slate-400"
                size={20}
              />
              Audit Trail
            </h3>
            <button className="text-indigo-600 dark:text-indigo-400 text-sm font-medium hover:underline">
              View Full Log
            </button>
          </div>
          <div className="flex-1 overflow-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 dark:bg-slate-700 text-gray-500 dark:text-gray-400 sticky top-0">
                <tr>
                  <th className="px-4 py-2">Action</th>
                  <th className="px-4 py-2">Admin</th>
                  <th className="px-4 py-2 text-right">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
                {auditLogs.map((log) => (
                  <tr
                    key={log.id}
                    className="hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900 dark:text-gray-200">
                        {log.action}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[150px]">
                        {log.details}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 dark:bg-slate-600 text-gray-800 dark:text-gray-200">
                        {log.admin}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500 dark:text-gray-400 text-xs text-right font-mono">
                      {log.timestamp.split(" ")[1]}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
