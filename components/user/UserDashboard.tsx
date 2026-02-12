"use client";

import DashboardCharts from "@/components/user/DashboardCharts";
import StatCard from "@/components/global/StatCard";
import TransactionTable from "@/components/global/TransactionTable";
import { useTransactionStore } from "@/store";
import {
  ArrowDownLeft,
  ArrowUpRight,
  CreditCard,
  Wallet as WalletIcon,
  type LucideIcon,
} from "lucide-react";
import { useEffect } from "react";

type UserProps = {
  user: User;
  transactions: Transaction[];
  totalPages: number;
  totalTransactions: number;
  stats: DashboardStat[]; // Changed from importing stats
  analyticsData: AnalyticsData;
};

const iconMap: Record<string, LucideIcon> = {
  Wallet: WalletIcon,
  ArrowUpRight: ArrowUpRight,
  ArrowDownLeft: ArrowDownLeft,
  CreditCard: CreditCard,
};

const UserDashboard = ({
  user,
  transactions,
  totalPages,
  totalTransactions,
  stats,
  analyticsData,
}: UserProps) => {
  const setTotalBalance = useTransactionStore((state) => state.setTotalBalance);

  useEffect(() => {
    setTotalBalance(stats[0].value);
  }, [stats]);
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
            subValue={stat.subValue}
            icon={iconMap[stat.icon]}
            color={stat.color}
            trend={stat.trend}
            trendValue={stat.trendValue}
          />
        ))}
      </div>

      <DashboardCharts analyticsData={analyticsData} />

      <div>
        <TransactionTable
          transactions={transactions}
          limit={5}
          totalPages={totalPages}
          totalTransactions={totalTransactions}
        />
      </div>
    </div>
  );
};

export default UserDashboard;
