// Hareket tanımları: animasyon hızları ve saldırı (yumruk/tekme) verileri.
// Kare adları atlastan gelir (assets/popeye_data.js). Bir saldırı, kare adlarının sırasıyla oynatılmasıdır;
// aynı kare birden fazla yazılırsa o poz biraz daha uzun kalır.
//
// Kare grupları: pa = jab satırı | p = yumruk satırı (guard, jab, cross, uppercut, düz, guard)
//                k = tekme satırı | m = karışık satır (yumruk, yumruk, tekme) | ja = havada tekme
//
// Saldırı alanları:
//   kareler: oynatılacak kare adları (sırayla)
//   fps:     animasyon hızı (saniyede kare)
//   vurus:   hasar verilen pencereler, kareler listesindeki sıra numarasıyla: [[ilk, son], ...]
//            her pencerede aynı düşmana tekrar vurulabilir
//   menzil:  vuruş kutusunun genişliği (px), yuks: kutu yüksekliği (px)
//   yOfs:    kutunun merkezi, gövdenin üstünden kaç px aşağıda
//   hasar:   düşmana verilen can hasarı
//   itme:    düşmanı yatay itme gücü, havaya: dikey fırlatma (uppercut)
//   atilma:  saldırı başında öne kayma hızı

const HAREKET = {
  // Döngülü (loop) animasyonlar (kare adı: idle_0, walk_0 ...)
  idle: { fps: 9 },
  walk: { fps: 7 },   // yavaş yürüme; hıza göre 0.6x - 1.1x oynar

  // --- Yumruklar (J)
  jab:      { ad: 'Jab',      kareler: ['pa_0', 'pa_1', 'pa_2', 'pa_3', 'pa_4', 'pa_5'],
              fps: 22, vurus: [[2, 3]], menzil: 60, yuks: 34, yOfs: 24, hasar: 1, itme: 160, havaya: 0,   atilma: 90,  sarsinti: 0.004 },
  straight: { ad: 'Straight', kareler: ['p_0', 'p_1', 'p_1', 'p_5'],
              fps: 15, vurus: [[1, 2]], menzil: 66, yuks: 34, yOfs: 24, hasar: 1, itme: 200, havaya: 0,   atilma: 120, sarsinti: 0.004 },
  cross:    { ad: 'Cross',    kareler: ['p_5', 'p_2', 'p_2', 'p_5'],
              fps: 15, vurus: [[1, 2]], menzil: 72, yuks: 36, yOfs: 24, hasar: 2, itme: 260, havaya: 0,   atilma: 150, sarsinti: 0.006 },
  punch2:   { ad: 'Double',   kareler: ['m_0', 'm_1', 'm_2', 'm_2', 'm_5'],
              fps: 17, vurus: [[1, 3]], menzil: 70, yuks: 36, yOfs: 24, hasar: 2, itme: 230, havaya: 0,   atilma: 130, sarsinti: 0.005 },
  upper:    { ad: 'Uppercut', kareler: ['p_0', 'p_3', 'p_3', 'p_5'],
              fps: 14, vurus: [[1, 2]], menzil: 52, yuks: 80, yOfs: 14, hasar: 2, itme: 120, havaya: 520, atilma: 60,  sarsinti: 0.008 },

  // --- Tekmeler (K)
  kick1:    { ad: 'Kick',      kareler: ['k_0', 'k_1', 'k_2', 'k_3', 'k_4', 'k_5'],
              fps: 17, vurus: [[3, 4]], menzil: 74, yuks: 44, yOfs: 30, hasar: 2, itme: 300, havaya: 140, atilma: 70,  sarsinti: 0.008 },
  kick2:    { ad: 'Low Kick',  kareler: ['m_0', 'm_3', 'm_3', 'm_5'],
              fps: 14, vurus: [[1, 2]], menzil: 78, yuks: 40, yOfs: 40, hasar: 2, itme: 280, havaya: 100, atilma: 60,  sarsinti: 0.006 },

  // --- Havada tekme (havadayken K)
  aerial:   { ad: 'Air Kick',  kareler: ['ja_0', 'ja_1', 'ja_2', 'ja_3', 'ja_4', 'ja_5', 'ja_6'],
              fps: 17, vurus: [[3, 4]], menzil: 70, yuks: 50, yOfs: 36, hasar: 2, itme: 280, havaya: -120, atilma: 0, sarsinti: 0.006 }
};

// Tuşa basıldıkça sırayla denenen hareketler. Liste bitince başa döner;
// son saldırıdan sonra ZINCIR_SIFIRLAMA süresi geçerse başa döner.
const ZINCIR = {
  yumruk: ['jab', 'straight', 'cross', 'punch2', 'upper'],
  tekme:  ['kick1', 'kick2']
};

// Havadayken kullanılan hareketler
const HAVA = { yumruk: 'straight', tekme: 'aerial' };

// Zıplama animasyonunda dikey hıza göre kare seçimi: [bu hızdan küçükse, kare]
// Kareler: 0 çömelme, 1 fırlama, 2-3 yükseliş, 4 tepe, 5 iniş, 6 yere konma
const ZIPLA_KARELERI = [[-560, 1], [-380, 2], [-120, 3], [120, 4], [99999, 5]];
