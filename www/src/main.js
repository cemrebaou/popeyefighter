// Oyunu başlatır.
const oyun = new Phaser.Game({
  type: Phaser.AUTO,
  parent: 'oyun',
  backgroundColor: '#000000',
  pixelArt: false,
  scale: {
    // EXPAND: yükseklik sabit (540), telefonun en-boy oranına göre genişlik uzar -> kenarlarda siyah boşluk kalmaz
    mode: Phaser.Scale.EXPAND !== undefined ? Phaser.Scale.EXPAND : Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: AYAR.GENISLIK,
    height: AYAR.YUKSEKLIK
  },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { x: 0, y: AYAR.YERCEKIMI },
      debug: AYAR.DEBUG_FIZIK,
      tileBias: 32
    }
  },
  input: { activePointers: 4 },
  scene: [BootScene, GameScene, UIScene]
});
