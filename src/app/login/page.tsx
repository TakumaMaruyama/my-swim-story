import Link from "next/link";

import { athleteLoginAction } from "@/app/actions";
import { AlertBanner, PageHeader, SectionCard } from "@/components/common";
import { SubmitButton } from "@/components/submit-button";
import { readSearchParams, type SearchParamsInput } from "@/lib/search-params";

export default async function LoginPage({
  searchParams,
}: {
  searchParams?: SearchParamsInput;
}) {
  const params = await readSearchParams(searchParams);
  const message = params.get("message");
  const error = params.get("error");

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <PageHeader
        eyebrow="ATHLETE LOGIN"
        title="選手ログイン"
        description="メールアドレスとパスワードでログインします。はじめての人は新規登録から始めてください。"
      />
      {message ? <AlertBanner tone="success" message={message} /> : null}
      {error ? <AlertBanner tone="error" message={error} /> : null}
      <SectionCard title="ログイン" description="開発用アカウント: athlete@example.com / password">
        <form action={athleteLoginAction} className="space-y-5">
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-semibold text-slate-900">
              メールアドレス
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="w-full rounded-[1.25rem] border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-cyan-400 focus:ring-4 focus:ring-cyan-100"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-semibold text-slate-900">
              パスワード
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              className="w-full rounded-[1.25rem] border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-cyan-400 focus:ring-4 focus:ring-cyan-100"
            />
          </div>
          <SubmitButton>ログインする</SubmitButton>
        </form>
      </SectionCard>
      <div className="rounded-[1.5rem] bg-white px-5 py-4 text-sm text-slate-600 ring-1 ring-slate-100">
        アカウントがない場合は{" "}
        <Link href="/register" className="font-semibold text-cyan-700">
          新規登録
        </Link>
        へ。管理者の方は{" "}
        <Link href="/admin/login" className="font-semibold text-cyan-700">
          管理者ログイン
        </Link>
        を使ってください。
      </div>
    </div>
  );
}
