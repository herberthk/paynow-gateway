import WalletView from "@/components/WalletView";
import { getUserWallet } from "@/lib/actions/wallet";
// import { getUserWallet } from "@/lib/actions/wallet";
import { getUserSession } from "@/lib/actions/session";

const Wallet = async () => {
  const user = await getUserSession();
  if (!user) {
    return;
  }
  const wallet = await getUserWallet(user.id);
  return <WalletView user={user as User} wallet={wallet as Wallet} />;
};

export default Wallet;
