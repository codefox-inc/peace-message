# Peace Message - 平和のメッセージ

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-000000?style=flat-square&logo=next.js&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-20232A?style=flat-square&logo=react&logoColor=61DAFB)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Cloudflare](https://img.shields.io/badge/Cloudflare-F38020?style=flat-square&logo=cloudflare&logoColor=white)](https://workers.cloudflare.com/)

**世界に平和のメッセージを。ゼロ知識証明で所有権を守る。**

多言語対応の平和メッセージ投稿アプリケーション。パスフレーズによる所有権認証とゼロ知識証明による検証機能を搭載。

## 🎯 プロジェクト概要

平和への想いを世界に向けて発信し、ゼロ知識証明技術によってメッセージの所有権を証明できるアプリケーションです。

### 主な特徴
- **6言語対応**: 日本語・英語・中国語・韓国語・フランス語・ドイツ語
- **ゼロ知識証明**: メッセージ所有権の安全な証明
- **モノクローム設計**: 洗練された白・黒・グレーのデザイン
- **レスポンシブ対応**: デスクトップ・モバイル最適化

## ✨ アプリケーションの特徴

1. **メッセージ投稿システム**  
   パスフレーズ認証による安全なメッセージ投稿

2. **ゼロ知識証明生成**  
   暗号学的手法による所有権証明の生成

3. **多言語インターフェース**  
   グローバルユーザーに対応した6言語サポート

4. **リアルタイム更新**  
   新しいメッセージの自動表示

## 🚀 クイックスタート

### 開発環境のセットアップ

```bash
# リポジトリのクローンと依存関係インストール
git clone <repository-url>
cd peace-message
npm install

# 開発サーバーの起動
npm run dev
```

開発サーバーが起動したら、[http://localhost:3000](http://localhost:3000) でアプリケーションを確認できます。

## 🛠 技術スタック

### 必要な環境
- Node.js 18.17+ (推奨: 20.x 以上)
- npm 9.0+ または yarn/pnpm

### フロントエンド
- **Next.js 15.1.6** - App Router、Server Components
- **React 19.0** - UIライブラリ
- **TypeScript 5.x** - 型安全性
- **Tailwind CSS 3.4** - スタイリング
- **Radix UI** - アクセシブルUIコンポーネント
- **Framer Motion** - アニメーション効果

### フォーム・バリデーション
- **React Hook Form** - フォーム管理
- **Zod** - スキーマバリデーション
- **@hookform/resolvers** - バリデーター統合

### 状態管理・ユーティリティ
- **Zustand** - 軽量状態管理
- **class-variance-authority** - スタイルバリアント管理
- **clsx & tailwind-merge** - クラス名ユーティリティ

### インフラ
- **Cloudflare Workers** - エッジ配信 (OpenNext.js)

## 📋 開発コマンド

```bash
npm run dev           # 開発サーバー起動 (Turbopack)
npm run build         # プロダクションビルド
npm run start         # プロダクションサーバー起動
npm run lint          # ESLintチェック
npm run cf:build      # Cloudflare Workers用ビルド
npm run cf:deploy     # ビルド&デプロイ
```

## 🏗 プロジェクト構成

```
📂 src/
├── 📂 app/                    # Next.js App Router
│   ├── 📄 page.tsx            # メインページ
│   ├── 📄 layout.tsx          # ルートレイアウト
│   └── 📄 globals.css         # グローバルスタイル
├── 📂 components/             # UIコンポーネント
│   ├── 📂 ui/                 # 基礎UIコンポーネント
│   │   ├── 📄 button.tsx      # ボタンコンポーネント
│   │   ├── 📄 card.tsx        # カードコンポーネント
│   │   ├── 📄 dialog.tsx      # ダイアログコンポーネント
│   │   ├── 📄 input.tsx       # 入力フィールド
│   │   └── 📄 textarea.tsx    # テキストエリア
│   ├── 📄 waiting-screen.tsx  # 待機画面・メッセージフィード
│   ├── 📄 message-post-dialog.tsx # メッセージ投稿ダイアログ
│   ├── 📄 proof-generation-dialog.tsx # 証明生成ダイアログ
│   └── 📄 language-switcher.tsx # 言語切り替え
├── 📂 lib/                    # ユーティリティ
│   ├── 📄 i18n.ts            # 国際化設定
│   ├── 📄 mock-data.ts       # モックデータ
│   └── 📄 utils.ts           # 共通関数
├── 📂 hooks/                  # カスタムフック
│   └── 📄 use-language.ts     # 言語管理フック
└── 📂 types/                  # TypeScript型定義
    └── 📄 peace-message.ts    # メッセージ型定義

📂 public/                     # 静的ファイル
└── 📄 next.svg               # Next.jsロゴ

📂 設定ファイル
├── 📄 wrangler.toml          # Cloudflare Workers設定
├── 📄 open-next.config.ts    # OpenNext.js設定
├── 📄 tailwind.config.ts     # Tailwind CSS設定
└── 📄 next.config.ts         # Next.js設定
```

## 🌍 多言語対応

### サポート言語
1. **日本語** (ja) - 🇯🇵 日本語
2. **英語** (en) - 🇺🇸 English  
3. **中国語** (zh) - 🇨🇳 中文
4. **韓国語** (ko) - 🇰🇷 한국어
5. **フランス語** (fr) - 🇫🇷 Français
6. **ドイツ語** (de) - 🇩🇪 Deutsch

### 翻訳管理
- `src/lib/i18n.ts` で翻訳データを管理
- `useLanguage` フックによる動的言語切り替え
- フォント最適化（日本語・中国語・韓国語対応）

## 🛡️ ゼロ知識証明機能

### プルーフ生成フロー
1. メッセージ投稿時にパスフレーズを設定
2. 証明生成時に同じパスフレーズを入力
3. ゼロ知識証明を生成してQRコード表示
4. 第三者がメッセージ所有権を検証可能

### セキュリティ特徴
- パスフレーズの暗号学的ハッシュ化
- プライバシー保護（パスフレーズ非開示）
- 改ざん検知機能

## 🎨 デザインシステム

### カラーパレット
- **プライマリ**: 純白 (#FFFFFF) / 純黒 (#000000)
- **セカンダリ**: グレースケール (50-900)
- **アクセント**: なし（モノクローム徹底）

### デザイン原則
- **ミニマル**: 余計な装飾を排除
- **高級感**: 白・黒・グレーによる洗練
- **可読性**: コントラスト最適化
- **アクセシビリティ**: WCAG 2.1準拠

## 🚀 デプロイ

### Cloudflare Workers (OpenNext.js)

```bash
# ワンコマンドデプロイ
npm run cf:deploy

# またはステップ別
npm run cf:build      # ビルド
npx wrangler deploy   # デプロイ
```

### 事前準備
```bash
# Wrangler CLI インストール
npm install -g wrangler

# Cloudflare認証
wrangler login
```

### 設定ファイル
- `wrangler.toml` - Cloudflare Workers設定
- `open-next.config.ts` - OpenNext.js設定（R2キャッシュ統合）

## 🤝 開発フロー

1. `main` ブランチから feature ブランチを作成
2. 変更を実装しコミット
3. Pull Request を作成
4. レビュー後、`main` にマージ
5. Cloudflare Workers に自動デプロイ

---

**© 2025 Peace Message. All rights reserved.**
