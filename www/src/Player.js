// Oyuncu: koşma (ivmeli), çift zıplama, coyote time, zıplama tamponu, değişken zıplama yüksekliği,
// J = yumruk / K = tekme kombo zinciri, hasar/geri tepme.
//
// Yapı: Bu nesne yalnızca görünmez fizik gövdesidir. Görünen karakter `this.gorsel` (atlas kareleri);
// her karede ayakları gövdenin altına oturtulur. Animasyon kareleri elle ilerletilir
// (vuruş duraklaması ve hız bağlantılı yürüme için).

const DONUS_SURESI = 340;   // ms - çift zıplamada bir tam tur

class Oyuncu extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, 'govde');
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.setVisible(false);
    this.body.setSize(AYAR.GOVDE_G, AYAR.GOVDE_Y);
    this.body.setMaxVelocity(AYAR.KOSU_HIZI * 1.6, AYAR.MAKS_DUSME);

    this.gorsel = scene.add.sprite(x, y, 'popeye', 'idle_0').setScale(AYAR.SPRITE_OLCEK).setDepth(10);

    this.yon = 1;
    this.can = AYAR.CAN;
    this.ekstraZiplama = AYAR.EKSTRA_ZIPLAMA;
    this.sonYerZamani = 0;
    this.tamponBitis = 0;
    this.kesmeYapildi = true;
    this.yerdeydi = false;
    this.korumaBitis = 0;
    this.sersemBitis = 0;
    this.olu = false;
    this.sonVy = 0;

    // Animasyon durumu
    this.animZaman = 0;
    this.inisBitis = 0;
    this.donuyor = false;
    this.donusBas = 0;

    // Dövüş durumu
    this.saldiri = null;                 // şu an oynayan saldırı
    this.sira = [];                      // bitmesi beklenen sıradaki tuşlar ('yumruk' | 'tekme')
    this.zincir = { yumruk: 0, tekme: 0 };
    this.sonSaldiriBitis = -99999;
    this.donma = 0;                      // vuruş duraklaması (ms)
  }

  get yerde() {
    return this.body.blocked.down || this.body.touching.down;
  }

  get saldiriyor() {
    return this.saldiri !== null;
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
      if (!this.yerdeydi) this.yereIndi(zaman);
    }
    this.yerdeydi = yerde;

    // Yerde başlayan saldırı sırasında karakter yürüyemez/zıplayamaz
    const kilit = this.saldiri && this.saldiri.yerdeBasladi && yerde;
    const sersem = zaman < this.sersemBitis;

    // --- Saldırı girişleri (tuşlar sıraya eklenir, hareket bitmeden diğerine geçilmez)
    if (!sersem) {
      if (Kontrol.yumruk) this.saldiriIstegi('yumruk', zaman);
      if (Kontrol.tekme) this.saldiriIstegi('tekme', zaman);
    }

    // --- Yatay hareket
    const girdi = (sersem || kilit) ? 0 : (Kontrol.sag ? 1 : 0) - (Kontrol.sol ? 1 : 0);
    if (girdi !== 0) {
      this.yon = girdi;
      const ivme = yerde ? AYAR.YER_IVME : AYAR.HAVA_IVME;
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
    const zipSerbest = !sersem && !kilit;

    if (zipSerbest && tamponVar && (yerde || coyote)) {
      this.ziplat(AYAR.ZIPLAMA_HIZI, false, zaman);
    } else if (zipSerbest && Kontrol.zipla && !yerde && !coyote && this.ekstraZiplama > 0) {
      this.ekstraZiplama--;
      this.ziplat(AYAR.IKINCI_ZIPLAMA_HIZI, true, zaman);
    }

    // Tuş erken bırakılırsa kısa zıplama
    if (!this.kesmeYapildi && !Kontrol.ziplaTut && b.velocity.y < 0) {
      b.velocity.y *= AYAR.ZIPLAMA_KESME;
      this.kesmeYapildi = true;
    }
    if (b.velocity.y >= 0) this.kesmeYapildi = true;

    // --- Animasyon / saldırı ilerletme
    this.gorselGuncelle(zaman, delta, yerde);
    this.sonVy = b.velocity.y;
  }

  // ---------------- Saldırılar ----------------

  saldiriIstegi(tip, zaman) {
    if (ZINCIR[tip].length === 0 && !HAVA[tip]) return;       // bu tuşa henüz hareket tanımlı değil
    if (!this.saldiri) this.saldiriBaslat(tip, zaman);
    else if (this.sira.length < AYAR.SIRA_LIMIT) this.sira.push(tip);
  }

  saldiriBaslat(tip, zaman) {
    const yerde = this.yerde;
    let ad;
    if (!yerde) {
      ad = HAVA[tip];
      if (!ad) return;                                         // havada bu tuşa hareket yok
    } else {
      if (ZINCIR[tip].length === 0) return;
      if (zaman - this.sonSaldiriBitis > AYAR.ZINCIR_SIFIRLAMA) this.zincir = { yumruk: 0, tekme: 0 };
      const liste = ZINCIR[tip];
      ad = liste[this.zincir[tip] % liste.length];
      this.zincir[tip]++;
    }
    const girdi = (Kontrol.sag ? 1 : 0) - (Kontrol.sol ? 1 : 0);
    if (girdi !== 0) this.yon = girdi;

    const m = HAREKET[ad];
    this.saldiri = { ad, m, tip, gecen: 0, kare: 0, yon: this.yon, yerdeBasladi: yerde, pencere: -1, vurulan: new Set() };
    this.donuyor = false;
    if (yerde) this.body.velocity.x = this.yon * m.atilma;
    this.scene.events.emit('hareket', m.ad);
  }

  saldiriBitir(zaman) {
    this.saldiri = null;
    this.sonSaldiriBitis = zaman;
    if (this.sira.length) this.saldiriBaslat(this.sira.shift(), zaman);
  }

  // Şu an hasar veren bir kare varsa vuruş dikdörtgenini döndürür
  saldiriKutusu() {
    const s = this.saldiri;
    if (!s) return null;
    const m = s.m;
    const pencere = m.vurus.findIndex(([a, b]) => s.kare >= a && s.kare <= b);
    if (pencere < 0) return null;
    if (pencere !== s.pencere) { s.pencere = pencere; s.vurulan = new Set(); }   // yeni pencere: tekrar vurulabilir
    const b = this.body;
    const cx = b.center.x + s.yon * (b.width / 2 + m.menzil / 2 - 6);
    const cy = b.top + m.yOfs;
    return new Phaser.Geom.Rectangle(cx - m.menzil / 2, cy - m.yuks / 2, m.menzil, m.yuks);
  }

  // GameScene bir düşmana vurunca çağırır
  vurusBasarili(dusman) {
    const s = this.saldiri;
    if (!s) return;
    s.vurulan.add(dusman);
    this.donma = AYAR.VURUS_DURAKLAMA;
    this.scene.cameras.main.shake(90, s.m.sarsinti);
  }

  // ---------------- Görünüm ----------------

  kareAyarla(ad, i) { this.kareAdiAyarla(ad + '_' + i); }

  kareAdiAyarla(adi) {
    const a = POPEYE_ANKOR[adi];
    this.gorsel.setFrame(adi);
    this.gorsel.setOrigin(a[0] / a[2], a[1] / a[3]);
  }

  gorselGuncelle(zaman, delta, yerde) {
    const g = this.gorsel;
    const b = this.body;
    const s = this.saldiri;

    if (s) {
      // vuruş duraklaması sırasında kare ilerlemez
      if (this.donma > 0) this.donma -= delta;
      else s.gecen += delta;
      const n = s.m.kareler.length;
      s.kare = Math.floor(s.gecen / 1000 * s.m.fps);
      if (s.kare >= n) { this.saldiriBitir(zaman); }
    }

    const sa = this.saldiri;
    g.setFlipX((sa ? sa.yon : this.yon) < 0);
    g.rotation = 0;

    if (sa) {
      this.kareAdiAyarla(sa.m.kareler[Math.min(sa.kare, sa.m.kareler.length - 1)]);
    } else if (this.donuyor) {
      // Çift zıplama: top pozunda havada dönerek iner (yere değene kadar)
      const t = (zaman - this.donusBas) / DONUS_SURESI;
      this.kareAyarla('spin', 0);
      g.rotation = this.yon * Math.PI * 2 * t;
      g.setPosition(b.center.x, b.center.y);
      this.efektUygula(zaman);
      return;
    }
    if (!sa && !this.donuyor) {
      if (!yerde) {
        let kare = 5;
        for (const [esik, k] of ZIPLA_KARELERI) { if (b.velocity.y < esik) { kare = k; break; } }
        this.kareAyarla('jump', kare);
      } else if (zaman < this.inisBitis) {
        this.kareAyarla('jump', 6);
      } else {
        const hiz = Math.abs(b.velocity.x);
        let ad = 'idle', fps = HAREKET.idle.fps;
        if (hiz > 25) { ad = 'walk'; fps = HAREKET.walk.fps * (0.6 + 0.5 * hiz / AYAR.KOSU_HIZI); }
        this.animZaman += delta * fps / 1000;
        this.kareAyarla(ad, Math.floor(this.animZaman) % POPEYE_KARE[ad]);
      }
    }
    g.setPosition(b.center.x, b.bottom);
    this.efektUygula(zaman);
  }

  efektUygula(zaman) {
    const g = this.gorsel;
    if (zaman < this.korumaBitis) g.setAlpha(Math.floor(zaman / 80) % 2 ? 0.35 : 1);
    else g.setAlpha(1);
  }

  // ---------------- Hareket yardımcıları ----------------

  ziplat(hiz, ikinci, zaman) {
    this.body.velocity.y = -hiz;
    this.tamponBitis = 0;
    this.sonYerZamani = -9999;
    this.kesmeYapildi = false;
    this.scene.toz(this.body.center.x, this.body.bottom, ikinci ? 8 : 5);
    if (ikinci) {
      this.donuyor = true;
      this.donusBas = zaman;
    }
  }

  yereIndi(zaman) {
    if (this.sonVy > 260) this.inisBitis = zaman + 110;
    this.donuyor = false;
    this.scene.toz(this.body.center.x, this.body.bottom, 4);
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
    this.saldiri = null;
    this.sira = [];
    this.donuyor = false;
    const yon = this.x < kaynakX ? -1 : 1;
    this.body.velocity.x = yon * AYAR.GERI_TEPME_X;
    this.body.velocity.y = -AYAR.GERI_TEPME_Y;
    this.kesmeYapildi = true;
    this.gorsel.setTint(0xff6666);
    this.scene.time.delayedCall(200, () => this.gorsel.clearTint());
    this.scene.cameras.main.shake(140, 0.006);
    this.scene.events.emit('can', this.can);
    return true;
  }

  oluGorunum() {
    this.gorsel.setTint(0x666666);
    this.scene.tweens.add({ targets: this.gorsel, y: this.gorsel.y - 80, angle: 180 * this.yon, duration: 500, ease: 'Quad.out' });
  }

  dogur(x, y) {
    this.setPosition(x, y);
    this.body.reset(x, y);
    this.gorsel.setAngle(0);
    this.olu = false;
    this.saldiri = null;
    this.sira = [];
    this.korumaBitis = this.scene.time.now + AYAR.HASAR_KORUMA;
  }
}
