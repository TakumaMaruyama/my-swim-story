import { adminLoginAction } from "@/app/actions";
import { AlertBanner, PageHeader, SectionCard } from "@/components/common";
import { SubmitButton } from "@/components/submit-button";
import { readSearchParams, type SearchParamsInput } from "@/lib/search-params";

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams?: SearchParamsInput;
}) {
  const params = await readSearchParams(searchParams);
  const error = params.get("error");
  const message = params.get("message");

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <PageHeader
        eyebrow="ADMIN LOGIN"
        title="管理者ログイン"
        description="登録選手の確認や公開申請の承認を行う画面です。"
      />
      {message ? <AlertBanner tone="success" message={message} /> : null}
      {error ? <AlertBanner tone="error" message={error} /> : null}
      <SectionCard title="管理者ログイン" description="開発用アカウント: admin@example.com / password">
        <form action={adminLoginAction} className="space-y-5">
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-semibold text-slate-900">
              メールアドレス
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              defaultValue="admin@example.com"
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
              defaultValue="password"
              className="w-full rounded-[1.25rem] border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-cyan-400 focus:ring-4 focus:ring-cyan-100"
            />
          </div>
          <SubmitButton>管理画面へ入る</SubmitButton>
        </form>
      </SectionCard>
    </div>
  );
}
