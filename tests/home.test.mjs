import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), 'utf8');

// Contratos del HTML generado: no son una prueba visual ni un parser HTML.
test('la portada presenta los datos aportados sobre Ona', async () => {
  const html = await read('dist/index.html');
  const heading = html.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/)?.[1];
  assert.ok(heading);
  assert.equal(heading.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim(), 'Hola, soy Ona.');
  assert.match(html, /pointerdor/);
  assert.match(html, /9 meses/);
  assert.match(html, /noviembre de 2026/);
  const images = [...html.matchAll(/<img\b[^>]*>/g)];
  assert.equal(images.length, 1, 'Solo la foto A autorizada para portada');
  assert.match(images[0][0], /src="\/images\/ona-portada.webp"/);
  assert.match(images[0][0], /alt="Ona, una perra blanca y negra, mirando a cámara\."/);
  assert.match(images[0][0], /width="\d+"/);
  assert.match(images[0][0], /height="\d+"/);
  assert.match(images[0][0], /fetchpriority="high"/);
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
  const scripts = [...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/g)];
  assert.equal(scripts.length, 1, 'Un solo módulo de mejora progresiva');
  for (const [, attrs, body] of scripts) {
    assert.match(attrs, /type="module"/);
    const src = attrs.match(/src="([^"]+)"/);
    if (src) assert.ok(src[1].startsWith('/_astro/'), src[1]);
    else assert.match(body, /IntersectionObserver/); // Astro puede incrustar módulos pequeños.
    assert.doesNotMatch(body, /https?:\/\//);
  }
  assert.doesNotMatch(html, /(?:src|href)="https?:\/\//);
});

test('el estilo de mascotas conserva contraste y permite movimiento reducido', async () => {
  const page = [await read('src/pages/index.astro'), await read('src/styles/global.css')].join('\n');
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
  assert.match(page, /class="foto-ona"/);
  assert.match(page, /:focus-visible/);
  assert.match(page, /prefers-reduced-motion:\s*reduce/);
  assert.match(page, /scroll-behavior:\s*smooth/);
  assert.match(page, /scroll-behavior:\s*auto/);
  assert.doesNotMatch(page, /@import|@font-face|\binfinite\b/);
});

test('el saludo anima letras sin fragmentar el nombre accesible y los bloques alternan lados', async () => {
  const html = await read('dist/index.html');
  assert.match(html, /<h1\b[^>]*aria-label="Hola, soy Ona\."/);
  assert.equal((html.match(/class="letra"/g) || []).length, 12);
  assert.equal((html.match(/class="palabra"[^>]*aria-hidden="true"/g) || []).length, 3);
  assert.match(html, /data-reveal="izquierda"/);
  assert.match(html, /data-reveal="derecha"/);
  const page = await read('src/pages/index.astro');
  assert.match(page, /@keyframes llegar-letra/);
  assert.match(page, /animation-delay:\s*calc\(var\(--orden\) \* 65ms\)/);
  assert.match(page, /translate3d\(var\(--entrada-x\)/);
  assert.match(page, /\.letra[^}]*animation:\s*none/);
});

test('la foto local está optimizada y no conserva bloques de metadatos', async () => {
  const photo = await readFile(new URL('../public/images/ona-portada.webp', import.meta.url));
  assert.equal(photo.toString('ascii', 0, 4), 'RIFF');
  assert.equal(photo.toString('ascii', 8, 12), 'WEBP');
  assert.ok(photo.length < 200_000, 'Presupuesto de 200 kB para la portada');
  const chunks = [];
  for (let offset = 12; offset + 8 <= photo.length;) {
    chunks.push(photo.toString('ascii', offset, offset + 4));
    const length = photo.readUInt32LE(offset + 4);
    offset += 8 + length + (length % 2);
    assert.ok(offset <= photo.length, 'Contenedor WebP válido');
  }
  for (const chunk of ['EXIF', 'XMP ', 'ICCP']) assert.ok(!chunks.includes(chunk), chunk);
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
