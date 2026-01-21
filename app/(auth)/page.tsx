"use client";
import React, { useState } from "react";
import { Eye, EyeOff, Lock } from "lucide-react";
import { useNotificationStore } from "@/store";
import { adminUser, currentUser } from "@/services/mockData";
import { useRouter } from "nextjs-toploader/app";
import { createSession } from "@/lib";
import Link from "next/link";

const LoginPage = () => {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<UserRole>("USER");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const notify = useNotificationStore((state) => state.notify);

  // Form State
  const [email, setEmail] = useState("demo@paynow.com");
  const [password, setPassword] = useState("password");
  // const [name, setName] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate network delay
    setTimeout(() => {
      setIsLoading(false);
      const userName = selectedRole === "ADMIN" ? "Admin User" : "Alex Mukasa";
      handleLogin(selectedRole, userName);
    }, 1500);
  };
  // console.log("selectedRole", selectedRole);
  const handleLogin = async (role: UserRole, name: string) => {
    // Select the correct base user object based on role
    const baseUser = role === "ADMIN" ? adminUser : currentUser;

    // Update the name for personalization
    const loggedInUser = { ...baseUser, name };

    // setCurrentUser(loggedInUser);
    await createSession(loggedInUser);
    // setIsAuthenticated(true);

    // Set default tab based on role
    // setActiveTab(role === UserRole.ADMIN ? "admin-overview" : "dashboard");
    notify("success", `Welcome back, ${name}!`);
    const path = role === "ADMIN" ? "/dashboard/admin" : "/dashboard/user";
    console.log("path", path);
    router.push(path);
  };

  return (
    <div className="w-full md:w-1/2 p-8 md:p-12">
      <div className="flex justify-between items-center mb-8">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white">
          Sign In
        </h3>
        <div className="flex bg-gray-100 dark:bg-slate-700 p-1 rounded-lg">
          <button
            onClick={() => setSelectedRole("USER")}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${selectedRole === "USER" ? "bg-white dark:bg-slate-600 text-indigo-600 dark:text-indigo-400 shadow-sm" : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"}`}
          >
            Personal
          </button>
          <button
            onClick={() => setSelectedRole("ADMIN")}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${selectedRole === "ADMIN" ? "bg-white dark:bg-slate-600 text-purple-600 dark:text-purple-400 shadow-sm" : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"}`}
          >
            Admin
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Email Address
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-white dark:bg-slate-700 text-gray-900 dark:text-white px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            placeholder="name@example.com"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Password
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

        <div className="flex justify-end">
          <Link
            href="/forgot-password"
            type="button"
            className="cursor-pointer text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300"
          >
            Forgot Password?
          </Link>
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
              Sign In
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

export default LoginPage;
