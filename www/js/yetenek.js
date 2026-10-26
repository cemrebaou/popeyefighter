'use strict';
// Yetenek ağacı: düğümler ağaç görselindeki daire merkezlerinde (görsel px), ikon ui/ytN.webp. Kilitli = siyah-beyaz, açık = renkli.
// Açma: komşusu açık düğüm + yeteneğin puanı (1-3). Puan: XP ile seviye atlayınca (1→2 için 300 XP, sonraki her seviye %25 fazla, her seviye 1 puan).
// Ağaçta olmayanlar (yumruk kombo, tekme, blok) her zaman açık. YV(k): yetenek açık mı.
const AGW=2690,AGH=1468,AGX=29,AGY=29;      // ağaç görselinin kırpılmış alanı
const YET={      // [x, y, ikon, ad, puan, ikon boyutu (yoksa 1)]
  C:[1373,1399,0,'Yumruk',0],
  I:[1373,1111,21,'Yere Düşürme (vuruşlar %25 şansla düşmanı yere düşürür)',1],
  O:[1373,821,31,'Can Dolumu %2',1],X:[1576,486,31,'Can Dolumu %3',1],
  W:[1373,486,32,'Kalkanlı Savunma (blokta can hemen dolar)',2],V:[1171,487,26,'Maks. Can +100',1],
  TOP:[1373,125,18,'Ispanak Cebi (30 sn\'de bir ıspanak, ıspanak gücü x2)',2],
  A:[779,1397,3,'İnsan Tutma',1],B:[126,1399,20,'Varil Tutma (varillerden %50 şansla ıspanak düşer)',1],G:[487,1111,4,'Sıkı Tutuş (tutulan kafa atamaz)',1,0.8],
  F:[143,1055,5,'Yırtma',2],R:[330,628,28,'Can Çalmalı Yırtma (en az 50 can)',3],
  H:[869,1099,19,'Can Çalma %10',1],M:[616,859,19,'Can Çalma %20',1],
  N:[1088,876,8,'Yer Yumruğu',2],S:[915,593,7,'Süpermen Uçuşu',2],Y:[727,279,17,'Aduket',2],
  D:[1968,1397,16,'Çift Zıplama',1],E:[2621,1398,15,'Kayar Tekme',1],L:[2603,1055,29,'Döner Tekme',2],U:[2416,628,9,'Süper Kahraman İnişi',2],
  K:[2260,1111,33,'Çok Zıplama (+%25)',1,0.9],Q:[2158,858,35,'Tekmeyle Can Çalma (tekmeye +%10)',1],J:[1124,1253,30,'Ateşli Aparkat',1],AL:[1883,1098,36,'Alkış Şok Dalgası (iki parmak ortaya: 30 hasar, geri savurur, %50 yere düşürür)',2],YT:[1624,1253,37,'Yere Tekme (havada tek parmak aşağı çapraz çek)',1],
  P:[1659,876,6,'Bıçak Modu',2],T:[1824,593,34,'Bıçakla Can Çalma (bıçağa +%20)',1],Z:[2009,279,12,'Bıçak Atlama',3]
};
const YKOK='C';
const YBAG='C-A C-D C-I I-O O-N O-P O-V O-W O-X V-TOP W-TOP X-TOP A-B A-G A-H B-F F-G F-R R-M M-H G-H H-N N-S S-Y D-E D-K D-AL AL-P AL-Q AL-K C-J J-H C-YT YT-AL K-L L-E L-U U-Q P-T T-Z'.split(' ').map(s=>s.split('-'));
const YKOM={};for(const k in YET)YKOM[k]=[];for(const [a,b] of YBAG){YKOM[a].push(b);YKOM[b].push(a)}
// XP: oyuncunun TOPLAM XP'si saklanır (AG.top). Seviye, seviye içi XP ve puan her açılışta bu toplamdan hesaplanır;
// böylece XP_ILK / XP_ART değişirse seviye kendiliğinden artar ya da düşer, kazanılan XP boşa gitmez. Puan yetmezse son açılan yetenekler geri kapanır.
const XP_ILK=100,XP_ART=1.25;      // 1→2 için 100 XP, sonraki her seviye %25 fazla
const xpGerek=lv=>Math.round(XP_ILK*Math.pow(XP_ART,lv-1));
const AG={acik:new Set([YKOK]),anti:new Set(),cip:0,top:0,p:0,xp:0,lv:1};      // anti: ölünce zorunlu seçimle anti haline çevrilmiş yetenekler (açık sayılır ama etkisi tersine döner)
function agHesap(){      // toplam XP'den seviye, seviye içi XP ve harcanabilir puan
  let lv=1,x=AG.top;while(x>=xpGerek(lv)){x-=xpGerek(lv);lv++}
  AG.lv=lv;AG.xp=x;
  const harc=()=>{let h=0;for(const k of AG.acik)if(k!==YKOK)h+=YET[k]?YET[k][4]:0;return h};
  for(const k of [...AG.acik])if(!YET[k])AG.acik.delete(k);      // ağaçtan kalkmış yetenek
  for(const k of [...AG.anti])if(!AG.acik.has(k))AG.anti.delete(k);
  AG.p=(lv-1)-harc();
  while(AG.p<0){const son=[...AG.acik].filter(k=>k!==YKOK).pop();if(!son)break;AG.acik.delete(son);AG.p=(lv-1)-harc()}      // seviye düştüyse son açılanlar kapanır
}
try{const d=JSON.parse(localStorage.getItem('pf_agac2')||'null');if(d){AG.acik=new Set([YKOK,...(d.acik||[])]);AG.anti=new Set(d.anti||[]);AG.cip=d.cip|0;
  if(d.top!==undefined)AG.top=d.top|0;
  else{let t=d.xp|0;for(let l=1;l<(d.lv||1);l++)t+=Math.round(300*Math.pow(1.25,l-1));AG.top=t}}}catch(_){}      // eski kayıt (300'lük sistem): toplam XP'ye çevrilir
agHesap();
function agKaydet(){try{localStorage.setItem('pf_agac2',JSON.stringify({acik:[...AG.acik],anti:[...AG.anti],cip:AG.cip,top:AG.top}))}catch(_){}}
agKaydet();
const YV=k=>(AG.acik.has(k)&&!(AG.anti.has(k)&&!DEMO))||!!(DEMO&&DEMO.yv.includes(k));      // anti'ye çevrilen yetenek kapalı sayılır (önizlemede asıl hali gösterilir)
const YA=k=>AG.anti.has(k)&&!DEMO;      // yetenek anti haline çevrilmiş mi      // önizlemede gösterilen yetenek geçici açık
const YGEREK={R:'F'};      // bu yetenek, komşusu açık olsa da önce şunun açılmasını ister (Can Çalmalı Yırtma ← Yırtma)
const yAcilir=k=>!AG.acik.has(k)&&YKOM[k].some(n=>AG.acik.has(n))&&(!YGEREK[k]||AG.acik.has(YGEREK[k]));
const yAlinir=k=>yAcilir(k)&&AG.p>=YET[k][4];
HPMAX=Math.max(50,250+(YV('V')?100:0)-10*AG.cip);      // yeteneksiz her ölüm: maks. can -10 (en az 50)
ENMAX=250+(YA('V')?100:0);S.hp=HPMAX;S.en=ENMAX;
function canCal(dmg,tekme){      // can çalma: H %10 / M %20 her vuruşta; Tekmeyle Can Çalma (Q) sadece tekmelere kendi +%10'unu ekler; Bıçakla Can Çalma (T) sadece bıçak vuruşlarına kendi +%20'sini ekler
  let r=YV('M')?0.2:YV('H')?0.1:0;
  if(tekme&&YV('Q'))r+=0.1;
  if(S.pence&&YV('T'))r+=0.2;
  if(r>0&&S.hp>0)S.hp=Math.min(HPMAX,S.hp+dmg*r*(DEMO&&DEMO.d.canK||1));      // önizlemede can barının dolduğu net görünsün diye büyütülür (sahte can)
}
function agBtn(){
  const b=document.getElementById('agacB');if(!b)return;
  b.classList.toggle('ok',Object.keys(YET).some(yAlinir));{const mb=document.getElementById('menuB');if(mb)mb.classList.toggle('ok',b.classList.contains('ok'))}      // menü düğmesi de parlar      // sarı oklu çapa: açılacak yetenek var
  const x=document.getElementById('xpB');if(x)x.style.width=Math.min(100,AG.xp/xpGerek(AG.lv)*100)+'%';
  const ic=document.getElementById('ispB');if(ic)ic.hidden=!YV('TOP');
}
function xpKazan(n){
  if(DEMO)return;      // önizlemede XP yok
  const lv0=AG.lv;AG.top+=n;agHesap();S.pops.push({x:S.x,y:S.y+1150,t:0,txt:dil('xp_pop',n),f:0.3});
  if(AG.lv>lv0){const k=AG.lv-lv0;S.hp=HPMAX;S.en=ENMAX;S.pops.push({x:S.x,y:S.y+1300,t:0,txt:dil('lv_up',AG.lv,k),f:1});bufCal(LVS,1)}      // her seviye 1 puan, can ve enerji dolar, seviye sesi
  agKaydet();agBtn();if(window.agacYenile)agacYenile();
}
// Ispanak cebi: 30 sn'de bir cepten ıspanak çıkar, elde belirir, standart yeme animasyonu
let ISP_CEP=-99;
function ispCep(){
  if(!YV('TOP')||S.durum!=='oyun'||S.t-ISP_CEP<30||S.yeme||S.pence||tutan('N')||varilElde('N'))return;
  ISP_CEP=S.t;S.uzan=null;S.yeme={k:'N',t0:S.t,bos:false,atildi:false};
}
function ispCepCiz(){const b=document.getElementById('ispB');if(!b||b.hidden)return;const f=kisit((S.t-ISP_CEP)/30,0,1);b.style.setProperty('--p',(f*100)+'%');b.classList.toggle('hazir',f>=1)}
// Yetenek açılınca: basılarak kullanılan (aktif) yeteneğin kendi sesi çalar (önizleme açıkken de). Pasiflerde ses yok.
const yRnd=L=>L.length?L[Math.floor(Math.random()*L.length)]:null;
const YSES={A:()=>GRS,B:()=>TCS,F:()=>PPAR,R:()=>PPAR,N:()=>YAR,D:()=>yRnd(JP),E:()=>yRnd(TK),L:()=>yRnd(TK),YT:()=>yRnd(TK),J:()=>yRnd(PB),U:()=>yRnd(INS),P:()=>BOPEN,Z:()=>USTS,TOP:()=>YEMS};
function yetSes(k){const f=YSES[k],b=f&&f();if(!AC||!b)return;const src=AC.createBufferSource(),g=AC.createGain();src.buffer=b;src.connect(g);g.connect(SFXC());src.start()}
let agacAcik=false,antiMod=false;      // antiMod: ölünce açılan zorunlu anti seçimi (kapatılamaz)
const antiAday=()=>[...AG.acik].filter(k=>k!==YKOK&&YET[k]&&!AG.anti.has(k));      // anti'ye çevrilebilecek (verilmiş) yetenekler
const BASILI=2;      // yetenek açmak / anti seçmek için basılı tutma süresi (sn)
(()=>{
  const el=document.getElementById('agac'),ic=document.getElementById('agac_ic'),bil=document.getElementById('agac_bil'),pb=document.getElementById('agac_pb');
  const DG={},KN={},OL={};
  const yer=(d,k,w)=>{const [x,y]=YET[k];if(YET[k][5])d.style.width=(w*YET[k][5])+'%';d.style.left=((x-AGX)/AGW*100)+'%';d.style.top=((y-AGY)/AGH*100)+'%'};
  for(const k in YET){const d=document.createElement('div');d.className='ykan';yer(d,k,10);ic.appendChild(d);KN[k]=d}      // kan lekesi: ağacın üstünde, simgenin altında (anti'ye çevrilenlerde)
  for(const k in YET){
    const d=document.createElement('div');d.className='yd';yer(d,k,6.8);d.style.backgroundImage=`url(ui/yt${YET[k][2]}.webp${SURUM})`;
    d.addEventListener('pointerdown',ev=>{ev.preventDefault();ev.stopPropagation();bas(k)});d.addEventListener('click',ev=>ev.stopPropagation());ic.appendChild(d);DG[k]=d;
  }
  for(const k in YET){const d=document.createElement('div');d.className='ydol';yer(d,k,6.8);d.style.setProperty('--im',`url(ui/yt${YET[k][2]}.webp${SURUM})`);ic.appendChild(d);OL[k]=d}      // basılı tutunca dönerek renklenen kopya (gri simgenin üstünde)
  const kalp=document.createElement('div');kalp.id='agac_kalp';ic.appendChild(kalp);      // skill öldürmek yerine: maks. can -10, +1 hasar
  const kalpOl=document.createElement('div');kalpOl.id='agac_kalpOl';kalpOl.className='ydol';ic.appendChild(kalpOl);OL.KALP=kalpOl;
  kalp.addEventListener('pointerdown',ev=>{ev.preventDefault();ev.stopPropagation();bas('KALP')});kalp.addEventListener('click',ev=>ev.stopPropagation());
  let secili=null,tut=null;      // tut: {k, p: 0-1 dolum, bas: parmak basılı mı}
  const verilir=k=>k==='KALP'?antiMod:antiMod?antiAday().includes(k):yAlinir(k);
  function bas(k){
    if(!antiMod&&k!=='KALP'&&secili!==k)demoBasla(k);      // arkadaki karakter yeteneği gösterir
    if(tut&&tut.k!==k){OL[tut.k].style.setProperty('--p',0);OL[tut.k].classList.remove('tut')}
    secili=k;yenile();
    if(verilir(k)){tut={k,p:tut&&tut.k===k?tut.p:0,bas:true,t:performance.now()};OL[k].classList.add('tut');requestAnimationFrame(dolum)}
  }
  function birak(){if(tut)tut.bas=false}
  addEventListener('pointerup',birak);addEventListener('pointercancel',birak);
  function dolum(ms){
    if(!tut)return;const dt=Math.min(0.05,(ms-tut.t)/1000||0);tut.t=ms;
    tut.p+=dt/BASILI*(tut.bas?1:-1.6);      // basılıyken 2 sn'de dolar, bırakınca boşalır
    const d=OL[tut.k];d.style.setProperty('--p',Math.max(0,Math.min(1,tut.p)));
    if(tut.p>=1){const k=tut.k;tut=null;d.style.setProperty('--p',0);d.classList.remove('tut');ver(k);return}
    if(tut.p<=0){d.style.setProperty('--p',0);d.classList.remove('tut');tut=null;return}
    requestAnimationFrame(dolum);
  }
  function antiBitir(){antiMod=false;el.classList.remove('anti');agacAc(false);yeniOyun()}
  function ver(k){
    if(k==='KALP'){if(!antiMod)return;AG.cip++;HPMAX=Math.max(50,HPMAX-10);agKaydet();antiBitir();S.pops.push({x:S.x,y:S.y+1200,t:0,txt:dil('cip_pop'),f:1});return}      // skill öldürmek yerine ceza/bonus
    if(antiMod){if(!antiAday().includes(k))return;AG.anti.add(k);if(k==='V'){HPMAX-=100;ENMAX+=100}agKaydet();antiBitir();return}
    if(!yAlinir(k))return;AG.acik.add(k);agHesap();yetSes(k);if(k==='V'){HPMAX+=100;S.hp+=100;if(DEMO)DEMO.kayit.sb.S.hp+=100}agKaydet();yenile();
  }
  function yaz(t){if(bil.textContent!==t){bil.textContent=t;bil.scrollLeft=0}}
  function yenile(){
    const ad=antiMod?antiAday():null;
    for(const k in DG){DG[k].className='yd'+(AG.acik.has(k)?' ac':yAcilir(k)?' hazir':'')+(AG.anti.has(k)?' anti':'')+(ad?(ad.includes(k)?' antiH':' antiK'):'')+(secili===k?' sec':'');KN[k].classList.toggle('on',AG.anti.has(k))}
    kalp.classList.toggle('sec',secili==='KALP');
    pb.textContent=dil('ag_bil',AG.lv,AG.xp,xpGerek(AG.lv),AG.p);      // oyuncunun seviye/XP/puanı: ayrı, altta
    let t='';
    if(secili==='KALP')t=dil('kalp_bil')+(antiMod?dil('ag_tut'):'');
    else if(antiMod)t=secili?dil('anti_etiket',dil('anti_'+secili))+'  ·  '+dil('yet_'+secili)+(ad.includes(secili)?dil('ag_tut'):dil('anti_yok')):dil('anti_bas');      // önce anti, sonra orijinal
    else if(secili&&AG.anti.has(secili))t=dil('anti_etiket',dil('anti_'+secili))+'  ·  '+dil('yet_'+secili);
    else if(secili){const a=dil('yet_'+secili),c=YET[secili][4];t=a+(AG.acik.has(secili)?dil('ag_acik'):dil('ag_puan',c)+(yAcilir(secili)?(AG.p>=c?dil('ag_tut'):dil('ag_yetmez')):(YGEREK[secili]&&!AG.acik.has(YGEREK[secili])?dil('ag_gerek',dil('yet_'+YGEREK[secili])):dil('ag_once'))))}      // seçili yetenek: adı, maliyeti ve durumu
    yaz(t);agBtn();
  }
  window.agacYenile=yenile;DIL_DIN.push(yenile);
  window.agacAc=a=>{if(!a&&antiMod)return;if(a&&listeAcik)listeAc(false);if(!a)demoBitir();agacAcik=a;el.hidden=!a;document.getElementById('agacB').classList.toggle('aktif',a);if(a){izler.clear();kizler.clear();KOL.N.ak=false;KOL.F.ak=false;key.sol=key.sag=key.asagi=key.zipla=false;secili=null;yenile()}};      // ölüm seçimi bitmeden kapanmaz
  window.antiAc=()=>{if(!antiAday().length)return false;if(menuAcik)menuAc(false);if(listeAcik)listeAc(false);demoBitir();antiMod=true;el.classList.add('anti');agacAcik=false;agacAc(true);return true};
  document.getElementById('agacB').addEventListener('click',()=>agacAc(!agacAcik));      // ikon açıkken tekrar dokununca kapanır
  document.getElementById('ispB').addEventListener('pointerdown',e=>{e.preventDefault();e.stopPropagation();ispCep()});      // click değil: yürüme tuşuna basılıyken de anında çalışır
  el.addEventListener('click',e=>{if(e.target===el||e.target.id==='agac_kap')agacAc(false)});
  addEventListener('keydown',e=>{if(e.key==='Escape'&&agacAcik)agacAc(false)});
  agBtn();
})();
