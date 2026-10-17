// Tüm girişler (klavye + dokunmatik) tek yerden okunur.
// Oyun mantığı sadece Kontrol.sol / sag / zipla / ziplaTut / yumruk değerlerine bakar.
//
// Klavye: ← → hareket | ↑ / Space / Z zıpla | X / Ctrl yumruk | P / Esc duraklat

const Kontrol = {
  sol: false, sag: false,
  ziplaTut: false,       // zıplama tuşu basılı mı
  zipla: false,          // bu karede yeni basıldı mı
  yumruk: false,         // bu karede yeni basıldı mı
  duraklat: false,

  // dokunmatik butonların yazdığı ham durum
  sanal: { sol: false, sag: false, zipla: false, yumruk: false },

  _onceki: { zipla: false, yumruk: false, duraklat: false },
  _tuslar: null,

  baglaKlavye(scene) {
    const K = Phaser.Input.Keyboard.KeyCodes;
    this._tuslar = scene.input.keyboard.addKeys({
      sol: K.LEFT, sag: K.RIGHT, yukari: K.UP, bosluk: K.SPACE, z: K.Z,
      x: K.X, ctrl: K.CTRL, p: K.P, esc: K.ESC, a: K.A, d: K.D, w: K.W
    });
  },

  // Her karede GameScene.update başında çağrılır
  guncelle() {
    const t = this._tuslar;
    const k = (ad) => t && t[ad] && t[ad].isDown;

    this.sol = k('sol') || k('a') || this.sanal.sol;
    this.sag = k('sag') || k('d') || this.sanal.sag;

    const ziplaSimdi = k('yukari') || k('bosluk') || k('z') || k('w') || this.sanal.zipla;
    const yumrukSimdi = k('x') || k('ctrl') || this.sanal.yumruk;
    const duraklatSimdi = k('p') || k('esc');

    this.zipla = ziplaSimdi && !this._onceki.zipla;
    this.yumruk = yumrukSimdi && !this._onceki.yumruk;
    this.duraklat = duraklatSimdi && !this._onceki.duraklat;
    this.ziplaTut = ziplaSimdi;

    this._onceki.zipla = ziplaSimdi;
    this._onceki.yumruk = yumrukSimdi;
    this._onceki.duraklat = duraklatSimdi;
  },

  sifirla() {
    this.sanal = { sol: false, sag: false, zipla: false, yumruk: false };
  },

  dokunmatikAcik(scene) {
    if (AYAR.DOKUNMATIK === true) return true;
    if (AYAR.DOKUNMATIK === false) return false;
    return scene.sys.game.device.input.touch;
  }
};
