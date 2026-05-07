import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
  Hr,
  Row,
  Column,
  Button,
} from "@react-email/components";

interface SupportEmailProps {
  userName: string;
  senderName?: string;
  recipientName?: string;
  amount: number;
  reference: string;
  method?: string;
  fee?: number;
  receiptUrl?: string;
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
  receiptUrl,
  type,
}: SupportEmailProps) => {
  const isReceiver = type === "RECEIVER";
  // console.log(receiptUrl, "is the receiptUrl in component");
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
          <Section style={header}>
            <Text style={logoText}>Paynow Gateway</Text>
          </Section>

          <Section style={contentSection}>
            <Section style={iconContainer}>
              <Text style={iconStyle}>{isReceiver ? "❤️" : "✨"}</Text>
            </Section>

            <Heading style={h1}>
              {isReceiver ? "Support Received!" : "Support Sent Successfully"}
            </Heading>

            <Text style={greetingText}>Hi {userName},</Text>

            <Text style={descriptionText}>
              {isReceiver
                ? `Wonderful news! You have received a support contribution from ${senderName}. The funds have been added to your wallet balance.`
                : `Your support to ${recipientName} has been successfully processed. Thank you for your generosity!`}
            </Text>

            <Section style={amountBox}>
              <Text style={amountLabel}>Amount Received</Text>
              <Text style={amountValue}>UGX {amount.toLocaleString()}</Text>
            </Section>

            <Section style={detailsContainer}>
              <Text style={detailsHeading}>Transaction Details</Text>

              <Row style={detailRow}>
                <Column style={detailLabel}>Reference</Column>
                <Column style={detailValue}>{reference}</Column>
              </Row>

              {!isReceiver && (
                <>
                  <Hr style={divider} />
                  <Row style={detailRow}>
                    <Column style={detailLabel}>Recipient</Column>
                    <Column style={detailValue}>{recipientName}</Column>
                  </Row>
                </>
              )}

              {isReceiver && (
                <>
                  <Hr style={divider} />
                  <Row style={detailRow}>
                    <Column style={detailLabel}>From</Column>
                    <Column style={detailValue}>{senderName}</Column>
                  </Row>
                </>
              )}

              {method && (
                <>
                  <Hr style={divider} />
                  <Row style={detailRow}>
                    <Column style={detailLabel}>Method</Column>
                    <Column style={detailValue}>
                      {method.replace("_", " ")}
                    </Column>
                  </Row>
                </>
              )}

              {!isReceiver && fee !== undefined && (
                <>
                  <Hr style={divider} />
                  <Row style={detailRow}>
                    <Column style={detailLabel}>Fee Paid</Column>
                    <Column style={detailValue}>
                      UGX {fee.toLocaleString()}
                    </Column>
                  </Row>
                </>
              )}

              <Hr style={divider} />
              <Row style={detailRow}>
                <Column style={detailLabel}>Date</Column>
                <Column style={detailValue}>
                  {new Date().toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </Column>
              </Row>
            </Section>

            {receiptUrl && (
              <Section style={buttonContainer}>
                <Button style={button} href={receiptUrl}>
                  View Official Receipt
                </Button>
              </Section>
            )}

            <Hr style={footerDivider} />

            <Text style={footerText}>
              If you have any questions about this transaction, please contact
              our support team.
            </Text>
            <Text style={copyrightText}>
              © {new Date().getFullYear()} Paynow Gateway. All rights reserved.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

// Styles
const main = {
  backgroundColor: "#f4f7fb",
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
  padding: "40px 0",
};

const container = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  width: "580px",
  borderRadius: "16px",
  overflow: "hidden",
  boxShadow: "0 10px 25px rgba(0, 0, 0, 0.05)",
};

const header = {
  backgroundColor: "#4f46e5",
  padding: "32px 0",
  textAlign: "center" as const,
};

const logoText = {
  color: "#ffffff",
  fontSize: "24px",
  fontWeight: "800",
  letterSpacing: "-0.5px",
  margin: "0",
};

const contentSection = {
  padding: "40px 48px",
};

const iconContainer = {
  textAlign: "center" as const,
  marginBottom: "20px",
};

const iconStyle = {
  fontSize: "48px",
  margin: "0 auto",
};

const h1 = {
  color: "#111827",
  fontSize: "28px",
  fontWeight: "800",
  lineHeight: "36px",
  margin: "0 0 24px",
  textAlign: "center" as const,
  letterSpacing: "-0.5px",
};

const greetingText = {
  color: "#374151",
  fontSize: "18px",
  fontWeight: "600",
  margin: "0 0 12px",
};

const descriptionText = {
  color: "#6b7280",
  fontSize: "16px",
  lineHeight: "26px",
  margin: "0 0 32px",
};

const amountBox = {
  backgroundColor: "#f9fafb",
  borderRadius: "12px",
  padding: "24px",
  textAlign: "center" as const,
  border: "1px solid #f3f4f6",
  marginBottom: "32px",
};

const amountLabel = {
  color: "#6b7280",
  fontSize: "14px",
  fontWeight: "600",
  textTransform: "uppercase" as const,
  letterSpacing: "1px",
  margin: "0 0 8px",
};

const amountValue = {
  color: "#4f46e5",
  fontSize: "36px",
  fontWeight: "800",
  margin: "0",
};

const detailsContainer = {
  backgroundColor: "#ffffff",
  border: "1px solid #f3f4f6",
  borderRadius: "12px",
  padding: "24px",
};

const detailsHeading = {
  color: "#111827",
  fontSize: "14px",
  fontWeight: "700",
  textTransform: "uppercase" as const,
  letterSpacing: "1px",
  margin: "0 0 16px",
};

const detailRow = {
  padding: "10px 0",
};

const detailLabel = {
  color: "#6b7280",
  fontSize: "14px",
  fontWeight: "500",
};

const detailValue = {
  color: "#111827",
  fontSize: "14px",
  fontWeight: "600",
  textAlign: "right" as const,
};

const divider = {
  borderColor: "#f3f4f6",
  margin: "4px 0",
};

const buttonContainer = {
  textAlign: "center" as const,
  margin: "32px 0",
};

const button = {
  backgroundColor: "#4f46e5",
  borderRadius: "12px",
  color: "#fff",
  fontSize: "16px",
  fontWeight: "700",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "inline-block",
  padding: "12px 24px",
  boxShadow: "0 4px 6px rgba(79, 70, 229, 0.2)",
};

const footerDivider = {
  borderColor: "#f3f4f6",
  margin: "40px 0 24px",
};

const footerText = {
  color: "#9ca3af",
  fontSize: "14px",
  lineHeight: "22px",
  textAlign: "center" as const,
  margin: "0 0 12px",
};

const copyrightText = {
  color: "#9ca3af",
  fontSize: "12px",
  textAlign: "center" as const,
  margin: "0",
};

export default SupportEmail;
