// film.mjs: capture a frame strip of one slide while pressing keys.
//   node scripts/film.mjs --url http://127.0.0.1:5173/ --at 25/0 --keys ArrowDown --frames 9 --every 450 --out shots-verify/film.png
import puppeteer from 'puppeteer-core';
import sharp from 'sharp';
const args = process.argv.slice(2);
const opt = (n, d) => { const i = args.indexOf(`--${n}`); return i < 0 ? d : args[i + 1]; };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const browser = await puppeteer.launch({ executablePath: '/usr/lib/chromium/chromium', headless: true, args: ['--no-sandbox', '--disable-dev-shm-usage', '--user-data-dir=/tmp/film-prof', '--hide-scrollbars'] });
const page = await browser.newPage();
await page.setViewport({ width: 1920, height: 1080 });
const url = new URL(opt('url', 'http://127.0.0.1:5173/'));
url.searchParams.set('shots', '1');
url.hash = `#/${opt('at', '1')}`;
await page.goto(url.href, { waitUntil: 'load' });
await page.waitForFunction(() => window.__deck);
await sleep(Number(opt('settle', 2600)));
for (const k of opt('keys', '').split(',').filter(Boolean)) { await page.keyboard.press(k); await sleep(60); }
const n = Number(opt('frames', 9)), every = Number(opt('every', 400));
const frames = [];
for (let k = 0; k < n; k++) { frames.push(await page.screenshot()); await sleep(every); }
const W = 640, H = 360, cols = 3;
await sharp({ create: { width: cols * W + (cols - 1) * 10, height: Math.ceil(n / cols) * (H + 10) - 10, channels: 3, background: '#333' } })
  .composite(await Promise.all(frames.map(async (f, i) => ({ input: await sharp(f).resize(W, H).toBuffer(), left: (i % cols) * (W + 10), top: Math.floor(i / cols) * (H + 10) }))))
  .png().toFile(opt('out', 'shots-verify/film.png'));
await browser.close();
