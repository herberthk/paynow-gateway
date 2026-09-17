import crypto from "crypto";

function encryptToken(authToken: string, aesKeyHex: string): string {
  const key = Buffer.from(aesKeyHex, "hex"); // 32 bytes
  const iv = crypto.randomBytes(12); // 12-byte random IV

  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
  const encrypted = Buffer.concat([
    cipher.update(authToken, "utf8"),
    cipher.final(),
  ]);
  const authTag = cipher.getAuthTag(); // 16-byte GCM auth tag

  // Combine ciphertext + auth tag, then hex-encode both parts
  const ciphertextWithTag = Buffer.concat([encrypted, authTag]);

  return `${iv.toString("hex")}:${ciphertextWithTag.toString("hex")}`;
}

const encryptedToken = encryptToken(
  process.env.AUTH_TOKEN!,
  process.env.AES_SECRET_KEY!,
);

await fetch("https://pay.connectappbiz.com/api/v1/wallet/getWalletBalance", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "X-Auth-Token": encryptedToken,
  },
  body: JSON.stringify({ userId: 7614 }),
});
