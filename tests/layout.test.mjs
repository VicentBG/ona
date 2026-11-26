import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { cp, mkdir, mkdtemp, readFile, rm, symlink, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), 'utf8');

test('Inicio usa un layout con slot y componentes, sin duplicar el documento', async () => {
  const page = await read('src/pages/index.astro');
  const layout = await read('src/layouts/BaseLayout.astro');
  assert.match(page, /import BaseLayout from/);
  assert.match(page, /<BaseLayout\b/);
  assert.doesNotMatch(page, /<!doctype|<html\b|<head\b|<body\b|<header\b|<footer\b|<main\b/i);
  assert.match(layout, /Astro\.props/);
  assert.match(layout, /<slot\s*\/>/);
  assert.match(layout, /<Cabecera\s*\/>/);
  assert.match(layout, /<Pie\s*\/>/);
});

test('la ruta generada conserva un documento, cabecera, contenido y pie', async () => {
  const html = await read('dist/index.html');
  for (const tag of ['html', 'head', 'body', 'header', 'main', 'footer']) {
    assert.equal((html.match(new RegExp(`<${tag}\\b`, 'g')) || []).length, 1, tag);
  }
  assert.match(html, /<main\b[^>]*id="contenido"/);
  assert.match(html, /aria-label="Principal"/);
});

test('el layout procesa otras props e inserta contenido en un build aislado', async () => {
  // Copia solo componentes/estilos a una raíz temporal: no crea rutas en la web
  // activa, no instala paquetes y nunca borra nada que no haya creado este test.
  const root = await mkdtemp(join(tmpdir(), 'ona-layout-test-'));
  try {
    await mkdir(join(root, 'src/pages'), { recursive: true });
    for (const dir of ['layouts', 'components', 'styles', 'utils']) {
      await cp(new URL(`../src/${dir}`, import.meta.url), join(root, 'src', dir), { recursive: true });
    }
    await symlink(fileURLToPath(new URL('../node_modules', import.meta.url)), join(root, 'node_modules'), 'dir');
    await writeFile(join(root, 'package.json'), JSON.stringify({ private: true, type: 'module' }));
    await writeFile(join(root, 'astro.config.mjs'), 'export default { output: "static" };\n');
    await writeFile(join(root, 'src/pages/index.astro'), `---
import BaseLayout from '../layouts/BaseLayout.astro';
---
<BaseLayout titulo="Página aislada" descripcion="Descripción alternativa">
  <h1>Contenido del slot</h1>
  <p id="prueba">Texto exclusivo de la prueba.</p>
</BaseLayout>`);
    execFileSync(process.execPath, [fileURLToPath(new URL('../node_modules/.bin/astro', import.meta.url)), 'build', '--root', root], {
      cwd: root, env: { ...process.env, ASTRO_TELEMETRY_DISABLED: '1' }, stdio: 'pipe', timeout: 30_000,
    });
    const html = await readFile(join(root, 'dist/index.html'), 'utf8');
    assert.match(html, /<title>Página aislada<\/title>/);
    assert.match(html, /name="description" content="Descripción alternativa"/);
    assert.match(html, /<h1\b[^>]*>Contenido del slot<\/h1>/);
    assert.match(html, /Texto exclusivo de la prueba\./);
    assert.equal((html.match(/<main\b/g) || []).length, 1);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
