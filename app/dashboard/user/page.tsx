import UserDashboard from "@/components/UserDashboard";
import { getUserSession } from "@/lib";

const UserDashboardPage = async () => {
  const user = await getUserSession();
  if (!user) {
    return;
  }

  return <UserDashboard user={user as User} />;
};

export default UserDashboardPage;
