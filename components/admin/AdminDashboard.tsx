"use client";
import React, { useState } from "react";
import { Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts";
import {
  revenueData,
  monthlyRevenueData,
  auditLogs,
  successRateData,
} from "@/services/mockData";
import { FileText, Activity } from "lucide-react";
import RevenueVolume from "./RevenueVolume";
import PaymentMethod from "./PaymentMethod";
import CategoryDistribution from "./CategoryDistribution";
import PeakTraffic from "./PeakTraffic";
import SystemMonitor from "./SystemMonitor";
import AuditTrail from "./AuditTrail";

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
      <RevenueVolume financialData={financialData} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Payment Method Health */}
        <PaymentMethod />

        {/* Category Distribution (Donut) */}
        <CategoryDistribution />

        {/* Peak Hourly Activity */}
        <PeakTraffic />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Real-time Health Monitor */}
        <SystemMonitor />

        {/* Recent Audit Logs */}
        <AuditTrail />
      </div>
    </div>
  );
};

export default AdminDashboard;
