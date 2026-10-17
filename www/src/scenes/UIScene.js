// Arayüz sahnesi: can, para, bölüm adı, mesajlar, duraklatma, dokunmatik butonlar.
// Oyun sahnesinin üstünde ayrı çalışır; kamera hareketinden etkilenmez.

class UIScene extends Phaser.Scene {
  constructor() { super('UI'); }

  create() {
    // Canvas RES kat büyük çizildiği için tüm arayüz, RES ölçekli bir kapta durur; yerleşim oyun birimiyle yapılır.
    this.kok = this.add.container(0, 0).setScale(AYAR.RES);
    this.kalpler = [];
    for (let i = 0; i < AYAR.CAN; i++) {
      this.kalpler.push(this.add.image(24 + i * 34, 26, 'kalp').setOrigin(0, 0.5));
    }
    this.paraIkon = this.add.image(0, 26, 'para');
    this.paraYazi = this.add.text(0, 26, '0', this.stil(24)).setOrigin(0, 0.5);
    this.bolumYazi = this.add.text(0, 0, '', this.stil(18)).setOrigin(0.5, 0);
    this.surumYazi = this.add.text(0, 0, AYAR.SURUM, this.stil(12)).setOrigin(1, 1).setAlpha(0.6);
    this.mesaj = this.add.text(0, 0, '', this.stil(52)).setOrigin(0.5).setAlpha(0);
    this.duraklatYazi = this.add.text(0, 0, 'PAUSED', this.stil(48)).setOrigin(0.5).setVisible(false);
    this.komboYazi = this.add.text(0, 0, '', this.stil(40)).setOrigin(1, 0.5).setAlpha(0);
    this.hareketYazi = this.add.text(0, 0, '', this.stil(16)).setOrigin(0.5, 1).setAlpha(0);
    this.ipucu = this.add.text(0, 0, '← →  Move     ↑  Jump (x2)     J  Punch', this.stil(14)).setOrigin(0, 1);
    if (Kontrol.dokunmatikAcik(this)) this.ipucu.setVisible(false);
    else this.time.delayedCall(9000, () => this.tweens.add({ targets: this.ipucu, alpha: 0, duration: 800 }));

    // Duraklat butonu (dokunmatik + fare)
    this.duraklatBtn = this.add.text(0, 26, '❚❚', this.stil(26)).setOrigin(1, 0.5).setInteractive({ useHandCursor: true });
    this.duraklatBtn.on('pointerdown', () => this.duraklatDegistir());
    this.input.keyboard.on('keydown-P', () => this.duraklatDegistir());
    this.input.keyboard.on('keydown-ESC', () => this.duraklatDegistir());

    this.dokunmatikKur();
    this.kok.add([...this.kalpler, this.paraIkon, this.paraYazi, this.bolumYazi, this.surumYazi, this.mesaj,
      this.duraklatYazi, this.komboYazi, this.hareketYazi, this.ipucu, this.duraklatBtn,
      ...this.butonlar.flatMap(({ b, y }) => [b, y])]);
    this.yerlestir();
    this.scale.on('resize', this.yerlestir, this);
    this.yenidenBagla();
  }

  stil(boyut) {
    return { fontFamily: 'Arial Black, Arial, sans-serif', fontSize: boyut + 'px', color: '#ffffff', stroke: '#000000', strokeThickness: Math.max(3, boyut / 7), resolution: AYAR.RES };
  }

  // Oyun sahnesi her (yeniden) başladığında olaylara bağlanır
  yenidenBagla() {
    const oyun = this.scene.get('Game');
    const ev = oyun.events;
    ev.off('can', this.canGoster, this);
    ev.off('para', this.paraGoster, this);
    ev.off('bolum', this.bolumGoster, this);
    ev.off('mesaj', this.mesajGoster, this);
    ev.off('kombo', this.komboGoster, this);
    ev.off('hareket', this.hareketGoster, this);
    ev.on('kombo', this.komboGoster, this);
    ev.on('hareket', this.hareketGoster, this);
    ev.on('can', this.canGoster, this);
    ev.on('para', this.paraGoster, this);
    ev.on('bolum', this.bolumGoster, this);
    ev.on('mesaj', this.mesajGoster, this);

    if (oyun.oyuncu) this.canGoster(oyun.oyuncu.can);
    this.paraGoster(this.registry.get('para') || 0);
    this.bolumGoster(oyun.bolumNo + 1, BOLUMLER[oyun.bolumNo].ad);
    this.mesaj.setAlpha(0);
    this.duraklatYazi.setVisible(false);
  }

  canGoster(can) {
    this.kalpler.forEach((k, i) => k.setTexture(i < can ? 'kalp' : 'kalp_bos'));
  }

  paraGoster(adet) {
    this.paraYazi.setText(String(adet));
    this.tweens.add({ targets: this.paraIkon, scale: 1.3, duration: 80, yoyo: true });
  }

  bolumGoster(no, ad) {
    this.bolumYazi.setText(`LEVEL ${no}`);
  }

  // Vuruş zinciri sayacı (2 ve üstünde görünür)
  komboGoster(adet) {
    if (adet < 2) return;
    this.komboYazi.setText(adet + ' HIT COMBO!').setAlpha(1).setScale(1.25);
    this.tweens.killTweensOf(this.komboYazi);
    this.tweens.add({ targets: this.komboYazi, scale: 1, duration: 120 });
    this.tweens.add({ targets: this.komboYazi, alpha: 0, duration: 400, delay: 1100 });
  }

  // Oynayan hareketin adı karakterin altında kısa süre belirir
  hareketGoster(ad) {
    this.hareketYazi.setText(ad).setAlpha(0.9);
    this.tweens.killTweensOf(this.hareketYazi);
    this.tweens.add({ targets: this.hareketYazi, alpha: 0, duration: 300, delay: 350 });
  }

  mesajGoster(metin) {
    this.mesaj.setText(metin).setAlpha(1).setScale(0.5);
    this.tweens.add({ targets: this.mesaj, scale: 1, duration: 300, ease: 'Back.out' });
  }

  duraklatDegistir() {
    const oyun = this.scene.get('Game');
    if (oyun.bitti) return;
    if (this.scene.isPaused('Game')) {
      this.scene.resume('Game');
      this.duraklatYazi.setVisible(false);
    } else {
      Kontrol.sifirla();
      this.scene.pause('Game');
      this.duraklatYazi.setVisible(true);
    }
  }

  dokunmatikKur() {
    this.butonlar = [];
    if (!Kontrol.dokunmatikAcik(this)) return;
    this.input.addPointer(3);

    const ekle = (anahtar, etiket) => {
      const b = this.add.image(0, 0, 'buton').setInteractive().setAlpha(0.9);
      const y = this.add.text(0, 0, etiket, this.stil(30)).setOrigin(0.5);
      const bas = () => { Kontrol.sanal[anahtar] = true; b.setScale(0.9); };
      const birak = () => { Kontrol.sanal[anahtar] = false; b.setScale(1); };
      b.on('pointerdown', bas);
      b.on('pointerover', (p) => { if (p.isDown) bas(); });
      b.on('pointerup', birak);
      b.on('pointerout', birak);
      this.butonlar.push({ anahtar, b, y });
    };
    ekle('sol', '◀');
    ekle('sag', '▶');
    ekle('yumruk', '✊');
    // ekle('tekme', '🦶');   // tekme kareleri gelince açılacak
    ekle('zipla', '▲');
  }

  yerlestir() {
    const w = this.scale.width / AYAR.RES, h = this.scale.height / AYAR.RES;
    const paraX = 24 + AYAR.CAN * 34 + 24;
    this.paraIkon.setPosition(paraX, 26);
    this.paraYazi.setPosition(paraX + 18, 26);
    this.bolumYazi.setPosition(w / 2, 10);
    this.surumYazi.setPosition(w - 8, h - 6);
    this.mesaj.setPosition(w / 2, h * 0.4);
    this.duraklatYazi.setPosition(w / 2, h * 0.45);
    this.duraklatBtn.setPosition(w - 20, 26);
    this.komboYazi.setPosition(w - 24, 80);
    this.hareketYazi.setPosition(w / 2, h - 10);
    this.ipucu.setPosition(16, h - 10);

    const konum = {
      sol: [80, h - 80], sag: [190, h - 80],
      yumruk: [w - 190, h - 70], tekme: [w - 150, h - 175], zipla: [w - 70, h - 85]
    };
    this.butonlar.forEach(({ anahtar, b, y }) => {
      const [x, yy] = konum[anahtar];
      b.setPosition(x, yy); y.setPosition(x, yy);
    });
  }
}
