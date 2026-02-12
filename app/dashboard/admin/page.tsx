import AdminDashboard from "@/components/admin/AdminDashboard";
import StatCards from "@/components/global/StatCards";

const AdminDashboardPage = () => {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
        Admin Overview
      </h2>
      <StatCards />
      <AdminDashboard />
    </div>
  );
};

export default AdminDashboardPage;
