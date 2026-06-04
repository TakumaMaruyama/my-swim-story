import "server-only";

import { createHmac } from "node:crypto";
import { cookies } from "next/headers";

import type { Role } from "@/lib/types";

const COOKIE_NAME = "my-swim-story-session";
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 14;

type SessionPayload = {
  userId: string;
  role: Role;
  expiresAt: number;
};

function getSessionSecret(): string {
  return process.env.SESSION_SECRET ?? "my-swim-story-local-secret";
}

function sign(value: string): string {
  return createHmac("sha256", getSessionSecret()).update(value).digest("hex");
}

function encodePayload(payload: SessionPayload): string {
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${body}.${sign(body)}`;
}

function decodePayload(token: string | undefined): SessionPayload | null {
  if (!token || !token.includes(".")) {
    return null;
  }

  const [body, signature] = token.split(".");
  if (!body || !signature || sign(body) !== signature) {
    return null;
  }

  try {
    const payload = JSON.parse(Buffer.from(body, "base64url").toString("utf8")) as SessionPayload;
    if (!payload.userId || !payload.role || payload.expiresAt < Date.now()) {
      return null;
    }
    return payload;
  } catch {
    return null;
  }
}

export async function createSession(userId: string, role: Role): Promise<void> {
  const payload: SessionPayload = {
    userId,
    role,
    expiresAt: Date.now() + SESSION_MAX_AGE_SECONDS * 1000,
  };

  const cookieStore = await cookies();
  cookieStore.set({
    name: COOKIE_NAME,
    value: encodePayload(payload),
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
}

export async function clearSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export async function getSessionPayload(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  return decodePayload(cookieStore.get(COOKIE_NAME)?.value);
}
