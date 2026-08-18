import SupportView from "@/components/user/SupportView";
import { getWalletBalance } from "@/lib/actions/wallet";
import { getUserSession } from "@/lib/actions/session";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Support | ConnectPay payment gateway",
  description: "Support other users financially",
};

const SupportPage = async () => {
  const user = await getUserSession();
  if (!user) {
    redirect("/auth/login");
  }
  
  const wallet = await getWalletBalance(user.id);
  
  return <SupportView user={user as User} wallet={wallet as WalletResult} />;
};

export default SupportPage;
