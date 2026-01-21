import WalletView from "@/components/WalletView";
import { getSession } from "@/lib/session";

const Wallet = async () => {
  const user = await getSession();
  return <WalletView user={user as User} />;
};

export default Wallet;
