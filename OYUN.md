# Popeye Fighter – oyun notları (sayılar ve kurallar)

Kullanıcı oyunla ilgili bir şey sorunca önce buraya bak (koda girme). Oyunda bir değer/kural değişince bu dosyayı da güncelle.
Ölçü: kullanıcı mesafeleri Popeye'nin kafa boyuyla anlatır. Oyun birimi: oyuncu boyu ~850.

## Oyuncu
- Can: 250 (Maks. Can +100 yeteneğiyle 350). Can çubuğu yok; can kafa görselinden (11 hasar seviyesi) ve eğik çubuktan okunur.
- Can dolumu: son hasardan 6–8 sn (rastgele) sonra başlar; saniyede max canın %1'i = 250 canda **2.5 can/sn** (350 canda 3.5). Can Dolumu %2 → 5/sn, %3 → 7.5/sn. Kalkanlı Savunma: blokta beklemeden dolar. Dolarken kalp atar ve kalp sesi çalar. (`dongu.js`)
- Enerji: max 250, saniyede 2.5 dolar (ıspanaktan sonra 10 sn 2 kat). Her özel güç 50 enerji. Bıçak modu saniyede 7.5 enerji yer.
- Ispanak: max canın %10'u + 50 enerji. Ispanak Cebi açıksa ikisi de 2 kat (yerden de cepten de). Düşman ölünce %25, varil kırılınca %50 (Varil Tutma ile) ıspanak düşer.
- Seviye atlayınca can ve enerji tamamen dolar.
- Blok: iki parmak ekranda hareketsiz. Hasarın yarısı engellenir; ilk 0.5 sn içinde vurulursa PARRY (düşman sersemler).

- Kayma (E): koşarken (en az max hızın yarısı). Kayma bitince durup yavaşlarsa ya da koşarak 650 birim (`KAY_YOL`) yol alırsa tekrar kayılır (koş-kay-koş-kay).
- Yürüme/koşu hızı (en yüksek): 1100 birim/sn. Yerde saldırırken hız %35'e, çömelikken %45'e düşer.
- Yerçekimi: 5600.
- Zıplama: bir basış hep tam zıplar (basılı tutmak yükseltmez). Hız 2700, çift zıplama 1700 (yükseklik eskinin yarısı). Çift zıplama 1 kez (havada 1 ek zıplama, D yeteneğiyle). Çok Zıplama (K): zıplama gücü x1.25.
- Sensörle zıplama gücü telefonu silkme hızına göre 0.8–1.45 kat (koşarken x1.18).

## Can çalma (şu anki kod, `yetenek.js` canCal)
- Can Çalma %10 (H) ya da %20 (M): tüm vuruşlarda (yumruk, tekme, bıçak) vurulan hasarın yüzdesi kadar can.
- Tekmeyle Can Çalma (Q): sadece tekmelere kendi +%10'unu ekler (H yoksa tekme %10, H varsa %20, M varsa %30). Yumruğu artırmaz.
- Bıçakla Can Çalma (T): sadece bıçak modu vuruşlarına kendi +%20'sini ekler (H yoksa %20, H varsa %30, M varsa %40). Yumruğu artırmaz.
- Can Çalmalı Yırtma (R): düşmanın kalan canı kadar can (en az 50).

## Düşmanlar
- k yumruklu korsan: 150 can, oyuncuya 10 hasar. b bıçaklı: 100 can, 15 hasar. h kancacı: 200 can, yumruk 10 hasar, yürümez.
- Kaptan (boss): 500 can, 15 hasar; vuruşların yarısını alır, kafaya vuruş 3 kat (KRİTİK). Bölüm sonunda x=42000'de.
- Yürüme hızı: yumruklu/bıçaklı 520, kaptan 340 birim/sn. Kaçarken yarı hız.
- Vurma menzili: yumruklu 470, bıçaklı 425, kaptan ~537 birim.
- Saldırı: yumruklu 1–3 vuruşluk kombo, bıçaklı/kaptan 1–2. Kombo sonrası 0.6–1.4 sn bekler. Vuruş süreleri: uzak kol 0.5 sn, yakın kol 0.62 sn, bıçak/dipçik 0.66 sn.
- Kaptan: ~1075–1900 birim uzaktayken nişan alıp ateş eder (nişandan 0.6 sn sonra), ateşler arası 1–2 sn.
- Kancacı: 2100 birim içindeyse kanca atar. Kanca takılırsa 15 hasar, çekerken her 0.5 sn 1 hasar. Oyuncuyu 420 birim yakınlığa (yumruk mesafesi) çekip bırakır; 610 birime kadar 2–3 vuruşluk yumruk atar.
- Düşman içine girilince biraz geri gider; geri giderken de vurabildiği an normal vurur.
- Canı ilk kez %25 altına düşen korsan bir kez kaçar (10 sn ya da 4 vuruş), canı %50'ye doğru dolar. Kaçarken saldırı pozu yok: kollar aşağı sarkık, bel hafif bükük, aksayarak gider. Kaptan kaçmaz.
- Yere düşme 0.45 sn, kalkış 1.0 sn sürer.

- Ölen (ve parçalanan) düşman siyah beyaz çizilir; yere düşüp yaşayan renkli kalır.

## XP ve seviye
- Öldürülen düşman canının 1/10'u kadar XP verir (yumruklu 15, bıçaklı 10, kancalı 20, kaptan 50). Yırtarak öldürme +%50. Düşman canı artarsa XP de artar.
- Seviye 1→2 için 100 XP, sonraki her seviye %25 fazla (`XP_ILK`, `XP_ART` yetenek.js). Her seviye 1 puan; can ve enerji dolar; seviye sesi (`ses/levelup.mp3`).
- Kayıtta oyuncunun TOPLAM XP'si tutulur (`pf_agac2.top`). Seviye/puan her açılışta toplamdan hesaplanır: XP_ILK düşürülürse oyuncular daha çok seviye atlamış olur, yükseltilirse seviye düşer. Puan eksiye düşerse son açılan yetenekler kapanır, puanı geri döner.

## Hasarlar (oyuncunun)
- Yumruk kombo: ara vuruşlar 5, son vuruş 5×n+5. Serbest kol vuruşu 15. Bıçak modunda vuruşlar 2 kat (bıçak vuruşu 20, sersemletmez).
- Tekmeler (kombo): 6–18. Kombo kayar tekmesi (yyt) havada bacaklar açık yapılır, iki ayak da vurur (arkadaki ayak arkadaki düşmana). Kayar tekme 15 (%50 yere serer). Döner tekme 50. Yere tekme (uçan tekme) her düşmana bir kullanımda bir kez 15 (iniş sarsıntısı aynı düşmana tekrar vurmaz). Kombo 30 (yyyyyt) bitişi: havada 6 tekme (2 orta, 2 daha yukarı-ileri, 2 en yukarı-ileri), 30 hasar 6×5 olarak bölünür; 1.33 sn sürer, karakter tekme başına 70 birim ilerler ve her isabet düşmanı aynı miktar iter (mesafe sabit kalır).
- Ateşli aparkat 32. Süpermen uçuşu 50. Aduket 50. Yer yarma (yarık) 40. Süper kahraman inişi 50 (yer sarsıntısı).
- Alkış şok dalgası 30: geri savurur, %50 yere düşürür (kaptan ve kancacı hariç).
- Tutup fırlatma 4–40 (hıza göre); düşman varil gibi el hızıyla uçar, varilin yarı mesafesi (en yüksek hız ~2300). Varil fırlatma 15–50; varil en yüksek hız 3250. Fırlayan düşman başkasına çarparsa 10–35.
- Yırtma: anında öldürür (enerji = düşmanın kalan canı).
- Yere Düşürme yeteneği: 10 üstü vuruşlar %25 ihtimalle düşmanı yere düşürür.

## Yetenek ağacı (`js/yetenek.js` YET) — parantez içi puan
Her zaman açık: yumruk kombo, tekme, blok. Diğerleri ağaçtan puanla (1–3) açılır; komşusu açık olmalı.
- C Yumruk (kök, 0) · I Yere Düşürme (1, pasif) · O Can Dolumu %2 (1, pasif) · X Can Dolumu %3 (1, pasif) · W Kalkanlı Savunma (2, pasif) · V Maks. Can +100 (1, pasif) · TOP Ispanak Cebi (2; 30 sn'de bir ıspanak butonu, ıspanak gücü x2)
- A İnsan Tutma (1) · B Varil Tutma (1) · G Sıkı Tutuş (1, pasif; tutulan kafa atamaz) · F Yırtma (2) · R Can Çalmalı Yırtma (3) · H Can Çalma %10 (1, pasif) · M Can Çalma %20 (1, pasif)
- N Yer Yumruğu / yarık (2) · S Süpermen Uçuşu (2) · Y Aduket (2)
- D Çift Zıplama (1) · K Çok Zıplama (1, pasif) · E Kayar Tekme (1) · L Döner Tekme (2) · U Süper Kahraman İnişi (2) · Q Tekmeyle Can Çalma (1, pasif)
- J Ateşli Aparkat (1) · AL Alkış Şok Dalgası (2) · YT Yere Tekme (1)
- P Bıçak Modu (2) · T Bıçakla Can Çalma (1, pasif) · Z Bıçak Atlama (3)
- Aktif yetenek açılınca kendi sesi çalar. Sesi olmayan aktifler: Süpermen Uçuşu, Alkış.
- Aduket: dönen su girdabı (`fx/aduket_su`), dönerken iki yana su damlası (`fx/damla`) saçar. Oluşurken `ses/wateraduket.mp3` döngüde çalar, atınca kesilir; çarpınca `ses/aduket_carpma.mp3`.

## Bölüm
- Düz zemin, karlı. 7 varil (x: 2600, 6300, 12400, 18000, 24200, 28600, 34000). Boss x=42000.

## Arayüz ve dil
- Arayüz varsayılan İngilizce. Tüm yazılar `js/dil.js` `DILLER` içinde (en, tr); kod `dil('anahtar')` ile alır, HTML `data-l` / `data-lh` / `data-la`. Yeni dil = `DILLER`'e yeni blok. Sağ üstte 🌐 dil butonu dilleri sırayla değiştirir, seçim kaydedilir (`pf_dil`), anında değişir.
- Oyun arkaya düşünce (sekme, uygulama, ekran kilidi) tüm sesler susar, dönünce devam eder.
- Kombo listesi butonu hep renkli (aktif) görünür. Ispanak cebi butonu basar basmaz çalışır (yürürken de).

## Kontroller (dokunmatik)
- Sağ yarı ön kol, sol yarı arka kol: kaydırınca kol o yöne gider. Telefon eğimi = yürüme, geri silkme = zıplama.
- Eğimle yürüme: 3.5° altı durur, ~8°'ye kadar yavaş yürür, 20°'de tam koşu. Ekranı kendine yatırınca eğilir, bir daha yatırınca kalkar.
- Butonlar: sol/sağ (solda), çömel/zıpla (sağda), ıspanak cebi, yetenek ağacı, kombo listesi.
- İki parmak birlikte aşağı (yerde) = yer yumruğu; blokta iki parmak aşağı = bıçak modu.
- İki parmak aynı yöne yatay = süpermen. Zıt yöne (açılarak) = döner tekme. Ortaya doğru = alkış.
- Havada tek parmak hızlı aşağı = yere tekme (çekilen yöne); iki parmak aşağı = süper kahraman inişi.
- Çok hızlı yukarı = ateşli aparkat. Kol 0.5 sn aşağıda = eğilip ıspanak alma.
