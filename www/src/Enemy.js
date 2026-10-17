// Devriye düşmanı: duvara veya uçuruma gelince döner.
// Üstüne zıplanınca anında yenilir; yumruk/tekmelerde can azalır, itilir ve sersemler.

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
    this.hp = 3;
    this.sersemBitis = 0;
  }

  guncelle() {
    if (this.olu || !this.body) return;
    const b = this.body;
    const sersem = this.scene.time.now < this.sersemBitis;
    if (sersem) return;     // itilirken devriye hızı üzerine yazılmaz

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

  // Oyuncunun yumruğu/tekmesi. yon: vuran kişinin baktığı yön (+1 sağ, -1 sol)
  vurusAl(hasar, yon, itme, havaya) {
    if (this.olu) return;
    this.hp -= hasar;
    this.sersemBitis = this.scene.time.now + 350;
    this.setTintFill(0xffffff);
    this.scene.time.delayedCall(70, () => { if (this.active) this.clearTint(); });
    this.scene.toz(this.x, this.y, 6);
    if (this.hp <= 0) { this.yenil(false); return; }
    this.body.velocity.x = yon * itme;
    if (havaya > 0) this.body.velocity.y = -havaya;
    else if (havaya < 0) this.body.velocity.y = -havaya;
    else this.body.velocity.y = -120;
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
