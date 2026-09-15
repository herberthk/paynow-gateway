import TopupForm from "@/components/user/TopupForm";
import { getUserSession } from "@/lib/actions/session";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Top Up Wallet",
  description: "Top up your wallet with funds",
};

const TopUpPage = async () => {
  const user = await getUserSession();
  return <TopupForm initialPhone={user?.tel ?? ""} />;
};

export default TopUpPage;
