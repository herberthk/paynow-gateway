"use client";
import { usePathname } from "next/navigation";
const LayoutTitle = () => {
  const pathname = usePathname();

  let title = "Authentication";
  let desc = `Experience the next generation of financial management. Secure, fast, and comprehensive tools for your personal wallet and enterprise administration`;

  if (pathname === "/") {
    title = "Welcome Back!";
  }
  if (pathname === "/register") {
    title = "Join the Revolution";
  }
  if (pathname === "/forgot-password") {
    title = "Account Recovery";
    desc =
      "Don’t worry, it happens to the best of us. We’ll help you get back into your account in no time.";
  }
  if (pathname.includes("/otp")) {
    title = "OTP Verification";
    desc =
      "Enter the OTP sent to your email to verify your login or reset password.";
  }
  if (pathname.includes("/email-sent")) {
    title = "Email Sent";
    desc = "We have sent OTP code to your email to verify your account.";
  }
  // console.log("pathname", pathname);
  return (
    <div>
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-lg bg-indigo-500 flex items-center justify-center font-bold text-white text-xl">
          C
        </div>
        <span className="text-2xl font-bold tracking-tight">ConnectPay</span>
      </div>
      <h2 className="text-3xl font-bold mb-4">{title}</h2>
      <p className="text-slate-400 leading-relaxed">{desc}</p>
    </div>
  );
};

export default LayoutTitle;
