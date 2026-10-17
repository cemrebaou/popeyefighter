// Oyuncu: koşma (ivmeli), çift zıplama, coyote time, zıplama tamponu,
// değişken zıplama yüksekliği, yumruk, hasar/geri tepme.

class Oyuncu extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, 'oyuncu');
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.body.setSize(28, 58).setOffset(6, 6);
    this.body.setMaxVelocity(AYAR.KOSU_HIZI * 1.6, AYAR.MAKS_DUSME);
    this.setDepth(10);

    this.yon = 1;
    this.can = AYAR.CAN;
    this.ekstraZiplama = AYAR.EKSTRA_ZIPLAMA;
    this.sonYerZamani = 0;
    this.tamponBitis = 0;
    this.kesmeYapildi = true;
    this.yerdeydi = false;
    this.korumaBitis = 0;
    this.sersemBitis = 0;
    this.yumrukBitis = 0;
    this.yumrukHazir = 0;
    this.olu = false;

    // Yumruk vuruş alanı
    this.vurus = scene.add.zone(x, y, AYAR.YUMRUK_MENZIL, 34);
    scene.physics.add.existing(this.vurus);
    this.vurus.body.setAllowGravity(false);
    this.vurus.body.enable = false;
  }

  get yerde() {
    return this.body.blocked.down || this.body.touching.down;
  }

  get yumrukta() {
    return this.scene.time.now < this.yumrukBitis;
  }

  guncelle(zaman, delta) {
    if (this.olu) return;
    const dt = delta / 1000;
    const b = this.body;
    const yerde = this.yerde;

    // --- Yer durumu
    if (yerde) {
      this.sonYerZamani = zaman;
      this.ekstraZiplama = AYAR.EKSTRA_ZIPLAMA;
      if (!this.yerdeydi) this.yereIndi();
    }
    this.yerdeydi = yerde;

    // --- Yatay hareket
    const sersem = zaman < this.sersemBitis;
    const girdi = sersem ? 0 : (Kontrol.sag ? 1 : 0) - (Kontrol.sol ? 1 : 0);
    if (girdi !== 0) {
      this.yon = girdi;
      const ivme = yerde ? AYAR.YER_IVME : AYAR.HAVA_IVME;
      // yön değiştirirken daha hızlı dön
      const donus = Math.sign(b.velocity.x) !== girdi && b.velocity.x !== 0 ? 1.8 : 1;
      b.velocity.x += girdi * ivme * donus * dt;
      b.velocity.x = Phaser.Math.Clamp(b.velocity.x, -AYAR.KOSU_HIZI, AYAR.KOSU_HIZI);
    } else if (!sersem) {
      const surt = (yerde ? AYAR.YER_SURTUNME : AYAR.HAVA_SURTUNME) * dt;
      if (Math.abs(b.velocity.x) <= surt) b.velocity.x = 0;
      else b.velocity.x -= Math.sign(b.velocity.x) * surt;
    }

    // --- Zıplama
    if (Kontrol.zipla) this.tamponBitis = zaman + AYAR.ZIPLAMA_TAMPON;
    const tamponVar = zaman < this.tamponBitis;
    const coyote = zaman - this.sonYerZamani < AYAR.COYOTE_SURE;

    if (!sersem && tamponVar && (yerde || coyote)) {
      this.ziplat(AYAR.ZIPLAMA_HIZI, false);
    } else if (!sersem && Kontrol.zipla && !yerde && !coyote && this.ekstraZiplama > 0) {
      this.ekstraZiplama--;
      this.ziplat(AYAR.IKINCI_ZIPLAMA_HIZI, true);
    }

    // Tuş erken bırakılırsa kısa zıplama
    if (!this.kesmeYapildi && !Kontrol.ziplaTut && b.velocity.y < 0) {
      b.velocity.y *= AYAR.ZIPLAMA_KESME;
      this.kesmeYapildi = true;
    }
    if (b.velocity.y >= 0) this.kesmeYapildi = true;

    // --- Yumruk
    if (Kontrol.yumruk && zaman >= this.yumrukHazir && !sersem) {
      this.yumrukBitis = zaman + AYAR.YUMRUK_SURE;
      this.yumrukHazir = zaman + AYAR.YUMRUK_BEKLEME;
      this.scene.tweens.add({ targets: this, scaleX: 1.15, duration: 60, yoyo: true });
    }
    this.vurus.body.enable = this.yumrukta;
    this.vurus.setPosition(this.x + this.yon * (14 + AYAR.YUMRUK_MENZIL / 2), this.y - 6);

    // --- Görünüm
    this.setFlipX(this.yon < 0);
    if (!this.donuyor) {
      const egim = Phaser.Math.Clamp(b.velocity.x / AYAR.KOSU_HIZI, -1, 1) * (yerde ? 0.06 : 0.12);
      this.rotation = Phaser.Math.Linear(this.rotation, egim, 0.3);
    }
    if (zaman < this.korumaBitis) this.setAlpha(Math.floor(zaman / 80) % 2 ? 0.35 : 1);
    else this.setAlpha(1);
  }

  ziplat(hiz, ikinci) {
    this.body.velocity.y = -hiz;
    this.tamponBitis = 0;
    this.sonYerZamani = -9999;
    this.kesmeYapildi = false;
    this.setScale(0.85, 1.15);
    this.scene.tweens.add({ targets: this, scaleX: 1, scaleY: 1, duration: 160 });
    this.scene.toz(this.x, this.body.bottom, ikinci ? 8 : 5);
    if (ikinci) {
      this.donuyor = true;
      this.scene.tweens.add({
        targets: this, rotation: this.yon * Math.PI * 2, duration: 320,
        onComplete: () => { this.rotation = 0; this.donuyor = false; }
      });
    }
  }

  yereIndi() {
    this.setScale(1.18, 0.84);
    this.scene.tweens.add({ targets: this, scaleX: 1, scaleY: 1, duration: 140 });
    this.scene.toz(this.x, this.body.bottom, 4);
  }

  ezmeZiplamasi() {
    this.body.velocity.y = -AYAR.ZIPLAMA_HIZI * (Kontrol.ziplaTut ? 0.95 : 0.65);
    this.kesmeYapildi = true;
    this.ekstraZiplama = AYAR.EKSTRA_ZIPLAMA;
  }

  // kaynakX: hasarın geldiği yönü belirler. true döner = hasar alındı
  hasarAl(kaynakX) {
    const z = this.scene.time.now;
    if (this.olu || z < this.korumaBitis) return false;
    this.can--;
    this.korumaBitis = z + AYAR.HASAR_KORUMA;
    this.sersemBitis = z + 260;
    const yon = this.x < kaynakX ? -1 : 1;
    this.body.velocity.x = yon * AYAR.GERI_TEPME_X;
    this.body.velocity.y = -AYAR.GERI_TEPME_Y;
    this.kesmeYapildi = true;
    this.setTint(0xff6666);
    this.scene.time.delayedCall(200, () => this.clearTint());
    this.scene.cameras.main.shake(140, 0.006);
    this.scene.events.emit('can', this.can);
    return true;
  }

  dogur(x, y) {
    this.setPosition(x, y);
    this.body.reset(x, y);
    this.rotation = 0;
    this.setScale(1);
    this.olu = false;
    this.korumaBitis = this.scene.time.now + AYAR.HASAR_KORUMA;
  }
}
