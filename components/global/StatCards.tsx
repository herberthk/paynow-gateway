"use client";
import { ArrowUpRight, Users, Briefcase, AlertCircle } from "lucide-react";
import StatCard from "./StatCard";

interface StatCardsProps {
  totalVolume?: number;
  netRevenue?: number;
  totalUsers?: number;
  activeDisputes?: number;
  volumeTrend?: "up" | "down";
  volumeTrendValue?: string;
  revenueTrend?: "up" | "down";
  revenueTrendValue?: string;
  usersTrend?: "up" | "down";
  usersTrendValue?: string;
}

const StatCards = ({
  totalVolume,
  netRevenue,
  totalUsers,
  activeDisputes,
  volumeTrend,
  volumeTrendValue,
  revenueTrend,
  revenueTrendValue,
  usersTrend,
  usersTrendValue,
}: StatCardsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        title="Transaction volume"
        value={
          totalVolume !== undefined
            ? `UGX ${totalVolume.toLocaleString()}`
            : "Loading..."
        }
        icon={ArrowUpRight}
        color="purple"
        trend={volumeTrend}
        trendValue={volumeTrendValue}
      />
      <StatCard
        title="Total Revenue"
        value={
          netRevenue !== undefined
            ? `UGX ${netRevenue.toLocaleString()}`
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
    </div>
  );
};

export default StatCards;
