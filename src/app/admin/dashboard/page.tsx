import Link from "next/link";

import { PageHeader, SectionCard, SummaryMetric } from "@/components/common";
import { requireAdmin } from "@/lib/auth";
import { getAdminDashboardStats } from "@/lib/repository";

export default async function AdminDashboardPage() {
  await requireAdmin();
  const stats = await getAdminDashboardStats();

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="ADMIN DASHBOARD"
        title="管理者ダッシュボード"
        description="登録状況、週次入力状況、公開申請の動きをここでまとめて確認できます。"
        action={
          <div className="flex flex-wrap gap-2">
            <Link
              href="/admin/athletes"
              className="rounded-full border border-cyan-200 bg-cyan-50 px-4 py-2 text-sm font-semibold text-cyan-700 transition hover:bg-cyan-100"
            >
              選手一覧
            </Link>
            <Link
              href="/admin/public-goals"
              className="rounded-full border border-cyan-200 bg-cyan-50 px-4 py-2 text-sm font-semibold text-cyan-700 transition hover:bg-cyan-100"
            >
              公開申請管理
            </Link>
          </div>
        }
      />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <SummaryMetric label="登録選手数" value={stats.athleteCount} />
        <SummaryMetric label="今週振り返り済み人数" value={stats.weeklyReviewCount} />
        <SummaryMetric label="公開申請中の数" value={stats.pendingPublicGoalCount} />
        <SummaryMetric label="公開中の目標数" value={stats.approvedPublicGoalCount} />
      </div>
      <SectionCard title="管理メニュー" description="必要な作業にすぐ移動できます。">
        <div className="grid gap-4 md:grid-cols-3">
          <Link
            href="/admin/athletes"
            className="rounded-[1.5rem] border border-slate-100 bg-slate-50/70 p-5 transition hover:border-cyan-200"
          >
            <p className="font-semibold text-slate-900">選手一覧</p>
            <p className="mt-2 text-sm leading-7 text-slate-600">
              氏名、主な種目、最新振り返り日、公開申請状況を確認できます。
            </p>
          </Link>
          <Link
            href="/admin/public-goals"
            className="rounded-[1.5rem] border border-slate-100 bg-slate-50/70 p-5 transition hover:border-cyan-200"
          >
            <p className="font-semibold text-slate-900">公開申請管理</p>
            <p className="mt-2 text-sm leading-7 text-slate-600">
              申請内容を見て、承認・非承認・公開停止を切り替えます。
            </p>
          </Link>
          <Link
            href="/goals"
            className="rounded-[1.5rem] border border-slate-100 bg-slate-50/70 p-5 transition hover:border-cyan-200"
          >
            <p className="font-semibold text-slate-900">公開ページ確認</p>
            <p className="mt-2 text-sm leading-7 text-slate-600">
              一般公開されている「みんなの目標」ページの見え方を確認できます。
            </p>
          </Link>
        </div>
      </SectionCard>
    </div>
  );
}
