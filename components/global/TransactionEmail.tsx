type Props = {
  userName?: string;
  amount: number;
  currency?: string;
  recipientName?: string;
  senderName?: string;
  reference?: string;
  fee?: number;
  type: "RECEIPT" | "ADMIN_NOTICE" | "SENDER_RECEIPT";
};

const TransactionEmail = ({
  userName,
  amount,
  currency = "UGX",
  recipientName,
  senderName,
  reference,
  fee,
  type,
}: Props) => {
  const isReceipt = type === "RECEIPT";
  const isSenderReceipt = type === "SENDER_RECEIPT";
  const isAdminNotice = type === "ADMIN_NOTICE";

  return (
    <div
      style={{
        backgroundColor: "#f6f9fc",
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
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
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
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
              letterSpacing: "-0.5px",
            }}
          >
            {isReceipt
              ? "Transfer Successful!"
              : isSenderReceipt
                ? "Payment Sent Successfully"
                : isAdminNotice
                  ? "New Transaction Fee Received"
                  : "Transaction Notification"}
          </h1>
        </div>

        {/* Content */}
        <div style={{ padding: "40px 32px" }}>
          <p
            style={{
              fontSize: "16px",
              color: "#374151",
              lineHeight: "1.6",
              margin: "0 0 24px 0",
            }}
          >
            Hi <strong>{userName}</strong>,
          </p>

          <p
            style={{
              fontSize: "16px",
              color: "#374151",
              lineHeight: "1.6",
              margin: "0 0 32px 0",
            }}
          >
            {isReceipt
              ? `You have successfully received ${currency} ${amount.toLocaleString()} from ${
                  senderName || "a PayNow user"
                }.`
              : isSenderReceipt
                ? `You have successfully sent ${currency} ${amount.toLocaleString()} to ${
                    recipientName || "a PayNow user"
                  }. The total deduction including fees is ${currency} ${(
                    amount + (fee || 0)
                  ).toLocaleString()}.`
                : isAdminNotice
                  ? `A new transaction has been completed. A fee of ${currency} ${fee?.toLocaleString()} has been credited to your admin account.`
                  : "A transaction has been processed."}
          </p>

          {/* Transaction Details Box */}
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
                letterSpacing: "1px",
                fontWeight: "600",
                borderBottom: "1px solid #e5e7eb",
                paddingBottom: "8px",
              }}
            >
              Transaction Details
            </div>

            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <tbody>
                <tr>
                  <td
                    style={{
                      padding: "8px 0",
                      color: "#6b7280",
                      fontSize: "14px",
                    }}
                  >
                    Amount:
                  </td>
                  <td
                    style={{
                      padding: "8px 0",
                      textAlign: "right",
                      fontWeight: "700",
                      color: "#111827",
                    }}
                  >
                    {currency} {amount.toLocaleString()}
                  </td>
                </tr>
                {isReceipt ? (
                  <tr>
                    <td
                      style={{
                        padding: "8px 0",
                        color: "#6b7280",
                        fontSize: "14px",
                      }}
                    >
                      From:
                    </td>
                    <td
                      style={{
                        padding: "8px 0",
                        textAlign: "right",
                        fontWeight: "600",
                        color: "#111827",
                      }}
                    >
                      {senderName}
                    </td>
                  </tr>
                ) : isSenderReceipt ? (
                  <>
                    <tr>
                      <td
                        style={{
                          padding: "8px 0",
                          color: "#6b7280",
                          fontSize: "14px",
                        }}
                      >
                        To:
                      </td>
                      <td
                        style={{
                          padding: "8px 0",
                          textAlign: "right",
                          fontWeight: "600",
                          color: "#111827",
                        }}
                      >
                        {recipientName}
                      </td>
                    </tr>
                    <tr>
                      <td
                        style={{
                          padding: "8px 0",
                          color: "#6b7280",
                          fontSize: "14px",
                        }}
                      >
                        Fee:
                      </td>
                      <td
                        style={{
                          padding: "8px 0",
                          textAlign: "right",
                          fontWeight: "700",
                          color: "#ef4444",
                        }}
                      >
                        {currency} {fee?.toLocaleString()}
                      </td>
                    </tr>
                    <tr>
                      <td
                        style={{
                          padding: "8px 0",
                          color: "#6b7280",
                          fontSize: "14px",
                        }}
                      >
                        Total Deduction:
                      </td>
                      <td
                        style={{
                          padding: "8px 0",
                          textAlign: "right",
                          fontWeight: "700",
                          color: "#111827",
                        }}
                      >
                        {currency} {(amount + (fee || 0)).toLocaleString()}
                      </td>
                    </tr>
                  </>
                ) : (
                  <>
                    <tr>
                      <td
                        style={{
                          padding: "8px 0",
                          color: "#6b7280",
                          fontSize: "14px",
                        }}
                      >
                        Sender:
                      </td>
                      <td
                        style={{
                          padding: "8px 0",
                          textAlign: "right",
                          fontWeight: "600",
                          color: "#111827",
                        }}
                      >
                        {senderName}
                      </td>
                    </tr>
                    <tr>
                      <td
                        style={{
                          padding: "8px 0",
                          color: "#6b7280",
                          fontSize: "14px",
                        }}
                      >
                        Recipient:
                      </td>
                      <td
                        style={{
                          padding: "8px 0",
                          textAlign: "right",
                          fontWeight: "600",
                          color: "#111827",
                        }}
                      >
                        {recipientName}
                      </td>
                    </tr>
                    <tr>
                      <td
                        style={{
                          padding: "8px 0",
                          color: "#6b7280",
                          fontSize: "14px",
                        }}
                      >
                        Fee Received:
                      </td>
                      <td
                        style={{
                          padding: "8px 0",
                          textAlign: "right",
                          fontWeight: "700",
                          color: "#059669",
                        }}
                      >
                        {currency} {fee?.toLocaleString()}
                      </td>
                    </tr>
                  </>
                )}
                <tr>
                  <td
                    style={{
                      padding: "8px 0",
                      color: "#6b7280",
                      fontSize: "14px",
                    }}
                  >
                    Reference:
                  </td>
                  <td
                    style={{
                      padding: "8px 0",
                      textAlign: "right",
                      fontFamily: "monospace",
                      color: "#111827",
                    }}
                  >
                    {reference}
                  </td>
                </tr>
                <tr>
                  <td
                    style={{
                      padding: "8px 0",
                      color: "#6b7280",
                      fontSize: "14px",
                    }}
                  >
                    Date:
                  </td>
                  <td
                    style={{
                      padding: "8px 0",
                      textAlign: "right",
                      color: "#111827",
                    }}
                  >
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

          {isAdminNotice && (
            <div
              style={{
                backgroundColor: "#ecfdf5",
                border: "1px solid #10b981",
                borderRadius: "8px",
                padding: "16px",
                marginBottom: "32px",
              }}
            >
              <p
                style={{
                  fontSize: "14px",
                  color: "#065f46",
                  margin: "0",
                  lineHeight: "1.5",
                }}
              >
                <strong>Admin Info:</strong> This transaction has been
                successfully processed and the fee has been added to your
                balance.
              </p>
            </div>
          )}

          <p
            style={{
              fontSize: "14px",
              color: "#6b7280",
              lineHeight: "1.6",
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

      <div
        style={{
          maxWidth: "600px",
          margin: "16px auto 0",
          textAlign: "center",
        }}
      >
        <p
          style={{
            fontSize: "11px",
            color: "#9ca3af",
            margin: "0",
          }}
        >
          Having trouble? Contact us at support@paynow.com
        </p>
      </div>
    </div>
  );
};

export default TransactionEmail;
