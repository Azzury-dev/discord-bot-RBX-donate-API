import puppeteer from "puppeteer";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const filePath = path.join(__dirname, "templates/donation.html");

async function takeScreenshot() {
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"]
  });

  const page = await browser.newPage();

  await page.goto(`file://${filePath}`, { waitUntil: "networkidle0" });

  await page.setViewport({ width: 900, height: 350 });

  const buffer = await page.screenshot({
    path: path.join(__dirname, "donation_test.png"),
    type: "png",
    omitBackground: true,
    clip: { x: 0, y: 0, width: 900, height: 350 }
  });

  await browser.close();
  console.log("✅ Screenshot créé : donation_test.png");
}

takeScreenshot().catch(err => {
  console.error("❌ Erreur screenshot :", err);
});
