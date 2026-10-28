# Popeye Fighter – proje notları

Mobil yan kaydırmalı dövüş oyunu. Canvas 2D; kod `www/js/*.js` dosyalarına bölünmüş (modül yok, hepsi ortak global kapsamda, `index.html`deki sırayla yüklenir). Kullanıcı Türkçe yazar.

## Çalışma kuralları (her değişiklikte)
- Cevaplar kısa, Türkçe; istenmeyeni anlatma. Kopyalanacak şey kod bloğunda. İndirme isteniyorsa link ver.
- Kod değişikliği: Edit ile küçük düzenleme yap; dosyanın tamamını okuma, Grep ile ilgili yere git.
- Her değişiklikte ekrandaki sürümü artır: `OYUN_SURUM` (`js/ayar.js`, `'v0.XXX'`) ve `index.html`deki tüm `?v=0.XXX` (js/css; dikkat: `v0.` değil `v=0.`) değerlerini aynı sürüme getir. Biçim `v0.XXX` (v0.264 → v0.265 …). Görsel/ses değişirse `SURUM='?v=..'` de artır.
- Değişiklikleri görsele bakmadan (ekran görüntüsü/görsel inceleme yok) yap; hata olursa kullanıcı söyler.
- Kullanıcının verdiği tüm görseller: ortalanmış, sağa bakan, düz duran çizimler. Buna göre hizala/kullan.
- `node --check` ile söz dizimi kontrolü yap; ayrıca tüm js dosyalarını index.html sırasıyla birleştirip `node --check` et (dosyalar ortak global kapsamda: aynı adlı `const` başka dosyada varsa oyun boş açılır). Oyunu açıp test etme, ekran görüntüsü alma (özel görsel durum hariç). APK/AAB/Actions build yok.
- Her değişiklikten sonra `main`e push et. Önce GitHub'da yerelden yeni sürüm var mı bak, varsa çek.
- Her push'ta: değişen kuralları/değerleri ilgili .md'ye (OYUN.md, BOLUM.md, CLAUDE.md) de kaydet ve bekleyen yapılacaklar listesini de aynı push'ta yap (liste boşalsın).
- **KESİN KURAL:** Yapılacaklar listesinde bekleyen iş varsa, HERHANGİ bir şey push'a gittiğinde (ne olursa olsun, hangi dal olursa olsun) listedekilerin HEPSİ o push'ta yapılır. Listeyi yapmadan push etme.
- Commit yazarı `Claude <noreply@anthropic.com>`; commit sonuna sistemin verdiği Co-Authored-By ve Claude-Session satırlarını ekle.
- İstekleri liste yap: kullanıcı peş peşe iş söylerse sadece sonuncuyu tekrarla; push gerektiren iş veya ses/görsel gelince listeyi birlikte yap.
- Satır sonu açıklaması (`// ...`) eklerken arkasında kod kalmadığından emin ol: yorum, satırın devamındaki kodu (ör. `ctx.restore()`) yutar ve çizim bozulur (v0.364 hatası).
- Arayüz yazıları sadece `js/dil.js` `DILLER`'de (17 dil: en, tr + es hi pt fil id af ru ko ms it de el fr ar ur; yeni dil = yeni blok. Sonradan eklenen dillerde sadece kısa oyun içi/menü yazıları çevrili, yet_*/anti_*/ipucu/a_* İngilizceden gelir; yeni anahtar eklenince en+tr yeter, eksik anahtar İngilizceden düşer). Koda yeni yazı eklerken düz metin yazma, anahtar ekleyip `dil('anahtar')` kullan (HTML: `data-l`/`data-lh`/`data-la`). Yerel değişkene `dil` adı verme.
- Harita, yol, bölüm düzeni ve arka plan işlerinde önce `BOLUM.md`yi oku (2.5D derinlik, metroidvania geri dönüş, ileride gelecek zıpkınlı kanca).
- Oyunla ilgili sorular (canlar, hasarlar, XP, yetenekler, kontroller) için önce `OYUN.md`ye bak, koda girme. Bir değer/kural değişince `OYUN.md`yi de güncelle.
- Test linki: her push sonrası kullanıcıya sürüm numaralı linki ver: `https://raw.githack.com/cemrebaou/popeyefighter/main/www/index.html?v=XXX` (XXX = sürümün son 3 hanesi, örn. v0.322 → 322). Commit hash'li githack linkleri boş/mavi ekran verebiliyor, kullanma.

## Dosya yapısı
- `www/index.html` sadece HTML iskeleti + script sırası. Stil: `www/css/oyun.css`.
- `js/dil.js` (ilk yüklenir) dil sistemi `DILLER`, `dil()`, `dilSec()`, `DIL_DIN` · `js/ayar.js` sürüm, görsel yükleyici, sabitler, `S` · `girdi.js` klavye/tuşlar/sensör/kol sürükleme · `el.js` el konumu/hızı, `DUS`, `MERMI`
- `ozel.js` özel hareketler (pençe, süpermen, yarık, alkış, blok…) · `mermi.js` aduket, kaptan mermisi · `dusman_kur.js` düşman yerleşimi, `yeniOyun`
- `cevre.js` liman ön planı (tahta iskele, evler, nesneler, ön çalılar; `cevreArka`/`cevreOn`, görseller `www/cevre/`) · `ses.js` sesler · `efekt.js` kar, fx, kan · `savas.js` vuruş/tutma/yırtma, `dusmanGuncelle` · `korsan.js` korsan AI, `KSK`, `KPZ`, korsan çizimi
- `zipkin.js` zıpkın (iki kolda kanca tabancası, `ZPK`, `zpkHedef` neye takılır, `zpkTak` joystick/fiske, `zpkKisit` halat sarkacı, `zpkKorsanPoz` düşman elleri mızrakta; kurallar `OYUN.md` Zıpkın) · `yetenek.js` yetenek ağacı (`YET` düğümler [x,y,ikon,ad,puan], `YBAG` bağlar, `AG` seviye/XP/puan, `xpKazan`, `YV(k)` yetenek açık mı — hareketler bununla kilitli, `canCal` can çalma, `ispCep`; ikonlar `ui/ytN.webp`, ağaç `ui/agac.webp`) · `anti.js` anti yetenekler (ölünce zorunlu seçim, `YA(k)`, `antiHasar`/`antiVurSonra`/`antiGuncelle`/`antiCiz` ateş efekti, bumerang `BCK`; kurallar `OYUN.md`) · `dyara.js` düşman yaraları (`dyCiz`, ten ızgarası `dyara_veri.js`; oyuncu yarası `yrCiz` yara.js, `yaraCiz` efekt.js kesik yarası — adlar çakışmasın) · `hud.js` ekran yazıları, bar/XP yuvarlağı/kalp · `kombo.js` `HAREKET`, kombo ağacı/listesi · `oyuncu.js` oyuncu pozu ve çizimi · `demo.js` yetenek önizlemesi (ağaçta yeteneğe dokununca arkadaki oyunda hareket sessizce döngüyle oynar; `DEMOLAR`, başta tüm durum kaydedilir, ağaç kapanınca geri yüklenir; `DEMO` açıkken ses/titreşim/XP yok) · `menu.js` sağ üst menü (`menuAc`, `menuAcik`; ses/müzik `AYAR` ses.js'te, `SFXC()`/`MUZC()` çıkışları; sensör, tam ekran, dil, kombolar, yetenekler; görseller `ui/m_*.webp`) · `usta.js` kılıç ustası boss (`ustaBaslat/ustaKontrol`: takla, geri sıçrama, atılma, eğilme, kaçış) · `dongu.js` arka plan, `ciz`, `dongu` (en son yüklenir)
- Yeni dosyada en üstte `'use strict';`. Yükleme anında çalışan kod sadece kendinden önceki dosyalardaki şeyleri kullanabilir. `www/parca|fx|yuz|ui/*.webp` görseller, `www/ses/*.mp3`, `www/font/*.woff2` (yerel fontlar).
- Görseller WebP. Yükleyici `yukle()`; önbellek `SURUM`.

## Kodda başlıca yerler (Grep ile bul)
- `KSK` korsan başına görsel/eklem tablosu: k yumruk, b bıçak, p tabanca (kaptan/patron), h kanca adam, m kılıç ustası boss, f tabancalı kadın (`sk` anahtarı `kc`yi görünüşte ezer).
- `KPZ`, `korsanPoz`, `ciziKorsan` poz ve çizim. Ölü düşmanlar `cesetYap`/`parcaYap` ile bir kez resme çevrilir (`CESET`, `cesetCiz`): kalıcı, yüksüz. `korsanAI` düşman yapay zekâsı (`acd` ateş/saldırı, `mcd` yakın dövüş).
- `S` oyuncu durumu; `PK()` pençe modu 2x hasar, `PENCE_EL`; `hasarKat/hasarCiz` 11 hasar modeli arası geçiş.
- Efekt: `karAt`, `tasSac`, `fxEkle/fxCiz`, `patlat`, yarık `catlakGuncelle/catlakCiz/yerYumrukVur`.
- Ses: `savurCal`, `ziplaCal`, `adimCal(x,g)`.
- Döngü: `dongu`, dt üst sınırı 0.05.
- Arka plan: dağ `fx/dag`, zemin `fx/yol`, ağaçlar `AGAC[0..7]`.
- Bıçak modu (`S.pence`): `penceVur` saplamalar (`HAREKET` pd/pa/pu/py), `yerdekineAtla`/`ustGuncelle`/`ustKalk` yerdekinin üstüne atlama (`S.ust`), `dagAtla`/`dagGuncelle` ileri kaydırınca bıçaklı uçma (1 enerji, 50 hasar, ilk çarptığını serip üstüne çıkar), turuncu parlama `dongu.js` shadow.

## Görsel parça standardı (yeni karakter)
- Her parça aynı boyutlu karede (örn. 500x500), arka plan saydam, parça hep sağa bakar, bağlantı noktası karede sabit yerde.
- Aynı karakterin parçaları aynı ölçekte. Kenar boşlukları script ile kesilir, ofset tabloya yazılır.

## Yapılacaklar
- Kadın (f) elleri ters bağlı: sağ el solda, sol el sağda; ella, kolun ön katmanında.
- Kadın sol eli boş bekleme durumunda kolla paralel düz (şu an yukarı bükülü).
