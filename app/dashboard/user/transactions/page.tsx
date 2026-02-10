import TransactionTable from "@/components/TransactionTable";
import { getTransactions } from "@/lib/actions/transactions";

const Transactions = async (props: {
  searchParams?: Promise<{
    query?: string;
    page?: string;
    status?: string;
    type?: string;
  }>;
}) => {
  const searchParams = await props.searchParams;
  const query = searchParams?.query || "";
  const currentPage = Number(searchParams?.page) || 1;
  const status = searchParams?.status;
  const type = searchParams?.type;
  const limit = 8;

  const { transactions, totalPages, totalTransactions } = await getTransactions(
    {
      page: currentPage,
      limit,
      query,
      status,
      type,
    },
  );

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
        Transaction History
      </h2>
      <TransactionTable
        transactions={transactions}
        title="All Transactions"
        totalPages={totalPages}
        currentPage={currentPage}
        totalTransactions={totalTransactions}
      />
    </div>
  );
};

export default Transactions;
