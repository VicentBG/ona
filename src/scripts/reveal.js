// Mejora progresiva: sin JavaScript, API disponible o movimiento permitido,
// todo el contenido sigue visible. No escuchamos wheel ni bloqueamos el scroll.
export function initReveal(win = window, doc = document) {
  const elements = [...doc.querySelectorAll('[data-reveal]')];
  const preference = win.matchMedia('(prefers-reduced-motion: reduce)');
  if (preference.matches || !('IntersectionObserver' in win)) return () => {};

  let observer;
  let active = true;
  const notified = new WeakSet();
  const show = (element) => element.classList.remove('pendiente');
  const onFocus = (event) => {
    const element = event.target.closest?.('[data-reveal]');
    if (element) show(element);
  };
  const stop = () => {
    active = false;
    observer?.disconnect();
    elements.forEach((element) => element.classList.remove('pendiente'));
    preference.removeEventListener('change', onChange);
    doc.removeEventListener?.('focusin', onFocus);
    win.removeEventListener?.('resize', onResize);
  };
  const onChange = (event) => { if (event.matches) stop(); };

  const observe = () => {
    observer?.disconnect();
    observer = new win.IntersectionObserver((entries) => {
      if (!active) return;
      for (const entry of entries) {
        const seen = notified.has(entry.target);
        notified.add(entry.target);
        if (entry.isIntersecting && entry.intersectionRatio >= 0.05) {
          show(entry.target);
        } else if (seen && !entry.isIntersecting &&
          entry.boundingClientRect.top >= (entry.rootBounds?.bottom ?? win.innerHeight) &&
          !entry.target.contains(doc.activeElement)) {
          // Al subir se devuelve el bloque a su lado de entrada. Nunca se
          // oculta por salir por arriba ni mientras contiene el foco.
          entry.target.classList.add('pendiente');
        }
      }
    }, { threshold: [0, 0.05], rootMargin: `0px 0px -${Math.round(win.innerHeight * 0.4)}px 0px` });
    for (const element of elements) observer.observe(element);
  };
  const onResize = () => {
    if (!active) return;
    try { observe(); } catch { stop(); }
  };

  try {
    observe();
    for (const element of elements) {
      if (element.getBoundingClientRect().top >= win.innerHeight) {
        element.classList.add('pendiente');
      }
    }
    preference.addEventListener('change', onChange);
    doc.addEventListener?.('focusin', onFocus);
    win.addEventListener?.('resize', onResize);
  } catch {
    stop();
  }
  return stop;
}
