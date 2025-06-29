// src\lib\scrapers\official\dhc.ts
import { Product, ShopData } from "@/types/product";
import { launchPuppeteerWithProxy, getProxyStatus } from "../common";

const CATEGORY_URLS = [
  "https://www.dhc.co.jp/goods/cagoods.jsp?cCode=10115000&sc_iid=catop_skin_sl_10115000",
  "https://www.dhc.co.jp/goods/cagoods.jsp?cCode=10118000",
  "https://www.dhc.co.jp/goods/cagoods.jsp?cCode=10164000",
  "https://www.dhc.co.jp/goods/cagoods.jsp?cCode=10116000",
  "https://www.dhc.co.jp/goods/cagoods.jsp?cCode=11801000",
  "https://www.dhc.co.jp/goods/cagoods.jsp?cCode=10132000",
  "https://www.dhc.co.jp/goods/cagoods.jsp?cCode=10155000",
  "https://www.dhc.co.jp/goods/cagoods.jsp?cCode=11622002",
];

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function scrapeDHC(): Promise<ShopData> {
  const proxyStatus = getProxyStatus();
  console.log(`🏪 Starting DHC scraping...`);
  console.log(`📡 Proxy status: ${proxyStatus.enabled ? "ENABLED" : "DISABLED"}`);
  
  const { browser, page } = await launchPuppeteerWithProxy();
  let allProducts: Product[] = [];

  try {
    for (const url of CATEGORY_URLS) {
      console.log(`\n==== Scraping category: ${url} ====`);
      await page.goto(url, { waitUntil: "networkidle2", timeout: 60000 });
      await wait(2000);

      let pageNum = 1;
      let hasNext = true;
      while (hasNext) {
        try {
          await page.waitForSelector("#goods > li", { timeout: 10000 });
        } catch (error) {
          console.log(`⚠️ No products found on page ${pageNum}, moving to next category`);
          break;
        }

        // 商品リスト取得
        const products: Product[] = await page.evaluate(() => {
          const items = Array.from(document.querySelectorAll("#goods > li"));
          const now = new Date().toISOString();
          return items.map((li) => {
            const imgElem = li.querySelector(".img_box a img");
            let imageUrl = imgElem?.getAttribute("data-src") || imgElem?.getAttribute("src") || "";
            if (imageUrl && !imageUrl.startsWith("http")) {
              imageUrl = "https://www.dhc.co.jp" + imageUrl;
            }
            if (imageUrl.includes("noimage")) {
              imageUrl = "";
            }
            const name = li.querySelector(".name_box .name a")?.textContent?.trim() || "";

            const price1Text =
              li.querySelector(".price_box .price1")?.textContent?.replace(/[,¥円\s]/g, "") || "";
            const price2Text =
              li.querySelector(".price_box .price2 strong")?.textContent?.replace(/[,¥円\s]/g, "") ||
              "";

            let price: number | undefined = undefined;
            let salePrice: number | undefined = undefined;
            if (price1Text) {
              price = parseInt(price1Text, 10);
              if (price2Text) {
                salePrice = parseInt(price2Text, 10);
              }
            } else if (price2Text) {
              price = parseInt(price2Text, 10);
            }

            if (isNaN(price as number)) price = undefined;
            if (isNaN(salePrice as number)) salePrice = undefined;

            return {
              name,
              imageUrl,
              price,
              salePrice,
              asins: undefined,
              updatedAt: now,
            };
          });
        });

        if (products.length === 0) {
          console.log(`No products in DOM on page ${pageNum}. Scraping finished for this category.`);
          break;
        }

        allProducts = allProducts.concat(products);
        console.log(`📦 Page ${pageNum} scraped. Products so far: ${allProducts.length}`);

        // 「次へ」ボタンの有無を判定
        hasNext = await page.evaluate(() => {
          const nextBtn = document.querySelector(".page-link.next");
          return (
            !!nextBtn &&
            !nextBtn.hasAttribute("disabled") &&
            !nextBtn.classList.contains("disabled") &&
            nextBtn.getAttribute("aria-disabled") !== "true"
          );
        });

        if (!hasNext) break;

        // 1件目の商品名でページ遷移を検知
        const firstProductName = await page.evaluate(() => {
          const first = document.querySelector("#goods > li .name_box .name a");
          return first?.textContent?.trim() || "";
        });

        // 「次へ」ボタンをクリック
        await page.evaluate(() => {
          const btn = document.querySelector(".page-link.next") as HTMLElement;
          if (btn) btn.click();
        });

        // 商品リストの1件目が変わるまで待つ（最大10秒）
        const maxWait = 10000;
        const interval = 200;
        let waited = 0;
        while (waited < maxWait) {
          await wait(interval);
          const newFirstProductName = await page.evaluate(() => {
            const first = document.querySelector("#goods > li .name_box .name a");
            return first?.textContent?.trim() || "";
          });
          if (newFirstProductName && newFirstProductName !== firstProductName) {
            break;
          }
          waited += interval;
        }
        await wait(1000); // 念のため1秒待つ

        pageNum++;
      }
    }
  } catch (error) {
    console.error(`❌ DHC scraping error:`, error);
    throw error;
  } finally {
    await browser.close();
  }

  console.log(`✅ DHC scraping completed. Total products: ${allProducts.length}`);
  console.log(`📡 Proxy was ${proxyStatus.enabled ? "ENABLED" : "DISABLED"} during scraping`);

  return {
    lastUpdated: new Date().toISOString(),
    products: allProducts,
  };
}