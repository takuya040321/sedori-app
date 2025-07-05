// src/app/api/products/[category]/[shopName]/delete-product/route.ts

import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

export async function POST(
  request: Request,
  { params }: { params: { category: string; shopName: string } },
) {
  const { category, shopName } = params;
  const { index } = await request.json();

  try {
    const filePath = path.resolve(
      process.cwd(),
      "src",
      "data",
      "products",
      category,
      `${shopName}.json`,
    );
    const fileData = await fs.readFile(filePath, "utf-8");
    const shopData = JSON.parse(fileData);

    if (!shopData.products || !shopData.products[index]) {
      return NextResponse.json(
        { success: false, message: "商品が見つかりません" },
        { status: 404 },
      );
    }

    // 削除する商品の情報を保存（ログ用）
    const deletedProduct = shopData.products[index];
    console.log(`Deleting product: ${deletedProduct.name} at index ${index}`);

    // 指定されたインデックスの商品を削除
    shopData.products.splice(index, 1);

    // ファイルに書き戻す
    await fs.writeFile(filePath, JSON.stringify(shopData, null, 2), "utf-8");

    return NextResponse.json({ 
      success: true, 
      message: "商品を削除しました",
      deletedProduct: deletedProduct.name
    });
  } catch (error) {
    console.error("商品削除エラー:", error);
    return NextResponse.json(
      { success: false, message: "ファイル書き込みエラー" },
      { status: 500 },
    );
  }
}