import { NextRequest, NextResponse } from 'next/server'
import { scrapeVTCosmetics } from '@/lib/scrapers/official/vt-cosmetics'
import { saveShopData } from '@/lib/data-loader'

export async function POST(request: NextRequest) {
  try {
    // Perform scraping
    const scrapedData = await scrapeVTCosmetics()
    
    // Save the data
    await saveShopData('official', 'vt-cosmetics', scrapedData)
    
    return NextResponse.json({
      success: true,
      message: `VT Cosmetics の商品情報を更新しました (${scrapedData.products.length}件)`,
      data: scrapedData,
      updatedCount: scrapedData.products.length
    })
  } catch (error) {
    console.error('VT Cosmetics scraping error:', error)
    
    return NextResponse.json({
      success: false,
      message: 'スクレイピング中にエラーが発生しました',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}