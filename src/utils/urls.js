// Solo URLs internas del sitio. Astro puede entregar las de Markdown ya prefijadas.
const prefijo = (base) => base.replace(/\/+$/, '');

export function conBase(ruta, base = import.meta.env?.BASE_URL ?? '/') {
  const inicio = prefijo(base);
  if (!inicio || ruta === inicio || ruta.startsWith(`${inicio}/`) || ruta.startsWith(`${inicio}#`)) return ruta;
  return `${inicio}${ruta}`;
}

export function sinBase(ruta, base = import.meta.env?.BASE_URL ?? '/') {
  const inicio = prefijo(base);
  const local = inicio && (ruta === inicio || ruta.startsWith(`${inicio}/`)) ? ruta.slice(inicio.length) : ruta;
  return local.replace(/\/$/, '') || '/';
}
