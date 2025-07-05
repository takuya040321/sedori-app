/*
  # 商品管理システムのデータベーススキーマ作成

  1. 新しいテーブル
    - `shops` - ショップ情報
      - `id` (uuid, primary key)
      - `category` (text) - カテゴリ（official, rakuten, yahoo）
      - `name` (text) - ショップ名（dhc, vt-cosmetics）
      - `display_name` (text) - 表示名
      - `last_updated` (timestamptz) - 最終更新日時
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `products` - 商品情報
      - `id` (uuid, primary key)
      - `shop_id` (uuid, foreign key)
      - `name` (text) - 商品名
      - `image_url` (text) - 画像URL
      - `price` (integer) - 価格
      - `sale_price` (integer) - セール価格
      - `hidden` (boolean) - 非表示フラグ
      - `memo` (text) - メモ
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `asin_info` - ASIN情報
      - `id` (uuid, primary key)
      - `asin` (text, unique) - ASIN
      - `url` (text) - Amazon URL
      - `product_name` (text) - Amazon商品名
      - `brand` (text) - ブランド
      - `price` (integer) - Amazon価格
      - `sold_unit` (integer) - 月間販売数
      - `selling_fee` (decimal) - 販売手数料率
      - `fba_fee` (integer) - FBA手数料
      - `jan_codes` (text[]) - JANコード配列
      - `note` (text) - メモ
      - `is_dangerous_goods` (boolean) - 危険物フラグ
      - `is_partner_carrier_unavailable` (boolean) - パートナーキャリア不可フラグ
      - `has_official_store` (boolean) - 公式有無フラグ
      - `has_amazon_store` (boolean) - Amazon有無フラグ
      - `complaint_count` (integer) - 苦情回数
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `product_asins` - 商品とASINの関連テーブル
      - `id` (uuid, primary key)
      - `product_id` (uuid, foreign key)
      - `asin_id` (uuid, foreign key)
      - `created_at` (timestamptz)

  2. セキュリティ
    - 全テーブルでRLSを有効化
    - 認証不要でのCRUD操作を許可（現在は認証システムなし）

  3. インデックス
    - パフォーマンス向上のための適切なインデックス設定
*/

-- ショップテーブル
CREATE TABLE IF NOT EXISTS shops (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category text NOT NULL,
  name text NOT NULL,
  display_name text NOT NULL,
  last_updated timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(category, name)
);

-- 商品テーブル
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id uuid NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
  name text NOT NULL,
  image_url text DEFAULT '',
  price integer NOT NULL,
  sale_price integer,
  hidden boolean DEFAULT false,
  memo text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ASIN情報テーブル
CREATE TABLE IF NOT EXISTS asin_info (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  asin text UNIQUE NOT NULL,
  url text NOT NULL,
  product_name text DEFAULT '',
  brand text NOT NULL,
  price integer DEFAULT 0,
  sold_unit integer DEFAULT 0,
  selling_fee decimal(5,2),
  fba_fee integer,
  jan_codes text[] DEFAULT '{}',
  note text DEFAULT '',
  is_dangerous_goods boolean DEFAULT false,
  is_partner_carrier_unavailable boolean DEFAULT false,
  has_official_store boolean DEFAULT false,
  has_amazon_store boolean DEFAULT false,
  complaint_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 商品とASINの関連テーブル
CREATE TABLE IF NOT EXISTS product_asins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  asin_id uuid NOT NULL REFERENCES asin_info(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(product_id, asin_id)
);

-- インデックス作成
CREATE INDEX IF NOT EXISTS idx_shops_category_name ON shops(category, name);
CREATE INDEX IF NOT EXISTS idx_products_shop_id ON products(shop_id);
CREATE INDEX IF NOT EXISTS idx_products_name ON products(name);
CREATE INDEX IF NOT EXISTS idx_products_updated_at ON products(updated_at);
CREATE INDEX IF NOT EXISTS idx_asin_info_asin ON asin_info(asin);
CREATE INDEX IF NOT EXISTS idx_asin_info_brand ON asin_info(brand);
CREATE INDEX IF NOT EXISTS idx_product_asins_product_id ON product_asins(product_id);
CREATE INDEX IF NOT EXISTS idx_product_asins_asin_id ON product_asins(asin_id);

-- RLS有効化
ALTER TABLE shops ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE asin_info ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_asins ENABLE ROW LEVEL SECURITY;

-- 認証不要でのアクセスを許可（現在は認証システムなし）
CREATE POLICY "Allow all access to shops" ON shops FOR ALL USING (true);
CREATE POLICY "Allow all access to products" ON products FOR ALL USING (true);
CREATE POLICY "Allow all access to asin_info" ON asin_info FOR ALL USING (true);
CREATE POLICY "Allow all access to product_asins" ON product_asins FOR ALL USING (true);

-- updated_at自動更新のトリガー関数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- updated_atトリガー設定
CREATE TRIGGER update_shops_updated_at BEFORE UPDATE ON shops FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_asin_info_updated_at BEFORE UPDATE ON asin_info FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();