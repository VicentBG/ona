import assert from 'node:assert/strict';
import test from 'node:test';
import { initReveal } from '../src/scripts/reveal.js';

function fixture({ reduced = false, observer = true, height = 800 } = {}) {
  const elements = [20, 1200].map((top) => {
    const classes = new Set();
    const element = {
      classList: { add: (v) => classes.add(v), remove: (v) => classes.delete(v), contains: (v) => classes.has(v) },
      getBoundingClientRect: () => ({ top }),
    };
    element.contains = (target) => target === element;
    return element;
  });
  let onChange;
  const media = { matches: reduced, addEventListener: (_, fn) => { onChange = fn; }, removeEventListener: () => {} };
  const state = { observed: [], disconnected: false };
  class Observer {
    constructor(callback, options) { state.callback = callback; state.options = options; }
    observe(el) { state.observed.push(el); }
    unobserve(el) { state.observed = state.observed.filter((item) => item !== el); }
    disconnect() { state.disconnected = true; }
  }
  const windowListeners = {};
  const win = {
    innerHeight: height, matchMedia: () => media,
    addEventListener: (type, fn) => { windowListeners[type] = fn; },
    removeEventListener: (type) => { delete windowListeners[type]; },
    ...(observer ? { IntersectionObserver: Observer } : {}),
  };
  const listeners = {};
  const doc = {
    activeElement: null,
    querySelectorAll: () => elements,
    addEventListener: (type, fn) => { listeners[type] = fn; },
    removeEventListener: (type) => { delete listeners[type]; },
  };
  return {
    win, doc, elements, state,
    change: () => onChange?.({ matches: true }),
    resize: (height) => { win.innerHeight = height; windowListeners.resize?.(); },
    entry: (index, visible, top = visible ? 300 : 1200, ratio = visible ? 1 : 0) => state.callback([{
      target: elements[index], isIntersecting: visible, intersectionRatio: ratio,
      boundingClientRect: { top }, rootBounds: { bottom: win.innerHeight * 0.6 },
    }]),
    focus: (element) => {
      doc.activeElement = element;
      listeners.focusin?.({ target: { closest: () => element } });
    },
  };
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

test('revela al bajar, revierte al salir por abajo y permite repetir la entrada', () => {
  const f = fixture();
  initReveal(f.win, f.doc);
  assert.equal(f.elements[0].classList.contains('pendiente'), false);
  assert.equal(f.elements[1].classList.contains('pendiente'), true);
  assert.deepEqual(f.state.observed, f.elements);
  f.entry(1, true);
  assert.equal(f.elements[1].classList.contains('pendiente'), false);
  f.entry(1, false, 750);
  assert.equal(f.elements[1].classList.contains('pendiente'), true);
  f.entry(1, true);
  assert.equal(f.elements[1].classList.contains('pendiente'), false);
  assert.equal(f.state.observed.length, 2, 'Se mantienen observados para invertir');
});

test('no oculta bloques que salen por arriba y también revierte los visibles al cargar', () => {
  const f = fixture();
  initReveal(f.win, f.doc);
  f.entry(0, false, -200);
  assert.equal(f.elements[0].classList.contains('pendiente'), false);
  f.entry(0, false, 750);
  assert.equal(f.elements[0].classList.contains('pendiente'), true);
});

test('la primera notificación no oculta contenido ya visible en el margen inferior', () => {
  const f = fixture();
  initReveal(f.win, f.doc);
  f.entry(0, false, 700);
  assert.equal(f.elements[0].classList.contains('pendiente'), false);
});

test('el umbral de entrada evita alternar estados en el borde', () => {
  const f = fixture();
  initReveal(f.win, f.doc);
  f.entry(1, true, 600, 0.01);
  assert.equal(f.elements[1].classList.contains('pendiente'), true);
  f.entry(1, true, 600, 0.05);
  assert.equal(f.elements[1].classList.contains('pendiente'), false);
});

test('la reversión empieza con un 40% del viewport disponible y se adapta al resize', () => {
  const f = fixture({ height: 900 });
  initReveal(f.win, f.doc);
  assert.equal(f.state.options.rootMargin, '0px 0px -360px 0px');
  f.entry(1, true);
  f.entry(1, false, 550);
  assert.equal(f.elements[1].classList.contains('pendiente'), true);
  f.resize(700);
  assert.equal(f.state.options.rootMargin, '0px 0px -280px 0px');
  f.change();
  f.resize(1200);
  assert.equal(f.state.options.rootMargin, '0px 0px -280px 0px', 'Resize desconectado con movimiento reducido');
});

test('el foco revela un bloque y evita que se oculte mientras contiene el foco', () => {
  const f = fixture();
  initReveal(f.win, f.doc);
  f.entry(1, false);
  f.focus(f.elements[1]);
  assert.equal(f.elements[1].classList.contains('pendiente'), false);
  f.entry(1, false, 750);
  assert.equal(f.elements[1].classList.contains('pendiente'), false);
});

test('cambiar a movimiento reducido revela todo y desconecta el observador', () => {
  const f = fixture();
  initReveal(f.win, f.doc);
  f.change();
  assert.ok(f.elements.every((el) => !el.classList.contains('pendiente')));
  assert.equal(f.state.disconnected, true);
  f.entry(1, false, 750); // Una notificación ya encolada no debe reocultar contenido.
  assert.ok(f.elements.every((el) => !el.classList.contains('pendiente')));
});
