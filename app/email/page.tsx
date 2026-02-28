import TransactionEmail from "@/components/global/TransactionEmail";

// Preview component for testing
export default function EmailPreview() {
  return (
    <TransactionEmail
      userName="Herbert Kavuma"
      amount={100000}
      currency="UGX"
      recipientName="John Doe"
      senderName="John Doe"
      reference="123456"
      fee={1000}
      type="ADMIN_NOTICE"
    />
  );
}
