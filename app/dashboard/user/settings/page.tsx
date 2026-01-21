import KYCModule from "@/components/KYCModule";
import { getSession } from "@/lib/session";

const Settings = async () => {
  const user = await getSession();
  return <KYCModule user={user as User} />;
};

export default Settings;
