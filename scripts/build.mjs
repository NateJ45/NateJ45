// Builds the profile README and its graphics from the live studio site.
//
// Source of truth is nixoncreativestudio.com: /peek.json (the nine case
// studies, their colours, outcomes and phone stills, plus the journal posts)
// and /rss.xml (journal order). Nothing about the work is typed in here, so
// when the site changes, `npm run build` (or the weekly workflow) brings the
// profile back in step.
//
// GitHub strips CSS, scripts and web fonts from a README, so everything
// visual is an SVG file: text is converted to outlines of Hanken Grotesk (the
// site's typeface) and the phone stills are embedded as data URIs. Motion is
// CSS inside the SVG and is switched off for prefers-reduced-motion.

import { mkdirSync, readFileSync, writeFileSync, rmSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import * as fontkit from 'fontkit';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(ROOT, 'assets');
const SITE = 'https://nixoncreativestudio.com';

// The site's own tokens (src/styles on the studio site).
const NAVY = '#14162f';
const ACCENT = '#2f3fe6';
const ACCENT_ON_NAVY = '#aab3ff';
const SOFT = '#bebeb8';
const WHITE = '#ffffff';

// ---------------------------------------------------------------- text -----

const fontFile = (w) =>
  join(ROOT, `node_modules/@fontsource/hanken-grotesk/files/hanken-grotesk-latin-${w}-normal.woff2`);
const fonts = {};
const font = (w) => (fonts[w] ??= fontkit.openSync(fontFile(w)));

const round = (d) => d.replace(/-?\d+\.\d+/g, (n) => String(Math.round(Number(n) * 10) / 10));

/** Width of a line of text in px. */
function measure(str, size, weight = 500, tracking = 0) {
  const run = font(weight).layout(str);
  const s = size / font(weight).unitsPerEm;
  return run.positions.reduce((w, p) => w + p.xAdvance * s + tracking, 0) - tracking;
}

/** One line of text as an outlined <path>. anchor: start | middle | end. */
function text(str, { x, y, size, weight = 500, fill = WHITE, anchor = 'start', tracking = 0, opacity }) {
  const f = font(weight);
  const s = size / f.unitsPerEm;
  const run = f.layout(str);
  const width = measure(str, size, weight, tracking);
  let pen = anchor === 'middle' ? x - width / 2 : anchor === 'end' ? x - width : x;
  let d = '';
  run.glyphs.forEach((g, i) => {
    if (g.id === 0 && str[i] !== ' ') throw new Error(`No glyph for "${str[i]}" in "${str}"`);
    d += g.path.scale(s, -s).translate(pen, y).toSVG();
    pen += run.positions[i].xAdvance * s + tracking;
  });
  const o = opacity == null ? '' : ` fill-opacity="${opacity}"`;
  return `<path fill="${fill}"${o} d="${round(d)}"/>`;
}

/** Greedy word wrap to a pixel width. */
function wrap(str, maxWidth, size, weight, tracking = 0) {
  const lines = [];
  let line = '';
  for (const word of str.split(/\s+/)) {
    const next = line ? `${line} ${word}` : word;
    if (line && measure(next, size, weight, tracking) > maxWidth) {
      lines.push(line);
      line = word;
    } else line = next;
  }
  if (line) lines.push(line);
  return lines;
}

/** Largest size (up to max) at which str fits maxWidth. */
function fit(str, maxWidth, max, weight) {
  let size = max;
  while (size > 12 && measure(str, size, weight) > maxWidth) size -= 1;
  return size;
}

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');

// --------------------------------------------------------------- fetch -----

async function get(path, as = 'text') {
  const res = await fetch(SITE + path, { headers: { 'user-agent': 'profile-readme-build' } });
  if (!res.ok) throw new Error(`${path}: HTTP ${res.status}`);
  return as === 'json' ? res.json() : as === 'buffer' ? Buffer.from(await res.arrayBuffer()) : res.text();
}

async function dataUri(path) {
  const buf = await get(path, 'buffer');
  if (buf.length < 500) throw new Error(`${path}: image is suspiciously small (${buf.length} bytes)`);
  const type = path.endsWith('.png') ? 'image/png' : path.endsWith('.jpg') ? 'image/jpeg' : 'image/webp';
  return `data:${type};base64,${buf.toString('base64')}`;
}

// ------------------------------------------------------------- drawing -----

const REDUCED = '@media (prefers-reduced-motion: reduce){*{animation:none!important}}';

/** A phone: client-colour body with the site still on its screen, centred on 0,0. */
function phone({ id, w, still, c }) {
  const h = Math.round(w * 1.96);
  const pad = Math.max(4, Math.round(w * 0.05));
  const r = Math.round(w * 0.15);
  return (
    `<clipPath id="${id}"><rect x="${-w / 2 + pad}" y="${-h / 2 + pad}" width="${w - pad * 2}" height="${h - pad * 2}" rx="${r - pad}"/></clipPath>` +
    `<rect x="${-w / 2}" y="${-h / 2}" width="${w}" height="${h}" rx="${r}" fill="${c}"/>` +
    `<rect x="${-w / 2 + 0.5}" y="${-h / 2 + 0.5}" width="${w - 1}" height="${h - 1}" rx="${r}" fill="none" stroke="#fff" stroke-opacity=".22"/>` +
    `<image href="${still}" x="${-w / 2 + pad}" y="${-h / 2 + pad}" width="${w - pad * 2}" height="${h - pad * 2}" preserveAspectRatio="xMidYMin slice" clip-path="url(#${id})"/>`
  );
}

/** The deck's corner marks: four small ticks just inside a rectangle. */
function corners(w, h, inset, len, stroke, opacity) {
  const a = inset;
  const b = inset + len;
  const pts = [
    `M${a} ${b}V${a}H${b}`,
    `M${w - b} ${a}H${w - a}V${b}`,
    `M${w - a} ${h - b}V${h - a}H${w - b}`,
    `M${b} ${h - a}H${a}V${h - b}`,
  ];
  return `<path d="${pts.join('')}" fill="none" stroke="${stroke}" stroke-opacity="${opacity}" stroke-width="2"/>`;
}

function svg(w, h, title, body, style = '') {
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" role="img" aria-label="${esc(title)}">` +
    `<title>${esc(title)}</title>` +
    (style ? `<style>${style}${REDUCED}</style>` : '') +
    body +
    `</svg>\n`
  );
}

function hero({ work, portrait, booking }) {
  const W = 1200;
  const H = 664;
  const cx = W / 2;
  let b = `<rect width="${W}" height="${H}" rx="28" fill="${NAVY}"/>`;
  b += corners(W, H, 22, 16, ACCENT_ON_NAVY, 0.45);

  // Top bar: wordmark and the same status line the site's header carries.
  b += text('Nixon Creative Studio', { x: 56, y: 76, size: 21, weight: 700 });
  if (booking) {
    const label = 'Taking new projects';
    const lw = measure(label, 17, 500);
    b += text(label, { x: W - 56, y: 76, size: 17, fill: SOFT, anchor: 'end' });
    const dx = W - 56 - lw - 16;
    b += `<circle class="ring" cx="${dx}" cy="70" r="5" fill="none" stroke="${ACCENT_ON_NAVY}" stroke-width="1.5"/>`;
    b += `<circle cx="${dx}" cy="70" r="5" fill="${ACCENT_ON_NAVY}"/>`;
  }

  // Headline, as on the home page, with the portrait chip after line one.
  const size = 70;
  const l1 = 'I build websites';
  const chipW = 100;
  const chipH = 58;
  const gap = 20;
  const l1w = measure(l1, size, 500);
  const l1x = cx - (l1w + gap + chipW) / 2;
  b += `<g class="rise r1">${text(l1, { x: l1x, y: 196, size })}`;
  b += `<clipPath id="me"><rect x="${l1x + l1w + gap}" y="${196 - chipH + 6}" width="${chipW}" height="${chipH}" rx="16"/></clipPath>`;
  b += `<image href="${portrait}" x="${l1x + l1w + gap}" y="${196 - chipH + 6}" width="${chipW}" height="${chipH}" preserveAspectRatio="xMidYMid slice" clip-path="url(#me)"/></g>`;
  const a = 'that ';
  const c2 = 'pull their weight.';
  const aw = measure(a, size, 500);
  const l2w = aw + measure(c2, size, 500);
  b += `<g class="rise r2">${text('that', { x: cx - l2w / 2, y: 276, size })}`;
  b += `${text(c2, { x: cx - l2w / 2 + aw, y: 276, size, fill: ACCENT_ON_NAVY })}</g>`;
  b += `<g class="rise r3">`;
  b += text('Websites for churches, schools, nonprofits and small businesses.', { x: cx, y: 328, size: 21, weight: 400, fill: SOFT, anchor: 'middle' });
  b += text('One person does the design, the build and, when needed, the photos.', { x: cx, y: 358, size: 21, weight: 400, fill: SOFT, anchor: 'middle' });
  b += `</g>`;

  // The deck: every case study as a phone, fanned on an arc and dealt in.
  const n = work.length;
  const mid = (n - 1) / 2;
  const step = Math.min(124, (W - 150) / n);
  let css = '';
  work.forEach((p, i) => {
    const k = i - mid;
    const x = cx + k * step;
    const y = 484 + k * k * 3.4;
    const rot = k * 3.8;
    b += `<g transform="translate(${round(String(x))} ${round(String(y))}) rotate(${round(String(rot))})"><g class="deal d${i}"><g class="bob b${i}">${phone({ id: `s${i}`, w: 102, still: p.stillData, c: p.c })}</g></g></g>`;
    css += `.d${i}{animation-delay:${(0.45 + i * 0.07).toFixed(2)}s}.b${i}{animation-delay:${(1.6 + i * 0.35).toFixed(2)}s}`;
  });

  const style =
    `@keyframes rise{from{opacity:0;transform:translateY(22px)}to{opacity:1;transform:none}}` +
    `@keyframes deal{from{opacity:0;transform:translateY(190px)}to{opacity:1;transform:none}}` +
    `@keyframes bob{from{transform:translateY(0)}to{transform:translateY(-7px)}}` +
    `@keyframes ring{from{opacity:.9;transform:scale(1)}to{opacity:0;transform:scale(3)}}` +
    `.rise{animation:rise .8s cubic-bezier(.2,.8,.2,1) both}.r2{animation-delay:.12s}.r3{animation-delay:.26s}` +
    `.deal{animation:deal .9s cubic-bezier(.3,1.45,.55,1) both}` +
    `.bob{animation:bob 3.2s ease-in-out infinite alternate}` +
    `.ring{transform-box:fill-box;transform-origin:center;animation:ring 2.4s ease-out infinite}` +
    css;
  return svg(W, H, 'Nixon Creative Studio. I build websites that pull their weight.', b, style);
}

function workCard(p, i) {
  const W = 400;
  const H = 300;
  let b = `<clipPath id="card"><rect width="${W}" height="${H}" rx="22"/></clipPath><g clip-path="url(#card)">`;
  b += `<rect width="${W}" height="${H}" fill="${p.c}"/>`;
  b += `<g transform="translate(304 196) rotate(7)"><g class="deal">${phone({ id: 'scr', w: 156, still: p.stillData, c: p.c })}</g></g>`;
  b += `</g>`;
  b += text(`${String(i + 1).padStart(2, '0')}  ${p.sector.toUpperCase()}`, { x: 28, y: 46, size: 15, weight: 700, fill: p.p, tracking: 1.6, opacity: 0.8 });
  const size = 29;
  const lines = wrap(p.name, 186, size, 700);
  const hostY = H - 30;
  const top = hostY - 22 - (lines.length - 1) * 33;
  lines.forEach((l, j) => (b += text(l, { x: 28, y: top + j * 33, size, weight: 700, fill: p.p })));
  b += text(p.host, { x: 28, y: hostY, size: fit(p.host, 190, 16.5, 500), weight: 500, fill: p.p, opacity: 0.8 });
  const style =
    `@keyframes deal{from{opacity:0;transform:translateY(150px)}to{opacity:1;transform:none}}` +
    `.deal{animation:deal .9s cubic-bezier(.3,1.45,.55,1) ${(0.15 + (i % 3) * 0.1).toFixed(2)}s both}`;
  return svg(W, H, `${p.name}, ${p.sector.toLowerCase()}, ${p.host}`, b, style);
}

function resultCard(r, p) {
  const W = 400;
  const H = 270;
  let b = `<rect width="${W}" height="${H}" rx="22" fill="${p.c}"/>`;
  b += corners(W, H, 16, 12, p.p, 0.5);
  const fs = fit(r.figure, 330, 68, 700);
  b += `<g class="rise">${text(r.figure, { x: 34, y: 100, size: fs, weight: 700, fill: p.p })}</g>`;
  const lines = wrap(r.text, 332, 22, 500);
  lines.forEach((l, j) => (b += text(l, { x: 34, y: 140 + j * 28, size: 22, weight: 500, fill: p.p, opacity: 0.92 })));
  b += text(p.name.toUpperCase(), { x: 34, y: H - 30, size: fit(p.name.toUpperCase(), 300, 12.5, 700), weight: 700, fill: p.p, tracking: 1.5, opacity: 0.8 });
  const style = `@keyframes rise{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:none}}.rise{animation:rise .8s cubic-bezier(.2,.8,.2,1) .2s both}`;
  return svg(W, H, `${r.figure} ${r.text} ${p.name}.`, b, style);
}

/** A button. Primary is the site's accent; the rest are navy with a hairline so they hold on both GitHub themes. */
function pill(label, primary) {
  const size = 17;
  const tw = measure(label, size, 600);
  const W = Math.round(tw + 44);
  const H = 44;
  const b =
    `<rect x=".75" y=".75" width="${W - 1.5}" height="${H - 1.5}" rx="${(H - 1.5) / 2}" fill="${primary ? ACCENT : NAVY}" stroke="${primary ? ACCENT : '#4a5090'}" stroke-width="1.5"/>` +
    text(label, { x: W / 2, y: 28, size, weight: 600, anchor: 'middle' });
  return { svg: svg(W, H, label, b), w: W, h: H };
}

// ----------------------------------------------------------------- data ----

// Headline results, as shown under "What changed" on the home page. Each is
// sourced in its case study on the site; keep these three in step with it.
const RESULTS = [
  { slug: 'west-chester-preschool', figure: '58%', text: 'more students, with 41 of 43 places filled' },
  { slug: 'foundation-for-reformed-theology', figure: 'About 60%', text: 'more clicks from Google since the relaunch' },
  { slug: 'stone-steps-50k', figure: 'Next morning', text: 'results, records and runner pages live after each race, with nobody touching them' },
];

// Public repos behind the case studies (the WordPress themes and the
// preschool tooling are private, so they have none).
const REPOS = {
  'stone-steps-50k': 'stonesteps-50k',
  'mas-monograms': 'mas-monograms',
  'presbyterian-academy': 'presacademy',
  'first-baptist-muncie': 'fbcm',
  'reid-design': 'reid-design-site',
};

const LINKS = [
  { file: 'start', label: 'Start a project', href: `${SITE}/contact/`, primary: true },
  { file: 'work', label: 'All the work', href: `${SITE}/work/` },
  { file: 'prices', label: 'Prices', href: `${SITE}/services/` },
  { file: 'photography', label: 'Photography', href: `${SITE}/photography/` },
  { file: 'journal', label: 'Journal', href: `${SITE}/journal/` },
  { file: 'about', label: 'About', href: `${SITE}/about/` },
];

const ELSEWHERE = [
  { file: 'site', label: 'nixoncreativestudio.com', href: `${SITE}/`, primary: true },
  { file: 'linkedin', label: 'LinkedIn', href: 'https://www.linkedin.com/in/nathannixon/' },
  { file: 'instagram', label: 'Instagram', href: 'https://www.instagram.com/thenate_n/' },
  { file: 'facebook', label: 'Facebook', href: 'https://www.facebook.com/nixoncreativestudio' },
  { file: 'google', label: 'Google reviews', href: 'https://www.google.com/maps?cid=8761877824848034127' },
  { file: 'email', label: 'Email me', href: 'mailto:nathan@nixoncreativestudio.com' },
];

// ---------------------------------------------------------------- build ----

const peek = await get('/peek.json', 'json');
const rss = await get('/rss.xml');
const home = await get('/');

const work = [];
for (const [slug, p] of Object.entries(peek.work)) {
  work.push({ slug, ...p, stillData: await dataUri(p.still) });
}
if (work.length < 3) throw new Error('peek.json lists fewer than three case studies; refusing to build');
const portrait = await dataUri('/assets/portrait-160.webp');
const booking = home.includes('Taking new projects');

if (existsSync(OUT)) rmSync(OUT, { recursive: true });
mkdirSync(join(OUT, 'work'), { recursive: true });
mkdirSync(join(OUT, 'results'), { recursive: true });
mkdirSync(join(OUT, 'links'), { recursive: true });

writeFileSync(join(OUT, 'hero.svg'), hero({ work, portrait, booking }));
work.forEach((p, i) => writeFileSync(join(OUT, 'work', `${p.slug}.svg`), workCard(p, i)));

const pillImg = (dir, l) => {
  const { svg: s, w, h } = pill(l.label, l.primary);
  writeFileSync(join(OUT, dir, `${l.file}.svg`), s);
  const dh = 36;
  return `<a href="${l.href}"><img src="assets/${dir}/${l.file}.svg" alt="${esc(l.label)}" height="${dh}" width="${Math.round((w * dh) / h)}"></a>`;
};

// Work: three cards to a row, then the same nine in words (with code links).
const cardImg = (p) =>
  `<a href="${SITE}/work/${p.slug}/"><img src="assets/work/${p.slug}.svg" alt="${esc(`${p.name}: case study`)}" width="32.5%"></a>`;
const workGrid = work.map(cardImg).join('\n');
const workList = work
  .map((p) => {
    const repo = REPOS[p.slug] ? ` · [code](https://github.com/NateJ45/${REPOS[p.slug]})` : '';
    return `- **[${p.name}](${SITE}/work/${p.slug}/)** (${p.sector.toLowerCase()}). ${p.outcome} [${p.host}](https://${p.host})${repo}`;
  })
  .join('\n');

const results = RESULTS.filter((r) => peek.work[r.slug])
  .map((r) => {
    const p = peek.work[r.slug];
    writeFileSync(join(OUT, 'results', `${r.slug}.svg`), resultCard(r, p));
    return `<a href="${SITE}/work/${r.slug}/"><img src="assets/results/${r.slug}.svg" alt="${esc(`${r.figure} ${r.text}. ${p.name}. Read the case study.`)}" width="32.5%"></a>`;
  })
  .join('\n');

// Journal: newest first, in the feed's order, with the site's own labels.
const items = [...rss.matchAll(/<item>[\s\S]*?<link>(.*?)<\/link>/g)].map((m) => m[1]);
const journal = items
  .map((href) => href.match(/\/journal\/([^/]+)\/?$/)?.[1])
  .filter((slug) => slug && peek.posts?.[slug])
  .slice(0, 5)
  .map((slug) => {
    const post = peek.posts[slug];
    return `- [${post.title}](${SITE}/journal/${slug}/) <sub>${post.cluster} · ${post.min} min</sub>`;
  })
  .join('\n');

const count = ['Zero', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve'][work.length] ?? String(work.length);

const fill = {
  COUNT: count,
  COUNT_LC: count.toLowerCase(),
  LINKS: LINKS.map((l) => pillImg('links', l)).join('\n'),
  WORK_GRID: workGrid,
  WORK_LIST: workList,
  RESULTS: results,
  JOURNAL: journal,
  ELSEWHERE: ELSEWHERE.map((l) => pillImg('links', l)).join('\n'),
};
const template = readFileSync(join(ROOT, 'scripts', 'readme.template.md'), 'utf8');
const readme = template.replace(/\{\{(\w+)\}\}/g, (_, k) => {
  if (!(k in fill)) throw new Error(`Unknown placeholder ${k}`);
  return fill[k];
});
writeFileSync(join(ROOT, 'README.md'), readme);

console.log(`Built ${work.length} work cards, ${RESULTS.length} results, ${journal.split('\n').length} journal links. Booking pill: ${booking}.`);
