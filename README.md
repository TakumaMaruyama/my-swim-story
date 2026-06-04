# 私の競泳物語

学生競泳選手向けの目標達成シート Web アプリです。
過去の競泳経験を物語として振り返り、年間目標・月間目標・週次振り返りをつなげて管理できます。

## 技術構成

- Next.js 16 App Router
- TypeScript
- Tailwind CSS 4
- ローカル JSON ストレージ (`data/app-db.json`)

JSON への読み書きは `src/lib/storage.ts` と `src/lib/repository.ts` に寄せてあり、
将来的に Supabase / PostgreSQL へ置き換えやすい構成にしています。

## セットアップ

```bash
npm install
npm run dev
```

ブラウザで `http://localhost:5000` を開いてください。

本番ビルド確認:

```bash
npm run build
npm run start -- -p 5000 -H 0.0.0.0
```

## 初期アカウント

### 管理者

- email: `admin@example.com`
- password: `password`

### 選手

- email: `athlete@example.com`
- password: `password`

初回アクセス時に `data/app-db.json` が自動生成され、サンプルデータも入ります。

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

必須ではありません。

- `SESSION_SECRET`: セッション署名用の秘密値
- `LLM_API_KEY`: AI アドバイス用 API キー
- `LLM_API_BASE_URL`: OpenAI 互換 API を使う場合のベース URL
- `LLM_MODEL`: AI アドバイス用モデル名

`LLM_API_KEY` が未設定のときは、AI ボタンを押しても固定メッセージを返します。

## 注意

- 公開ページに出るのは `ニックネーム / カテゴリ / 目標 / 行動目標 / 状態` のみです
- 本名、メールアドレス、生年月日、所属、ベストタイム詳細、競泳物語全文は公開しません
- データは JSON 保存なので、単一インスタンスでの MVP 運用を想定しています
