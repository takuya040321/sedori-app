// src/app/shop/[category]/[shopName]/page.tsx

import { loadShopData } from "@/lib/data-loader";
import ShopPageClient from "./ShopPageClient";

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
    <div className="min-h-screen w-full">
      <ShopPageClient category={category} shopName={shopName} shopData={shopData} />
    </div>
  );
}