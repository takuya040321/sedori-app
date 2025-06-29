// src/lib/data-loader.ts

import { ShopData, Product } from "@/types/product";
import { promises as fs } from "fs";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "src/data/products");

/**
 * 指定したカテゴリ・ショップのデータを読み込む
 */
export async function loadShopData(category: string, shopName: string): Promise<ShopData> {
  try {
    const filePath = path.join(DATA_DIR, category, `${shopName}.json`);
    const fileContent = await fs.readFile(filePath, "utf-8");
    const json = JSON.parse(fileContent);

    // 保険: productsが配列でなければ空配列に
    if (!Array.isArray(json.products)) {
      json.products = [];
    }

    return json;
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
    const dirPath = path.join(DATA_DIR, category);
    const filePath = path.join(dirPath, `${shopName}.json`);

    // ディレクトリがなければ作成
    await fs.mkdir(dirPath, { recursive: true });

    await fs.writeFile(filePath, JSON.stringify(data, null, 2));
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
    // データディレクトリが存在しない場合は作成
    await fs.mkdir(DATA_DIR, { recursive: true });
    
    const categories = await fs.readdir(DATA_DIR);
    const result: { category: string; shops: string[] }[] = [];

    for (const category of categories) {
      const categoryPath = path.join(DATA_DIR, category);
      const stat = await fs.stat(categoryPath);

      if (stat.isDirectory()) {
        const files = await fs.readdir(categoryPath);
        const shops = files
          .filter((file) => file.endsWith(".json"))
          .map((file) => file.replace(".json", ""));

        result.push({ category, shops });
      }
    }

    return result;
  } catch (error) {
    console.error("Failed to get all shops:", error);
    return [];
  }
}

/**
 * すべての商品(Product)を配列で取得
 */
export async function getAllProducts(): Promise<Product[]> {
  const shops = await getAllShops();
  const allProducts: Product[] = [];

  for (const { category, shops: shopNames } of shops) {
    for (const shopName of shopNames) {
      const shopData = await loadShopData(category, shopName);
      // 安全対策: productsが配列でなければ何も追加しない
      if (Array.isArray(shopData.products)) {
        allProducts.push(...shopData.products);
      } else {
        console.warn(
          `shopData.productsが配列ではありません: category=${category}, shopName=${shopName}, products=`,
          shopData.products,
        );
      }
    }
  }

  return allProducts;
}