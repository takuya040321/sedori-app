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

async function migrateProducts() {
  console.log('\n📦 商品データを移行中...');
  
  const dataDir = path.join(__dirname, '../src/data/products');
  
  try {
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
            
            if (shopError) {
              console.error(`    ❌ ショップが見つかりません: ${category}/${shopName}`);
              continue;
            }
            
            // ショップの最終更新日時を更新
            await supabase
              .from('shops')
              .update({ last_updated: shopData.lastUpdated })
              .eq('id', shop.id);
            
            // 既存の商品を削除
            await supabase
              .from('products')
              .delete()
              .eq('shop_id', shop.id);
            
            // 商品データを挿入
            let productCount = 0;
            for (const product of shopData.products) {
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
                  updated_at: product.updatedAt,
                })
                .select()
                .single();
              
              if (productError) {
                console.error(`    ❌ 商品挿入エラー:`, productError);
                continue;
              }
              
              // ASIN情報がある場合は処理
              if (product.asins && product.asins.length > 0) {
                for (const asinInfo of product.asins) {
                  // ASIN情報をupsert
                  const { data: insertedAsin, error: asinError } = await supabase
                    .from('asin_info')
                    .upsert({
                      asin: asinInfo.asin,
                      url: asinInfo.url,
                      product_name: asinInfo.productName || '',
                      brand: asinInfo.brand,
                      price: asinInfo.price || 0,
                      sold_unit: asinInfo.soldUnit || 0,
                      selling_fee: asinInfo.sellingFee,
                      fba_fee: asinInfo.fbaFee,
                      jan_codes: asinInfo.jan || [],
                      note: asinInfo.note || '',
                      is_dangerous_goods: asinInfo.isDangerousGoods || false,
                      is_partner_carrier_unavailable: asinInfo.isPartnerCarrierUnavailable || false,
                      has_official_store: asinInfo.hasOfficialStore || false,
                      has_amazon_store: asinInfo.hasAmazonStore || false,
                      complaint_count: asinInfo.complaintCount || 0,
                    })
                    .select()
                    .single();
                  
                  if (asinError) {
                    console.error(`    ❌ ASIN情報upsertエラー:`, asinError);
                    continue;
                  }
                  
                  // 商品とASINの関連を作成
                  await supabase
                    .from('product_asins')
                    .insert({
                      product_id: insertedProduct.id,
                      asin_id: insertedAsin.id,
                    });
                }
              }
              
              productCount++;
            }
            
            console.log(`    ✅ ${productCount}件の商品を移行しました`);
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
    const files = await fs.readdir(asinDir);
    
    for (const file of files) {
      if (file.endsWith('.json')) {
        const brand = file.replace('.json', '');
        const filePath = path.join(asinDir, file);
        
        console.log(`  📄 ${brand} ASINデータを処理中...`);
        
        // JSONファイルを読み込み
        const fileContent = await fs.readFile(filePath, 'utf-8');
        const asinList = JSON.parse(fileContent);
        
        let asinCount = 0;
        for (const asinInfo of asinList) {
          // ASIN情報をupsert
          const { error } = await supabase
            .from('asin_info')
            .upsert({
              asin: asinInfo.asin,
              url: asinInfo.url,
              product_name: asinInfo.productName || '',
              brand: asinInfo.brand,
              price: asinInfo.price || 0,
              sold_unit: asinInfo.soldUnit || 0,
              selling_fee: asinInfo.sellingFee,
              fba_fee: asinInfo.fbaFee,
              jan_codes: asinInfo.jan || [],
              note: asinInfo.note || '',
              is_dangerous_goods: asinInfo.isDangerousGoods || false,
              is_partner_carrier_unavailable: asinInfo.isPartnerCarrierUnavailable || false,
              has_official_store: asinInfo.hasOfficialStore || false,
              has_amazon_store: asinInfo.hasAmazonStore || false,
              complaint_count: asinInfo.complaintCount || 0,
            });
          
          if (error) {
            console.error(`    ❌ ASIN情報upsertエラー:`, error);
            continue;
          }
          
          asinCount++;
        }
        
        console.log(`    ✅ ${asinCount}件のASIN情報を移行しました`);
      }
    }
  } catch (error) {
    console.error('ASINデータ移行エラー:', error);
    throw error;
  }
}

// スクリプト実行
migrateData();