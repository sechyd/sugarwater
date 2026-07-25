import puppeteer from "puppeteer-core";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import fs from "node:fs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const htmlPath = path.join(root, "public/domo-snowflake-connection-guide-print.html");
const pdfPath = path.join(root, "public/domo-snowflake-connection-guide.pdf");
const artifactDir = "/opt/cursor/artifacts";
const artifactPdf = path.join(artifactDir, "domo-snowflake-connection-guide.pdf");

const chromeCandidates = [
  process.env.CHROME_PATH,
  "/usr/bin/google-chrome-stable",
  "/usr/bin/google-chrome",
  "/usr/local/bin/google-chrome",
].filter(Boolean);

const executablePath = chromeCandidates.find((p) => fs.existsSync(p));
if (!executablePath) {
  console.error("Chrome not found");
  process.exit(1);
}

const browser = await puppeteer.launch({
  executablePath,
  headless: "shell",
  args: ["--no-sandbox", "--disable-setuid-sandbox", "--font-render-hinting=medium"],
});

try {
  const page = await browser.newPage();
  await page.goto(pathToFileURL(htmlPath).href, {
    waitUntil: "networkidle0",
    timeout: 120000,
  });

  await page.pdf({
    path: pdfPath,
    format: "Letter",
    printBackground: true,
    preferCSSPageSize: false,
    margin: {
      top: "0.55in",
      right: "0.6in",
      bottom: "0.65in",
      left: "0.6in",
    },
    displayHeaderFooter: true,
    headerTemplate: `
      <div style="width:100%;font-size:8px;color:#666;padding:0 0.6in;font-family:Helvetica,Arial,sans-serif;display:flex;justify-content:space-between;">
        <span>Domo ↔ Snowflake Connection Guide</span>
        <span>Read Path &amp; Magic ETL</span>
      </div>
    `,
    footerTemplate: `
      <div style="width:100%;font-size:8px;color:#666;padding:0 0.6in;font-family:Helvetica,Arial,sans-serif;display:flex;justify-content:space-between;">
        <span>Confidential — Integration Runbook</span>
        <span>Page <span class="pageNumber"></span> of <span class="totalPages"></span></span>
      </div>
    `,
  });

  fs.mkdirSync(artifactDir, { recursive: true });
  fs.copyFileSync(pdfPath, artifactPdf);

  const stats = fs.statSync(pdfPath);
  console.log(`PDF written: ${pdfPath}`);
  console.log(`Artifact copy: ${artifactPdf}`);
  console.log(`Size: ${(stats.size / 1024).toFixed(1)} KB`);
} finally {
  await browser.close();
}
