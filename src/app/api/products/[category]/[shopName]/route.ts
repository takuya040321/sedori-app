// src\app\api\products\[category]\[shopName]\route.ts

import { NextResponse } from "next/server";
import { loadShopData } from "@/lib/data-loader";

export async function GET(
  request: Request,
  { params }: { params: { category: string; shopName: string } },
) {
  const { category, shopName } = params;
  try {
    const shopData = await loadShopData(category, shopName);
    return NextResponse.json({ success: true, data: shopData });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "データ取得に失敗しました" },
      { status: 500 },
    );
  }
}
