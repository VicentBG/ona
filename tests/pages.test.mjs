import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { cp, mkdir, mkdtemp, readFile, rm, symlink, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), 'utf8');

test('las URLs admiten raíz y subruta sin duplicar la base de Markdown', async () => {
  const { conBase, sinBase } = await import('../src/utils/urls.js');
  for (const base of ['/', '/ona/']) {
    const prefix = base === '/' ? '' : '/ona';
    for (const path of ['/', '/diario/', '/#sobre-ona', '/images/ona-portada.webp']) {
      const result = `${prefix}${path}`;
      assert.equal(conBase(path, base), result);
      assert.equal(conBase(result, base), result);
    }
    assert.equal(sinBase(`${prefix}/`, base), '/');
    assert.equal(sinBase(`${prefix}/diario/`, base), '/diario');
    assert.equal(sinBase(`${prefix}/diario/entrada/`, base), '/diario/entrada');
  }
  assert.equal(conBase('/onada/', '/ona/'), '/ona/onada/');
  assert.equal(sinBase('/onada/', '/ona/'), '/onada');
});

test('un build aislado sirve seis rutas y once fotos bajo /ona/', async () => {
  const root = await mkdtemp(join(tmpdir(), 'ona-pages-test-'));
  try {
    for (const dir of ['src', 'public']) {
      await cp(new URL(`../${dir}`, import.meta.url), join(root, dir), { recursive: true });
    }
    await cp(new URL('../astro.config.mjs', import.meta.url), join(root, 'astro.config.mjs'));
    await symlink(fileURLToPath(new URL('../node_modules', import.meta.url)), join(root, 'node_modules'), 'dir');
    await writeFile(join(root, 'package.json'), JSON.stringify({ private: true, type: 'module' }));
    execFileSync(process.execPath, [fileURLToPath(new URL('../node_modules/.bin/astro', import.meta.url)), 'build', '--root', root], {
      cwd: root, env: { ...process.env, ASTRO_TELEMETRY_DISABLED: '1', ONA_BASE: '/ona/' }, stdio: 'pipe', timeout: 30_000,
    });
    const home = await readFile(join(root, 'dist/index.html'), 'utf8');
    assert.match(home, /href="\/ona\/"/);
    assert.match(home, /src="\/ona\/images\/ona-portada.webp"/);
    const { comprobarSitio } = await import('../scripts/check-site.mjs');
    const result = await comprobarSitio(join(root, 'dist'), '/ona/');
    assert.equal(result.paginas, 6);
    assert.equal(result.fotos, 11);
    const portrait = await readFile(join(root, 'dist/diario/la-friolera-de-la-casa/index.html'), 'utf8');
    assert.match(portrait, /width="960" height="1280"/);
    assert.match(portrait, /aria-current="location"/);
    for (const [path, label] of [['', 'Inicio'], ['su-historia/', 'Su historia'], ['diario/', 'Diario']]) {
      const html = await readFile(join(root, 'dist', path, 'index.html'), 'utf8');
      assert.match(html, new RegExp(`aria-current="page"[^>]*>${label}</a>`));
      assert.equal((html.match(/aria-current=/g) || []).length, 1);
    }
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test('el comprobador valida raíz y rechaza escape, doble base y ancla inexistente', async () => {
  const { comprobarSitio } = await import('../scripts/check-site.mjs');
  const root = await mkdtemp(join(tmpdir(), 'ona-site-check-'));
  try {
    await mkdir(join(root, 'images'));
    await writeFile(join(root, 'images/foto.webp'), 'fixture');
    for (const base of ['/', '/ona/']) {
      await writeFile(join(root, 'index.html'), `<h1 id="contenido">Ona</h1><a href="#contenido">Saltar</a><img src="${base}images/foto.webp">`);
      assert.equal((await comprobarSitio(root, base)).paginas, 1);
    }
    for (const href of ['/images/foto.webp', '/ona/ona/', '/ona/#inexistente']) {
      await writeFile(join(root, 'index.html'), `<a href="${href}">Fallo</a>`);
      await assert.rejects(comprobarSitio(root, '/ona/'));
    }
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test('P1 prepara solo artefacto manual, restringido a main y tras checks', async () => {
  const workflow = await read('.github/workflows/pages.yml');
  assert.match(workflow, /on:\n  workflow_dispatch:/);
  assert.doesNotMatch(workflow, /^  (push|pull_request|pull_request_target|schedule):/m);
  assert.match(workflow, /if: github\.ref == 'refs\/heads\/main'/);
  assert.match(workflow, /node-version: '26\.13\.1'/);
  assert.match(workflow, /persist-credentials: false/);
  assert.match(workflow, /contents: read/);
  assert.doesNotMatch(workflow, /pages: write|id-token: write|deploy-pages|configure-pages|continue-on-error|always\(/);
  const install = workflow.indexOf('npm ci --ignore-scripts');
  const tests = workflow.indexOf('npm test');
  const build = workflow.indexOf('npm run build');
  const check = workflow.indexOf('node scripts/check-site.mjs dist /ona/');
  const upload = workflow.indexOf('actions/upload-pages-artifact@');
  assert.ok(install > 0 && tests > install && build > tests && check > build && upload > check);
  assert.match(workflow, /ONA_BASE: \/ona\//);
  assert.match(workflow, /path: dist/);
  for (const [, sha] of workflow.matchAll(/uses: actions\/[\w-]+@([^\s]+)/g)) assert.match(sha, /^[\da-f]{40}$/);
});
