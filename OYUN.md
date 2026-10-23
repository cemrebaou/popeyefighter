# Popeye Fighter – oyun notları (sayılar ve kurallar)

Kullanıcı oyunla ilgili bir şey sorunca önce buraya bak (koda girme). Oyunda bir değer/kural değişince bu dosyayı da güncelle.
Ölçü: kullanıcı mesafeleri Popeye'nin kafa boyuyla anlatır. Oyun birimi: oyuncu boyu ~850.

## Oyuncu
- Can: 250 (Maks. Can +100 yeteneğiyle 350). Can çubuğu yok; can kafa görselinden (11 hasar seviyesi) ve eğik çubuktan okunur.
- Can dolumu: 6 sn vurulmayınca saniyede max canın %2.5'i (Can Dolumu x2 / x3 yetenekleri). Kalkanlı Savunma: blokta da dolar. Dolarken kalp atar ve kalp sesi çalar.
- Enerji: max 250, saniyede 2.5 dolar (ıspanaktan sonra 10 sn 2 kat). Her özel güç 50 enerji. Bıçak modu saniyede 7.5 enerji yer.
- Ispanak: max canın %10'u + 50 enerji. Ispanak Cebi açıksa ikisi de 2 kat (yerden de cepten de). Düşman ölünce %25, varil kırılınca %50 (Varil Tutma ile) ıspanak düşer.
- Blok: iki parmak ekranda hareketsiz. Hasarın yarısı engellenir; ilk 0.5 sn içinde vurulursa PARRY (düşman sersemler).

## Düşmanlar
- k yumruklu korsan: 150 can, oyuncuya 10 hasar. b bıçaklı: 100 can, 15 hasar. h kancacı: 200 can, yürümez.
- Kaptan (boss): 500 can, 15 hasar; vuruşların yarısını alır, kafaya vuruş 3 kat (KRİTİK).
- Kancacı: kanca takılırsa 15 hasar, çekerken her 0.5 sn 1 hasar. Oyuncuyu 528 birim mesafeye kadar çekip bırakır; bu mesafenin %5 fazlasına kadar yumruk atar.
- Düşman içine girilince biraz geri gider; geri giderken de vurabildiği an normal vurur.
- Canı ilk kez %25 altına düşen korsan bir kez kaçar (10 sn ya da 4 vuruş), canı %50'ye doğru dolar.

## XP ve seviye
- XP: korsan 20, kaptan 250; parçalayarak (yırtarak) öldürme +%50.
- Seviye 1→2 için 300 XP, sonraki her seviye %25 fazla. Her seviye 1 puan; can ve enerji dolar; seviye atlama sesi (`ses/levelup.mp3`).

## Hasarlar (oyuncunun)
- Yumruk kombo: ara vuruşlar 5, son vuruş 5×n+5. Serbest kol vuruşu 15. Bıçak modunda vuruşlar 2 kat (bıçak vuruşu 20, sersemletmez).
- Tekmeler (kombo): 6–18. Kayar tekme 15 (%50 yere serer). Döner tekme 50. Yere tekme (uçan tekme) 15, inince küçük yer sarsıntısı.
- Ateşli aparkat 32. Süpermen uçuşu 50. Aduket 50. Yer yarma (yarık) 40. Süper kahraman inişi 50 (yer sarsıntısı).
- Alkış şok dalgası 30: geri savurur, %50 yere düşürür (kaptan ve kancacı hariç).
- Tutup fırlatma 4–40 (hıza göre). Varil fırlatma 15–50; varil en yüksek hız 3250. Fırlayan düşman başkasına çarparsa 10–35.
- Yırtma: anında öldürür (enerji = düşmanın kalan canı).
- Yere Düşürme yeteneği: 10 üstü vuruşlar %25 ihtimalle düşmanı yere düşürür.

## Yetenek ağacı (`js/yetenek.js` YET)
Her zaman açık: yumruk kombo, tekme, blok. Diğerleri ağaçtan puanla (1–3) açılır; komşusu açık olmalı.
- C Yumruk (kök) · I Yere Düşürme (pasif) · O/X Can Dolumu x2/x3 (pasif) · W Kalkanlı Savunma (pasif) · V Maks. Can +100 (pasif) · TOP Ispanak Cebi (30 sn'de bir ıspanak butonu, ıspanak gücü x2)
- A İnsan Tutma · B Varil Tutma · G Sıkı Tutuş (pasif) · F Yırtma · R Can Çalmalı Yırtma · H/M Can Çalma %10/%20 (pasif)
- N Yer Yumruğu (yarık) · S Süpermen Uçuşu · Y Aduket
- D Çift Zıplama · K Çok Zıplama (pasif) · E Kayar Tekme · L Döner Tekme · U Süper Kahraman İnişi · Q Tekmeyle Can Çalma (pasif)
- J Ateşli Aparkat · AL Alkış Şok Dalgası · YT Yere Tekme
- P Bıçak Modu · T Bıçakla Can Çalma (pasif) · Z Bıçak Atlama
- Aktif yetenek açılınca kendi sesi çalar. Sesi olmayan aktifler: Süpermen Uçuşu, Aduket, Alkış.

## Kontroller (dokunmatik)
- Sağ yarı ön kol, sol yarı arka kol: kaydırınca kol o yöne gider. Telefon eğimi = yürüme, geri silkme = zıplama.
- Butonlar: sol/sağ (solda), çömel/zıpla (sağda), ıspanak cebi, yetenek ağacı, kombo listesi.
- İki parmak birlikte aşağı (yerde) = yer yumruğu; blokta iki parmak aşağı = bıçak modu.
- İki parmak aynı yöne yatay = süpermen. Zıt yöne (açılarak) = döner tekme. Ortaya doğru = alkış.
- Havada tek parmak hızlı aşağı = yere tekme (çekilen yöne); iki parmak aşağı = süper kahraman inişi.
- Çok hızlı yukarı = ateşli aparkat. Kol 0.5 sn aşağıda = eğilip ıspanak alma.
