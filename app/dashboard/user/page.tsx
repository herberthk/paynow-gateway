import UserDashboard from "@/components/UserDashboard";
import { getUserSession } from "@/lib";
// import { getUserWallet } from "@/lib/actions/wallet";

const UserDashboardPage = async () => {
  const user = await getUserSession();
  if (!user) {
    return;
  }
  // const wallet = await getUserWallet(user?.id);

  return <UserDashboard user={user as User} />;
};

export default UserDashboardPage;
