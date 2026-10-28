# Popeye Fighter – oyun notları (sayılar ve kurallar)

Kullanıcı oyunla ilgili bir şey sorunca önce buraya bak (koda girme). Oyunda bir değer/kural değişince bu dosyayı da güncelle.
Ölçü: kullanıcı mesafeleri Popeye'nin kafa boyuyla anlatır. Oyun birimi: oyuncu boyu ~850.

## Oyuncu
- Yüz yara seviyeleri (11 yüz) arasında saydam geçiş yok; eşik geçilince doğrudan değişir.
- Can: 250 (Maks. Can +100 yeteneğiyle 350). Can çubuğu yok; can kafa görselinden (11 hasar seviyesi) ve eğik çubuktan okunur.
- Can dolumu: son hasardan 6–8 sn (rastgele) sonra başlar; saniyede max canın %1'i = 250 canda **2.5 can/sn** (350 canda 3.5). Can Dolumu %2 → 5/sn, %3 → 7.5/sn. Kalkanlı Savunma: blokta beklemeden dolar. Dolarken kalp atar ve kalp sesi çalar. (`dongu.js`)
- Enerji: max 250, saniyede 2.5 dolar (ıspanaktan sonra 10 sn 2 kat). Her özel güç 50 enerji. Bıçak modu saniyede 7.5 enerji yer.
- Ispanak canı (maks. canın %10'u) anında değil: ilk yaprak ağza girince başlar, son yaprakla biter; enerji kutu boşalınca gelir.
- Ispanak yerken kutudan dökülen yapraklar (kutunun arkasında, yüzün önünde) saçılmaz; yapraklar bitene kadar ağız açık kalır: hepsi kavisle açık ağzın içine (`OGV.agiz`) akar, yaklaşınca kararıp küçülerek kaybolur.
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

## Sesler
- Havadan tahtaya düşme (oyuncu inişi, fırlatılan/ölen düşman, yarılar): `ses/wooddusme.mp3`. Yer yarmalar birbirini silmez, her biri kendi süresinde kaybolur; kesiştikleri aralıkta yeni yarık maskelenir (çift yarık görünmez). Yer yarma düşmana vurunca `ses/tahtavurma.mp3`; yarıktan sonraki sürekli çatırdama sesi kaldırıldı. Arka plan `ses/deniz.mp3`.

## Düşmanlar
- k yumruklu korsan: 150 can, oyuncuya 10 hasar. b bıçaklı: 100 can, 15 hasar. h kancacı: 200 can, yumruk 10 hasar, yürümez.
- Kaptan (boss): 500 can, 15 hasar; vuruşların yarısını alır, kafaya vuruş 3 kat (KRİTİK). Bölüm sonunda x=42000'de.
- Kaptan yer vuruşlarından (iniş sarsıntısı, yer yarma, taş patlaması) kafa kritiği (3x) almaz ve vuruş başına en çok maks. canının %5'ini yer (`S.yerV`, `vur`).
- Zorluk: sadece boss öldürülüp bölüm bitince (ölünce değil, v0.387) tüm düşmanların canı ve saldırı gücü (yakın dövüş, kanca 15/çekerken 1, kaptan mermisi 30, kafa atma 10/5/3) ×1.1 birikerek artar (en çok 4 kat; `ZOR_N`, `ZK()` dusman_kur.js, localStorage `pf_zor`). Tam sıfırlamada sıfırlanır. XP canın 1/10'u olduğu için o da artar. Yukarıdaki can/hasar değerleri başlangıç (×1) değerleridir.
- Yürüme hızı: yumruklu/bıçaklı 520, kaptan 340 birim/sn. Kaçarken yarı hız.
- Vurma menzili: yumruklu 470, bıçaklı 425, kaptan ~537 birim.
- Saldırı: yumruklu 1–3 vuruşluk kombo, bıçaklı/kaptan 1–2. Kombo sonrası 0.6–1.4 sn bekler. Vuruş süreleri: uzak kol 0.5 sn, yakın kol 0.62 sn, bıçak/dipçik 0.66 sn.
- Kaptan: ~1075–1900 birim uzaktayken nişan alıp ateş eder (nişandan 0.6 sn sonra), ateşler arası 1–2 sn.
- Kancacı: 2100 birim içindeyse kanca atar. Kanca takılırsa 15 hasar, çekerken her 0.5 sn 1 hasar. Oyuncuyu 420 birim yakınlığa (yumruk mesafesi) çekip bırakır; 610 birime kadar 2–3 vuruşluk yumruk atar.
- Düşman içine girilince biraz geri gider; geri giderken de vurabildiği an normal vurur.
- Canı ilk kez %25 altına düşen korsan bir kez kaçar (10 sn ya da 4 vuruş), canı %50'ye doğru dolar. Kaçarken saldırı pozu yok: kollar aşağı sarkık, bel hafif bükük, aksayarak gider. Kaptan kaçmaz.
- Yere düşme 0.45 sn, kalkış 1.0 sn sürer.

- Ölen (ve parçalanan) düşman siyah beyaz çizilir; yere düşüp yaşayan renkli kalır.
- Cesetler kalıcı: ölen düşman yere yatınca (1.2 sn) ya da yırtılan yarı yere yatıp durunca bir kez siyah beyaz resme çevrilir (`CESET`, korsan.js `cesetYap`/`parcaYap`) ve düşman listesinden silinir. Sonra sadece ekrandayken tek resim çizilir: güncelleme/poz/filtre yok. En çok 150 ceset (eskisi silinir). Önizlemede ceset kalmaz.

- Sersem (parry, Yere Düşürme ölümü %15, Dağıtıcı ölümü; `e.ser`): yıldızlı sersem yüzü (`parca/X_ser.webp`) ve olduğu yerde yalpalama (baş/gövde sallanır, kollar sarkık, dizler çöker).
- Sersemletme / itme / yere düşürme eşikleri (10 üstü) yeteneksiz ölümlerden gelen düz hasar bonusu (`AG.cip`) hariç hasara bakar: bonus yüzünden düz 5'lik yumruk/tekme sersemletmez.
- Kaptan da sersemler: diğerlerinin yarı şansıyla, yarı süresiyle (parry %50 / 0.75 sn, Yere Düşürme ölümü %2.5 / 0.65 sn, Dağıtıcı ölümü %50 / 0.65 sn).
- Baygın (yerde) ya da sersemken vurulsa da baygın/sersem yüz kalır; vurulma yüzüne geçmez.
## Zıpkın (`js/zipkin.js`)
- Kamera uzaklığı: `ZOOM` 1.0. Ekranın altında zeminin en fazla 285 birim altı görünür (ön tahtanın dibi görünmez); zoom değişince alt sabit kalır, üste açılır.
- Ekranda sadece can barı, yön/zıplama tuşları, ıspanak ve zıpkın düğmesi ve sağ üstte menü (ayarlar) düğmesi var. Menü açıkken oyun durur; içinde ses efektleri, müzik, eğim sensörü (+dengele), tam ekran, dil, kombolar, yetenekler, devam ve sürüm. Ses/müzik ayarı kayıtlı (`pf_ayar`). Düşman sayacı ekranda yok.
- Sol alttaki zıpkın butonu (ıspanak butonunun karşısı, sola gitme tuşunun üstü; PC'de X) zıpkın modunu açar/kapar. Şimdilik enerji harcamaz, yetenek ağacında değil.
- Zıpkın iki kolda (tabanca ölçeği 0.855), ikisi de aynı çalışır. Ekrana basınca parmağı olmayan kol (yer/yön fark etmez; önce zıpkını dışarıda olmayan, sonra ön kol) basılan yere atar; bu parmak o zıpkını çeker/salar. İki kol da tutuluyorsa basılan parmak sallar (yana kaydır). Zıpkın tutulurken tekme bölgesi tekme atmaz. Parmak kalkınca takılı zıpkın 0.5 sn daha asılı kalır, sonra kopar (asılıyken zıplama hemen bırakır).
- Zıpkın modunda kamera uzaklaşır (ZOOM_ZPK 0.625), ekranın altı sabit kalır, fazlası üste açılır; mod kapanınca normal zoom (0.75).
- Takılabilen her şey: düşman (yerde yatan dahil), varil, kazıklar (ön/arka), sokak lambaları, iskele tahtası, evler (görselin dolu pikseline), gökyüzü (zeminden 250 birim yukarısı havada takılır). Su: zıpkın uçar, geri sarılır.
- Uçuş hızı 7500, geri sarma 6500, halat en uzun 4500, en kısa 260 birim.
- Parmak basılı = halat tutuluyor; parmak kalkınca 0.5 sn sonra halat bırakılır, zıpkın geri sarılır. Halattan havada bırakınca savrulma hızı 1.5 sn korunur.
- Nesneye takılınca: çekme ekseni atışta sabitlenir (hedef yanda ise yatay, üstte/altta ise dikey). İlk parmağı hedefin tersine kaydırdıkça (yeri önemsiz; sağdaysa sola, üstteyse aşağı) halat o kadar kısalır, hedefe doğru kaydırdıkça uzar (ZP_IP 1.3). Sadece takıldıktan sonraki parmak hareketi sayılır. Hızlı geri çekme fiskesi (0.1 sn'de en az 110 px ve 2800 px/sn) = çapaya fırla (3000). Halat gergin ve sarkaç gibi. Asılıyken zıplama = halatı bırakıp sıçrar. Eğim/sol-sağ tuşları da sallar.
- Düşmana saplanınca zıpkın 10 sn düşmana saplanamaz (etrafa takılır); buton ıspanak gibi dolar, kalan saniyeyi yazar, aç/kapa çalışır.
- Düşmana saplanma 20 hasar (kaptana 10, kafasına 3 kat). Düşman iki eliyle mızrağı tutar, çırpınır, saldıramaz. Parmağı kendine çek = düşmanı çek (400 birime kadar; oyuncu uzaklaşınca da sürüklenir), hızlı geri fiske = kendine savurur (yanına yüzüstü kapaklanır), düşmana doğru hızlı fiske = mızrağı kopar. Kaptan tutmaz, mızrak 0.45 sn sonra çıkar. Aynı düşmana ikinci zıpkın: hasar verir, hemen çıkar.
- Yerde yatan düşmana saplanma 20 hasar; hızlı çekince çekilen yöne havaya fırlar, düşünce yine yatar.
- Varil: geri çek = sürükle, hızlı geri fiske = kendine fırlatır (yoldaki düşmana çarpar).
- Sesler: `ses/zipkin_obje.mp3` (nesneye), `ses/zipkin_insan.mp3` (insana). Görseller: `parca/z_dolu` (mızraklı tabanca), `z_bos`, `z_mizrak`, `z_ip` (halat, uç uca), `ui/btn_zipkin`.

## XP ve seviye
- Düşman XP'si SABİT (cana bağlı değil): yumruklu 15, bıçaklı 10, kancalı 20, tabancalı kadın 15, boss 200. Her bölüm geçince hepsi ×1.5 (`XPK()` dusman_kur.js; boss 200→300→450); can/atak artışından bağımsız. Yırtarak öldürme +%50.
- Seviye 1→2 için 100 XP, sonraki her seviye %25 fazla (`XP_ILK`, `XP_ART` yetenek.js). Her seviye 1 puan; can ve enerji dolar; seviye sesi (`ses/levelup.mp3`).
- Kayıtta oyuncunun TOPLAM XP'si tutulur (`pf_agac2.top`). Seviye/puan her açılışta toplamdan hesaplanır: XP_ILK düşürülürse oyuncular daha çok seviye atlamış olur, yükseltilirse seviye düşer. Puan eksiye düşerse son açılan yetenekler kapanır, puanı geri döner.

## Hasarlar (oyuncunun)
- Yumruk kombo: ara vuruşlar 5, son vuruş 5×n+5. Serbest kol vuruşu 15. Bıçak modunda vuruşlar 2 kat (bıçak vuruşu 20, sersemletmez).
- Tekmeler (kombo): 6–18. Kombo kayar tekmesi (yyt) havada bacaklar açık yapılır, iki ayak da vurur (arkadaki ayak arkadaki düşmana). Kayar tekme 15 (%50 yere serer). Döner tekme 50. Yere tekme (uçan tekme) her düşmana bir kullanımda bir kez 15 (iniş sarsıntısı aynı düşmana tekrar vurmaz). Kombo 30 (yyyyyt) bitişi: havada 6 tekme (2 orta, 2 daha yukarı-ileri, 2 en yukarı-ileri), 30 hasar 6×5 olarak bölünür; 1.33 sn sürer, karakter tekme başına 70 birim ilerler ve her isabet düşmanı aynı miktar iter (mesafe sabit kalır).
- Ateşli aparkat 32. Süpermen uçuşu 50. Aduket 50. Yer yarma (yarık) 40. Süper kahraman inişi 50 (yer sarsıntısı).
- Dağıtıcı (alkış, eski adı Alkış Şok Dalgası) 30: geri savurur, %50 yere düşürür (kaptan ve kancacı hariç).
- Tutup fırlatma 4–40 (hıza göre); düşman varil gibi el hızıyla uçar, varilin yarı mesafesi (en yüksek hız ~2300). Varil fırlatma 15–50; varil en yüksek hız 3250. Fırlayan düşman başkasına çarparsa 10–35.
- Yırtma: anında öldürür (enerji = düşmanın kalan canı).
- Yere Düşürme yeteneği: 10 üstü vuruşlar %25 ihtimalle düşmanı yere düşürür.

## Yetenek ağacı (`js/yetenek.js` YET) — parantez içi puan
Her zaman açık: yumruk kombo, tekme, blok. Diğerleri ağaçtan puanla (1–3) açılır; komşusu açık olmalı.
- C Yumruk (kök, 0) · I Yere Düşürme (1, pasif) · O Can Dolumu %2 (1, pasif) · X Can Dolumu %3 (1, pasif) · W Kalkanlı Savunma (2, pasif) · V Maks. Can +100 (1, pasif) · TOP Ispanak Cebi (2; 30 sn'de bir ıspanak butonu, ıspanak gücü x2)
- A İnsan Tutma (1) · B Varil Tutma (1) · G Sıkı Tutuş (1, pasif; tutulan kafa atamaz) · F Yırtma (2) · R Can Çalmalı Yırtma (3; Yırtma açılmadan açılmaz) · H Can Çalma %10 (1, pasif) · M Can Çalma %20 (1, pasif)
- N Yer Yumruğu / yarık (2) · S Süpermen Uçuşu (2) · Y Aduket (2)
- D Çift Zıplama (1) · K Çok Zıplama (1, pasif) · E Kayar Tekme (1) · L Döner Tekme (2) · U Süper Kahraman İnişi (2) · Q Tekmeyle Can Çalma (1, pasif)
- J Ateşli Aparkat (1) · AL Dağıtıcı (2) · YT Yere Tekme (1)
- P Bıçak Modu (2) · T Bıçakla Can Çalma (1, pasif) · Z Bıçak Atlama (3)
- Aktif yetenek açılınca kendi sesi çalar. Sesi olmayan aktifler: Süpermen Uçuşu, Dağıtıcı.
- Aduket: dönen su girdabı (`fx/aduket_su`), dönerken iki yana su damlası (`fx/damla`) saçar. Oluşurken `ses/wateraduket.mp3` döngüde çalar, atınca kesilir; çarpınca `ses/aduket_carpma.mp3`.

- Ağaçta yetenek açma: dokun = bilgi/önizleme, 1 sn basılı tut = açılır (simge dönerek renklenir, bırakınca dolum boşalır).

## Ekran barı (`hud.js`)
- Çerçeve `ui/bar_cerceve.webp`; soldaki yuvarlak XP ile alttan (dalgalı) dolar, dolunca seviye atlar, parlayıp boşalır. Üstte tek kalp `ui/kalp_tek.webp`: lub-dub atar, can azaldıkça hızlanır; can dolarken kalp sesiyle güçlü atar; ölünce durur. Barlarda ve XP yuvarlağında bombeli cam efekti.

## Düşman yaraları (`js/dyara.js`)
- Vuruldukça canıyla orantılı yara (en çok 36), sadece ten yerlerinde (gövde, üst/ön kol; ızgara `dyara_veri.js`); can dolunca azalır. Kaptanda ten yok, yara çıkmaz. Yara görselleri sadece y4–y11 havuzundan. Yumruklu korsanın göğüs altındaki gölgeli çizgiye yara gelmez.

## Skill öldürme (kodda anti; `js/anti.js`, `AG.anti`, `YA(k)`)
- Arayüzde "Öldür" denir. Öldürünce `ses/skill_oldur.mp3` çalar, değişiklik 2 sn görünür, sonra oyun başlar. Öldürme ekranında simgeler renkli, çeper griden kırmızıya yavaş geçer; yazıda önce öldürülmüş hali, sonra eski ad üstü çizili. Normal ağaçta skill yazısının sonunda ölüm hali üstü çizili.
- Kalpli kol ağaçta hep görünür: dokununca güncel maks. can ve toplam ceza/bonus yazar; sadece ölüm seçiminde 2 sn basılı tutunca seçilir (maks. can 100 ise seçilemez; 110'dayken "son" uyarısı yazar, verince "VERECEK BAŞKA CANIN KALMADI!" çıkar; maks. can 100'e inince kalpli kolun arkasında kan lekesi görünür).
- Öldürülecek skill yok ve maks. can 100 iken ölüm: OYUN BİTTİ, her şey sıfırlanır (XP, seviye, skill'ler, öldürülenler, cezalar).
- Hiç verilmiş yetenek yokken ölünce: maks. can -10 (en az 100), her vuruşa +1 düz hasar; her ölümde birikir (`AG.cip`, kayıtlı).
- Ölünce verilmiş (Yumruk hariç, henüz çevrilmemiş) yetenek varsa 1.3 sn sonra ağaç zorunlu seçimle açılır, kapatılamaz; yeteneğe dokun = anti metni (önce anti, yanında orijinal; yazı yana kaydırılır), 1 sn basılı tut = çevrilir, oyun yeniden başlar. Sağ üstteki kalpli kol (`ui/kalpkol.webp`): skill öldürmek yerine maks. can -10, +1 hasar (dokun = açıklama, 1 sn basılı = seçer). Çevrilen yetenek kapalı sayılır (YV false), ağaçta simgenin altında kan lekesi (`ui/kanleke.webp`). Kayıt `pf_agac2.anti`.
- O: can dolumu bonusu yok (pasif %1 dolum kalır), öldürünce düşmanın maks. canının %10'u kadar can (boss dahil) · X: can dolumu bonusu yok (pasif dolum kalır), can %25 altında hasar +%50 · W: blokta dolum yok, blok %75 engeller · V: +100 can yerine +100 maks. enerji (ENMAX) · TOP: ıspanak 2 kat sık düşer · I: vuruş %5 sersemletir (1.3 sn)
- H: +%20 saldırı · M: her vuruş +2 enerji · Q: tekme itmesi +%30 · T: bıçak hasarı +%20 · R: yırtma enerjisi yarı
- A: koşarken (max hızın %70'i) düşmana yaklaşınca %25 şansla omuz atma: önce omuz hamlesi (öne çapraz eğilme, arka bacak kalkar), 0.14 sn sonra 25 hasar, uzağa fırlatıp yere serer · B: tekme varili top gibi uçurur; tekmelenen varil kırılmaz (seker, yuvarlanır, hacıyatmaz gibi hep dik durur, tekrar tekmelenebilir), sadece düşmana çarpınca kırılır · G: vuruşlar %20 daha hızlı (vuruşlar arası bekleme kısalır), yumruk hasarı -%10 · F: canı %20 altındaki tek yumrukla ölür
- D: havada ileri hız 2x · K: +1 havada zıplama (D açıksa 3 zıplama) · E: koşu +%20 · U: yüksekten inişte (380 üstü) taş patlaması: hasar (yükseklik-300)/40, 3–25; alan 450–1100
- N: çömelik yumruk 2x · S: havadaki vuruşlar +%50 · Y: yumruk menzili +80 birim, yumruk hasarı +%30 · L: her 3. tekme kritik (2x) · J: her vuruş %5 şansla yakar (yumrukla olduysa yumruk alev alır, alev hareketin gerisine savrulur): 4 sn, 0.5 sn'de bir düz vuruşun (5 + ölüm bonusu) yarısı; ateş efekti hafif/saydam · AL: blok/parry yapınca 900 içindeki düşmanlar sersemler · YT: yerde yatana 2x · P: yumruk %25 kanatır (4 sn, 0.5 sn'de 3) · Z: bıçak modunda yana kaydırma = bumerang bıçak (25 enerji, 30 hasar, gidiş-dönüş)

## Bölüm
- Düz zemin, karlı. Yürüme, zıplama, iniş, kayma, çift ayak/tek ayak yere inişte kar-taş sıçraması yok (sadece yere yumruk/yarık sıçratır). 7 varil (x: 2600, 6300, 12400, 18000, 24200, 28600, 34000). Boss x=42000.

## Arayüz ve dil
- Arayüz varsayılan İngilizce. Tüm yazılar `js/dil.js` `DILLER` içinde (en, tr); kod `dil('anahtar')` ile alır, HTML `data-l` / `data-lh` / `data-la`. Yeni dil = `DILLER`'e yeni blok. Sağ üstte 🌐 dil butonu dilleri sırayla değiştirir, seçim kaydedilir (`pf_dil`), anında değişir.
- Oyun arkaya düşünce (sekme, uygulama, ekran kilidi) tüm sesler susar, dönünce devam eder.
- Kombo listesi butonu hep renkli (aktif) görünür. Ispanak cebi butonu basar basmaz çalışır (yürürken de).

## Kontroller (dokunmatik)
- Sağ yarı ön kol, sol yarı arka kol: kaydırınca kol o yöne gider. Telefon eğimi = yürüme, geri silkme = zıplama.
- Eğimle yürüme: 3.5° altı durur, ~8°'ye kadar yavaş yürür, 20°'de tam koşu. Ekranı kendine yatırınca eğilir, bir daha yatırınca kalkar.
- Butonlar: sol/sağ (solda), çömel/zıpla (sağda), ıspanak cebi, zıpkın (sol altta, sola gitme tuşunun üstü), yetenek ağacı, kombo listesi.
- İki parmak birlikte aşağı (yerde) = yer yumruğu; blokta iki parmak aşağı = bıçak modu.
- İki parmak aynı yöne yatay = süpermen. Zıt yöne (açılarak) = döner tekme. Ortaya doğru = alkış (Dağıtıcı).
- Havada tek parmak hızlı aşağı = yere tekme (çekilen yöne); iki parmak aşağı = süper kahraman inişi.
- Çok hızlı yukarı = ateşli aparkat. Kol 0.5 sn aşağıda = eğilip ıspanak alma.

## Yaralar (`js/yara.js`)
- Can azaldıkça gövde, kollar ve pantolona rastgele yara görselleri (`yara/y1-16`) basılır; her yeni oyunda yerleşim yeniden rastgele. Üst üste gelmez, eklem halkalarına, dövmeye ve göğsün alt çizgisine değmez. Yerleşen yara sayısı N (~50) ise her HPMAX/N can kaybında (~5 can) bir yara görünür; can dolunca ters sırayla kaybolur.
- y1-2 sadece pantolonda (bacak başına en çok 2-4), y5/y9 yara bandı (sabit boy, %30), diğerleri deride büyüklü küçüklü. Gövde artık hep temiz `govde0` + yaralar; yüz eskisi gibi can kademesiyle değişir.

## Bölüm 2+ düşmanları (v0.388)
- 1. bölüm boss: eski kaptan (can 500, XP 200). 2. bölümden itibaren boss: kılıç ustası (erkek, `sk:'m'`, `agil`): can 750, yakın dövüş 22 (kaptanın 1.5 katı), yürüyüş ×1.35, saldırı süreleri ×0.75. Vurulunca %38 şansla geri takla/geri sıçrama, sonra öne atılıp vurur; saldırıdan sonra havaya sıçrar; eğilir, bazı saldırılardan kaçar ("KAÇTI!"). `usta.js`.
- Tabancalı kadın (`sk:'f'`, 2. bölümden): can 100, atak 20, orta hız; kaptan mermisi/ateşi küçültülmüş (0.55/0.5), namlu ucundan çıkar.
- Tutma kuralı: `TUTMA()` (yetenek.js) — A İnsan Tutma, B Varil Tutma, G Sıkı Tutuş, F Yırtma, R Can Çalmalı Yırtma'dan biri VERİLİP anti'ye çevrilmemişse (aktifken) tutma çalışır; bu 5 yeteneğin şu anki anti (ölü) etkilerinin hiçbirinde tutma geçmiyor, o yüzden ölüyken tutma çalışmaz (ileride bir anti metni tutmadan bahsederse koda eklenmeli); yetenekler birbirinin önkoşulu değil.
- TEST: O tuşu 1 yetenek puanı verir (sonra silinecek).
- Yere iniş seslerinin (wooddusme, inis_*) başındaki sessizlik `bosKes()` ile kesilir.

## v0.389 düzeltmeler
- Yarık (Yer Yumruğu, N): her kullanım artık aynı düşmana kesin bir kez vurur (`ozel.js` çatlak başına `Set`).
- Tabancalı kadın (f): el ataması düzeltildi (tabanca öndeki kolda, `gunNear`), eller kolun ön katmanında çizilir (`eo`).
- Kılıç ustası boss (m): bacaklar %20 büyük, gövde 20 birim yukarı alındı (`bs:1.2`, `bel:468.3`); kollar düz duruşa alındı (bıçaklı gard açısı artık uygulanmıyor).
- Zemin görseli değişti (kumlu toprak), dağ %25 daha küçültüldü (`DAG_BOY` 4600→3450).
