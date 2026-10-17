// Popeye Fighter - genel ayarlar
// Her değişiklikte SURUM artırılır.
const AYAR = {
  SURUM: 'v0.12',

  // Ekran (yatay). Oyun 960x540 birimle tasarlanır; canvas RES kat büyük çizilir (daha net görüntü).
  RES: 2,                 // çizim çözünürlüğü çarpanı (2 = 1080 piksel yükseklik)
  GENISLIK: 960,
  YUKSEKLIK: 540,
  KARE: 48,               // tile boyutu (px)

  // Fizik
  YERCEKIMI: 1800,
  MAKS_DUSME: 1100,

  // Oyuncu hareketi
  KOSU_HIZI: 260,          // yürüme hızı (yavaş yürüme)
  YER_IVME: 2600,
  HAVA_IVME: 1700,
  YER_SURTUNME: 3000,
  HAVA_SURTUNME: 600,
  ZIPLAMA_HIZI: 680,
  IKINCI_ZIPLAMA_HIZI: 600,
  EKSTRA_ZIPLAMA: 1,       // havada kaç ekstra zıplama (1 = çift zıplama)
  ZIPLAMA_KESME: 0.45,     // tuş bırakılınca yukarı hızın çarpanı (kısa zıplama)
  COYOTE_SURE: 110,        // ms - kenardan düştükten sonra zıplama hakkı
  ZIPLAMA_TAMPON: 130,     // ms - yere değmeden az önce basılan zıplama

  // Karakter görseli
  SPRITE_OLCEK: 0.1833,    // atlas pikseli -> oyun birimi (idle karesi 480 px -> ~88 birim)
  GOVDE_G: 28,             // fizik gövdesi genişliği
  GOVDE_Y: 80,             // fizik gövdesi yüksekliği

  // Dövüş
  ZINCIR_SIFIRLAMA: 450,   // ms - son saldırı bittikten sonra bu süre içinde basılırsa kombo sürer
  SIRA_LIMIT: 3,           // hareket bitmeden basılıp sıraya alınabilecek en fazla tuş
  VURUS_DURAKLAMA: 55,     // ms - vurunca kısa donma (vuruş hissi)
  CAN: 3,
  HASAR_KORUMA: 1200,      // ms - hasar sonrası dokunulmazlık
  GERI_TEPME_X: 320,
  GERI_TEPME_Y: 420,

  // Kamera
  KAMERA_LERP: 0.12,
  KAMERA_ONGORU: 90,       // baktığı yöne kamera kayması (px)
  KAMERA_OLU_BOLGE_G: 80,
  KAMERA_OLU_BOLGE_Y: 110,

  // Kontroller
  DOKUNMATIK: 'otomatik',  // 'otomatik' | true | false
  DEBUG_FIZIK: false
};
