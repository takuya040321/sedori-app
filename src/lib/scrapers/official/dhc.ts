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
    // ページ設定を追加
    await page.setDefaultNavigationTimeout(60000);
    await page.setDefaultTimeout(30000);

    for (const url of CATEGORY_URLS) {
      console.log(`\n==== Scraping category: ${url} ====`);
      
      try {
        await page.goto(url, { 
          waitUntil: "networkidle2", 
          timeout: 60000 
        });
        await wait(3000); // 少し長めに待機

        let pageNum = 1;
        let hasNext = true;
        let consecutiveEmptyPages = 0;

        while (hasNext && consecutiveEmptyPages < 3) {
          try {
            // 商品リストの存在確認（より柔軟に）
            const hasProducts = await page.evaluate(() => {
              const goods = document.querySelector("#goods");
              const items = goods ? goods.querySelectorAll("li") : [];
              return items.length > 0;
            });

            if (!hasProducts) {
              console.log(`⚠️ No products container found on page ${pageNum}`);
              consecutiveEmptyPages++;
              
              // 次ページボタンがあるかチェック
              const hasNextButton = await page.evaluate(() => {
                const nextBtn = document.querySelector(".page-link.next");
                return !!nextBtn && 
                       !nextBtn.hasAttribute("disabled") && 
                       !nextBtn.classList.contains("disabled");
              });

              if (!hasNextButton) {
                break;
              }

              // 次ページに進む
              await page.evaluate(() => {
                const btn = document.querySelector(".page-link.next") as HTMLElement;
                if (btn) btn.click();
              });
              await wait(3000);
              pageNum++;
              continue;
            }

            // 商品リスト取得
            const products: Product[] = await page.evaluate(() => {
              const items = Array.from(document.querySelectorAll("#goods > li"));
              const now = new Date().toISOString();
              
              return items
                .filter(li => {
                  // 商品名があるかチェック
                  const nameElem = li.querySelector(".name_box .name a");
                  return nameElem && nameElem.textContent && nameElem.textContent.trim().length > 0;
                })
                .map((li) => {
                  const imgElem = li.querySelector(".img_box a img");
                  let imageUrl = imgElem?.getAttribute("data-src") || 
                                imgElem?.getAttribute("src") || "";
                  
                  if (imageUrl && !imageUrl.startsWith("http")) {
                    imageUrl = "https://www.dhc.co.jp" + imageUrl;
                  }
                  if (imageUrl.includes("noimage")) {
                    imageUrl = "";
                  }

                  const name = li.querySelector(".name_box .name a")?.textContent?.trim() || "";

                  // 価格情報の取得を改善
                  const priceBox = li.querySelector(".price_box");
                  let price: number | undefined = undefined;
                  let salePrice: number | undefined = undefined;

                  if (priceBox) {
                    const price1Elem = priceBox.querySelector(".price1");
                    const price2Elem = priceBox.querySelector(".price2 strong");
                    
                    const price1Text = price1Elem?.textContent?.replace(/[,¥円\s]/g, "") || "";
                    const price2Text = price2Elem?.textContent?.replace(/[,¥円\s]/g, "") || "";

                    if (price1Text && price2Text) {
                      // 両方ある場合：price1が通常価格、price2がセール価格
                      price = parseInt(price1Text, 10);
                      salePrice = parseInt(price2Text, 10);
                    } else if (price2Text) {
                      // price2のみの場合：通常価格
                      price = parseInt(price2Text, 10);
                    } else if (price1Text) {
                      // price1のみの場合：通常価格
                      price = parseInt(price1Text, 10);
                    }
                  }

                  // 価格が無効な場合はスキップ
                  if (!price || isNaN(price) || price <= 0) {
                    return null;
                  }

                  if (salePrice && (isNaN(salePrice) || salePrice <= 0)) {
                    salePrice = undefined;
                  }

                  return {
                    name,
                    imageUrl,
                    price,
                    salePrice,
                    asins: undefined,
                    updatedAt: now,
                  };
                })
                .filter(product => product !== null) as Product[];
            });

            if (products.length === 0) {
              console.log(`📭 No valid products found on page ${pageNum}`);
              consecutiveEmptyPages++;
            } else {
              consecutiveEmptyPages = 0; // リセット
              allProducts = allProducts.concat(products);
              console.log(`📦 Page ${pageNum} scraped. Products: ${products.length}, Total: ${allProducts.length}`);
            }

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

            if (!hasNext) {
              console.log(`🏁 No more pages available`);
              break;
            }

            // ページ遷移前の商品名を記録
            const firstProductName = await page.evaluate(() => {
              const first = document.querySelector("#goods > li .name_box .name a");
              return first?.textContent?.trim() || "";
            });

            // 「次へ」ボタンをクリック
            await page.evaluate(() => {
              const btn = document.querySelector(".page-link.next") as HTMLElement;
              if (btn) btn.click();
            });

            // ページ遷移を待つ
            let transitionWaited = 0;
            const maxTransitionWait = 15000; // 15秒
            const checkInterval = 500;

            while (transitionWaited < maxTransitionWait) {
              await wait(checkInterval);
              transitionWaited += checkInterval;

              const newFirstProductName = await page.evaluate(() => {
                const first = document.querySelector("#goods > li .name_box .name a");
                return first?.textContent?.trim() || "";
              });

              if (newFirstProductName && newFirstProductName !== firstProductName) {
                console.log(`✅ Page transition detected`);
                break;
              }
            }

            await wait(2000); // 追加の安定化待機
            pageNum++;

          } catch (pageError) {
            console.error(`❌ Error on page ${pageNum}:`, pageError);
            consecutiveEmptyPages++;
            
            if (consecutiveEmptyPages >= 3) {
              console.log(`🛑 Too many consecutive errors, moving to next category`);
              break;
            }
            
            // エラー時も次ページに進む試行
            try {
              const hasNextButton = await page.evaluate(() => {
                const nextBtn = document.querySelector(".page-link.next");
                return !!nextBtn && 
                       !nextBtn.hasAttribute("disabled") && 
                       !nextBtn.classList.contains("disabled");
              });

              if (hasNextButton) {
                await page.evaluate(() => {
                  const btn = document.querySelector(".page-link.next") as HTMLElement;
                  if (btn) btn.click();
                });
                await wait(3000);
                pageNum++;
              } else {
                break;
              }
            } catch (nextError) {
              console.error(`❌ Failed to proceed to next page:`, nextError);
              break;
            }
          }
        }

      } catch (categoryError) {
        console.error(`❌ Error scraping category ${url}:`, categoryError);
        continue; // 次のカテゴリに進む
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