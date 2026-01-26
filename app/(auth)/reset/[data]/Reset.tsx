"use client";
import React, { useState } from "react";
import { Eye, EyeOff, Lock } from "lucide-react";
import Link from "next/link";
import { resetPassword } from "@/lib";
import { useNotificationStore } from "@/store";
import { useRouter } from "nextjs-toploader/app";

type Props = {
  id: number;
};
const ResetPage = ({ id }: Props) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const notify = useNotificationStore((state) => state.notify);
  const router = useRouter();
  const [password, setPassword] = useState("");
  // const [name, setName] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) {
      notify("error", `The password is less than 8 characters`);
      return;
    }
    setIsLoading(true);
    try {
      const result = await resetPassword(id, password);
      if (result === "Password reset successfully") {
        notify("success", result);
        notify("info", "Please login with your new password");
        // router.push("/");
      } else {
        notify("error", result!);
        notify("info", "Please try again");
        router.push("/");
      }
      setIsLoading(false);
    } catch (error) {
      notify("error", "Failed to reset password");
      setIsLoading(false);
      console.log("error", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full md:w-1/2 p-8 md:p-12">
      <div className="flex justify-between items-center mb-8">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white">
          Enter new password
        </h3>
      </div>

      <form onSubmit={handleSubmit} className="space-y-16">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            New password
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-white dark:bg-slate-700 text-gray-900 dark:text-white px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              placeholder="••••••••"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute cursor-pointer right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className={`w-full py-3 rounded-lg cursor-pointer text-white font-bold text-sm flex items-center justify-center gap-2 transition-all ${
            isLoading
              ? "bg-indigo-400 cursor-not-allowed"
              : "bg-indigo-600 hover:bg-indigo-700 hover:shadow-lg"
          }`}
        >
          {isLoading ? (
            <>Processing...</>
          ) : (
            <>
              <Lock size={16} />
              Set new password
            </>
          )}
        </button>
      </form>

      <div className="mt-8 text-center">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Don&apos;t have an account?
          <Link
            href="/register"
            className="ml-1 font-bold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
          >
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default ResetPage;
