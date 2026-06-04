import Link from "next/link";

import { deleteWeeklyReviewAction, saveWeeklyReviewAction } from "@/app/actions";
import { AiAdvicePanel } from "@/components/ai-advice-panel";
import { AlertBanner, PageHeader, SectionCard, StatusBadge } from "@/components/common";
import { SubmitButton } from "@/components/submit-button";
import { ACHIEVEMENT_LEVEL_LABELS, VISIBILITY_LABELS } from "@/lib/constants";
import { requireAthlete } from "@/lib/auth";
import { getWeeklyReviewForUser, listWeeklyReviewsByUserId } from "@/lib/repository";
import { readSearchParams, type SearchParamsInput } from "@/lib/search-params";
import { formatDateShort, getCurrentYear, getMonday } from "@/lib/utils";

const inputClassName =
  "w-full rounded-[1.25rem] border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-cyan-400 focus:ring-4 focus:ring-cyan-100";

export default async function WeeklyReviewsPage({
  searchParams,
}: {
  searchParams?: SearchParamsInput;
}) {
  const currentUser = await requireAthlete();
  const params = await readSearchParams(searchParams);
  const editId = params.get("edit");
  const message = params.get("message");
  const error = params.get("error");

  const reviews = await listWeeklyReviewsByUserId(currentUser.id);
  const editingReview = editId ? await getWeeklyReviewForUser(currentUser.id, editId) : null;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="WEEKLY REVIEW"
        title="週次振り返り"
        description="1週間を短くふり返って、来週やることを決めます。"
      />
      {message ? <AlertBanner tone="success" message={message} /> : null}
      {error ? <AlertBanner tone="error" message={error} /> : null}
      <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <SectionCard title="登録済みの振り返り" description="新しい週から順に表示しています。">
          {reviews.length > 0 ? (
            <div className="space-y-4">
              {reviews.map((review) => (
                <article key={review.id} className="rounded-[1.5rem] border border-slate-100 bg-slate-50/70 p-5">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-lg font-semibold text-slate-900">{formatDateShort(review.weekStartDate)}の週</p>
                      <p className="mt-1 text-sm text-slate-500">
                        達成度: {ACHIEVEMENT_LEVEL_LABELS[review.achievementLevel]}
                      </p>
                    </div>
                    <StatusBadge tone={review.visibility === "admin" ? "cyan" : "amber"}>
                      {VISIBILITY_LABELS[review.visibility]}
                    </StatusBadge>
                  </div>
                  <p className="mt-4 text-sm text-slate-600">良かったところ: {review.goodPoints}</p>
                  <p className="mt-2 text-sm text-slate-600">来週意識すること: {review.nextAction}</p>
                  <div className="mt-4 flex gap-3">
                    <Link
                      href={`/mypage/weekly-reviews?edit=${review.id}`}
                      className="rounded-full border border-cyan-200 bg-white px-4 py-2 text-sm font-semibold text-cyan-700 transition hover:bg-cyan-50"
                    >
                      編集
                    </Link>
                    <form action={deleteWeeklyReviewAction}>
                      <input type="hidden" name="reviewId" value={review.id} />
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
              まだ週次振り返りがありません。右のフォームから追加してください。
            </div>
          )}
        </SectionCard>

        <SectionCard
          title={editingReview ? "週次振り返りを編集" : "週次振り返りを追加"}
          description="点数だけでなく、次にやる行動まで書くのがポイントです。"
        >
          <form action={saveWeeklyReviewAction} className="space-y-4">
            <input type="hidden" name="reviewId" value={editingReview?.id ?? ""} />
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label htmlFor="year" className="text-sm font-semibold text-slate-900">
                  年
                </label>
                <input id="year" name="year" type="number" defaultValue={editingReview?.year ?? getCurrentYear()} className={inputClassName} />
              </div>
              <div className="space-y-2">
                <label htmlFor="weekStartDate" className="text-sm font-semibold text-slate-900">
                  週の開始日
                </label>
                <input
                  id="weekStartDate"
                  name="weekStartDate"
                  type="date"
                  defaultValue={editingReview?.weekStartDate ?? getMonday()}
                  className={inputClassName}
                />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <label htmlFor="achievementLevel" className="text-sm font-semibold text-slate-900">
                  達成度
                </label>
                <select
                  id="achievementLevel"
                  name="achievementLevel"
                  defaultValue={editingReview?.achievementLevel ?? "mostly_done"}
                  className={inputClassName}
                >
                  {Object.entries(ACHIEVEMENT_LEVEL_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label htmlFor="score" className="text-sm font-semibold text-slate-900">
                  点数
                </label>
                <input id="score" name="score" type="number" min={0} max={100} defaultValue={editingReview?.score ?? ""} className={inputClassName} />
              </div>
              <div className="space-y-2">
                <label htmlFor="confidenceScore" className="text-sm font-semibold text-slate-900">
                  自信度
                </label>
                <input
                  id="confidenceScore"
                  name="confidenceScore"
                  type="number"
                  min={0}
                  max={10}
                  defaultValue={editingReview?.confidenceScore ?? ""}
                  className={inputClassName}
                />
              </div>
            </div>
            {[
              ["goodPoints", "良かったところ", editingReview?.goodPoints ?? ""],
              ["difficultPoints", "もう一度やり直せるなら改善したいところ", editingReview?.difficultPoints ?? ""],
              ["improvementPoint", "改善したいポイント", editingReview?.improvementPoint ?? ""],
              ["nextAction", "来週意識すること", editingReview?.nextAction ?? ""],
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
            <div className="space-y-2">
              <label htmlFor="visibility" className="text-sm font-semibold text-slate-900">
                管理者に見せるか
              </label>
              <select id="visibility" name="visibility" defaultValue={editingReview?.visibility ?? "private"} className={inputClassName}>
                {Object.entries(VISIBILITY_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
            <SubmitButton>{editingReview ? "更新する" : "保存する"}</SubmitButton>
          </form>
          <AiAdvicePanel
            mode="weekly"
            initialText={editingReview ? `${editingReview.goodPoints}\n${editingReview.difficultPoints}\n${editingReview.nextAction}` : ""}
            title="AIアドバイス"
            description="振り返りから次の行動案を整理したいときに使えます。"
          />
        </SectionCard>
      </div>
    </div>
  );
}
