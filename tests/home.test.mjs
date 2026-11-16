import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), 'utf8');

// Contratos del HTML generado: no son una prueba visual ni un parser HTML.
test('la portada presenta los datos aportados sobre Ona', async () => {
  const html = await read('dist/index.html');
  assert.match(html, /<h1\b[^>]*>Hola, soy Ona\.<\/h1>/);
  assert.match(html, /pointerdor/);
  assert.match(html, /9 meses/);
  assert.match(html, /noviembre de 2026/);
  assert.doesNotMatch(html, /<img\b/); // Todavía no hay fotos aportadas.
});

test('el documento tiene estructura básica y enlaces locales válidos', async () => {
  const html = await read('dist/index.html');
  assert.match(html, /<html\b[^>]*lang="es"/);
  assert.match(html, /<title>Ona · Mi primera web con Astro<\/title>/);
  assert.match(html, /<meta\b[^>]*name="description"/);
  assert.equal((html.match(/<h1\b/g) || []).length, 1);
  assert.equal((html.match(/<main\b/g) || []).length, 1);
  for (const [, id] of html.matchAll(/href="#([^"]+)"/g)) {
    assert.ok(html.includes(`id="${id}"`), `Falta el destino #${id}`);
  }
  assert.doesNotMatch(html, /<script\b/); // La portada no necesita JS de navegador.
  assert.doesNotMatch(html, /(?:src|href)="https?:\/\//);
});

test('el estilo cómic conserva contraste de texto y no añade efectos activos', async () => {
  const page = await read('src/pages/index.astro');
  const colors = Object.fromEntries([...page.matchAll(/--(tinta|papel|amarillo|rosa|menta|lila):\s*(#[\da-f]{6})/gi)].map(([, name, value]) => [name, value]));
  for (const key of ['tinta', 'papel', 'amarillo', 'rosa', 'menta', 'lila']) assert.ok(colors[key], key);
  const luminance = (hex) => {
    const rgb = hex.slice(1).match(/../g).map((v) => parseInt(v, 16) / 255)
      .map((v) => v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4);
    return rgb[0] * 0.2126 + rgb[1] * 0.7152 + rgb[2] * 0.0722;
  };
  for (const [name, color] of Object.entries(colors)) {
    if (name === 'tinta') continue;
    const values = [luminance(color), luminance(colors.tinta)].sort((a, b) => b - a);
    assert.ok((values[0] + 0.05) / (values[1] + 0.05) >= 4.5, name);
  }
  assert.match(page, /class="onomatopeya" aria-hidden="true"/);
  assert.match(page, /:focus-visible/);
  assert.doesNotMatch(page, /@import|@font-face|animation\s*:|transition\s*:/);
});

test('Astro está fijado y la configuración permite escribir JavaScript', async () => {
  const pkg = JSON.parse(await read('package.json'));
  const config = JSON.parse(await read('tsconfig.json'));
  assert.equal(pkg.private, true);
  assert.equal(pkg.dependencies.astro, '7.4.12');
  assert.equal(config.extends, 'astro/tsconfigs/base');
  for (const mode of ['dev', 'preview']) {
    assert.ok(pkg.scripts[mode].includes('--host 127.0.0.1'));
    assert.ok(pkg.scripts[mode].includes('--ignore-lock'));
    assert.ok(pkg.scripts[mode].includes('ASTRO_TELEMETRY_DISABLED=1'));
  }
  const page = await read('src/pages/index.astro');
  assert.match(page, /const nombre = 'Ona'/);
  assert.doesNotMatch(page, /interface Props|import type|<script[^>]*lang="ts"/);
});
