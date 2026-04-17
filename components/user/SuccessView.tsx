"use client";

import {
  CheckCircle2,
  Download,
  Calendar,
  Hash,
  Wallet,
  Receipt,
  CreditCard,
  Smartphone,
} from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface SuccessViewProps {
  transaction: Transaction;
}

const SuccessView = ({ transaction }: SuccessViewProps) => {
  const router = useRouter();
  const amount = transaction.amount;
  console.log("transaction", transaction);
  return (
    <div className="max-w-2xl mx-auto px-4 py-12 lg:py-20">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 lg:p-12 shadow-2xl shadow-indigo-500/10 border border-gray-100 dark:border-slate-800 relative overflow-hidden"
      >
        {/* Background Gradients */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 blur-[80px] -z-10 rounded-full" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/5 blur-[80px] -z-10 rounded-full" />

        {/* Success Icon */}
        <div className="flex flex-col items-center text-center mb-10">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{
              type: "spring",
              stiffness: 260,
              damping: 20,
              delay: 0.2,
            }}
            className="w-24 h-24 bg-green-500 dark:bg-green-600 rounded-full flex items-center justify-center mb-6 shadow-xl shadow-green-500/30"
          >
            <CheckCircle2 size={48} className="text-white" />
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-3xl lg:text-4xl font-black text-gray-900 dark:text-white mb-2"
          >
            Top-up Successful!
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-gray-500 dark:text-gray-400 font-medium text-lg"
          >
            Funds have been added to your wallet
          </motion.p>
        </div>

        {/* Transaction Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-gray-50 dark:bg-slate-800/50 rounded-3xl p-6 lg:p-8 mb-10 border border-gray-100 dark:border-slate-800"
        >
          <div className="flex justify-between items-center mb-8">
            <span className="text-gray-500 font-bold uppercase tracking-widest text-xs">
              Amount Credited
            </span>
            <div className="flex flex-col items-end">
              <span className="text-3xl lg:text-4xl font-black text-gray-900 dark:text-white">
                UGX {amount.toLocaleString()}
              </span>
              <span className="text-xs text-green-600 font-bold">
                Successfully Finalized
              </span>
            </div>
          </div>

          <div className="space-y-4 pt-6 border-t border-gray-200 dark:border-slate-700">
            <div className="flex justify-between items-center py-1">
              <div className="flex items-center gap-3 text-gray-500">
                <Hash size={18} className="text-indigo-500" />
                <span className="text-sm font-bold">Transaction Reference</span>
              </div>
              <span className="text-sm font-black text-gray-900 dark:text-white font-mono">
                {transaction.txn_ref}
              </span>
            </div>
            <div className="flex justify-between items-center py-1">
              <div className="flex items-center gap-3 text-gray-500">
                <Receipt size={18} className="text-indigo-500" />
                <span className="text-sm font-bold">Transaction Fee</span>
              </div>
              <span className="text-sm font-black text-gray-900 dark:text-white">
                UGX {transaction.fee.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between items-center py-1">
              <div className="flex items-center gap-3 text-gray-500">
                {transaction.method.includes("Mobile") ? (
                  <Smartphone size={16} className="text-indigo-500" />
                ) : (
                  <CreditCard size={16} className="text-indigo-500" />
                )}
                <span className="text-sm font-bold">Payment Method</span>
              </div>
              <span className="text-sm font-black text-gray-900 dark:text-white">
                {transaction.method}
              </span>
            </div>

            <div className="flex justify-between items-center py-1">
              <div className="flex items-center gap-3 text-gray-500">
                <Calendar size={18} className="text-indigo-500" />
                <span className="text-sm font-bold">Date & Time</span>
              </div>
              <span className="text-sm font-black text-gray-900 dark:text-white">
                {new Date(transaction.createdAt).toLocaleString()}
              </span>
            </div>
          </div>
        </motion.div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button
            onClick={() => router.push("/dashboard/user/wallet")}
            className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-black py-5 rounded-2xl shadow-lg shadow-indigo-500/20 transition-all hover:scale-[1.02] active:scale-95 text-lg"
          >
            <Wallet size={20} />
            Back to Wallet
          </button>

          {transaction?.receiptUrl ? (
            <a
              href={transaction?.receiptUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 bg-white dark:bg-slate-800 border-2 border-gray-100 dark:border-slate-700 text-gray-900 dark:text-white font-black py-5 rounded-2xl transition-all hover:bg-gray-50 dark:hover:bg-slate-700 hover:scale-[1.02] active:scale-95 text-lg"
            >
              <Download size={20} className="text-indigo-600" />
              View Receipt
            </a>
          ) : (
            <button
              onClick={() => window.print()}
              className="flex items-center justify-center gap-2 bg-white dark:bg-slate-800 border-2 border-gray-100 dark:border-slate-700 text-gray-900 dark:text-white font-black py-5 rounded-2xl transition-all hover:bg-gray-50 dark:hover:bg-slate-700 hover:scale-[1.02] active:scale-95 text-lg"
            >
              <Download size={20} className="text-indigo-600" />
              Print Receipt
            </button>
          )}
        </div>

        {/* Help Link */}
        <p className="text-center mt-8 text-sm text-gray-400 font-medium">
          Having issues?{" "}
          <Link
            href="/dashboard/user/support"
            className="text-indigo-600 font-bold hover:underline"
          >
            Contact Support
          </Link>
        </p>
      </motion.div>
    </div>
  );
};

export default SuccessView;
