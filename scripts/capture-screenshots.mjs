import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";

const base = "http://127.0.0.1:5173";
const out = "/opt/cursor/artifacts/screenshots";
await mkdir(out, { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
await page.goto(base);
await page.screenshot({ path: `${out}/01-dashboard.png`, fullPage: true });
await page.goto(`${base}/lesson/d2-l1`);
await page.waitForTimeout(800);
await page.screenshot({ path: `${out}/02-day2-lesson-lab.png`, fullPage: true });
await page.goto(`${base}/lesson/d3-l1`);
await page.waitForTimeout(800);
await page.screenshot({ path: `${out}/03-day3-cost-lab.png`, fullPage: true });
await browser.close();
console.log("screenshots saved to", out);
