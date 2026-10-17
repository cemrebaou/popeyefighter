// Yükleme sahnesi. Gerçek görseller/sesler buradan yüklenecek.
// Bir anahtar gerçek dosyayla yüklenirse, textures.js aynı anahtar için taslak üretmez.

class BootScene extends Phaser.Scene {
  constructor() { super('Boot'); }

  preload() {
    // Örnek (görseller gelince):
    // this.load.image('oyuncu', 'assets/oyuncu.png');
    // this.load.spritesheet('oyuncu_kos', 'assets/oyuncu_kos.png', { frameWidth: 64, frameHeight: 64 });
    // this.load.audio('zipla', 'assets/zipla.mp3');
  }

  create() {
    Taslak.hepsi(this);
    this.scene.start('Game', { bolum: 0 });
  }
}
