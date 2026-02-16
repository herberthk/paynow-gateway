import UserDisputes from "@/components/user/UserDisputes";
import { getUserTickets } from "@/lib/actions";

export default async function DisputesPage() {
  const result = await getUserTickets();

  return <UserDisputes tickets={result.data || []} />;
}
