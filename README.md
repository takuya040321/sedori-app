# ShopScraper - 商品管理システム

オンラインショップの商品情報を効率的に管理し、Amazon販売における利益計算を自動化するシステムです。

## 🚀 機能

- **商品情報スクレイピング**: DHC・VT Cosmetics公式サイトから自動取得
- **ASIN管理**: Amazon商品情報の紐付けと利益計算
- **ショップ別価格計算**: VT（400円引き）、DHC（20%+ユーザー設定割引）
- **リアルタイムダッシュボード**: KPI表示とアクティビティ監視

## 🔧 プロキシ設定

### 環境変数設定

`.env.local` ファイルを作成し、以下の設定を行ってください：

```bash
# プロキシを使用する場合
USE_PROXY=true
PROXY_SERVER=http://150.61.8.70:10080
PROXY_USER=your_username
PROXY_PASS=your_password

# プロキシを使用しない場合（開発時など）
USE_PROXY=false
```

### プロキシ切り替え方法

1. **プロキシ有効化**:
   ```bash
   USE_PROXY=true
   ```

2. **プロキシ無効化**:
   ```bash
   USE_PROXY=false
   ```

3. **設定変更後**: サーバーを再起動してください
   ```bash
   npm run dev
   ```

### プロキシ状態確認

- 各ショップページでプロキシ状態インジケーターを確認
- 接続テスト機能で現在のIP・接続状態を確認
- API エンドポイント: `/api/proxy-status`

## 📦 セットアップ

```bash
# 依存関係インストール
npm install

# 環境変数設定
cp .env.example .env.local
# .env.local を編集してプロキシ設定を行う

# 開発サーバー起動
npm run dev
```

## 🛠️ 開発

### プロキシなしでの開発

開発時にプロキシを使用したくない場合：

```bash
# .env.local
USE_PROXY=false
```

### プロキシありでの本番環境

本番環境やプロキシが必要な環境：

```bash
# .env.local
USE_PROXY=true
PROXY_SERVER=http://your-proxy-server:port
PROXY_USER=your_username
PROXY_PASS=your_password
```

## 📊 利益計算

### VT Cosmetics
- 価格から400円を差し引いた金額で利益計算
- セール価格がある場合はセール価格から400円引き

### DHC
- 基本20%割引 + ユーザー設定割引（0-50%）
- 例: セール価格2,200円 → 20%+10% = 30%割引 → 1,540円

## 🔍 トラブルシューティング

### プロキシ接続エラー

1. プロキシ設定を確認
2. 認証情報が正しいか確認
3. プロキシサーバーが稼働しているか確認
4. `USE_PROXY=false` で直接接続を試す

### スクレイピングエラー

1. プロキシ状態インジケーターで接続確認
2. 対象サイトがアクセス可能か確認
3. ログでエラー詳細を確認

## 📝 ライセンス

MIT License