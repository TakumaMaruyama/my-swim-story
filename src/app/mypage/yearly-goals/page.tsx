import Link from "next/link";

import { deleteYearlyGoalAction, saveYearlyGoalAction } from "@/app/actions";
import { AiAdvicePanel } from "@/components/ai-advice-panel";
import { AlertBanner, PageHeader, SectionCard, StatusBadge } from "@/components/common";
import { SubmitButton } from "@/components/submit-button";
import { VISIBILITY_LABELS } from "@/lib/constants";
import { requireAthlete } from "@/lib/auth";
import { getYearlyGoalForUser, listYearlyGoalsByUserId } from "@/lib/repository";
import { readSearchParams, type SearchParamsInput } from "@/lib/search-params";
import { formatDateShort, getCurrentYear } from "@/lib/utils";

const inputClassName =
  "w-full rounded-[1.25rem] border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-cyan-400 focus:ring-4 focus:ring-cyan-100";

export default async function YearlyGoalsPage({
  searchParams,
}: {
  searchParams?: SearchParamsInput;
}) {
  const currentUser = await requireAthlete();
  const params = await readSearchParams(searchParams);
  const editId = params.get("edit");
  const message = params.get("message");
  const error = params.get("error");

  const goals = await listYearlyGoalsByUserId(currentUser.id);
  const editingGoal = editId ? await getYearlyGoalForUser(currentUser.id, editId) : null;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="YEARLY GOALS"
        title="年間目標"
        description="大きな大会やタイムだけでなく、練習で取り組む行動と人としての目標までつなげます。"
      />
      {message ? <AlertBanner tone="success" message={message} /> : null}
      {error ? <AlertBanner tone="error" message={error} /> : null}
      <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <SectionCard title="登録済みの年間目標" description="最新の目標から表示しています。">
          {goals.length > 0 ? (
            <div className="space-y-4">
              {goals.map((goal) => (
                <article key={goal.id} className="rounded-[1.5rem] border border-slate-100 bg-slate-50/70 p-5">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-lg font-semibold text-slate-900">{goal.year}年の目標</p>
                      <p className="mt-1 text-sm text-slate-500">
                        {goal.targetMeet || "大会未設定"} / {goal.targetEvent || "種目未設定"}
                      </p>
                    </div>
                    <StatusBadge tone={goal.visibility === "admin" ? "cyan" : "amber"}>
                      {VISIBILITY_LABELS[goal.visibility]}
                    </StatusBadge>
                  </div>
                  <p className="mt-4 text-sm leading-7 text-slate-600">{goal.outcomeGoal}</p>
                  <dl className="mt-4 space-y-2 text-sm text-slate-600">
                    <div>
                      <dt className="font-semibold text-slate-900">目標日</dt>
                      <dd>{formatDateShort(goal.targetDate)}</dd>
                    </div>
                    <div>
                      <dt className="font-semibold text-slate-900">プロセス目標</dt>
                      <dd>{goal.processGoal}</dd>
                    </div>
                  </dl>
                  <div className="mt-4 flex gap-3">
                    <Link
                      href={`/mypage/yearly-goals?edit=${goal.id}`}
                      className="rounded-full border border-cyan-200 bg-white px-4 py-2 text-sm font-semibold text-cyan-700 transition hover:bg-cyan-50"
                    >
                      編集
                    </Link>
                    <form action={deleteYearlyGoalAction}>
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
              まだ年間目標がありません。右のフォームから作成してください。
            </div>
          )}
        </SectionCard>

        <SectionCard
          title={editingGoal ? "年間目標を編集" : "年間目標を追加"}
          description="未来の姿から逆算して書いていきましょう。"
        >
          <form action={saveYearlyGoalAction} className="space-y-4">
            <input type="hidden" name="goalId" value={editingGoal?.id ?? ""} />
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label htmlFor="year" className="text-sm font-semibold text-slate-900">
                  年
                </label>
                <input
                  id="year"
                  name="year"
                  type="number"
                  defaultValue={editingGoal?.year ?? getCurrentYear()}
                  className={inputClassName}
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="targetDate" className="text-sm font-semibold text-slate-900">
                  目標日
                </label>
                <input
                  id="targetDate"
                  name="targetDate"
                  type="date"
                  defaultValue={editingGoal?.targetDate ?? ""}
                  className={inputClassName}
                />
              </div>
            </div>
            <div className="space-y-2">
              <label htmlFor="targetMeet" className="text-sm font-semibold text-slate-900">
                目標大会
              </label>
              <input id="targetMeet" name="targetMeet" defaultValue={editingGoal?.targetMeet ?? ""} className={inputClassName} />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label htmlFor="targetEvent" className="text-sm font-semibold text-slate-900">
                  目標種目
                </label>
                <input id="targetEvent" name="targetEvent" defaultValue={editingGoal?.targetEvent ?? ""} className={inputClassName} />
              </div>
              <div className="space-y-2">
                <label htmlFor="targetTime" className="text-sm font-semibold text-slate-900">
                  目標タイム
                </label>
                <input id="targetTime" name="targetTime" defaultValue={editingGoal?.targetTime ?? ""} className={inputClassName} />
              </div>
            </div>
            {[
              ["outcomeGoal", "達成したい結果", editingGoal?.outcomeGoal ?? ""],
              ["performanceGoal", "良くしたい競技能力", editingGoal?.performanceGoal ?? ""],
              ["processGoal", "練習で取り組む行動", editingGoal?.processGoal ?? ""],
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
                  className={`${inputClassName} min-h-28`}
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
            mode="yearly"
            initialText={editingGoal ? `${editingGoal.outcomeGoal}\n${editingGoal.processGoal}` : ""}
            title="AIアドバイス"
            description="書いた目標文を短く整理したいときに使えます。"
          />
        </SectionCard>
      </div>
    </div>
  );
}
