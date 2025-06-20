// src/app/shop/[category]/[shopName]/page.tsx

import { PageContainer } from "@/components/layout/PageContainer";
import { ProductTable } from "@/components/product-list/ProductTable";
import { ScrapingButton } from "@/components/product-list/ScrapingButton";
import { loadShopData } from "@/lib/data-loader";

interface Props {
  params: {
    category: string;
    shopName: string;
  };
}

export default async function ShopPage({ params }: Props) {
  const { category, shopName } = params;
  const shopData = await loadShopData(category, shopName);

  return (
    <div className="h-full">
      <PageContainer>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gradient mb-2">{shopName} 商品一覧</h2>
            <p className="text-gray-400">
              最終更新:{" "}
              {shopData?.lastUpdated
                ? new Date(shopData.lastUpdated).toLocaleString("ja-JP")
                : "データなし"}
            </p>
          </div>
          <ScrapingButton category={category} shopName={shopName} />
        </div>
        <ProductTable products={shopData?.products ?? []} category={category} shopName={shopName} />
      </PageContainer>
    </div>
  );
}