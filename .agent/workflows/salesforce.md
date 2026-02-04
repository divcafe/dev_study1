---
description: Salesforce開発用の基本ワークフロー (Login, Deploy, Test, etc.)
---

# Salesforce Development Workflow

Salesforce開発における一般的なタスクを実行するワークフローです。
**前提**: `salesforce-app` ディレクトリで作業することを想定しています。

## 1. 組織へのログイン (Web認証)

Webブラウザを使用してSalesforce組織（Dev Hub, Scratch Org, Sandbox）にログインします。
初回セットアップ時はDevHubへのログインが必要です。

```bash
cd salesforce-app
sf org login web --set-default-dev-hub --alias devhub
```

## 2. スクラッチ組織の作成

デフォルトの定義ファイルを使用してスクラッチ組織を作成します。
`devhub` というエイリアスのDev Hub組織が認証済みである必要があります。

```bash
cd salesforce-app
sf org create scratch --target-dev-hub devhub --set-default --alias scratch-org --duration-days 30 --edition developer
```

## 3. ソースのデプロイ (Deploy/Push)

ローカルのソースコードをデフォルトの組織（スクラッチ組織等）にデプロイします。
スクラッチ組織を使用していて、ソース追跡が有効な場合は `project deploy start` で変更分をプッシュできます。

```bash
cd salesforce-app
sf project deploy start
```

## 4. ソースの取得 (Retrieve/Pull)

組織上の変更をローカルに取り込みます。

```bash
cd salesforce-app
sf project retrieve start
```

## 5. Apexテストの実行

```bash
cd salesforce-app
sf apex run test --code-coverage --result-format human
```

## 6. オープン

デフォルトの組織をブラウザで開きます。

```bash
cd salesforce-app
sf org open
```
