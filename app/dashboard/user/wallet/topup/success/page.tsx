import { getTransactionByRef } from "@/lib/actions/wallet";
import SuccessView from "@/components/user/SuccessView";
import TransactionWaiter from "@/components/user/TransactionWaiter";
import { DepositFailedCard } from "@/components/user/DepositStatusCards";
import { AlertCircle } from "lucide-react";
import Link from "next/link";
import type { FC } from "react";

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

const ErrorState = ({ message }: { message: string }) => {
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
};

const FailedState = ({ txnRef }: { txnRef: string }) => {
  return (
    <div className="max-w-md mx-auto mt-20 p-8 bg-white dark:bg-slate-900 rounded-3xl shadow-xl text-center border border-gray-100 dark:border-slate-800">
      <DepositFailedCard txnRef={txnRef} />
    </div>
  );
};

const DisputedState = ({ txnRef }: { txnRef: string }) => {
  return (
    <div className="max-w-md mx-auto mt-20 p-8 bg-white dark:bg-slate-900 rounded-3xl shadow-xl text-center border border-gray-100 dark:border-slate-800">
      <div className="w-16 h-16 bg-amber-50 dark:bg-amber-900/10 rounded-full flex items-center justify-center mx-auto mb-6">
        <AlertCircle className="text-amber-600" size={32} />
      </div>
      <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-2">
        Payment under review
      </h2>
      <p className="text-gray-500 dark:text-gray-400 mb-2">
        This payment is under review — please do not retry. Your wallet will
        be credited automatically if approved.
      </p>
      <p className="text-gray-500 dark:text-gray-400 mb-2">
        If you need help, contact support@connectappbiz.com
      </p>
      <p className="text-xs text-gray-400 font-mono mb-8">
        Reference: {txnRef}
      </p>
      <Link
        href="/dashboard/user/wallet"
        className="block w-full bg-gray-900 dark:bg-white dark:text-gray-900 text-white font-bold py-4 rounded-2xl transition-all hover:scale-[1.02] text-center"
      >
        Back to Wallet
      </Link>
    </div>
  );
};

const REF_ALLOWLIST = /^[A-Za-z0-9_-]{1,64}$/;

const SuccessPage: FC<PageProps> = async ({ searchParams }) => {
  const params = await searchParams;
  const rawRef = params.ref;
  const txnReference = (Array.isArray(rawRef) ? rawRef[0] : rawRef)?.trim();
  if (!txnReference) {
    return <ErrorState message="Missing transaction reference" />;
  }
  if (!REF_ALLOWLIST.test(txnReference)) {
    return <ErrorState message="Invalid transaction reference" />;
  }

  const result = await getTransactionByRef({ reference: txnReference });

  if (!result.success || !result.transaction) {
    // Transaction row may not exist yet (redirect raced the DB write)
    // — poll for it with live provider checks.
    if (result.message === "Transaction not found") {
      return <TransactionWaiter txnRef={txnReference} />;
    }
    return <ErrorState message={result.message || "Transaction not found"} />;
  }

  if (result.transaction.status === "FAILED") {
    return <FailedState txnRef={txnReference} />;
  }

  if ((result.transaction.status as string) === "DISPUTED") {
    return <DisputedState txnRef={txnReference} />;
  }

  if (
    result.transaction.status === "PENDING" ||
    result.transaction.status === "INDETERMINATE"
  ) {
    return <TransactionWaiter txnRef={txnReference} />;
  }

  if (result.transaction.status !== "COMPLETED") {
    return (
      <ErrorState message="This transaction could not be displayed. Please contact support if the issue persists." />
    );
  }

  return <SuccessView transaction={result.transaction} />;
};

export default SuccessPage;
