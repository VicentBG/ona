import assert from 'node:assert/strict';
import test from 'node:test';

test('el nivel corto mantiene tres conejos y una geometría acotada', async () => {
  const { NIVEL } = await import('../src/game/level.js');
  assert.equal(NIVEL.conejos.length, 3);
  assert.equal(new Set(NIVEL.conejos.map(c => c.id)).size, 3);
  assert.equal(NIVEL.ancho, 1800);
  assert.ok(NIVEL.meta > NIVEL.jabali.hasta + 200);
  for (const p of NIVEL.plataformas) {
    assert.ok(p.y >= 170 && p.y <= 250);
    assert.ok(p.x - p.ancho / 2 > 0 && p.x + p.ancho / 2 < NIVEL.meta);
  }
  assert.ok(NIVEL.conejos.some(c => c.x > NIVEL.jabali.hasta), 'También hay una captura al final del recorrido');
});

test('el arte original genera ocho texturas una vez y libera cada Graphics temporal', async () => {
  const { crearPersonajes } = await import('../src/game/art.js');
  const keys = new Set(); let destruidos = 0;
  const scene = {
    textures: { exists: key => keys.has(key) },
    make: { graphics: () => {
      const graphics = new Proxy({}, { get: (_, key) => {
        if (key === 'generateTexture') return name => { assert.ok(!keys.has(name)); keys.add(name); return graphics; };
        if (key === 'destroy') return () => { destruidos++; };
        return () => graphics;
      } });
      return graphics;
    } },
  };
  crearPersonajes(scene);
  assert.deepEqual([...keys].sort(), ['conejo-0','conejo-1','jabali-0','jabali-1','ona-aire','ona-paso-0','ona-paso-1','ona-quieta']);
  assert.equal(destruidos, 8);
  crearPersonajes(scene);
  assert.equal(destruidos, 8, 'Reiniciar no regenera texturas');
});
