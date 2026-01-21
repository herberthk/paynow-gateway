import UserDashboard from "@/components/UserDashboard";
import { getSession } from "@/lib/session";

const UserDashboardPage = async () => {
  const user = await getSession();
  return <UserDashboard user={user as User} />;
};

export default UserDashboardPage;
