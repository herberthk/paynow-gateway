import { getUserSession } from "@/lib";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ShieldCheck, Wallet } from "lucide-react";
import LayoutTitle from "./LayoutTitle";
export const metadata: Metadata = {
  title: "Authentication",
  description: "Payment Gateway Authentication",
};

const AuthLayout = async ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  const session = await getUserSession();
  if (session) {
    const path =
      session.privilege === "super_admin"
        ? "/dashboard/admin"
        : "/dashboard/user";
    console.log("path", path);
    console.log("session", session);
    redirect(path);
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex items-center justify-center p-4 transition-colors duration-200">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-200 dark:bg-indigo-900/20 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-200 dark:bg-purple-900/20 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-[-20%] left-[20%] w-[40%] h-[40%] bg-pink-200 dark:bg-pink-900/20 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
      </div>
      <div className="bg-white dark:bg-slate-800 w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row relative z-10 transition-colors">
        {/* Left Side - Marketing */}
        <div className="w-full md:w-1/2 bg-slate-900 dark:bg-slate-950 p-8 text-white flex flex-col justify-between">
          <LayoutTitle />

          <div className="mt-8 space-y-4">
            <div className="flex items-center gap-4 p-4 bg-slate-800 dark:bg-slate-900 rounded-xl border border-slate-700">
              <div className="p-2 bg-indigo-500/20 rounded-lg text-indigo-400">
                <Wallet size={24} />
              </div>
              <div>
                <h4 className="font-semibold">Multi-Currency Wallet</h4>
                <p className="text-xs text-slate-400">
                  Manage UGX and USD seamlessly.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-4 bg-slate-800 dark:bg-slate-900 rounded-xl border border-slate-700">
              <div className="p-2 bg-green-500/20 rounded-lg text-green-400">
                <ShieldCheck size={24} />
              </div>
              <div>
                <h4 className="font-semibold">Bank-Grade Security</h4>
                <p className="text-xs text-slate-400">
                  256-bit encryption & fraud detection.
                </p>
              </div>
            </div>
          </div>
        </div>
        {children}
      </div>
    </div>
  );
};

export default AuthLayout;
