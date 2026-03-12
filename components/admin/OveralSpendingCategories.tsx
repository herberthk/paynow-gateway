"use client";

import { useState, useEffect } from "react";
import { ResponsiveContainer, Pie, Tooltip, Cell, PieChart } from "recharts";
import CustomTooltip from "@/components/global/CustomTooltip";
import {
  getTransactionVolumeBreakdown,
  type VolumeBreakdownData,
  type TimePeriodFilter,
} from "@/lib/actions/admin";
import { Loader2, ArrowUpRight } from "lucide-react";
import millify from "millify";

const OveralSpendingCategories = () => {
  const [data, setData] = useState<VolumeBreakdownData[]>([]);
  const [period, setPeriod] = useState<TimePeriodFilter>("all");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const result = await getTransactionVolumeBreakdown(period);
        setData(result);
      } catch (error) {
        console.error("Failed to fetch volume breakdown:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [period]);

  const totalVolume = data.reduce((acc, curr) => acc + curr.value, 0);

  return (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm transition-colors flex flex-col h-full">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <ArrowUpRight className="w-4 h-4 text-purple-500" />
            Volume Breakdown
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Transaction volume by category
          </p>
        </div>
        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value as TimePeriodFilter)}
          className="bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
        >
          <option value="today">Today</option>
          <option value="week">Last 7 Days</option>
          <option value="month">Last 30 Days</option>
          <option value="all">All Time</option>
        </select>
      </div>

      <div className="h-48 relative flex-1">
        {loading && (
          <div className="absolute inset-0 bg-white/50 dark:bg-slate-800/50 flex items-center justify-center z-10 rounded-lg">
            <Loader2 className="animate-spin text-purple-500 w-6 h-6" />
          </div>
        )}
        {data.length === 0 && !loading ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400 dark:text-gray-500">
            <ArrowUpRight className="w-10 h-10 mb-2 opacity-20" />
            <p className="text-sm">No volume data for this period.</p>
          </div>
        ) : (
          <>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={70}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {data.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.color}
                      strokeWidth={0}
                    />
                  ))}
                </Pie>
                <Tooltip
                  content={
                    <CustomTooltip
                      active={true}
                      payload={[]}
                      label=""
                      total={totalVolume}
                    />
                  }
                  wrapperStyle={{ zIndex: 50 }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
              <span className="block text-2xl font-bold text-gray-900 dark:text-white">
                {millify(totalVolume)}
              </span>
              <span className="block text-xs text-gray-500 dark:text-gray-400">
                Total
              </span>
            </div>
          </>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2 mt-4">
        {data.length > 0 ? (
          data.map((entry, index) => (
            <div key={index} className="flex items-center gap-2 text-xs">
              <div
                className="w-2 h-2 rounded-full shrink-0"
                style={{ backgroundColor: entry.color }}
              ></div>
              <span className="text-gray-600 dark:text-gray-300 truncate">
                {entry.name}
              </span>
            </div>
          ))
        ) : (
          <p className="text-xs text-gray-400 col-span-2 text-center italic">
            No category data available
          </p>
        )}
      </div>
    </div>
  );
};

export default OveralSpendingCategories;
