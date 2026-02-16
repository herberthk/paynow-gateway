import AdminUserProfile from "@/components/admin/AdminUserProfile";
import { getUserSession } from "@/lib";

const Profile = async () => {
  const user = await getUserSession();
  return <AdminUserProfile user={user!} />;
};

export default Profile;
