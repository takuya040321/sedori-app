// src/app/api/proxy-status/route.ts
import { NextResponse } from "next/server";
import { getProxyStatus, testConnection } from "@/lib/scrapers/common";

export async function GET() {
  try {
    const proxyStatus = getProxyStatus();
    
    // 接続テストを実行
    const connectionTest = await testConnection();
    
    return NextResponse.json({
      success: true,
      proxy: proxyStatus,
      connectionTest,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}