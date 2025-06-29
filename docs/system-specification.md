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
│   │   ├── products/      # 商品関連API
│   │   ├── scraping/      # スクレイピングAPI
│   │   ├── asin-info/     # ASIN情報API
│   │   ├── asin-upload/   # ASIN一括登録API
│   │   ├── asin-dangerous-goods/  # 危険物フラグAPI
│   │   ├── asin-partner-carrier/  # パートナーキャリア不可API
│   │   ├── brands/        # ブランド一覧API
│   │   └── proxy-status/  # プロキシ状態API
│   ├── dashboard/         # ダッシュボードページ
│   ├── shop/             # ショップページ
│   └── asin-upload/      # ASIN一括登録ページ
├── components/           # UIコンポーネント
│   ├── dashboard/        # ダッシュボード用コンポーネント
│   ├── layout/          # レイアウトコンポーネント
│   ├── product-list/    # 商品一覧用コンポーネント
│   │   ├── ProductTable.tsx           # メインテーブル
│   │   ├── ProductTableHeader.tsx     # テーブルヘッダー（並び替え対応）
│   │   ├── ProductTableRow.tsx        # テーブル行
│   │   ├── MultipleAsinManager.tsx    # 複数ASIN管理
│   │   ├── SearchAndFilter.tsx        # 検索・フィルター
│   │   ├── ScrapingButton.tsx         # スクレイピングボタン
│   │   ├── ProxyStatusIndicator.tsx   # プロキシ状態表示
│   │   └── UserDiscountControl.tsx    # ユーザー割引設定
│   └── ui/              # 基本UIコンポーネント
├── lib/                 # ユーティリティ・ライブラリ
│   ├── scrapers/        # スクレイピング処理
│   │   ├── common.ts    # 共通処理（プロキシ設定等）
│   │   └── official/    # 公式サイト用スクレイパー
│   ├── pricing-config.ts      # ショップ別価格設定
│   ├── pricing-calculator.ts  # 利益計算処理
│   ├── data-loader.ts         # データ読み込み処理
│   ├── fetchASINInfo.ts       # ASIN情報取得
│   ├── calc.ts               # 計算ユーティリティ
│   └── utils.ts              # 汎用ユーティリティ
├── hooks/               # カスタムフック
│   ├── useProductTable.ts         # 商品テーブル管理
│   └── useUserDiscountSettings.ts # ユーザー割引設定
├── types/               # TypeScript型定義
│   └── product.ts       # 商品・ASIN関連型定義
└── data/                # データファイル
    ├── products/        # 商品データ
    │   └── official/    # 公式サイト商品データ
    └── asin/           # ASINデータ
```

## 2. 新機能仕様

### 2.1 複数ASIN管理機能

#### 2.1.1 概要
- 1つの商品に対して複数のASINを登録可能
- 各ASINごとに個別の利益計算を実行
- 危険物・パートナーキャリア不可フラグの個別管理

#### 2.1.2 データ構造
```typescript
interface Product {
  name: string;
  imageUrl: string;
  price: number;
  salePrice?: number;
  asins?: AsinInfo[];  // 配列で複数ASIN対応
  updatedAt: string;
  hidden?: boolean;
  memo?: string;
}

interface AsinInfo {
  asin: string;
  url: string;
  productName: string;
  brand: string;
  price: number;
  soldUnit: number;
  sellingFee: number | null;
  fbaFee: number | null;
  jan: string[];
  note?: string;
  isDangerousGoods?: boolean;
  isPartnerCarrierUnavailable?: boolean;  // 新規追加
}
```

#### 2.1.3 UI仕様
- ASIN追加フォーム：10桁英数字の入力検証
- 展開可能なASIN一覧表示
- 各ASINの詳細情報表示（商品名、価格、利益計算結果）
- 危険物・パートナーキャリア不可のチェックボックス
- 個別削除ボタン

### 2.2 テーブル機能強化

#### 2.2.1 列幅調整機能
- **実装方法**: CSS `resize: horizontal` プロパティ
- **最小幅**: 80px
- **視覚的フィードバック**: ホバー時の背景色変更
- **リサイズハンドル**: 列境界に表示

#### 2.2.2 固定ヘッダー機能
- **実装方法**: CSS `position: sticky`
- **z-index**: 10（他要素より前面）
- **背景色**: `#f9fafb`（グレー50）
- **影効果**: `box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1)`

#### 2.2.3 並び替え機能
```typescript
type SortField = 'name' | 'price' | 'salePrice' | 'updatedAt' | 'memo';
type SortDirection = 'asc' | 'desc';
```

- **対応列**: 商品名、価格、セール価格、更新日時、メモ
- **視覚的表示**: 矢印アイコンで方向表示
- **インタラクション**: 列ヘッダークリックで切り替え

#### 2.2.4 検索・フィルタリング機能
```typescript
interface FilterSettings {
  search: string;                         // 商品名・メモ検索
  showHidden: boolean;                    // 非表示商品表示
  showDangerousGoods: boolean;            // 危険物のみ表示
  showPartnerCarrierUnavailable: boolean; // パートナーキャリア不可のみ
  priceRange: {
    min: number | null;
    max: number | null;
  };
  hasAsin: boolean | null;                // ASIN有無フィルター
}
```

### 2.3 パートナーキャリア不可機能

#### 2.3.1 概要
- Amazon FBAでパートナーキャリアが利用できない商品の管理
- 危険物とは別の制約として管理
- 略称「ﾊﾟｰｷｬﾘ」で表示

#### 2.3.2 色分け表示
- **危険物のみ**: 赤色背景（`bg-red-50`）
- **パートナーキャリア不可のみ**: オレンジ色背景（`bg-orange-50`）
- **両方該当**: グラデーション背景（`bg-gradient-to-r from-red-50 to-orange-50`）

#### 2.3.3 アイコン表示
- **危険物**: `AlertTriangle`（赤色）
- **パートナーキャリア不可**: `Truck`（オレンジ色）

## 3. エラーハンドリング強化

### 3.1 ASIN情報取得エラー対応

#### 3.1.1 404エラー時の自動フォールバック
```typescript
// ASIN情報が見つからない場合の基本情報生成
{
  asin: "入力されたASIN",
  url: `https://amazon.co.jp/dp/${asin}`,
  productName: "",
  brand: "ショップ名から推定",
  price: 0,
  soldUnit: 0,
  sellingFee: null,
  fbaFee: null,
  jan: [],
  note: "手動入力が必要",
  isDangerousGoods: false,
  isPartnerCarrierUnavailable: false
}
```

#### 3.1.2 手動入力必要項目の表示
- **判定条件**: `productName`が空、`price`が0、`sellingFee`または`fbaFee`がnull
- **視覚的表示**: 編集アイコン（`Edit`）とアンバー色の警告
- **ガイダンス**: ASIN一括登録ページへの誘導メッセージ

### 3.2 詳細エラーメッセージ

#### 3.2.1 API エラーレスポンス
```typescript
interface ErrorResponse {
  success: false;
  error: string;
  message?: string;
  details?: string;  // 詳細情報追加
}
```

#### 3.2.2 ユーザー向けエラー表示
- **コンソールログ**: 開発者向け詳細情報
- **アラート表示**: ユーザー向け分かりやすいメッセージ
- **将来拡張**: Toast通知システムの実装予定

## 4. パフォーマンス仕様

### 4.1 フロントエンド最適化

#### 4.1.1 テーブル表示最適化
- **最大高さ制限**: `max-h-[70vh]`
- **仮想スクロール**: 大量データ対応（将来実装予定）
- **メモ化**: React.memo、useMemo、useCallbackの活用

#### 4.1.2 フィルタリング最適化
- **useMemo**: フィルタリング結果のメモ化
- **デバウンス**: 検索入力の遅延処理（将来実装予定）

### 4.2 データ処理最適化

#### 4.2.1 ASIN情報取得
- **エラーハンドリング**: 404時の自動フォールバック
- **ローディング状態**: 個別商品レベルでの表示
- **並列処理**: 複数ASIN同時取得（将来実装予定）

## 5. セキュリティ仕様

### 5.1 入力検証強化

#### 5.1.1 ASIN検証
- **形式**: 10桁英数字
- **自動フォーマット**: 大文字変換、特殊文字除去
- **リアルタイム検証**: 入力時の即座チェック

#### 5.1.2 価格範囲検証
- **最小値**: 0以上
- **最大値**: 数値型チェック
- **範囲チェック**: 最小値 ≤ 最大値

## 6. 運用・保守仕様

### 6.1 ログ強化

#### 6.1.1 ASIN関連ログ
```typescript
console.log(`Fetching ASIN info for: ${asin}, brand: ${brand}`);
console.log(`ASIN info retrieved:`, asinInfo);
console.log(`ASIN ${asin} successfully added to product ${productIndex}`);
```

#### 6.1.2 エラーログ
```typescript
console.error("Failed to add ASIN:", error);
console.error("ASIN info API error:", e);
```

### 6.2 データ整合性

#### 6.2.1 インデックス管理
- **フィルタリング後のインデックス**: 元配列でのインデックスを保持
- **一意性確保**: `${product.name}-${product.updatedAt}`をキーとして使用

#### 6.2.2 状態同期
- **SWR**: データ取得とキャッシュ管理
- **mutate**: データ更新後の再取得
- **楽観的更新**: 将来実装予定

## 7. 拡張性

### 7.1 新機能追加予定

#### 7.1.1 Toast通知システム
- **成功通知**: ASIN登録成功等
- **エラー通知**: 詳細エラー情報表示
- **進行状況**: 長時間処理の進捗表示

#### 7.1.2 仮想スクロール
- **大量データ対応**: 10,000件以上の商品表示
- **パフォーマンス向上**: メモリ使用量削減

#### 7.1.3 一括操作機能
- **一括ASIN登録**: 複数商品への同時ASIN追加
- **一括フラグ更新**: 危険物・パートナーキャリア不可の一括設定
- **一括削除**: 複数ASIN同時削除

### 7.2 API拡張

#### 7.2.1 バッチ処理API
- **一括ASIN更新**: 複数商品の同時更新
- **一括フラグ更新**: 複数ASINのフラグ同時更新

#### 7.2.2 検索API
- **高度な検索**: 複数条件での商品検索
- **全文検索**: 商品名・メモの全文検索