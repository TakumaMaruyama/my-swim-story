import { registerAthleteAction } from "@/app/actions";
import { AlertBanner, PageHeader, SectionCard } from "@/components/common";
import { SubmitButton } from "@/components/submit-button";
import { GRADE_OPTIONS } from "@/lib/constants";
import { readSearchParams, type SearchParamsInput } from "@/lib/search-params";

export default async function RegisterPage({
  searchParams,
}: {
  searchParams?: SearchParamsInput;
}) {
  const params = await readSearchParams(searchParams);
  const error = params.get("error");

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHeader
        eyebrow="SIGN UP"
        title="選手登録"
        description="まずはアカウントを作ります。細かいプロフィールや記録は登録後にマイページから編集できます。"
      />
      {error ? <AlertBanner tone="error" message={error} /> : null}
      <SectionCard title="新規登録" description="登録後はそのままマイページへ移動します。">
        <form action={registerAthleteAction} className="grid gap-5 md:grid-cols-2">
          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-semibold text-slate-900">
              氏名
            </label>
            <input
              id="name"
              name="name"
              required
              className="w-full rounded-[1.25rem] border border-slate-200 px-4 py-3 outline-none transition focus:border-cyan-400 focus:ring-4 focus:ring-cyan-100"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="nickname" className="text-sm font-semibold text-slate-900">
              ニックネーム
            </label>
            <input
              id="nickname"
              name="nickname"
              required
              className="w-full rounded-[1.25rem] border border-slate-200 px-4 py-3 outline-none transition focus:border-cyan-400 focus:ring-4 focus:ring-cyan-100"
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <label htmlFor="email" className="text-sm font-semibold text-slate-900">
              メールアドレス
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="w-full rounded-[1.25rem] border border-slate-200 px-4 py-3 outline-none transition focus:border-cyan-400 focus:ring-4 focus:ring-cyan-100"
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
              minLength={8}
              className="w-full rounded-[1.25rem] border border-slate-200 px-4 py-3 outline-none transition focus:border-cyan-400 focus:ring-4 focus:ring-cyan-100"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="grade" className="text-sm font-semibold text-slate-900">
              学年
            </label>
            <select
              id="grade"
              name="grade"
              required
              className="w-full rounded-[1.25rem] border border-slate-200 px-4 py-3 outline-none transition focus:border-cyan-400 focus:ring-4 focus:ring-cyan-100"
            >
              <option value="">選んでください</option>
              {GRADE_OPTIONS.map((grade) => (
                <option key={grade} value={grade}>
                  {grade}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2 md:col-span-2">
            <label htmlFor="birthDate" className="text-sm font-semibold text-slate-900">
              生年月日
            </label>
            <input
              id="birthDate"
              name="birthDate"
              type="date"
              className="w-full rounded-[1.25rem] border border-slate-200 px-4 py-3 outline-none transition focus:border-cyan-400 focus:ring-4 focus:ring-cyan-100"
            />
          </div>
          <div className="md:col-span-2">
            <SubmitButton>登録して始める</SubmitButton>
          </div>
        </form>
      </SectionCard>
    </div>
  );
}
