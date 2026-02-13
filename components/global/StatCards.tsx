"use client";
import { ArrowUpRight, Users, Briefcase, AlertCircle } from "lucide-react";
import StatCard from "./StatCard";

interface StatCardsProps {
  totalRevenue?: number;
  totalUsers?: number;
  activeDisputes?: number;
  pendingTransactions?: number;
  revenueTrend?: "up" | "down";
  revenueTrendValue?: string;
  usersTrend?: "up" | "down";
  usersTrendValue?: string;
}

const StatCards = ({
  totalRevenue,
  totalUsers,
  activeDisputes,
  pendingTransactions,
  revenueTrend,
  revenueTrendValue,
  usersTrend,
  usersTrendValue,
}: StatCardsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        title="Total Revenue"
        value={
          totalRevenue !== undefined
            ? `UGX ${totalRevenue.toLocaleString()}`
            : "Loading..."
        }
        icon={Briefcase}
        color="blue"
        trend={revenueTrend}
        trendValue={revenueTrendValue}
      />
      <StatCard
        title="Total Users"
        value={
          totalUsers !== undefined ? totalUsers.toLocaleString() : "Loading..."
        }
        icon={Users}
        color="green"
        trend={usersTrend}
        trendValue={usersTrendValue}
      />
      <StatCard
        title="Active Disputes"
        value={
          activeDisputes !== undefined
            ? activeDisputes.toLocaleString()
            : "Loading..."
        }
        icon={AlertCircle}
        color="orange"
        subValue="Requires Attention"
      />
      <StatCard
        title="Pending Transactions"
        value={
          pendingTransactions !== undefined
            ? pendingTransactions.toLocaleString()
            : "Loading..."
        }
        icon={ArrowUpRight}
        color="purple"
      />
    </div>
  );
};

export default StatCards;
