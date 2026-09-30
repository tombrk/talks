// Vector PDF of every slide in its settled (last build) state: selectable text, embedded fonts.
//   node scripts/pdf.mjs            → ../deck.pdf... (writes deck.pdf next to this package)
import puppeteer from 'puppeteer-core';
import { PDFDocument } from 'pdf-lib';
import { writeFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const url = new URL(pathToFileURL(join(here, '..', 'dist', 'index.html')).href);
url.searchParams.set('shots', '1');
const out = join(here, '..', 'deck.pdf');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const browser = await puppeteer.launch({
  executablePath: ['/usr/lib/chromium/chromium', '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'].find((p) => existsSync(p)),
  headless: true,
  args: ['--no-sandbox', '--disable-dev-shm-usage', '--user-data-dir=/tmp/deck-pdf-profile'],
});
const page = await browser.newPage();
await page.setViewport({ width: 1920, height: 1080 });
url.searchParams.delete('shots');
url.searchParams.set('print', '1');
await page.goto(url.href, { waitUntil: 'load' });
await page.waitForSelector('.print-page');
await page.evaluate(() => document.fonts.ready);
await sleep(5000); // counters, typewriters and builds settle
const pdf = await page.pdf({ width: '1920px', height: '1080px', printBackground: true, margin: { top: 0, right: 0, bottom: 0, left: 0 } });
const merged = await PDFDocument.load(pdf);
merged.setTitle('So you want to run (coding) agents safely');
merged.setAuthor('Tom Braack, Grafana Labs');
writeFileSync(out, await merged.save());
await browser.close();
console.log(`\n→ ${out}`);
