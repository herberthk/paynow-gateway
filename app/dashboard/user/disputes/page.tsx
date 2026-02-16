import UserDisputes from "@/components/user/UserDisputes";
import { getUserTickets } from "@/lib/actions";

export default async function DisputesPage() {
  const result = await getUserTickets();

  // Transform the data to convert Decimal to number for client component
  const initialTickets =
    result.success && result.data
      ? result.data.map((ticket) => ({
          ...ticket,
          amount: ticket.amount ? Number(ticket.amount) : null,
          transaction: ticket.transaction
            ? {
                ...ticket.transaction,
                amount: Number(ticket.transaction.amount),
              }
            : null,
          createdAt: ticket.createdAt.toISOString(),
        }))
      : [];

  return <UserDisputes initialTickets={initialTickets} />;
}
