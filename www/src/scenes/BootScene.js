// Yükleme sahnesi. Gerçek görseller/sesler buradan yüklenecek.
// Bir anahtar gerçek dosyayla yüklenirse, textures.js aynı anahtar için taslak üretmez.

class BootScene extends Phaser.Scene {
  constructor() { super('Boot'); }

  preload() {
    // Popeye atlası: idle, walk, run, jump, punch_a, jab, cross, upper, kick1, kick2, aerial
    this.load.atlas('popeye', 'assets/popeye.png', 'assets/popeye.json');
    // Sesler gelince:
    // this.load.audio('zipla', 'assets/zipla.mp3');
  }

  create() {
    Taslak.hepsi(this);
    this.scene.start('Game', { bolum: 0 });
  }
}
