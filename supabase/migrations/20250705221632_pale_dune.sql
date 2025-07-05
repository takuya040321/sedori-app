/*
  # 初期データの投入

  1. ショップデータの投入
    - official/dhc
    - official/vt-cosmetics

  2. 既存のJSONデータからの移行準備
    - ショップレコードを作成
*/

-- 初期ショップデータ投入
INSERT INTO shops (category, name, display_name, last_updated) VALUES
  ('official', 'dhc', 'DHC', now()),
  ('official', 'vt-cosmetics', 'VT Cosmetics', now()),
  ('rakuten', 'dhc', 'DHC (楽天)', now()),
  ('rakuten', 'vt-cosmetics', 'VT Cosmetics (楽天)', now()),
  ('yahoo', 'dhc', 'DHC (Yahoo)', now()),
  ('yahoo', 'vt-cosmetics', 'VT Cosmetics (Yahoo)', now())
ON CONFLICT (category, name) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  last_updated = EXCLUDED.last_updated,
  updated_at = now();