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
