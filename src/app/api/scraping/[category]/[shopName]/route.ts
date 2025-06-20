// src\app\api\scraping\[category]\[shopName]\route.ts
import { NextResponse } from "next/server";
import { scrapeDHC } from "@/lib/scrapers/official/dhc";
import { scrapeVT } from "@/lib/scrapers/official/vt-cosmetics";
import { saveShopData } from "@/lib/data-loader";

// 他ショップのスクレイパーも必要に応じてimport

export async function POST(
  request: Request,
  { params }: { params: { category: string; shopName: string } }
) {
  const { category, shopName } = params;

  try {
    let scrapedData;

    // ショップごとにスクレイパーを分岐
    if (category === "official" && shopName === "dhc") {
      scrapedData = await scrapeDHC();
    } else if (category === "official" && shopName === "vt-cosmetics") {
      scrapedData = await scrapeVT();
    } else {
      return NextResponse.json(
        { success: false, message: "未対応のショップです" },
        { status: 400 }
      );
    }

    // データ保存
    await saveShopData(category, shopName, scrapedData);

    return NextResponse.json({
      success: true,
      message: `${shopName} の商品情報を更新しました (${scrapedData.products.length}件)`,
      data: scrapedData,
      updatedCount: scrapedData.products.length,
    });
  } catch (error) {
    console.error(`${shopName} scraping error:`, error);

    return NextResponse.json(
      {
        success: false,
        message: "スクレイピング中にエラーが発生しました",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}