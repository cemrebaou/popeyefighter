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
    a_menu:'Menu', m_baslik:'MENU', m_ses:'Sound effects', m_muz:'Music', m_sens:'Tilt sensor', m_kal:'Calibrate', m_tam:'Fullscreen', m_dil:'Language', m_kombo:'Combos', m_yet:'Skills', m_devam:'Resume', ag_gerek:' · unlock {0} first',
    ag_bil:'LEVEL {0} · XP {1}/{2} · POINTS {3}', ag_acik:' (UNLOCKED)', ag_puan:' · {0} points', ag_dokun:' · tap again to unlock', ag_yetmez:' · not enough points', ag_once:' · unlock a neighbour first',
    yet_C:'Punch', yet_I:'Knockdown (hits have a 25% chance to knock enemies down)', yet_O:'Health Regen 2%', yet_X:'Health Regen 3%', yet_W:'Shield Guard (health refills while blocking)', yet_V:'Max Health +100',
    yet_TOP:'Spinach Pocket (a spinach every 30 s, spinach power x2)', yet_A:'Grab Enemy', yet_B:'Grab Barrel (barrels drop spinach 50% of the time)', yet_G:'Tight Grip (held enemy can\'t headbutt)',
    yet_F:'Tear Apart', yet_R:'Life-Steal Tear (at least 50 HP)', yet_H:'Life Steal 10%', yet_M:'Life Steal 20%',
    yet_N:'Ground Punch', yet_S:'Superman Flight', yet_Y:'Aduket', yet_D:'Double Jump', yet_E:'Slide Kick', yet_L:'Spin Kick', yet_U:'Superhero Landing',
    yet_K:'Super Jump (+25%)', yet_Q:'Kick Life Steal (+10% on kicks)', yet_J:'Flaming Uppercut', yet_AL:'Clap Shockwave (two fingers to the middle: 30 damage, pushes back, 50% knockdown)',
    yet_YT:'Ground Kick (in the air, swipe one finger diagonally down)', yet_P:'Blade Mode', yet_T:'Blade Life Steal (+20% on blade hits)', yet_Z:'Blade Leap',
    cip_pop:'-10 MAX HP · +1 DAMAGE', kalp_bil:'Keep your skills: -10 max health, +1 damage on every hit', olum_etiket:'DEATH: {0}', kalp_dur:'Max health now {0} · total -{1} health · +{2} damage', kalp_son:' · max health is 50: no more', tam_son:'GAME OVER', tam_pop:'EVERYTHING RESET', ag_tut:' · hold 1 s to choose', anti_bas:'YOU DIED! Pick a skill to kill (required)', anti_sec:' · tap again to swap', anti_yok:' · cannot be killed', anti_etiket:'KILLED: {0}', sersem:'STUNNED!', kanama:'BLEED',
    anti_O:'Regen bonus off; every kill heals 10% of the enemy\'s max health', anti_X:'Regen bonus off; below 25% health your damage is +50%', anti_W:'No regen while blocking; block stops 75% of damage', anti_V:'+100 health gone; +100 max energy',
    anti_TOP:'Spinach power x2 gone; spinach drops twice as often', anti_I:'Knockdown gone; every hit has a 5% chance to stun', anti_H:'Life steal gone; +20% attack power', anti_M:'Life steal gone; every hit gives +2 energy',
    anti_Q:'Kick life steal gone; kicks knock back 30% farther', anti_T:'Blade life steal gone; blade damage +20%', anti_R:'Life steal gone; tearing costs half the energy',
    anti_A:'Grab gone; running into an enemy has a 25% chance of a powerful shoulder charge that knocks it down', anti_B:'Barrel grab gone; kick barrels like a ball', anti_G:'Thrown enemies deal 2x on impact and fly farther', anti_F:'Tear gone; enemies under 20% health die to one punch',
    anti_D:'Double jump gone; 2x forward speed while jumping', anti_K:'High jump gone; gives a double jump (3 jumps with Double Jump)', anti_E:'Slide gone; running speed +20%', anti_U:'Landing attack gone; landing from high bursts rocks: up to 25 damage, bigger area the higher you fall',
    anti_N:'Ground punch gone; crouching punches deal 2x', anti_S:'Superman gone; all hits in the air +50% damage', anti_Y:'Aduket gone; punch range +30% and punch damage +30%', anti_L:'Spin kick gone; every 3rd kick is a critical',
    anti_J:'Uppercut gone; every hit has a 5% chance to set the enemy on fire (4 s)', anti_AL:'Clap gone; blocking/parrying stuns nearby enemies', anti_YT:'Ground kick gone; all hits on downed enemies deal 2x', anti_P:'Blade mode gone; punches have a 25% chance to cause bleeding', anti_Z:'Blade leap gone; in blade mode swipe sideways to throw a boomerang blade'
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
    a_menu:'Menü', m_baslik:'MENÜ', m_ses:'Ses efektleri', m_muz:'Müzik', m_sens:'Eğim sensörü', m_kal:'Dengele', m_tam:'Tam ekran', m_dil:'Dil', m_kombo:'Kombolar', m_yet:'Yetenekler', m_devam:'Devam', ag_gerek:' · önce {0} açılmalı',
    ag_bil:'SEVİYE {0} · XP {1}/{2} · PUAN {3}', ag_acik:' (AÇIK)', ag_puan:' · {0} puan', ag_dokun:' · açmak için tekrar dokun', ag_yetmez:' · puan yetmiyor', ag_once:' · önce yanındakini aç',
    yet_C:'Yumruk', yet_I:'Yere Düşürme (vuruşlar %25 şansla düşmanı yere düşürür)', yet_O:'Can Dolumu %2', yet_X:'Can Dolumu %3', yet_W:'Kalkanlı Savunma (blokta can hemen dolar)', yet_V:'Maks. Can +100',
    yet_TOP:'Ispanak Cebi (30 sn\'de bir ıspanak, ıspanak gücü x2)', yet_A:'İnsan Tutma', yet_B:'Varil Tutma (varillerden %50 şansla ıspanak düşer)', yet_G:'Sıkı Tutuş (tutulan kafa atamaz)',
    yet_F:'Yırtma', yet_R:'Can Çalmalı Yırtma (en az 50 can)', yet_H:'Can Çalma %10', yet_M:'Can Çalma %20',
    yet_N:'Yer Yumruğu', yet_S:'Süpermen Uçuşu', yet_Y:'Aduket', yet_D:'Çift Zıplama', yet_E:'Kayar Tekme', yet_L:'Döner Tekme', yet_U:'Süper Kahraman İnişi',
    yet_K:'Çok Zıplama (+%25)', yet_Q:'Tekmeyle Can Çalma (tekmeye +%10)', yet_J:'Ateşli Aparkat', yet_AL:'Alkış Şok Dalgası (iki parmak ortaya: 30 hasar, geri savurur, %50 yere düşürür)',
    yet_YT:'Yere Tekme (havada tek parmak aşağı çapraz çek)', yet_P:'Bıçak Modu', yet_T:'Bıçakla Can Çalma (bıçağa +%20)', yet_Z:'Bıçak Atlama',
    cip_pop:'-10 MAKS. CAN · +1 HASAR', kalp_bil:'Skillerin kalsın: maks. can -10, her vuruşa +1 hasar', olum_etiket:'ÖLÜM: {0}', kalp_dur:'Şu an maks. can {0} · toplam -{1} can · +{2} hasar', kalp_son:' · maks. can 50: artık olmaz', tam_son:'OYUN BİTTİ', tam_pop:'HER ŞEY SIFIRLANDI', ag_tut:' · seçmek için 1 sn basılı tut', anti_bas:'ÖLDÜN! Öldürmek için bir skill seç (zorunlu)', anti_sec:' · değiştirmek için tekrar dokun', anti_yok:' · öldürülemez', anti_etiket:'ÖLDÜR: {0}', sersem:'SERSEMLEDİ!', kanama:'KANAMA',
    anti_O:'Can dolumu bonusu iptal; öldürünce düşmanın maks. canının %10\'u kadar can', anti_X:'Can dolumu bonusu iptal; can %25 altındayken hasar +%50', anti_W:'Blokta can dolmaz; blok hasarın %75\'ini engeller', anti_V:'+100 can gider; +100 maks. enerji',
    anti_TOP:'Ispanak gücü x2 gider; ıspanak 2 kat sık düşer', anti_I:'Yere düşürme gider; her vuruş %5 şansla sersemletir', anti_H:'Can çalma gider; +%20 saldırı gücü', anti_M:'Can çalma gider; her vuruş +2 enerji',
    anti_Q:'Tekmeyle can çalma gider; tekmeler %30 daha uzağa savurur', anti_T:'Bıçakla can çalma gider; bıçak hasarı +%20', anti_R:'Can çalma gider; yırtmanın enerji maliyeti yarıya düşer',
    anti_A:'Tutma gider; koşarken düşmana çarpınca %25 şansla çok güçlü omuz atıp yere serer', anti_B:'Varil tutma gider; variller tekmeyle top gibi uçar', anti_G:'Fırlatılan düşman çarptığına 2x vurur ve daha uzağa uçar', anti_F:'Yırtma gider; canı %20 altındaki düşman tek yumrukla ölür',
    anti_D:'Çift zıplama gider; zıplarken ileri hız 2x', anti_K:'Yüksek zıplama gider; çift zıplama gelir (Çift Zıplama varsa 3 zıplama)', anti_E:'Kayma gider; koşu hızı +%20', anti_U:'İniş saldırısı gider; yüksekten inince taşlar fışkırır: yüksekliğe göre en çok 25 hasar, alan büyür',
    anti_N:'Yer yumruğu gider; çömelik yumruklar 2x', anti_S:'Süpermen gider; havadaki tüm vuruşlar +%50', anti_Y:'Aduket gider; yumruk menzili +%30, yumruk hasarı +%30', anti_L:'Döner tekme gider; her 3. tekme kritik',
    anti_J:'Aparkat gider; her vuruş %5 şansla düşmanı yakar (4 sn)', anti_AL:'Alkış gider; blok/parry yapınca çevredeki düşmanlar sersemler', anti_YT:'Yere tekme gider; yerde yatana tüm vuruşlar 2x', anti_P:'Bıçak modu gider; yumruklar %25 şansla kanatır', anti_Z:'Bıçak atlama gider; bıçak modunda yana kaydırınca bumerang bıçak fırlatır'
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
