import { Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts";
import { successRateData } from "@/services/mockData";
import { Activity } from "lucide-react";

const SystemMonitor = () => {
  return (
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
          <p className="text-xs text-gray-500 dark:text-gray-400">Latency</p>
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
  );
};

export default SystemMonitor;
