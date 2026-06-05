import Link from "next/link";

import { AlertBanner, PageHeader, SectionCard, StatusBadge } from "@/components/common";
import { requireAthlete } from "@/lib/auth";
import { displayName, getAthleteDashboardData } from "@/lib/repository";
import { PUBLIC_GOAL_STATUS_LABELS } from "@/lib/constants";
import { readSearchParams, type SearchParamsInput } from "@/lib/search-params";
import { formatDateShort, formatMonth, hasReviewedThisWeek } from "@/lib/utils";

export default async function MyPage({
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
    return <div>データを読み込めませんでした。</div>;
  }

  const latestYearlyGoal = dashboard.yearlyGoals[0] ?? null;
  const latestMonthlyGoal = dashboard.monthlyGoals[0] ?? null;
  const latestWeeklyReview = dashboard.weeklyReviews[0] ?? null;

  const cards = [
    {
      title: "プロフィール",
      href: "/mypage/profile",
      status: dashboard.profile?.mainEvent ? "入力済み" : "未入力",
      detail: dashboard.profile?.mainEvent
        ? `主な種目: ${dashboard.profile.mainEvent}`
        : "所属や主な種目を登録しましょう。",
    },
    {
      title: "ベストタイム",
      href: "/mypage/records",
      status: dashboard.raceRecords.length > 0 ? `${dashboard.raceRecords.length}件` : "未入力",
      detail:
        dashboard.raceRecords[0]
          ? `${dashboard.raceRecords[0].distance}m ${dashboard.raceRecords[0].bestTime}`
          : "複数の記録を登録できます。",
    },
    {
      title: "私の競泳物語",
      href: "/mypage/story",
      status: dashboard.story ? "入力済み" : "未入力",
      detail: dashboard.story
        ? `競泳の意味: ${dashboard.story.meaningOfSwimming.slice(0, 42)}...`
        : "過去・今・未来を3つの流れで書きます。",
    },
    {
      title: "今年の目標",
      href: "/mypage/yearly-goals",
      status: latestYearlyGoal ? `${latestYearlyGoal.year}年` : "未入力",
      detail: latestYearlyGoal
        ? latestYearlyGoal.outcomeGoal
        : "大会・目標タイム・行動目標を決めます。",
    },
    {
      title: "今月の目標",
      href: "/mypage/monthly-goals",
      status: latestMonthlyGoal ? formatMonth(latestMonthlyGoal.year, latestMonthlyGoal.month) : "未入力",
      detail: latestMonthlyGoal ? latestMonthlyGoal.monthlyGoal : "今月強くしたい部分を言葉にします。",
    },
    {
      title: "週次振り返り",
      href: "/mypage/weekly-reviews",
      status: latestWeeklyReview ? (hasReviewedThisWeek(dashboard.weeklyReviews) ? "今週入力済み" : "入力あり") : "未入力",
      detail: latestWeeklyReview
        ? `最新: ${formatDateShort(latestWeeklyReview.weekStartDate)}`
        : "毎週のふり返りで次の行動を決めます。",
    },
    {
      title: "共有申請",
      href: "/mypage/public-goals",
      status: dashboard.publicGoal ? PUBLIC_GOAL_STATUS_LABELS[dashboard.publicGoal.status] : "未申請",
      detail: dashboard.publicGoal
        ? "ニックネームだけで目標を公開申請できます。"
        : "公開したい目標だけを選んで申請できます。",
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="ATHLETE MYPAGE"
        title={`${displayName(dashboard.user)}さんのマイページ`}
        description="未入力のところから順番に進めれば大丈夫です。物語、年間、月間、週次の流れで使えます。"
      />
      {message ? <AlertBanner tone="success" message={message} /> : null}
      {error ? <AlertBanner tone="error" message={error} /> : null}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {cards.map((card) => (
          <Link
            key={card.title}
            href={card.href}
            className="group rounded-[1.75rem] bg-white p-5 shadow-[0_20px_70px_rgba(15,23,42,0.08)] ring-1 ring-slate-100 transition hover:-translate-y-0.5 hover:ring-cyan-200"
          >
            <div className="flex items-center justify-between gap-3">
              <p className="text-lg font-semibold text-slate-900">{card.title}</p>
              <StatusBadge tone={card.status === "未入力" || card.status === "未申請" ? "amber" : "cyan"}>
                {card.status}
              </StatusBadge>
            </div>
            <p className="mt-4 text-sm leading-7 text-slate-600">{card.detail}</p>
            <p className="mt-6 text-sm font-semibold text-cyan-700 transition group-hover:text-cyan-800">
              開く
            </p>
          </Link>
        ))}
      </div>
      <SectionCard
        title="使い方の流れ"
        description="まずはプロフィールと競泳物語を整えると、その後の目標が書きやすくなります。"
      >
        <ol className="grid gap-3 text-sm leading-7 text-slate-600 md:grid-cols-2">
          <li className="rounded-[1.25rem] bg-slate-50 px-4 py-3">1. プロフィールとベストタイムを登録する</li>
          <li className="rounded-[1.25rem] bg-slate-50 px-4 py-3">2. 私の競泳物語で過去・今・未来を書く</li>
          <li className="rounded-[1.25rem] bg-slate-50 px-4 py-3">3. 年間目標と月間目標をつなげる</li>
          <li className="rounded-[1.25rem] bg-slate-50 px-4 py-3">4. 毎週ふり返って次の行動を決める</li>
        </ol>
      </SectionCard>
    </div>
  );
}
