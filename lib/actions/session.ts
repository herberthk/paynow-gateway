"use server";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const secretKey = process.env.SESSION_SECRET; // Use a strong, env-based secret
const key = new TextEncoder().encode(secretKey);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const encrypt = async (payload: any) => {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d") // e.g., 7 days
    .sign(key);
};

export const decrypt = async (session: string = "") => {
  try {
    const { payload } = await jwtVerify(session, key, {
      algorithms: ["HS256"],
    });
    return payload;
  } catch (error) {
    console.log("Failed to verify session", error);
    return null;
  }
};

export const createSession = async (user: User) => {
  const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
  //   const session = await encrypt({ userId, expires });
  const cookieStore = await cookies();
  await cookieStore.set("session", JSON.stringify(user), {
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
    path: "/",
  });
};

export const getUserSession = async () => {
  const cookieStore = await cookies();
  const session = cookieStore.get("session")?.value;
  if (!session) {
    return null;
  }
  return JSON.parse(session) as User;
};

export const logout = async () => {
  await deleteSession();
  redirect("/");
};
