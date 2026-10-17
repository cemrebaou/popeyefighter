// Hareket tanımları: animasyon hızları ve saldırı (yumruk/tekme) verileri.
// Kare numaraları atlastaki sıraya göre (0'dan başlar). Görseller değişince burası ayarlanır.
//
// Saldırı alanları:
//   vurus: [ilkKare, sonKare]  hasar verilen kareler (dahil)
//   fps:    animasyon hızı (saniyede kare)
//   menzil: vuruş kutusunun genişliği (px), yuks: kutu yüksekliği (px)
//   yOfs:   kutunun merkezi, gövdenin üstünden kaç px aşağıda
//   hasar:  düşmana verilen can hasarı
//   itme:   düşmanı yatay itme gücü, havaya: dikey fırlatma (uppercut)
//   atilma: saldırı başında öne kayma hızı

const HAREKET = {
  // Döngülü (loop) animasyonlar
  idle: { fps: 9,  dongu: true },
  walk: { fps: 7,  dongu: true },   // yavaş yürüme; hıza göre 0.6x - 1.1x oynar

  // Saldırılar. Zincir sırası aşağıdaki ZINCIR'de.
  punch_a: { ad: 'Jab',        fps: 22, vurus: [2, 3], menzil: 60, yuks: 34, yOfs: 24, hasar: 1, itme: 160, havaya: 0,    atilma: 90,  sarsinti: 0.004 },
  jab:     { ad: 'Straight', fps: 26, vurus: [2, 4], menzil: 66, yuks: 34, yOfs: 24, hasar: 1, itme: 200, havaya: 0,    atilma: 120, sarsinti: 0.004 },
  cross:   { ad: 'Cross',      fps: 24, vurus: [1, 3], menzil: 72, yuks: 36, yOfs: 24, hasar: 2, itme: 260, havaya: 0,    atilma: 150, sarsinti: 0.006 },
  upper:   { ad: 'Uppercut',   fps: 22, vurus: [2, 3], menzil: 52, yuks: 80, yOfs: 14, hasar: 2, itme: 120, havaya: 520,  atilma: 60,  sarsinti: 0.008 },
  kick1:   { ad: 'Kick',       fps: 24, vurus: [2, 4], menzil: 74, yuks: 36, yOfs: 36, hasar: 2, itme: 260, havaya: 120,  atilma: 80,  sarsinti: 0.006 },
  kick2:   { ad: 'High Kick', fps: 24, vurus: [3, 5], menzil: 78, yuks: 44, yOfs: 24, hasar: 2, itme: 320, havaya: 160, atilma: 60,  sarsinti: 0.008 },
  aerial:  { ad: 'Air Kick', fps: 24, vurus: [3, 6], menzil: 70, yuks: 50, yOfs: 36, hasar: 2, itme: 280, havaya: -120, atilma: 0,  sarsinti: 0.006 }
};

// Tuşa basıldıkça sırayla denenen hareketler. Zincir bitince (veya bekleme süresi dolunca) başa döner.
const ZINCIR = {
  yumruk: ['punch_a', 'jab', 'cross', 'upper'],
  tekme:  ['kick1', 'kick2']
};

// Havadayken kullanılan hareketler
const HAVA = { yumruk: 'jab', tekme: 'aerial' };

// Zıplama animasyonunda dikey hıza göre kare seçimi: [bu hızdan küçükse, kare]
// Kareler: 0 çömelme, 1 fırlama, 2-3 yükseliş, 4 tepe, 5 iniş, 6 yere konma
const ZIPLA_KARELERI = [[-560, 1], [-380, 2], [-120, 3], [120, 4], [99999, 5]];
