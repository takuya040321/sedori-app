import { Product, ShopData } from '@/types/product'
import { sleep } from '@/lib/utils'

// Mock scraper for DHC
export async function scrapeDHC(): Promise<ShopData> {
  // Simulate scraping delay
  await sleep(1500 + Math.random() * 2500)
  
  const mockProducts: Product[] = [
    {
      productName: "DHC 薬用ディープクレンジングオイル 200ml",
      imageUrl: "https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=300&h=300&fit=crop",
      price: 2750,
      salePrice: 2200,
      asin: "DHC001",
      updatedAt: new Date().toISOString()
    },
    {
      productName: "DHC コエンザイムQ10 クリーム 50g",
      imageUrl: "https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=300&h=300&fit=crop",
      price: 4180,
      asin: "DHC002",
      updatedAt: new Date().toISOString()
    },
    {
      productName: "DHC ビタミンC 60日分 120粒",
      imageUrl: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=300&h=300&fit=crop",
      price: 990,
      salePrice: 792,
      asin: "DHC003",
      updatedAt: new Date().toISOString()
    },
    {
      productName: "DHC 薬用リップクリーム 1.5g",
      imageUrl: "https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=300&h=300&fit=crop",
      price: 770,
      asin: "DHC004",
      updatedAt: new Date().toISOString()
    },
    {
      productName: "DHC マイルドローション 180ml",
      imageUrl: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=300&h=300&fit=crop",
      price: 3080,
      salePrice: 2464,
      asin: "DHC005",
      updatedAt: new Date().toISOString()
    },
    {
      productName: "DHC 薬用アクネコントロール ミルク 160ml",
      imageUrl: "https://images.unsplash.com/photo-1611930022073-b7a4ba5fcccd?w=300&h=300&fit=crop",
      price: 1760,
      asin: "DHC006",
      updatedAt: new Date().toISOString()
    },
    {
      productName: "DHC コラーゲン 60日分 360粒",
      imageUrl: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=300&h=300&fit=crop",
      price: 2160,
      salePrice: 1728,
      asin: "DHC007",
      updatedAt: new Date().toISOString()
    },
    {
      productName: "DHC 薬用PWクリーム 50g",
      imageUrl: "https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=300&h=300&fit=crop",
      price: 7700,
      asin: "DHC008",
      updatedAt: new Date().toISOString()
    },
    {
      productName: "DHC 薬用カムCホワイトニング 25ml",
      imageUrl: "https://images.unsplash.com/photo-1570194065650-d99fb4bedf0a?w=300&h=300&fit=crop",
      price: 4950,
      salePrice: 3960,
      asin: "DHC009",
      updatedAt: new Date().toISOString()
    },
    {
      productName: "DHC 薬用スキンケアセット",
      imageUrl: "https://images.unsplash.com/photo-1612817288484-6f916006741a?w=300&h=300&fit=crop",
      price: 8800,
      salePrice: 7040,
      asin: "DHC010",
      updatedAt: new Date().toISOString()
    },
    {
      productName: "DHC フォースコリー 60日分 240粒",
      imageUrl: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=300&h=300&fit=crop",
      price: 2932,
      asin: "DHC011",
      updatedAt: new Date().toISOString()
    },
    {
      productName: "DHC 薬用ホワイトニングセラム 30ml",
      imageUrl: "https://images.unsplash.com/photo-1570194065650-d99fb4bedf0a?w=300&h=300&fit=crop",
      price: 5500,
      salePrice: 4400,
      asin: "DHC012",
      updatedAt: new Date().toISOString()
    }
  ]
  
  return {
    lastUpdated: new Date().toISOString(),
    products: mockProducts
  }
}