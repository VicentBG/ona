import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import test from 'node:test';

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), 'utf8');
const routes = new Map([['/', 'dist/index.html'], ['/su-historia/', 'dist/su-historia/index.html']]);
const approved = 'Ona nació el 14 de febrero de 2026. Con un mes y pico llegó a casa y empezó su historia con nosotros. Era todavía muy pequeña: por delante quedaban sus primeros descubrimientos, nuevas rutinas y mucho por aprender juntos.';

test('Su historia reutiliza el layout y contiene solo el comienzo aprobado', async () => {
  const source = await read('src/pages/su-historia.astro');
  assert.match(source, /import BaseLayout from/);
  assert.match(source, /<BaseLayout\b/);
  assert.doesNotMatch(source, /<script\b|<img\b|data-reveal|import type|interface Props/);
  const html = await read(routes.get('/su-historia/'));
  assert.match(html, /<h1\b[^>]*>Su historia<\/h1>/);
  assert.match(html, /<h2\b[^>]*>Un comienzo en febrero<\/h2>/);
  const article = html.match(/<article\b[^>]*>([\s\S]*?)<\/article>/)?.[1];
  assert.ok(article);
  const paragraphs = [...article.matchAll(/<p\b[^>]*>([\s\S]*?)<\/p>/g)].map(([, p]) => p.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim());
  assert.deepEqual(paragraphs, [approved]);
  assert.doesNotMatch(html, /<script\b|<img\b|data-reveal=/);
});

test('se generan dos rutas con documento único y metadatos propios', async () => {
  const pages = (await readdir(new URL('../dist/', import.meta.url), { recursive: true })).filter((path) => path.endsWith('.html')).sort();
  assert.deepEqual(pages, ['index.html', 'su-historia/index.html']);
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
  assert.equal(titles.size, 2);
  assert.equal(descriptions.size, 2);
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
    const current = [...nav.matchAll(/<a\b[^>]*aria-current="page"[^>]*>/g)];
    assert.equal(current.length, 1, route);
    assert.ok(current[0][0].includes(`href="${route}"`), route);
    assert.doesNotMatch(nav, /role="(?:menu|menubar|menuitem)"|tabindex="[1-9]/);
    const header = html.match(/<header\b[^>]*>([\s\S]*?)<\/header>/)?.[1];
    const footer = html.match(/<footer\b[^>]*>([\s\S]*?)<\/footer>/)?.[1];
    assert.match(header, /class="marca" href="\/"/);
    assert.match(footer, /class="marca" href="\/"/);
  }
});

test('todos los enlaces de ambas páginas resuelven una ruta y un ancla existentes', async () => {
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
