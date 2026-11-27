import assert from 'node:assert/strict';
import test from 'node:test';

test('pantalla completa solo se solicita al invocar la acción y sin bloqueo de teclado', async () => {
  const { admitePantallaCompleta, alternarPantallaCompleta } = await import('../src/game/fullscreen.js');
  const calls = [];
  const doc = { fullscreenEnabled: true, fullscreenElement: null, exitFullscreen: async () => calls.push('salir') };
  const stage = { requestFullscreen: async options => { calls.push(options); doc.fullscreenElement = stage; } };
  assert.equal(admitePantallaCompleta(stage, doc), true);
  assert.deepEqual(calls, []);
  await alternarPantallaCompleta(stage, doc);
  assert.deepEqual(calls, [{ navigationUI: 'hide' }]);
  await alternarPantallaCompleta(stage, doc);
  assert.deepEqual(calls, [{ navigationUI: 'hide' }, 'salir']);
});

test('API ausente, política y denegación se detectan sin simular pantalla completa', async () => {
  const { admitePantallaCompleta, alternarPantallaCompleta } = await import('../src/game/fullscreen.js');
  const doc = { fullscreenEnabled: false, fullscreenElement: null, exitFullscreen: async () => {} };
  assert.equal(admitePantallaCompleta({}, doc), false);
  await assert.rejects(alternarPantallaCompleta({}, doc));
  const stage = { requestFullscreen: async () => { throw new Error('denegado'); } };
  doc.fullscreenEnabled = true;
  assert.equal(admitePantallaCompleta(stage, doc), true);
  await assert.rejects(alternarPantallaCompleta(stage, doc), /denegado/);
  assert.equal(doc.fullscreenElement, null);
});
