import Phaser from 'phaser';
import { capturar, golpear, terminar } from './rules.js';

// Este módulo se descarga exclusivamente tras Jugar. Ni Astro SSR ni las demás
// páginas importan Phaser. J1 usa formas geométricas propias, no sprites finales.
export function crearJuego(parent, entrada, partida, informar) {
  return new Promise((resolve, reject) => {
    let game;
    let observador;
    const fallo = (error) => {
      clearTimeout(limite);
      observador?.disconnect();
      if (game) {
        game.destroy(true);
        game.canvas?.remove();
        if (game.isRunning) game.loop.wake();
      }
      reject(error);
    };
    const limite = setTimeout(() => fallo(new Error('El motor no pudo iniciar en 10 segundos')), 10_000);
    class Nivel extends Phaser.Scene {
      create() {
        try {
          this.cameras.main.setBackgroundColor('#e9f4f5');
          this.physics.world.setBounds(0, 0, 1800, 360);
          this.cameras.main.setBounds(0, 0, 1800, 360);
          const suelo = this.physics.add.staticGroup();
          for (const [x, y, w, h] of [[900, 340, 1800, 40], [310, 250, 140, 20], [560, 180, 140, 20]]) {
            const bloque = this.add.rectangle(x, y, w, h, 0x246451);
            suelo.add(bloque);
          }
          this.ona = this.add.rectangle(70, 280, 48, 56, 0x123a43).setStrokeStyle(5, 0xffffff);
          this.physics.add.existing(this.ona);
          this.ona.body.setCollideWorldBounds(true);
          this.physics.add.collider(this.ona, suelo);
          this.cameras.main.startFollow(this.ona, true);
          const conejos = this.physics.add.staticGroup();
          for (const [id, x, y] of [['uno', 150, 210], ['dos', 310, 195], ['tres', 560, 125]]) {
            const conejo = this.add.circle(x, y, 12, 0xffda32).setStrokeStyle(2, 0x123a43);
            conejo.setData('id', id);
            conejos.add(conejo);
          }
          this.physics.add.overlap(this.ona, conejos, (_, conejo) => {
            if (capturar(partida, conejo.getData('id'))) {
              conejos.remove(conejo, true, true);
              informar();
            }
          });
          this.jabali = this.add.rectangle(940, 299, 52, 42, 0x87503c);
          this.physics.add.existing(this.jabali);
          this.jabali.body.setAllowGravity(false).setVelocityX(65);
          this.physics.add.overlap(this.ona, this.jabali, () => {
            if (golpear(partida, this.time.now)) informar();
          });
          const meta = this.add.rectangle(1690, 260, 24, 120, 0x246451);
          this.physics.add.existing(meta, true);
          this.physics.add.overlap(this.ona, meta, () => { terminar(partida); informar(); });
          this.add.text(35, 25, 'ONA · PROTOTIPO', { fontFamily: 'sans-serif', fontSize: '18px', color: '#123a43' });
          this.add.text(1635, 175, 'META', { fontFamily: 'sans-serif', fontSize: '18px', color: '#123a43' });
          game.canvas.setAttribute('role', 'img');
          game.canvas.setAttribute('aria-label', 'Escenario visual de plataformas de Ona. Controles e instrucciones fuera del canvas.');
          const nivel = this;
          if (!observador) {
            // La escala debe actualizarse también con el bucle dormido: rotar
            // no puede recortar el canvas ni despertar la simulación pausada.
            observador = new ResizeObserver(() => {
              game.scale.getParentBounds();
              game.scale.refresh();
            });
            observador.observe(parent);
          }
          clearTimeout(limite);
          resolve({
            pausar() { entrada.limpiar(); game.pause(); game.loop.sleep(); },
            continuar() { game.resume(); game.loop.wake(); },
            reiniciar() { entrada.limpiar(); nivel.scene.restart(); this.continuar(); },
            destruir() {
              entrada.limpiar();
              observador.disconnect();
              // destroy es asíncrono: despertar permite que ocurra el frame de
              // destrucción incluso si el juego estaba dormido. Esperar DESTROY
              // antes de crear otra instancia, también tras volver de bfcache.
              const destruido = new Promise((done) => game.events.once(Phaser.Core.Events.DESTROY, done));
              game.destroy(true);
              game.canvas.remove();
              game.loop.wake();
              return destruido;
            },
          });
        } catch (error) {
          fallo(error);
        }
      }
      update() {
        if (partida.estado !== 'jugando') return;
        this.ona.body.setVelocityX(entrada.eje() * 220);
        if (entrada.saltar() && this.ona.body.blocked.down) this.ona.body.setVelocityY(-470);
        if (this.jabali.x < 850) this.jabali.body.setVelocityX(65);
        if (this.jabali.x > 1030) this.jabali.body.setVelocityX(-65);
        this.ona.setAlpha(this.time.now < partida.invulnerableHasta ? 0.45 : 1);
      }
    }
    try {
      game = new Phaser.Game({
        type: Phaser.AUTO, parent, width: 640, height: 360,
        backgroundColor: '#e9f4f5',
        scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
        physics: { default: 'arcade', arcade: { gravity: { y: 1000 }, debug: false } },
        input: { keyboard: false, mouse: false, touch: false, gamepad: false },
        audio: { noAudio: true }, banner: false, scene: Nivel,
      });
    } catch (error) { fallo(error); }
  });
}
