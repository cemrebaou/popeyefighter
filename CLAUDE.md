# Popeye Fighter – proje notları

Mobil yan kaydırmalı dövüş oyunu. Canvas 2D; kod `www/js/*.js` dosyalarına bölünmüş (modül yok, hepsi ortak global kapsamda, `index.html`deki sırayla yüklenir). Kullanıcı Türkçe yazar.

## Çalışma kuralları (her değişiklikte)
- Cevaplar kısa, Türkçe; istenmeyeni anlatma. Kopyalanacak şey kod bloğunda. İndirme isteniyorsa link ver.
- Kod değişikliği: Edit ile küçük düzenleme yap; dosyanın tamamını okuma, Grep ile ilgili yere git.
- Her değişiklikte ekrandaki sürümü artır: `OYUN_SURUM` (`js/ayar.js`) ve `index.html`deki tüm `?v=` (js/css) değerlerini aynı sürüme getir. Biçim `v0.XXX` (v0.264 → v0.265 …). Görsel/ses değişirse `SURUM='?v=..'` de artır.
- Değişiklikleri görsele bakmadan (ekran görüntüsü/görsel inceleme yok) yap; hata olursa kullanıcı söyler.
- Kullanıcının verdiği tüm görseller: ortalanmış, sağa bakan, düz duran çizimler. Buna göre hizala/kullan.
- `node --check` ile söz dizimi kontrolü yap. Oyunu açıp test etme, ekran görüntüsü alma (özel görsel durum hariç). APK/AAB/Actions build yok.
- Her değişiklikten sonra `main`e push et. Önce GitHub'da yerelden yeni sürüm var mı bak, varsa çek.
- Commit yazarı `Claude <noreply@anthropic.com>`; commit sonuna sistemin verdiği Co-Authored-By ve Claude-Session satırlarını ekle.
- İstekleri liste yap: kullanıcı peş peşe iş söylerse sadece sonuncuyu tekrarla; push gerektiren iş veya ses/görsel gelince listeyi birlikte yap.
- Test linki: https://raw.githack.com/cemrebaou/popeyefighter/main/www/index.html

## Dosya yapısı
- `www/index.html` sadece HTML iskeleti + script sırası. Stil: `www/css/oyun.css`.
- `js/ayar.js` sürüm, görsel yükleyici, sabitler, `S` · `girdi.js` klavye/tuşlar/sensör/kol sürükleme · `el.js` el konumu/hızı, `DUS`, `MERMI`
- `ozel.js` özel hareketler (pençe, süpermen, yarık, alkış, blok…) · `mermi.js` aduket, kaptan mermisi · `dusman_kur.js` düşman yerleşimi, `yeniOyun`
- `ses.js` sesler · `efekt.js` kar, fx, kan · `savas.js` vuruş/tutma/yırtma, `dusmanGuncelle` · `korsan.js` korsan AI, `KSK`, `KPZ`, korsan çizimi
- `hud.js` ekran yazıları · `kombo.js` `HAREKET`, kombo ağacı/listesi · `oyuncu.js` oyuncu pozu ve çizimi · `dongu.js` arka plan, `ciz`, `dongu` (en son yüklenir)
- Yeni dosyada en üstte `'use strict';`. Yükleme anında çalışan kod sadece kendinden önceki dosyalardaki şeyleri kullanabilir. `www/parca|fx|yuz|ui/*.webp` görseller, `www/ses/*.mp3`, `www/font/*.woff2` (yerel fontlar).
- Görseller WebP. Yükleyici `yukle()`; önbellek `SURUM`.

## Kodda başlıca yerler (Grep ile bul)
- `KSK` korsan başına görsel/eklem tablosu: k yumruk, b bıçak, p tabanca (kaptan/patron), h kanca adam.
- `KPZ`, `korsanPoz`, `ciziKorsan` poz ve çizim. `korsanAI` düşman yapay zekâsı (`acd` ateş/saldırı, `mcd` yakın dövüş).
- `S` oyuncu durumu; `PK()` pençe modu 2x hasar, `PENCE_EL`; `hasarKat/hasarCiz` 11 hasar modeli arası geçiş.
- Efekt: `karAt`, `tasSac`, `fxEkle/fxCiz`, `patlat`, yarık `catlakGuncelle/catlakCiz/yerYumrukVur`.
- Ses: `savurCal`, `ziplaCal`, `adimCal(x,g)`.
- Döngü: `dongu`, dt üst sınırı 0.05.
- Arka plan: dağ `fx/dag`, zemin `fx/yol`, ağaçlar `AGAC[0..7]`.
- Bıçak modu (`S.pence`): `penceVur` saplamalar (`HAREKET` pd/pa/pu/py), `yerdekineAtla`/`ustGuncelle`/`ustKalk` yerdekinin üstüne atlama (`S.ust`), turuncu parlama `dongu.js` shadow.

## Görsel parça standardı (yeni karakter)
- Her parça aynı boyutlu karede (örn. 500x500), arka plan saydam, parça hep sağa bakar, bağlantı noktası karede sabit yerde.
- Aynı karakterin parçaları aynı ölçekte. Kenar boşlukları script ile kesilir, ofset tabloya yazılır.

## Yapılacaklar
- (boş)
