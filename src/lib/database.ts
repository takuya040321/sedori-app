// src/lib/database.ts
// Supabaseデータベース操作のラッパー関数

import { supabase } from './supabase';
import { Product, AsinInfo, ShopData } from '@/types/product';

// ショップ情報を取得
export async function getShop(category: string, shopName: string) {
  const { data, error } = await supabase
    .from('shops')
    .select('*')
    .eq('category', category)
    .eq('name', shopName)
    .single();

  if (error) {
    console.error('Error fetching shop:', error);
    return null;
  }

  return data;
}

// 商品一覧を取得（ASIN情報も含む）
export async function getProducts(category: string, shopName: string): Promise<ShopData> {
  // ショップ情報を取得
  const shop = await getShop(category, shopName);
  if (!shop) {
    return {
      lastUpdated: new Date().toISOString(),
      products: [],
    };
  }

  // 商品とASIN情報を結合して取得
  const { data: products, error } = await supabase
    .from('products')
    .select(`
      *,
      product_asins (
        asin_info (*)
      )
    `)
    .eq('shop_id', shop.id)
    .order('updated_at', { ascending: false });

  if (error) {
    console.error('Error fetching products:', error);
    return {
      lastUpdated: shop.last_updated,
      products: [],
    };
  }

  // データ形式を既存のProduct型に変換
  const convertedProducts: Product[] = products.map(product => ({
    name: product.name,
    imageUrl: product.image_url,
    price: product.price,
    salePrice: product.sale_price || undefined,
    asins: product.product_asins.map((pa: any) => ({
      asin: pa.asin_info.asin,
      url: pa.asin_info.url,
      productName: pa.asin_info.product_name,
      brand: pa.asin_info.brand,
      price: pa.asin_info.price,
      soldUnit: pa.asin_info.sold_unit,
      sellingFee: pa.asin_info.selling_fee,
      fbaFee: pa.asin_info.fba_fee,
      jan: pa.asin_info.jan_codes,
      note: pa.asin_info.note,
      isDangerousGoods: pa.asin_info.is_dangerous_goods,
      isPartnerCarrierUnavailable: pa.asin_info.is_partner_carrier_unavailable,
      hasOfficialStore: pa.asin_info.has_official_store,
      hasAmazonStore: pa.asin_info.has_amazon_store,
      complaintCount: pa.asin_info.complaint_count,
    })),
    updatedAt: product.updated_at,
    hidden: product.hidden,
    memo: product.memo,
  }));

  return {
    lastUpdated: shop.last_updated,
    products: convertedProducts,
  };
}

// 商品を保存
export async function saveProducts(category: string, shopName: string, shopData: ShopData) {
  // ショップ情報を取得
  const shop = await getShop(category, shopName);
  if (!shop) {
    throw new Error(`Shop not found: ${category}/${shopName}`);
  }

  // ショップの最終更新日時を更新
  await supabase
    .from('shops')
    .update({ last_updated: shopData.lastUpdated })
    .eq('id', shop.id);

  // 既存の商品を削除（完全置換）
  await supabase
    .from('products')
    .delete()
    .eq('shop_id', shop.id);

  // 新しい商品データを挿入
  for (const product of shopData.products) {
    // 商品を挿入
    const { data: insertedProduct, error: productError } = await supabase
      .from('products')
      .insert({
        shop_id: shop.id,
        name: product.name,
        image_url: product.imageUrl,
        price: product.price,
        sale_price: product.salePrice,
        hidden: product.hidden || false,
        memo: product.memo || '',
        updated_at: product.updatedAt,
      })
      .select()
      .single();

    if (productError) {
      console.error('Error inserting product:', productError);
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
            product_name: asinInfo.productName,
            brand: asinInfo.brand,
            price: asinInfo.price,
            sold_unit: asinInfo.soldUnit,
            selling_fee: asinInfo.sellingFee,
            fba_fee: asinInfo.fbaFee,
            jan_codes: asinInfo.jan,
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
          console.error('Error upserting ASIN info:', asinError);
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
  }
}

// ASIN情報を取得
export async function getAsinInfo(asin: string, brand: string): Promise<AsinInfo | null> {
  const { data, error } = await supabase
    .from('asin_info')
    .select('*')
    .eq('asin', asin)
    .eq('brand', brand)
    .single();

  if (error) {
    console.error('Error fetching ASIN info:', error);
    return null;
  }

  return {
    asin: data.asin,
    url: data.url,
    productName: data.product_name,
    brand: data.brand,
    price: data.price,
    soldUnit: data.sold_unit,
    sellingFee: data.selling_fee,
    fbaFee: data.fba_fee,
    jan: data.jan_codes,
    note: data.note,
    isDangerousGoods: data.is_dangerous_goods,
    isPartnerCarrierUnavailable: data.is_partner_carrier_unavailable,
    hasOfficialStore: data.has_official_store,
    hasAmazonStore: data.has_amazon_store,
    complaintCount: data.complaint_count,
  };
}

// ASIN情報を保存
export async function saveAsinInfo(asinInfo: AsinInfo) {
  const { error } = await supabase
    .from('asin_info')
    .upsert({
      asin: asinInfo.asin,
      url: asinInfo.url,
      product_name: asinInfo.productName,
      brand: asinInfo.brand,
      price: asinInfo.price,
      sold_unit: asinInfo.soldUnit,
      selling_fee: asinInfo.sellingFee,
      fba_fee: asinInfo.fbaFee,
      jan_codes: asinInfo.jan,
      note: asinInfo.note || '',
      is_dangerous_goods: asinInfo.isDangerousGoods || false,
      is_partner_carrier_unavailable: asinInfo.isPartnerCarrierUnavailable || false,
      has_official_store: asinInfo.hasOfficialStore || false,
      has_amazon_store: asinInfo.hasAmazonStore || false,
      complaint_count: asinInfo.complaintCount || 0,
    });

  if (error) {
    console.error('Error saving ASIN info:', error);
    throw error;
  }
}

// 全ショップ一覧を取得
export async function getAllShops() {
  const { data, error } = await supabase
    .from('shops')
    .select('category, name')
    .order('category')
    .order('name');

  if (error) {
    console.error('Error fetching shops:', error);
    return [];
  }

  // 既存の形式に変換
  const groupedShops: { category: string; shops: string[] }[] = [];
  const categoryMap = new Map<string, string[]>();

  data.forEach(shop => {
    if (!categoryMap.has(shop.category)) {
      categoryMap.set(shop.category, []);
    }
    categoryMap.get(shop.category)!.push(shop.name);
  });

  categoryMap.forEach((shops, category) => {
    groupedShops.push({ category, shops });
  });

  return groupedShops;
}

// 全商品を取得
export async function getAllProducts(): Promise<Product[]> {
  const { data: products, error } = await supabase
    .from('products')
    .select(`
      *,
      product_asins (
        asin_info (*)
      )
    `)
    .order('updated_at', { ascending: false });

  if (error) {
    console.error('Error fetching all products:', error);
    return [];
  }

  // データ形式を既存のProduct型に変換
  return products.map(product => ({
    name: product.name,
    imageUrl: product.image_url,
    price: product.price,
    salePrice: product.sale_price || undefined,
    asins: product.product_asins.map((pa: any) => ({
      asin: pa.asin_info.asin,
      url: pa.asin_info.url,
      productName: pa.asin_info.product_name,
      brand: pa.asin_info.brand,
      price: pa.asin_info.price,
      soldUnit: pa.asin_info.sold_unit,
      sellingFee: pa.asin_info.selling_fee,
      fbaFee: pa.asin_info.fba_fee,
      jan: pa.asin_info.jan_codes,
      note: pa.asin_info.note,
      isDangerousGoods: pa.asin_info.is_dangerous_goods,
      isPartnerCarrierUnavailable: pa.asin_info.is_partner_carrier_unavailable,
      hasOfficialStore: pa.asin_info.has_official_store,
      hasAmazonStore: pa.asin_info.has_amazon_store,
      complaintCount: pa.asin_info.complaint_count,
    })),
    updatedAt: product.updated_at,
    hidden: product.hidden,
    memo: product.memo,
  }));
}