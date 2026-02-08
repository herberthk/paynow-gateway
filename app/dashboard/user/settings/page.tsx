import Settings from "@/components/settings/Settings";
import { getUserSession } from "@/lib";

const SettingsPage = async () => {
  const user = await getUserSession();
  if (!user) {
    return;
  }

  return <Settings user={user as User} />;
};

export default SettingsPage;
