// Un único paseo corto. Coordenadas lógicas, nunca píxeles del dispositivo.
export const NIVEL = {
  ancho: 1800,
  alto: 360,
  suelo: 320,
  plataformas: [
    { x: 310, y: 250, ancho: 140 },
    { x: 560, y: 180, ancho: 140 },
    { x: 1250, y: 250, ancho: 140 },
  ],
  conejos: [
    { id: 'prado', x: 150, y: 210 },
    { id: 'mirador', x: 560, y: 125 },
    { id: 'regreso', x: 1250, y: 195 },
  ],
  jabali: { desde: 850, hasta: 1030, velocidad: 65 },
  meta: 1690,
};
