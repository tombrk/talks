// Visual verification: screenshots every slide and every build step in headless Chromium,
// then stitches a labelled contact sheet.
//
//   mise run shots                       # against the built single-file HTML
//   node scripts/shots.mjs --url http://localhost:5173 --only 3,4 --final
import puppeteer from 'puppeteer-core';
import sharp from 'sharp';
import { mkdirSync, rmSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const opt = (name, dflt) => {
  const i = args.indexOf(`--${name}`);
  return i === -1 ? dflt : args[i + 1];
};
const flag = (name) => args.includes(`--${name}`);

const built = join(here, '..', 'dist', 'index.html');
const base = opt('url', existsSync(built) ? pathToFileURL(built).href : 'http://localhost:5173/');
const out = opt('out', join(here, '..', 'shots'));
const only = opt('only', null)?.split(',').map(Number);
const finalOnly = flag('final');
const width = Number(opt('w', 1920));
const height = Number(opt('h', 1080));
const wait = Number(opt('wait', 2300));

if (!only) rmSync(out, { recursive: true, force: true });
mkdirSync(out, { recursive: true });

const chrome = [
  process.env.CHROME,
  '/usr/lib/chromium/chromium',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/usr/bin/google-chrome',
].find((p) => p && existsSync(p));

const browser = await puppeteer.launch({
  executablePath: chrome,
  headless: true,
  args: ['--no-sandbox', '--disable-dev-shm-usage', '--user-data-dir=/tmp/deck-shots-profile', '--hide-scrollbars', '--force-color-profile=srgb'],
  defaultViewport: { width, height, deviceScaleFactor: 1 },
});
const page = await browser.newPage();
const errors = [];
page.on('pageerror', (e) => errors.push(String(e)));
page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));

const url = new URL(base);
url.searchParams.set('shots', '1');
await page.goto(url.href, { waitUntil: 'load' });
await page.waitForFunction(() => window.__deck, { timeout: 20000 });
await new Promise((r) => setTimeout(r, 800));
const slides = await page.evaluate(() => window.__deck.slides);

const files = [];
for (let i = 0; i < slides.length; i++) {
  if (only && !only.includes(i + 1)) continue;
  const steps = finalOnly ? [slides[i].steps - 1] : [...Array(slides[i].steps).keys()];
  for (const s of steps) {
    await page.evaluate((i, s) => window.__deck.goto(i, s), i, s);
    await new Promise((r) => setTimeout(r, s === steps[0] ? wait : Math.min(wait, 1900)));
    const file = join(out, `${String(i + 1).padStart(2, '0')}-${slides[i].id}-${s}.png`);
    await page.screenshot({ path: file });
    files.push({ file, label: `${i + 1}.${s}  ${slides[i].title}` });
    process.stdout.write(`✓ ${i + 1}.${s} ${slides[i].id}\n`);
  }
}
await browser.close();

// contact sheet(s): 3 columns of 640×360 thumbnails, 12 per sheet
const TW = 640, TH = 360, COLS = 3, PER = 12, LABEL = 34;
for (let sheet = 0; sheet * PER < files.length; sheet++) {
  const chunk = files.slice(sheet * PER, sheet * PER + PER);
  const rows = Math.ceil(chunk.length / COLS);
  const composites = [];
  for (let k = 0; k < chunk.length; k++) {
    const x = (k % COLS) * (TW + 12);
    const y = Math.floor(k / COLS) * (TH + LABEL + 12);
    composites.push({ input: await sharp(chunk[k].file).resize(TW, TH).toBuffer(), left: x, top: y + LABEL });
    const esc = chunk[k].label.replace(/&/g, '&amp;').replace(/</g, '&lt;');
    composites.push({
      input: Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${TW}" height="${LABEL}"><text x="4" y="24" font-family="monospace" font-size="20" fill="#fff">${esc}</text></svg>`),
      left: x,
      top: y,
    });
  }
  await sharp({ create: { width: COLS * (TW + 12), height: rows * (TH + LABEL + 12), channels: 3, background: '#222' } })
    .composite(composites)
    .png()
    .toFile(join(out, `_sheet-${sheet + 1}.png`));
}

if (errors.length) {
  console.log('\n⚠ page errors:');
  errors.forEach((e) => console.log('  ', e));
  process.exitCode = 1;
}
console.log(`\n${files.length} screenshots → ${out}`);
