import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
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

test('un build aislado sirve siete rutas y once fotos bajo /ona/', async () => {
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
    assert.equal(result.paginas, 7);
    assert.equal(result.fotos, 11);
    const portrait = await readFile(join(root, 'dist/diario/la-friolera-de-la-casa/index.html'), 'utf8');
    assert.match(portrait, /width="960" height="1280"/);
    assert.match(portrait, /aria-current="location"/);
    for (const [path, label] of [['', 'Inicio'], ['su-historia/', 'Su historia'], ['diario/', 'Diario'], ['juego/', 'Juego']]) {
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

test('Pages publica solo main por push o disparo manual y después de los checks', async () => {
  const workflow = await read('.github/workflows/pages.yml');
  assert.match(workflow, /on:\n  push:\n    branches: \[main\]\n  workflow_dispatch:/);
  assert.doesNotMatch(workflow, /^  (pull_request|pull_request_target|schedule):/m);
  assert.match(workflow, /if: github\.ref == 'refs\/heads\/main'/);
  assert.match(workflow, /node-version: '26\.13\.1'/);
  assert.match(workflow, /persist-credentials: false/);
  assert.match(workflow, /contents: read/);
  assert.match(workflow, /permissions: \{\}/);
  assert.match(workflow, /deploy:\n    needs: build\n    if: github\.ref == 'refs\/heads\/main'/);
  assert.match(workflow, /pages: write\n      id-token: write/);
  assert.match(workflow, /name: github-pages/);
  assert.match(workflow, /group: pages-\$\{\{ github\.ref \}\}\n  cancel-in-progress: false/);
  assert.doesNotMatch(workflow, /configure-pages|continue-on-error|always\(/);
  const buildJob = workflow.split('  deploy:')[0];
  assert.doesNotMatch(buildJob, /pages: write|id-token: write/);
  const install = workflow.indexOf('npm ci --ignore-scripts');
  const tests = workflow.indexOf('npm test');
  const build = workflow.indexOf('npm run build');
  const check = workflow.indexOf('node scripts/check-site.mjs dist /ona/');
  const upload = workflow.indexOf('actions/upload-pages-artifact@');
  const deploy = workflow.indexOf('actions/deploy-pages@');
  assert.ok(install > 0 && tests > install && build > tests && check > build && upload > check && deploy > upload);
  assert.match(workflow, /ONA_BASE: \/ona\//);
  assert.match(workflow, /path: dist/);
  for (const [, sha] of workflow.matchAll(/uses: actions\/[\w-]+@([^\s]+)/g)) assert.match(sha, /^[\da-f]{40}$/);
});

test('el guard real del workflow rechaza commits antiguos y otras ramas', async () => {
  const workflow = await read('.github/workflows/pages.yml');
  const block = workflow.match(/name: Comprobar que el commit sigue en main[\s\S]*?run: \|\n([\s\S]*?)(?=\n      - name:)/)?.[1];
  assert.ok(block, 'Falta el guard anterior a deploy-pages');
  const script = block.replace(/^          /gm, '');
  for (const [ref, sha, head, status] of [
    ['refs/heads/main', 'nuevo', 'nuevo', 0],
    ['refs/heads/main', 'viejo', 'nuevo', 1],
    ['refs/heads/otra', 'nuevo', 'nuevo', 1],
  ]) {
    // Sustituye solo gh por una función local: no red, tokens ni despliegue.
    const result = spawnSync('bash', ['-e', '-c', `gh() { printf '%s\\n' "$FAKE_HEAD"; }\n${script}`], {
      env: { ...process.env, GH_REPO: 'fixture/site', GITHUB_REF: ref, GITHUB_SHA: sha, FAKE_HEAD: head }, encoding: 'utf8',
    });
    assert.equal(result.status, status, result.stderr);
  }
});
