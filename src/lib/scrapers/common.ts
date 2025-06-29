import axios from "axios";
import { HttpsProxyAgent } from "https-proxy-agent";
import puppeteer, { Browser, Page } from "puppeteer";

// 環境変数からプロキシ設定を取得
const USE_PROXY = process.env.USE_PROXY === "true";
const PROXY_SERVER = process.env.PROXY_SERVER || "http://150.61.8.70:10080";
const PROXY_USER = process.env.PROXY_USER || "aww085089";
const PROXY_PASS = process.env.PROXY_PASS || "tttt8820+";

console.log(`🔧 Proxy configuration: ${USE_PROXY ? "ENABLED" : "DISABLED"}`);
if (USE_PROXY) {
  console.log(`📡 Proxy server: ${PROXY_SERVER}`);
}

// Axiosインスタンスの作成（プロキシ設定は条件付き）
export const axiosWithProxy = axios.create({
  ...(USE_PROXY && {
    httpAgent: new HttpsProxyAgent(PROXY_SERVER),
    httpsAgent: new HttpsProxyAgent(PROXY_SERVER),
    proxy: false,
  }),
  headers: {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
  },
  timeout: 30000, // 30秒タイムアウト
});

/**
 * Puppeteerブラウザを起動（プロキシ設定は条件付き）
 */
export async function launchPuppeteerWithProxy(): Promise<{
  browser: Browser;
  page: Page;
}> {
  const launchOptions: any = {
    headless: true,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-accelerated-2d-canvas",
      "--no-first-run",
      "--no-zygote",
      "--disable-gpu",
      "--disable-web-security",
      "--disable-features=VizDisplayCompositor",
      "--disable-background-timer-throttling",
      "--disable-backgrounding-occluded-windows",
      "--disable-renderer-backgrounding",
    ],
  };

  // プロキシが有効な場合のみプロキシサーバーを設定
  if (USE_PROXY) {
    launchOptions.args.push(`--proxy-server=${PROXY_SERVER}`);
    console.log(`🚀 Launching Puppeteer with proxy: ${PROXY_SERVER}`);
  } else {
    console.log(`🚀 Launching Puppeteer without proxy`);
  }

  const browser = await puppeteer.launch(launchOptions);
  const page = await browser.newPage();

  // プロキシ認証（プロキシが有効で認証情報がある場合のみ）
  if (USE_PROXY && PROXY_USER && PROXY_PASS) {
    await page.authenticate({
      username: PROXY_USER,
      password: PROXY_PASS,
    });
    console.log(`🔐 Proxy authentication configured`);
  }

  // ページ設定
  await page.setViewport({ width: 1920, height: 1080 });
  await page.setUserAgent(
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
  );

  // リクエストインターセプト（画像やCSS等の不要なリソースをブロック）
  await page.setRequestInterception(true);
  page.on('request', (req) => {
    const resourceType = req.resourceType();
    if (['image', 'stylesheet', 'font', 'media'].includes(resourceType)) {
      req.abort();
    } else {
      req.continue();
    }
  });

  return { browser, page };
}

/**
 * プロキシ設定の状態を取得
 */
export function getProxyStatus() {
  return {
    enabled: USE_PROXY,
    server: USE_PROXY ? PROXY_SERVER : null,
    hasAuth: USE_PROXY && !!(PROXY_USER && PROXY_PASS),
  };
}

/**
 * 接続テスト用の関数
 */
export async function testConnection(url: string = "https://httpbin.org/ip"): Promise<{
  success: boolean;
  ip?: string;
  error?: string;
  proxyUsed: boolean;
}> {
  try {
    console.log(`🧪 Testing connection to: ${url}`);
    const response = await axiosWithProxy.get(url);
    
    return {
      success: true,
      ip: response.data?.origin || "unknown",
      proxyUsed: USE_PROXY,
    };
  } catch (error) {
    console.error(`❌ Connection test failed:`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      proxyUsed: USE_PROXY,
    };
  }
}