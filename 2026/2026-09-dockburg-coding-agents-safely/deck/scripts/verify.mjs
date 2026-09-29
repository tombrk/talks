// Interaction checks in headless Chromium: keyboard stepping, hash sync, wheel scroll,
// the sticky-stack transition mid-flight, other viewport sizes and the presenter view.
//
//   node scripts/verify.mjs [--url http://localhost:5173/]
import puppeteer from 'puppeteer-core';
import { mkdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const i = args.indexOf('--url');
const built = join(here, '..', 'dist', 'index.html');
const base = i >= 0 ? args[i + 1] : pathToFileURL(built).href;
const out = join(here, '..', 'shots-verify');
mkdirSync(out, { recursive: true });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const browser = await puppeteer.launch({
  executablePath: ['/usr/lib/chromium/chromium', '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'].find((p) => existsSync(p)),
  headless: true,
  args: ['--no-sandbox', '--disable-dev-shm-usage', '--user-data-dir=/tmp/deck-verify-profile', '--hide-scrollbars'],
});

let failures = 0;
const check = (name, ok, extra = '') => {
  console.log(`${ok ? '✓' : '✗'} ${name}${extra ? `  (${extra})` : ''}`);
  if (!ok) failures++;
};

const page = await browser.newPage();
const errors = [];
page.on('pageerror', (e) => errors.push(String(e)));
await page.setViewport({ width: 1920, height: 1080 });
await page.goto(base, { waitUntil: 'load' });
await page.waitForFunction(() => window.__deck);
await sleep(700);
const state = () => page.evaluate(() => ({ ...window.__deck.state(), hash: location.hash, top: document.querySelector('.deck').scrollTop }));

// 1. keyboard: ↓ steps through builds of slide 2 (4 builds), then moves on
await page.keyboard.press('ArrowDown'); // → slide 2
await sleep(1100);
let s = await state();
check('ArrowDown from title goes to slide 2', s.index === 1 && s.step === 0, JSON.stringify(s));
for (let k = 0; k < 3; k++) await page.keyboard.press('ArrowDown');
await sleep(300);
s = await state();
check('ArrowDown steps through builds without scrolling', s.index === 1 && s.step === 3 && s.top === 1080, JSON.stringify(s));
check('hash reflects slide/step', s.hash === '#/2/3', s.hash);
await page.keyboard.press('Enter');
await sleep(420);
await page.screenshot({ path: join(out, 'transition-mid.png') });
await sleep(900);
s = await state();
check('Enter advances to the next slide', s.index === 2 && s.step === 0, JSON.stringify(s));
await page.keyboard.press('ArrowUp');
await sleep(1100);
s = await state();
check('ArrowUp returns to the previous slide at its LAST build', s.index === 1 && s.step === 3, JSON.stringify(s));

// 2. number jump: "1","4",Enter → slide 14
await page.keyboard.press('1');
await page.keyboard.press('4');
await page.keyboard.press('Enter');
await sleep(600);
s = await state();
check('typing 14 + Enter jumps to slide 14', s.index === 13 && s.top === 13 * 1080, JSON.stringify(s));

// 3. wheel = scrollytelling: one gesture (a 60 Hz burst with decaying inertia) = one build step
const gesture = (dir = 1) =>
  page.evaluate(async (dir) => {
    const el = document.querySelector('.deck');
    for (let k = 0; k < 40; k++) {
      el.dispatchEvent(new WheelEvent('wheel', { deltaY: dir * Math.max(2, 90 * Math.exp(-k / 8)), bubbles: true, cancelable: true }));
      await new Promise((r) => setTimeout(r, 16));
    }
  }, dir);
const pos = (st) => `${st.index}.${st.step}`;
let before = await state();
await gesture(1);
await sleep(400);
s = await state();
check('one wheel gesture (with inertia) = exactly one step', s.index === 13 && s.step === 1, `${pos(before)} → ${pos(s)}`);
for (let g = 0; g < 3; g++) {
  await gesture(1);
  await sleep(300);
}
await sleep(1200);
s = await state();
check('three more gestures: through the builds and onto the next slide', s.index === 14 && s.step === 0 && s.top === 14 * 1080, `${pos(s)} top=${s.top}`);
await gesture(-1);
await sleep(1300);
s = await state();
check('wheel up goes back to the previous slide’s last build', s.index === 13 && s.step === 3, pos(s));

// 4. deep link
await page.goto(base.split('#')[0] + '#/21/4', { waitUntil: 'load' });
await page.waitForFunction(() => window.__deck);
await sleep(2500);
s = await state();
check('deep link #/21/4 opens slide 21, build 4', s.index === 20 && s.step === 4, JSON.stringify(s));
await page.screenshot({ path: join(out, 'deeplink-21-4.png') });

// 5. other viewports (letterboxing)
for (const [w, h] of [[1440, 900], [1280, 720], [2560, 1440], [1024, 768]]) {
  await page.setViewport({ width: w, height: h });
  await sleep(900);
  const box = await page.evaluate(() => {
    const st = [...document.querySelectorAll('.slide')][20].querySelector('.stage').getBoundingClientRect();
    return { w: Math.round(st.width), h: Math.round(st.height), x: Math.round(st.x), y: Math.round(st.y) };
  });
  const expect = Math.min(w / 1920, h / 1080);
  check(`stage scales to fit ${w}×${h}`, Math.abs(box.w - 1920 * expect) < 2 && box.x >= -1 && box.y >= -1, JSON.stringify(box));
  await page.screenshot({ path: join(out, `viewport-${w}x${h}.png`) });
}

// 6. presenter view mirrors the deck over BroadcastChannel
await page.setViewport({ width: 1920, height: 1080 });
const presenter = await browser.newPage();
await presenter.setViewport({ width: 1600, height: 1000 });
await presenter.goto(base.split('#')[0].replace(/(\?.*)?$/, '?presenter'), { waitUntil: 'load' });
await sleep(1200);
await page.bringToFront();
await page.keyboard.press('ArrowDown');
await sleep(1500);
const deckState = await state();
const pText = await presenter.evaluate(() => document.querySelector('.presenter-top')?.textContent ?? '');
check('presenter mirrors deck position', pText.includes(`slide ${deckState.index + 1}/`), pText.slice(0, 160));
await presenter.keyboard.press('ArrowDown');
await sleep(1200);
const after = await state();
check('keys in presenter drive the deck', after.index * 10 + after.step > deckState.index * 10 + deckState.step, `${JSON.stringify(deckState)} → ${JSON.stringify(after)}`);
await sleep(1500);
await presenter.screenshot({ path: join(out, 'presenter.png') });

check('no page errors', errors.length === 0, errors.join(' | '));
await browser.close();
console.log(failures ? `\n${failures} check(s) failed` : '\nall checks passed');
process.exitCode = failures ? 1 : 0;
