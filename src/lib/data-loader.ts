// src/lib/data-loader.ts

import { ShopData, Product } from "@/types/product";
import { getProducts, saveProducts, getAllShops as getShopsFromDB, getAllProducts as getAllProductsFromDB } from "./database";

/**
 * 指定したカテゴリ・ショップのデータを読み込む
 */
export async function loadShopData(category: string, shopName: string): Promise<ShopData> {
  try {
    return await getProducts(category, shopName);
  } catch (error) {
    console.error(`Failed to load shop data for ${category}/${shopName}:`, error);
    return {
      lastUpdated: new Date().toISOString(),
      products: [],
    };
  }
}

/**
 * 指定したカテゴリ・ショップのデータを保存する
 */
export async function saveShopData(
  category: string,
  shopName: string,
  data: ShopData,
): Promise<void> {
  try {
    await saveProducts(category, shopName, data);
  } catch (error) {
    console.error(`Failed to save shop data for ${category}/${shopName}:`, error);
    throw error;
  }
}

/**
 * すべてのカテゴリ・ショップ名のリストを取得
 */
export async function getAllShops(): Promise<{ category: string; shops: string[] }[]> {
  try {
    return await getShopsFromDB();
  } catch (error) {
    console.error("Failed to get all shops:", error);
    return [];
  }
}

/**
 * すべての商品(Product)を配列で取得
 */
export async function getAllProducts(): Promise<Product[]> {
  try {
    return await getAllProductsFromDB();
  } catch (error) {
    console.error("Failed to get all products:", error);
    return [];
  }
}