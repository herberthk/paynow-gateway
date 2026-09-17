"use server";

import verifyNumber from "@/sdk/index";
import { detectProvider, normalizeUgMsisdn, type MobileMoneyProviderName } from "@/lib/yo/phone";

export type VerifyMsisdnResult =
  | {
      success: true;
      name: string;
      msisdn: string;
      provider: MobileMoneyProviderName;
      data: {
        firstName: string;
        surname: string;
        msisdn: string;
      };
    }
  | {
      success: false;
      message: string;
    };

const MSISDN_REGEX = /^256\d{9}$/;

/**
 * Server Action: Primary validation gate for Mobile Money phone numbers.
 * Validates format (e.g., '256779159642'), checks network provider,
 * and calls the ssentezo MSISDN verification SDK to return the registered account name.
 */
export async function verifyMsisdnAction(
  rawInput: string
): Promise<VerifyMsisdnResult> {
  try {
    if (!rawInput || typeof rawInput !== "string") {
      return {
        success: false,
        message: "Phone number is required",
      };
    }

    // Normalize any valid Ugandan phone variant to 256XXXXXXXXX
    const normalized = normalizeUgMsisdn(rawInput);
    if (!normalized.ok) {
      return {
        success: false,
        message: normalized.error || "Please enter a valid Ugandan phone number (format: 256XXXXXXXXX)",
      };
    }

    const msisdn = normalized.msisdn;

    // Strict validation gate: Must be exactly 256 followed by 9 digits
    if (!MSISDN_REGEX.test(msisdn)) {
      return {
        success: false,
        message: "Phone number must be in 12-digit format '256XXXXXXXXX' (e.g. 256779133640)",
      };
    }

    // Detect provider (MTN or Airtel)
    const provider = detectProvider(msisdn);
    if (!provider) {
      return {
        success: false,
        message: "Only MTN and Airtel Uganda numbers are supported for Mobile Money top-up",
      };
    }

    // Query the SSentezo MSISDN verification SDK
    const res = await verifyNumber.verify(msisdn);

    if (res?.response === "OK" && res?.data) {
      const firstName = (res.data.FirstName || "").trim();
      const surname = (res.data.Surname || "").trim();
      const fullName = `${firstName} ${surname}`.trim();

      if (!fullName) {
        return {
          success: false,
          message: "No registered name found for this phone number. Please verify the number.",
        };
      }

      return {
        success: true,
        name: fullName,
        msisdn: res.data.msisdn || msisdn,
        provider,
        data: {
          firstName,
          surname,
          msisdn: res.data.msisdn || msisdn,
        },
      };
    }

    return {
      success: false,
      message:
        res?.message ||
        "Could not verify number with mobile network. Please ensure the number is active and registered on Mobile Money.",
    };
  } catch (error: unknown) {
    console.error("verifyMsisdnAction error:", error);
    const msg =
      error instanceof Error
        ? error.message
        : "Failed to verify phone number. Please try again.";
    return {
      success: false,
      message: msg,
    };
  }
}
