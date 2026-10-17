// Ana oyun sahnesi: bölümü kurar, kamerayı yönetir, çarpışmaları bağlar.

const KATI = '#B';
const ZEMIN_KARAKTERLERI = '#B-';

class GameScene extends Phaser.Scene {
  constructor() { super('Game'); }

  init(veri) {
    this.bolumNo = (veri && veri.bolum) || 0;
    this.bitti = false;
    this.komboSayac = 0;
    this.komboZamani = -99999;
  }

  create() {
    const K = AYAR.KARE;
    const bolum = BOLUMLER[this.bolumNo];
    const satirlar = bolum.harita;
    const sutun = Math.max(...satirlar.map(s => s.length));
    this.izgara = satirlar.map(s => s.padEnd(sutun, '.'));
    this.dunyaG = sutun * K;
    this.dunyaY = this.izgara.length * K;

    Kontrol.baglaKlavye(this);
    Kontrol.sifirla();

    this.arkaPlanKur(bolum);

    this.katilar = this.physics.add.staticGroup();
    this.platformlar = this.physics.add.staticGroup();
    this.dikenler = this.physics.add.staticGroup();
    this.paralar = this.physics.add.staticGroup();
    this.kontroller = this.physics.add.staticGroup();
    this.dusmanlar = this.add.group();
    this.baslangic = { x: K * 2, y: K * 2 };

    this.haritaKur();

    // Oyuncu
    this.oyuncu = new Oyuncu(this, this.baslangic.x, this.baslangic.y);
    this.dogusNoktasi = { ...this.baslangic };

    // Dünya sınırları (alt açık: çukura düşülebilir)
    this.physics.world.setBounds(0, 0, this.dunyaG, this.dunyaY + 400);
    this.physics.world.setBoundsCollision(true, true, false, false);
    this.physics.world.gravity.y = AYAR.YERCEKIMI;
    this.oyuncu.setCollideWorldBounds(true);

    this.carpismalariKur();
    this.kameraKur();

    this.efektler = this.add.particles(0, 0, 'toz', {
      speed: { min: 40, max: 140 }, angle: { min: 200, max: 340 },
      scale: { start: 0.9, end: 0 }, alpha: { start: 0.8, end: 0 },
      lifespan: 380, gravityY: 300, emitting: false
    }).setDepth(9);


    // UI
    if (!this.scene.isActive('UI')) this.scene.launch('UI');
    else this.scene.get('UI').yenidenBagla();
    this.events.emit('can', this.oyuncu.can);
    this.events.emit('para', this.registry.get('para') || 0);
    this.events.emit('bolum', this.bolumNo + 1, bolum.ad);

    this.scale.on('resize', this.boyutDegisti, this);
    this.events.once('shutdown', () => this.scale.off('resize', this.boyutDegisti, this));
  }

  // ---------------- Kurulum ----------------

  arkaPlanKur(bolum) {
    const anahtar = 'gok_' + this.bolumNo;
    if (!this.textures.exists(anahtar)) {
      const t = this.textures.createCanvas(anahtar, 4, 256);
      const c = t.getContext();
      const g = c.createLinearGradient(0, 0, 0, 256);
      const hex = (n) => '#' + n.toString(16).padStart(6, '0');
      g.addColorStop(0, hex(bolum.gokyuzu[0]));
      g.addColorStop(1, hex(bolum.gokyuzu[1]));
      c.fillStyle = g; c.fillRect(0, 0, 4, 256);
      t.refresh();
    }
    const w = this.scale.width, h = this.scale.height;
    this.gok = this.add.image(0, 0, anahtar).setOrigin(0).setScrollFactor(0).setDisplaySize(w, h).setDepth(-10);

    // Bulutlar
    for (let i = 0; i < 12; i++) {
      this.add.image(Phaser.Math.Between(0, this.dunyaG * 0.15 + 2000), Phaser.Math.Between(30, 220), 'bulut')
        .setScrollFactor(0.1, 0.05).setDepth(-9).setAlpha(0.85).setScale(Phaser.Math.FloatBetween(0.6, 1.2));
    }
    this.tepeUzak = this.add.tileSprite(0, h, w, 200, 'tepe_uzak').setOrigin(0, 1).setScrollFactor(0).setDepth(-8);
    this.tepeYakin = this.add.tileSprite(0, h, w, 160, 'tepe_yakin').setOrigin(0, 1).setScrollFactor(0).setDepth(-7);
  }

  haritaKur() {
    const K = AYAR.KARE;
    const g = this.izgara;
    const bolgeEkle = (grup, x, y, w, h) => {
      const z = this.add.zone(x + w / 2, y + h / 2, w, h);
      grup.add(z);
      return z;
    };

    for (let r = 0; r < g.length; r++) {
      let katiBas = -1, platBas = -1;
      for (let c = 0; c <= g[r].length; c++) {
        const ch = g[r][c] || '.';
        const x = c * K, y = r * K;
        const cx = x + K / 2, cy = y + K / 2;

        // Katı blokları satır satır birleştir (az fizik gövdesi = performans)
        if (KATI.includes(ch)) {
          if (katiBas < 0) katiBas = c;
          let tex = ch === 'B' ? 'blok' : 'zemin';
          if (ch === '#' && (r === 0 || !KATI.includes(g[r - 1][c]))) tex = 'zemin_ust';
          this.add.image(cx, cy, tex).setDepth(1);
        } else if (katiBas >= 0) {
          bolgeEkle(this.katilar, katiBas * K, y, (c - katiBas) * K, K);
          katiBas = -1;
        }

        if (ch === '-') {
          if (platBas < 0) platBas = c;
          this.add.image(cx, y + 8, 'platform').setDepth(1);
        } else if (platBas >= 0) {
          bolgeEkle(this.platformlar, platBas * K, y, (c - platBas) * K, 16);
          platBas = -1;
        }

        switch (ch) {
          case 'P': this.baslangic = { x: cx, y: cy - 8 }; break;
          case 'o': {
            const p = this.paralar.create(cx, cy, 'para').setDepth(5);
            this.tweens.add({ targets: p, scaleX: 0.2, duration: 450, yoyo: true, repeat: -1, delay: (c * 70) % 450 });
            break;
          }
          case '^': {
            this.add.image(cx, cy, 'diken').setDepth(2);
            bolgeEkle(this.dikenler, x + 6, y + K * 0.45, K - 12, K * 0.55);
            break;
          }
          case 'e': this.dusmanlar.add(new Dusman(this, cx, cy)); break;
          case 'K': {
            const k = this.kontroller.create(cx, y + K - 48, 'kontrol').setDepth(3);
            k.body.setSize(40, 96);
            break;
          }
          case 'G': {
            this.add.image(cx, y + K - 72, 'bayrak').setDepth(3);
            this.hedef = this.add.zone(cx, y + K - 72, 40, 144);
            this.physics.add.existing(this.hedef, true);
            break;
          }
        }
      }
    }
  }

  carpismalariKur() {
    const o = this.oyuncu;
    const tekYon = (nesne, plat) => {
      const b = nesne.body;
      return b.velocity.y >= 0 && (b.prev.y + b.height) <= plat.body.top + 4;
    };

    this.physics.add.collider(o, this.katilar);
    this.physics.add.collider(o, this.platformlar, null, tekYon);
    this.physics.add.collider(this.dusmanlar, this.katilar);
    this.physics.add.collider(this.dusmanlar, this.platformlar, null, tekYon);

    this.physics.add.overlap(o, this.dikenler, (oy, d) => {
      if (oy.hasarAl(oy.x + (oy.body.velocity.x >= 0 ? 1 : -1))) {
        oy.body.velocity.y = -AYAR.GERI_TEPME_Y * 1.2;
        this.canKontrol();
      }
    });

    this.physics.add.overlap(o, this.paralar, (oy, p) => {
      p.destroy();
      const yeni = (this.registry.get('para') || 0) + 1;
      this.registry.set('para', yeni);
      this.events.emit('para', yeni);
      this.toz(p.x, p.y, 6);
    });

    this.physics.add.overlap(o, this.dusmanlar, (oy, d) => {
      if (d.olu) return;
      const ustten = oy.body.velocity.y > 0 && (oy.body.prev.y + oy.body.height) <= d.body.top + 14;
      if (ustten) {
        d.yenil(true);
        oy.ezmeZiplamasi();
        this.cameras.main.shake(80, 0.004);
      } else if (oy.hasarAl(d.x)) {
        this.canKontrol();
      }
    });

    this.physics.add.overlap(o, this.kontroller, (oy, k) => {
      if (k.aktif) return;
      k.aktif = true;
      k.setTexture('kontrol_aktif');
      this.dogusNoktasi = { x: k.x, y: k.y };
      this.tweens.add({ targets: k, scaleY: 1.1, duration: 100, yoyo: true });
    });

    if (this.hedef) this.physics.add.overlap(o, this.hedef, () => this.bolumBitir());
  }

  kameraKur() {
    const kam = this.cameras.main;
    kam.setBounds(0, 0, this.dunyaG, this.dunyaY);
    kam.startFollow(this.oyuncu, true, AYAR.KAMERA_LERP, AYAR.KAMERA_LERP);
    kam.setDeadzone(AYAR.KAMERA_OLU_BOLGE_G, AYAR.KAMERA_OLU_BOLGE_Y);
    kam.setRoundPixels(true);
    kam.fadeIn(300);
  }

  boyutDegisti(boyut) {
    const w = boyut.width, h = boyut.height;
    this.gok.setDisplaySize(w, h);
    this.tepeUzak.setPosition(0, h).setSize(w, 200);
    this.tepeYakin.setPosition(0, h).setSize(w, 160);
  }

  // ---------------- Yardımcılar ----------------

  katiMi(x, y) {
    const K = AYAR.KARE;
    const r = Math.floor(y / K), c = Math.floor(x / K);
    if (r < 0 || r >= this.izgara.length || c < 0 || c >= this.izgara[r].length) return false;
    return ZEMIN_KARAKTERLERI.includes(this.izgara[r][c]);
  }

  toz(x, y, adet) {
    if (this.efektler) this.efektler.explode(adet, x, y);
  }

  canKontrol() {
    if (this.oyuncu.can <= 0) this.oyunBitti();
  }

  // Yumruk/tekme vuruş kutusu ile düşmanları karşılaştırır; her saldırı bir düşmana bir kez vurur.
  vurusKontrol(zaman) {
    const o = this.oyuncu;
    const kutu = o.saldiriKutusu();
    if (!kutu) return;
    const s = o.saldiri;
    this.dusmanlar.getChildren().forEach(d => {
      if (d.olu || s.vurulan.has(d)) return;
      const db = new Phaser.Geom.Rectangle(d.body.x, d.body.y, d.body.width, d.body.height);
      if (!Phaser.Geom.Intersects.RectangleToRectangle(kutu, db)) return;
      o.vurusBasarili(d);
      d.vurusAl(s.m.hasar, s.yon, s.m.itme, s.m.havaya);
      // Kombo sayacı: vuruşlar arası 1.2 sn geçmezse artar
      this.komboSayac = (zaman - (this.komboZamani || -99999) < 1200) ? (this.komboSayac || 0) + 1 : 1;
      this.komboZamani = zaman;
      this.events.emit('kombo', this.komboSayac);
    });
  }

  // ---------------- Akış ----------------

  update(zaman, delta) {
    if (this.bitti) return;
    Kontrol.guncelle();
    this.oyuncu.guncelle(zaman, delta);
    this.dusmanlar.getChildren().forEach(d => d.guncelle());
    this.vurusKontrol(zaman);

    // Kamera öngörüsü: baktığı yöne doğru biraz daha fazla göster
    const kam = this.cameras.main;
    const hedefOfset = -this.oyuncu.yon * AYAR.KAMERA_ONGORU;
    kam.followOffset.x = Phaser.Math.Linear(kam.followOffset.x, hedefOfset, 0.03);

    // Parallax
    this.tepeUzak.tilePositionX = kam.scrollX * 0.2;
    this.tepeYakin.tilePositionX = kam.scrollX * 0.45;

    // Çukura düşme
    if (this.oyuncu.y > this.dunyaY + 80) {
      this.oyuncu.can--;
      this.events.emit('can', this.oyuncu.can);
      if (this.oyuncu.can <= 0) this.oyunBitti();
      else {
        this.cameras.main.flash(200, 255, 255, 255);
        this.oyuncu.dogur(this.dogusNoktasi.x, this.dogusNoktasi.y);
      }
    }
  }

  bolumBitir() {
    if (this.bitti) return;
    this.bitti = true;
    this.oyuncu.body.setVelocity(0, 0);
    this.oyuncu.body.enable = false;
    this.events.emit('mesaj', 'LEVEL CLEAR!');
    const sonraki = (this.bolumNo + 1) % BOLUMLER.length;
    this.time.delayedCall(1600, () => {
      this.cameras.main.fadeOut(300);
      this.cameras.main.once('camerafadeoutcomplete', () => this.scene.restart({ bolum: sonraki }));
    });
  }

  oyunBitti() {
    if (this.bitti) return;
    this.bitti = true;
    this.oyuncu.olu = true;
    this.oyuncu.body.enable = false;
    this.oyuncu.oluGorunum();
    this.events.emit('mesaj', 'GAME OVER');
    this.registry.set('para', 0);
    this.time.delayedCall(1800, () => {
      this.cameras.main.fadeOut(300);
      this.cameras.main.once('camerafadeoutcomplete', () => this.scene.restart({ bolum: this.bolumNo }));
    });
  }
}
