# 私の競泳物語

学生競泳選手向けの目標達成シート Web アプリです。
過去の競泳経験を物語として振り返り、年間目標・月間目標・週次振り返りをつなげて管理できます。

## 技術構成

- Next.js 16 App Router
- TypeScript
- Tailwind CSS 4
- Replit Clerk Auth
- Replit Database (PostgreSQL)
- Drizzle ORM / drizzle-kit

## セットアップ

```bash
npm install
npm run db:migrate
npm run dev
```

ブラウザで `http://localhost:5000` を開いてください。

本番ビルド確認:

```bash
npm run build
npm run start -- -p 5000 -H 0.0.0.0
```

## Replit で必要な設定

### 1. Auth

- Replit の Auth を `Clerk Auth` にする
- Email / Password サインアップを有効化する
- メール確認を有効化する

### 2. Database

- Replit Database を有効化する
- `DATABASE_URL` が設定されていることを確認する

### 3. Secrets

- `ADMIN_EMAILS=admin1@example.com,admin2@example.com`
- `LLM_API_KEY` は任意
- Clerk のキーは Replit Auth 有効化時に注入される前提です

## アカウント作成

- 選手: `/register` から誰でも登録できます
- 管理者: `ADMIN_EMAILS` に入っているメールアドレスで登録すると自動で `admin` になります

固定の初期アカウントや固定パスワードはありません。

## 主な画面

- `/` トップページ
- `/login` 選手ログイン
- `/register` 選手登録
- `/mypage` 選手マイページ
- `/mypage/profile` プロフィール編集
- `/mypage/records` ベストタイム管理
- `/mypage/story` 私の競泳物語
- `/mypage/yearly-goals` 年間目標
- `/mypage/monthly-goals` 月間目標
- `/mypage/weekly-reviews` 週次振り返り
- `/mypage/public-goals` 公開申請
- `/admin/login` 管理者ログイン
- `/admin/dashboard` 管理者ダッシュボード
- `/admin/athletes` 選手一覧
- `/admin/public-goals` 公開申請管理
- `/goals` みんなの目標

## 環境変数

- `DATABASE_URL`: Replit Database の接続先
- `CLERK_PUBLISHABLE_KEY` または `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`
- `ADMIN_EMAILS`: 管理者にしたいメールアドレスをカンマ区切り
- `LLM_API_KEY`: AI アドバイス用 API キー
- `LLM_API_BASE_URL`: OpenAI 互換 API を使う場合のベース URL
- `LLM_MODEL`: AI アドバイス用モデル名

`LLM_API_KEY` が未設定のときは、AI ボタンを押しても固定メッセージを返します。

## 注意

- 公開ページに出るのは `ニックネーム / カテゴリ / 目標 / 行動目標 / 状態` のみです
- 本名、メールアドレス、生年月日、所属、ベストタイム詳細、競泳物語全文は公開しません
- `visibility=private` の内容は管理者画面でも本文を表示しません
- 開発環境と本番環境では Replit の Auth / Database を分けて運用してください
