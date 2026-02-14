import { hourlyTrafficData } from "@/services/mockData";
import {
  ResponsiveContainer,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Bar,
  BarChart,
} from "recharts";

const PeakTraffic = () => {
  return (
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
  );
};

export default PeakTraffic;
