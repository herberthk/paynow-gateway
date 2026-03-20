type Props = {
  userName?: string;
  adminName?: string;
  amount: number;
  fee?: number;
  currency?: string;
  reference?: string;
  method?: string;
  role: "USER_CONFIRMATION" | "ADMIN_NOTICE";
};

const DepositEmail = ({
  userName,
  adminName,
  amount,
  fee = 0,
  currency = "UGX",
  reference,
  method = "Mobile Money",
  role,
}: Props) => {
  const isUser = role === "USER_CONFIRMATION";

  return (
    <div
      style={{
        backgroundColor: "#f6f9fc",
        padding: "40px 20px",
      }}
    >
      <div
        style={{
          maxWidth: "600px",
          margin: "0 auto",
          backgroundColor: "#ffffff",
          borderRadius: "16px",
          overflow: "hidden",
          boxShadow: "0 4px 6px rgba(0, 0, 0, 0.07)",
        }}
      >
        {/* Header with gradient */}
        <div
          style={{
            background: isUser
              ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
              : "linear-gradient(135deg, #10b981 0%, #059669 100%)",
            padding: "40px 32px",
            textAlign: "center",
          }}
        >
          <table
            align="center"
            border={0}
            cellPadding={0}
            cellSpacing={0}
            role="presentation"
            style={{
              margin: "0 auto 16px",
              borderCollapse: "separate",
            }}
          >
            <tbody>
              <tr>
                <td
                  align="center"
                  valign="middle"
                  style={{
                    height: "64px",
                    width: "64px",
                    backgroundColor: "rgba(255, 255, 255, 0.2)",
                    borderRadius: "32px",
                    textAlign: "center",
                    verticalAlign: "middle",
                    padding: "0",
                  }}
                >
                  <span
                    style={{
                      color: "#ffffff",
                      fontSize: "32px",
                      fontWeight: "bold",
                      lineHeight: "1",
                      display: "inline-block",
                      verticalAlign: "middle",
                    }}
                  >
                    ✓
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
          <h1
            style={{
              color: "#ffffff",
              fontSize: "28px",
              fontWeight: "700",
              margin: "0",
            }}
          >
            {isUser ? "Deposit Successful!" : "New Deposit Fee Received"}
          </h1>
        </div>

        {/* Content */}
        <div style={{ padding: "40px 32px" }}>
          <p
            style={{
              fontSize: "16px",
              color: "#374151",
              margin: "0 0 24px 0",
            }}
          >
            Hi <strong>{isUser ? userName : adminName}</strong>,
          </p>

          <p
            style={{
              fontSize: "16px",
              color: "#374151",
              lineHeight: "1.6",
              margin: "0 0 32px 0",
            }}
          >
            {isUser
              ? `Your deposit of ${currency} ${amount.toLocaleString()} has been successfully processed and credited to your wallet.`
              : `A new deposit of ${currency} ${amount.toLocaleString()} has been completed by ${userName || "a user"}. A transaction fee of ${currency} ${fee.toLocaleString()} has been credited to your account.`}
          </p>

          <div
            style={{
              backgroundColor: "#f9fafb",
              border: "1px solid #e5e7eb",
              borderRadius: "12px",
              padding: "24px",
              margin: "0 0 32px 0",
            }}
          >
            <div
              style={{
                fontSize: "14px",
                color: "#6b7280",
                marginBottom: "16px",
                textTransform: "uppercase",
                fontWeight: "600",
                borderBottom: "1px solid #e5e7eb",
                paddingBottom: "8px",
              }}
            >
              Deposit Summary
            </div>

            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <tbody>
                {!isUser && (
                  <tr>
                    <td style={labelStyle}>User:</td>
                    <td style={valueStyle}>{userName}</td>
                  </tr>
                )}
                <tr>
                  <td style={labelStyle}>Deposit Amount:</td>
                  <td style={valueStyle}>
                    {currency} {amount.toLocaleString()}
                  </td>
                </tr>
                <tr>
                  <td style={labelStyle}>Transaction Fee:</td>
                  <td
                    style={{
                      ...valueStyle,
                      color: isUser ? "#ef4444" : "#10b981",
                      fontWeight: "700",
                    }}
                  >
                    {isUser ? "+" : ""}
                    {currency} {fee.toLocaleString()}
                  </td>
                </tr>
                {isUser && (
                  <tr style={{ borderTop: "1px solid #e5e7eb" }}>
                    <td style={{ ...labelStyle, paddingTop: "12px" }}>
                      <strong>Total Charged:</strong>
                    </td>
                    <td
                      style={{
                        ...valueStyle,
                        paddingTop: "12px",
                        fontSize: "18px",
                        color: "#111827",
                      }}
                    >
                      <strong>
                        {currency} {(amount + fee).toLocaleString()}
                      </strong>
                    </td>
                  </tr>
                )}
                <tr>
                  <td style={{ ...labelStyle, paddingTop: "8px" }}>Status:</td>
                  <td
                    style={{
                      ...valueStyle,
                      paddingTop: "8px",
                      color: "#059669",
                      fontWeight: "700",
                    }}
                  >
                    Completed
                  </td>
                </tr>
                <tr>
                  <td style={labelStyle}>Method:</td>
                  <td style={valueStyle}>{method}</td>
                </tr>
                <tr>
                  <td style={labelStyle}>Reference:</td>
                  <td
                    style={{
                      ...valueStyle,
                      fontFamily: "monospace",
                    }}
                  >
                    {reference}
                  </td>
                </tr>
                <tr>
                  <td style={labelStyle}>Date:</td>
                  <td style={valueStyle}>
                    {new Date().toLocaleDateString("en-US", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <p
            style={{
              fontSize: "14px",
              color: "#6b7280",
              margin: "0",
            }}
          >
            Best regards,
            <br />
            <strong>The PayNow Team</strong>
          </p>
        </div>

        {/* Footer */}
        <div
          style={{
            backgroundColor: "#f9fafb",
            padding: "24px 32px",
            borderTop: "1px solid #e5e7eb",
          }}
        >
          <p
            style={{
              fontSize: "12px",
              color: "#9ca3af",
              textAlign: "center",
              margin: "0 0 8px 0",
            }}
          >
            This is an automated message, please do not reply to this email.
          </p>
          <p
            style={{
              fontSize: "12px",
              color: "#9ca3af",
              textAlign: "center",
              margin: "0",
            }}
          >
            © 2026 PayNow Gateway. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};

const labelStyle = {
  padding: "8px 0",
  color: "#6b7280",
  fontSize: "14px",
};

const valueStyle = {
  padding: "8px 0",
  textAlign: "right" as const,
  fontWeight: "600",
  color: "#111827",
};

export default DepositEmail;
