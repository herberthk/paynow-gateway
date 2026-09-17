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
  type: "RECEIVER" | "SENDER_RECEIPT" | "SENDER_FAILURE";
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
  const isFailure = type === "SENDER_FAILURE";
  const isSenderReceipt = type === "SENDER_RECEIPT";

  const previewText = isReceiver
    ? `You received support of UGX ${amount.toLocaleString()} from ${senderName || "a supporter"}`
    : isFailure
      ? `Support payment of UGX ${amount.toLocaleString()} to ${recipientName || "recipient"} could not be completed`
      : `Support transaction receipt for UGX ${amount.toLocaleString()} to ${recipientName || "recipient"}`;

  const headerBg = isFailure
    ? "linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)"
    : "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)";

  const iconText = isFailure ? "⚠️" : isReceiver ? "❤️" : "✨";

  const headingText = isFailure
    ? "Support Payment Unsuccessful"
    : isReceiver
      ? "Support Received!"
      : "Support Sent Successfully";

  const amountLabelText = isReceiver
    ? "Amount Received"
    : isFailure
      ? "Attempted Amount"
      : "Support Contribution";

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={{ ...header, background: headerBg }}>
            <Text style={logoText}>ConnectPay</Text>
          </Section>

          <Section style={contentSection}>
            <Section style={iconContainer}>
              <Text style={iconStyle}>{iconText}</Text>
            </Section>

            <Heading style={h1}>{headingText}</Heading>

            <Text style={greetingText}>Hi {userName},</Text>

            <Text style={descriptionText}>
              {isReceiver
                ? `Wonderful news! You have received a financial support contribution from ${senderName || "a supporter"}. The funds have been credited directly to your ConnectPay wallet.`
                : isFailure
                  ? `We were unable to complete your support payment of UGX ${amount.toLocaleString()} to ${recipientName || "the recipient"}. No money was deducted from your mobile money or wallet account. You can retry the transaction whenever you are ready.`
                  : `Your support contribution to ${recipientName || "the recipient"} has been successfully processed. Thank you for your generosity and for empowering others!`}
            </Text>

            <Section style={isFailure ? failureAmountBox : amountBox}>
              <Text style={isFailure ? failureAmountLabel : amountLabel}>
                {amountLabelText}
              </Text>
              <Text style={isFailure ? failureAmountValue : amountValue}>
                UGX {amount.toLocaleString()}
              </Text>
              {isFailure && (
                <Text style={failureNote}>
                  ● Status: No funds were deducted
                </Text>
              )}
            </Section>

            <Section style={detailsContainer}>
              <Text style={detailsHeading}>Transaction Details</Text>

              <Row style={detailRow}>
                <Column style={detailLabel}>Reference</Column>
                <Column style={detailValue}>{reference}</Column>
              </Row>

              <Hr style={divider} />
              <Row style={detailRow}>
                <Column style={detailLabel}>Status</Column>
                <Column
                  style={{
                    ...detailValue,
                    color: isFailure ? "#dc2626" : "#059669",
                  }}
                >
                  {isFailure ? "Failed / Incomplete" : "Completed"}
                </Column>
              </Row>

              {!isReceiver && recipientName && (
                <>
                  <Hr style={divider} />
                  <Row style={detailRow}>
                    <Column style={detailLabel}>Recipient</Column>
                    <Column style={detailValue}>{recipientName}</Column>
                  </Row>
                </>
              )}

              {isReceiver && senderName && (
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
                    <Column style={detailLabel}>Payment Method</Column>
                    <Column style={detailValue}>
                      {method.replace(/_/g, " ")}
                    </Column>
                  </Row>
                </>
              )}

              {isSenderReceipt && fee !== undefined && (
                <>
                  <Hr style={divider} />
                  <Row style={detailRow}>
                    <Column style={detailLabel}>System Fee</Column>
                    <Column style={detailValue}>
                      UGX {fee.toLocaleString()}
                    </Column>
                  </Row>
                  <Hr style={divider} />
                  <Row style={detailRow}>
                    <Column style={detailLabel}>
                      <strong>Total Charged</strong>
                    </Column>
                    <Column style={{ ...detailValue, fontWeight: "800" }}>
                      UGX {(amount + fee).toLocaleString()}
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

            {isSenderReceipt && receiptUrl && (
              <Section style={buttonContainer}>
                <Button style={button} href={receiptUrl}>
                  View Official Receipt
                </Button>
              </Section>
            )}

            {isFailure && (
              <Section style={buttonContainer}>
                <Button
                  style={retryButton}
                  href="#"
                >
                  Try Support Again
                </Button>
              </Section>
            )}

            <Hr style={footerDivider} />

            <Text style={footerText}>
              If you have questions or noticed an issue with this transaction,
              please reach out to our team at support@connectappbiz.com.
            </Text>
            <Text style={copyrightText}>
              © {new Date().getFullYear()} ConnectPay. All rights reserved.
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
  fontSize: "26px",
  fontWeight: "800",
  lineHeight: "34px",
  margin: "0 0 20px",
  textAlign: "center" as const,
  letterSpacing: "-0.5px",
};

const greetingText = {
  color: "#374151",
  fontSize: "17px",
  fontWeight: "600",
  margin: "0 0 12px",
};

const descriptionText = {
  color: "#6b7280",
  fontSize: "15px",
  lineHeight: "24px",
  margin: "0 0 28px",
};

const amountBox = {
  backgroundColor: "#f9fafb",
  borderRadius: "12px",
  padding: "20px",
  textAlign: "center" as const,
  border: "1px solid #f3f4f6",
  marginBottom: "28px",
};

const amountLabel = {
  color: "#6b7280",
  fontSize: "13px",
  fontWeight: "600",
  textTransform: "uppercase" as const,
  letterSpacing: "1px",
  margin: "0 0 6px",
};

const amountValue = {
  color: "#4f46e5",
  fontSize: "32px",
  fontWeight: "800",
  margin: "0",
};

const failureAmountBox = {
  backgroundColor: "#fef2f2",
  borderRadius: "12px",
  padding: "20px",
  textAlign: "center" as const,
  border: "1px solid #fee2e2",
  marginBottom: "28px",
};

const failureAmountLabel = {
  color: "#991b1b",
  fontSize: "13px",
  fontWeight: "600",
  textTransform: "uppercase" as const,
  letterSpacing: "1px",
  margin: "0 0 6px",
};

const failureAmountValue = {
  color: "#dc2626",
  fontSize: "32px",
  fontWeight: "800",
  margin: "0",
};

const failureNote = {
  color: "#b91c1c",
  fontSize: "12px",
  fontWeight: "600",
  margin: "6px 0 0",
};

const detailsContainer = {
  backgroundColor: "#ffffff",
  border: "1px solid #f3f4f6",
  borderRadius: "12px",
  padding: "20px 24px",
};

const detailsHeading = {
  color: "#111827",
  fontSize: "13px",
  fontWeight: "700",
  textTransform: "uppercase" as const,
  letterSpacing: "1px",
  margin: "0 0 14px",
};

const detailRow = {
  padding: "9px 0",
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
  margin: "28px 0 16px",
};

const button = {
  backgroundColor: "#4f46e5",
  borderRadius: "12px",
  color: "#fff",
  fontSize: "15px",
  fontWeight: "700",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "inline-block",
  padding: "12px 24px",
  boxShadow: "0 4px 6px rgba(79, 70, 229, 0.2)",
};

const retryButton = {
  backgroundColor: "#dc2626",
  borderRadius: "12px",
  color: "#fff",
  fontSize: "15px",
  fontWeight: "700",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "inline-block",
  padding: "12px 24px",
  boxShadow: "0 4px 6px rgba(220, 38, 38, 0.2)",
};

const footerDivider = {
  borderColor: "#f3f4f6",
  margin: "32px 0 20px",
};

const footerText = {
  color: "#9ca3af",
  fontSize: "13px",
  lineHeight: "20px",
  textAlign: "center" as const,
  margin: "0 0 10px",
};

const copyrightText = {
  color: "#9ca3af",
  fontSize: "12px",
  textAlign: "center" as const,
  margin: "0",
};

export default SupportEmail;
