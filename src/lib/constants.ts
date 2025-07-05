// src/lib/constants.ts
// アプリケーション全体で使用する定数を定義

export const STORAGE_KEYS = {
  TABLE_DISPLAY_SETTINGS: "shopscaper-table-display-settings",
  USER_DISCOUNT_SETTINGS: "shopscaper-user-discount-settings",
} as const;

export const API_ENDPOINTS = {
  PRODUCTS: "/api/products",
  SCRAPING: "/api/scraping",
  ASIN_INFO: "/api/asin-info",
  ASIN_UPLOAD: "/api/asin-upload",
  ASIN_DANGEROUS_GOODS: "/api/asin-dangerous-goods",
  ASIN_PARTNER_CARRIER: "/api/asin-partner-carrier",
  ASIN_INFO_UPDATE: "/api/asin-info-update",
  BRANDS: "/api/brands",
  PROXY_STATUS: "/api/proxy-status",
} as const;

export const VALIDATION_RULES = {
  ASIN_LENGTH: 10,
  ASIN_PATTERN: /^[A-Z0-9]{10}$/,
  MAX_MEMO_LENGTH: 1000,
  MAX_PRODUCT_NAME_LENGTH: 500,
  MIN_PRICE: 0,
  MAX_PRICE: 999999999,
  MAX_DISCOUNT_RATE: 50,
} as const;

export const UI_CONFIG = {
  DEBOUNCE_DELAY: 1000,
  ANIMATION_DURATION: 300,
  TOAST_DURATION: 3000,
  TABLE_MIN_COLUMN_WIDTH: 60,
  IMAGE_HOVER_DELAY: 200,
} as const;

export const SHOP_BRANDS = {
  VT_COSMETICS: "vt-cosmetics",
  DHC: "dhc",
} as const;

export const ERROR_MESSAGES = {
  INVALID_ASIN: "ASINは10桁の英数字で入力してください",
  NETWORK_ERROR: "ネットワークエラーが発生しました",
  SERVER_ERROR: "サーバーエラーが発生しました",
  VALIDATION_ERROR: "入力内容に誤りがあります",
  NOT_FOUND: "データが見つかりません",
  UNAUTHORIZED: "認証が必要です",
  FORBIDDEN: "アクセス権限がありません",
} as const;

export const SUCCESS_MESSAGES = {
  ASIN_ADDED: "ASINを追加しました",
  ASIN_REMOVED: "ASINを削除しました",
  MEMO_UPDATED: "メモを更新しました",
  SETTINGS_SAVED: "設定を保存しました",
  PRODUCT_DUPLICATED: "商品を複製しました",
  PRODUCT_DELETED: "商品を削除しました",
  SCRAPING_COMPLETED: "スクレイピングが完了しました",
} as const;