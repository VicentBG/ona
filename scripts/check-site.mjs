import assert from 'node:assert/strict';
import { readFile, readdir, stat } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

// Contrato del HTML estático actual, no un parser HTML/CSS/JS ni una prueba HTTP.
export async function comprobarSitio(directorio, base) {
  assert.ok(base.startsWith('/') && base.endsWith('/'), 'La base debe empezar y terminar en /');
  const archivos = [];
  async function listar(relativa = '') {
    for (const entry of await readdir(join(directorio, relativa), { withFileTypes: true })) {
      assert.ok(!entry.isSymbolicLink(), `No publicar enlaces simbólicos: ${entry.name}`);
      assert.ok(!entry.name.startsWith('.'), `No publicar archivos ocultos: ${entry.name}`);
      const path = join(relativa, entry.name);
      if (entry.isDirectory()) await listar(path);
      else archivos.push(path);
    }
  }
  await listar();
  const paginas = archivos.filter((path) => path.endsWith('.html'));
  assert.ok(paginas.length, 'Falta HTML en el artefacto');
  const origin = 'https://comprobacion.invalid';
  let destinos = 0;
  for (const pagina of paginas) {
    const html = await readFile(join(directorio, pagina), 'utf8');
    const actual = new URL(base + pagina.replace(/index\.html$/, ''), origin);
    for (const [, atributo, valor] of html.matchAll(/\b(href|src|srcset)="([^"]+)"/g)) {
      const urls = atributo === 'srcset' ? valor.split(',').map((item) => item.trim().split(/\s+/)[0]) : [valor];
      for (const raw of urls) {
        const url = new URL(raw.replaceAll('&amp;', '&'), actual);
        if (url.origin !== origin) continue; // Enlaces externos no son rutas del sitio.
        assert.ok(url.pathname.startsWith(base), `${pagina}: escapa de ${base}: ${raw}`);
        const relativa = decodeURIComponent(url.pathname.slice(base.length));
        assert.ok(!relativa.split('/').includes('..'), `Ruta no válida: ${raw}`);
        let destino = join(directorio, relativa);
        if ((await stat(destino)).isDirectory()) destino = join(destino, 'index.html');
        assert.ok((await stat(destino)).isFile(), `${pagina}: falta ${raw}`);
        if (url.hash) {
          const target = await readFile(destino, 'utf8');
          assert.ok(target.includes(`id="${decodeURIComponent(url.hash.slice(1))}"`), `${pagina}: falta ancla ${raw}`);
        }
        destinos++;
      }
    }
  }
  return { paginas: paginas.length, fotos: archivos.filter((path) => path.endsWith('.webp')).length, destinos };
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const [directorio = 'dist', base = '/ona/'] = process.argv.slice(2);
  console.log(JSON.stringify(await comprobarSitio(directorio, base)));
}
