import { ShopData, Product } from "@/types/product";
import { promises as fs } from "fs";
import path from "path";

// productsディレクトリを挟むように修正
const DATA_DIR = path.join(process.cwd(), "src/data/products");

export async function loadShopData(category: string, shopName: string): Promise<ShopData> {
  try {
    const filePath = path.join(DATA_DIR, category, `${shopName}.json`);
    const fileContent = await fs.readFile(filePath, "utf-8");
    return JSON.parse(fileContent);
  } catch (error) {
    console.error(`Failed to load shop data for ${category}/${shopName}:`, error);
    return {
      lastUpdated: new Date().toISOString(),
      products: [],
    };
  }
}

export async function saveShopData(
  category: string,
  shopName: string,
  data: ShopData
): Promise<void> {
  try {
    const dirPath = path.join(DATA_DIR, category);
    const filePath = path.join(dirPath, `${shopName}.json`);

    // Ensure directory exists
    await fs.mkdir(dirPath, { recursive: true });

    await fs.writeFile(filePath, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error(`Failed to save shop data for ${category}/${shopName}:`, error);
    throw error;
  }
}

export async function getAllShops(): Promise<{ category: string; shops: string[] }[]> {
  try {
    const categories = await fs.readdir(DATA_DIR);
    const result = [];

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

export async function getAllProducts(): Promise<Product[]> {
  const shops = await getAllShops();
  const allProducts: Product[] = [];

  for (const { category, shops: shopNames } of shops) {
    for (const shopName of shopNames) {
      const shopData = await loadShopData(category, shopName);
      allProducts.push(...shopData.products);
    }
  }
  return allProducts;
}