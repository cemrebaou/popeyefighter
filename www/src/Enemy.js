// Devriye düşmanı: duvara veya uçuruma gelince döner.
// Üstüne zıplanınca ya da yumruklanınca yenilir.

class Dusman extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, 'dusman');
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.body.setSize(38, 34).setOffset(3, 6);
    this.setDepth(8);
    this.hiz = 70;
    this.yon = -1;
    this.olu = false;
  }

  guncelle() {
    if (this.olu || !this.body) return;
    const b = this.body;
    if (b.blocked.left || b.touching.left) this.yon = 1;
    else if (b.blocked.right || b.touching.right) this.yon = -1;

    // Uçurum kontrolü: önündeki karenin altı boşsa dön
    if (b.blocked.down || b.touching.down) {
      const onX = this.yon > 0 ? b.right + 2 : b.left - 2;
      if (!this.scene.katiMi(onX, b.bottom + 4)) this.yon *= -1;
    }
    b.velocity.x = this.hiz * this.yon;
    this.setFlipX(this.yon > 0);
  }

  yenil(yukaridan) {
    if (this.olu) return;
    this.olu = true;
    this.body.enable = false;
    this.scene.toz(this.x, this.y, 10);
    if (yukaridan) {
      this.setScale(1.3, 0.35);
      this.scene.tweens.add({ targets: this, alpha: 0, duration: 300, delay: 150, onComplete: () => this.destroy() });
    } else {
      this.setFlipY(true);
      this.scene.tweens.add({
        targets: this, y: this.y - 60, x: this.x + this.scene.oyuncu.yon * 80, angle: 180, duration: 260,
        yoyo: false, onComplete: () => {
          this.scene.tweens.add({ targets: this, y: this.y + 600, alpha: 0, duration: 700, onComplete: () => this.destroy() });
        }
      });
    }
  }
}
