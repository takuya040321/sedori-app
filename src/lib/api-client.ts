// src/lib/api-client.ts
// API呼び出しを統一化

import { API_ENDPOINTS, ERROR_MESSAGES } from "./constants";
import { AsinInfo, Product, FilterSettings } from "@/types/product";

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  details?: string;
}

export class ApiError extends Error {
  constructor(
    message: string,
    public status?: number,
    public details?: string
  ) {
    super(message);
    this.name = "ApiError";
  }
}

/**
 * 基本的なfetch wrapper
 */
async function apiRequest<T>(
  url: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new ApiError(
        data.message || ERROR_MESSAGES.SERVER_ERROR,
        response.status,
        data.details
      );
    }

    return data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    
    throw new ApiError(
      error instanceof Error ? error.message : ERROR_MESSAGES.NETWORK_ERROR
    );
  }
}

/**
 * 商品関連API
 */
export const productApi = {
  /**
   * 商品一覧を取得
   */
  async getProducts(category: string, shopName: string) {
    return apiRequest(`${API_ENDPOINTS.PRODUCTS}/${category}/${shopName}`);
  },

  /**
   * 商品のメモを更新
   */
  async updateMemo(category: string, shopName: string, index: number, memo: string) {
    return apiRequest(`${API_ENDPOINTS.PRODUCTS}/${category}/${shopName}/update-memo`, {
      method: "POST",
      body: JSON.stringify({ index, memo }),
    });
  },

  /**
   * 商品の非表示状態を更新
   */
  async updateHidden(category: string, shopName: string, index: number, hidden: boolean) {
    return apiRequest(`${API_ENDPOINTS.PRODUCTS}/${category}/${shopName}/update-hidden`, {
      method: "POST",
      body: JSON.stringify({ index, hidden }),
    });
  },

  /**
   * 商品を複製
   */
  async duplicateProduct(category: string, shopName: string, index: number, duplicatedProduct: Product) {
    return apiRequest(`${API_ENDPOINTS.PRODUCTS}/${category}/${shopName}/duplicate-product`, {
      method: "POST",
      body: JSON.stringify({ index, duplicatedProduct }),
    });
  },

  /**
   * 商品を削除
   */
  async deleteProduct(category: string, shopName: string, index: number) {
    return apiRequest(`${API_ENDPOINTS.PRODUCTS}/${category}/${shopName}/delete-product`, {
      method: "POST",
      body: JSON.stringify({ index }),
    });
  },

  /**
   * ASINを追加
   */
  async addAsin(category: string, shopName: string, productIndex: number, asinInfo: AsinInfo) {
    return apiRequest(`${API_ENDPOINTS.PRODUCTS}/${category}/${shopName}/add-asin`, {
      method: "POST",
      body: JSON.stringify({ productIndex, asinInfo }),
    });
  },

  /**
   * ASINを削除
   */
  async removeAsin(category: string, shopName: string, productIndex: number, asinIndex: number) {
    return apiRequest(`${API_ENDPOINTS.PRODUCTS}/${category}/${shopName}/remove-asin`, {
      method: "POST",
      body: JSON.stringify({ productIndex, asinIndex }),
    });
  },

  /**
   * ASIN情報を更新
   */
  async updateAsinInfo(category: string, shopName: string, productIndex: number, asinIndex: number, field: keyof AsinInfo, value: any) {
    return apiRequest(`${API_ENDPOINTS.PRODUCTS}/${category}/${shopName}/update-asin-info`, {
      method: "POST",
      body: JSON.stringify({ productIndex, asinIndex, field, value }),
    });
  },

  /**
   * 危険物フラグを更新
   */
  async updateDangerousGoods(category: string, shopName: string, productIndex: number, asinIndex: number, isDangerousGoods: boolean) {
    return apiRequest(`${API_ENDPOINTS.PRODUCTS}/${category}/${shopName}/update-asin-dangerous`, {
      method: "POST",
      body: JSON.stringify({ productIndex, asinIndex, isDangerousGoods }),
    });
  },

  /**
   * パートナーキャリア不可フラグを更新
   */
  async updatePartnerCarrier(category: string, shopName: string, productIndex: number, asinIndex: number, isPartnerCarrierUnavailable: boolean) {
    return apiRequest(`${API_ENDPOINTS.PRODUCTS}/${category}/${shopName}/update-asin-partner-carrier`, {
      method: "POST",
      body: JSON.stringify({ productIndex, asinIndex, isPartnerCarrierUnavailable }),
    });
  },
};

/**
 * ASIN関連API
 */
export const asinApi = {
  /**
   * ASIN情報を取得
   */
  async getAsinInfo(asin: string, brand: string) {
    const params = new URLSearchParams({ asin, brand });
    return apiRequest(`${API_ENDPOINTS.ASIN_INFO}?${params.toString()}`);
  },

  /**
   * ASIN一括アップロード
   */
  async uploadAsins(brand: string, asinList: AsinInfo[]) {
    return apiRequest(API_ENDPOINTS.ASIN_UPLOAD, {
      method: "POST",
      body: JSON.stringify({ brand, asinList }),
    });
  },

  /**
   * 危険物フラグを更新
   */
  async updateDangerousGoods(asin: string, brand: string, isDangerousGoods: boolean) {
    return apiRequest(API_ENDPOINTS.ASIN_DANGEROUS_GOODS, {
      method: "POST",
      body: JSON.stringify({ asin, brand, isDangerousGoods }),
    });
  },

  /**
   * パートナーキャリア不可フラグを更新
   */
  async updatePartnerCarrier(asin: string, brand: string, isPartnerCarrierUnavailable: boolean) {
    return apiRequest(API_ENDPOINTS.ASIN_PARTNER_CARRIER, {
      method: "POST",
      body: JSON.stringify({ asin, brand, isPartnerCarrierUnavailable }),
    });
  },

  /**
   * ASIN情報を更新
   */
  async updateAsinInfo(asin: string, brand: string, field: keyof AsinInfo, value: any) {
    return apiRequest(API_ENDPOINTS.ASIN_INFO_UPDATE, {
      method: "POST",
      body: JSON.stringify({ asin, brand, field, value }),
    });
  },
};

/**
 * スクレイピング関連API
 */
export const scrapingApi = {
  /**
   * スクレイピングを実行
   */
  async scrape(category: string, shopName: string) {
    return apiRequest(`${API_ENDPOINTS.SCRAPING}/${category}/${shopName}`, {
      method: "POST",
    });
  },
};

/**
 * その他のAPI
 */
export const miscApi = {
  /**
   * ブランド一覧を取得
   */
  async getBrands() {
    return apiRequest<string[]>(API_ENDPOINTS.BRANDS);
  },

  /**
   * プロキシ状態を取得
   */
  async getProxyStatus() {
    return apiRequest(API_ENDPOINTS.PROXY_STATUS);
  },
};