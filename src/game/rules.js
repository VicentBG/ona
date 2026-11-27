export function nuevaPartida() {
  return { estado: 'jugando', vidas: 3, capturas: new Set(), invulnerableHasta: -1 };
}

export function capturar(partida, id) {
  if (partida.estado !== 'jugando' || partida.capturas.has(id)) return false;
  partida.capturas.add(id);
  return true;
}

// El tiempo procede del reloj de la escena: la pausa no consume protección.
export function golpear(partida, tiempo) {
  if (partida.estado !== 'jugando' || tiempo < partida.invulnerableHasta) return false;
  partida.vidas -= 1;
  partida.invulnerableHasta = tiempo + 1200;
  if (partida.vidas === 0) partida.estado = 'fin';
  return true;
}

export function terminar(partida) {
  if (partida.estado === 'jugando') partida.estado = 'victoria';
}
