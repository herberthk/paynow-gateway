import UserAnalytics from "@/components/user/UserAnalytics";
import { getUserSession } from "@/lib";
import { getAnalyticsData } from "@/lib/actions/analytics";

const Analytics = async () => {
  const user = await getUserSession();
  if (!user) return null;

  const analyticsData = await getAnalyticsData(user.id);

  return (
    <UserAnalytics
      userId={user.id}
      cashFlowData={analyticsData.cashFlow}
      categoryData={analyticsData.categories}
      incomeCategoryData={analyticsData.incomeCategories}
      totalIncome={analyticsData.totalIncome}
      totalSpent={analyticsData.totalSpent}
    />
  );
};

export default Analytics;
