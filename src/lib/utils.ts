// src\lib\utils.ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * JANコードをカンマ区切り配列に変換
 */
export function splitJan(value: any): string[] {
  if (!value) return [];
  return String(value)
    .replace(/\r\n|\r|\n/g, ",")
    .replace(/、/g, ",")
    .split(",")
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

/**
 * 手数料・FBA料金の正規化
 * @param val 値
 * @param isPercent trueの場合はパーセント表記
 */
export function normalizeFee(val: any, isPercent: boolean = false): number | null {
  if (
    val === undefined ||
    val === null ||
    (typeof val === "string" &&
      (val.trim() === "" || val.trim() === "-" || val.trim().toLowerCase() === "nan"))
  ) {
    return null;
  }
  let num = Number(val);
  if (isNaN(num)) return null;
  if (isPercent) {
    if (num === 0) return 0;
    if (num < 1) return Math.round(num * 100);
    return Math.round(num);
  }
  return num;
}
