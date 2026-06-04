import Link from "next/link";

import { savePublicGoalAction } from "@/app/actions";
import { AlertBanner, PageHeader, SectionCard, StatusBadge } from "@/components/common";
import { SubmitButton } from "@/components/submit-button";
import {
  PUBLIC_DISPLAY_CATEGORY_LABELS,
  PUBLIC_GOAL_STATUS_LABELS,
} from "@/lib/constants";
import { requireAthlete } from "@/lib/auth";
import { getAthleteDashboardData } from "@/lib/repository";
import { readSearchParams, type SearchParamsInput } from "@/lib/search-params";
import { formatMonth, toCategoryFromGrade } from "@/lib/utils";

const inputClassName =
  "w-full rounded-[1.25rem] border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-cyan-400 focus:ring-4 focus:ring-cyan-100";

export default async function PublicGoalsPage({
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
    return <div>公開申請データを読み込めませんでした。</div>;
  }

  const currentRequest = dashboard.publicGoal;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="PUBLIC REQUEST"
        title="共有ページ公開申請"
        description="本名や所属は出さずに、ニックネームと目標だけを公開申請できます。"
        action={
          <Link
            href="/goals"
            className="inline-flex rounded-full border border-cyan-200 bg-cyan-50 px-4 py-2 text-sm font-semibold text-cyan-700 transition hover:bg-cyan-100"
          >
            みんなの目標を見る
          </Link>
        }
      />
      {message ? <AlertBanner tone="success" message={message} /> : null}
      {error ? <AlertBanner tone="error" message={error} /> : null}
      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <SectionCard title="現在の申請状況" description="承認後でも管理者が公開停止できます。">
          <div className="rounded-[1.5rem] border border-slate-100 bg-slate-50/70 p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-lg font-semibold text-slate-900">
                  {currentRequest ? currentRequest.displayNickname : "申請なし"}
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  {currentRequest
                    ? PUBLIC_DISPLAY_CATEGORY_LABELS[currentRequest.displayCategory]
                    : "まだ公開申請していません。"}
                </p>
              </div>
              <StatusBadge tone={currentRequest?.status === "approved" ? "emerald" : currentRequest ? "amber" : "slate"}>
                {currentRequest ? PUBLIC_GOAL_STATUS_LABELS[currentRequest.status] : "未申請"}
              </StatusBadge>
            </div>
            {currentRequest ? (
              <>
                <p className="mt-4 text-sm font-semibold text-slate-700">公開される目標</p>
                <p className="mt-2 text-sm leading-7 text-slate-600">{currentRequest.publicGoalText}</p>
                <p className="mt-4 text-sm font-semibold text-slate-700">公開される行動目標</p>
                <p className="mt-2 text-sm leading-7 text-slate-600">{currentRequest.publicProcessText}</p>
              </>
            ) : (
              <p className="mt-4 text-sm leading-7 text-slate-600">
                右のフォームから公開したい内容を選び、管理者へ申請してください。
              </p>
            )}
          </div>
          <div className="rounded-[1.5rem] border border-dashed border-cyan-200 bg-cyan-50/60 p-5 text-sm leading-7 text-slate-600">
            公開ページに出るのは「ニックネーム / カテゴリ / 目標 / 行動目標 / 状態」だけです。
            本名、メールアドレス、生年月日、所属、ベストタイム詳細、競泳物語全文、振り返り全文は表示されません。
          </div>
        </SectionCard>

        <SectionCard title="公開申請フォーム" description="公開したい範囲だけを短くまとめて申請します。">
          <form action={savePublicGoalAction} className="space-y-4">
            <input type="hidden" name="requestId" value={currentRequest?.id ?? ""} />
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label htmlFor="displayNickname" className="text-sm font-semibold text-slate-900">
                  表示するニックネーム
                </label>
                <input
                  id="displayNickname"
                  name="displayNickname"
                  defaultValue={currentRequest?.displayNickname ?? dashboard.user.nickname}
                  required
                  className={inputClassName}
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="displayCategory" className="text-sm font-semibold text-slate-900">
                  カテゴリ
                </label>
                <select
                  id="displayCategory"
                  name="displayCategory"
                  defaultValue={currentRequest?.displayCategory ?? toCategoryFromGrade(dashboard.user.grade)}
                  className={inputClassName}
                >
                  {Object.entries(PUBLIC_DISPLAY_CATEGORY_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="space-y-2">
              <label htmlFor="yearlyGoalId" className="text-sm font-semibold text-slate-900">
                参考にする年間目標
              </label>
              <select
                id="yearlyGoalId"
                name="yearlyGoalId"
                defaultValue={currentRequest?.yearlyGoalId ?? dashboard.yearlyGoals[0]?.id ?? ""}
                className={inputClassName}
              >
                <option value="">選ばない</option>
                {dashboard.yearlyGoals.map((goal) => (
                  <option key={goal.id} value={goal.id}>
                    {goal.year}年 / {goal.outcomeGoal}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label htmlFor="monthlyGoalId" className="text-sm font-semibold text-slate-900">
                参考にする月間目標
              </label>
              <select
                id="monthlyGoalId"
                name="monthlyGoalId"
                defaultValue={currentRequest?.monthlyGoalId ?? dashboard.monthlyGoals[0]?.id ?? ""}
                className={inputClassName}
              >
                <option value="">選ばない</option>
                {dashboard.monthlyGoals.map((goal) => (
                  <option key={goal.id} value={goal.id}>
                    {formatMonth(goal.year, goal.month)} / {goal.monthlyGoal}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label htmlFor="publicGoalText" className="text-sm font-semibold text-slate-900">
                公開する目標
              </label>
              <textarea
                id="publicGoalText"
                name="publicGoalText"
                rows={4}
                required
                defaultValue={currentRequest?.publicGoalText ?? dashboard.yearlyGoals[0]?.outcomeGoal ?? ""}
                className={`${inputClassName} min-h-28`}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="publicProcessText" className="text-sm font-semibold text-slate-900">
                公開する行動目標
              </label>
              <textarea
                id="publicProcessText"
                name="publicProcessText"
                rows={4}
                required
                defaultValue={
                  currentRequest?.publicProcessText ??
                  dashboard.monthlyGoals[0]?.processGoal ??
                  dashboard.weeklyReviews[0]?.nextAction ??
                  ""
                }
                className={`${inputClassName} min-h-28`}
              />
            </div>
            <SubmitButton>公開申請を送る</SubmitButton>
          </form>
        </SectionCard>
      </div>
    </div>
  );
}
