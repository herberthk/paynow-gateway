import KYCModule from "@/components/KYCModule";
import { getUserSession } from "@/lib";

const Settings = async () => {
  const user = await getUserSession();
  return <KYCModule user={user as User} />;
};

export default Settings;
