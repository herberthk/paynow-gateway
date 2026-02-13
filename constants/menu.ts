import {
  LayoutDashboard,
  Wallet,
  History,
  Settings,
  ShieldCheck,
  PieChart,
  Users,
  AlertCircle,
  Banknote,
  BookOpen,
} from "lucide-react";
export const menuItems = (userRole: Privilege) =>
  userRole === "super_admin"
    ? [
        {
          id: "/dashboard/admin",
          label: "Overview",
          icon: LayoutDashboard,
          href: "/dashboard/admin",
        },
        {
          id: "/dashboard/admin/transactions",
          label: "Transactions",
          icon: Banknote,
          href: "/dashboard/admin/transactions",
        },
        {
          id: "/dashboard/admin/analytics",
          label: "Revenue & Analytics",
          icon: PieChart,
          href: "/dashboard/admin/analytics",
        },
        {
          id: "/dashboard/admin/disputes",
          label: "Disputes & Refunds",
          icon: AlertCircle,
          href: "/dashboard/admin/disputes",
        },
        {
          id: "/dashboard/admin/kyc",
          label: "KYC & Users",
          icon: Users,
          href: "/dashboard/admin/kyc",
        },
        {
          id: "/dashboard/admin/logs",
          label: "Audit Logs",
          icon: ShieldCheck,
          href: "/dashboard/admin/logs",
        },
        {
          id: "/dashboard/admin/settings",
          label: "Fee Management",
          icon: Settings,
          href: "/dashboard/admin/settings",
        },
      ]
    : [
        {
          id: "/dashboard/user",
          label: "Dashboard",
          icon: LayoutDashboard,
          href: "/dashboard/user",
        },
        {
          id: "/dashboard/user/wallet",
          label: "My Wallet",
          icon: Wallet,
          href: "/dashboard/user/wallet",
        },
        {
          id: "/dashboard/user/analytics",
          label: "Analytics",
          icon: PieChart,
          href: "/dashboard/user/analytics",
        },
        {
          id: "/dashboard/user/transactions",
          label: "Transactions",
          icon: History,
          href: "/dashboard/user/transactions",
        },
        {
          id: "/dashboard/activity-logs",
          label: "Activity Logs",
          icon: ShieldCheck,
          href: "/dashboard/activity-logs",
        },
        {
          id: "/dashboard/user/ledger",
          label: "Ledger Book",
          icon: BookOpen,
          href: "/dashboard/user/ledger",
        },
        {
          id: "/dashboard/user/settings",
          label: "Settings",
          icon: Settings,
          href: "/dashboard/user/settings",
        },
      ];
