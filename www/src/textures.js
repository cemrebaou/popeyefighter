// Geçici (taslak) görseller kodla üretilir.
// Gerçek görseller gelince BootScene'de this.load.image / spritesheet ile aynı anahtarlarla yüklenir,
// bu dosyadaki üretim o anahtar için otomatik atlanır.

const Taslak = {
  ciz(scene, anahtar, w, h, fn) {
    if (scene.textures.exists(anahtar)) return;
    const tex = scene.textures.createCanvas(anahtar, w, h);
    const c = tex.getContext();
    fn(c, w, h);
    tex.refresh();
  },

  hepsi(scene) {
    const K = AYAR.KARE;

    // Oyuncunun görünmez fizik gövdesi (görünen karakter 'popeye' atlasından gelir)
    Taslak.ciz(scene, 'govde', AYAR.GOVDE_G, AYAR.GOVDE_Y, () => {});

    // Düşman: 44x40
    Taslak.ciz(scene, 'dusman', 44, 40, (c) => {
      c.fillStyle = '#6a1b9a'; c.beginPath(); c.ellipse(22, 22, 21, 17, 0, 0, Math.PI * 2); c.fill();
      c.fillStyle = '#fff'; c.fillRect(10, 14, 9, 9); c.fillRect(26, 14, 9, 9);
      c.fillStyle = '#000'; c.fillRect(13, 17, 4, 5); c.fillRect(29, 17, 4, 5);
      c.fillStyle = '#3d0d5c'; c.fillRect(6, 34, 12, 6); c.fillRect(26, 34, 12, 6);
    });

    // Zemin
    Taslak.ciz(scene, 'zemin', K, K, (c, w, h) => {
      c.fillStyle = '#8d5a2b'; c.fillRect(0, 0, w, h);
      c.fillStyle = '#7a4c23'; c.fillRect(6, 18, 10, 6); c.fillRect(28, 32, 12, 6);
    });
    Taslak.ciz(scene, 'zemin_ust', K, K, (c, w, h) => {
      c.fillStyle = '#8d5a2b'; c.fillRect(0, 0, w, h);
      c.fillStyle = '#4caf50'; c.fillRect(0, 0, w, 12);
      c.fillStyle = '#388e3c'; c.fillRect(0, 10, w, 4);
    });
    // Blok
    Taslak.ciz(scene, 'blok', K, K, (c, w, h) => {
      c.fillStyle = '#b0703a'; c.fillRect(0, 0, w, h);
      c.strokeStyle = '#6d3f17'; c.lineWidth = 3; c.strokeRect(1.5, 1.5, w - 3, h - 3);
      c.beginPath(); c.moveTo(0, h / 2); c.lineTo(w, h / 2); c.moveTo(w / 2, 0); c.lineTo(w / 2, h / 2); c.stroke();
    });
    // Tek yönlü platform
    Taslak.ciz(scene, 'platform', K, 16, (c, w, h) => {
      c.fillStyle = '#a1887f'; c.fillRect(0, 0, w, h);
      c.fillStyle = '#6d4c41'; c.fillRect(0, h - 4, w, 4); c.fillRect(w - 3, 0, 3, h);
    });
    // Diken
    Taslak.ciz(scene, 'diken', K, K, (c, w, h) => {
      c.fillStyle = '#cfd8dc';
      for (let i = 0; i < 3; i++) {
        const x = i * (w / 3);
        c.beginPath(); c.moveTo(x, h); c.lineTo(x + w / 6, h * 0.35); c.lineTo(x + w / 3, h); c.fill();
      }
    });
    // Para
    Taslak.ciz(scene, 'para', 24, 24, (c) => {
      c.fillStyle = '#ffca28'; c.beginPath(); c.arc(12, 12, 11, 0, Math.PI * 2); c.fill();
      c.fillStyle = '#ff8f00'; c.fillRect(10, 6, 4, 12);
    });
    // Checkpoint
    Taslak.ciz(scene, 'kontrol', 32, 96, (c) => {
      c.fillStyle = '#5d4037'; c.fillRect(13, 0, 6, 96);
      c.fillStyle = '#9e9e9e'; c.fillRect(19, 4, 13, 22);
    });
    Taslak.ciz(scene, 'kontrol_aktif', 32, 96, (c) => {
      c.fillStyle = '#5d4037'; c.fillRect(13, 0, 6, 96);
      c.fillStyle = '#43a047'; c.fillRect(19, 4, 13, 22);
    });
    // Bölüm sonu bayrağı
    Taslak.ciz(scene, 'bayrak', 48, 144, (c) => {
      c.fillStyle = '#eceff1'; c.fillRect(20, 0, 6, 144);
      c.fillStyle = '#e53935'; c.beginPath(); c.moveTo(26, 6); c.lineTo(48, 18); c.lineTo(26, 30); c.fill();
    });
    // Kalp
    Taslak.ciz(scene, 'kalp', 28, 26, (c) => {
      c.fillStyle = '#e53935';
      c.beginPath(); c.moveTo(14, 25);
      c.bezierCurveTo(-6, 10, 4, -4, 14, 7);
      c.bezierCurveTo(24, -4, 34, 10, 14, 25); c.fill();
    });
    Taslak.ciz(scene, 'kalp_bos', 28, 26, (c) => {
      c.strokeStyle = '#ffffff'; c.lineWidth = 2;
      c.beginPath(); c.moveTo(14, 24);
      c.bezierCurveTo(-5, 10, 4, -3, 14, 8);
      c.bezierCurveTo(24, -3, 33, 10, 14, 24); c.stroke();
    });
    // Arka plan tepeleri (parallax)
    Taslak.ciz(scene, 'tepe_uzak', 512, 200, (c, w, h) => {
      c.fillStyle = 'rgba(70,110,150,0.55)';
      c.beginPath(); c.moveTo(0, h);
      for (let x = 0; x <= w; x += 8) c.lineTo(x, h - 90 - Math.sin(x / w * Math.PI * 2) * 50 - Math.sin(x / 40) * 6);
      c.lineTo(w, h); c.fill();
    });
    Taslak.ciz(scene, 'tepe_yakin', 512, 160, (c, w, h) => {
      c.fillStyle = 'rgba(60,140,80,0.75)';
      c.beginPath(); c.moveTo(0, h);
      for (let x = 0; x <= w; x += 8) c.lineTo(x, h - 60 - Math.sin(x / w * Math.PI * 4) * 30);
      c.lineTo(w, h); c.fill();
    });
    Taslak.ciz(scene, 'bulut', 160, 60, (c) => {
      c.fillStyle = 'rgba(255,255,255,0.9)';
      [[40, 36, 26], [75, 26, 30], [110, 36, 24], [80, 42, 26]].forEach(([x, y, r]) => { c.beginPath(); c.arc(x, y, r, 0, Math.PI * 2); c.fill(); });
    });
    // Toz efekti
    Taslak.ciz(scene, 'toz', 8, 8, (c) => {
      c.fillStyle = '#ffffff'; c.beginPath(); c.arc(4, 4, 4, 0, Math.PI * 2); c.fill();
    });
    // Dokunmatik butonlar
    Taslak.ciz(scene, 'buton', 96, 96, (c) => {
      c.fillStyle = 'rgba(255,255,255,0.22)'; c.beginPath(); c.arc(48, 48, 46, 0, Math.PI * 2); c.fill();
      c.strokeStyle = 'rgba(255,255,255,0.6)'; c.lineWidth = 3; c.stroke();
    });
  }
};
