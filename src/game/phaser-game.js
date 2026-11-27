import Phaser from 'phaser';
import { capturar, golpear, terminar } from './rules.js';
import { NIVEL } from './level.js';
import { crearPersonajes, crearPaisaje } from './art.js';

// Este módulo y sus dibujos originales solo se descargan tras Jugar.
// Ni Astro SSR ni las demás páginas importan el motor.
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
          crearPersonajes(this);
          crearPaisaje(this, NIVEL);
          this.reducirMovimiento = window.matchMedia('(prefers-reduced-motion: reduce)');
          if (!this.anims.exists('ona-camina')) {
            for (const [key, frames, frameRate] of [
              ['ona-camina', ['ona-paso-0', 'ona-paso-1'], 8],
              ['conejo-respira', ['conejo-0', 'conejo-1'], 2],
              ['jabali-camina', ['jabali-0', 'jabali-1'], 6],
            ]) this.anims.create({ key, frames: frames.map(key => ({ key })), frameRate, repeat: -1 });
          }
          this.physics.world.setBounds(0, 0, NIVEL.ancho, NIVEL.alto);
          this.cameras.main.setBounds(0, 0, NIVEL.ancho, NIVEL.alto);
          const suelo = this.physics.add.staticGroup();
          const terreno = this.add.rectangle(NIVEL.ancho / 2, 340, NIVEL.ancho, 40, 0, 0);
          suelo.add(terreno);
          for (const { x, y, ancho } of NIVEL.plataformas) {
            const bloque = this.add.rectangle(x, y, ancho, 20, 0x87503c).setStrokeStyle(2, 0x123a43);
            suelo.add(bloque);
            this.add.rectangle(x, y - 9, ancho, 6, 0x83b28a);
          }
          this.ona = this.add.sprite(70, 280, 'ona-quieta');
          this.physics.add.existing(this.ona);
          this.ona.body.setSize(64, 56).setOffset(16, 24).setCollideWorldBounds(true);
          this.physics.add.collider(this.ona, suelo);
          this.cameras.main.startFollow(this.ona, true);
          const conejos = this.physics.add.staticGroup();
          for (const { id, x, y } of NIVEL.conejos) {
            const conejo = this.add.sprite(x, y, 'conejo-0');
            if (!this.reducirMovimiento.matches) conejo.play('conejo-respira');
            conejo.setData('id', id);
            conejos.add(conejo);
            conejo.body.setCircle(12, 4, 14);
          }
          this.physics.add.overlap(this.ona, conejos, (_, conejo) => {
            if (capturar(partida, conejo.getData('id'))) {
              conejos.remove(conejo, true, true);
              informar();
            }
          });
          this.jabali = this.add.sprite(940, 292, 'jabali-0');
          this.physics.add.existing(this.jabali);
          this.jabali.body.setSize(64, 42).setOffset(8, 14).setAllowGravity(false).setVelocityX(NIVEL.jabali.velocidad);
          if (!this.reducirMovimiento.matches) this.jabali.play('jabali-camina');
          this.physics.add.overlap(this.ona, this.jabali, () => {
            if (golpear(partida, this.time.now)) informar();
          });
          const meta = this.add.rectangle(NIVEL.meta, 260, 24, 120, 0, 0);
          this.physics.add.existing(meta, true);
          this.physics.add.overlap(this.ona, meta, () => { terminar(partida); informar(); });
          this.add.text(28, 24, 'Un paseo con Ona', { fontFamily: 'sans-serif', fontSize: '18px', color: '#123a43' });
          this.add.text(1610, 182, '¡A casa!', { fontFamily: 'sans-serif', fontSize: '18px', color: '#123a43' });
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
        const direccion = entrada.eje();
        this.ona.body.setVelocityX(direccion * 220);
        if (direccion) this.ona.setFlipX(direccion < 0);
        if (entrada.saltar() && this.ona.body.blocked.down) this.ona.body.setVelocityY(-470);
        if (!this.ona.body.blocked.down || !direccion || this.reducirMovimiento.matches) {
          this.ona.anims.stop();
          this.ona.setTexture(this.ona.body.blocked.down ? 'ona-quieta' : 'ona-aire');
        } else this.ona.play('ona-camina', true);
        if (this.jabali.x < NIVEL.jabali.desde) this.jabali.body.setVelocityX(NIVEL.jabali.velocidad);
        if (this.jabali.x > NIVEL.jabali.hasta) this.jabali.body.setVelocityX(-NIVEL.jabali.velocidad);
        this.jabali.setFlipX(this.jabali.body.velocity.x < 0);
        // Protección visible y constante: sin parpadeos ni sacudidas de cámara.
        this.ona.setAlpha(this.time.now < partida.invulnerableHasta ? 0.65 : 1);
        if (this.reducirMovimiento.matches) {
          this.jabali.anims.stop();
          for (const conejo of this.children.list) if (conejo.getData('id')) conejo.anims.stop();
        }
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
