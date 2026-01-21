"use client";
import DashboardCharts from "@/components/DashboardCharts";
import StatCard from "@/components/StatCard";
import TransactionTable from "@/components/TransactionTable";
import { useAppStore } from "@/store";
import { ArrowDownLeft, ArrowUpRight, CreditCard, Wallet } from "lucide-react";
import { transactions } from "@/services/mockData";

type UserProps = {
  user: User;
};
const UserDashboard = ({ user }: UserProps) => {
  const setActiveTab = useAppStore((state) => state.setActiveTab);
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
        Welcome back, {user?.name}
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Balance"
          value={`UGX ${user?.wallet.balanceUGX.toLocaleString()}`}
          icon={Wallet}
          color="blue"
          trend="up"
          trendValue="+12%"
        />
        <StatCard
          title="Monthly Spent"
          value="UGX 450,000"
          icon={ArrowUpRight}
          color="purple"
        />
        <StatCard
          title="Income"
          value="UGX 2.1M"
          icon={ArrowDownLeft}
          color="green"
          trend="up"
          trendValue="+5%"
        />
        <StatCard
          title="Active Cards"
          value="2"
          icon={CreditCard}
          color="orange"
        />
      </div>

      <DashboardCharts />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <TransactionTable
            transactions={transactions}
            limit={5}
            onViewAll={() => setActiveTab("transactions")}
          />
        </div>
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm transition-colors">
          <h3 className="font-bold text-gray-900 dark:text-white mb-4">
            Quick Pay
          </h3>
          <div className="space-y-3">
            {[
              "Electricty Bill (Yaka)",
              "Water Bill (NWSC)",
              "Internet Data",
              "TV Subscription",
            ].map((item, i) => (
              <button
                key={i}
                className="w-full text-left px-4 py-3 rounded-lg border border-gray-100 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700 flex items-center justify-between group transition-colors"
              >
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {item}
                </span>
                <ArrowUpRight
                  size={16}
                  className="text-gray-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400"
                />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
