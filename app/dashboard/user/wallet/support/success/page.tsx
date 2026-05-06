import { getTransactionByReference } from "@/lib/actions/transactions";
import SupportSuccessView from "@/components/user/SupportSuccessView";
import { AlertCircle } from "lucide-react";
import Link from "next/link";
import type { FC } from "react";
import TransactionWaiter from "@/components/user/TransactionWaiter";

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

const ErrorState = ({ message }: { message: string }) => {
  return (
    <div className="max-w-md mx-auto px-4 py-20">
      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 shadow-2xl shadow-red-500/10 border border-gray-100 dark:border-slate-800 text-center relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/5 blur-[40px] -z-10 rounded-full" />
        
        <div className="w-20 h-20 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-red-100 dark:border-red-900/30">
          <AlertCircle className="text-red-600" size={36} />
        </div>
        
        <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-3 tracking-tight">
          Oops! Something went wrong
        </h2>
        <p className="text-gray-500 dark:text-gray-400 mb-10 font-medium leading-relaxed">
          {message || "We couldn't load the transaction details. This might be due to a network error or an invalid reference."}
        </p>
        
        <div className="space-y-3">
          <Link
            href="/dashboard/user/wallet/support"
            className="block w-full bg-gray-900 dark:bg-white dark:text-gray-900 text-white font-black py-4 rounded-2xl transition-all hover:scale-[1.02] active:scale-95 text-center shadow-lg"
          >
            Try Again
          </Link>
          <Link
            href="/dashboard/user/wallet"
            className="block w-full bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-300 font-bold py-4 rounded-2xl transition-all hover:bg-gray-200 dark:hover:bg-slate-700 text-center"
          >
            Back to Wallet
          </Link>
        </div>
      </div>
    </div>
  );
};

const SupportSuccessPage: FC<PageProps> = async ({ searchParams }) => {
  const params = await searchParams;
  const ref = params.ref as string;

  if (!ref) {
    return <ErrorState message="Missing transaction reference" />;
  }

  const result = await getTransactionByReference(ref);

  if ("error" in result) {
    if (result.error?.includes("not found")) {
      return <TransactionWaiter txnRef={ref} />;
    }
    return <ErrorState message={result.error || "Transaction not found"} />;
  }

  return <SupportSuccessView transaction={result as unknown as Transaction} />;
};

export default SupportSuccessPage;
