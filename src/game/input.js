// Cada tecla/dedo es una fuente independiente; soltar uno no libera los demás.
export function crearEntrada() {
  const fuentes = new Map();
  let saltoPendiente = false;
  return {
    pulsar(fuente, accion) {
      if (fuentes.has(fuente)) return;
      if (accion === 'salto' && ![...fuentes.values()].includes('salto')) saltoPendiente = true;
      fuentes.set(fuente, accion);
    },
    soltar(fuente) { fuentes.delete(fuente); },
    eje() {
      const acciones = [...fuentes.values()];
      return Number(acciones.includes('derecha')) - Number(acciones.includes('izquierda'));
    },
    saltar() { const pendiente = saltoPendiente; saltoPendiente = false; return pendiente; },
    limpiar() { fuentes.clear(); saltoPendiente = false; },
  };
}
