import Link from "next/link";

import { listApprovedPublicGoals } from "@/lib/repository";

export default async function HomePage() {
  const publicGoals = await listApprovedPublicGoals();

  return (
    <div className="space-y-8">
      <section className="grid gap-6 overflow-hidden rounded-[2rem] bg-[linear-gradient(135deg,_rgba(8,145,178,0.96),_rgba(14,116,144,0.88)_55%,_rgba(15,23,42,0.95))] px-6 py-10 text-white shadow-[0_35px_100px_rgba(14,116,144,0.30)] md:grid-cols-[1.2fr_0.8fr] md:px-10">
        <div className="space-y-5">
          <p className="text-xs font-semibold tracking-[0.3em] text-cyan-100">MY SWIM STORY</p>
          <h1 className="max-w-3xl text-4xl font-semibold leading-tight md:text-5xl">
            私の競泳物語
          </h1>
          <p className="max-w-2xl text-base leading-8 text-cyan-50 md:text-lg">
            目標を物語に変える、競泳選手のための成長シート。過去をふり返り、今の意味を言葉にし、
            未来の姿から逆算して、今年・今月・今週の行動につなげます。
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/login"
              className="inline-flex rounded-full bg-white px-5 py-3 text-sm font-semibold text-cyan-800 transition hover:bg-cyan-50"
            >
              ログイン
            </Link>
            <Link
              href="/register"
              className="inline-flex rounded-full border border-white/30 bg-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/20"
            >
              新規登録
            </Link>
            <Link
              href="/goals"
              className="inline-flex rounded-full border border-cyan-200/40 bg-cyan-400/10 px-5 py-3 text-sm font-semibold text-cyan-50 transition hover:bg-cyan-400/20"
            >
              みんなの目標を見る
            </Link>
          </div>
        </div>
        <div className="grid gap-4 self-end">
          {[
            {
              title: "1. 過去をふり返る",
              description: "水泳を始めたきっかけや心に残る経験を、物語として整理します。",
            },
            {
              title: "2. 未来から逆算する",
              description: "年間目標と月間目標をつなげて、練習でやることをはっきりさせます。",
            },
            {
              title: "3. 毎週ふり返る",
              description: "できたことと次にやることを短く残し、前進の流れを作ります。",
            },
          ].map((item) => (
            <div
              key={item.title}
              className="rounded-[1.5rem] border border-white/15 bg-white/10 p-5 backdrop-blur"
            >
              <p className="font-semibold">{item.title}</p>
              <p className="mt-2 text-sm leading-6 text-cyan-50">{item.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-[1.75rem] bg-white p-6 shadow-[0_14px_50px_rgba(14,116,144,0.08)] ring-1 ring-cyan-100">
          <p className="text-sm font-semibold text-slate-500">記録より先に見るもの</p>
          <p className="mt-3 text-xl font-semibold text-slate-900">競泳の意味を言葉にする</p>
          <p className="mt-2 text-sm leading-7 text-slate-600">
            タイムだけでなく、続ける理由や成長した瞬間も残します。
          </p>
        </div>
        <div className="rounded-[1.75rem] bg-white p-6 shadow-[0_14px_50px_rgba(14,116,144,0.08)] ring-1 ring-cyan-100">
          <p className="text-sm font-semibold text-slate-500">毎月の軸</p>
          <p className="mt-3 text-xl font-semibold text-slate-900">行動目標まで落とし込む</p>
          <p className="mt-2 text-sm leading-7 text-slate-600">
            結果目標だけで終わらず、今月何を意識するかまで明確にします。
          </p>
        </div>
        <div className="rounded-[1.75rem] bg-white p-6 shadow-[0_14px_50px_rgba(14,116,144,0.08)] ring-1 ring-cyan-100">
          <p className="text-sm font-semibold text-slate-500">公開は本人が選ぶ</p>
          <p className="mt-3 text-xl font-semibold text-slate-900">ニックネームで共有できる</p>
          <p className="mt-2 text-sm leading-7 text-slate-600">
            本名や所属を出さずに、目標の一部だけをみんなに見せられます。
          </p>
        </div>
      </section>

      <section className="rounded-[2rem] bg-white p-6 shadow-[0_20px_70px_rgba(15,23,42,0.08)] ring-1 ring-slate-100">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-semibold tracking-[0.24em] text-cyan-600">PUBLIC GOALS</p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-900">みんなの目標</h2>
            <p className="mt-2 text-sm leading-7 text-slate-600">
              管理者が承認した目標だけを表示しています。個人情報は出ません。
            </p>
          </div>
          <Link
            href="/goals"
            className="inline-flex rounded-full border border-cyan-200 bg-cyan-50 px-4 py-2 text-sm font-semibold text-cyan-700 transition hover:bg-cyan-100"
          >
            一覧ページへ
          </Link>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {publicGoals.length > 0 ? (
            publicGoals.slice(0, 3).map((goal) => (
              <article key={goal.id} className="rounded-[1.5rem] border border-slate-100 bg-slate-50/70 p-5">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-semibold text-slate-900">{goal.nickname}</p>
                  <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-cyan-700 ring-1 ring-cyan-100">
                    {goal.category === "elementary"
                      ? "小学生"
                      : goal.category === "junior_high"
                        ? "中学生"
                        : goal.category === "high_school"
                          ? "高校生"
                          : "その他"}
                  </span>
                </div>
                <p className="mt-4 text-sm font-semibold text-slate-700">目標</p>
                <p className="mt-2 text-sm leading-7 text-slate-600">{goal.goal}</p>
                <p className="mt-4 text-sm font-semibold text-slate-700">行動目標</p>
                <p className="mt-2 text-sm leading-7 text-slate-600">{goal.action}</p>
              </article>
            ))
          ) : (
            <div className="rounded-[1.5rem] border border-dashed border-cyan-200 bg-cyan-50/60 p-6 text-sm leading-7 text-slate-600 md:col-span-3">
              まだ公開中の目標はありません。選手が公開申請を行い、管理者が承認するとここに表示されます。
            </div>
          )}
        </div>
      </section>

      <div className="text-right text-sm text-slate-500">
        <Link href="/admin/login" className="transition hover:text-cyan-700">
          管理者ログイン
        </Link>
      </div>
    </div>
  );
}
