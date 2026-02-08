"use client";
import DashboardCharts from "@/components/DashboardCharts";
import StatCard from "@/components/StatCard";
import TransactionTable from "@/components/TransactionTable";
import { transactions } from "@/services/mockData";
import { stats } from "@/constants";

type UserProps = {
  user: User;
  // wallet: Wallet;
};
const UserDashboard = ({ user }: UserProps) => {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
        Welcome back, {user?.name}
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <StatCard
            key={i}
            title={stat.title}
            value={stat.value}
            icon={stat.icon}
            color={stat.color}
            trend={stat.trend}
            trendValue={stat.trendValue}
          />
        ))}
      </div>

      <DashboardCharts />

      <div>
        <TransactionTable transactions={transactions} limit={5} />
      </div>
    </div>
  );
};

export default UserDashboard;
