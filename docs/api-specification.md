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
        "asins": [],
        "updatedAt": "2024-01-15T10:30:00.000Z",
        "hidden": false
      }
    ]
  }
}
```

#### エラーレスポンス
```json
{
  "success": false,
  "message": "データ取得に失敗しました"
}
```

### 2.2 商品ASIN更新

```http
POST /api/products/{category}/{shopName}/upload-asin
```

#### リクエストボディ
```json
{
  "index": 0,
  "asin": "B08XYZ1234"
}
```

#### パラメータ
- `index` (number): 商品インデックス
- `asin` (string): ASIN（10桁英数字）

#### レスポンス例
```json
{
  "success": true,
  "message": "ASINを保存しました"
}
```

#### エラーレスポンス
```json
{
  "success": false,
  "message": "商品が見つかりません"
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

#### エラーレスポンス
```json
{
  "success": false,
  "message": "スクレイピング中にエラーが発生しました",
  "error": "Network timeout"
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
  "note": ""
}
```

#### エラーレスポンス
```json
{
  "error": "ASIN情報が見つかりません"
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
      "note": ""
    }
  ]
}
```

#### レスポンス例
```json
{
  "success": true
}
```

#### エラーレスポンス
```json
{
  "error": "Invalid data"
}
```

## 5. ブランド関連API

### 5.1 ブランド一覧取得

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

#### エラーレスポンス
```json
[]
```

## 6. エラーハンドリング

### 6.1 エラーコード一覧

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

### 6.2 エラーレスポンス詳細

#### バリデーションエラー
```json
{
  "success": false,
  "error": "VALIDATION_ERROR",
  "message": "brand, asinは必須です",
  "details": {
    "field": "asin",
    "code": "REQUIRED"
  }
}
```

#### スクレイピングエラー
```json
{
  "success": false,
  "error": "SCRAPING_ERROR",
  "message": "スクレイピング中にエラーが発生しました",
  "details": {
    "shop": "dhc",
    "category": "official",
    "originalError": "Network timeout"
  }
}
```

## 7. レート制限

### 7.1 制限事項
- **スクレイピングAPI**: 1分間に1回まで
- **その他API**: 制限なし（現在）

### 7.2 制限超過時のレスポンス
```json
{
  "success": false,
  "error": "RATE_LIMIT_EXCEEDED",
  "message": "リクエスト制限を超過しました",
  "retryAfter": 60
}
```

## 8. データ形式仕様

### 8.1 日時形式
- **形式**: ISO 8601形式
- **例**: `"2024-01-15T10:30:00.000Z"`
- **タイムゾーン**: UTC

### 8.2 価格形式
- **形式**: 数値（円単位）
- **例**: `1980`（1,980円）

### 8.3 ASIN形式
- **形式**: 10桁英数字
- **例**: `"B08XYZ1234"`
- **パターン**: `/^[A-Z0-9]{10}$/`

### 8.4 URL形式
- **画像URL**: HTTPS必須
- **Amazon URL**: `https://amazon.co.jp/dp/{ASIN}`形式

## 9. セキュリティ

### 9.1 入力検証
- **ASIN**: 10桁英数字のみ許可
- **ファイルアップロード**: Excel/CSVのみ許可
- **SQLインジェクション**: 該当なし（ファイルベース）
- **XSS**: 入力値のサニタイゼーション

### 9.2 CORS設定
```javascript
// 現在の設定（開発環境）
{
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization"
}
```

## 10. パフォーマンス

### 10.1 レスポンス時間目標
- **商品一覧取得**: 3秒以内
- **ASIN情報取得**: 1秒以内
- **スクレイピング**: 10分以内

### 10.2 最適化手法
- **ファイルキャッシュ**: 頻繁にアクセスされるファイルのキャッシュ
- **並列処理**: 複数ファイルの並列読み取り
- **圧縮**: レスポンスの圧縮

## 11. 監視・ログ

### 11.1 ログ出力
```javascript
// ログ形式例
{
  "timestamp": "2024-01-15T10:30:00.000Z",
  "level": "INFO",
  "method": "GET",
  "path": "/api/products/official/dhc",
  "statusCode": 200,
  "responseTime": 1250,
  "userAgent": "Mozilla/5.0..."
}
```

### 11.2 監視項目
- **API応答時間**: 平均・最大・最小
- **エラー率**: HTTP 4xx/5xx の割合
- **スクレイピング成功率**: 成功/失敗の割合
- **ファイルサイズ**: データファイルのサイズ推移

## 12. 将来の拡張

### 12.1 認証機能
```http
# 将来実装予定
Authorization: Bearer {token}
```

### 12.2 ページネーション
```http
GET /api/products/{category}/{shopName}?page=1&limit=50
```

### 12.3 検索・フィルタリング
```http
GET /api/products/{category}/{shopName}?search=クレンザー&minPrice=1000&maxPrice=3000
```

### 12.4 WebSocket API
```javascript
// リアルタイム更新通知
ws://localhost:3000/api/ws/updates
```