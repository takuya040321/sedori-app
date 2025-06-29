# API仕様書 - ShopScraper

## 1. API概要

### 1.1 基本情報
- **ベースURL**: `/api`
- **プロトコル**: HTTP/HTTPS
- **データ形式**: JSON
- **文字エンコーディング**: UTF-8
- **認証**: なし（現在）

### 1.2 共通レスポンス形式
```typescript
// 成功レスポンス
interface SuccessResponse<T> {
  success: true;
  data?: T;
  message?: string;
}

// エラーレスポンス
interface ErrorResponse {
  success: false;
  error: string;
  message?: string;
  details?: string;
}
```

### 1.3 共通HTTPステータスコード
- `200 OK`: 成功
- `400 Bad Request`: リクエストエラー
- `404 Not Found`: リソースが見つからない
- `500 Internal Server Error`: サーバーエラー

## 2. 商品関連API

### 2.1 商品一覧取得

```http
GET /api/products/{category}/{shopName}
```

#### パラメータ
- `category` (string): カテゴリ名（例: "official"）
- `shopName` (string): ショップ名（例: "dhc", "vt-cosmetics"）

#### レスポンス例
```json
{
  "success": true,
  "data": {
    "lastUpdated": "2024-01-15T10:30:00.000Z",
    "products": [
      {
        "name": "VT CICA マイルド フォーム クレンザー 300ml",
        "imageUrl": "https://images.unsplash.com/photo-1556228578-8c89e6adf883",
        "price": 1980,
        "salePrice": 1584,
        "asins": [
          {
            "asin": "B09WR43459",
            "url": "https://amazon.co.jp/dp/B09WR43459",
            "productName": "VT CICA フォームクレンザー",
            "brand": "vt-cosmetics",
            "price": 2200,
            "soldUnit": 150,
            "sellingFee": 15,
            "fbaFee": 350,
            "jan": ["4901234567890"],
            "note": "",
            "isDangerousGoods": false,
            "isPartnerCarrierUnavailable": false
          }
        ],
        "updatedAt": "2024-01-15T10:30:00.000Z",
        "hidden": false,
        "memo": "人気商品"
      }
    ]
  }
}
```

### 2.2 商品ASIN追加

```http
POST /api/products/{category}/{shopName}/add-asin
```

#### リクエストボディ
```json
{
  "productIndex": 0,
  "asinInfo": {
    "asin": "B08XYZ1234",
    "url": "https://amazon.co.jp/dp/B08XYZ1234",
    "productName": "商品名",
    "brand": "vt-cosmetics",
    "price": 2200,
    "soldUnit": 150,
    "sellingFee": 15,
    "fbaFee": 350,
    "jan": ["4901234567890"],
    "note": "",
    "isDangerousGoods": false,
    "isPartnerCarrierUnavailable": false
  }
}
```

### 2.3 商品ASIN削除

```http
POST /api/products/{category}/{shopName}/remove-asin
```

#### リクエストボディ
```json
{
  "productIndex": 0,
  "asinIndex": 0
}
```

### 2.4 商品メモ更新

```http
POST /api/products/{category}/{shopName}/update-memo
```

#### リクエストボディ
```json
{
  "index": 0,
  "memo": "メモ内容"
}
```

### 2.5 危険物フラグ更新

```http
POST /api/products/{category}/{shopName}/update-asin-dangerous
```

#### リクエストボディ
```json
{
  "productIndex": 0,
  "asinIndex": 0,
  "isDangerousGoods": true
}
```

### 2.6 パートナーキャリア不可フラグ更新

```http
POST /api/products/{category}/{shopName}/update-asin-partner-carrier
```

#### リクエストボディ
```json
{
  "productIndex": 0,
  "asinIndex": 0,
  "isPartnerCarrierUnavailable": true
}
```

## 3. スクレイピング関連API

### 3.1 スクレイピング実行

```http
POST /api/scraping/{category}/{shopName}
```

#### パラメータ
- `category` (string): カテゴリ名
- `shopName` (string): ショップ名

#### レスポンス例
```json
{
  "success": true,
  "message": "dhc の商品情報を更新しました (150件)",
  "data": {
    "lastUpdated": "2024-01-15T10:30:00.000Z",
    "products": [...]
  },
  "updatedCount": 150
}
```

#### 対応ショップ
- `official/dhc`: DHC公式サイト
- `official/vt-cosmetics`: VT Cosmetics公式サイト

## 4. ASIN関連API

### 4.1 ASIN情報取得

```http
GET /api/asin-info?asin={asin}&brand={brand}
```

#### クエリパラメータ
- `asin` (string): ASIN（必須）
- `brand` (string): ブランド名（必須）

#### レスポンス例
```json
{
  "asin": "B08XYZ1234",
  "url": "https://amazon.co.jp/dp/B08XYZ1234",
  "productName": "VT CICA フォームクレンザー 300ml",
  "brand": "vt-cosmetics",
  "price": 2200,
  "soldUnit": 150,
  "sellingFee": 15,
  "fbaFee": 350,
  "jan": ["4901234567890"],
  "note": "",
  "isDangerousGoods": false,
  "isPartnerCarrierUnavailable": false
}
```

#### エラーレスポンス（404）
```json
{
  "error": "ASIN情報が見つかりません",
  "details": "ASIN B08XYZ1234 がデータベースに登録されていません"
}
```

### 4.2 ASIN一括登録

```http
POST /api/asin-upload
```

#### リクエストボディ
```json
{
  "brand": "vt-cosmetics",
  "asinList": [
    {
      "asin": "B08XYZ1234",
      "url": "https://amazon.co.jp/dp/B08XYZ1234",
      "productName": "VT CICA フォームクレンザー",
      "brand": "vt-cosmetics",
      "price": 2200,
      "soldUnit": 150,
      "sellingFee": 15,
      "fbaFee": 350,
      "jan": ["4901234567890"],
      "note": "",
      "isDangerousGoods": false,
      "isPartnerCarrierUnavailable": false
    }
  ]
}
```

### 4.3 危険物フラグ更新

```http
POST /api/asin-dangerous-goods
```

#### リクエストボディ
```json
{
  "asin": "B08XYZ1234",
  "brand": "vt-cosmetics",
  "isDangerousGoods": true
}
```

### 4.4 パートナーキャリア不可フラグ更新

```http
POST /api/asin-partner-carrier
```

#### リクエストボディ
```json
{
  "asin": "B08XYZ1234",
  "brand": "vt-cosmetics",
  "isPartnerCarrierUnavailable": true
}
```

## 5. プロキシ関連API

### 5.1 プロキシ状態取得

```http
GET /api/proxy-status
```

#### レスポンス例
```json
{
  "success": true,
  "proxy": {
    "enabled": true,
    "server": "http://150.61.8.70:10080",
    "hasAuth": true
  },
  "connectionTest": {
    "success": true,
    "ip": "150.61.8.70",
    "proxyUsed": true
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

## 6. ブランド関連API

### 6.1 ブランド一覧取得

```http
GET /api/brands
```

#### レスポンス例
```json
[
  "dhc",
  "vt-cosmetics"
]
```

## 7. データ形式仕様

### 7.1 Product型
```typescript
interface Product {
  name: string;                    // 商品名
  imageUrl: string;               // 画像URL
  price: number;                  // 価格
  salePrice?: number;             // セール価格
  asins?: AsinInfo[];             // ASIN情報配列
  updatedAt: string;              // 更新日時
  hidden?: boolean;               // 非表示フラグ
  memo?: string;                  // ユーザーメモ
}
```

### 7.2 AsinInfo型
```typescript
interface AsinInfo {
  asin: string;                           // ASIN
  url: string;                            // Amazon URL
  productName: string;                    // Amazon商品名
  brand: string;                          // ブランド名
  price: number;                          // Amazon販売価格
  soldUnit: number;                       // 月間販売個数
  sellingFee: number | null;              // 販売手数料率（%）
  fbaFee: number | null;                  // FBA手数料（円）
  jan: string[];                          // JANコード配列
  note?: string;                          // メモ
  isDangerousGoods?: boolean;             // 危険物フラグ
  isPartnerCarrierUnavailable?: boolean;  // パートナーキャリア不可フラグ
}
```

### 7.3 フィルタリング設定
```typescript
interface FilterSettings {
  search: string;                         // 検索文字列
  showHidden: boolean;                    // 非表示商品を表示
  showDangerousGoods: boolean;            // 危険物のみ表示
  showPartnerCarrierUnavailable: boolean; // パートナーキャリア不可のみ表示
  priceRange: {
    min: number | null;                   // 最小価格
    max: number | null;                   // 最大価格
  };
  hasAsin: boolean | null;                // ASIN有無（true: あり, false: なし, null: 全て）
}
```

## 8. エラーハンドリング

### 8.1 エラーコード一覧

| HTTPステータス | エラーコード | 説明 |
|---------------|-------------|------|
| 400 | INVALID_PARAMS | パラメータが不正 |
| 400 | VALIDATION_ERROR | バリデーションエラー |
| 404 | NOT_FOUND | リソースが見つからない |
| 404 | SHOP_NOT_FOUND | ショップが見つからない |
| 404 | ASIN_NOT_FOUND | ASIN情報が見つからない |
| 500 | INTERNAL_ERROR | 内部サーバーエラー |
| 500 | FILE_ERROR | ファイル操作エラー |
| 500 | SCRAPING_ERROR | スクレイピングエラー |

### 8.2 ASIN情報取得時の特別処理

ASIN情報が見つからない場合（404エラー）、フロントエンドでは基本的なASIN情報を自動生成します：

```typescript
{
  asin: "入力されたASIN",
  url: "https://amazon.co.jp/dp/{ASIN}",
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

## 9. 新機能

### 9.1 複数ASIN管理
- 1つの商品に対して複数のASINを登録可能
- 各ASINごとに個別の利益計算
- 危険物・パートナーキャリア不可フラグの個別管理

### 9.2 テーブル機能強化
- **列幅調整**: 各列の境界をドラッグして幅を調整
- **固定ヘッダー**: スクロール時もヘッダーが表示
- **並び替え**: 列ヘッダークリックで昇順・降順切り替え
- **検索・フィルタリング**: 商品名検索、価格範囲、各種フラグでのフィルタリング

### 9.3 色分け表示
- **危険物**: 赤色背景
- **パートナーキャリア不可**: オレンジ色背景  
- **両方該当**: グラデーション背景

### 9.4 エラーハンドリング改善
- ASIN情報が見つからない場合の自動フォールバック
- 詳細なエラーメッセージ表示
- 手動入力が必要な項目の明確な表示