# Louge - あなただけの人生に、あなただけのストーリーを

AI「Louge」との対話を通じて、日々の感情を「消費される記録」から「人生の資産（物語）」へ昇華させるWebアプリケーション。

## 🚀 完全無料で本番運用可能

このアプリは以下の無料サービスを使用して完全無料で運用できます：

- **Vercel**: フロントエンド・バックエンドホスティング（無料枠）
- **Supabase**: データベース・認証（無料枠: 500MB DB, 50,000 月間アクティブユーザー）
- **Anthropic Claude API**: 従量課金（$5の無料クレジット付き）

## 📋 前提条件

- Node.js 18以上
- Supabaseアカウント
- Anthropic APIキー

## 🔧 セットアップ手順

### 1. Supabaseプロジェクト作成

1. [Supabase](https://supabase.com)でアカウント作成
2. 新しいプロジェクトを作成
3. プロジェクト設定から以下を取得:
   - `Project URL`
   - `anon public key`

### 2. データベースセットアップ

1. Supabaseダッシュボードの「SQL Editor」を開く
2. `supabase/migrations/001_initial_schema.sql` の内容を貼り付けて実行
3. テーブルとRLS（Row Level Security）が作成されます

### 3. Google OAuth設定（オプション）

1. Supabaseダッシュボード → Authentication → Providers
2. Googleを有効化
3. [Google Cloud Console](https://console.cloud.google.com)で:
   - 新しいプロジェクト作成
   - OAuth 2.0 クライアントID作成
   - 承認済みリダイレクトURIに追加: `https://[your-project-ref].supabase.co/auth/v1/callback`
4. クライアントIDとシークレットをSupabaseに設定

### 4. Anthropic APIキー取得

1. [Anthropic Console](https://console.anthropic.com)でアカウント作成
2. API Keysページで新しいキーを作成
3. $5の無料クレジットが付与されます

### 5. 環境変数設定

`.env.local.example` を `.env.local` にコピーして編集:

```bash
cp .env.local.example .env.local
```

`.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
ANTHROPIC_API_KEY=sk-ant-your-api-key
```

### 6. 依存関係インストール

```bash
npm install
```

### 7. 開発サーバー起動

```bash
npm run dev
```

ブラウザで http://localhost:3000 を開く

## 🌐 本番デプロイ（Vercel）

### 1. Vercelアカウント作成

[Vercel](https://vercel.com)で無料アカウント作成

### 2. プロジェクトをGitHubにプッシュ

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin your-repo-url
git push -u origin main
```

### 3. Vercelでインポート

1. Vercelダッシュボードで「New Project」
2. GitHubリポジトリを選択
3. 環境変数を設定:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `ANTHROPIC_API_KEY`
4. 「Deploy」クリック

### 4. カスタムドメイン設定（オプション）

Vercelダッシュボード → Settings → Domains

## 📊 データベーススキーマ

### テーブル構成

- **profiles**: ユーザープロファイル
- **conversations**: 対話セッション
- **narratives**: 生成された物語
- **value_tags**: 価値観タグ
- **narrative_tags**: 物語とタグの関連

### Row Level Security (RLS)

全テーブルでRLSが有効化されており、ユーザーは自分のデータのみアクセス可能です。

## 💰 コスト試算（月額）

### 無料で運用可能な範囲

- **Vercel**: 無料プラン
  - 100GB帯域幅/月
  - サーバーレス関数実行時間: 100GB-時間
  
- **Supabase**: 無料プラン
  - データベース: 500MB
  - ストレージ: 1GB
  - 月間アクティブユーザー: 50,000

- **Claude API**: 従量課金
  - Sonnet 4: $3/百万入力トークン、$15/百万出力トークン
  - 1日1セッション（約2,000トークン）× 30日 = 約$1.80/月
  - 初回$5クレジット → 約2.5ヶ月無料

**合計: 実質0円/月（無料クレジット期間中）**

## 🎯 主な機能

### ✅ 実装済み

- ✅ Google/Email認証
- ✅ AIチャット対話
- ✅ ナラティブ自動生成
- ✅ 感情スコア可視化
- ✅ 価値観タグ抽出
- ✅ アーカイブ表示
- ✅ レスポンシブデザイン

### 🚧 今後の拡張

- [ ] 感情ジャーニーグラフ（Recharts）
- [ ] 音声入力対応
- [ ] PDFエクスポート
- [ ] 価値観マップ可視化
- [ ] 週次・月次サマリー

## 🔒 セキュリティ

- Supabase RLSによるデータアクセス制御
- HTTPS通信（Vercel自動対応）
- 環境変数による機密情報管理
- CORS設定

## 📝 開発者向け

### ディレクトリ構成

```
louge-app/
├── app/
│   ├── api/          # バックエンドAPI
│   ├── auth/         # 認証ページ
│   ├── chat/         # メインアプリ
│   └── page.tsx      # ランディングページ
├── lib/
│   └── supabase.ts   # Supabaseクライアント
├── supabase/
│   └── migrations/   # DBマイグレーション
└── package.json
```

### APIエンドポイント

- `POST /api/chat`: Claude APIとの対話
- `POST /api/narrative`: ナラティブ生成・保存

## 🆘 トラブルシューティング

### データベース接続エラー

- Supabase URLとキーが正しいか確認
- RLSポリシーが正しく設定されているか確認

### Claude API エラー

- APIキーが有効か確認
- クレジット残高を確認
- レート制限に達していないか確認

### ビルドエラー

```bash
rm -rf .next node_modules
npm install
npm run build
```

## 📄 ライセンス

MIT

## 🤝 コントリビューション

Issue、Pull Request歓迎です！

## 📧 サポート

質問や不具合報告は [GitHub Issues](https://github.com/your-repo/issues) へ
