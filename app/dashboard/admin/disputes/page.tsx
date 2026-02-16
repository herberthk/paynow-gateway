import AdminDisputes from "@/components/admin/AdminDisputes";
import { getAllTickets } from "@/lib/actions";

const Disputes = async () => {
  const result = await getAllTickets()!;

  return <AdminDisputes tickets={result.data || []} />;
};

export default Disputes;
