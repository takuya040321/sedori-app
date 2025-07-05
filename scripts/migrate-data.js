// 環境変数を読み込み
require('dotenv').config({ path: '.env.local' });

// scripts/migrate-data.js
// 既存のJSONファイルからSupabaseへデータを移行するスクリプト

const fs = require('fs').promises;
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Supabase設定（環境変数から取得）
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Supabase環境変数が設定されていません');
  console.log('必要な環境変数:');
  console.log('- NEXT_PUBLIC_SUPABASE_URL');
  console.log('- SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function migrateData() {
  console.log('🚀 データ移行を開始します...');

  try {
    // 0. 初期ショップデータを確実に投入
    await ensureShopsExist();
    
    // 1. 商品データの移行
    await migrateProducts();
    
    // 2. ASINデータの移行
    await migrateAsinData();
    
    console.log('✅ データ移行が完了しました！');
  } catch (error) {
    console.error('❌ データ移行中にエラーが発生しました:', error);
    process.exit(1);
  }
}

async function ensureShopsExist() {
  console.log('\n🏪 ショップデータを確認・投入中...');
  
  const shops = [
    { category: 'official', name: 'dhc', display_name: 'DHC' },
    { category: 'official', name: 'vt-cosmetics', display_name: 'VT Cosmetics' },
    { category: 'rakuten', name: 'dhc', display_name: 'DHC (楽天)' },
    { category: 'rakuten', name: 'vt-cosmetics', display_name: 'VT Cosmetics (楽天)' },
    { category: 'yahoo', name: 'dhc', display_name: 'DHC (Yahoo)' },
    { category: 'yahoo', name: 'vt-cosmetics', display_name: 'VT Cosmetics (Yahoo)' }
  ];

  for (const shop of shops) {
    const { error } = await supabase
      .from('shops')
      .upsert({
        category: shop.category,
        name: shop.name,
        display_name: shop.display_name,
        last_updated: new Date().toISOString()
      }, {
        onConflict: 'category,name'
      });

    if (error) {
      console.error(`❌ ショップ投入エラー (${shop.category}/${shop.name}):`, error);
    } else {
      console.log(`✅ ショップ確認: ${shop.category}/${shop.name}`);
    }
  }
}

async function migrateProducts() {
  console.log('\n📦 商品データを移行中...');
  
  const dataDir = path.join(__dirname, '../src/data/products');
  
  try {
    // ディレクトリの存在確認
    try {
      await fs.access(dataDir);
    } catch (error) {
      console.log('📁 商品データディレクトリが見つかりません。スキップします。');
      return;
    }

    const categories = await fs.readdir(dataDir);
    
    for (const category of categories) {
      const categoryPath = path.join(dataDir, category);
      const stat = await fs.stat(categoryPath);
      
      if (stat.isDirectory()) {
        const files = await fs.readdir(categoryPath);
        
        for (const file of files) {
          if (file.endsWith('.json')) {
            const shopName = file.replace('.json', '');
            const filePath = path.join(categoryPath, file);
            
            console.log(`  📄 ${category}/${shopName} を処理中...`);
            
            try {
              // JSONファイルを読み込み
              const fileContent = await fs.readFile(filePath, 'utf-8');
              const shopData = JSON.parse(fileContent);
              
              // ショップ情報を取得
              const { data: shop, error: shopError } = await supabase
                .from('shops')
                .select('*')
                .eq('category', category)
                .eq('name', shopName)
                .single();
              
              if (shopError || !shop) {
                console.error(`    ❌ ショップが見つかりません: ${category}/${shopName}`);
                console.error(`    エラー詳細:`, shopError);
                continue;
              }
              
              // ショップの最終更新日時を更新
              await supabase
                .from('shops')
                .update({ last_updated: shopData.lastUpdated || new Date().toISOString() })
                .eq('id', shop.id);
              
              // 既存の商品を削除
              await supabase
                .from('products')
                .delete()
                .eq('shop_id', shop.id);
              
              // 商品データを挿入
              let productCount = 0;
              for (const product of shopData.products || []) {
                try {
                  // 必須フィールドの検証
                  if (!product.name || typeof product.price !== 'number') {
                    console.warn(`    ⚠️ 無効な商品データをスキップ:`, product.name || 'unnamed');
                    continue;
                  }

                  // 商品を挿入
                  const { data: insertedProduct, error: productError } = await supabase
                    .from('products')
                    .insert({
                      shop_id: shop.id,
                      name: product.name,
                      image_url: product.imageUrl || '',
                      price: product.price,
                      sale_price: product.salePrice || null,
                      hidden: product.hidden || false,
                      memo: product.memo || '',
                      updated_at: product.updatedAt || new Date().toISOString(),
                    })
                    .select()
                    .single();
                  
                  if (productError) {
                    console.error(`    ❌ 商品挿入エラー (${product.name}):`, productError);
                    continue;
                  }
                  
                  // ASIN情報がある場合は処理
                  if (product.asins && Array.isArray(product.asins) && product.asins.length > 0) {
                    for (const asinInfo of product.asins) {
                      try {
                        // ASIN情報の検証
                        if (!asinInfo.asin || !asinInfo.brand) {
                          console.warn(`    ⚠️ 無効なASIN情報をスキップ:`, asinInfo.asin || 'no-asin');
                          continue;
                        }

                        // ASIN情報をupsert
                        const { data: insertedAsin, error: asinError } = await supabase
                          .from('asin_info')
                          .upsert({
                            asin: asinInfo.asin,
                            url: asinInfo.url || `https://amazon.co.jp/dp/${asinInfo.asin}`,
                            product_name: asinInfo.productName || '',
                            brand: asinInfo.brand,
                            price: asinInfo.price || 0,
                            sold_unit: asinInfo.soldUnit || 0,
                            selling_fee: asinInfo.sellingFee || null,
                            fba_fee: asinInfo.fbaFee || null,
                            jan_codes: Array.isArray(asinInfo.jan) ? asinInfo.jan : [],
                            note: asinInfo.note || '',
                            is_dangerous_goods: asinInfo.isDangerousGoods || false,
                            is_partner_carrier_unavailable: asinInfo.isPartnerCarrierUnavailable || false,
                            has_official_store: asinInfo.hasOfficialStore || false,
                            has_amazon_store: asinInfo.hasAmazonStore || false,
                            complaint_count: asinInfo.complaintCount || 0,
                          }, {
                            onConflict: 'asin'
                          })
                          .select()
                          .single();
                        
                        if (asinError) {
                          console.error(`    ❌ ASIN情報upsertエラー (${asinInfo.asin}):`, asinError);
                          continue;
                        }
                        
                        // 商品とASINの関連を作成
                        const { error: relationError } = await supabase
                          .from('product_asins')
                          .upsert({
                            product_id: insertedProduct.id,
                            asin_id: insertedAsin.id,
                          }, {
                            onConflict: 'product_id,asin_id'
                          });

                        if (relationError) {
                          console.error(`    ❌ 商品-ASIN関連エラー:`, relationError);
                        }
                      } catch (asinProcessError) {
                        console.error(`    ❌ ASIN処理エラー (${asinInfo.asin}):`, asinProcessError);
                      }
                    }
                  }
                  
                  productCount++;
                } catch (productProcessError) {
                  console.error(`    ❌ 商品処理エラー (${product.name}):`, productProcessError);
                }
              }
              
              console.log(`    ✅ ${productCount}件の商品を移行しました`);
            } catch (fileError) {
              console.error(`    ❌ ファイル処理エラー (${filePath}):`, fileError);
            }
          }
        }
      }
    }
  } catch (error) {
    console.error('商品データ移行エラー:', error);
    throw error;
  }
}

async function migrateAsinData() {
  console.log('\n🏷️  ASINデータを移行中...');
  
  const asinDir = path.join(__dirname, '../src/data/asin');
  
  try {
    // ディレクトリの存在確認
    try {
      await fs.access(asinDir);
    } catch (error) {
      console.log('📁 ASINデータディレクトリが見つかりません。スキップします。');
      return;
    }

    const files = await fs.readdir(asinDir);
    
    for (const file of files) {
      if (file.endsWith('.json')) {
        const brand = file.replace('.json', '');
        const filePath = path.join(asinDir, file);
        
        console.log(`  📄 ${brand} ASINデータを処理中...`);
        
        try {
          // JSONファイルを読み込み
          const fileContent = await fs.readFile(filePath, 'utf-8');
          const asinList = JSON.parse(fileContent);
          
          if (!Array.isArray(asinList)) {
            console.warn(`    ⚠️ ASINデータが配列ではありません: ${brand}`);
            continue;
          }

          let asinCount = 0;
          for (const asinInfo of asinList) {
            try {
              // ASIN情報の検証
              if (!asinInfo.asin || !asinInfo.brand) {
                console.warn(`    ⚠️ 無効なASIN情報をスキップ:`, asinInfo.asin || 'no-asin');
                continue;
              }

              // ASIN情報をupsert
              const { error } = await supabase
                .from('asin_info')
                .upsert({
                  asin: asinInfo.asin,
                  url: asinInfo.url || `https://amazon.co.jp/dp/${asinInfo.asin}`,
                  product_name: asinInfo.productName || '',
                  brand: asinInfo.brand,
                  price: asinInfo.price || 0,
                  sold_unit: asinInfo.soldUnit || 0,
                  selling_fee: asinInfo.sellingFee || null,
                  fba_fee: asinInfo.fbaFee || null,
                  jan_codes: Array.isArray(asinInfo.jan) ? asinInfo.jan : [],
                  note: asinInfo.note || '',
                  is_dangerous_goods: asinInfo.isDangerousGoods || false,
                  is_partner_carrier_unavailable: asinInfo.isPartnerCarrierUnavailable || false,
                  has_official_store: asinInfo.hasOfficialStore || false,
                  has_amazon_store: asinInfo.hasAmazonStore || false,
                  complaint_count: asinInfo.complaintCount || 0,
                }, {
                  onConflict: 'asin'
                });
              
              if (error) {
                console.error(`    ❌ ASIN情報upsertエラー (${asinInfo.asin}):`, error);
                continue;
              }
              
              asinCount++;
            } catch (asinProcessError) {
              console.error(`    ❌ ASIN処理エラー (${asinInfo.asin}):`, asinProcessError);
            }
          }
          
          console.log(`    ✅ ${asinCount}件のASIN情報を移行しました`);
        } catch (fileError) {
          console.error(`    ❌ ファイル処理エラー (${filePath}):`, fileError);
        }
      }
    }
  } catch (error) {
    console.error('ASINデータ移行エラー:', error);
    throw error;
  }
}

// スクリプト実行
migrateData();