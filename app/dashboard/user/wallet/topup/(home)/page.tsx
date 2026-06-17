import TopupForm from "@/components/user/TopupForm";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Top Up Wallet",
  description: "Top up your wallet with funds",
};

const TopUpPage = async () => {
  return <TopupForm />;
};

export default TopUpPage;
