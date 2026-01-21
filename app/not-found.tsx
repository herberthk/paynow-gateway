import { ArrowLeft, HelpCircle, Search } from "lucide-react";
import Link from "next/link";

const NotFound = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden px-4 dark:bg-slate-900">
      {/* Background Decor */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-200 dark:bg-indigo-900/20 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob pointer-events-none"></div>
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-200 dark:bg-purple-900/20 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000 pointer-events-none"
        style={{ marginLeft: "10rem", marginTop: "-5rem" }}
      ></div>

      <div className="relative z-10 text-center max-w-lg mx-auto animate-fade-in-up">
        {/* Glitchy 404 Text */}
        <h1 className="text-9xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 dark:from-indigo-400 dark:via-purple-400 dark:to-pink-400 mb-2 drop-shadow-sm select-none">
          404
        </h1>

        <div className="w-24 h-1 bg-gradient-to-r from-indigo-500 to-purple-500 mx-auto rounded-full mb-8 opacity-80"></div>

        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-4">
          Page Not Found
        </h2>

        <p className="text-gray-500 dark:text-gray-400 text-lg mb-8 leading-relaxed">
          The transaction you are looking for might have been moved, deleted, or
          never existed in this ledger.
        </p>

        {/* Search Suggestion (Visual Only) */}
        <div className="relative max-w-sm mx-auto mb-10 group">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-3 border border-gray-200 dark:border-slate-700 rounded-xl leading-5 bg-white dark:bg-slate-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all shadow-sm"
            placeholder="Search for pages..."
            disabled
          />
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <span className="text-gray-400 text-xs border border-gray-200 dark:border-slate-600 rounded px-1.5 py-0.5">
              ⌘K
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/"
            className="flex items-center cursor-pointer justify-center gap-2 px-6 py-3 border border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700/50 text-gray-700 dark:text-gray-300 rounded-xl font-medium transition-all duration-200"
          >
            <ArrowLeft size={18} />
            Go Back
          </Link>
        </div>

        <div className="mt-12 flex items-center justify-center gap-2 text-sm text-gray-400 dark:text-gray-500">
          <HelpCircle size={14} />
          <span>
            Need help?{" "}
            <a
              href="#"
              className="text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              Contact Support
            </a>
          </span>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
