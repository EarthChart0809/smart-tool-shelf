# Smart Tool Shelf

スマートツール棚プロジェクト。

リモートで工具の貸出管理を行う **Webアプリ（Next.js / Prisma / Supabase）** と、工具の物理制御を行う **ESP32ファームウェア（PlatformIO）** を含みます。

---

## 目次

- [Smart Tool Shelf](#smart-tool-shelf)
  - [目次](#目次)
  - [概要](#概要)
    - [主な機能](#主な機能)
  - [含まれるもの](#含まれるもの)
    - [PBL2\_web](#pbl2_web)
    - [PBL2\_esp32](#pbl2_esp32)
    - [データベース](#データベース)
- [デザイン担当者向け開発ルール](#デザイン担当者向け開発ルール)
  - [⚠️ 重要](#️-重要)
- [編集してよいファイル](#編集してよいファイル)
  - [グローバルデザイン](#グローバルデザイン)
  - [ルートレイアウト](#ルートレイアウト)
  - [トップページ](#トップページ)
- [共通コンポーネント](#共通コンポーネント)
- [管理画面](#管理画面)
    - [管理画面レイアウト](#管理画面レイアウト)
    - [管理画面ヘッダー](#管理画面ヘッダー)
    - [管理者ログイン](#管理者ログイン)
    - [管理者サインアップ](#管理者サインアップ)
    - [工具一覧](#工具一覧)
    - [ユーザー一覧](#ユーザー一覧)
    - [ユーザー作成](#ユーザー作成)
- [その他のUIページ](#その他のuiページ)
  - [履歴ページ](#履歴ページ)
  - [QRページ](#qrページ)
- [AuthProvider](#authprovider)
- [設定ファイル](#設定ファイル)
  - [PostCSS](#postcss)
  - [Next.js](#nextjs)
- [公開アセット](#公開アセット)
- [編集禁止エリア](#編集禁止エリア)
  - [API](#api)
  - [Prisma](#prisma)
  - [Supabase関連](#supabase関連)
  - [ESP32](#esp32)
  - [環境変数](#環境変数)
- [変更範囲まとめ](#変更範囲まとめ)
- [GitHubからのClone方法](#githubからのclone方法)
  - [① GitHubのリポジトリを開く](#-githubのリポジトリを開く)
  - [② VS Codeを開く](#-vs-codeを開く)
  - [③ Clone Repositoryを選択](#-clone-repositoryを選択)
  - [④ GitHubのURLを入力](#-githubのurlを入力)
  - [⑤ 保存場所を選択](#-保存場所を選択)
  - [⑥ プロジェクトを開く](#-プロジェクトを開く)
  - [⑦ Clone完了](#-clone完了)
  - [⑧ 必要なパッケージをインストール](#-必要なパッケージをインストール)
  - [⑨ 開発サーバーを起動](#-開発サーバーを起動)
- [デザイン担当のGit運用](#デザイン担当のgit運用)
  - [作業](#作業)
  - [Commit](#commit)
  - [Push](#push)
- [⚠️ 機能コードを変更してしまった場合](#️-機能コードを変更してしまった場合)
- [デザイン担当のゴール](#デザイン担当のゴール)

---

## 概要

このリポジトリは、WebアプリケーションとESP32を連携させたスマートツール棚システムです。

Web側では、工具の貸出・返却や在庫管理、ユーザー認証などを行います。

ESP32側では、サーボモーターなどの物理デバイスを制御し、Webアプリからの指示に応じて工具棚のロック・アンロックを行います。

### 主な機能

- 管理者ログイン
- 社員登録
- QRコード発行
- QRコードによるログイン
- 工具一覧表示
- 工具の在庫管理
- 工具の貸出
- 工具の返却
- 現在貸出中の工具一覧
- 貸出・返却履歴管理
- ESP32による工具棚の開錠
- WebアプリとESP32の連携

---

## 含まれるもの

### PBL2_web

Next.jsを使用したWebアプリケーションです。

- Next.js
- TypeScript
- Prisma
- Supabase
- ユーザー認証
- 工具管理
- 貸出・返却管理
- QRコード機能
- 管理者機能

### PBL2_esp32

ESP32用のPlatformIOプロジェクトです。

- ESP32
- PlatformIO
- サーボモーター制御
- Wi-Fi通信
- WebアプリとのAPI連携

### データベース

Prismaを使用してデータベースを管理しています。

- Prisma Schema
- Prisma Migration
- 生成済みPrisma Client

---


# デザイン担当者向け開発ルール

このプロジェクトでは、Webアプリの**UI・デザインを担当するメンバー**は、基本的に以下のファイルのみ編集してください。

## ⚠️ 重要

> **デザイン担当者は、以下に記載されているファイル以外を原則として編集しないでください。**

特に以下の機能に関係するコードは変更禁止です。

* データベース
* Prisma
* Supabase
* API
* 認証処理
* 貸出・返却処理
* QR認証・QR処理
* ESP32との通信
* 在庫管理ロジック
* APIルート
* Middleware
* 環境変数
* パッケージ構成

**「見た目を変更するために必要だから」という理由で、上記の処理を変更しないでください。**

変更が必要な場合は、担当者に相談してください。

---

# 編集してよいファイル

以下はデザイン担当者が編集してよいファイルです。

## グローバルデザイン

```text
PBL2_web/app/globals.css
```

サイト全体のCSSを変更できます。

* 色
* フォント
* サイズ
* 余白
* ボタン
* アニメーション
* レスポンシブ対応
* 共通スタイル

---

## ルートレイアウト

```text
PBL2_web/app/layout.tsx
```

サイト全体のレイアウトを変更できます。

ただし、以下のような機能処理は変更しないでください。

```text
認証処理
Provider
データ取得
環境設定
```

基本的にはHTML構造やUIに関係する部分のみ変更してください。

---

## トップページ

```text
PBL2_web/app/page.tsx
```

トップページのUIを変更できます。

---

# 共通コンポーネント

以下のコンポーネントはUI変更のために編集して構いません。

```text
PBL2_web/components/Header.tsx
PBL2_web/components/ToolCard.tsx
PBL2_web/components/QRScanner.tsx
PBL2_web/components/AdminLogoutButton.tsx
PBL2_web/components/AdminHeader.tsx
```

ただし、コンポーネント内にある以下の処理は変更しないでください。

* API通信
* 認証処理
* データ取得
* データ更新
* QRコード読み取り処理
* ESP32通信
* ログアウト処理

例えば、

```tsx
// UI変更OK
<button className="...">
  ログアウト
</button>
```

のような部分は変更して構いません。

一方で、

```tsx
// 機能ロジック
await supabase.auth.signOut()
```

などの処理は、基本的に変更しないでください。

---

# 管理画面

以下の管理画面はUI変更を目的とする場合のみ編集可能です。

### 管理画面レイアウト

```text
PBL2_web/app/admin/layout.tsx
```

### 管理画面ヘッダー

```text
PBL2_web/components/AdminHeader.tsx
```

### 管理者ログイン

```text
PBL2_web/app/admin/login/page.tsx
```

### 管理者サインアップ

```text
PBL2_web/app/admin/signup/page.tsx
```

### 工具一覧

```text
PBL2_web/app/admin/tools/page.tsx
```

### ユーザー一覧

```text
PBL2_web/app/admin/users/page.tsx
```

### ユーザー作成

```text
PBL2_web/app/admin/users/new/page.tsx
```

これらのページでは、

* レイアウト
* CSS
* カード
* ボタン
* 表
* フォーム
* 色
* アイコン
* 余白
* レスポンシブ対応

などのUIを変更して構いません。

ただし、既存の機能処理は変更しないでください。

---

# その他のUIページ

## 履歴ページ

```text
PBL2_web/app/history/page.tsx
```

UI変更可能。

---

## QRページ

```text
PBL2_web/app/qr/page.tsx
```

QR関連ページのUI変更可能。

QR生成・認証などの機能処理は変更しないでください。

---

# AuthProvider

```text
PBL2_web/components/AuthProvider.tsx
```

このファイルは**原則として触らないでください。**

UIに直接関係する部分を変更する必要がある場合のみ、担当者に確認してください。

認証ロジックの変更は禁止です。

---

# 設定ファイル

以下のファイルは原則変更禁止です。

## PostCSS

```text
PBL2_web/postcss.config.mjs
```

## Next.js

```text
PBL2_web/next.config.ts
```

これらはビルドやアプリケーションの動作に影響するため、デザイン目的で変更しないでください。

変更が必要な場合は担当者に相談してください。

---

# 公開アセット

以下のファイルは画像・アイコンなどのデザイン変更に使用できます。

```text
PBL2_web/public/
```

現在の公開アセット例：

```text
next.svg
globe.svg
file.svg
vercel.svg
window.svg
```

不要なアセットを削除する場合は、コード内で使用されていないことを確認してください。

新しい画像・アイコンを追加する場合は、可能な限り `public/` に配置してください。

---

# 編集禁止エリア

デザイン担当者は、以下のディレクトリ・ファイルを変更しないでください。

## API

```text
PBL2_web/app/api/
```

---

## Prisma

```text
PBL2_web/prisma/
```

特に、

```text
schema.prisma
migrations/
```

は変更禁止です。

---

## Supabase関連

```text
PBL2_web/lib/
```

Supabaseの接続処理やデータベース処理が含まれているため、原則変更禁止です。

---

## ESP32

```text
PBL2_esp32/
```

ESP32側のプログラムはデザイン担当者は変更しません。

特に、

```text
main.cpp
FS90R.cpp
platformio.ini
secrets.h
```

などは変更禁止です。

---

## 環境変数

以下は絶対に変更・コミットしないでください。

```text
.env
.env.local
.env.production
```

---

# 変更範囲まとめ

| ファイル / ディレクトリ                      |   デザイン担当  |
| ---------------------------------- | :-------: |
| `app/globals.css`                  |   ✅ 編集OK  |
| `app/layout.tsx`                   | ⚠️ UI部分のみ |
| `app/page.tsx`                     |   ✅ 編集OK  |
| `components/Header.tsx`            | ⚠️ UI部分のみ |
| `components/ToolCard.tsx`          | ⚠️ UI部分のみ |
| `components/QRScanner.tsx`         | ⚠️ UI部分のみ |
| `components/AdminLogoutButton.tsx` | ⚠️ UI部分のみ |
| `components/AdminHeader.tsx`       | ⚠️ UI部分のみ |
| `app/admin/layout.tsx`             | ⚠️ UI部分のみ |
| `app/admin/login/page.tsx`         | ⚠️ UI部分のみ |
| `app/admin/signup/page.tsx`        | ⚠️ UI部分のみ |
| `app/admin/tools/page.tsx`         | ⚠️ UI部分のみ |
| `app/admin/users/page.tsx`         | ⚠️ UI部分のみ |
| `app/admin/users/new/page.tsx`     | ⚠️ UI部分のみ |
| `app/history/page.tsx`             | ⚠️ UI部分のみ |
| `app/qr/page.tsx`                  | ⚠️ UI部分のみ |
| `components/AuthProvider.tsx`      |   ❌ 原則禁止  |
| `next.config.ts`                   |    ❌ 禁止   |
| `postcss.config.mjs`               |    ❌ 禁止   |
| `app/api/`                         |    ❌ 禁止   |
| `prisma/`                          |    ❌ 禁止   |
| `lib/`                             |   ❌ 原則禁止  |
| `PBL2_esp32/`                      |    ❌ 禁止   |
| `.env`                             |   ❌ 絶対禁止  |

---

# GitHubからのClone方法

初めて開発に参加する場合は、まずGitHubからプロジェクトを自分のPCにCloneします。

## ① GitHubのリポジトリを開く

GitHubで **Smart-Tool-Shelf-App** のリポジトリを開きます。

画面上部にある

```text
Code
```

をクリックします。

その後、

```text
HTTPS
```

を選択し、表示されたURLをコピーします。

例：

```text
https://github.com/ユーザー名/Smart-Tool-Shelf-App.git
```

---

## ② VS Codeを開く

VS Codeを起動します。

画面上部のメニューから、

```text
表示 → コマンドパレット
```

を開きます。

または、ショートカット：

```text
Ctrl + Shift + P
```

を押します。

---

## ③ Clone Repositoryを選択

コマンドパレットに、

```text
Git: Clone
```

と入力します。

表示された

```text
Git: Clone
```

を選択してください。

---

## ④ GitHubのURLを入力

先ほどGitHubからコピーしたURLを貼り付けます。

```text
https://github.com/EarthChart0809/smart-tool-shelf.git
```

Enterを押します。

---

## ⑤ 保存場所を選択

プロジェクトを保存したいフォルダを選択します。

例：

```text
C:\Users\自分のユーザー名\Documents\GitHub
```

Cloneが開始されます。

---

## ⑥ プロジェクトを開く

Cloneが完了すると、

```text
Open
```

と表示されるので、クリックします。

または、VS Codeから

```text
ファイル → フォルダーを開く
```

を選択して、

```text
Smart-Tool-Shelf-App
```

フォルダを開いてください。

---

## ⑦ Clone完了

VS Codeで以下のような構成が表示されればClone完了です。

```text
Smart-Tool-Shelf-App
├── PBL2_web
├── PBL2_esp32
├── README.md
├── .gitignore
└── ...
```

この後、**必ず `main` から自分の作業用Branchを作成してから作業してください。**

> ⚠️ `main` ブランチを直接編集しないでください。
---

## ⑧ 必要なパッケージをインストール

Cloneしただけでは、Next.jsなどの必要なパッケージはインストールされていません。

VS Codeのターミナルで `PBL2_web` フォルダに移動します。

```bash
cd PBL2_web
```

その後、以下を実行してください。

```bash
npm install
```

これで、このプロジェクトに必要なパッケージがまとめてインストールされます。

---

## ⑨ 開発サーバーを起動

インストールが完了したら、

```bash
npm run dev
```

を実行します。

ブラウザで以下を開いてください。

```text
http://localhost:3000
```

Webアプリが表示されれば、開発環境の準備完了です。

---

# デザイン担当のGit運用

デザイン担当者も必ず自分のBranchを作成してください。

```bash
git switch main
git pull origin main
git switch -c design/作業内容
```

例：

```bash
git switch -c design/redesign-admin
```

---

## 作業

UIを変更します。

```bash
npm run dev
```

ブラウザで確認：

```text
http://localhost:3000
```

---

## Commit
VScodeのソース管理機能でも作業可能。

```bash
git add .
git commit -m "design: 管理画面のUIを変更"
```

---

## Push
VScodeのソース管理機能でも作業可能。

```bash
git push -u origin design/redesign-admin
```


---

# ⚠️ 機能コードを変更してしまった場合

デザイン変更中に、

```text
APIを変更したい
DBを変更したい
認証処理を変更したい
データ取得方法を変更したい
新しいライブラリを追加したい
```

などの必要が出た場合は、**自分で変更せず担当者に相談してください。**

デザイン担当者の役割は、

> **既存の機能を維持したまま、Webアプリの見た目・使いやすさを改善すること**

です。

---

# デザイン担当のゴール

デザイン担当者は、以下を中心に改善してください。

* UIデザイン
* レイアウト
* 色
* フォント
* ボタン
* カード
* ナビゲーション
* フォーム
* アイコン
* アニメーション
* レスポンシブ対応
* スマートフォン表示
* PC表示
* ユーザビリティ

**機能を壊さず、見た目と使いやすさを改善することを目標とします。**
