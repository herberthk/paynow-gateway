"use client";
import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  Legend,
} from "recharts";
import {
  DollarSign,
  Wallet,
  PieChart as PieIcon,
  Calendar,
} from "lucide-react";
import millify from "millify";
import CustomTooltip from "../global/CustomTooltip";

const UserAnalytics: React.FC<AnalyticsProps> = ({
  cashFlowData,
  categoryData,
  incomeCategoryData,
  totalIncome,
  totalSpent,
}) => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
          Financial Insights
        </h2>
        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
          <Calendar size={16} />
          <span>Last 30 Days</span>
        </div>
      </div>

      {/* Main Income vs Expense Chart + Income Categories */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cash Flow Analysis */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 p-6 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm transition-colors">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg text-indigo-600 dark:text-indigo-400">
                <Wallet size={20} />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 dark:text-white">
                  Cash Flow Analysis
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Income vs Spending (Last 30 Days)
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

          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={cashFlowData}>
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
                  tick={{ fill: "#9CA3AF", fontSize: 12 }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#9CA3AF", fontSize: 12 }}
                  tickFormatter={(value) => `${value / 1000}k`}
                />

                <Tooltip
                  content={
                    <CustomTooltip active={true} payload={[]} label="" />
                  }
                />
                <Legend verticalAlign="top" height={36} iconType="circle" />

                <Area
                  type="monotone"
                  dataKey="income"
                  name="Income"
                  stroke="#10B981"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorIncome)"
                />
                <Area
                  type="monotone"
                  dataKey="spend"
                  name="Spending"
                  stroke="#EF4444"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorSpend)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Income Categories Donut */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm flex flex-col transition-colors">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-green-50 dark:bg-green-900/30 rounded-lg text-green-600 dark:text-green-400">
              <DollarSign size={20} />
            </div>
            <h3 className="font-bold text-gray-900 dark:text-white">
              Income Sources
            </h3>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
            Top income categories (Last 30 days)
          </p>

          <div className="flex-1 min-h-[200px] relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={incomeCategoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {incomeCategoryData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.color}
                      strokeWidth={0}
                    />
                  ))}
                </Pie>
                <Tooltip
                  content={
                    <CustomTooltip active={true} payload={[]} label={""} />
                  }
                  wrapperStyle={{ zIndex: 50 }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none z-1">
              <span className="block text-xl font-bold text-gray-900 dark:text-white">
                {incomeCategoryData.length > 0
                  ? millify(
                      Math.round(
                        incomeCategoryData.reduce(
                          (acc, curr) => acc + curr.value,
                          0,
                        ) / incomeCategoryData.length,
                      ),
                    )
                  : 0}
              </span>
              <span className="block text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                Avg Income
              </span>
            </div>
          </div>

          <div className="mt-4 space-y-2">
            {incomeCategoryData.length > 0 ? (
              incomeCategoryData.slice(0, 5).map((category, index) => (
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
                        incomeCategoryData.reduce((a, b) => a + b.value, 0)) *
                        100,
                    )}
                    %
                  </span>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-400 italic">No income data</p>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Spending (Donut) */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm transition-colors">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-purple-50 dark:bg-purple-900/30 rounded-lg text-purple-600 dark:text-purple-400">
              <PieIcon size={20} />
            </div>
            <h3 className="font-bold text-gray-900 dark:text-white">
              Expenditure
            </h3>
          </div>

          <div className="min-h-64 grid grid-cols-1 lg:grid-cols-2 gap-2">
            <div className="flex-1 relative">
              <ResponsiveContainer width="100%" minHeight={200}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
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
                  <Tooltip
                    content={
                      <CustomTooltip active={true} payload={[]} label={""} />
                    }
                    // formatter={(value) => `UGX ${millify(Number(value))}`}
                    wrapperStyle={{ zIndex: 50 }}
                  />
                  {/* <Legend /> */}
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
                <span className="block text-xl font-bold text-gray-900 dark:text-white">
                  {categoryData.length > 0
                    ? millify(
                        Math.round(
                          categoryData.reduce(
                            (acc, curr) => acc + curr.value,
                            0,
                          ) / categoryData.length,
                        ),
                      )
                    : 0}
                </span>
                <span className="block text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                  Avg Spend
                </span>
              </div>
            </div>
            <div className="mt-4 space-y-2">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                Top spending categories
              </p>
              {categoryData.length > 0 ? (
                categoryData.slice(0, 5).map((category, index) => (
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
                          categoryData.reduce((a, b) => a + b.value, 0)) *
                          100,
                      )}
                      %
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-400 italic">No spending data</p>
              )}
            </div>
          </div>
        </div>

        {/* Daily Transaction Volume */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm transition-colors">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-orange-50 dark:bg-orange-900/30 rounded-lg text-orange-600 dark:text-orange-400">
              <DollarSign size={20} />
            </div>
            <h3 className="font-bold text-gray-900 dark:text-white">
              Activity Volume
            </h3>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={cashFlowData}>
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
                />
                <Tooltip
                  cursor={{ fill: "#2980B9", opacity: 0.1 }}
                  contentStyle={{
                    // backgroundColor: "var(--tw-bg-opacity, 1)",
                    borderRadius: "8px",
                    border: "none",
                    // boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                  }}
                  content={
                    <CustomTooltip active={true} payload={[]} label={""} />
                  }
                />
                <Bar
                  dataKey="spend"
                  fill="#4F46E5"
                  radius={[4, 4, 0, 0]}
                  barSize={24}
                  name="Transaction Vol"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserAnalytics;
