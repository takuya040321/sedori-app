# システム仕様書 - ShopScraper

## 1. システム概要

### 1.1 システム構成
- **フロントエンド**: Next.js 14 (React 18)
- **バックエンド**: Next.js API Routes
- **スタイリング**: Tailwind CSS
- **UI コンポーネント**: Radix UI + shadcn/ui
- **スクレイピング**: Puppeteer + Cheerio
- **データ保存**: JSON ファイル
- **状態管理**: SWR

### 1.2 ディレクトリ構成
```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API Routes
│   ├── dashboard/         # ダッシュボードページ
│   ├── shop/             # ショップページ
│   └── asin-upload/      # ASIN一括登録ページ
├── components/           # UIコンポーネント
│   ├── dashboard/        # ダッシュボード用コンポーネント
│   ├── layout/          # レイアウトコンポーネント
│   ├── product-list/    # 商品一覧用コンポーネント
│   └── ui/              # 基本UIコンポーネント
├── lib/                 # ユーティリティ・ライブラリ
│   └── scrapers/        # スクレイピング処理
├── hooks/               # カスタムフック
├── types/               # TypeScript型定義
└── data/                # データファイル
    ├── products/        # 商品データ
    └── asin/           # ASINデータ
```

## 2. アーキテクチャ設計

### 2.1 システムアーキテクチャ
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   External      │
│   (Next.js)     │◄──►│   (API Routes)  │◄──►│   (Websites)    │
│                 │    │                 │    │                 │
│ - Dashboard     │    │ - Scraping API  │    │ - DHC           │
│ - Product List  │    │ - Product API   │    │ - VT Cosmetics  │
│ - ASIN Upload   │    │ - ASIN API      │    │ - Proxy Server  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │
         └───────────────────────┘
                    │
         ┌─────────────────┐
         │   Data Layer    │
         │   (JSON Files)  │
         │                 │
         │ - products/     │
         │ - asin/         │
         └─────────────────┘
```

### 2.2 データフロー
1. **スクレイピング**: 外部サイト → Scraper → JSON保存
2. **表示**: JSON読み込み → API → Frontend表示
3. **ASIN登録**: Excel/CSV → パース → JSON保存
4. **利益計算**: 商品価格 + ASIN情報 → 計算 → 表示

## 3. API設計

### 3.1 エンドポイント一覧

#### 3.1.1 商品関連API
- `GET /api/products/[category]/[shopName]` - 商品一覧取得
- `POST /api/products/[category]/[shopName]/upload-asin` - ASIN更新
- `POST /api/scraping/[category]/[shopName]` - スクレイピング実行

#### 3.1.2 ASIN関連API
- `GET /api/asin-info` - ASIN情報取得
- `POST /api/asin-upload` - ASIN一括登録

#### 3.1.3 ブランド関連API
- `GET /api/brands` - ブランド一覧取得

### 3.2 データモデル

#### 3.2.1 Product型
```typescript
interface Product {
  name: string;           // 商品名
  imageUrl: string;       // 画像URL
  price: number;          // 価格
  salePrice?: number;     // セール価格
  asins?: AsinInfo[];     // ASIN情報
  updatedAt: string;      // 更新日時
  hidden?: boolean;       // 非表示フラグ
}
```

#### 3.2.2 AsinInfo型
```typescript
interface AsinInfo {
  asin: string;           // ASIN
  url: string;            // Amazon URL
  productName: string;    // Amazon商品名
  brand: string;          // ブランド
  price: number;          // Amazon価格
  soldUnit: number;       // 月間販売数
  sellingFee: number | null;  // 販売手数料率
  fbaFee: number | null;      // FBA手数料
  jan: string[];          // JANコード
  note?: string;          // メモ
}
```

#### 3.2.3 ShopData型
```typescript
interface ShopData {
  lastUpdated: string;    // 最終更新日時
  products: Product[];    // 商品一覧
}
```

## 4. スクレイピング仕様

### 4.1 DHCスクレイピング
- **対象URL**: 複数カテゴリページ
- **取得項目**: 商品名、価格、セール価格、画像URL
- **ページネーション**: 「次へ」ボタンで自動遷移
- **技術**: Puppeteer使用

### 4.2 VT Cosmeticsスクレイピング
- **対象URL**: 全商品一覧ページ
- **取得項目**: 商品名、価格、セール価格、画像URL
- **ページネーション**: URLパラメータで制御
- **技術**: Axios + Cheerio使用

### 4.3 プロキシ設定
- **プロキシサーバー**: `http://150.61.8.70:10080`
- **認証**: ユーザー名・パスワード認証
- **目的**: IPブロック回避、安定したアクセス

## 5. データ保存仕様

### 5.1 ファイル構成
```
src/data/
├── products/
│   ├── official/
│   │   ├── dhc.json
│   │   └── vt-cosmetics.json
│   ├── rakuten/
│   └── yahoo/
└── asin/
    ├── dhc.json
    └── vt-cosmetics.json
```

### 5.2 データ形式
- **エンコーディング**: UTF-8
- **フォーマット**: JSON
- **インデント**: 2スペース
- **改行コード**: LF

## 6. UI/UX仕様

### 6.1 デザインシステム
- **テーマ**: ダークテーマ
- **カラーパレット**: 
  - Primary: Blue-Purple gradient
  - Secondary: Emerald-Teal gradient
  - Accent: Amber-Orange gradient
- **フォント**: Inter
- **アニメーション**: Framer Motion

### 6.2 レスポンシブ対応
- **ブレークポイント**:
  - Mobile: < 768px
  - Tablet: 768px - 1024px
  - Desktop: > 1024px

### 6.3 コンポーネント設計
- **Atomic Design**: 原子・分子・有機体・テンプレート・ページ
- **再利用性**: 高い再利用性を持つコンポーネント設計
- **アクセシビリティ**: ARIA属性、キーボードナビゲーション対応

## 7. パフォーマンス仕様

### 7.1 フロントエンド
- **初期表示**: 3秒以内
- **ページ遷移**: 1秒以内
- **データ更新**: リアルタイム反映

### 7.2 スクレイピング
- **処理時間**: カテゴリあたり5分以内
- **エラー処理**: 3回リトライ後エラー報告
- **レート制限**: リクエスト間隔1秒

### 7.3 メモリ使用量
- **最大メモリ**: 512MB以内
- **ガベージコレクション**: 適切なメモリ解放

## 8. エラーハンドリング

### 8.1 スクレイピングエラー
- **ネットワークエラー**: リトライ処理
- **パースエラー**: ログ出力とスキップ
- **タイムアウト**: 適切なタイムアウト設定

### 8.2 APIエラー
- **400番台**: クライアントエラーとして適切なメッセージ
- **500番台**: サーバーエラーとして詳細ログ
- **ネットワークエラー**: 再試行可能なエラーとして処理

### 8.3 ユーザーフィードバック
- **成功**: 緑色の成功メッセージ
- **警告**: 黄色の警告メッセージ
- **エラー**: 赤色のエラーメッセージ
- **ローディング**: スピナーとプログレスバー

## 9. セキュリティ仕様

### 9.1 入力検証
- **ASIN**: 10桁英数字の検証
- **ファイルアップロード**: 拡張子とMIMEタイプの検証
- **SQLインジェクション**: 該当なし（ファイルベース）

### 9.2 認証・認可
- **現在**: 認証なし（ローカル使用想定）
- **将来**: Basic認証またはJWT実装予定

### 9.3 データ保護
- **機密情報**: プロキシ認証情報の環境変数化
- **ログ**: 個人情報を含まないログ出力

## 10. 運用・保守仕様

### 10.1 ログ仕様
- **レベル**: ERROR, WARN, INFO, DEBUG
- **出力先**: コンソール
- **フォーマット**: 構造化ログ（JSON）

### 10.2 監視項目
- **スクレイピング成功率**: 95%以上
- **API応答時間**: 平均3秒以内
- **エラー発生率**: 5%以下

### 10.3 バックアップ
- **データファイル**: 日次バックアップ推奨
- **設定ファイル**: バージョン管理

## 11. 拡張性

### 11.1 新ショップ追加
- **スクレイパー**: `src/lib/scrapers/`に追加
- **API**: 既存エンドポイントで対応
- **UI**: 設定ファイルでの追加

### 11.2 新機能追加
- **価格アラート**: 価格変動通知機能
- **在庫管理**: 在庫数の追跡機能
- **レポート**: 売上・利益レポート機能