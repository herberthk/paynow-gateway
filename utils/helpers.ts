"use server";
import crypto from "crypto";
import bcrypt from "bcrypt";
export const generateOTP = async (length = 6): Promise<string> =>
  Math.floor(Math.random() * 10 ** length)
    .toString()
    .padStart(length, "0");

export const hashOTP = async (otp: string): Promise<string> =>
  crypto.createHash("sha256").update(otp).digest("hex");

export const verifyOTP = async (
  inputOTP: string,
  storedHashedOTP: string,
): Promise<boolean> => {
  const hashedInput = crypto
    .createHash("sha256")
    .update(inputOTP)
    .digest("hex");

  return crypto.timingSafeEqual(
    Buffer.from(hashedInput),
    Buffer.from(storedHashedOTP),
  );
};

export const isOTPExpired = async (expiresAt: Date): Promise<boolean> =>
  new Date() > expiresAt;

export const generateToken = async (length = 64): Promise<string> =>
  crypto.randomBytes(length).toString("hex");

export const hashOTPWithSalt = async (
  otp: string,
  salt: string,
): Promise<string> =>
  crypto.createHmac("sha256", salt).update(otp).digest("hex");

export const verifyOTPWithSalt = async (
  inputOTP: string,
  storedHashedOTP: string,
  salt: string,
): Promise<boolean> => {
  const hashedInput = crypto
    .createHmac("sha256", salt)
    .update(inputOTP)
    .digest("hex");

  return crypto.timingSafeEqual(
    Buffer.from(hashedInput),
    Buffer.from(storedHashedOTP),
  );
};

//generate random transaction reference of 8 characters alphanumeric it should be prefixed with TX_
export const generateTransactionReference = async (
  length = 8,
): Promise<string> => crypto.randomBytes(length).toString("hex").toUpperCase();

export const generateTxRef = async (length = 12) => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  // 36 chars fits cleanly into 252 (36 × 7), so reject bytes >= 252
  const MAX_VALID = 252; // largest multiple of 36 within 0–255

  let result = "";
  while (result.length < length) {
    const bytes = crypto.getRandomValues(new Uint8Array(length * 2)); // oversample
    for (const byte of bytes) {
      if (result.length >= length) break;
      if (byte < MAX_VALID) {
        // rejection sampling — no bias
        result += chars[byte % chars.length];
      }
    }
  }

  return `TX_${result}`;
};

export const hashPassword = async (password: string) =>
  await bcrypt.hash(password, 10);

// console.log("Transaction Reference", await generateTxRef());
// const otp = "222886";
// console.log("Otp", hashOTP(otp));
// const hash = "4d75a220ec79632b861ae05290b4eccc813ee63ed96020f4aba0d12a8e5482bb";
// console.log("Otp", verifyOTP(otp, hash));
