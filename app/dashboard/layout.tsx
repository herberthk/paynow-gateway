import DashboardAssistant from "@/components/DashboardAssistant";
import Header from "@/components/Header";
import PaymentModal from "@/components/PaymentModal";
import Sidebar from "@/components/Sidebar";
import { getSession } from "@/lib";
import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Paynow Gateway dashboard",
  description: "Paynow Gateway dashboard",
};

const RootLayout = async ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  const user = await getSession();
  if (!user) {
    redirect("/");
  }
  return (
    <div className="flex h-screen bg-gray-50 dark:bg-slate-900 transition-colors duration-200">
      <Sidebar user={user as User} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header user={user as User} />
        <main className="flex-1 overflow-y-auto p-4 lg:p-8">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </div>

      <PaymentModal />

      {/* AI Assistant - Always available for logged in users */}
      <DashboardAssistant />
    </div>
  );
};

export default RootLayout;
