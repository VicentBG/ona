import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import test from 'node:test';

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), 'utf8');
const routes = new Map([
  ['/', 'dist/index.html'],
  ['/su-historia/', 'dist/su-historia/index.html'],
  ['/diario/', 'dist/diario/index.html'],
  ['/diario/una-puerta-corredera-y-una-sorpresa/', 'dist/diario/una-puerta-corredera-y-una-sorpresa/index.html'],
  ['/diario/ona-y-los-dos-gatos-de-casa/', 'dist/diario/ona-y-los-dos-gatos-de-casa/index.html'],
  ['/diario/la-friolera-de-la-casa/', 'dist/diario/la-friolera-de-la-casa/index.html'],
]);
const approved = 'Ona nació el 14 de febrero de 2026. Con un mes y pico llegó a casa y empezó su historia con nosotros. Era todavía muy pequeña: por delante quedaban sus primeros descubrimientos, nuevas rutinas y mucho por aprender juntos.';

test('Su historia reutiliza el layout y conserva el comienzo aprobado', async () => {
  const source = await read('src/pages/su-historia.astro');
  assert.match(source, /import BaseLayout from/);
  assert.match(source, /<BaseLayout\b/);
  assert.doesNotMatch(source, /<script\b|data-reveal|import type|interface Props/);
  const html = await read(routes.get('/su-historia/'));
  assert.match(html, /<h1\b[^>]*>Su historia<\/h1>/);
  assert.match(html, /<h2\b[^>]*>Un comienzo en febrero<\/h2>/);
  const article = html.match(/<article\b[^>]*>([\s\S]*?)<\/article>/)?.[1];
  assert.ok(article);
  const paragraphs = [...article.matchAll(/<p\b[^>]*>([\s\S]*?)<\/p>/g)].map(([, p]) => p.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim());
  assert.ok(paragraphs.includes(approved));
  assert.doesNotMatch(html, /<script\b|data-reveal=/);
});

test('la historia añade el recuerdo humano sin fechar las fotografías como esa noche', async () => {
  const html = await read(routes.get('/su-historia/'));
  assert.match(html, /<h2\b[^>]*>La primera noche<\/h2>/);
  assert.match(html, /La primera noche echaba de menos a su mamá\. Tuve que dormir con ella\./);
  assert.match(html, /Ona de cachorra, sobre una manta gris\./);
  assert.match(html, /Entre mantas y un peluche\./);
  assert.doesNotMatch(html, /<time\b|<script\b|https?:\/\//);
});

test('dos fotos locales tienen variantes, dimensiones y prioridades sin depender de JavaScript', async () => {
  const html = await read(routes.get('/su-historia/'));
  const images = [...html.matchAll(/<img\b[^>]*>/g)].map(([tag]) => tag);
  assert.equal(images.length, 2);
  assert.equal((html.match(/<figure\b/g) || []).length, 2);
  assert.equal((html.match(/<figcaption\b/g) || []).length, 2);
  assert.match(images[0], /fetchpriority="high"/);
  assert.doesNotMatch(images[0], /loading="lazy"/);
  assert.match(images[1], /loading="lazy"/);
  assert.doesNotMatch(images[1], /fetchpriority=/);
  for (const tag of images) {
    assert.match(tag, /alt="[^"]+"/);
    assert.match(tag, /width="\d+"/);
    assert.match(tag, /height="\d+"/);
    assert.match(tag, /src="\/images\/historia\/[^"]+\.webp"/);
    assert.match(tag, /srcset="\/images\/historia\/[^"]+ 480w, \/images\/historia\/[^"]+ 960w"/);
    assert.match(tag, /sizes="[^"]+"/);
  }
});

test('las cuatro variantes WebP son locales, ligeras y no conservan metadatos', async () => {
  let total = 0;
  for (const name of ['ona-cachorra-manta', 'ona-cachorra-peluche']) {
    for (const width of [480, 960]) {
      const photo = await readFile(new URL(`../public/images/historia/${name}-${width}.webp`, import.meta.url));
      assert.equal(photo.toString('ascii', 0, 4), 'RIFF');
      assert.equal(photo.toString('ascii', 8, 12), 'WEBP');
      assert.ok(photo.length < 200_000);
      total += photo.length;
      const chunks = [];
      for (let offset = 12; offset + 8 <= photo.length;) {
        chunks.push(photo.toString('ascii', offset, offset + 4));
        const length = photo.readUInt32LE(offset + 4);
        offset += 8 + length + (length % 2);
        assert.ok(offset <= photo.length);
      }
      for (const chunk of ['EXIF', 'XMP ', 'ICCP']) assert.ok(!chunks.includes(chunk), chunk);
    }
  }
  assert.ok(total < 400_000, 'Presupuesto de las cuatro variantes, no transferencia por visita');
});

test('se generan seis rutas con documento único y metadatos propios', async () => {
  const pages = (await readdir(new URL('../dist/', import.meta.url), { recursive: true })).filter((path) => path.endsWith('.html')).sort();
  assert.deepEqual(pages, [...routes.values()].map((file) => file.replace('dist/', '')).sort());
  const titles = new Set();
  const descriptions = new Set();
  for (const [route, file] of routes) {
    const html = await read(file);
    for (const tag of ['html', 'head', 'body', 'header', 'main', 'footer', 'h1']) {
      assert.equal((html.match(new RegExp(`<${tag}\\b`, 'g')) || []).length, 1, `${route}: ${tag}`);
    }
    assert.match(html, /<html\b[^>]*lang="es"/);
    assert.match(html, /<main\b[^>]*id="contenido"/);
    const title = html.match(/<title>([^<]+)<\/title>/)?.[1];
    const description = html.match(/<meta\b[^>]*name="description"[^>]*content="([^"]+)"/)?.[1];
    assert.ok(title && description);
    titles.add(title);
    descriptions.add(description);
  }
  assert.equal(titles.size, routes.size);
  assert.equal(descriptions.size, routes.size);
});

test('la navegación identifica la página actual y funciona sin JavaScript', async () => {
  for (const [route, file] of routes) {
    const html = await read(file);
    const nav = html.match(/<nav\b[^>]*aria-label="Principal"[^>]*>([\s\S]*?)<\/nav>/)?.[1];
    assert.ok(nav, route);
    assert.match(nav, /<ul\b/);
    assert.match(nav, /href="\/"/);
    assert.match(nav, /href="\/su-historia\/"/);
    assert.match(nav, /href="\/#sobre-ona"/);
    assert.match(nav, /href="\/#proyecto"/);
    const current = [...nav.matchAll(/<a\b[^>]*aria-current="([^"]+)"[^>]*>/g)];
    assert.equal(current.length, 1, route);
    const isEntry = route.startsWith('/diario/') && route !== '/diario/';
    assert.equal(current[0][1], isEntry ? 'location' : 'page');
    assert.ok(current[0][0].includes(`href="${isEntry ? '/diario/' : route}"`), route);
    assert.doesNotMatch(nav, /role="(?:menu|menubar|menuitem)"|tabindex="[1-9]/);
    const header = html.match(/<header\b[^>]*>([\s\S]*?)<\/header>/)?.[1];
    const footer = html.match(/<footer\b[^>]*>([\s\S]*?)<\/footer>/)?.[1];
    assert.match(header, /class="marca" href="\/"/);
    assert.match(footer, /class="marca" href="\/"/);
  }
});

test('todos los enlaces de las seis páginas resuelven una ruta y un ancla existentes', async () => {
  const documents = new Map(await Promise.all([...routes].map(async ([route, file]) => [route, await read(file)])));
  for (const [route, html] of documents) {
    for (const [tag] of html.matchAll(/<a\b[^>]*>/g)) {
      const href = tag.match(/href="([^"]+)"/)?.[1];
      assert.ok(href, tag);
      const url = new URL(href, `https://example.test${route}`);
      assert.equal(url.origin, 'https://example.test');
      const target = documents.get(url.pathname);
      assert.ok(target, `${route} → ${href}`);
      if (url.hash) assert.ok(target.includes(`id="${decodeURIComponent(url.hash.slice(1))}"`), `${route} → ${href}`);
    }
  }
});
