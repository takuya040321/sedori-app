// src/app/api/brands/route.ts
import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

export async function GET() {
  const officialDir = path.join(process.cwd(), "src/data/products/official");
  try {
    // ディレクトリが存在しない場合は作成
    await fs.mkdir(officialDir, { recursive: true });
    
    const files = await fs.readdir(officialDir);
    // .jsonファイルだけを抽出し拡張子を除去
    const brands = files
      .filter((file) => file.endsWith(".json"))
      .map((file) => file.replace(/\.json$/, ""));
    return NextResponse.json(brands);
  } catch (e) {
    return NextResponse.json([], { status: 500 });
  }
}