import WalletView from "@/components/user/WalletView";
import { getWalletBalance } from "@/lib/actions/wallet";
import { getUserSession } from "@/lib/actions/session";

const AdminWallet = async () => {
  const user = await getUserSession();
  if (!user) {
    return;
  }
  const wallet = await getWalletBalance(user.id);
  return <WalletView user={user as User} wallet={wallet as WalletResult} />;
};

export default AdminWallet;
