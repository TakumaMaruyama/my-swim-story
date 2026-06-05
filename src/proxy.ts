import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextFetchEvent, NextRequest, NextResponse } from "next/server";

import { getClerkPublishableKey, isClerkConfigured } from "@/lib/env";

const isAthleteRoute = createRouteMatcher(["/mypage(.*)"]);
const isAdminRoute = createRouteMatcher([
  "/admin/dashboard(.*)",
  "/admin/athletes(.*)",
  "/admin/public-goals(.*)",
]);

const publishableKey = getClerkPublishableKey();
const secretKey = process.env.CLERK_SECRET_KEY;

const configuredMiddleware = clerkMiddleware(
  async (auth, req) => {
    if (isAthleteRoute(req) || isAdminRoute(req)) {
      await auth.protect();
    }
  },
  publishableKey && secretKey
    ? {
        publishableKey,
        secretKey,
        signInUrl: "/login",
        signUpUrl: "/register",
      }
    : undefined,
);

export default async function proxy(request: NextRequest, event: NextFetchEvent) {
  if (!isClerkConfigured()) {
    return NextResponse.next();
  }

  return configuredMiddleware(request, event);
}

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
    "/__clerk/(.*)",
  ],
};
