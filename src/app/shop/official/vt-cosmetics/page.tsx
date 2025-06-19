import { Header } from '@/components/layout/Header'
import { PageContainer } from '@/components/layout/PageContainer'
import { ProductGrid } from '@/components/product-list/ProductGrid'
import { ScrapingButton } from '@/components/product-list/ScrapingButton'
import { loadShopData } from '@/lib/data-loader'

export default async function VTCosmeticsPage() {
  const shopData = await loadShopData('official', 'vt-cosmetics')

  const handleScrape = async () => {
    'use server'
    // This will be handled by the API route
    return { success: true, message: 'スクレイピングが完了しました', updatedCount: 10 }
  }

  return (
    <div className="h-full">
      <Header title="VT Cosmetics Official" />
      <PageContainer>
        {/* Page Header with Scraping Button */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gradient mb-2">VT Cosmetics 商品一覧</h2>
            <p className="text-gray-400">
              最終更新: {new Date(shopData.lastUpdated).toLocaleString('ja-JP')}
            </p>
          </div>
          <ScrapingButton 
            shopName="VT Cosmetics"
            onScrape={async () => {
              const response = await fetch('/api/scraping/official/vt-cosmetics', {
                method: 'POST'
              })
              return await response.json()
            }}
          />
        </div>

        {/* Product Grid */}
        <ProductGrid products={shopData.products} />
      </PageContainer>
    </div>
  )
}