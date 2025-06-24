import axios from "axios";
import { HttpsProxyAgent } from "https-proxy-agent";
import puppeteer, { Browser, Page } from "puppeteer";

const PROXY_SERVER = "http://150.61.8.70:10080";
const PROXY_USER = "aww085089";
const PROXY_PASS = "tttt8820+";

const agent = new HttpsProxyAgent(PROXY_SERVER);
export const axiosWithProxy = axios.create({
  httpAgent: agent,
  httpsAgent: agent,
  proxy: false,
  headers: {
    "User-Agent": "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
  },
});

export async function launchPuppeteerWithProxy(): Promise<{
  browser: Browser;
  page: Page;
}> {
  const browser = await puppeteer.launch({
    headless: true,
    args: [`--proxy-server=${PROXY_SERVER}`],
  });
  const page = await browser.newPage();
  if (PROXY_USER && PROXY_PASS) {
    await page.authenticate({
      username: PROXY_USER,
      password: PROXY_PASS,
    });
  }
  return { browser, page };
}
