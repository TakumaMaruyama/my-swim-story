import { updatePublicGoalStatusAction } from "@/app/actions";
import { AlertBanner, PageHeader, SectionCard, StatusBadge } from "@/components/common";
import {
  PUBLIC_DISPLAY_CATEGORY_LABELS,
  PUBLIC_GOAL_STATUS_LABELS,
} from "@/lib/constants";
import { requireAdmin } from "@/lib/auth";
import { listPublicGoalRequestsForAdmin } from "@/lib/repository";
import { readSearchParams, type SearchParamsInput } from "@/lib/search-params";

export default async function AdminPublicGoalsPage({
  searchParams,
}: {
  searchParams?: SearchParamsInput;
}) {
  await requireAdmin();
  const params = await readSearchParams(searchParams);
  const message = params.get("message");
  const error = params.get("error");
  const requests = await listPublicGoalRequestsForAdmin();

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="PUBLIC GOALS"
        title="公開申請管理"
        description="pending の申請を中心に確認し、承認・非承認・公開停止を切り替えます。"
      />
      {message ? <AlertBanner tone="success" message={message} /> : null}
      {error ? <AlertBanner tone="error" message={error} /> : null}
      <SectionCard title={`申請一覧: ${requests.length}件`} description="個人情報を出しすぎない内容かどうかも確認してください。">
        <div className="space-y-4">
          {requests.map(({ goal, user, yearlyGoal, monthlyGoal, latestReview }) => (
            <article key={goal.id} className="rounded-[1.5rem] border border-slate-100 bg-slate-50/70 p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-lg font-semibold text-slate-900">
                    {user.name} / {goal.displayNickname}
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    {PUBLIC_DISPLAY_CATEGORY_LABELS[goal.displayCategory]} / {user.grade}
                  </p>
                </div>
                <StatusBadge tone={goal.status === "approved" ? "emerald" : goal.status === "rejected" ? "rose" : goal.status === "hidden" ? "slate" : "amber"}>
                  {PUBLIC_GOAL_STATUS_LABELS[goal.status]}
                </StatusBadge>
              </div>
              <div className="mt-4 grid gap-4 lg:grid-cols-2">
                <div className="rounded-[1.25rem] bg-white p-4 text-sm leading-7 text-slate-600">
                  <p className="font-semibold text-slate-900">公開される目標</p>
                  <p className="mt-2">{goal.publicGoalText}</p>
                  <p className="mt-4 font-semibold text-slate-900">公開される行動目標</p>
                  <p className="mt-2">{goal.publicProcessText}</p>
                </div>
                <div className="rounded-[1.25rem] bg-white p-4 text-sm leading-7 text-slate-600">
                  <p className="font-semibold text-slate-900">参考データ</p>
                  <p className="mt-2">年間目標: {yearlyGoal?.outcomeGoal ?? "未選択"}</p>
                  <p className="mt-2">月間目標: {monthlyGoal?.monthlyGoal ?? "未選択"}</p>
                  <p className="mt-2">最新振り返り: {latestReview?.nextAction ?? "未入力"}</p>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-3">
                {[
                  ["approved", "承認", "emerald"],
                  ["rejected", "非承認", "rose"],
                  ["hidden", "公開停止", "slate"],
                ].map(([status, label, tone]) => (
                  <form key={status} action={updatePublicGoalStatusAction}>
                    <input type="hidden" name="requestId" value={goal.id} />
                    <input type="hidden" name="status" value={status} />
                    <button
                      type="submit"
                      className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                        tone === "emerald"
                          ? "border border-emerald-200 bg-white text-emerald-700 hover:bg-emerald-50"
                          : tone === "rose"
                            ? "border border-rose-200 bg-white text-rose-700 hover:bg-rose-50"
                            : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      {label}
                    </button>
                  </form>
                ))}
              </div>
            </article>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}
