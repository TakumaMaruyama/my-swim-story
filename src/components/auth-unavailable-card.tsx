export function AuthUnavailableCard() {
  return (
    <div className="rounded-[1.5rem] border border-amber-200 bg-amber-50 px-5 py-5 text-sm leading-7 text-amber-900">
      Replit の Auth pane で <strong>Clerk Auth</strong> を有効化すると、この画面から登録とログインが使えます。
      現在は `CLERK_PUBLISHABLE_KEY` / `CLERK_SECRET_KEY` が未設定です。
    </div>
  );
}
