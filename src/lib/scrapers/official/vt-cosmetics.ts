// src\lib\scrapers\official\vt-cosmetics.ts
import { Product, ShopData } from "@/types/product";
import { axiosWithProxy } from "../common";
import * as cheerio from "cheerio";

const BASE_URL = "https://vtcosmetics.jp/category/all/56/";

export async function scrapeVT(): Promise<ShopData> {
  let page = 1;
  const products: Product[] = [];
  let hasNext = true;

  while (hasNext) {
    const url = page === 1 ? BASE_URL : `${BASE_URL}?page=${page}`;
    console.log(`Scraping: ${url}`);

    const response = await axiosWithProxy.get(url);
    const $ = cheerio.load(response.data);

    // 商品リストを抽出
    const items = $(".prdList > li.prdThumb");
    if (items.length === 0) {
      hasNext = false; // これでループを抜ける
      break;
    }

    items.each((_, el) => {
      const $el = $(el);
      const name = $el.find(".description a.name span").text().trim();
      let imageUrl = $el.find(".thumbnail .prdImg .img img").attr("src") || "";
      if (imageUrl.startsWith("//")) {
        imageUrl = "https:" + imageUrl;
      }
      const priceInfo = $el.find(".description .priceInfo");
      let price = priceInfo.attr("data-price") || "";
      let salePrice = priceInfo.attr("data-sale") || "";
      price = price.replace(/,|円/g, "").trim();
      salePrice = salePrice.replace(/,|円/g, "").trim();

      const priceNum = price ? parseInt(price, 10) : undefined;
      const salePriceNum = salePrice ? parseInt(salePrice, 10) : undefined;

      products.push({
        name,
        imageUrl,
        price: isNaN(priceNum as number) ? undefined : priceNum,
        salePrice: isNaN(salePriceNum as number) ? undefined : salePriceNum,
        asin: undefined,
        updatedAt: new Date().toISOString(),
      });
    });

    page++;
  }

  console.log(`Scraping finished. ${products.length} products scraped.`);

  return {
    lastUpdated: new Date().toISOString(),
    products,
  };
}