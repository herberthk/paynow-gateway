import {
  ArrowDownLeft,
  ArrowUpRight,
  CreditCard,
  WalletIcon,
} from "lucide-react";

export const stats: StatCardProps[] = [
  {
    title: "Total Balance",
    value: "UGX 450,000",
    icon: WalletIcon,
    color: "blue",
    trend: "up",
    trendValue: "+12%",
  },
  {
    title: "Monthly Spent",
    value: "UGX 450,000",
    icon: ArrowUpRight,
    color: "purple",
  },
  {
    title: "Income",
    value: "UGX 2.1M",
    icon: ArrowDownLeft,
    color: "green",
    trend: "up",
    trendValue: "+5%",
  },
  {
    title: "Active Cards",
    value: "2",
    icon: CreditCard,
    color: "orange",
  },
];
