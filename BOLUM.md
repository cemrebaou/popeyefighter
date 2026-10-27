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
- En arkada `GOK_AD` (cevre.js) ile seçilen görsel: `gok2.webp` sadece gökyüzü 3:1 (şu an), `gok.webp` eski gökyüzü+deniz. Görsel ekran boyunu tam kaplar, aynalanarak uç uca döşenir, 0.06 hızla kayar.
- Evler: iki set var, `cevre.js` EV_SET ile seçilir (`ev0-7` eski düz cepheler, `yev0-7` yeni kulübeler; şu an `yev`; `EV_YOK` ile yev2 sarı samanlı ev kullanılmıyor). p=0.85 derinlik katmanında 2-3'lü kümeler, aralarda boşluk; birbirine binmez.
- Kum + deniz (v0.368, `kumDeniz` cevre.js): evlerin altından ekranın altına; üstte `cevre/kum.webp` (bandın %36'sı, dünyada sabit, uç uca), altında `cevre/deniz.webp` (üstü kıyı köpüğü). Perspektifli yatay dilimler. Deniz kumdan bağımsız, dere gibi sürekli sola akar (`DZ_AKIS`), koşunca parallaksla hızlanır. Seyrek (2.5–6.5 sn'de bir) bir ön kazığın x ortasında, ekranın altındaki su hizasından küçük, saydam su sıçraması (`sicramaCiz`, kazıkların arkasında). Arka plan sesi `ses/deniz.mp3`: döngü, her kopyanın son 0.5 sn'si bir sonrakiyle üst üste biner.
- Yerden fışkıran her şey tahta kıymığı (`fx/kiymik0-3.webp`, `karAt`/`tasSac`): yere vurma, iniş, düşme, yer yarma, kayma, yerde sürüklenen düşman. Görseller sola fışkırır, sağa gidenler aynalanır. Yer yarma görseli `fx/yarik.webp` (tahta yarığı, v0.371).
- Yakın dağ `cevre/dag_yakin.webp` (v0.373, `dagCiz`): gökyüzü ile evler arasında, derinlik `DAG_P`=0.5 (evlerden uzak, yavaş kayar), dünya boyu `DAG_BOY`=1500, uç uca; alt kenarı zeminin arkasında kalır.
- Zemin `cevre/zemin.webp` (toprak dokusu, eski kum yerine): gerçek ölçeğinde (`ZEMIN_W`=1700 dünya eni) perspektifli dilimlerle, dünyada sabit, uç uca.
- Çevre objeleri (`cevre/o_*.webp`, `CV_OBJ`, v0.376 yeni set, v0.380 doygunluk %15 kısıldı: ateş, çift varil, çapa, kasalar, halat, yön levhası, saksı, varil, sandık, kütük/balta, harita kasası, fener, balık levhası, kasa): sadece kümeler arasındaki evsiz boşluklarda (evlere 90 pay, birbirine değmez, evin üstünde durmaz), dy 5–40 (az perspektif). Boy tablosu `CV_OBJ_BOY`, en/boy `CV_OBJ_ORAN`. Kümeler arası boşluk min 700.
- Deniz ayrıca ekrana doğru akar (v0.368 hali: 2 saydam kopya, opaklık 0.55·sin(π·f), kayma DZ_PER=60, devir DZ_HIZ=0.22), sola akışla birlikte.
- Evler, lambalar, objeler `cevreKur(t1,t2)` ile dizilir: ilk açılış sabit tohum (20261024 / 20261027), her yeniden başlamada (`yeniOyun`) yeni rastgele tohum. Lambalar varillerin üstüne gelmez.
- (Eski) Sahil `cevre/sahil.webp` (kum → ıslak kum → köpük → sığ su, perspektifli): evlerin alt çizgisinden ekranın altına kadar. 28 yatay dilime bölünür; üst dilim ev katmanı hızında (0.85), alt dilimler giderek 1.18 hıza ve büyüklüğe çıkar (gerçek zemin perspektifi). İskelenin altında kodla gölge bandı.
- Zemin: `cevre/tahta.webp` iskele şeridi uç uca döşenir (eni 2400 birim); altında en arkadaki gökyüzü/deniz görseli görünür. Ayak çizgisi görselin üstten %34.6'sı.
- Kamera: ekranın altı ayak çizgisinin `ZGAP` (en çok `KAZIK_DIP`=450) altına kadar gösterir; tahtanın altında deniz görünür. Kazıklar uzun görsel (`cevre/kazik.webp`, eskisi `kazik_eski.webp`): tepeleri eski yerinde, dipleri ayak çizgisinin 820 altında, ekranda görünmez.
- İskele kazıkları `cevre/kazik.webp` (boy 976 birim, uzun; altları suya iner) yolla aynı katmanda (p=1) ve aynı hızda, bir tahta şeridi eni aralıkla çift sıra: ön sıranın ortası iskelenin ön kenarında, karakterlerin önünde; arka sıra arka kenarda, %78 küçük (perspektif), alt yarısı tahtanın arkasında kalır.
- Sokak lambaları (`lamba0`, `lamba1`, yüksek çözünürlük) iskelenin arka yarısında rastgele 1800–3800 birim aralıkla, varillerin yanına gelmez.
- Kasa, palmiye, fener gibi nesneler netlik yetersiz olduğu için kaldırıldı; daha net görseller gelince aynı mantıkla (evlerin önü, iskelenin arka yarısı) eklenecek.

## Metroidvania / geri dönüş (backtracking)
- Bölümler geri dönülerek yeniden keşfedilecek şekilde tasarlanır.
- **Zıpkınlı kanca** (v0.327'den beri oyunda, `js/zipkin.js`, kurallar `OYUN.md` Zıpkın): kola takılı, Örümcek Adam gibi atılır, bir yere takılır; oyuncu kendini çeker, tırmanır, sallanır. Şimdilik buton ile her zaman açılabiliyor; metroidvania için ileride bölümde bulunup kazanılan bir eşya yapılabilir.
- Zıpkın şu an her nesneye takılır (`zpkHedef`: düşman, varil, kazık, lamba, iskele, ev pikseli). Yeni nesne eklenince `zpkHedef`e de eklenmeli; derinlik katmanındaki (p<1) nesnelerde çapa `zpkCapa` ile katman hızında kayar.
- Her bölümde ilk gelişte görülen ama kancasız çıkılamayan **yukarı alanlar** olsun: yüksek iskeleler, çatılar, gemi direklerinin tepesi, uçurum üstleri.
- Kancanın takılabileceği noktalar oyuncunun anlayacağı şekilde belli olsun: demir halkalar, kirişler, direk uçları, makaralar.
- Kanca alındıktan sonra eski bölümlere dönülünce bu yukarı alanlardan yeni yollar, kısayollar ve gizli ödüller (sandık, ıspanak, XP) açılır.
- Yeni yetenekler (yetenek ağacı) de benzer şekilde eski yerlerde yeni yollar açabilecek biçimde düşünülür.
- Zemin dokusu (`zemin.webp`) üstte dağın alt çeyreğine kadar uzar (`kumDeniz`: ek dilimler, deniz yerinde kalır); dağ (`dagCiz`) zeminden SONRA çizilir, yani zemin dağın altına girer (v0.377).
- v0.379 derinlik: evler EV_P=0.75 (daha uzak/küçük), tabanı iskele arka kenarından EV_GERI=70 geride; dağ DAG_P=0.35, DAG_BOY=2300 (daha büyük ve uzak), tabanı DAG_GERI=260 geride (evlerin arkasında). Zemin üst dilimleri dağ hızında (DAG_P), ev tabanında EV_P, aşağı doğru iskeleye yaklaşır: zıplayınca zemin ile dağ kopmaz. Sokak lambaları LAMBA_GERI=100 (tahtadan taşmaz).
- v0.381 zemin dokusu: tek görsel, bandın tüm boyuna (dağın altından denize kadar) büyütülür, dikeyde tekrar etmez; yana uç uca döşenir. Tüm zemin dilimleri aynı yatay hızda (ev katmanı) kayar (eski dilim dilim basamaklanma yok); dilimler sadece dikey parallaks için (zıplayınca dağla kopmaz).
