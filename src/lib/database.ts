// src/lib/database.ts
// ファイルベースのデータベース操作

import { Product, AsinInfo, ShopData } from '@/types/product';
import { promises as fs } from 'fs';
import path from 'path';

// ショップ情報を取得
export async function getShop(category: string, shopName: string) {
  // ファイルベースシステムでは、ショップ情報はファイルの存在で判定
  const filePath = path.join(process.cwd(), 'src/data/products', category, `${shopName}.json`);
  
  try {
    await fs.access(filePath);
    return { id: `${category}-${shopName}`, category, name: shopName, last_updated: new Date().toISOString() };
  } catch (error) {
    return null;
  }
}

// 商品一覧を取得
export async function getProducts(category: string, shopName: string): Promise<ShopData> {
  const filePath = path.join(process.cwd(), 'src/data/products', category, `${shopName}.json`);
  
  try {
    const fileData = await fs.readFile(filePath, 'utf-8');
    const shopData = JSON.parse(fileData) as ShopData;
    return shopData;
  } catch (error) {
    console.error(`Failed to load products for ${category}/${shopName}:`, error);
    return {
      lastUpdated: new Date().toISOString(),
      products: [],
    };
  }
}

// 商品を保存
export async function saveProducts(category: string, shopName: string, shopData: ShopData) {
  const dirPath = path.join(process.cwd(), 'src/data/products', category);
  const filePath = path.join(dirPath, `${shopName}.json`);
  
  try {
    // ディレクトリが存在しない場合は作成
    await fs.mkdir(dirPath, { recursive: true });
    
    // ファイルに保存
    await fs.writeFile(filePath, JSON.stringify(shopData, null, 2), 'utf-8');
  } catch (error) {
    console.error(`Failed to save products for ${category}/${shopName}:`, error);
    throw error;
  }
}

// ASIN情報を取得
export async function getAsinInfo(asin: string, brand: string): Promise<AsinInfo | null> {
  const filePath = path.join(process.cwd(), 'src/data/asin', `${brand}.json`);
  
  try {
    const fileData = await fs.readFile(filePath, 'utf-8');
    const asinList = JSON.parse(fileData) as AsinInfo[];
    const asinInfo = asinList.find(item => item.asin === asin);
    return asinInfo || null;
  } catch (error) {
    console.error(`Failed to load ASIN info for ${asin}:`, error);
    return null;
  }
}

// ASIN情報を保存
export async function saveAsinInfo(asinInfo: AsinInfo) {
  const dirPath = path.join(process.cwd(), 'src/data/asin');
  const filePath = path.join(dirPath, `${asinInfo.brand}.json`);
  
  try {
    // ディレクトリが存在しない場合は作成
    await fs.mkdir(dirPath, { recursive: true });
    
    let asinList: AsinInfo[] = [];
    
    // 既存のファイルがある場合は読み込み
    try {
      const fileData = await fs.readFile(filePath, 'utf-8');
      asinList = JSON.parse(fileData);
    } catch (error) {
      // ファイルが存在しない場合は新規作成
    }
    
    // 既存のASINを更新または新規追加
    const existingIndex = asinList.findIndex(item => item.asin === asinInfo.asin);
    if (existingIndex !== -1) {
      asinList[existingIndex] = asinInfo;
    } else {
      asinList.push(asinInfo);
    }
    
    // ファイルに保存
    await fs.writeFile(filePath, JSON.stringify(asinList, null, 2), 'utf-8');
  } catch (error) {
    console.error(`Failed to save ASIN info for ${asinInfo.asin}:`, error);
    throw error;
  }
}

// 全ショップ一覧を取得
export async function getAllShops() {
  const productsDir = path.join(process.cwd(), 'src/data/products');
  
  try {
    // ディレクトリが存在しない場合は作成
    await fs.mkdir(productsDir, { recursive: true });
    
    const categories = await fs.readdir(productsDir);
    const result: { category: string; shops: string[] }[] = [];
    
    for (const category of categories) {
      const categoryPath = path.join(productsDir, category);
      const stat = await fs.stat(categoryPath);
      
      if (stat.isDirectory()) {
        const files = await fs.readdir(categoryPath);
        const shops = files
          .filter(file => file.endsWith('.json'))
          .map(file => file.replace('.json', ''));
        
        if (shops.length > 0) {
          result.push({ category, shops });
        }
      }
    }
    
    return result;
  } catch (error) {
    console.error('Failed to get all shops:', error);
    return [];
  }
}

// 全商品を取得
export async function getAllProducts(): Promise<Product[]> {
  const allProducts: Product[] = [];
  const shops = await getAllShops();
  
  for (const { category, shops: shopNames } of shops) {
    for (const shopName of shopNames) {
      try {
        const shopData = await getProducts(category, shopName);
        allProducts.push(...shopData.products);
      } catch (error) {
        console.error(`Failed to load products for ${category}/${shopName}:`, error);
      }
    }
  }
  
  return allProducts;
}