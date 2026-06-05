import { SignUp } from "@clerk/nextjs";
import { redirect } from "next/navigation";

import { AuthUnavailableCard } from "@/components/auth-unavailable-card";
import { AlertBanner, PageHeader, SectionCard } from "@/components/common";
import { getCurrentUser } from "@/lib/auth";
import { isClerkConfigured } from "@/lib/env";
import { readSearchParams, type SearchParamsInput } from "@/lib/search-params";

export default async function RegisterPage({
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

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <PageHeader
        eyebrow="SIGN UP"
        title="選手登録"
        description="メールアドレスでアカウントを作成し、ログイン後にプロフィールを設定します。"
      />
      {error ? <AlertBanner tone="error" message={error} /> : null}
      <SectionCard title="新規登録" description="登録後はプロフィール初期設定へ移動します。">
        {isClerkConfigured() ? (
          <SignUp
            path="/register"
            routing="path"
            signInUrl="/login"
            fallbackRedirectUrl="/mypage/profile"
          />
        ) : (
          <AuthUnavailableCard />
        )}
      </SectionCard>
    </div>
  );
}
