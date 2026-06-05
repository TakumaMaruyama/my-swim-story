import Link from "next/link";

import { EmptyState, PageHeader, SectionCard, StatusBadge } from "@/components/common";
import {
  ACHIEVEMENT_LEVEL_LABELS,
  COURSE_TYPE_LABELS,
  FOCUS_AREA_LABELS,
  PUBLIC_GOAL_STATUS_LABELS,
  STROKE_LABELS,
  VISIBILITY_LABELS,
} from "@/lib/constants";
import { requireAdmin } from "@/lib/auth";
import { displayName, getAdminAthleteDetail } from "@/lib/repository";
import { formatDateShort, formatMonth } from "@/lib/utils";

function PrivateNotice() {
  return (
    <div className="rounded-[1.25rem] border border-dashed border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-500">
      選手本人のみ閲覧
    </div>
  );
}

export default async function AdminAthleteDetailPage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  await requireAdmin();
  const { userId } = await params;
  const detail = await getAdminAthleteDetail(userId);

  if (!detail) {
    return (
      <div className="space-y-6">
        <PageHeader eyebrow="ATHLETE DETAIL" title="選手が見つかりません" />
        <EmptyState title="データがありません" description="一覧に戻って別の選手を選んでください。" actionHref="/admin/athletes" actionLabel="一覧へ戻る" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="ATHLETE DETAIL"
        title={`${displayName(detail.user)} さんの詳細`}
        description="visibility が private の項目は表示せず、本人のみ閲覧として扱います。"
        action={
          <Link
            href="/admin/athletes"
            className="inline-flex rounded-full border border-cyan-200 bg-cyan-50 px-4 py-2 text-sm font-semibold text-cyan-700 transition hover:bg-cyan-100"
          >
            一覧へ戻る
          </Link>
        }
      />
      <div className="grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
        <SectionCard title="基本情報" description="氏名・ニックネーム・学年などの基本情報です。">
          <dl className="grid gap-4 text-sm text-slate-600">
            <div>
              <dt className="font-semibold text-slate-900">氏名</dt>
              <dd>{detail.user.name ?? "未入力"}</dd>
            </div>
            <div>
              <dt className="font-semibold text-slate-900">ニックネーム</dt>
              <dd>{detail.user.nickname ?? "未入力"}</dd>
            </div>
            <div>
              <dt className="font-semibold text-slate-900">メールアドレス</dt>
              <dd>{detail.user.email}</dd>
            </div>
            <div>
              <dt className="font-semibold text-slate-900">学年</dt>
              <dd>{detail.user.grade ?? "未入力"}</dd>
            </div>
            <div>
              <dt className="font-semibold text-slate-900">所属</dt>
              <dd>
                {detail.profile?.affiliationVisibility === "admin"
                  ? detail.profile.affiliation || "未入力"
                  : "選手本人のみ閲覧"}
              </dd>
            </div>
            <div>
              <dt className="font-semibold text-slate-900">主な種目</dt>
              <dd>{detail.profile?.mainEvent || "未入力"}</dd>
            </div>
            <div>
              <dt className="font-semibold text-slate-900">公開申請</dt>
              <dd>
                {detail.publicGoal ? (
                  <StatusBadge tone={detail.publicGoal.status === "approved" ? "emerald" : "amber"}>
                    {PUBLIC_GOAL_STATUS_LABELS[detail.publicGoal.status]}
                  </StatusBadge>
                ) : (
                  "未申請"
                )}
              </dd>
            </div>
          </dl>
        </SectionCard>

        <SectionCard title="ベストタイム" description="ベストタイムは一覧で確認できます。">
          {detail.raceRecords.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2">
              {detail.raceRecords.map((record) => (
                <article key={record.id} className="rounded-[1.5rem] border border-slate-100 bg-slate-50/70 p-4 text-sm">
                  <p className="font-semibold text-slate-900">
                    {record.distance}m {STROKE_LABELS[record.stroke]}
                  </p>
                  <p className="mt-1 text-slate-600">
                    {COURSE_TYPE_LABELS[record.courseType]} / {record.bestTime}
                  </p>
                  <p className="mt-2 text-slate-500">
                    {record.meetName || "大会名未入力"} / {formatDateShort(record.recordDate)}
                  </p>
                </article>
              ))}
            </div>
          ) : (
            <EmptyState title="記録なし" description="まだベストタイムが登録されていません。" />
          )}
        </SectionCard>
      </div>

      <SectionCard title="私の競泳物語" description="visibility が admin の場合のみ内容を表示します。">
        {detail.story ? (
          detail.story.visibility === "admin" ? (
            <div className="grid gap-4 md:grid-cols-2">
              <article className="rounded-[1.5rem] bg-slate-50/70 p-4 text-sm leading-7 text-slate-600">
                <p className="font-semibold text-slate-900">過去</p>
                <p className="mt-2">一番古い記憶: {detail.story.oldestMemory}</p>
                <p className="mt-2">始めたきっかけ: {detail.story.reasonStarted}</p>
                <p className="mt-2">初レース: {detail.story.firstRaceMemory}</p>
                <p className="mt-2">心に残ること: {detail.story.memorableEvent}</p>
              </article>
              <article className="rounded-[1.5rem] bg-slate-50/70 p-4 text-sm leading-7 text-slate-600">
                <p className="font-semibold text-slate-900">今と未来</p>
                <p className="mt-2">続ける理由: {detail.story.reasonContinuing}</p>
                <p className="mt-2">成長を感じるとき: {detail.story.growthMoment}</p>
                <p className="mt-2">競泳の意味: {detail.story.meaningOfSwimming}</p>
                <p className="mt-2">ラストシーン: {detail.story.lastScene}</p>
              </article>
            </div>
          ) : (
            <PrivateNotice />
          )
        ) : (
          <EmptyState title="未入力" description="競泳物語はまだ登録されていません。" />
        )}
      </SectionCard>

      <SectionCard title="年間目標" description="visibility ごとに表示を切り替えています。">
        <div className="space-y-4">
          {detail.yearlyGoals.length > 0 ? (
            detail.yearlyGoals.map((goal) =>
              goal.visibility === "admin" ? (
                <article key={goal.id} className="rounded-[1.5rem] border border-slate-100 bg-slate-50/70 p-4 text-sm leading-7 text-slate-600">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <p className="font-semibold text-slate-900">{goal.year}年 / {goal.targetMeet || "大会未設定"}</p>
                    <StatusBadge tone="cyan">{VISIBILITY_LABELS[goal.visibility]}</StatusBadge>
                  </div>
                  <p className="mt-2">結果目標: {goal.outcomeGoal}</p>
                  <p className="mt-2">目標タイム: {goal.targetTime || "未入力"}</p>
                  <p className="mt-2">練習で取り組む行動: {goal.processGoal}</p>
                </article>
              ) : (
                <PrivateNotice key={goal.id} />
              ),
            )
          ) : (
            <EmptyState title="未入力" description="年間目標はまだありません。" />
          )}
        </div>
      </SectionCard>

      <SectionCard title="月間目標" description="今月良くしたい部分や行動目標を確認できます。">
        <div className="space-y-4">
          {detail.monthlyGoals.length > 0 ? (
            detail.monthlyGoals.map((goal) =>
              goal.visibility === "admin" ? (
                <article key={goal.id} className="rounded-[1.5rem] border border-slate-100 bg-slate-50/70 p-4 text-sm leading-7 text-slate-600">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <p className="font-semibold text-slate-900">{formatMonth(goal.year, goal.month)}</p>
                    <StatusBadge tone="cyan">{FOCUS_AREA_LABELS[goal.focusArea]}</StatusBadge>
                  </div>
                  <p className="mt-2">今月の目標: {goal.monthlyGoal}</p>
                  <p className="mt-2">行動目標: {goal.processGoal}</p>
                </article>
              ) : (
                <PrivateNotice key={goal.id} />
              ),
            )
          ) : (
            <EmptyState title="未入力" description="月間目標はまだありません。" />
          )}
        </div>
      </SectionCard>

      <SectionCard title="週次振り返り" description="達成度と次のアクションを確認できます。">
        <div className="space-y-4">
          {detail.weeklyReviews.length > 0 ? (
            detail.weeklyReviews.map((review) =>
              review.visibility === "admin" ? (
                <article key={review.id} className="rounded-[1.5rem] border border-slate-100 bg-slate-50/70 p-4 text-sm leading-7 text-slate-600">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <p className="font-semibold text-slate-900">{formatDateShort(review.weekStartDate)} の週</p>
                    <StatusBadge tone="cyan">{ACHIEVEMENT_LEVEL_LABELS[review.achievementLevel]}</StatusBadge>
                  </div>
                  <p className="mt-2">良かったところ: {review.goodPoints}</p>
                  <p className="mt-2">改善したいところ: {review.difficultPoints}</p>
                  <p className="mt-2">来週意識すること: {review.nextAction}</p>
                </article>
              ) : (
                <PrivateNotice key={review.id} />
              ),
            )
          ) : (
            <EmptyState title="未入力" description="週次振り返りはまだありません。" />
          )}
        </div>
      </SectionCard>
    </div>
  );
}
