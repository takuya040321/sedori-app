import { NextRequest, NextResponse } from 'next/server'
import { scrapeDHC } from '@/lib/scrapers/official/dhc'
import { saveShopData } from '@/lib/data-loader'

export async function POST(request: NextRequest) {
  try {
    // Perform scraping
    const scrapedData = await scrapeDHC()
    
    // Save the data
    await saveShopData('official', 'dhc', scrapedData)
    
    return NextResponse.json({
      success: true,
      message: `DHC の商品情報を更新しました (${scrapedData.products.length}件)`,
      data: scrapedData,
      updatedCount: scrapedData.products.length
    })
  } catch (error) {
    console.error('DHC scraping error:', error)
    
    return NextResponse.json({
      success: false,
      message: 'スクレイピング中にエラーが発生しました',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}