import {
  LayoutDashboard,
  Wallet,
  History,
  Settings,
  ShieldCheck,
  PieChart,
  Users,
  AlertCircle,
  Code2,
  Banknote,
} from "lucide-react";
export const menuItems = (userRole: UserRole) =>
  userRole === "USER"
    ? [
        {
          id: "dashboard",
          label: "Dashboard",
          icon: LayoutDashboard,
          href: "/dashboard/user",
        },
        {
          id: "wallet",
          label: "My Wallet",
          icon: Wallet,
          href: "/dashboard/user/wallet",
        },
        {
          id: "analytics",
          label: "Analytics",
          icon: PieChart,
          href: "/dashboard/user/analytics",
        },
        {
          id: "transactions",
          label: "Transactions",
          icon: History,
          href: "/dashboard/user/transactions",
        },
        {
          id: "developers",
          label: "Developers",
          icon: Code2,
          href: "/dashboard/user/developers",
        },
        {
          id: "settings",
          label: "Settings",
          icon: Settings,
          href: "/dashboard/user/settings",
        },
      ]
    : [
        {
          id: "admin-dashboard",
          label: "Overview",
          icon: LayoutDashboard,
          href: "/dashboard/admin",
        },
        {
          id: "admin-transaction",
          label: "Transactions",
          icon: Banknote,
          href: "/dashboard/admin/transactions",
        },
        {
          id: "admin-analytics",
          label: "Revenue & Analytics",
          icon: PieChart,
          href: "/dashboard/admin/analytics",
        },
        {
          id: "admin-disputes",
          label: "Disputes & Refunds",
          icon: AlertCircle,
          href: "/dashboard/admin/disputes",
        },
        {
          id: "admin-kyc",
          label: "KYC & Users",
          icon: Users,
          href: "/dashboard/admin/kyc",
        },
        {
          id: "admin-logs",
          label: "Audit Logs",
          icon: ShieldCheck,
          href: "/dashboard/admin/logs",
        },
        {
          id: "admin-settings",
          label: "Fee Management",
          icon: Settings,
          href: "/dashboard/admin/settings",
        },
      ];
