import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";

interface SupportEmailProps {
  userName: string;
  senderName?: string;
  recipientName?: string;
  amount: number;
  reference: string;
  method?: string;
  fee?: number;
  type: "RECEIVER" | "SENDER_RECEIPT";
}

export const SupportEmail = ({
  userName,
  senderName,
  recipientName,
  amount,
  reference,
  method,
  fee,
  type,
}: SupportEmailProps) => {
  const isReceiver = type === "RECEIVER";

  return (
    <Html>
      <Head />
      <Preview>
        {isReceiver
          ? `You received support of UGX ${amount.toLocaleString()} from ${senderName}`
          : `Support transaction receipt for UGX ${amount.toLocaleString()} to ${recipientName}`}
      </Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Paynow Gateway</Heading>

          <Section style={contentSection}>
            <Heading style={h2}>
              {isReceiver ? "Support Received 🎉" : "Support Sent Successfully"}
            </Heading>

            <Text style={text}>Hi {userName},</Text>

            <Text style={text}>
              {isReceiver
                ? `Great news! You have received financial support of UGX ${amount.toLocaleString()} from ${senderName}.`
                : `Your support of UGX ${amount.toLocaleString()} to ${recipientName} was successfully processed.`}
            </Text>

            <Section style={detailsContainer}>
              <Text style={detailText}>
                <strong>Amount:</strong> UGX {amount.toLocaleString()}
              </Text>
              {!isReceiver && fee !== undefined && (
                <Text style={detailText}>
                  <strong>Fee:</strong> UGX {fee.toLocaleString()}
                </Text>
              )}
              {method && (
                <Text style={detailText}>
                  <strong>Payment Method:</strong> {method}
                </Text>
              )}
              <Text style={detailText}>
                <strong>Reference:</strong> {reference}
              </Text>
            </Section>

            <Text style={footerText}>Thank you for using Paynow Gateway!</Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

// Styles
const main = {
  backgroundColor: "#f6f9fc",
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  padding: "20px 0 48px",
  marginBottom: "64px",
  borderRadius: "8px",
  boxShadow: "0 4px 6px rgba(0, 0, 0, 0.05)",
};

const contentSection = {
  padding: "0 48px",
};

const h1 = {
  color: "#4f46e5",
  fontSize: "24px",
  fontWeight: "600",
  lineHeight: "40px",
  margin: "0 0 20px",
  textAlign: "center" as const,
  padding: "20px 0",
  borderBottom: "1px solid #e6ebf1",
};

const h2 = {
  color: "#1f2937",
  fontSize: "20px",
  fontWeight: "600",
  lineHeight: "28px",
  margin: "0 0 16px",
};

const text = {
  color: "#374151",
  fontSize: "16px",
  lineHeight: "24px",
  margin: "0 0 16px",
};

const detailsContainer = {
  backgroundColor: "#f9fafb",
  borderRadius: "6px",
  padding: "16px",
  margin: "24px 0",
  border: "1px solid #e5e7eb",
};

const detailText = {
  margin: "0 0 8px",
  color: "#4b5563",
  fontSize: "14px",
};

const footerText = {
  color: "#6b7280",
  fontSize: "14px",
  lineHeight: "24px",
  margin: "32px 0 0",
  textAlign: "center" as const,
};

export default SupportEmail;
