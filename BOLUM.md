# Popeye Fighter – bölüm / harita tasarımı

Haritada, yolda veya bölüm düzeninde çalışmadan önce bu dosyayı oku. Değerler ve kurallar için `OYUN.md`ye bak.

## Görünüm: aydınlık 2.5D derinlik
- Hedef his: F.I.S.T. (Forged in Shadow Torch) gibi derinlikli 2.5D dünya, ama karanlık değil, güneşli ve renkli bir korsan limanı.
- Karakterler 2D kesme (cutout) parçalardan oluşuyor. Gerçek 3D yok, derinlik şöyle veriliyor:
  - Farklı hızda kayan arka plan katmanları (parallax): gökyüzü → uzak deniz/adalar → orta plan kasaba → yolun hemen arkasındaki duvarlar/nesneler.
  - Yürünen zemin şeridine kodla hafif perspektif verilir (yüzey geriye doğru açılıyormuş gibi).
  - Ön plan nesneleri (direk, zincir, kasa köşesi, uzun ot) kameraya en yakın katmanda karakterin önünden hızlı geçer.
  - Işık hüzmeleri ve sis/pus şeritleri katmanların arasına konur.
- Girilebilen yerler (depo kapısı, mağara ağzı, gemi ambarı): içeri girince arka plan iç mekân katmanlarıyla değişir, karakter aynı çizgide yürümeye devam eder.
- Tüm nesne görselleri düz önden (front elevation) ya da tam yandan profil çizilir. 3/4 veya izometrik çizim kullanılmaz, çünkü kamera yana kayınca hep aynı yüzü göstererek sahte durur.
- Önce tek tek nesneler (yol parçaları, bina cepheleri, sokak lambası, kasa, varil vb.) toplanır, tam sayfa arka planlar sonra ayrıca istenir.

## Şu anki ön plan (cevre.js)
- En arkada `cevre/gok.webp` gökyüzü+deniz: ekran boyunu tam kaplar, aynalanarak uç uca döşenir, 0.06 hızla kayar.
- Evler (`ev0-7`) p=0.85 derinlik katmanında 2-3'lü kümeler, aralarda boşluk; birbirine binmez.
- Kum `cevre/kum.webp`: ev katmanıyla aynı hızda, üst kenarı evlerin alt çizgisinde, uç uca döşenir; tahtanın yarısında kesilir, altı tek renkle doldurulur (zıplarken ev ile tahta arası açılmaz).
- Zemin: `cevre/tahta.webp` iskele şeridi uç uca döşenir (eni 2400 birim); altında en arkadaki gökyüzü/deniz görseli görünür. Ayak çizgisi görselin üstten %34.6'sı.
- İskele kazıkları `cevre/kazik.webp` (boy 630 birim) yolla aynı katmanda (p=1) ve aynı hızda, bir tahta şeridi eni aralıkla çift sıra: ön sıranın ortası iskelenin ön kenarında, karakterlerin önünde; arka sıra arka kenarda, %78 küçük (perspektif), alt yarısı tahtanın arkasında kalır.
- Kasa, lamba, palmiye, fener gibi nesneler netlik yetersiz olduğu için kaldırıldı; daha net görseller gelince aynı mantıkla (evlerin önü, iskelenin arka yarısı) eklenecek.

## Metroidvania / geri dönüş (backtracking)
- Bölümler geri dönülerek yeniden keşfedilecek şekilde tasarlanır.
- İleride eklenecek **zıpkınlı kanca**: kola takılı, Örümcek Adam gibi atılır, bir yere takılır ve oyuncu kendini oraya çeker. Henüz oyunda yok, bölümler buna göre hazırlanır.
- Her bölümde ilk gelişte görülen ama kancasız çıkılamayan **yukarı alanlar** olsun: yüksek iskeleler, çatılar, gemi direklerinin tepesi, uçurum üstleri.
- Kancanın takılabileceği noktalar oyuncunun anlayacağı şekilde belli olsun: demir halkalar, kirişler, direk uçları, makaralar.
- Kanca alındıktan sonra eski bölümlere dönülünce bu yukarı alanlardan yeni yollar, kısayollar ve gizli ödüller (sandık, ıspanak, XP) açılır.
- Yeni yetenekler (yetenek ağacı) de benzer şekilde eski yerlerde yeni yollar açabilecek biçimde düşünülür.
