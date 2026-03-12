"use client";

import { useState, useEffect } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { getAdminIncomeBreakdown } from "@/lib/actions/admin";
import type {
  AdminIncomeCategory,
  TimePeriodFilter,
} from "@/lib/actions/admin";
import { Loader2, DollarSign } from "lucide-react";

const AdminIncome = () => {
  const [data, setData] = useState<AdminIncomeCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<TimePeriodFilter>("month");
  const [totalIncome, setTotalIncome] = useState(0);

  useEffect(() => {
    const fetchIncomeData = async () => {
      setLoading(true);
      try {
        const result = await getAdminIncomeBreakdown(period);
        setData(result);

        // Calculate total income for the selected period
        const total = result.reduce((sum, item) => sum + item.value, 0);
        setTotalIncome(total);
      } catch (error) {
        console.error("Failed to fetch admin income:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchIncomeData();
  }, [period]);

  // Custom tool tip for the pie chart
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white dark:bg-slate-800 p-3 rounded-lg shadow-lg border border-gray-100 dark:border-slate-700">
          <p className="font-semibold text-gray-900 dark:text-white mb-1">
            {data.name}
          </p>
          <p className="text-indigo-600 dark:text-indigo-400 font-medium">
            UGX {data.value.toLocaleString()}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {((data.value / totalIncome) * 100).toFixed(1)}% of total
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm transition-colors flex flex-col h-full">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="font-bold text-gray-900 dark:text-white mb-1 flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-indigo-500" />
            Admin Income
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Revenue breakdown by category
          </p>
        </div>

        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value as TimePeriodFilter)}
          className="bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-gray-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
        >
          <option value="today">Today</option>
          <option value="week">Last 7 Days</option>
          <option value="month">Last 30 Days</option>
          <option value="all">All Time</option>
        </select>
      </div>

      <div className="flex-1 min-h-[250px] relative flex flex-col items-center justify-center">
        {loading ? (
          <div className="flex flex-col items-center justify-center text-gray-400 dark:text-gray-500 h-full">
            <Loader2 className="w-8 h-8 animate-spin mb-2 text-indigo-500" />
            <span className="text-sm">Loading income data...</span>
          </div>
        ) : data.length === 0 || totalIncome === 0 ? (
          <div className="flex flex-col items-center justify-center text-gray-400 dark:text-gray-500 h-full">
            <DollarSign className="w-12 h-12 mb-2 opacity-20" />
            <p>No income recorded for this period.</p>
          </div>
        ) : (
          <>
            <div className="w-full h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data}
                    cx="50%"
                    cy="45%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                    stroke="none"
                  >
                    {data.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    wrapperStyle={{ zIndex: 50 }}
                    content={<CustomTooltip />}
                  />
                  <Legend
                    verticalAlign="bottom"
                    height={36}
                    iconType="circle"
                    formatter={(value) => (
                      <span className="text-sm text-gray-600 dark:text-gray-300 ml-1">
                        {value}
                      </span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Center Total Overlay (Optional, enhances UI) */}
            <div className="absolute top-[40%] left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
              <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                Total
              </p>
              <p className="hidden sm:block text-sm font-bold text-gray-900 dark:text-white truncate max-w-[80px]">
                {totalIncome >= 1000000
                  ? `${(totalIncome / 1000000).toFixed(1)}M`
                  : totalIncome >= 1000
                    ? `${(totalIncome / 1000).toFixed(1)}k`
                    : totalIncome}
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AdminIncome;
