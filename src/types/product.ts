export interface Product {
  productName: string;
  imageUrl: string;
  price: number;
  salePrice?: number;
  asin?: string;
  updatedAt: string;
}

export interface ShopData {
  lastUpdated: string;
  products: Product[];
}

export interface ShopInfo {
  category: string;
  shopName: string;
  displayName: string;
  icon: string;
}

export interface KPIData {
  totalProducts: number;
  activeShops: number;
  lastUpdated: string;
  priceChanges: number;
}

export interface ActivityItem {
  id: string;
  type: 'scraping' | 'price_change' | 'new_product';
  shop: string;
  message: string;
  timestamp: string;
  status: 'success' | 'error' | 'warning';
}