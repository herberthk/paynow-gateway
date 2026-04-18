"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, AlertCircle } from "lucide-react";
import { getTransactionByRef } from "@/lib/actions/wallet";
import Link from "next/link";

interface TransactionWaiterProps {
  txnRef: string;
}

export default function TransactionWaiter({ txnRef }: TransactionWaiterProps) {
  const router = useRouter();
  const [attempts, setAttempts] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const maxAttempts = 15; // 15 attempts * 2 seconds = 30 seconds max wait

  useEffect(() => {
    const poll = async () => {
      try {
        const result = await getTransactionByRef(txnRef);
        if (result.success && result.transaction) {
          // Transaction found! Refresh the page so the server component can render the success view
          router.refresh();
          return;
        }

        if (attempts >= maxAttempts) {
          setError("Transaction is taking longer than expected. Please check your wallet history later.");
          return;
        }

        // Wait 2 seconds before next poll
        setTimeout(() => setAttempts((a) => a + 1), 2000);
      } catch (err) {
        console.error("Polling error:", err);
        // Error polling, but let's try again until max attempts
        setTimeout(() => setAttempts((a) => a + 1), 2000);
      }
    };

    poll();
  }, [txnRef, attempts, router]);

  if (error) {
    return (
      <div className="max-w-md mx-auto mt-20 p-8 bg-white dark:bg-slate-900 rounded-3xl shadow-xl text-center border border-gray-100 dark:border-slate-800">
        <div className="w-16 h-16 bg-amber-50 dark:bg-amber-900/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertCircle className="text-amber-600" size={32} />
        </div>
        <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-2">
          Processing...
        </h2>
        <p className="text-gray-500 dark:text-gray-400 mb-8">{error}</p>
        <Link
          href="/dashboard/user/wallet"
          className="block w-full bg-gray-900 dark:bg-white dark:text-gray-900 text-white font-bold py-4 rounded-2xl transition-all hover:scale-[1.02] text-center"
        >
          Back to Wallet
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6">
      <div className="relative">
        <div className="w-20 h-20 border-4 border-indigo-100 dark:border-slate-800 rounded-full" />
        <Loader2 
          size={80} 
          className="text-indigo-600 animate-spin absolute inset-0"
        />
      </div>
      <div className="text-center">
        <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-2">
          Finalizing Transaction
        </h2>
        <p className="text-gray-500 dark:text-gray-400 font-medium animate-pulse">
          Please wait while we confirm your funds...
        </p>
      </div>
      <div className="text-xs text-gray-400 font-medium">
        Reference: <span className="font-mono">{txnRef}</span>
      </div>
    </div>
  );
}
