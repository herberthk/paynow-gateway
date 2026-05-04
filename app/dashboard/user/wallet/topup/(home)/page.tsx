import { getUserSession } from "@/lib/actions/session";
import TopupForm from "@/components/user/TopupForm";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Top Up Wallet",
  description: "Top up your wallet with funds",
};

const TopUpPage = async () => {
  const user = await getUserSession();
  return <TopupForm user={user} />;
};

export default TopUpPage;
