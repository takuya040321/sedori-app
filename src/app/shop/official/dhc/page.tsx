import { Header } from '@/components/layout/Header'
import { PageContainer } from '@/components/layout/PageContainer'
import { ProductGrid } from '@/components/product-list/ProductGrid'
import { ScrapingButton } from '@/components/product-list/ScrapingButton'
import { loadShopData } from '@/lib/data-loader'

export default async function DHCPage() {
  const shopData = await loadShopData('official', 'dhc')

  return (
    <div className="h-full">
      <Header title="DHC Official" />
      <PageContainer>
        {/* Page Header with Scraping Button */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gradient mb-2">DHC 商品一覧</h2>
            <p className="text-gray-400">
              最終更新: {new Date(shopData.lastUpdated).toLocaleString('ja-JP')}
            </p>
          </div>
          <ScrapingButton 
            shopName="DHC"
            onScrape={async () => {
              const response = await fetch('/api/scraping/official/dhc', {
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