"use client";
import { ArrowUpRight, Users, Briefcase } from "lucide-react";
import StatCard from "./StatCard";

const StatCards = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        title="Total Revenue"
        value="UGX 1.2B"
        icon={Briefcase}
        color="blue"
        trend="up"
        trendValue="+8.2%"
      />
      <StatCard
        title="Total Users"
        value="12,450"
        icon={Users}
        color="green"
        trend="up"
        trendValue="+120 this week"
      />
      <StatCard
        title="Active Disputes"
        value="24"
        icon={Users}
        color="orange"
        subValue="Requires Attention"
      />
      <StatCard
        title="Withdrawals Pending"
        value="18"
        icon={ArrowUpRight}
        color="purple"
      />
    </div>
  );
};

export default StatCards;
