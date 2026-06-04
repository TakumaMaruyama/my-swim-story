import { saveProfileAction } from "@/app/actions";
import { AlertBanner, PageHeader, SectionCard } from "@/components/common";
import { SubmitButton } from "@/components/submit-button";
import { GRADE_OPTIONS, VISIBILITY_LABELS } from "@/lib/constants";
import { requireAthlete } from "@/lib/auth";
import { getAthleteDashboardData } from "@/lib/repository";
import { readSearchParams, type SearchParamsInput } from "@/lib/search-params";

const inputClassName =
  "w-full rounded-[1.25rem] border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-cyan-400 focus:ring-4 focus:ring-cyan-100";

export default async function ProfilePage({
  searchParams,
}: {
  searchParams?: SearchParamsInput;
}) {
  const currentUser = await requireAthlete();
  const dashboard = await getAthleteDashboardData(currentUser.id);
  const params = await readSearchParams(searchParams);
  const message = params.get("message");
  const error = params.get("error");

  if (!dashboard) {
    return <div>プロフィールを読み込めませんでした。</div>;
  }

  const profile = dashboard.profile;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="PROFILE"
        title="プロフィール編集"
        description="基本情報と、管理者に見せる範囲をここで決めます。"
      />
      {message ? <AlertBanner tone="success" message={message} /> : null}
      {error ? <AlertBanner tone="error" message={error} /> : null}
      <SectionCard title="基本情報" description="氏名や学年は管理者画面にも表示されます。">
        <form action={saveProfileAction} className="grid gap-5 md:grid-cols-2">
          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-semibold text-slate-900">
              氏名
            </label>
            <input id="name" name="name" defaultValue={dashboard.user.name} required className={inputClassName} />
          </div>
          <div className="space-y-2">
            <label htmlFor="nickname" className="text-sm font-semibold text-slate-900">
              ニックネーム
            </label>
            <input
              id="nickname"
              name="nickname"
              defaultValue={dashboard.user.nickname}
              required
              className={inputClassName}
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="grade" className="text-sm font-semibold text-slate-900">
              学年
            </label>
            <select id="grade" name="grade" defaultValue={dashboard.user.grade} required className={inputClassName}>
              {GRADE_OPTIONS.map((grade) => (
                <option key={grade} value={grade}>
                  {grade}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <label htmlFor="birthDate" className="text-sm font-semibold text-slate-900">
              生年月日
            </label>
            <input
              id="birthDate"
              name="birthDate"
              type="date"
              defaultValue={dashboard.user.birthDate ?? ""}
              className={inputClassName}
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <label htmlFor="affiliation" className="text-sm font-semibold text-slate-900">
              所属
            </label>
            <input
              id="affiliation"
              name="affiliation"
              defaultValue={profile?.affiliation ?? ""}
              placeholder="例: ○○高校水泳部"
              className={inputClassName}
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="affiliationVisibility" className="text-sm font-semibold text-slate-900">
              所属を管理者に見せるか
            </label>
            <select
              id="affiliationVisibility"
              name="affiliationVisibility"
              defaultValue={profile?.affiliationVisibility ?? "private"}
              className={inputClassName}
            >
              {Object.entries(VISIBILITY_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <label htmlFor="mainEvent" className="text-sm font-semibold text-slate-900">
              主な種目
            </label>
            <input
              id="mainEvent"
              name="mainEvent"
              defaultValue={profile?.mainEvent ?? ""}
              placeholder="例: 100m平泳ぎ"
              className={inputClassName}
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="swimmingYears" className="text-sm font-semibold text-slate-900">
              水泳歴（年）
            </label>
            <input
              id="swimmingYears"
              name="swimmingYears"
              type="number"
              min={0}
              defaultValue={profile?.swimmingYears ?? ""}
              className={inputClassName}
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="weeklyTrainingCount" className="text-sm font-semibold text-slate-900">
              週の練習回数
            </label>
            <input
              id="weeklyTrainingCount"
              name="weeklyTrainingCount"
              type="number"
              min={0}
              max={14}
              defaultValue={profile?.weeklyTrainingCount ?? ""}
              className={inputClassName}
            />
          </div>
          <div className="md:col-span-2">
            <SubmitButton>プロフィールを保存する</SubmitButton>
          </div>
        </form>
      </SectionCard>
    </div>
  );
}
