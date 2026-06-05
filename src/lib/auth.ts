import "server-only";

import { auth, currentUser } from "@clerk/nextjs/server";
import { cache } from "react";
import { redirect } from "next/navigation";

import { isClerkConfigured } from "@/lib/env";
import {
  getUserById,
  hasAthleteProfileCompleted,
  toSessionUser,
  upsertUserFromClerk,
} from "@/lib/repository";
import type { Role, SessionUser } from "@/lib/types";

function resolveName(user: Awaited<ReturnType<typeof currentUser>>): string | null {
  if (!user) {
    return null;
  }

  const firstName = user.firstName?.trim() ?? "";
  const lastName = user.lastName?.trim() ?? "";
  const fullName = [firstName, lastName].filter(Boolean).join(" ").trim();

  if (fullName) {
    return fullName;
  }

  return user.username?.trim() || null;
}

function resolvePrimaryEmail(user: Awaited<ReturnType<typeof currentUser>>): string | null {
  if (!user) {
    return null;
  }

  return (
    user.emailAddresses.find((item) => item.id === user.primaryEmailAddressId)?.emailAddress?.trim() ??
    user.emailAddresses[0]?.emailAddress?.trim() ??
    null
  );
}

const resolveCurrentUser = cache(async (): Promise<SessionUser | null> => {
  if (!isClerkConfigured()) {
    return null;
  }

  const { userId } = await auth();
  if (!userId) {
    return null;
  }

  const clerkUser = await currentUser();
  const email = resolvePrimaryEmail(clerkUser);

  if (!email) {
    return null;
  }

  const synced = await upsertUserFromClerk({
    userId,
    email,
    name: resolveName(clerkUser),
  });

  if (!synced) {
    return null;
  }

  const refreshed = await getUserById(synced.id);
  return refreshed ? toSessionUser(refreshed) : toSessionUser(synced);
});

export async function getCurrentUser(): Promise<SessionUser | null> {
  return resolveCurrentUser();
}

export async function requireRole(
  role: Role,
  options?: { allowIncompleteProfile?: boolean },
): Promise<SessionUser> {
  const currentUser = await resolveCurrentUser();

  if (!currentUser) {
    redirect(role === "admin" ? "/admin/login?message=ログインしてください" : "/login?message=ログインしてください");
  }

  if (currentUser.role !== role) {
    redirect(currentUser.role === "admin" ? "/admin/dashboard" : "/mypage");
  }

  if (
    role === "athlete" &&
    !options?.allowIncompleteProfile &&
    !hasAthleteProfileCompleted(currentUser)
  ) {
    redirect("/mypage/profile?message=最初にプロフィールを入力してください");
  }

  return currentUser;
}

export async function requireAthlete(options?: { allowIncompleteProfile?: boolean }): Promise<SessionUser> {
  return requireRole("athlete", options);
}

export async function requireAdmin(): Promise<SessionUser> {
  return requireRole("admin");
}
