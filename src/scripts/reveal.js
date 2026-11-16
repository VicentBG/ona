// Mejora progresiva: sin JavaScript, API disponible o movimiento permitido,
// todo el contenido sigue visible. No escuchamos wheel ni bloqueamos el scroll.
export function initReveal(win = window, doc = document) {
  const elements = [...doc.querySelectorAll('[data-reveal]')];
  const preference = win.matchMedia('(prefers-reduced-motion: reduce)');
  if (preference.matches || !('IntersectionObserver' in win)) return () => {};

  let observer;
  const show = (element) => {
    element.classList.remove('pendiente');
    observer?.unobserve(element);
  };
  const onFocus = (event) => {
    const element = event.target.closest?.('[data-reveal]');
    if (element) show(element);
  };
  const stop = () => {
    observer?.disconnect();
    elements.forEach((element) => element.classList.remove('pendiente'));
    preference.removeEventListener('change', onChange);
    doc.removeEventListener?.('focusin', onFocus);
  };
  const onChange = (event) => { if (event.matches) stop(); };

  try {
    observer = new win.IntersectionObserver((entries) => {
      for (const entry of entries) if (entry.isIntersecting) show(entry.target);
    }, { threshold: 0.05 });
    for (const element of elements) {
      if (element.getBoundingClientRect().top >= win.innerHeight) {
        observer.observe(element);
        element.classList.add('pendiente');
      }
    }
    preference.addEventListener('change', onChange);
    doc.addEventListener?.('focusin', onFocus);
  } catch {
    stop();
  }
  return stop;
}
