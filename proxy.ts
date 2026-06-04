import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { decryptToken } from "@/lib/crypto";

/**
 * proxy.ts — Next.js 16+ equivalent of middleware.ts
 * Guards all /api/v1/* routes with AES-256-GCM encrypted X-Auth-Token validation.
 *
 * The client must AES-256-GCM encrypt the AUTH_TOKEN using the shared AES_SECRET_KEY
 * and send it as: X-Auth-Token: <iv_hex>:<ciphertext_with_auth_tag_hex>
 *
 * The server decrypts the token and compares it against AUTH_TOKEN from .env.
 * Any missing, malformed, or incorrect token returns 401 Unauthorized.
 */
export const proxy =async(request: NextRequest) => {
  const encryptedToken = request.headers.get("X-Auth-Token");
  const expectedToken = process.env.AUTH_TOKEN;

  if (!encryptedToken || !expectedToken) {
    return NextResponse.json(
      {
        success: false,
        message: "Unauthorized: Invalid or missing X-Auth-Token header",
      },
      { status: 401 },
    );
  }

  console.log("Encripted token : ", encryptedToken);
  // Decrypt the AES-256-GCM encrypted token from the client
  const decryptedToken = await decryptToken(encryptedToken);

  console.log("Decrypted token : ", decryptedToken);
  if (decryptedToken !== expectedToken) {
    return NextResponse.json(
      {
        success: false,
        message: "Unauthorized: Invalid or missing X-Auth-Token header",
      },
      { status: 401 },
    );
  }

  return NextResponse.next();
}

// Apply only to versioned API routes
export const config = {
  matcher: "/api/v1/:path*",
};
