import Link from "next/link";

import { deleteMonthlyGoalAction, saveMonthlyGoalAction } from "@/app/actions";
import { AiAdvicePanel } from "@/components/ai-advice-panel";
import { AlertBanner, PageHeader, SectionCard, StatusBadge } from "@/components/common";
import { SubmitButton } from "@/components/submit-button";
import { FOCUS_AREA_LABELS, VISIBILITY_LABELS } from "@/lib/constants";
import { requireAthlete } from "@/lib/auth";
import { getMonthlyGoalForUser, listMonthlyGoalsByUserId } from "@/lib/repository";
import { readSearchParams, type SearchParamsInput } from "@/lib/search-params";
import { formatMonth, getCurrentMonth, getCurrentYear } from "@/lib/utils";

const inputClassName =
  "w-full rounded-[1.25rem] border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-cyan-400 focus:ring-4 focus:ring-cyan-100";

export default async function MonthlyGoalsPage({
  searchParams,
}: {
  searchParams?: SearchParamsInput;
}) {
  const currentUser = await requireAthlete();
  const params = await readSearchParams(searchParams);
  const editId = params.get("edit");
  const message = params.get("message");
  const error = params.get("error");

  const goals = await listMonthlyGoalsByUserId(currentUser.id);
  const editingGoal = editId ? await getMonthlyGoalForUser(currentUser.id, editId) : null;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="MONTHLY GOALS"
        title="月間目標"
        description="今月良くしたい部分を決めて、練習でやることをしぼります。"
      />
      {message ? <AlertBanner tone="success" message={message} /> : null}
      {error ? <AlertBanner tone="error" message={error} /> : null}
      <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <SectionCard title="登録済みの月間目標" description="今月以外の記録も残しておけます。">
          {goals.length > 0 ? (
            <div className="space-y-4">
              {goals.map((goal) => (
                <article key={goal.id} className="rounded-[1.5rem] border border-slate-100 bg-slate-50/70 p-5">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-lg font-semibold text-slate-900">{formatMonth(goal.year, goal.month)}</p>
                      <p className="mt-1 text-sm text-slate-500">重点: {FOCUS_AREA_LABELS[goal.focusArea]}</p>
                    </div>
                    <StatusBadge tone={goal.visibility === "admin" ? "cyan" : "amber"}>
                      {VISIBILITY_LABELS[goal.visibility]}
                    </StatusBadge>
                  </div>
                  <p className="mt-4 text-sm leading-7 text-slate-600">{goal.monthlyGoal}</p>
                  <p className="mt-3 text-sm text-slate-600">行動目標: {goal.processGoal}</p>
                  <div className="mt-4 flex gap-3">
                    <Link
                      href={`/mypage/monthly-goals?edit=${goal.id}`}
                      className="rounded-full border border-cyan-200 bg-white px-4 py-2 text-sm font-semibold text-cyan-700 transition hover:bg-cyan-50"
                    >
                      編集
                    </Link>
                    <form action={deleteMonthlyGoalAction}>
                      <input type="hidden" name="goalId" value={goal.id} />
                      <button
                        type="submit"
                        className="rounded-full border border-rose-200 bg-white px-4 py-2 text-sm font-semibold text-rose-700 transition hover:bg-rose-50"
                      >
                        削除
                      </button>
                    </form>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="rounded-[1.5rem] border border-dashed border-cyan-200 bg-cyan-50/60 p-5 text-sm leading-7 text-slate-600">
              まだ月間目標がありません。右のフォームから追加してください。
            </div>
          )}
        </SectionCard>

        <SectionCard
          title={editingGoal ? "月間目標を編集" : "月間目標を追加"}
          description="今年の目標につながる、今月のテーマを決めます。"
        >
          <form action={saveMonthlyGoalAction} className="space-y-4">
            <input type="hidden" name="goalId" value={editingGoal?.id ?? ""} />
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label htmlFor="year" className="text-sm font-semibold text-slate-900">
                  年
                </label>
                <input id="year" name="year" type="number" defaultValue={editingGoal?.year ?? getCurrentYear()} className={inputClassName} />
              </div>
              <div className="space-y-2">
                <label htmlFor="month" className="text-sm font-semibold text-slate-900">
                  月
                </label>
                <input id="month" name="month" type="number" min={1} max={12} defaultValue={editingGoal?.month ?? getCurrentMonth()} className={inputClassName} />
              </div>
            </div>
            <div className="space-y-2">
              <label htmlFor="monthlyGoal" className="text-sm font-semibold text-slate-900">
                今月の目標
              </label>
              <textarea
                id="monthlyGoal"
                name="monthlyGoal"
                rows={4}
                defaultValue={editingGoal?.monthlyGoal ?? ""}
                required
                className={`${inputClassName} min-h-28`}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="focusArea" className="text-sm font-semibold text-slate-900">
                今月良くしたい部分
              </label>
              <select
                id="focusArea"
                name="focusArea"
                defaultValue={editingGoal?.focusArea ?? "pace"}
                className={inputClassName}
              >
                {Object.entries(FOCUS_AREA_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
            {[
              ["processGoal", "今月のプロセス目標", editingGoal?.processGoal ?? ""],
              ["personalGrowthGoal", "人としての目標", editingGoal?.personalGrowthGoal ?? ""],
            ].map(([name, label, value]) => (
              <div key={name} className="space-y-2">
                <label htmlFor={name} className="text-sm font-semibold text-slate-900">
                  {label}
                </label>
                <textarea
                  id={name}
                  name={name}
                  rows={3}
                  defaultValue={String(value)}
                  required
                  className={`${inputClassName} min-h-24`}
                />
              </div>
            ))}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label htmlFor="selfScore" className="text-sm font-semibold text-slate-900">
                  自己評価点
                </label>
                <input
                  id="selfScore"
                  name="selfScore"
                  type="number"
                  min={0}
                  max={100}
                  defaultValue={editingGoal?.selfScore ?? ""}
                  className={inputClassName}
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="visibility" className="text-sm font-semibold text-slate-900">
                  管理者に見せるか
                </label>
                <select id="visibility" name="visibility" defaultValue={editingGoal?.visibility ?? "private"} className={inputClassName}>
                  {Object.entries(VISIBILITY_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <SubmitButton>{editingGoal ? "更新する" : "保存する"}</SubmitButton>
          </form>
          <AiAdvicePanel
            mode="monthly"
            initialText={editingGoal ? `${editingGoal.monthlyGoal}\n${editingGoal.processGoal}` : ""}
            title="AIアドバイス"
            description="今月の目標を短く整理したいときに使えます。"
          />
        </SectionCard>
      </div>
    </div>
  );
}
