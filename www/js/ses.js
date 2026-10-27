'use strict';
// Sesler (WebAudio), titreşim
let AC=null,SFXG=null,MUZG=null;
const AYAR={ses:true,muz:true};try{Object.assign(AYAR,JSON.parse(localStorage.getItem('pf_ayar')||'{}'))}catch(_){}      // menü ayarları: ses efektleri, müzik
function ayarKaydet(){try{localStorage.setItem('pf_ayar',JSON.stringify(AYAR))}catch(_){}sesSeviye()}
function sesSeviye(){if(SFXG)SFXG.gain.value=AYAR.ses?1:0;if(MUZG)MUZG.gain.value=AYAR.muz?1:0}
const SFXC=()=>SFXG||AC.destination,MUZC=()=>MUZG||AC.destination;      // efekt / müzik çıkışı (menüden kapatılır)
function sesAc(){
  if(!AC){try{AC=new(window.AudioContext||window.webkitAudioContext)();SFXG=AC.createGain();SFXG.connect(AC.destination);MUZG=AC.createGain();MUZG.connect(AC.destination);sesSeviye()}catch(_){return}}
  sesYukle();
  if(AC.state==='suspended'&&!document.hidden)AC.resume();
}
function arkaPlanSes(){if(!AC)return;if(document.hidden){if(AC.state==='running')AC.suspend()}else if(AC.state==='suspended')AC.resume()}      // oyun arkaya düşünce (sekme, uygulama, ekran kilidi) tüm sesler susar
document.addEventListener('visibilitychange',arkaPlanSes);addEventListener('pagehide',()=>{if(AC&&AC.state==='running')AC.suspend()});addEventListener('pageshow',arkaPlanSes);
['pointerdown','keydown','touchstart','click'].forEach(ev=>addEventListener(ev,sesAc,{passive:true}));
const SES_SON={};
let ENPOS=[],SWD=null,YAR=null,HAZ=null,PAT=null,PPAR=null,SAPLA=null,SYUK=false,AD_SON=0,EMER=[],EFL=[];      // HAZ/PAT: kaptanın nişan ve ateş sesi, PPAR: yırtma, SAPLA: bıçak saplanma; EMER: düşman mermileri, EFL: namlu ateşi
const PB=[],PBAG=[],AD=[],ADBAG=[],TK=[],TKBAG=[],KLC=[],WH=[],WHBAG=[],JP=[];let JPBAG=[],JPSON=-1;      // yumruk, adım, tekme, bıçak sesleri (torba: hepsi bir kez çalınmadan aynısı tekrar gelmez)
const TD=[],TDBAG=[],DMR=[],DMRBAG=[];let TCS=null,GOS=null,GOH=null,ZPS_O=null,ZPS_I=null;      // ZPS_O / ZPS_I: zıpkın nesneye / insana saplanma      // GOS: kaybedince (game over), GOH: kanca bize takılınca      // varil: tahta parçası yere düşme, demir halka, ilk kırılma sesi
const BLD=[],BLDBAG=[],INS=[],INSBAG=[],OLS={};let WDS=null,TVS=null,OLDS=null,ADKS=null,ADKC=null,LVS=null,KALPS=null,BOPEN=null,USTS=null,GRS=null,DSS=null,DEVS=null,ARK=null,ARKSRC=null;      // bıçak vuruşu, yere iniş, ölüm (k/b/p/h), üstüne atlama, tutma, düşman düşmesi, arka plan müziği
function arkaCal(){      // arka plan deniz sesi: döngü; her kopyanın son 0.5 sn'sinde bir sonraki başlar, üst üste binerek geçer (atlama duyulmaz)
  if(!AC||!ARK||ARKSRC)return;ARKSRC=true;
  const D=ARK.duration,X=0.5,g=AC.createGain();g.gain.value=0.35;g.connect(MUZC());let t=AC.currentTime+0.05;
  const bas=t0=>{const s=AC.createBufferSource(),f=AC.createGain();s.buffer=ARK;s.connect(f);f.connect(g);
    f.gain.setValueAtTime(0,t0);f.gain.linearRampToValueAtTime(1,t0+X);f.gain.setValueAtTime(1,t0+D-X);f.gain.linearRampToValueAtTime(0,t0+D);s.start(t0);s.stop(t0+D+0.05)};
  const sira=()=>{if(t<AC.currentTime)t=AC.currentTime+0.05;bas(t);t+=D-X;setTimeout(sira,Math.max(200,(t-AC.currentTime-2)*1000))};
  sira();
}
function bufCal(buf,v){if(!AC||!buf||DEMO)return;const src=AC.createBufferSource(),g=AC.createGain();src.buffer=buf;g.gain.value=v||1;src.connect(g);g.connect(SFXC());src.start()}
function torbaCal(L,B,v){if(!L.length)return;if(!B.length)B.push(...L.keys());bufCal(L[B.splice(Math.floor(Math.random()*B.length),1)[0]],v)}
function sesYukle(){
  if(SYUK||!AC)return;SYUK=true;
  const y=(ad,al)=>fetch('ses/'+ad+'.mp3').then(r=>r.arrayBuffer()).then(b=>AC.decodeAudioData(b)).then(al).catch(e=>console.warn('Ses yüklenemedi: ses/'+ad+'.mp3',e));
  for(let i=1;i<=29;i++)y('woodfoot_'+i,b=>AD.push(b));      // tahta iskele adım sesleri (herkes için, torba ile rastgele)
  for(let i=1;i<=6;i++)y('kick_'+i,b=>TK.push(b));
  for(const i of [1,5,6,7])y('punch_'+i,b=>PB.push(b));
  y('blade',b=>SWD=b);y('gameover',b=>GOS=b);y('zipkin_obje',b=>ZPS_O=b);y('zipkin_insan',b=>ZPS_I=b);y('getoverhere',b=>GOH=b);
  for(let i=1;i<=3;i++)y('kilic_'+i,b=>KLC.push(b));
  for(let i=1;i<=5;i++)y('whoosh_'+i,b=>WH.push(b));
  for(let i=1;i<=3;i++)y('jump_'+i,b=>JP.push(b));      // sallama (boşta da dolu da): yumruk, tekme, bıçak
  for(const n of ['blade','blade_1','blade_2'])y(n,b=>BLD.push(b));for(const i of [1,2])y('inis_'+i,b=>INS.push(b));for(const k of ['k','b','p','h'])y('olum_'+k,b=>OLS[k]=b);
  y('ust_atla',b=>USTS=b);y('grap',b=>GRS=b);y('bladeopen',b=>BOPEN=b);y('dusme',b=>DSS=b);y('devrilses',b=>DEVS=b);y('deniz',b=>{ARK=b;arkaCal()});      // arka plan: deniz sesi
  y('tahta_carpma',b=>TCS=b);for(let i=1;i<=4;i++)y('tahta_dus_'+i,b=>TD.push(b));
  y('spinach-drop',b=>ISPS=b);y('levelup',b=>LVS=b);y('skill_oldur',b=>OLDS=b);y('tahtavurma',b=>TVS=b);y('wooddusme',b=>WDS=b);      // havadan tahtaya düşmey('wateraduket',b=>ADKS=b);y('aduket_carpma',b=>ADKC=b);y('kalpsesi',b=>KALPS=b);y('yemeses',b=>YEMS=b);
  y('parcalanma',b=>PPAR=b);y('yarildi',b=>YAR=b);y('sapla',b=>SAPLA=b);y('mermi_haz',b=>HAZ=b);y('mermi_patla',b=>PAT=b);
}
function ziplaCal(){            // zıplama sesi: torba sırası, peş peşe iki zıplama (ilk ve ikinci) asla aynı ses olmaz
  if(!AC||AC.state!=='running'||!JP.length)return;
  if(!JPBAG.length)JPBAG=[...JP.keys()];
  let c=JPBAG.filter(i=>i!==JPSON);if(!c.length)c=JPBAG;
  const i=c[Math.floor(Math.random()*c.length)];JPBAG.splice(JPBAG.indexOf(i),1);JPSON=i;bufCal(JP[i],0.8);
}
function savurCal(x){            // sallama sesi: herkes için; uzaktakiler daha kısık
  if(!AC||AC.state!=='running')return;
  const g0=kisit(1-Math.abs(x-S.x)/4500,0,1);if(g0<0.04)return;
  torbaCal(WH,WHBAG,0.8*g0);
}
function adimCal(x,g=1){            // ayak basış sesi; uzaktakiler daha kısık; g: ağırlık (kaptan daha gür)
  if(!AC||AC.state!=='running')return;
  const n=AC.currentTime;if(n-AD_SON<0.05)return;
  const g0=kisit(1-Math.abs(x-S.x)/4500,0,1);if(g0<0.04)return;AD_SON=n;
  torbaCal(AD,ADBAG,Math.min(1,0.2*g0*g));
}
function ses(tip){              // tip: 'yumruk' | 'tekme' | 'parca'; aynı anda çok vuruş = tek ses (düğüm yığılmasın)
  if(!AC||AC.state!=='running')return;
  const n=AC.currentTime;if(n-(SES_SON[tip]||-1)<0.045)return;SES_SON[tip]=n;
  if(tip==='parca')bufCal(PPAR,1);else torbaCal(tip==='tekme'?TK:PB,tip==='tekme'?TKBAG:PBAG,0.95);
}
let TITRE_SON=0;
function titre(ms){if(DEMO)return;const n=performance.now();if(n-TITRE_SON<60)return;TITRE_SON=n;try{if(navigator.vibrate)navigator.vibrate(ms)}catch(_){}}
