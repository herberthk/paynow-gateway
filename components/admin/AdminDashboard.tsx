"use client";
import React, { useState, useEffect } from "react";
import {
  getRevenueVolumeData,
  getSystemCategoryDistribution,
  getPeakTrafficData,
  getSystemHealthData,
} from "@/lib/actions/admin";
import RevenueVolume from "./RevenueVolume";
import PaymentMethod from "./PaymentMethod";
import CategoryDistribution from "./CategoryDistribution";
import PeakTraffic from "./PeakTraffic";
import SystemMonitor from "./SystemMonitor";
import AuditTrail from "./AuditTrail";

// Define a type for financial data, assuming it's an array of objects
// You might want to define a more specific interface for FinancialData
type FinancialData = {
  name: string;
  revenue: number;
  volume: number;
  previous: number;
};
type SystemCategoryData = {
  name: string;
  value: number;
  count: number;
  color: string;
};
type TrafficData = {
  hour: string;
  transactions: number;
};
type SystemHealthData = {
  successRate: number;
  latency: number;
  activeNodes: string;
  chartData: { time: string; rate: number }[];
};

const AdminDashboard: React.FC = () => {
  const [financialData, setFinancialData] = useState<FinancialData[]>([]);
  const [categoryData, setCategoryData] = useState<SystemCategoryData[]>([]);
  const [trafficData, setTrafficData] = useState<TrafficData[]>([]);
  const [systemHealth, setSystemHealth] = useState<SystemHealthData | null>(
    null,
  );
  const [period, setPeriod] = useState<"daily" | "weekly" | "monthly">("daily");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRevenueData = async () => {
      setLoading(true);
      try {
        const data = await getRevenueVolumeData(period);
        setFinancialData(data);

        const categoryRes = await getSystemCategoryDistribution(period);
        setCategoryData(categoryRes);

        const trafficRes = await getPeakTrafficData();
        setTrafficData(trafficRes);

        const healthRes = await getSystemHealthData();
        setSystemHealth(healthRes);
      } catch (error) {
        console.error("Error fetching revenue data:", error);
        setFinancialData([]); // Clear data on error
        setCategoryData([]);
        setTrafficData([]);
        setSystemHealth(null);
      } finally {
        setLoading(false);
      }
    };

    fetchRevenueData();
  }, [period]);

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
          {(["daily", "weekly", "monthly"] as const).map((range) => (
            <button
              key={range}
              onClick={() => setPeriod(range)}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${
                period === range
                  ? "bg-indigo-50 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 shadow-sm"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-slate-700"
              }`}
            >
              {range === "daily"
                ? "Daily"
                : range === "weekly"
                  ? "Weekly"
                  : "Monthly"}
            </button>
          ))}
        </div>
      </div>
      {/* Main Financial Chart */}
      {loading ? (
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-gray-200 dark:border-slate-700 h-96 flex items-center justify-center">
          <p className="text-gray-500 dark:text-gray-400">
            Loading revenue data...
          </p>
        </div>
      ) : (
        <RevenueVolume financialData={financialData} />
      )}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Payment Method Health */}
        <PaymentMethod />

        {/* Category Distribution (Donut) */}
        <CategoryDistribution data={categoryData} />

        {/* Peak Hourly Activity */}
        <PeakTraffic data={trafficData} />
      </div>
      {/* TODO: Add System Monitor and Audit Trail */}
      {/* className="grid grid-cols-1 lg:grid-cols-2 gap-6" */}
      <div className=" w-full">
        {/* Real-time Health Monitor */}
        <SystemMonitor data={systemHealth} />

        {/* Recent Audit Logs */}
        {/* <AuditTrail /> */}
      </div>
    </div>
  );
};

export default AdminDashboard;
