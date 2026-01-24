"use client";
import { ArrowLeft, RefreshCwIcon } from "lucide-react";
import Link from "next/link";
// import { useRouter } from "nextjs-toploader/app";
import { useEffect, useState, type FC } from "react";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { REGEXP_ONLY_DIGITS } from "input-otp";
import { FieldLabel } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { sendOtp, VerifyUserOtp } from "@/lib";
import { useNotificationStore } from "@/store";

type Props = {
  id: string;
  name: string;
  email: string;
  action: "verify" | "reset";
};
const Otp: FC<Props> = ({ id, name, email, action }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isOTPinValid, setIsOTPinValid] = useState(false);
  const [isResendingOTP, setIsResendingOTP] = useState(false);
  const notify = useNotificationStore((state) => state.notify);
  const [otp, setOtp] = useState("");

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    if (!otp) {
      setIsLoading(false);
      notify("error", `Please enter otp`);
      setIsOTPinValid(true);
      return;
    }
    console.log("otp", otp);
    try {
      const result = await VerifyUserOtp({ id: Number(id), otp });
      console.log("result", result);
      if (result === "Invalid otp") {
        setIsLoading(false);
        notify("error", `The otp you entered is invalid`);
        notify("info", `Check your email ${email}`);
        notify("info", `For the correct otp and try again`);
        setIsOTPinValid(true);
        setTimeout(() => {
          setOtp("");
        }, 4000);
        return;
      }
      setIsLoading(false);
      notify("success", `Verified successfully`);
    } catch (error) {
      console.log("error", error);
      setIsLoading(false);
      notify("error", `Failed to verify otp`);
    }
  };

  const handleResendOTP = async () => {
    setIsResendingOTP(true);
    setOtp("");
    setIsOTPinValid(false);
    try {
      const sent = await sendOtp({ id: Number(id), email, name, type: action });
      console.log("sent", sent);
      if (!sent) {
        setIsResendingOTP(false);
        notify("error", `Failed to send otp`);
        return;
      }
      setIsResendingOTP(false);
      notify("success", `Otp sent successfully`);
      notify("info", `Check ${email} for the correct otp and try again`);
    } catch (error) {
      console.log("error", error);
      setIsResendingOTP(false);
      notify("error", `Failed to send otp`);
    }
  };

  useEffect(() => {
    // notify("info", `Check ${email} for the correct otp and try again`);
    notify("info", `We sent a verification code to ${email}`);
  }, [email, notify]);

  console.log("action", action);
  return (
    <div className="w-full md:w-1/2 p-8 md:p-12">
      <div className="h-full flex flex-col justify-center animate-fade-in-up">
        <Link
          href="/"
          className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 mb-6 transition-colors cursor-pointer"
        >
          <ArrowLeft size={16} /> Back to Log in
        </Link>

        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 text-center">
          Enter OTP
        </h3>
        <p className="text-xs italic text-gray-900 dark:text-white mb-4">
          {name} enter the OTP sent to your email {email} to verify your
          account.
        </p>

        <div className="space-y-6">
          <div className="flex items-center justify-between mb-2">
            <FieldLabel htmlFor="otp-verification">
              Verification code
            </FieldLabel>
          </div>
          <InputOTP
            pattern={REGEXP_ONLY_DIGITS}
            maxLength={6}
            id="otp-verification"
            required
            onChange={(e) => {
              if (isOTPinValid) {
                setIsOTPinValid(false);
              }
              setOtp(e);
            }}
            value={otp}
            disabled={isResendingOTP}
          >
            <InputOTPGroup className="*:data-[slot=input-otp-slot]:h-12 *:data-[slot=input-otp-slot]:w-11 *:data-[slot=input-otp-slot]:text-xl">
              <InputOTPSlot index={0} aria-invalid={isOTPinValid} />
              <InputOTPSlot index={1} aria-invalid={isOTPinValid} />
              <InputOTPSlot index={2} aria-invalid={isOTPinValid} />
            </InputOTPGroup>
            <InputOTPSeparator className="mx-2" />
            <InputOTPGroup className="*:data-[slot=input-otp-slot]:h-12 *:data-[slot=input-otp-slot]:w-11 *:data-[slot=input-otp-slot]:text-xl">
              <InputOTPSlot index={3} aria-invalid={isOTPinValid} />
              <InputOTPSlot index={4} aria-invalid={isOTPinValid} />
              <InputOTPSlot index={5} aria-invalid={isOTPinValid} />
            </InputOTPGroup>
          </InputOTP>
          <div className="flex items-center justify-between my-5">
            <p className="font-bold italic text-sm">Did recieve the code?</p>
            <Button
              variant="outline"
              size="sm"
              className="cursor-pointer"
              onClick={isResendingOTP ? () => {} : handleResendOTP}
            >
              <RefreshCwIcon className={isResendingOTP ? "animate-spin" : ""} />
              {isResendingOTP ? "Resending..." : "Resend Code"}
            </Button>
          </div>
          <button
            type="submit"
            onClick={handleVerifyOtp}
            disabled={isLoading || isResendingOTP}
            className={`w-full py-3 rounded-lg cursor-pointer text-white font-bold text-sm flex items-center justify-center gap-2 transition-all ${
              isLoading
                ? "bg-indigo-400 cursor-not-allowed"
                : "bg-indigo-600 hover:bg-indigo-700 hover:shadow-lg"
            }`}
          >
            {isLoading ? "Verifying OTP..." : "VERIFY OTP"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Otp;
