"use client";
import { ArrowLeft, CheckCircle } from "lucide-react";
import Link from "next/link";

type Props = {
  email: string;
};
const Sent = ({ email }: Props) => {
  return (
    <div className="w-full md:w-1/2 p-8 md:p-12">
      <div className="h-full flex flex-col justify-center animate-fade-in-up">
        <div className="text-center animate-fade-in-up">
          <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6 text-green-600 dark:text-green-400">
            <CheckCircle size={32} />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Check your mail
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">
            We have sent a password reset link to{" "}
            <span className="font-semibold text-gray-900 dark:text-white">
              {email}
            </span>
            .
          </p>

          <Link
            href="/"
            type="button"
            className="w-full py-3 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 text-gray-900 dark:text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <ArrowLeft size={16} /> Back to Log in
          </Link>

          <p className="mt-6 text-xs text-gray-400">
            Did not receive the email?{" "}
            <button className="text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer">
              Click to resend
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Sent;
