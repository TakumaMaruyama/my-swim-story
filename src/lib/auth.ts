import "server-only";

import { redirect } from "next/navigation";

import { getSessionPayload } from "@/lib/session";
import { getUserById, toSessionUser } from "@/lib/repository";
import type { Role, SessionUser } from "@/lib/types";

async function resolveCurrentUser(): Promise<SessionUser | null> {
  const payload = await getSessionPayload();
  if (!payload) {
    return null;
  }

  const user = await getUserById(payload.userId);
  if (!user || user.role !== payload.role) {
    return null;
  }

  return toSessionUser(user);
}

export async function getCurrentUser(): Promise<SessionUser | null> {
  return resolveCurrentUser();
}

export async function requireRole(role: Role): Promise<SessionUser> {
  const currentUser = await resolveCurrentUser();

  if (!currentUser) {
    redirect(role === "admin" ? "/admin/login?message=ログインしてください" : "/login?message=ログインしてください");
  }

  if (currentUser.role !== role) {
    redirect(currentUser.role === "admin" ? "/admin/dashboard" : "/mypage");
  }

  return currentUser;
}

export async function requireAthlete(): Promise<SessionUser> {
  return requireRole("athlete");
}

export async function requireAdmin(): Promise<SessionUser> {
  return requireRole("admin");
}
