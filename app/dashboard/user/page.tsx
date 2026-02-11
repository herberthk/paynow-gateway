import UserDashboard from "@/components/UserDashboard";
import { getDashboardAnalyticsData, getUserSession } from "@/lib";
import { getDashboardStats } from "@/lib/actions/dashboard";
import { getTransactions } from "@/lib/actions/transactions";

const UserDashboardPage = async (props: {
  searchParams?: Promise<{
    query?: string;
    page?: string;
    status?: string;
    type?: string;
  }>;
}) => {
  const user = await getUserSession();
  if (!user) {
    return;
  }

  const searchParams = await props.searchParams;
  const query = searchParams?.query || "";
  const currentPage = Number(searchParams?.page) || 1;
  const status = searchParams?.status;
  const type = searchParams?.type;
  const limit = 5;

  const [
    { transactions, totalPages, totalTransactions },
    dashboardStats,
    analyticsData,
  ] = await Promise.all([
    getTransactions({
      page: currentPage,
      limit,
      query,
      status,
      type,
    }),
    getDashboardStats(user.id),
    getDashboardAnalyticsData(user.id),
  ]);

  return (
    <UserDashboard
      user={user as User}
      transactions={transactions}
      totalPages={totalPages}
      totalTransactions={totalTransactions}
      stats={dashboardStats}
      analyticsData={analyticsData}
    />
  );
};

export default UserDashboardPage;
