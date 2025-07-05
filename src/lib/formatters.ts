// src/lib/formatters.ts
// フォーマット関数を集約

/**
 * 数値を通貨形式でフォーマット
 */
export function formatCurrency(amount: number, currency: string = "円"): string {
  return `${amount.toLocaleString()}${currency}`;
}

/**
 * 数値をパーセント形式でフォーマット
 */
export function formatPercentage(value: number, decimals: number = 0): string {
  return `${value.toFixed(decimals)}%`;
}

/**
 * 日付をローカル形式でフォーマット
 */
export function formatDate(date: string | Date, options?: Intl.DateTimeFormatOptions): string {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  
  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  };

  return dateObj.toLocaleString("ja-JP", { ...defaultOptions, ...options });
}

/**
 * 文字列を指定した長さで切り詰め
 */
export function truncateText(text: string, maxLength: number = 40, suffix: string = "..."): string {
  if (!text) return "";
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + suffix;
}

/**
 * ファイルサイズをフォーマット
 */
export function formatFileSize(bytes: number): string {
  const units = ["B", "KB", "MB", "GB"];
  let size = bytes;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }

  return `${size.toFixed(1)} ${units[unitIndex]}`;
}

/**
 * 数値を安全に表示用文字列に変換
 */
export function formatNumber(value: number | null | undefined, fallback: string = "-"): string {
  if (value === null || value === undefined) return fallback;
  if (value === 0) return fallback;
  return value.toLocaleString();
}

/**
 * ブール値を日本語で表示
 */
export function formatBoolean(value: boolean | undefined, trueText: string = "あり", falseText: string = "なし"): string {
  return value ? trueText : falseText;
}