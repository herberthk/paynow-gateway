import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { SignJWT } from "jose";

const jar = vi.hoisted(() => new Map<string, string>());

vi.mock("next/headers", () => ({
  cookies: vi.fn(async () => ({
    get: (name: string) =>
      jar.has(name) ? { value: jar.get(name) as string } : undefined,
    set: (name: string, value: string) => {
      jar.set(name, value);
    },
  })),
}));

vi.mock("next/navigation", () => ({
  redirect: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  default: {
    user: {
      findUnique: vi.fn(),
    },
  },
}));

import prisma from "@/lib/prisma";
import { createSession, encrypt, getUserSession } from "./session";

const SECRET = "test-session-secret-32-chars-minimum-ok";
const findUnique = vi.mocked(prisma.user.findUnique);

const user = {
  id: 7,
  name: "Test User",
  email: "test@example.com",
  privilege: "none",
  status: true,
  created_at: new Date().toISOString(),
  tel: "+256700000001",
} as unknown as User;

const signWith = (payload: Record<string, unknown>, secret: string) =>
  new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(new TextEncoder().encode(secret));

beforeEach(() => {
  vi.stubEnv("SESSION_SECRET", SECRET);
  findUnique.mockResolvedValue({
    status: true,
    privilege: "none",
    deleted_at: null,
  } as never);
});

afterEach(() => {
  jar.clear();
  vi.unstubAllEnvs();
});

describe("session round-trip", () => {
  it("createSession → getUserSession returns the user", async () => {
    await createSession(user);
    const session = await getUserSession();
    expect(session).toMatchObject({ id: 7, privilege: "none" });
  });

  it("tampered token → null", async () => {
    await createSession(user);
    const token = jar.get("session") as string;
    // Flip the FIRST char of the signature segment: every bit there is
    // significant, so verification deterministically fails. (Flipping the
    // token's last char is flaky — trailing base64url bits can be padding
    // and decode to identical bytes, leaving the signature valid.)
    const parts = token.split(".");
    const sig = parts[2];
    const flipped = (sig[0] === "a" ? "b" : "a") + sig.slice(1);
    jar.set("session", `${parts[0]}.${parts[1]}.${flipped}`);
    await expect(getUserSession()).resolves.toBeNull();
  });

  it("wrong-secret token → null", async () => {
    jar.set(
      "session",
      await signWith(
        { id: 7, privilege: "none" },
        "a-different-secret-32-chars-minimum-ok",
      ),
    );
    await expect(getUserSession()).resolves.toBeNull();
  });

  it("privilege outside the allowlist → null", async () => {
    jar.set(
      "session",
      await signWith({ id: 7, privilege: "hacker" }, SECRET),
    );
    await expect(getUserSession()).resolves.toBeNull();
  });

  it("expired token → null", async () => {
    jar.set(
      "session",
      await new SignJWT({ id: 7, privilege: "none" })
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime(Math.floor(Date.now() / 1000) - 3600)
        .sign(new TextEncoder().encode(SECRET)),
    );
    await expect(getUserSession()).resolves.toBeNull();
  });

  it("missing SESSION_SECRET → encrypt throws", async () => {
    vi.stubEnv("SESSION_SECRET", "");
    await expect(encrypt({ id: 7, privilege: "none" })).rejects.toThrow(
      "SESSION_SECRET",
    );
  });

  it("legacy plain-JSON cookie → null", async () => {
    jar.set(
      "session",
      JSON.stringify({ id: 7, privilege: "none", status: true }),
    );
    await expect(getUserSession()).resolves.toBeNull();
  });

  it("status:false token → null", async () => {
    jar.set(
      "session",
      await signWith({ id: 7, privilege: "none", status: false }, SECRET),
    );
    await expect(getUserSession()).resolves.toBeNull();
  });

  it("database verification failure → null", async () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
    await createSession(user);
    findUnique.mockRejectedValueOnce(new Error("database unavailable"));

    await expect(getUserSession()).resolves.toBeNull();
    expect(consoleError).toHaveBeenCalledWith(
      "Failed to verify session against the database:",
      expect.any(Error),
    );

    consoleError.mockRestore();
  });

  it("weak secret in production → encrypt throws", async () => {
    vi.stubEnv("SESSION_SECRET", "short");
    vi.stubEnv("NODE_ENV", "production");
    await expect(encrypt({ id: 7, privilege: "none" })).rejects.toThrow(
      "32 bytes",
    );
  });
});
