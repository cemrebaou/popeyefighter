// Yükleme sahnesi. Gerçek görseller/sesler buradan yüklenecek.
// Bir anahtar gerçek dosyayla yüklenirse, textures.js aynı anahtar için taslak üretmez.

class BootScene extends Phaser.Scene {
  constructor() { super('Boot'); }

  preload() {
    // Popeye atlası: idle, walk, jump, pa, p, k, m, ja, spin (tools/bake.py ile üretilir)
    this.load.atlas('popeye', 'assets/popeye.png', 'assets/popeye.json');
    // Sesler gelince:
    // this.load.audio('zipla', 'assets/zipla.mp3');
  }

  create() {
    Taslak.hepsi(this);
    this.scene.start('Game', { bolum: 0 });
  }
}
