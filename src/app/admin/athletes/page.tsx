import Link from "next/link";

import { PageHeader, SectionCard, StatusBadge } from "@/components/common";
import {
  PUBLIC_GOAL_STATUS_LABELS,
  GRADE_OPTIONS,
} from "@/lib/constants";
import { requireAdmin } from "@/lib/auth";
import { listAthletes } from "@/lib/repository";
import { readSearchParams, type SearchParamsInput } from "@/lib/search-params";
import { formatDateShort } from "@/lib/utils";

const inputClassName =
  "w-full rounded-[1rem] border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-cyan-400 focus:ring-4 focus:ring-cyan-100";

export default async function AdminAthletesPage({
  searchParams,
}: {
  searchParams?: SearchParamsInput;
}) {
  await requireAdmin();
  const params = await readSearchParams(searchParams);
  const search = params.get("search");
  const grade = params.get("grade");
  const athletes = await listAthletes({ search, grade });

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="ATHLETES"
        title="選手一覧"
        description="検索や学年絞り込みで、見たい選手をすばやく探せます。"
      />
      <SectionCard title="検索・絞り込み" description="氏名、ニックネーム、メールアドレスで検索できます。">
        <form className="grid gap-4 md:grid-cols-[1fr_220px_140px]">
          <input
            name="search"
            defaultValue={search}
            placeholder="氏名、ニックネーム、メール"
            className={inputClassName}
          />
          <select name="grade" defaultValue={grade} className={inputClassName}>
            <option value="">全学年</option>
            {GRADE_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          <button
            type="submit"
            className="rounded-full bg-cyan-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-cyan-500"
          >
            検索する
          </button>
        </form>
      </SectionCard>
      <SectionCard title={`表示件数: ${athletes.length}件`} description="最新の振り返り日と公開申請状況も確認できます。">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-slate-500">
                <th className="px-3 py-3 font-medium">氏名</th>
                <th className="px-3 py-3 font-medium">ニックネーム</th>
                <th className="px-3 py-3 font-medium">学年</th>
                <th className="px-3 py-3 font-medium">主な種目</th>
                <th className="px-3 py-3 font-medium">最新振り返り日</th>
                <th className="px-3 py-3 font-medium">公開申請状況</th>
              </tr>
            </thead>
            <tbody>
              {athletes.map((item) => (
                <tr key={item.user.id} className="border-b border-slate-100/80">
                  <td className="px-3 py-4">
                    <Link
                      href={`/admin/athletes/${item.user.id}`}
                      className="font-semibold text-cyan-700 transition hover:text-cyan-800"
                    >
                      {item.user.name}
                    </Link>
                  </td>
                  <td className="px-3 py-4">{item.user.nickname}</td>
                  <td className="px-3 py-4">{item.user.grade}</td>
                  <td className="px-3 py-4">{item.profile?.mainEvent || "未入力"}</td>
                  <td className="px-3 py-4">
                    {item.latestWeeklyReview ? formatDateShort(item.latestWeeklyReview.weekStartDate) : "未入力"}
                  </td>
                  <td className="px-3 py-4">
                    <StatusBadge tone={item.publicGoal?.status === "approved" ? "emerald" : item.publicGoal ? "amber" : "slate"}>
                      {item.publicGoal ? PUBLIC_GOAL_STATUS_LABELS[item.publicGoal.status] : "未申請"}
                    </StatusBadge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>
    </div>
  );
}
