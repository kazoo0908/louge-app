# Lougeデプロイメントガイド

## 🚀 完全無料デプロイ手順（所要時間: 30分）

### ステップ1: Supabaseセットアップ (10分)

1. **アカウント作成**
   - https://supabase.com にアクセス
   - 「Start your project」をクリック
   - GitHubアカウントでサインアップ（推奨）

2. **新しいプロジェクト作成**
   - 「New project」をクリック
   - Organization: 自動作成される
   - Name: `louge-production`（任意）
   - Database Password: 強力なパスワードを生成（保存必須）
   - Region: `Northeast Asia (Tokyo)` を選択
   - Pricing Plan: `Free` を選択
   - 「Create new project」をクリック

3. **プロジェクト情報取得**
   - プロジェクト作成完了まで2-3分待機
   - Settings → API を開く
   - 以下をメモ:
     ```
     Project URL: https://xxxxx.supabase.co
     anon public key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
     ```

4. **データベーススキーマ作成**
   - 左メニュー → SQL Editor
   - 「New query」をクリック
   - `supabase/migrations/001_initial_schema.sql` の内容を全てコピペ
   - 「Run」をクリック（成功メッセージ確認）

5. **Google OAuth設定（オプション）**
   - Authentication → Providers → Google
   - 「Enabled」をON
   - Google Cloud Consoleで:
     - https://console.cloud.google.com
     - 新しいプロジェクト作成
     - APIs & Services → Credentials
     - 「CREATE CREDENTIALS」→「OAuth client ID」
     - Application type: Web application
     - Authorized redirect URIs: `https://xxxxx.supabase.co/auth/v1/callback`
     - Client IDとClient secretをコピー
   - SupabaseにClient IDとsecretを貼り付け
   - 「Save」

### ステップ2: Anthropic APIキー取得 (5分)

1. **アカウント作成**
   - https://console.anthropic.com にアクセス
   - 「Sign Up」でアカウント作成
   - メール確認

2. **APIキー作成**
   - ログイン後、API Keys → 「Create Key」
   - Name: `louge-production`
   - 生成されたキーをコピー（`sk-ant-...`で始まる）
   - **重要**: このキーは二度と表示されないので必ず保存

3. **無料クレジット確認**
   - Billing → Overview
   - $5の無料クレジットが付与されていることを確認

### ステップ3: Vercelデプロイ (15分)

1. **GitHubリポジトリ作成**
   - https://github.com/new
   - Repository name: `louge-app`
   - Private/Public: お好みで
   - 「Create repository」

2. **コードをプッシュ**
   ```bash
   cd louge-app
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/your-username/louge-app.git
   git push -u origin main
   ```

3. **Vercelアカウント作成**
   - https://vercel.com/signup
   - 「Continue with GitHub」でサインアップ

4. **プロジェクトインポート**
   - 「Add New...」→「Project」
   - GitHubリポジトリ一覧から `louge-app` を選択
   - 「Import」をクリック

5. **環境変数設定**
   - 「Environment Variables」セクションを展開
   - 以下を追加:
   
   | Name | Value |
   |------|-------|
   | `NEXT_PUBLIC_SUPABASE_URL` | `https://xxxxx.supabase.co` |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` |
   | `ANTHROPIC_API_KEY` | `sk-ant-...` |

6. **デプロイ実行**
   - 「Deploy」をクリック
   - ビルド完了まで2-3分待機
   - 「Congratulations!」画面が表示されたら成功

7. **本番URLアクセス**
   - `https://louge-app.vercel.app` のようなURLが発行される
   - アクセスしてアプリが動作することを確認

### ステップ4: 動作確認 (5分)

1. **新規登録テスト**
   - 本番URLにアクセス
   - 「新規登録」をクリック
   - メールアドレスとパスワードで登録
   - ログインできることを確認

2. **対話テスト**
   - Lougeからの挨拶が表示されることを確認
   - メッセージを送信してレスポンスを確認
   - 3-5往復対話
   - 「今日の対話を終える」をクリック
   - ナラティブが生成されることを確認

3. **アーカイブテスト**
   - 「物語のアーカイブ」タブをクリック
   - 生成された物語が表示されることを確認

## 🎉 デプロイ完了！

これであなたのLougeアプリが完全無料で本番運用可能です。

## 📊 無料枠の制限

### Vercel Free Tier
- ✅ 100GB帯域幅/月（約10万PV相当）
- ✅ サーバーレス関数: 100GB-時間/月
- ✅ 自動HTTPS
- ✅ カスタムドメイン可能

### Supabase Free Tier
- ✅ データベース: 500MB（約5万件の物語相当）
- ✅ 月間アクティブユーザー: 50,000
- ✅ 認証: 無制限
- ✅ Row Level Security

### Claude API
- 💰 従量課金（Sonnet 4）
- 入力: $3/百万トークン
- 出力: $15/百万トークン
- 1セッション約2,000トークン = $0.06
- $5クレジット = 約80セッション

## 💡 コスト最適化Tips

1. **Claude APIの使用を最小限に**
   - ユーザーに「対話は3-5往復推奨」と明示
   - 長すぎる対話は自動終了

2. **データベースサイズ管理**
   - 古い会話ログは定期的に削除
   - 画像は将来的にCloudflare R2（無料枠10GB）

3. **Vercel帯域幅最適化**
   - 画像はWebP形式で圧縮
   - Next.js Image Optimizationを活用

## 🚨 トラブルシューティング

### デプロイエラー

**Error: Build failed**
```bash
# ローカルでビルドテスト
npm run build

# エラー箇所を修正してプッシュ
git add .
git commit -m "Fix build error"
git push
```

**Error: Environment variables not set**
- Vercelダッシュボード → Settings → Environment Variables
- 変数が正しく設定されているか確認
- 「Redeploy」をクリック

### データベース接続エラー

**Error: relation "profiles" does not exist**
- Supabase SQL Editorでマイグレーションスクリプトを再実行
- RLSポリシーが有効か確認

### Claude API エラー

**Error: Invalid API key**
- APIキーが正しくコピーされているか確認
- Vercelの環境変数を確認

**Error: Rate limit exceeded**
- Anthropic Consoleでレート制限を確認
- 有料プランへのアップグレードを検討

## 🔄 継続的デプロイ

Vercelは自動的にGitHubと連携しています。

```bash
# コード変更
git add .
git commit -m "Add new feature"
git push

# 自動的にVercelで再デプロイされます
```

## 📈 モニタリング

### Vercel Analytics（無料）
- Dashboard → Analytics
- ページビュー、ユニークユーザー、レスポンスタイムを確認

### Supabase Logs（無料）
- Database → Logs
- クエリパフォーマンス、エラーログを確認

### Claude API Usage
- Anthropic Console → Usage
- トークン消費量、コストを確認

## 🎯 次のステップ

1. カスタムドメイン設定（Vercel）
2. Google Analytics追加
3. エラーモニタリング（Sentry無料枠）
4. バックアップ設定（Supabase）

おめでとうございます！Lougeアプリの本番運用を開始できました 🎉
