// Hareket tanımları: animasyon hızları ve saldırı (yumruk/tekme) verileri.
// Kare adları atlastan gelir (assets/popeye_data.js). Bir saldırı, kare adlarının sırasıyla oynatılmasıdır;
// aynı kare birden fazla yazılırsa o poz biraz daha uzun kalır.
//
// Kare grupları: idle, walk, jump | pa = jab satırı (6 kare: guard, hazırlık, yumruk, yumruk, hazırlık, guard)
//                p = yumruk satırı (6 kare: 0 guard, 1 düz, 2 cross, 3 uppercut, 4 düz, 5 guard)
// Tekme kareleri gelince burada "kick1", "kick2", "aerial" tanımlanıp ZINCIR/HAVA'ya eklenecek.
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
  jab:       { ad: 'Jab',      kareler: ['pa_0', 'pa_1', 'pa_2', 'pa_3', 'pa_4', 'pa_5'],
               fps: 22, vurus: [[2, 3]], menzil: 60, yuks: 34, yOfs: 24, hasar: 1, itme: 160, havaya: 0,   atilma: 90,  sarsinti: 0.004 },
  straight:  { ad: 'Straight', kareler: ['p_0', 'p_1', 'p_1', 'p_5'],
               fps: 15, vurus: [[1, 2]], menzil: 66, yuks: 34, yOfs: 24, hasar: 1, itme: 200, havaya: 0,   atilma: 120, sarsinti: 0.004 },
  cross:     { ad: 'Cross',    kareler: ['p_5', 'p_2', 'p_2', 'p_5'],
               fps: 15, vurus: [[1, 2]], menzil: 72, yuks: 36, yOfs: 24, hasar: 2, itme: 260, havaya: 0,   atilma: 150, sarsinti: 0.006 },
  straight2: { ad: 'Straight 2', kareler: ['p_5', 'p_4', 'p_4', 'p_0'],
               fps: 15, vurus: [[1, 2]], menzil: 68, yuks: 34, yOfs: 24, hasar: 1, itme: 220, havaya: 0,   atilma: 120, sarsinti: 0.004 },
  upper:     { ad: 'Uppercut', kareler: ['p_0', 'p_3', 'p_3', 'p_5'],
               fps: 14, vurus: [[1, 2]], menzil: 52, yuks: 80, yOfs: 14, hasar: 2, itme: 120, havaya: 520, atilma: 60,  sarsinti: 0.008 }
};

// Tuşa basıldıkça sırayla denenen hareketler. Liste bitince başa döner;
// son saldırıdan sonra ZINCIR_SIFIRLAMA süresi geçerse başa döner. Boş liste = o tuş şimdilik bir şey yapmaz.
const ZINCIR = {
  yumruk: ['jab', 'straight', 'cross', 'straight2', 'upper'],
  tekme:  []
};

// Havadayken kullanılan hareketler (null = yok)
const HAVA = { yumruk: 'straight', tekme: null };

// Zıplama animasyonunda dikey hıza göre kare seçimi: [bu hızdan küçükse, kare]
// Kareler: 0 çömelme, 1 fırlama, 2-3 yükseliş, 4 tepe, 5 iniş, 6 yere konma
const ZIPLA_KARELERI = [[-560, 1], [-380, 2], [-120, 3], [120, 4], [99999, 5]];
