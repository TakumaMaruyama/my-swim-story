import { SignIn } from "@clerk/nextjs";
import { redirect } from "next/navigation";

import { AuthUnavailableCard } from "@/components/auth-unavailable-card";
import { AlertBanner, PageHeader, SectionCard } from "@/components/common";
import { getCurrentUser } from "@/lib/auth";
import { isClerkConfigured } from "@/lib/env";
import { readSearchParams, type SearchParamsInput } from "@/lib/search-params";

export default async function LoginPage({
  searchParams,
}: {
  searchParams?: SearchParamsInput;
}) {
  const currentUser = await getCurrentUser();
  if (currentUser) {
    redirect(currentUser.role === "admin" ? "/admin/dashboard" : "/mypage");
  }

  const params = await readSearchParams(searchParams);
  const message = params.get("message");
  const error = params.get("error");

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <PageHeader
        eyebrow="ATHLETE LOGIN"
        title="選手ログイン"
        description="メールアドレスでログインします。はじめての人は新規登録から始めてください。"
      />
      {message ? <AlertBanner tone="success" message={message} /> : null}
      {error ? <AlertBanner tone="error" message={error} /> : null}
      <SectionCard title="ログイン" description="競泳物語、目標、振り返りの続きをここから開けます。">
        {isClerkConfigured() ? (
          <SignIn
            path="/login"
            routing="path"
            signUpUrl="/register"
            fallbackRedirectUrl="/mypage"
            signUpFallbackRedirectUrl="/mypage/profile"
          />
        ) : (
          <AuthUnavailableCard />
        )}
      </SectionCard>
    </div>
  );
}
