import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import test from 'node:test';

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), 'utf8');

test('Inicio y Diario comparten la importación de metadatos durante el build', async () => {
  const data = await read('src/data/diario.js');
  assert.match(data, /import\.meta\.glob/);
  assert.match(data, /eager:\s*true/);
  assert.match(data, /frontmatter\.orden/);
  for (const path of ['src/pages/index.astro', 'src/pages/diario/index.astro']) {
    const source = await read(path);
    assert.match(source, /import \{ entradasDiario \} from/);
    assert.doesNotMatch(source, /import\.meta\.glob/);
  }
  assert.match(await read('src/pages/index.astro'), /entradasDiario\.slice\(-3\)\.reverse\(\)/);
});

test('Inicio presenta hasta tres entradas en orden inverso con sus títulos y resúmenes originales', async () => {
  const entries = [];
  for (const name of await readdir(new URL('../src/pages/diario/', import.meta.url))) {
    if (!name.endsWith('.md')) continue;
    const md = await read(`src/pages/diario/${name}`);
    entries.push({
      url: `/diario/${name.replace(/\.md$/, '')}/`,
      titulo: md.match(/^titulo: '(.+)'$/m)?.[1],
      descripcion: md.match(/^descripcion: '(.+)'$/m)?.[1],
      orden: Number(md.match(/^orden: (\d+)$/m)?.[1]),
    });
  }
  const expected = entries.sort((a, b) => a.orden - b.orden).slice(-3).reverse();
  const html = await read('dist/index.html');
  const section = html.match(/<section\b[^>]*id="diario-reciente"[^>]*>([\s\S]*?)<\/section>/)?.[1];
  assert.ok(section);
  assert.match(section, /<h2\b[^>]*id="titulo-diario"[^>]*>Últimas entradas del Diario<\/h2>/);
  assert.match(section, /<ul\b/);
  assert.match(section, /href="\/diario\/"/);
  const cards = [...section.matchAll(/<article\b[^>]*>([\s\S]*?)<\/article>/g)].map(([, card]) => card);
  assert.equal(cards.length, expected.length);
  for (const [i, entry] of expected.entries()) {
    assert.ok(cards[i].includes(`href="${entry.url}"`));
    assert.ok(cards[i].includes(entry.titulo));
    assert.ok(cards[i].includes(entry.descripcion));
    assert.match(cards[i], /<h3\b/);
  }
  assert.doesNotMatch(section, /<script\b|<img\b|<time\b|data-reveal/);
});
