// src\app\api\asin-upload\route.ts
import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { AsinInfo } from "@/types/product";

export async function POST(req: NextRequest) {
  try {
    const { brand, asinList } = (await req.json()) as {
      brand: string;
      asinList: AsinInfo[];
    };

    if (!brand || !Array.isArray(asinList)) {
      return NextResponse.json({ error: "Invalid data" }, { status: 400 });
    }

    const asinDir = path.join(process.cwd(), "src/data/asin");
    await fs.mkdir(asinDir, { recursive: true });

    const filePath = path.join(asinDir, `${brand}.json`);
    await fs.writeFile(filePath, JSON.stringify(asinList, null, 2), "utf-8");

    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: "Failed to save" }, { status: 500 });
  }
}
