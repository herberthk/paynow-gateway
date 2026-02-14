import { categoryData } from "@/services/mockData";
import { ResponsiveContainer, Pie, Tooltip, Cell, PieChart } from "recharts";

const CategoryDistribution = () => {
  return (
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
  );
};

export default CategoryDistribution;
