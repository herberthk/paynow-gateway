import AdminDashboard from "@/components/admin/AdminDashboard";
import StatCards from "@/components/global/StatCards";
import { getAdminDashboardStats } from "@/lib/actions/admin";

const AdminDashboardPage = async () => {
  const stats = await getAdminDashboardStats();

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
        Admin Overview
      </h2>
      <StatCards
        totalRevenue={stats?.totalRevenue}
        totalUsers={stats?.totalUsers}
        activeDisputes={stats?.activeDisputes}
        pendingTransactions={stats?.pendingTransactions}
        revenueTrend={
          stats?.revenueTrend?.direction as "up" | "down" | undefined
        }
        revenueTrendValue={stats?.revenueTrend?.label}
        usersTrend={stats?.usersTrend?.direction as "up" | "down" | undefined}
        usersTrendValue={stats?.usersTrend?.label}
      />
      <AdminDashboard />
    </div>
  );
};

export default AdminDashboardPage;
