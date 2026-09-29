// Extracts the embedded images from the original Google Slides PDF export,
// re-joins them with their soft masks (alpha) and writes web-friendly assets.
//
//   mise run assets
import { execFileSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, rmSync, writeFileSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..', '..');
const pdf = join(root, 'So you want to run coding agents safely.pdf');
const out = join(here, '..', 'src', 'assets');
mkdirSync(out, { recursive: true });
mkdirSync(join(out, 'emoji'), { recursive: true });

const tmp = mkdtempSync(join(tmpdir(), 'deck-'));
execFileSync('pdfimages', ['-png', '-p', pdf, join(tmp, 'img')]);

// [output, colour image, soft mask, max width, mode]
//   mode 'mask' = monochrome logo → white + alpha (tinted in CSS via mask-image)
const assets = [
  ['tom.webp', 'img-001-003.png', null, 420],
  ['grafana-logo.png', 'img-001-001.png', 'img-001-002.png', 1100, 'mask'],
  ['grafana-icon.png', 'img-010-054.png', 'img-010-055.png', null, 'mask'],
  ['claude.webp', 'img-002-007.png', 'img-002-008.png', 720],
  ['openai.png', 'img-003-014.png', 'img-003-015.png', 720, 'mask'],
  ['cursor.webp', 'img-004-023.png', 'img-004-024.png', 720],
  ['openclaw-logo.webp', 'img-005-028.png', null, 1200],
  ['lobster.webp', 'img-008-049.png', 'img-008-050.png', 512],
  ['abc-headline.webp', 'img-009-051.png', null, null],
  ['openclaw-chat.webp', 'img-009-052.png', null, null],
  ['slack.webp', 'img-011-061.png', 'img-011-062.png', 360],
  ['mail.webp', 'img-011-063.png', 'img-011-064.png', 360],
  ['photos.webp', 'img-011-065.png', 'img-011-066.png', 360],
  ['reddit.webp', 'img-016-132.png', null, null],
  ['frog-toad.webp', 'img-017-136.png', null, null],
  ['iceberg.webp', 'img-018-139.png', 'img-018-140.png', 1000],
];

for (const [name, src, mask, maxW, mode] of assets) {
  let img = sharp(join(tmp, src));
  if (mask) {
    const alpha = await sharp(join(tmp, mask)).extractChannel(0).toBuffer();
    if (mode === 'mask') {
      const { width, height } = await sharp(join(tmp, src)).metadata();
      img = sharp({ create: { width, height, channels: 3, background: '#ffffff' } }).joinChannel(alpha);
    } else {
      img = img.joinChannel(alpha);
    }
  }
  // materialise so resize applies to the composed image
  let buf = await img.png().toBuffer();
  let pipeline = sharp(buf);
  if (maxW) pipeline = pipeline.resize({ width: maxW, withoutEnlargement: true });
  pipeline = name.endsWith('.webp') ? pipeline.webp({ quality: 88, alphaQuality: 100 }) : pipeline.png({ compressionLevel: 9 });
  const file = join(out, name);
  await pipeline.toFile(file);
  const meta = await sharp(file).metadata();
  console.log(`✓ ${name.padEnd(22)} ${meta.width}×${meta.height}`);
}

// tight crop of the OpenClaw wordmark (the export has a lot of padding)
await sharp(join(tmp, 'img-005-028.png'))
  .extract({ left: 62, top: 228, width: 1086, height: 240 })
  .webp({ quality: 90 })
  .toFile(join(out, 'openclaw-wordmark.webp'));
console.log('✓ openclaw-wordmark.webp');

// Twemoji (CC-BY 4.0) — crisp vector emoji, identical on every OS
const emoji = {
  fire: '1f525', raised_hand: '270b', person_raising_hand: '1f64b', tennis: '1f3be',
  airplane: '2708', bank: '1f3e6', calendar: '1f4c5', speech: '1f4ac', envelope: '2709',
  lobster: '1f99e', eyes: '1f440', siren: '1f6a8', skull: '1f480', party: '1f389',
  shrug: '1f937', key: '1f511', whale: '1f433', package: '1f4e6', money: '1f4b8',
  pickaxe: '26cf', bomb: '1f4a3', see_no_evil: '1f648', pleading: '1f97a', robot: '1f916', confused: '1f615', grimace: '1f62c',
  check: '2705', cross: '274c', warning: '26a0', lock: '1f512', unlock: '1f513', eye: '1f441', detective: '1f575',
  sparkles: '2728', cloud: '2601', wrench: '1f527', gear: '2699', link: '1f517', satellite: '1f4e1', bell: '1f514',
};
for (const [name, code] of Object.entries(emoji)) {
  const file = join(out, 'emoji', `${name}.svg`);
  if (existsSync(file)) continue;
  const res = await fetch(`https://cdn.jsdelivr.net/gh/jdecked/twemoji@latest/assets/svg/${code}.svg`);
  if (!res.ok) { console.warn(`✗ emoji ${name} (${res.status})`); continue; }
  writeFileSync(file, await res.text());
  console.log(`✓ emoji/${name}.svg`);
}

rmSync(tmp, { recursive: true, force: true });
