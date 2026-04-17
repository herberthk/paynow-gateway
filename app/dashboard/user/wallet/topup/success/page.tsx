import { getTransactionByRef } from "@/lib/actions/wallet";
import SuccessView from "@/components/user/SuccessView";
import { AlertCircle } from "lucide-react";
import Link from "next/link";

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function SuccessPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const ref = typeof params.ref === "string" ? params.ref : null;

  if (!ref) {
    return <ErrorState message="Missing transaction reference" />;
  }

  const result = await getTransactionByRef(ref);

  if (!result.success || !result.transaction) {
    return <ErrorState message={result.message || "Transaction not found"} />;
  }

  return <SuccessView transaction={result.transaction} />;
}

function ErrorState({ message }: { message: string }) {
  return (
    <div className="max-w-md mx-auto mt-20 p-8 bg-white dark:bg-slate-900 rounded-3xl shadow-xl text-center border border-gray-100 dark:border-slate-800">
      <div className="w-16 h-16 bg-red-50 dark:bg-red-900/10 rounded-full flex items-center justify-center mx-auto mb-6">
        <AlertCircle className="text-red-600" size={32} />
      </div>
      <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-2">
        Error Loading Transaction
      </h2>
      <p className="text-gray-500 dark:text-gray-400 mb-8">{message}</p>
      <Link
        href="/dashboard/user/wallet"
        className="block w-full bg-gray-900 dark:bg-white dark:text-gray-900 text-white font-bold py-4 rounded-2xl transition-all hover:scale-[1.02] text-center"
      >
        Back to Wallet
      </Link>
    </div>
  );
}
