import crypto from "crypto";

export const generateOTP = (length = 6): string =>
  Math.floor(Math.random() * 10 ** length)
    .toString()
    .padStart(length, "0");

export const hashOTP = (otp: string): string =>
  crypto.createHash("sha256").update(otp).digest("hex");

export const verifyOTP = (
  inputOTP: string,
  storedHashedOTP: string,
): boolean => {
  const hashedInput = crypto
    .createHash("sha256")
    .update(inputOTP)
    .digest("hex");

  return crypto.timingSafeEqual(
    Buffer.from(hashedInput),
    Buffer.from(storedHashedOTP),
  );
};

export const isOTPExpired = (expiresAt: Date): boolean =>
  new Date() > expiresAt;

export const generateToken = (length = 64): string =>
  crypto.randomBytes(length).toString("hex");

export const hashOTPWithSalt = (otp: string, salt: string): string =>
  crypto.createHmac("sha256", salt).update(otp).digest("hex");

export const verifyOTPWithSalt = (
  inputOTP: string,
  storedHashedOTP: string,
  salt: string,
): boolean => {
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
export const generateTransactionReference = (length = 8): string =>
  crypto.randomBytes(length).toString("hex").toUpperCase();

export const generateTxRef = (length = 8) => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  const bytes = crypto.getRandomValues(new Uint8Array(length));

  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars[bytes[i] % chars.length];
  }

  return `TX_${result}`;
};

console.log("Transaction Reference", generateTxRef());
// const otp = "222886";
// console.log("Otp", hashOTP(otp));
// const hash = "4d75a220ec79632b861ae05290b4eccc813ee63ed96020f4aba0d12a8e5482bb";
// console.log("Otp", verifyOTP(otp, hash));
