// Caricaturas originales dibujadas con primitivas. Sin fotos, fuentes externas
// ni sprites de terceros. Las texturas pertenecen a la instancia de Phaser.
const C = { tinta: 0x123a43, blanco: 0xfffdf8, negro: 0x172a30, rosa: 0xf4adad, crema: 0xfff4dc, marron: 0x87503c };

function elipse(g, x, y, w, h, color) {
  g.fillStyle(color).fillEllipse(x, y, w, h);
  g.lineStyle(2, C.tinta).strokeEllipse(x, y, w, h);
}
function linea(g, x, y, x2, y2, grosor, color = C.tinta) {
  g.lineStyle(grosor, color).lineBetween(x, y, x2, y2);
}

export function crearPersonajes(scene) {
  if (scene.textures.exists('ona-quieta')) return;
  function textura(nombre, ancho, alto, dibujar) {
    const g = scene.make.graphics({ add: false });
    dibujar(g);
    g.generateTexture(nombre, ancho, alto);
    g.destroy();
  }
  for (const [nombre, paso] of [['quieta', 0], ['paso-0', -5], ['paso-1', 5], ['aire', 8]]) {
    textura(`ona-${nombre}`, 96, 80, g => {
      // Cola, patas largas, cuerpo claro con mancha negra y orejas caídas.
      linea(g, 20, 42, 8, 25 + paso / 2, 6, C.blanco);
      linea(g, 28, 49, 26 + paso, 76, 7, C.blanco);
      linea(g, 58, 48, 63 - paso, 76, 7, C.blanco);
      elipse(g, 26 + paso, 76, 15, 6, C.negro);
      elipse(g, 63 - paso, 76, 15, 6, C.negro);
      elipse(g, 43, 42, 58, 34, C.blanco);
      g.fillStyle(C.negro).fillEllipse(29, 40, 25, 29);
      elipse(g, 66, 31, 25, 29, C.blanco);
      elipse(g, 72, 21, 30, 30, C.negro);
      elipse(g, 81, 29, 25, 15, C.blanco);
      elipse(g, 61, 28, 14, 29, C.negro);
      g.fillStyle(C.blanco).fillEllipse(76, 18, 6, 22);
      g.fillStyle(C.tinta).fillCircle(79, 18, 2.4).fillEllipse(91, 28, 7, 6);
      g.fillStyle(C.blanco).fillCircle(79.8, 17.2, 0.8);
      g.fillStyle(C.rosa).fillRoundedRect(83, 34, 6, 7, 3);
      linea(g, 62, 39, 73, 41, 4, 0xe09a44);
    });
  }
  for (let frame = 0; frame < 2; frame++) {
    textura(`conejo-${frame}`, 32, 40, g => {
      elipse(g, 11, 11 - frame, 8, 21, C.crema);
      elipse(g, 21, 11 + frame, 8, 21, C.crema);
      g.fillStyle(C.rosa).fillEllipse(11, 10 - frame, 3, 13).fillEllipse(21, 10 + frame, 3, 13);
      elipse(g, 16, 28, 25, 22, C.crema);
      g.fillStyle(C.tinta).fillCircle(11, 25, 1.5).fillCircle(21, 25, 1.5);
      g.fillStyle(C.rosa).fillTriangle(14, 29, 18, 29, 16, 32);
      linea(g, 6, 34, 1, 33, 1); linea(g, 26, 34, 31, 33, 1);
    });
    textura(`jabali-${frame}`, 80, 56, g => {
      const paso = frame ? 3 : -3;
      linea(g, 18, 38, 17 + paso, 52, 7); linea(g, 53, 38, 54 - paso, 52, 7);
      elipse(g, 33, 28, 54, 35, C.marron);
      g.fillStyle(C.tinta).fillTriangle(15, 14, 22, 5, 25, 15).fillTriangle(29, 12, 35, 4, 39, 13);
      elipse(g, 58, 30, 28, 29, C.marron);
      elipse(g, 70, 36, 16, 13, 0xca9980);
      g.fillStyle(C.tinta).fillCircle(70, 35, 1.3).fillCircle(75, 35, 1.3).fillCircle(61, 24, 2);
      g.fillStyle(C.crema).fillTriangle(60, 40, 63, 46, 67, 38);
      linea(g, 8, 25, 2, 19, 3);
    });
  }
}

export function crearPaisaje(scene, nivel) {
  scene.cameras.main.setBackgroundColor('#dceff0');
  const g = scene.add.graphics();
  // Colinas estáticas; sin parallax ni animación ambiental permanente.
  g.fillStyle(0xc9e0bd).fillEllipse(270, 320, 700, 260).fillEllipse(1050, 320, 900, 310).fillEllipse(1680, 320, 620, 240);
  for (const x of [80, 700, 1450]) {
    g.fillStyle(0xd1e6df).fillEllipse(x + 30, 65, 95, 25).fillEllipse(x, 61, 65, 32);
  }
  for (const x of [430, 1110, 1570]) {
    g.fillStyle(0x947552).fillRoundedRect(x, 207, 14, 113, 4);
    g.fillStyle(0x83b28a).fillCircle(x + 8, 185, 43).fillCircle(x - 15, 205, 31).fillCircle(x + 32, 205, 30);
  }
  g.fillStyle(0xabca84).fillRect(0, nivel.suelo, nivel.ancho, 40);
  g.fillStyle(0xffedce).fillRect(0, nivel.suelo + 10, nivel.ancho, 15);
  for (let x = 20; x < nivel.ancho; x += 85) {
    g.fillStyle(0x246451).fillTriangle(x, 320, x + 3, 310, x + 7, 320);
    g.fillStyle(0xffda32).fillCircle(x + 20, 317, 3);
  }
  // La casita y el banderín indican una meta, no material de otro juego.
  g.fillStyle(0xffe1cc).fillRoundedRect(nivel.meta - 34, 248, 64, 72, 4);
  g.fillStyle(0x87503c).fillTriangle(nivel.meta - 45, 250, nivel.meta - 2, 215, nivel.meta + 42, 250);
  g.fillStyle(0x123a43).fillRoundedRect(nivel.meta - 14, 276, 24, 44, 10);
  linea(g, nivel.meta - 65, 222, nivel.meta - 65, 320, 4);
  g.fillStyle(0xffda32).fillTriangle(nivel.meta - 63, 222, nivel.meta - 29, 231, nivel.meta - 63, 244);
}
