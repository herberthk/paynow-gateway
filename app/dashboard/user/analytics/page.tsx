import UserAnalytics from "@/components/UserAnalytics";
import { getUserSession } from "@/lib";
import { getAnalyticsData } from "@/lib/actions/analytics";

const Analytics = async () => {
  const user = await getUserSession();
  if (!user) return null;

  const analyticsData = await getAnalyticsData(user.id);

  return (
    <UserAnalytics
      cashFlowData={analyticsData.cashFlow}
      categoryData={analyticsData.categories}
      totalIncome={analyticsData.totalIncome}
      totalSpent={analyticsData.totalSpent}
    />
  );
};

export default Analytics;
