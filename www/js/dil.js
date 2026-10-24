'use strict';
// Dil sistemi: arayüzdeki tüm yazılar burada. Kod yazıları dil('anahtar') ile alır; HTML'de data-l (yazı), data-lh (HTML), data-la (aria-label).
// Yeni dil eklemek: DILLER'e yeni bir blok ekle (ör. de:{ad:'Deutsch', ...}); eksik anahtar İngilizceden gelir. Dil butonu dilleri sırayla değiştirir, seçim kaydedilir.
// {0}, {1}… yer tutuculardır: dil('lv_up',5,2) → "LEVEL 5! +2 POINTS"
const DILLER={
  en:{ad:'EN',
    yuk:'LOADING…', yuk_hata:'Could not load image: {0}',
    ipucu:'← → walk &nbsp; ↑ jump &nbsp; J punch &nbsp; K kick &nbsp; H superman &nbsp; G claws &nbsp; B spin kick &nbsp; N ground punch/hero landing &nbsp; M slide &nbsp; ↓ crouch &nbsp; <b>tap right/left half: combo &nbsp; drag: right half front arm, left half back arm</b>',
    a_asa:'crouch', a_sol:'left', a_sag:'right', a_zipla:'jump', a_kombo:'combo list', a_agac:'skill tree', a_isp:'spinach pocket', a_zpk:'harpoon', a_dil:'language',
    sens:'🎮 SENSOR: {0}', sens_kapali:'OFF', sens_acik:'ON', sens_izin:'NO PERMISSION', sens_haz:'GET READY… (hold neutral)', sens_veri:'NO DATA',
    dengele:'⟲ Calibrate', tam:'⛶ Fullscreen', tam_yok:'⛶ Not supported',
    dusman:'enemies: {0}', enerji_yok:'NO ENERGY', enerji_yetmedi:'NOT ENOUGH ENERGY!',
    boss_bar:'CAPTAIN — hit his head (shoryuken / aduket)', boss_geldi:'CAPTAIN!',
    tamam:'STAGE CLEAR!', yenildin:'DEFEATED', tekrar:'tap the screen to play again',
    parry:'PARRY!', krit:'CRIT -{0}', can_pop:'+{0} HP', xp_pop:'+{0} XP', lv_up:'LEVEL {0}! +{1} POINTS',
    ag_bil:'LEVEL {0} · XP {1}/{2} · POINTS {3}', ag_acik:' (UNLOCKED)', ag_puan:' · {0} points', ag_dokun:' · tap again to unlock', ag_yetmez:' · not enough points', ag_once:' · unlock a neighbour first',
    yet_C:'Punch', yet_I:'Knockdown (hits have a 25% chance to knock enemies down)', yet_O:'Health Regen 2%', yet_X:'Health Regen 3%', yet_W:'Shield Guard (health refills while blocking)', yet_V:'Max Health +100',
    yet_TOP:'Spinach Pocket (a spinach every 30 s, spinach power x2)', yet_A:'Grab Enemy', yet_B:'Grab Barrel (barrels drop spinach 50% of the time)', yet_G:'Tight Grip (held enemy can\'t headbutt)',
    yet_F:'Tear Apart', yet_R:'Life-Steal Tear (at least 50 HP)', yet_H:'Life Steal 10%', yet_M:'Life Steal 20%',
    yet_N:'Ground Punch', yet_S:'Superman Flight', yet_Y:'Aduket', yet_D:'Double Jump', yet_E:'Slide Kick', yet_L:'Spin Kick', yet_U:'Superhero Landing',
    yet_K:'Super Jump (+25%)', yet_Q:'Kick Life Steal (+10% on kicks)', yet_J:'Flaming Uppercut', yet_AL:'Clap Shockwave (two fingers to the middle: 30 damage, pushes back, 50% knockdown)',
    yet_YT:'Ground Kick (in the air, swipe one finger diagonally down)', yet_P:'Blade Mode', yet_T:'Blade Life Steal (+20% on blade hits)', yet_Z:'Blade Leap'
  },
  tr:{ad:'TR',
    yuk:'YÜKLENİYOR…', yuk_hata:'Görsel yüklenemedi: {0}',
    ipucu:'← → yürü &nbsp; ↑ zıpla &nbsp; J yumruk &nbsp; K tekme &nbsp; H süpermen &nbsp; G pençe &nbsp; B dönen tekme &nbsp; N yer yumruğu/süper iniş &nbsp; M kayma &nbsp; ↓ çömel &nbsp; <b>sağ/sol yarıya tık tık: kombo &nbsp; sürükle: sağ yarı ön kol, sol yarı arka kol</b>',
    a_asa:'eğil', a_sol:'sol', a_sag:'sağ', a_zipla:'zıpla', a_kombo:'kombo listesi', a_agac:'yetenek ağacı', a_isp:'ıspanak cebi', a_zpk:'zıpkın', a_dil:'dil',
    sens:'🎮 SENSÖR: {0}', sens_kapali:'KAPALI', sens_acik:'AÇIK', sens_izin:'İZİN YOK', sens_haz:'HAZIRLAN… (nötr tut)', sens_veri:'VERİ YOK',
    dengele:'⟲ Dengele', tam:'⛶ Tam ekran', tam_yok:'⛶ Desteklenmiyor',
    dusman:'düşman: {0}', enerji_yok:'ENERJİ YOK', enerji_yetmedi:'ENERJİ YETMEDİ!',
    boss_bar:'KAPTAN — kafasına vur (shoryuken / aduket)', boss_geldi:'KAPTAN!',
    tamam:'BÖLÜM TAMAM!', yenildin:'YENİLDİN', tekrar:'tekrar oynamak için ekrana dokun',
    parry:'PARRY!', krit:'KRİTİK -{0}', can_pop:'+{0} CAN', xp_pop:'+{0} XP', lv_up:'SEVİYE {0}! +{1} PUAN',
    ag_bil:'SEVİYE {0} · XP {1}/{2} · PUAN {3}', ag_acik:' (AÇIK)', ag_puan:' · {0} puan', ag_dokun:' · açmak için tekrar dokun', ag_yetmez:' · puan yetmiyor', ag_once:' · önce yanındakini aç',
    yet_C:'Yumruk', yet_I:'Yere Düşürme (vuruşlar %25 şansla düşmanı yere düşürür)', yet_O:'Can Dolumu %2', yet_X:'Can Dolumu %3', yet_W:'Kalkanlı Savunma (blokta can hemen dolar)', yet_V:'Maks. Can +100',
    yet_TOP:'Ispanak Cebi (30 sn\'de bir ıspanak, ıspanak gücü x2)', yet_A:'İnsan Tutma', yet_B:'Varil Tutma (varillerden %50 şansla ıspanak düşer)', yet_G:'Sıkı Tutuş (tutulan kafa atamaz)',
    yet_F:'Yırtma', yet_R:'Can Çalmalı Yırtma (en az 50 can)', yet_H:'Can Çalma %10', yet_M:'Can Çalma %20',
    yet_N:'Yer Yumruğu', yet_S:'Süpermen Uçuşu', yet_Y:'Aduket', yet_D:'Çift Zıplama', yet_E:'Kayar Tekme', yet_L:'Döner Tekme', yet_U:'Süper Kahraman İnişi',
    yet_K:'Çok Zıplama (+%25)', yet_Q:'Tekmeyle Can Çalma (tekmeye +%10)', yet_J:'Ateşli Aparkat', yet_AL:'Alkış Şok Dalgası (iki parmak ortaya: 30 hasar, geri savurur, %50 yere düşürür)',
    yet_YT:'Yere Tekme (havada tek parmak aşağı çapraz çek)', yet_P:'Bıçak Modu', yet_T:'Bıçakla Can Çalma (bıçağa +%20)', yet_Z:'Bıçak Atlama'
  }
};
let DIL='en';
try{const d=localStorage.getItem('pf_dil');if(d&&DILLER[d])DIL=d}catch(_){}
function dil(k,...a){let s=(DILLER[DIL]&&DILLER[DIL][k]!=null)?DILLER[DIL][k]:DILLER.en[k]!=null?DILLER.en[k]:k;a.forEach((v,i)=>{s=s.split('{'+i+'}').join(v)});return s}
const DIL_DIN=[];      // dil değişince yeniden yazılacak dinamik yazılar (sensör butonu, ağaç bilgisi…)
function dilUygula(){
  document.documentElement.lang=DIL;
  document.querySelectorAll('[data-l]').forEach(el=>{el.textContent=dil(el.dataset.l)});
  document.querySelectorAll('[data-lh]').forEach(el=>{el.innerHTML=dil(el.dataset.lh)});
  document.querySelectorAll('[data-la]').forEach(el=>{el.setAttribute('aria-label',dil(el.dataset.la))});
  const b=document.getElementById('dilB');if(b)b.textContent='🌐 '+dil('ad');
  DIL_DIN.forEach(f=>{try{f()}catch(_){}});
}
function dilSec(d){if(!DILLER[d])return;DIL=d;try{localStorage.setItem('pf_dil',d)}catch(_){}dilUygula()}
function dilSonraki(){const k=Object.keys(DILLER);dilSec(k[(k.indexOf(DIL)+1)%k.length])}
document.getElementById('dilB').addEventListener('click',dilSonraki);
dilUygula();
