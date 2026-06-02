"use client";
import { initPasswordReset } from "@/lib";
import { useNotificationStore } from "@/store";
import { ArrowLeft, Mail } from "lucide-react";
import Link from "next/link";
// import { useRouter } from "nextjs-toploader/app";
import { useState } from "react";

const ForgetPassword = () => {
  const [isLoading, setIsLoading] = useState(false);
  const notify = useNotificationStore((state) => state.notify);
  const [email, setEmail] = useState("");

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const result = await initPasswordReset(email);
      console.log("result", result);
      if (result) {
        notify("ALERT", result);
      }
      setIsLoading(false);
    } catch (error) {
      console.log("error", error);
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full md:w-1/2 p-8 md:p-12">
      <div className="h-full flex flex-col justify-center animate-fade-in-up">
        <Link
          href="/"
          className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 mb-6 transition-colors cursor-pointer"
        >
          <ArrowLeft size={16} /> Back to Log in
        </Link>

        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Reset Password
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">
          Enter the email address associated with your account and we&apos;ll
          send you a verification code to reset your password.
        </p>

        <form onSubmit={handleReset} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500"
                size={18}
              />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white dark:bg-slate-700 text-gray-900 dark:text-white pl-10 pr-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                placeholder="name@example.com"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-3 rounded-lg cursor-pointer text-white font-bold text-sm flex items-center justify-center gap-2 transition-all  ${
              isLoading
                ? "bg-indigo-400 cursor-not-allowed"
                : "bg-indigo-600 hover:bg-indigo-700 hover:shadow-lg"
            }`}
          >
            {isLoading ? "Sending Code..." : "Send Reset Code"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ForgetPassword;
