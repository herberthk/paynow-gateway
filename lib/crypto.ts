/**
 * lib/crypto.ts
 * AES-256-GCM decryption utility using the Web Crypto API.
 * Edge Runtime compatible — uses globalThis.crypto (Web Crypto API),
 * NOT the Node.js built-in `crypto` module.
 *
 * Expected encrypted token format sent by the client:
 *   <iv_hex>:<ciphertext_with_auth_tag_hex>
 *
 * AES_SECRET_KEY env variable must be a 64-character hex string (32 bytes / 256 bits).
 */

/**
 * Converts a hex string to a Uint8Array.
 */
function hexToBytes(hex: string): Uint8Array<ArrayBuffer> {
  if (hex.length % 2 !== 0) throw new Error("Invalid hex string length");
  const buffer = new ArrayBuffer(hex.length / 2);
  const bytes = new Uint8Array(buffer);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
  }
  return bytes;
}

/**
 * Decrypts an AES-256-GCM encrypted token using the Web Crypto API.
 *
 * @param encryptedHex - Format: `<iv_hex>:<ciphertext_with_auth_tag_hex>`
 * @returns The decrypted plaintext string, or `null` if decryption fails.
 */
export async function decryptToken(encryptedHex: string): Promise<string | null> {
  try {
    const colonIndex = encryptedHex.indexOf(":");
    if (colonIndex === -1) return null;

    const ivHex = encryptedHex.slice(0, colonIndex);
    const ciphertextHex = encryptedHex.slice(colonIndex + 1);

    if (!ivHex || !ciphertextHex) return null;

    const aesKeyHex = process.env.AES_SECRET_KEY;
    if (!aesKeyHex || aesKeyHex.length !== 64) {
      console.error("AES_SECRET_KEY is missing or not 64 hex characters (32 bytes)");
      return null;
    }

    const keyBytes = hexToBytes(aesKeyHex);
    const iv = hexToBytes(ivHex);                     // 12 bytes (96 bits)
    const ciphertext = hexToBytes(ciphertextHex);     // ciphertext + 16-byte GCM auth tag

    // Use globalThis.crypto explicitly — avoids ambiguity with Node.js crypto module
    const subtleCrypto = globalThis.crypto.subtle;

    const cryptoKey = await subtleCrypto.importKey(
      "raw",
      keyBytes,
      { name: "AES-GCM" },
      false,         // not extractable
      ["decrypt"],
    );

    // Decrypt — GCM automatically verifies the auth tag; throws if tampered or wrong key
    const decryptedBuffer = await subtleCrypto.decrypt(
      { name: "AES-GCM", iv, tagLength: 128 } as AesGcmParams,
      cryptoKey,
      ciphertext,
    );

    return new TextDecoder().decode(decryptedBuffer);
  } catch (_err: unknown) {
    // Decryption failed: wrong key, tampered ciphertext, or bad format
    return null;
  }
}


// Usage encrypt token

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

// Usage
const encryptedToken = encryptToken(
  process.env.AUTH_TOKEN!,
  process.env.AES_SECRET_KEY!,
);

console.log("Encryption token : ", encryptedToken);
console.log("Decryption token : ", await decryptToken(encryptedToken));
