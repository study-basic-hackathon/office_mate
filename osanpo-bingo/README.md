# 🌿 おさんぽビンゴ

AIが季節・テーマに合わせたビンゴカードを自動生成するおさんぽゲームアプリです。

## 技術スタック

| 役割 | 技術 |
|------|------|
| フロントエンド | React 18 + Vite |
| バックエンド API | Node.js + Express |
| DB / Realtime | Supabase (PostgreSQL) |
| ファイルストレージ | Supabase Storage |
| AI | Claude Haiku (Anthropic) |
| デプロイ | Render |

---

## ディレクトリ構成

```
osanpo-bingo/
├── frontend/              # React アプリ
│   ├── src/
│   │   ├── components/    # 再利用可能な UI コンポーネント
│   │   ├── hooks/         # カスタムフック（useRoom, usePhoto）
│   │   ├── lib/           # supabase / api / bingo ユーティリティ
│   │   ├── pages/         # ページコンポーネント
│   │   └── styles/        # グローバル CSS
│   ├── .env.example
│   └── package.json
│
├── server/                # Express API サーバー
│   ├── src/
│   │   ├── lib/claude.js  # Anthropic SDK ラッパー
│   │   └── routes/        # generate / regenerate エンドポイント
│   ├── .env.example
│   └── package.json
│
└── supabase_setup.sql     # テーブル・RLS・Storage バケット作成 SQL
```

---

## セットアップ手順

### 1. Supabase の準備

1. [supabase.com](https://supabase.com) でプロジェクトを作成
2. SQL Editor を開き `supabase_setup.sql` を実行
3. Project Settings → API で以下の値をメモ
   - Project URL
   - anon public key

### 2. バックエンドのセットアップ

```bash
cd server
cp .env.example .env
# .env の ANTHROPIC_API_KEY を設定（https://console.anthropic.com/）
npm install
npm run dev   # localhost:3001 で起動
```

### 3. フロントエンドのセットアップ

```bash
cd frontend
cp .env.example .env
# .env の VITE_SUPABASE_URL と VITE_SUPABASE_ANON_KEY を設定
npm install
npm run dev   # localhost:5173 で起動
```

---

## Render へのデプロイ

### バックエンド（Web Service）

1. Render で **New Web Service** を作成
2. リポジトリを接続 → Root Directory: `server`
3. Build Command: `npm install`
4. Start Command: `npm start`
5. Environment Variables に以下を設定:
   - `ANTHROPIC_API_KEY`
   - `FRONTEND_ORIGIN` = フロントエンドの URL（例: `https://osanpo-bingo.onrender.com`）

### フロントエンド（Static Site）

1. Render で **New Static Site** を作成
2. リポジトリを接続 → Root Directory: `frontend`
3. Build Command: `npm install && npm run build`
4. Publish Directory: `dist`
5. Environment Variables に以下を設定:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_API_BASE_URL` = バックエンドの URL（例: `https://osanpo-bingo-api.onrender.com`）

---

## 主な機能

- **AIビンゴ生成**: 季節（春夏秋冬/自動）× テーマ（8種＋カスタム）でビンゴカードを生成
- **5×5グリッド / 中央FREE**: 標準的なビンゴフォーマット
- **写真記録**: マスを開けるときにカメラで写真を撮って保存
- **1マス再生成**: 地域で見つからない項目を AI に差し替えてもらえる
- **ルーム共有**: 5文字コードで同行者と同じカードを共有・Realtime 同期
- **コレクション**: ビンゴ達成カードを自動保存・後から見返せる
- **前回の続き**: アプリを再起動しても進行中のゲームを復元できる
