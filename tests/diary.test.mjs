import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), 'utf8');
const entries = ['una-puerta-corredera-y-una-sorpresa', 'ona-y-los-dos-gatos-de-casa'];

test('el listado obtiene título, resumen y URL de los dos archivos Markdown', async () => {
  const source = await read('src/pages/diario/index.astro');
  assert.match(source, /import\.meta\.glob/);
  const html = await read('dist/diario/index.html');
  assert.match(html, /<h1\b[^>]*>Diario de Ona<\/h1>/);
  assert.match(html, /<ul\b/);
  for (const slug of entries) {
    const md = await read(`src/pages/diario/${slug}.md`);
    assert.match(md, /layout: ['"]?\.\.\/\.\.\/layouts\/EntradaDiario\.astro/);
    assert.match(md, /titulo:/);
    assert.match(md, /descripcion:/);
    assert.doesNotMatch(md, /fecha:|date:/);
    assert.ok(html.includes(`href="/diario/${slug}/"`));
  }
});

test('las entradas usan layout compartido, un artículo y contenido Markdown sin JS', async () => {
  const layout = await read('src/layouts/EntradaDiario.astro');
  assert.match(layout, /Astro\.props/);
  assert.match(layout, /frontmatter/);
  assert.match(layout, /<BaseLayout\b/);
  assert.match(layout, /<slot\s*\/>/);
  for (const slug of entries) {
    const html = await read(`dist/diario/${slug}/index.html`);
    assert.equal((html.match(/<article\b/g) || []).length, 1);
    assert.match(html, /href="\/diario\/"[^>]*>Volver al diario/);
    assert.doesNotMatch(html, /<script\b|<time\b|data-reveal/);
  }
});

test('el relato de la puerta incorpora el sofá como observación y no como lesión', async () => {
  const html = await read(`dist/diario/${entries[0]}/index.html`);
  assert.match(html, /lo primero que vimos fue a Ona encima del sofá\. La sorpresa fue mayúscula\./);
  assert.match(html, /nos preocupaba que pudiera subirse al sofá y hacerse daño al caer/i);
  assert.match(html, /había conseguido abrir la puerta corredera/i);
  assert.doesNotMatch(html, /se cayó|se hizo daño|saltó del sofá|<time\b/);
});

test('el relato de los gatos conserva la convivencia sin inventar amistad', async () => {
  const html = await read(`dist/diario/${entries[1]}/index.html`);
  assert.match(html, /dos gatos mayores/);
  assert.match(html, /curiosidad y extrañeza/);
  assert.match(html, /no se tienen demasiada estima/);
  assert.match(html, /convivir no siempre significa convertirse en inseparables/);
});

test('cada entrada muestra solo su foto local con pie, texto alternativo y variantes', async () => {
  const photos = ['ona-sofa', 'ona-y-gato'];
  const captions = ['Ona, instalada en el sofá.', 'Compartiendo sofá, cada uno a lo suyo.'];
  for (const [i, slug] of entries.entries()) {
    const html = await read(`dist/diario/${slug}/index.html`);
    const images = [...html.matchAll(/<img\b[^>]*>/g)].map(([tag]) => tag);
    assert.equal(images.length, 1);
    assert.equal((html.match(/<figure\b/g) || []).length, 1);
    assert.ok(html.includes(captions[i]));
    assert.match(images[0], /alt="[^"]+"/);
    assert.ok(images[0].includes(`src="/images/diario/${photos[i]}-960.webp"`));
    assert.ok(images[0].includes(`srcset="/images/diario/${photos[i]}-480.webp 480w, /images/diario/${photos[i]}-960.webp 960w"`));
    assert.match(images[0], /sizes="[^"]+"/);
    assert.match(images[0], /width="960"/);
    assert.match(images[0], /height="721"/);
    assert.match(images[0], /fetchpriority="high"/);
    assert.doesNotMatch(images[0], /loading="lazy"/);
    assert.doesNotMatch(html, /https?:\/\/|aquella mañana|foto de aquel día/);
  }
  assert.doesNotMatch(await read('dist/diario/index.html'), /<img\b/);
});

test('las cuatro variantes del diario son WebP locales sin metadatos privados', async () => {
  let total = 0;
  for (const name of ['ona-sofa', 'ona-y-gato']) {
    for (const width of [480, 960]) {
      const photo = await readFile(new URL(`../public/images/diario/${name}-${width}.webp`, import.meta.url));
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
      for (const chunk of ['EXIF', 'XMP ', 'ICCP']) assert.ok(!chunks.includes(chunk));
    }
  }
  assert.ok(total < 400_000, 'Presupuesto de archivos, no descarga por visita');
});

test('Diario es página actual en el listado y sección actual en cada entrada', async () => {
  for (const path of ['index', ...entries.map((slug) => `${slug}/index`)]) {
    const html = await read(`dist/diario/${path}.html`);
    const nav = html.match(/<nav\b[^>]*aria-label="Principal"[^>]*>([\s\S]*?)<\/nav>/)?.[1];
    const current = [...nav.matchAll(/<a\b[^>]*aria-current="([^"]+)"[^>]*>/g)];
    assert.equal(current.length, 1);
    assert.match(current[0][0], /href="\/diario\/"/);
    assert.equal(current[0][1], path === 'index' ? 'page' : 'location');
  }
});
