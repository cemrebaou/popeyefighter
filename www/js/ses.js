'use strict';
// Sesler (WebAudio), titreşim
let AC=null;
function sesAc(){
  if(!AC){try{AC=new(window.AudioContext||window.webkitAudioContext)()}catch(_){return}}
  sesYukle();
  if(AC.state==='suspended')AC.resume();
}
['pointerdown','keydown','touchstart','click'].forEach(ev=>addEventListener(ev,sesAc,{passive:true}));
const SES_SON={};
let ENPOS=[],SWD=null,YAR=null,YARS=null,HAZ=null,PAT=null,PPAR=null,SAPLA=null,SYUK=false,AD_SON=0,EMER=[],EFL=[];      // HAZ/PAT: kaptanın nişan ve ateş sesi, PPAR: yırtma, SAPLA: bıçak saplanma; EMER: düşman mermileri, EFL: namlu ateşi
const PB=[],PBAG=[],AD=[],ADBAG=[],TK=[],TKBAG=[],KLC=[],WH=[],WHBAG=[],JP=[];let JPBAG=[],JPSON=-1;      // yumruk, adım, tekme, bıçak sesleri (torba: hepsi bir kez çalınmadan aynısı tekrar gelmez)
const TD=[],TDBAG=[],DMR=[],DMRBAG=[];let TCS=null;      // varil: tahta parçası yere düşme, demir halka, ilk kırılma sesi
const BLD=[],BLDBAG=[],INS=[],INSBAG=[],OLS={};let KALPS=null,BOPEN=null,USTS=null,GRS=null,DSS=null,DEVS=null,ARK=null,ARKSRC=null;      // bıçak vuruşu, yere iniş, ölüm (k/b/p/h), üstüne atlama, tutma, düşman düşmesi, arka plan müziği
function arkaCal(){if(!AC||!ARK||ARKSRC)return;const src=AC.createBufferSource(),g=AC.createGain();src.buffer=ARK;src.loop=true;g.gain.value=0.35;src.connect(g);g.connect(AC.destination);src.start();ARKSRC=src}      // oyun boyunca döngüde
function bufCal(buf,v){if(!AC||!buf)return;const src=AC.createBufferSource(),g=AC.createGain();src.buffer=buf;g.gain.value=v||1;src.connect(g);g.connect(AC.destination);src.start()}
function torbaCal(L,B,v){if(!L.length)return;if(!B.length)B.push(...L.keys());bufCal(L[B.splice(Math.floor(Math.random()*B.length),1)[0]],v)}
function sesYukle(){
  if(SYUK||!AC)return;SYUK=true;
  const y=(ad,al)=>fetch('ses/'+ad+'.mp3').then(r=>r.arrayBuffer()).then(b=>AC.decodeAudioData(b)).then(al).catch(e=>console.warn('Ses yüklenemedi: ses/'+ad+'.mp3',e));
  for(let i=2;i<=6;i++)y('stepsnow_'+i,b=>AD.push(b));
  for(let i=1;i<=6;i++)y('kick_'+i,b=>TK.push(b));
  for(const i of [1,5,6,7])y('punch_'+i,b=>PB.push(b));
  y('blade',b=>SWD=b);
  for(let i=1;i<=3;i++)y('kilic_'+i,b=>KLC.push(b));
  for(let i=1;i<=5;i++)y('whoosh_'+i,b=>WH.push(b));
  for(let i=1;i<=3;i++)y('jump_'+i,b=>JP.push(b));      // sallama (boşta da dolu da): yumruk, tekme, bıçak
  for(const n of ['blade','blade_1','blade_2'])y(n,b=>BLD.push(b));for(const i of [1,2])y('inis_'+i,b=>INS.push(b));for(const k of ['k','b','p','h'])y('olum_'+k,b=>OLS[k]=b);
  y('ust_atla',b=>USTS=b);y('grap',b=>GRS=b);y('bladeopen',b=>BOPEN=b);y('dusme',b=>DSS=b);y('devrilses',b=>DEVS=b);y('arkaplansoguk2',b=>{ARK=b;arkaCal()});
  y('tahta_carpma',b=>TCS=b);for(let i=1;i<=4;i++)y('tahta_dus_'+i,b=>TD.push(b));
  y('spinach-drop',b=>ISPS=b);y('kalpsesi',b=>KALPS=b);y('yemeses',b=>YEMS=b);
  y('parcalanma',b=>PPAR=b);y('yarildi',b=>YAR=b);y('yarildi_sonra',b=>YARS=b);y('sapla',b=>SAPLA=b);y('mermi_haz',b=>HAZ=b);y('mermi_patla',b=>PAT=b);
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
function titre(ms){const n=performance.now();if(n-TITRE_SON<60)return;TITRE_SON=n;try{if(navigator.vibrate)navigator.vibrate(ms)}catch(_){}}
