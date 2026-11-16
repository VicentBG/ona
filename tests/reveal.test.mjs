import assert from 'node:assert/strict';
import test from 'node:test';
import { initReveal } from '../src/scripts/reveal.js';

function fixture({ reduced = false, observer = true } = {}) {
  const elements = [20, 1200].map((top) => {
    const classes = new Set();
    return {
      classList: { add: (v) => classes.add(v), remove: (v) => classes.delete(v), contains: (v) => classes.has(v) },
      getBoundingClientRect: () => ({ top }),
    };
  });
  let onChange;
  const media = { matches: reduced, addEventListener: (_, fn) => { onChange = fn; }, removeEventListener: () => {} };
  const state = { observed: [], disconnected: false };
  class Observer {
    constructor(callback) { state.callback = callback; }
    observe(el) { state.observed.push(el); }
    unobserve(el) { state.observed = state.observed.filter((item) => item !== el); }
    disconnect() { state.disconnected = true; }
  }
  const win = { innerHeight: 800, matchMedia: () => media, ...(observer ? { IntersectionObserver: Observer } : {}) };
  return { win, doc: { querySelectorAll: () => elements }, elements, state, change: () => onChange?.({ matches: true }) };
}

test('con movimiento reducido no se oculta contenido ni se crea observador', () => {
  const f = fixture({ reduced: true });
  initReveal(f.win, f.doc);
  assert.equal(f.state.observed.length, 0);
  assert.ok(f.elements.every((el) => !el.classList.contains('pendiente')));
});

test('sin IntersectionObserver el contenido permanece visible', () => {
  const f = fixture({ observer: false });
  initReveal(f.win, f.doc);
  assert.ok(f.elements.every((el) => !el.classList.contains('pendiente')));
});

test('solo se prepara contenido bajo el primer viewport y se revela una vez', () => {
  const f = fixture();
  initReveal(f.win, f.doc);
  assert.equal(f.elements[0].classList.contains('pendiente'), false);
  assert.equal(f.elements[1].classList.contains('pendiente'), true);
  assert.deepEqual(f.state.observed, [f.elements[1]]);
  f.state.callback([{ isIntersecting: true, target: f.elements[1] }]);
  assert.equal(f.elements[1].classList.contains('pendiente'), false);
  assert.equal(f.state.observed.length, 0);
});

test('cambiar a movimiento reducido revela todo y desconecta el observador', () => {
  const f = fixture();
  initReveal(f.win, f.doc);
  f.change();
  assert.ok(f.elements.every((el) => !el.classList.contains('pendiente')));
  assert.equal(f.state.disconnected, true);
});
