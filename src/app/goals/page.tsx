import { EmptyState, PageHeader, SectionCard, StatusBadge } from "@/components/common";
import {
  PUBLIC_DISPLAY_CATEGORY_LABELS,
  PUBLIC_DISPLAY_STATE_LABELS,
} from "@/lib/constants";
import { listApprovedPublicGoals } from "@/lib/repository";

export default async function PublicGoalsPage() {
  const goals = await listApprovedPublicGoals();

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="PUBLIC GOALS"
        title="みんなの目標"
        description="表示しているのは、管理者が承認した公開目標だけです。個人情報は表示しません。"
      />
      <SectionCard title="公開中の目標" description="ニックネーム、カテゴリ、目標、行動目標、状態のみ表示しています。">
        {goals.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {goals.map((goal) => (
              <article key={goal.id} className="rounded-[1.75rem] border border-slate-100 bg-slate-50/70 p-5 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-lg font-semibold text-slate-900">{goal.nickname}</p>
                    <p className="mt-1 text-sm text-slate-500">
                      {PUBLIC_DISPLAY_CATEGORY_LABELS[goal.category]}
                    </p>
                  </div>
                  <StatusBadge
                    tone={
                      goal.state === "achieved"
                        ? "emerald"
                        : goal.state === "challenge"
                          ? "cyan"
                          : "amber"
                    }
                  >
                    {PUBLIC_DISPLAY_STATE_LABELS[goal.state]}
                  </StatusBadge>
                </div>
                <div className="mt-5 space-y-4 text-sm leading-7 text-slate-600">
                  <div>
                    <p className="font-semibold text-slate-900">目標</p>
                    <p className="mt-2">{goal.goal}</p>
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">今月または今週の行動目標</p>
                    <p className="mt-2">{goal.action}</p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <EmptyState
            title="まだ公開中の目標はありません"
            description="選手が公開申請を送り、管理者が承認するとここに表示されます。"
          />
        )}
      </SectionCard>
    </div>
  );
}
