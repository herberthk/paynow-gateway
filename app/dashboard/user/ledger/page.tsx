import LedgerTable from "@/components/user/LedgerTable";
import { getUserLedger } from "@/lib/actions/ledger";
import { getUserSession } from "@/lib";
import { redirect } from "next/navigation";

const LedgerPage = async (props: {
  searchParams?: Promise<{
    page?: string;
    query?: string;
    startDate?: string;
    endDate?: string;
    minAmount?: string;
    maxAmount?: string;
    type?: string;
    account?: string;
  }>;
}) => {
  const user = await getUserSession();
  if (!user) {
    redirect("/auth/login");
  }

  const searchParams = await props.searchParams;
  const currentPage = Number(searchParams?.page) || 1;
  const limit = 10;
  const query = searchParams?.query || "";
  const startDate = searchParams?.startDate;
  const endDate = searchParams?.endDate;
  const minAmount = searchParams?.minAmount
    ? Number(searchParams.minAmount)
    : undefined;
  const maxAmount = searchParams?.maxAmount
    ? Number(searchParams.maxAmount)
    : undefined;
  const type = (searchParams?.type as "DEBIT" | "CREDIT" | "ALL") || undefined;
  const account = searchParams?.account;

  const { entries, totalPages, totalEntries } = await getUserLedger({
    page: currentPage,
    limit,
    query,
    startDate,
    endDate,
    minAmount,
    maxAmount,
    type,
    account,
  });

  return (
    <div className="space-y-6 h-[calc(100vh-100px)] flex flex-col">
      <div className="flex flex-col gap-2 shrink-0">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Financial Ledger
        </h1>
        <p className="text-gray-500 dark:text-gray-400">
          A detailed record of all your financial transactions following
          double-entry accounting principles.
        </p>
      </div>

      <div className="flex-1 min-h-0">
        <LedgerTable
          entries={entries}
          totalPages={totalPages}
          currentPage={currentPage}
          totalEntries={totalEntries}
          limit={limit}
        />
      </div>
    </div>
  );
};

export default LedgerPage;
