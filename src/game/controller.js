import { crearEntrada } from './input.js';
import { nuevaPartida } from './rules.js';
import { admitePantallaCompleta, alternarPantallaCompleta } from './fullscreen.js';

// Un regreso desde bfcache tampoco puede crear otro motor antes de DESTROY.
let limpiezaAnterior = Promise.resolve();

export function montarJuego(root) {
  const abort = new AbortController();
  const on = (target, event, handler) => target.addEventListener(event, handler, { signal: abort.signal });
  const entrada = crearEntrada();
  const partida = nuevaPartida();
  const campo = root.querySelector('[data-field]');
  const escenario = root.querySelector('[data-stage]');
  const pantalla = root.querySelector('[data-fullscreen]');
  const inicio = root.querySelector('[data-start]');
  const pausa = root.querySelector('[data-pause]');
  const continuar = root.querySelector('[data-resume]');
  const reinicio = root.querySelector('[data-restart]');
  const estado = root.querySelector('[data-status]');
  const controles = [...root.querySelectorAll('[data-action]')];
  const punteros = new Map();
  const timers = new Set();
  let juego;
  let arrancando;
  let fase = 'inicio';
  let interrumpido = false;
  let eliminado = false;

  function limpiar() {
    entrada.limpiar();
    for (const [id, boton] of punteros) {
      if (boton.hasPointerCapture(id)) boton.releasePointerCapture(id);
    }
    punteros.clear();
    for (const boton of controles) boton.classList.remove('held');
    for (const timer of timers) clearTimeout(timer);
    timers.clear();
  }
  function pintar(mensaje) {
    root.dataset.state = fase;
    escenario.dataset.state = fase;
    root.querySelector('[data-lives]').textContent = partida.vidas;
    root.querySelector('[data-count]').textContent = partida.capturas.size;
    inicio.hidden = Boolean(juego);
    inicio.disabled = fase === 'cargando';
    pausa.disabled = fase !== 'jugando';
    pausa.hidden = fase === 'pausa';
    continuar.hidden = fase !== 'pausa';
    reinicio.disabled = !juego || fase === 'cargando';
    for (const boton of controles) boton.disabled = fase !== 'jugando';
    estado.textContent = mensaje;
  }
  function pausar(mensaje = 'En pausa. Pulsa Continuar para volver.') {
    limpiar();
    if (fase === 'cargando') interrumpido = true;
    if (fase !== 'jugando') return;
    partida.estado = fase = 'pausa';
    juego.pausar();
    pintar(mensaje);
  }
  function informar() {
    fase = partida.estado;
    if (fase === 'victoria' || fase === 'fin') {
      limpiar(); juego?.pausar();
      pintar(fase === 'victoria' ? `¡Meta! Conejos: ${partida.capturas.size} de 3. Puedes reiniciar.` : 'Fin de partida. Sin vidas. Puedes reiniciar.');
    } else {
      pintar(`Jugando. ${partida.vidas} vidas. Conejos: ${partida.capturas.size} de 3.`);
    }
  }
  function enfocar() {
    campo.focus({ preventScroll: true });
    if (document.fullscreenElement !== escenario) escenario.scrollIntoView({ block: 'start', behavior: 'instant' });
  }
  on(inicio, 'click', async () => {
    if (fase === 'error') { window.location.reload(); return; }
    if (fase !== 'inicio') return;
    fase = 'cargando'; interrumpido = false;
    pintar('Cargando el juego…'); enfocar();
    try {
      await limpiezaAnterior;
      const { crearJuego } = await import('./phaser-game.js');
      if (eliminado) return;
      arrancando = crearJuego(campo, entrada, partida, informar);
      const motor = await arrancando;
      if (eliminado) return;
      juego = motor;
      fase = 'jugando';
      informar();
      if (interrumpido || document.hidden || !document.hasFocus()) pausar();
    } catch {
      if (eliminado) return;
      fase = 'error';
      inicio.textContent = 'Recargar juego';
      pintar('No se ha podido iniciar el juego. Comprueba la conexión y el soporte gráfico del navegador; recarga para reintentar. El resto de la web sigue disponible.');
    }
  });
  pantalla.hidden = !admitePantallaCompleta(escenario);
  on(pantalla, 'click', async () => {
    pausar('Cambio de pantalla. En pausa; pulsa Continuar.');
    pantalla.disabled = true;
    try {
      await alternarPantallaCompleta(escenario);
    } catch {
      if (!eliminado) estado.textContent = 'No se pudo cambiar a pantalla completa. Puedes seguir jugando en la página.';
    } finally {
      if (!eliminado) pantalla.disabled = false;
    }
  });
  on(document, 'fullscreenchange', () => {
    pantalla.textContent = document.fullscreenElement === escenario ? 'Salir' : 'Pantalla completa';
    pausar('Cambio de pantalla. En pausa; pulsa Continuar.');
    // No capturar Escape ni restaurar una partida al volver automáticamente.
    pantalla.focus({ preventScroll: true });
  });
  on(pausa, 'click', () => pausar());
  on(continuar, 'click', () => {
    if (fase !== 'pausa' || document.hidden) return;
    limpiar(); partida.estado = fase = 'jugando';
    enfocar(); juego.continuar(); informar();
  });
  on(reinicio, 'click', () => {
    if (!juego) return;
    limpiar(); Object.assign(partida, nuevaPartida()); fase = 'jugando';
    enfocar(); juego.reiniciar(); informar();
  });

  const teclas = { ArrowLeft: 'izquierda', KeyA: 'izquierda', ArrowRight: 'derecha', KeyD: 'derecha', Space: 'salto', ArrowUp: 'salto', KeyW: 'salto' };
  on(root, 'keydown', (event) => {
    if (event.code === 'Escape') { pausar(); return; }
    if (fase !== 'jugando' || event.altKey || event.ctrlKey || event.metaKey) return;
    const boton = event.target.closest('[data-action]');
    const accion = boton && ['Space', 'Enter'].includes(event.code) ? boton.dataset.action : teclas[event.code];
    if (!accion || (!boton && event.code === 'Space' && event.target.closest('button, a'))) return;
    event.preventDefault();
    if (!event.repeat) entrada.pulsar(`tecla-${event.code}`, accion);
  });
  on(document, 'keyup', (event) => entrada.soltar(`tecla-${event.code}`));
  on(root, 'focusout', () => queueMicrotask(() => {
    if (!eliminado && !root.contains(document.activeElement)) pausar();
  }));

  function soltar(id) {
    const boton = punteros.get(id);
    punteros.delete(id);
    entrada.soltar(`puntero-${id}`);
    if (boton) {
      if (boton.hasPointerCapture(id)) boton.releasePointerCapture(id);
      if (![...punteros.values()].includes(boton)) boton.classList.remove('held');
    }
  }
  for (const boton of controles) {
    on(boton, 'pointerdown', (event) => {
      if (fase !== 'jugando' || event.button !== 0) return;
      // Solo esta botonera es un mando continuo: no bloquear scroll/zoom del sitio.
      event.preventDefault();
      boton.setPointerCapture(event.pointerId);
      punteros.set(event.pointerId, boton);
      entrada.pulsar(`puntero-${event.pointerId}`, boton.dataset.action);
      boton.classList.add('held');
    });
    on(boton, 'pointermove', (event) => {
      const rect = boton.getBoundingClientRect();
      if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) soltar(event.pointerId);
    });
    for (const event of ['pointerup', 'pointercancel', 'lostpointercapture']) on(boton, event, (e) => soltar(e.pointerId));
    // Activación nativa por tecnología de asistencia, sin un puntero sostenido.
    on(boton, 'click', (event) => {
      if (fase !== 'jugando' || event.detail !== 0) return;
      const fuente = `activacion-${boton.dataset.action}`;
      entrada.pulsar(fuente, boton.dataset.action);
      const timer = setTimeout(() => { entrada.soltar(fuente); timers.delete(timer); }, 180);
      timers.add(timer);
    });
  }
  on(window, 'blur', () => pausar());
  on(document, 'visibilitychange', () => { if (document.hidden) pausar(); });
  const orientacion = window.matchMedia('(orientation: portrait)');
  on(orientacion, 'change', () => pausar('Cambio de orientación. En pausa; pulsa Continuar.'));
  const observador = new IntersectionObserver(([entry]) => {
    if (entry.intersectionRatio < 0.5) pausar('Área de juego fuera de vista. En pausa; pulsa Continuar.');
  }, { threshold: [0, 0.5] });
  observador.observe(campo);
  pintar('Pulsa Jugar para empezar el paseo.');
  return () => {
    eliminado = true;
    limpiar(); observador.disconnect(); abort.abort();
    if (juego) limpiezaAnterior = juego.destruir();
    else if (arrancando) limpiezaAnterior = arrancando.then((motor) => motor.destruir(), () => {});
  };
}
