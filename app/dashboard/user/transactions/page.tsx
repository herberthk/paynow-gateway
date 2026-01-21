import TransactionTable from "@/components/TransactionTable";
import { transactions } from "@/services/mockData";

const Transactions = () => {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
        Transaction History
      </h2>
      <TransactionTable transactions={transactions} title="All Transactions" />
    </div>
  );
};

export default Transactions;
