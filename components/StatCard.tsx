"use client";
import React from "react";
import { type LucideIcon, ArrowUpRight, ArrowDownRight } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string;
  subValue?: string;
  icon: LucideIcon;
  trend?: "up" | "down";
  trendValue?: string;
  color?: string;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subValue,
  icon: Icon,
  trend,
  trendValue,
  color = "blue",
}) => {
  const colorClasses = {
    blue: "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400",
    green:
      "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400",
    purple:
      "bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400",
    orange:
      "bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400",
  };

  return (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-all duration-200">
      <div className="flex items-start justify-between mb-4">
        <div
          className={`p-3 rounded-lg ${colorClasses[color as keyof typeof colorClasses]}`}
        >
          <Icon size={24} />
        </div>
        {trend && (
          <div
            className={`flex items-center text-xs font-medium px-2 py-1 rounded-full ${
              trend === "up"
                ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
                : "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400"
            }`}
          >
            {trend === "up" ? (
              <ArrowUpRight size={14} className="mr-1" />
            ) : (
              <ArrowDownRight size={14} className="mr-1" />
            )}
            {trendValue}
          </div>
        )}
      </div>
      <div>
        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
          {title}
        </h3>
        <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
          {value}
        </p>
        {subValue && (
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
            {subValue}
          </p>
        )}
      </div>
    </div>
  );
};

export default StatCard;
