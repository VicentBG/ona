import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), 'utf8');

test('la partida captura una vez, limita daño y separa pausa y finales', async () => {
  const { nuevaPartida, capturar, golpear, terminar } = await import('../src/game/rules.js');
  const s = nuevaPartida();
  assert.equal(s.vidas, 3);
  assert.equal(capturar(s, 'a'), true);
  assert.equal(capturar(s, 'a'), false);
  assert.equal(s.capturas.size, 1);
  assert.equal(golpear(s, 0), true);
  assert.equal(golpear(s, 100), false);
  s.estado = 'pausa';
  assert.equal(capturar(s, 'b'), false);
  assert.equal(golpear(s, 2000), false);
  s.estado = 'jugando';
  assert.equal(golpear(s, 2000), true);
  assert.equal(golpear(s, 4000), true);
  assert.equal(s.estado, 'fin');
  terminar(s);
  assert.equal(s.estado, 'fin');
  const next = nuevaPartida();
  terminar(next);
  assert.equal(next.estado, 'victoria');
  assert.equal(next.capturas.size, 0);
});

test('entradas simultáneas se liberan por fuente y salto solo tiene un flanco', async () => {
  const { crearEntrada } = await import('../src/game/input.js');
  const i = crearEntrada();
  i.pulsar('p1', 'derecha'); i.pulsar('p2', 'salto');
  assert.equal(i.eje(), 1);
  assert.equal(i.saltar(), true);
  assert.equal(i.saltar(), false);
  i.pulsar('p2', 'salto');
  assert.equal(i.saltar(), false, 'No repetir por mantener el botón');
  i.soltar('p2');
  assert.equal(i.eje(), 1);
  i.pulsar('k1', 'derecha'); i.soltar('p1');
  assert.equal(i.eje(), 1, 'Otra fuente todavía mantiene la dirección');
  i.pulsar('p3', 'izquierda'); assert.equal(i.eje(), 0);
  i.limpiar(); assert.equal(i.eje(), 0); assert.equal(i.saltar(), false);
});

test('la ruta ofrece controles HTML y carga el motor solo mediante import dinámico', async () => {
  const page = await read('dist/juego/index.html');
  assert.match(page, /<h1[^>]*>Juega con Ona<\/h1>/);
  assert.match(page, /<noscript>/);
  assert.match(page, /data-start/);
  assert.match(page, /data-action="izquierda"/);
  assert.match(page, /data-action="derecha"/);
  assert.match(page, /data-action="salto"/);
  assert.doesNotMatch(page, /<canvas|modulepreload/);
  const source = await read('src/game/controller.js');
  assert.match(source, /await import\('\.\/phaser-game.js'\)/);
  assert.doesNotMatch(source, /import .* from ['"]phaser/);
  assert.match(source, /pointercancel/);
  assert.match(source, /lostpointercapture/);
  assert.match(source, /visibilitychange/);
});
