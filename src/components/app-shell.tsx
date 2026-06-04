import Link from "next/link";

import { logoutAction } from "@/app/actions";
import type { SessionUser } from "@/lib/types";

export function AppShell({
  currentUser,
  children,
}: {
  currentUser: SessionUser | null;
  children: React.ReactNode;
}) {
  const isAdmin = currentUser?.role === "admin";
  const homeLink = isAdmin ? "/admin/dashboard" : currentUser ? "/mypage" : "/";

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(56,189,248,0.18),_transparent_35%),linear-gradient(180deg,_#effcff_0%,_#f8fbff_45%,_#f6fafc_100%)] text-slate-900">
      <header className="sticky top-0 z-20 border-b border-white/70 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <Link href={homeLink} className="min-w-0">
            <p className="text-xs font-semibold tracking-[0.28em] text-cyan-600">MY SWIM STORY</p>
            <p className="truncate text-lg font-semibold text-slate-900">私の競泳物語</p>
          </Link>
          <nav className="flex flex-wrap items-center justify-end gap-2 text-sm">
            <Link
              href="/goals"
              className="rounded-full px-3 py-2 text-slate-600 transition hover:bg-cyan-50 hover:text-cyan-700"
            >
              みんなの目標
            </Link>
            {currentUser ? (
              <>
                <span className="rounded-full bg-cyan-50 px-3 py-2 text-cyan-700">
                  {currentUser.nickname}
                </span>
                <Link
                  href={isAdmin ? "/admin/dashboard" : "/mypage"}
                  className="rounded-full px-3 py-2 text-slate-600 transition hover:bg-cyan-50 hover:text-cyan-700"
                >
                  {isAdmin ? "管理画面" : "マイページ"}
                </Link>
                <form action={logoutAction}>
                  <button
                    type="submit"
                    className="rounded-full border border-slate-200 bg-white px-3 py-2 text-slate-600 transition hover:border-slate-300 hover:text-slate-900"
                  >
                    ログアウト
                  </button>
                </form>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="rounded-full px-3 py-2 text-slate-600 transition hover:bg-cyan-50 hover:text-cyan-700"
                >
                  ログイン
                </Link>
                <Link
                  href="/register"
                  className="rounded-full bg-cyan-600 px-4 py-2 font-semibold text-white transition hover:bg-cyan-500"
                >
                  新規登録
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">{children}</main>
    </div>
  );
}
