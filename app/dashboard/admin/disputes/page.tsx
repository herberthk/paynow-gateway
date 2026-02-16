import AdminDisputes from "@/components/admin/AdminDisputes";
import { getAllTickets } from "@/lib/actions";

const Disputes = async () => {
  const result = await getAllTickets();

  // Transform the data to convert Decimal to number for client component
  const initialDisputes =
    result.success && result.data
      ? result.data.map((dispute) => ({
          ...dispute,
          amount: Number(dispute.amount),
          transaction: dispute.transaction
            ? {
                ...dispute.transaction,
                amount: Number(dispute.transaction.amount),
              }
            : null,
        }))
      : [];

  return <AdminDisputes initialDisputes={initialDisputes} />;
};

export default Disputes;
