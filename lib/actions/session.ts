"use server";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";

let warnedWeakSecret = false;

const getKey = () => {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    throw new Error("SESSION_SECRET is not configured");
  }
  const encoded = new TextEncoder().encode(secret);
  if (encoded.byteLength < 32) {
    if (process.env.NODE_ENV === "production") {
      throw new Error(
        "SESSION_SECRET must be at least 32 bytes in production.",
      );
    }
    if (!warnedWeakSecret) {
      warnedWeakSecret = true;
      console.warn(
        "SESSION_SECRET is shorter than 32 characters — use a strong random secret in production.",
      );
    }
  }
  return encoded;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const encrypt = async (payload: any) => {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d") // e.g., 7 days
    .sign(getKey());
};

export const decrypt = async (session: string = "") => {
  try {
    const { payload } = await jwtVerify(session, getKey(), {
      algorithms: ["HS256"],
    });
    return payload;
  } catch (error) {
    // ERR_JWS_INVALID / ERR_JWT_EXPIRED are expected when a browser holds a
    // stale cookie (e.g. the SESSION_SECRET rotated, or a legacy plain-JSON
    // cookie was set before JWT sessions existed). Returning null causes the
    // auth layer to re-prompt for login — no action needed.
    const code = (error as { code?: string })?.code;
    const expected = ["ERR_JWS_INVALID", "ERR_JWT_EXPIRED", "ERR_JWT_CLAIM_VALIDATION_FAILED"];
    if (!expected.includes(code ?? "")) {
      console.error("Unexpected session verification error:", error);
    }
    return null;
  }
};

export const createSession = async (user: User) => {
  const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
  const token = await encrypt({
    id: user.id,
    email: user.email,
    name: user.name,
    privilege: user.privilege,
    status: user.status,
    created_at: user.created_at,
    tel: user.tel,
    address: user.address,
  });
  const cookieStore = await cookies();
  await cookieStore.set("session", token, {
    expires,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  });
};

export const deleteSession = async () => {
  const cookieStore = await cookies();
  cookieStore.set("session", "", {
    expires: new Date(0),
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  });
};

export const getUserSession = async () => {
  const cookieStore = await cookies();
  const token = cookieStore.get("session")?.value;
  if (!token) {
    return null;
  }
  // Legacy plain-JSON cookies fail verification → null (user re-logs in).
  const payload = await decrypt(token);
  if (!payload || typeof payload !== "object" || !("id" in payload)) {
    return null;
  }
  // Validate privilege against the known allowlist; forged/unknown values
  // (and non-numeric ids) fail closed to null.
  const record = payload as Record<string, unknown>;
  if (
    typeof record.id !== "number" ||
    (record.privilege !== "none" &&
      record.privilege !== "admin" &&
      record.privilege !== "super_admin")
  ) {
    return null;
  }
  // Suspended users fail closed to null.
  if (record.status === false) {
    return null;
  }

  // Verify mutable authorization state against current database values.
  // This ensures suspended users and revoked privileges are rejected
  // even if they hold a valid JWT.
  try {
    const dbUser = await prisma.user.findUnique({
      where: { id: record.id as number },
      select: { status: true, privilege: true, deleted_at: true },
    });
    if (!dbUser) return null;
    if (dbUser.status === false) return null;
    if (dbUser.deleted_at !== null) return null;
    // Reject if privilege was revoked/changed since token was issued.
    if (dbUser.privilege !== record.privilege) return null;
  } catch {
    // DB verification failure — fail open to JWT claims to avoid
    // locking out all users during transient DB issues.
  }

  return payload as unknown as User;
};

export const logout = async () => {
  await deleteSession();
  redirect("/");
};
