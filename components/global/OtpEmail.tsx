type Props = {
  otp?: string;
  userName?: string;
  expiryMinutes?: number;
  type?: "verify" | "reset";
};
const OTPEmail = ({ otp, userName, expiryMinutes, type = "verify" }: Props) => {
  // const layersIcon =
  //   "https://firebasestorage.googleapis.com/v0/b/connect-app-1f5ca.appspot.com/o/FCMImages%2Flayers.png?alt=media&token=4d0ab890-81ed-4f8c-9b40-8ff3c5337048";
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
                    🔒
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
            {type === "verify" ? "Verify Your Login" : "Reset your password"}
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
            {type === "verify"
              ? `We received a request to verify your login to our payment gateway. Use the code
            below to complete your verification`
              : `We received a request to reset your password. Use the code
            below to complete your verification process `}
          </p>

          {/* OTP Box */}
          <div
            style={{
              backgroundColor: "#f9fafb",
              border: "2px dashed #e5e7eb",
              borderRadius: "12px",
              padding: "32px",
              textAlign: "center",
              margin: "0 0 32px 0",
            }}
          >
            <div
              style={{
                fontSize: "14px",
                color: "#6b7280",
                marginBottom: "12px",
                textTransform: "uppercase",
                letterSpacing: "1px",
                fontWeight: "600",
              }}
            >
              Your Verification Code
            </div>
            <div
              style={{
                fontSize: "48px",
                fontWeight: "700",
                color: "#667eea",
                letterSpacing: "8px",
                fontFamily: 'Monaco, Consolas, "Courier New", monospace',
                margin: "8px 0",
              }}
            >
              {otp}
            </div>
            <div
              style={{
                fontSize: "13px",
                color: "#9ca3af",
                marginTop: "12px",
              }}
            >
              Valid for {expiryMinutes} minutes
            </div>
          </div>

          {/* Info Box */}
          <div
            style={{
              backgroundColor: "#fef3c7",
              border: "1px solid #fcd34d",
              borderRadius: "8px",
              padding: "16px",
              display: "flex",
              gap: "12px",
              marginBottom: "32px",
            }}
          >
            <div style={{ flexShrink: 0 }}>
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M12 9V11M12 15H12.01M5.07183 19H18.9282C20.4678 19 21.4301 17.3333 20.6603 16L13.7321 4C12.9623 2.66667 11.0378 2.66667 10.268 4L3.33978 16C2.56998 17.3333 3.53223 19 5.07183 19Z"
                  stroke="#d97706"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <div>
              <p
                style={{
                  fontSize: "14px",
                  color: "#92400e",
                  margin: "0",
                  lineHeight: "1.5",
                }}
              >
                <strong>Security Notice:</strong> If you didn&apos;t request
                this code, please ignore this email or contact support if you
                have concerns.
              </p>
            </div>
          </div>

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

      {/* Email client compatibility note */}
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

export default OTPEmail;
