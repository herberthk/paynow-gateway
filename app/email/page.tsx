import OTPEmail from "@/components/global/OtpEmail";

// Preview component for testing
export default function EmailPreview() {
  return (
    <OTPEmail
      otp="123456"
      userName="John Doe"
      expiryMinutes={15}
      type="verify"
    />
  );
}
