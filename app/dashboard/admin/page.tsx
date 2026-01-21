import AdminDashboard from "@/components/AdminDashboard";
import StatCards from "@/components/StatCards";

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
