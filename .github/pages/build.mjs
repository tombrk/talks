// Builds every talk that has a slide deck into one static site for GitHub Pages.
//   node .github/pages/build.mjs [out]      (default: _site)
//
// A talk has slides when it contains deck/package.json with a "build" script that emits
// deck/dist/index.html. Each deck is published under the talk's path in this repo:
//   2026/2026-09-some-talk/deck  →  <site>/2026/2026-09-some-talk/
// deck/deck.pdf, if present, is published next to it.
import { execFileSync } from 'node:child_process';
import { copyFileSync, cpSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { basename, dirname, isAbsolute, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');
const out = resolve(root, process.argv[2] ?? '_site');
const CI = !!process.env.GITHUB_ACTIONS;

const fromOut = relative(out, root);
if (!fromOut.startsWith('..') && !isAbsolute(fromOut)) throw new Error(`refusing to wipe ${out}: it contains the repo`);

const hasBuild = (dir) => {
  const pkg = join(dir, 'package.json');
  return existsSync(pkg) && !!JSON.parse(readFileSync(pkg, 'utf8')).scripts?.build;
};

function* findDecks(dir) {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    if (!e.isDirectory() || e.name.startsWith('.') || e.name === 'node_modules' || e.name === 'dist') continue;
    const p = join(dir, e.name);
    if (p === out) continue;
    if (e.name === 'deck' && hasBuild(p)) yield p;
    else yield* findDecks(p);
  }
}

function group(name, fn) {
  console.log(CI ? `::group::${name}` : `\n▸ ${name}`);
  try {
    return fn();
  } finally {
    if (CI) console.log('::endgroup::');
  }
}

const run = (cwd, ...args) => execFileSync('npm', args, { cwd, stdio: 'inherit' });

const decode = (s = '') =>
  s.replace(/&(amp|lt|gt|quot|#39);/g, (_, e) => ({ amp: '&', lt: '<', gt: '>', quot: '"', '#39': "'" })[e]);
const esc = (s = '') =>
  s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

/** "2026-09-…" → "Sep 2026"; otherwise the year folder the talk lives in */
function when(talk) {
  const m = basename(talk).match(/^(\d{4})-(\d{2})(?!\d)/);
  if (m) {
    const d = new Date(Date.UTC(+m[1], +m[2] - 1));
    return d.toLocaleDateString('en', { month: 'short', year: 'numeric', timeZone: 'UTC' });
  }
  return talk.split('/').find((s) => /^\d{4}$/.test(s)) ?? '';
}

function sourceUrl(talk) {
  const { GITHUB_SERVER_URL: server, GITHUB_REPOSITORY: repo } = process.env;
  if (!server || !repo) return '';
  return new URL(`${repo}/tree/HEAD/${talk}`, `${server}/`).href;
}

rmSync(out, { recursive: true, force: true });
mkdirSync(out, { recursive: true });

const talks = [];
for (const deck of findDecks(root)) {
  const talk = relative(root, dirname(deck)).split(sep).join('/');
  group(`build ${talk}`, () => {
    run(deck, 'ci', '--ignore-scripts', '--no-audit', '--no-fund');
    run(deck, 'run', 'build');
  });

  const dist = join(deck, 'dist');
  const html = existsSync(join(dist, 'index.html')) && readFileSync(join(dist, 'index.html'), 'utf8');
  if (!html) throw new Error(`${talk}: build did not produce deck/dist/index.html`);

  const dest = join(out, ...talk.split('/'));
  cpSync(dist, dest, { recursive: true });
  const pdf = existsSync(join(deck, 'deck.pdf'));
  if (pdf) copyFileSync(join(deck, 'deck.pdf'), join(dest, 'deck.pdf'));

  const [name, ...byline] = decode(html.match(/<title>([^<]*)<\/title>/i)?.[1]).split(' · ');
  talks.push({
    path: talk,
    href: talk.split('/').map(encodeURIComponent).join('/') + '/',
    name: name || basename(talk),
    byline: byline.join(' · '),
    description: decode(html.match(/<meta\s+name="description"\s+content="([^"]*)"/i)?.[1]),
    when: when(talk),
    pdf,
    source: sourceUrl(talk),
  });
}

talks.sort((a, b) => b.path.localeCompare(a.path));

const item = (t) => `
      <li>
        <a class="talk" href="${esc(t.href)}">
          <span class="when">${esc(t.when)}</span>
          <h2>${esc(t.name)}</h2>
          ${t.byline ? `<p class="byline">${esc(t.byline)}</p>` : ''}
          ${t.description ? `<p>${esc(t.description)}</p>` : ''}
        </a>
        <nav>
          <a href="${esc(t.href)}">Slides</a>
          ${t.pdf ? `<a href="${esc(t.href)}deck.pdf">PDF</a>` : ''}
          ${t.source ? `<a href="${esc(t.source)}">Source</a>` : ''}
        </nav>
      </li>`;

writeFileSync(
  join(out, 'index.html'),
  `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="theme-color" content="#FF671D" />
    <title>Talks</title>
    <style>
      :root {
        color-scheme: light dark;
        --bg: #faf7f4;
        --fg: #1d1a17;
        --muted: #6f655d;
        --card: #fff;
        --line: #eadfd6;
        --accent: #ff671d;
        font: 16px/1.5 ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
      }
      @media (prefers-color-scheme: dark) {
        :root {
          --bg: #141210;
          --fg: #f3ede8;
          --muted: #a2968c;
          --card: #1d1a17;
          --line: #2e2925;
        }
      }
      * { box-sizing: border-box; }
      body { margin: 0; background: var(--bg); color: var(--fg); }
      main { max-width: 46rem; margin: 0 auto; padding: 4rem 1.25rem 6rem; }
      header h1 { margin: 0; font-size: 2.5rem; letter-spacing: -0.03em; }
      header h1::after { content: '.'; color: var(--accent); }
      header p { margin: 0.25rem 0 2.5rem; color: var(--muted); }
      ul { list-style: none; margin: 0; padding: 0; display: grid; gap: 1rem; }
      li { background: var(--card); border: 1px solid var(--line); border-radius: 14px; overflow: hidden; }
      .talk { display: block; padding: 1.25rem 1.5rem 1rem; color: inherit; text-decoration: none; }
      .talk:hover h2 { color: var(--accent); }
      .when { font-size: 0.8rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.08em; color: var(--accent); }
      h2 { margin: 0.2rem 0 0; font-size: 1.35rem; line-height: 1.25; letter-spacing: -0.01em; transition: color 0.15s; }
      .talk p { margin: 0.4rem 0 0; color: var(--muted); }
      .talk .byline { margin-top: 0.15rem; font-size: 0.9rem; }
      nav { display: flex; gap: 1.25rem; padding: 0.75rem 1.5rem; border-top: 1px solid var(--line); font-size: 0.9rem; }
      nav a { color: var(--fg); font-weight: 500; text-decoration: none; }
      nav a:hover { color: var(--accent); }
      nav a:first-child { color: var(--accent); }
      .empty { color: var(--muted); }
    </style>
  </head>
  <body>
    <main>
      <header>
        <h1>Talks</h1>
        <p>Slides for talks I give. Each deck runs right in the browser.</p>
      </header>
      ${talks.length ? `<ul>${talks.map(item).join('')}\n      </ul>` : '<p class="empty">No decks yet.</p>'}
    </main>
  </body>
</html>
`,
);

console.log(`\n→ ${relative(root, out) || out}: ${talks.length} deck(s)`);
for (const t of talks) console.log(`  ${t.href}  ${t.name}`);
