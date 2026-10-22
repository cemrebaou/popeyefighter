# Popeye Fighter – proje notları

Mobil yan kaydırmalı dövüş oyunu. Tek dosya canvas 2D: `www/index.html` (~1900 satır). Kullanıcı Türkçe yazar.

## Çalışma kuralları (her değişiklikte)
- Cevaplar kısa, Türkçe; istenmeyeni anlatma. Kopyalanacak şey kod bloğunda. İndirme isteniyorsa link ver.
- Kod değişikliği: Edit ile küçük düzenleme yap; dosyanın tamamını okuma, Grep ile ilgili yere git.
- Her değişiklikte ekrandaki sürümü artır: `OYUN_SURUM` (index.html). Görsel/ses değişirse `SURUM='?v=..'` de artır.
- `node --check` ile söz dizimi kontrolü yap. Oyunu açıp test etme, ekran görüntüsü alma (özel görsel durum hariç). APK/AAB/Actions build yok.
- Her değişiklikten sonra `main`e push et. Önce GitHub'da yerelden yeni sürüm var mı bak, varsa çek.
- Commit yazarı `Claude <noreply@anthropic.com>`; commit sonuna sistemin verdiği Co-Authored-By ve Claude-Session satırlarını ekle.
- İstekleri liste yap: kullanıcı peş peşe iş söylerse sadece sonuncuyu tekrarla; push gerektiren iş veya ses/görsel gelince listeyi birlikte yap.
- Test linki: https://raw.githack.com/cemrebaou/popeyefighter/main/www/index.html

## Dosya yapısı
- `www/index.html` oyun kodu. `www/parca|fx|yuz|ui/*.webp` görseller, `www/ses/*.mp3`, `www/font/*.woff2` (yerel fontlar).
- Görseller WebP. Yükleyici `yukle()`; önbellek `SURUM`.

## Kodda başlıca yerler (Grep ile bul)
- `KSK` korsan başına görsel/eklem tablosu: k yumruk, b bıçak, p tabanca (kaptan/patron), h kanca adam.
- `KPZ`, `korsanPoz`, `ciziKorsan` poz ve çizim. `korsanAI` düşman yapay zekâsı (`acd` ateş/saldırı, `mcd` yakın dövüş).
- `S` oyuncu durumu; `PK()` pençe modu 2x hasar, `PENCE_EL`; `hasarKat/hasarCiz` 11 hasar modeli arası geçiş.
- Efekt: `karAt`, `tasSac`, `fxEkle/fxCiz`, `patlat`, yarık `catlakGuncelle/catlakCiz/yerYumrukVur`.
- Ses: `savurCal`, `ziplaCal`, `adimCal(x,g)`.
- Döngü: `dongu`, dt üst sınırı 0.05.
- Arka plan: dağ `fx/dag`, zemin `fx/yol`, ağaçlar `AGAC[0..7]`.

## Görsel parça standardı (yeni karakter)
- Her parça aynı boyutlu karede (örn. 500x500), arka plan saydam, parça hep sağa bakar, bağlantı noktası karede sabit yerde.
- Aynı karakterin parçaları aynı ölçekte. Kenar boşlukları script ile kesilir, ofset tabloya yazılır.

## Yapılacaklar
- Kodu mantıklı dosyalara böl (ses, çizim, yapay zekâ, ayarlar), böylece değişiklikte hepsini okumak gerekmez.
