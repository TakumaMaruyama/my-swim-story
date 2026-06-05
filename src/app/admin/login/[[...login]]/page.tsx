import { SignIn } from "@clerk/nextjs";
import { redirect } from "next/navigation";

import { AuthUnavailableCard } from "@/components/auth-unavailable-card";
import { AlertBanner, PageHeader, SectionCard } from "@/components/common";
import { getCurrentUser } from "@/lib/auth";
import { isClerkConfigured } from "@/lib/env";
import { readSearchParams, type SearchParamsInput } from "@/lib/search-params";

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams?: SearchParamsInput;
}) {
  const currentUser = await getCurrentUser();
  if (currentUser) {
    redirect(currentUser.role === "admin" ? "/admin/dashboard" : "/mypage");
  }

  const params = await readSearchParams(searchParams);
  const error = params.get("error");
  const message = params.get("message");

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <PageHeader
        eyebrow="ADMIN LOGIN"
        title="管理者ログイン"
        description="管理者として扱われるのは `ADMIN_EMAILS` に入っているメールアドレスだけです。"
      />
      {message ? <AlertBanner tone="success" message={message} /> : null}
      {error ? <AlertBanner tone="error" message={error} /> : null}
      <SectionCard title="管理者ログイン" description="一般選手がここからログインしても管理画面には入れません。">
        {isClerkConfigured() ? (
          <SignIn
            path="/admin/login"
            routing="path"
            signUpUrl="/register"
            fallbackRedirectUrl="/admin"
            signUpFallbackRedirectUrl="/admin"
          />
        ) : (
          <AuthUnavailableCard />
        )}
      </SectionCard>
    </div>
  );
}
