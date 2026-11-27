export function admitePantallaCompleta(stage, doc = document) {
  return Boolean(doc.fullscreenEnabled && stage.requestFullscreen && doc.exitFullscreen);
}

// Invocar directamente desde el click: la API necesita activación transitoria.
// No pedir keyboardLock ni screen.orientation.lock; Escape/gestos siguen nativos.
export async function alternarPantallaCompleta(stage, doc = document) {
  if (doc.fullscreenElement === stage) {
    await doc.exitFullscreen();
  } else {
    if (!admitePantallaCompleta(stage, doc)) throw new Error('Pantalla completa no disponible');
    await stage.requestFullscreen({ navigationUI: 'hide' });
  }
}
