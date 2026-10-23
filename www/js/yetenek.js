'use strict';
// Yetenek ağacı: düğümler ağaç görselindeki daire merkezlerinde (görsel px), ikon ui/ytN.webp. Kilitli = siyah-beyaz, açık = renkli.
// Açma: komşusu açık düğüm + 1 puan. Puan: her düşman 1, kaptan 3 (kalıcı). Not: şimdilik özellikleri kilitlemez, sadece ağaç.
const AGW=2690,AGH=1468,AGX=29,AGY=29;      // ağaç görselinin kırpılmış alanı
const YET={
  C:[1373,1399,0,'Yumruk'],I:[1373,1111,1,'Tekme'],O:[1373,821,2,'Kombo'],
  V:[1171,487,26,'Maks. Can +'],W:[1373,486,27,'Maks. Enerji +'],X:[1576,486,25,'Pasif Can Dolumu'],TOP:[1373,125,18,'Ispanak Gücü'],
  B:[779,1397,3,'Tutma'],A:[126,1399,4,'Sıkı Tutuş'],G:[487,1111,20,'Varil Kaldırma'],H:[869,1099,21,'Kafa Atma'],F:[143,1055,22,'Varil Fırlatma'],
  R:[330,628,5,'Yırtma'],M:[616,859,24,'Sersemletme'],N:[1088,876,11,'Blok'],S:[915,593,19,'Can Çalma'],Y:[727,279,17,'Aduket'],
  D:[1968,1397,16,'Çift Zıplama'],E:[2621,1398,15,'Kayan Tekme'],J:[1883,1098,14,'Dönen Tekme'],K:[2260,1111,9,'Süper İniş'],L:[2603,1055,8,'Yer Yumruğu'],
  Q:[2158,858,10,'Alkış'],U:[2416,628,7,'Süpermen'],P:[1659,876,13,'Ateşli Aparkat'],T:[1824,593,6,'Bıçak Modu'],Z:[2009,279,12,'Bıçak Atılışı']
};
const YKOK='C';
const YBAG='C-B C-D C-I I-O O-N O-P O-V O-W O-X V-TOP W-TOP X-TOP B-A B-G B-H A-F F-G F-R R-M M-H G-H H-N N-S S-Y D-E D-K D-J J-P J-Q J-K K-L L-E L-U U-Q P-T T-Z'.split(' ').map(s=>s.split('-'));
const YKOM={};for(const k in YET)YKOM[k]=[];for(const [a,b] of YBAG){YKOM[a].push(b);YKOM[b].push(a)}
const AG={acik:new Set([YKOK]),p:0};
try{const d=JSON.parse(localStorage.getItem('pf_agac')||'null');if(d){AG.acik=new Set([YKOK,...(d.acik||[])]);AG.p=d.p|0}}catch(_){}
function agKaydet(){try{localStorage.setItem('pf_agac',JSON.stringify({acik:[...AG.acik],p:AG.p}))}catch(_){}}
const yAcilir=k=>!AG.acik.has(k)&&YKOM[k].some(n=>AG.acik.has(n));
function ypKazan(n){AG.p+=n;agKaydet();if(window.agacYenile)agacYenile()}
let agacAcik=false;
(()=>{
  const el=document.getElementById('agac'),ic=document.getElementById('agac_ic'),bil=document.getElementById('agac_bil');
  const DG={};
  for(const k in YET){
    const [x,y,i]=YET[k],d=document.createElement('div');
    d.className='yd';d.style.left=((x-AGX)/AGW*100)+'%';d.style.top=((y-AGY)/AGH*100)+'%';d.style.backgroundImage=`url(ui/yt${i}.webp${SURUM})`;
    d.addEventListener('click',ev=>{ev.stopPropagation();sec(k)});ic.appendChild(d);DG[k]=d;
  }
  let secili=null;
  function sec(k){
    if(secili===k&&yAcilir(k)&&AG.p>0){AG.p--;AG.acik.add(k);agKaydet()}      // ikinci dokunuş: aç
    secili=k;yenile();
  }
  function yenile(){
    for(const k in DG)DG[k].className='yd'+(AG.acik.has(k)?' ac':yAcilir(k)?' hazir':'')+(secili===k?' sec':'');
    let t='PUAN: '+AG.p;
    if(secili){const ad=YET[secili][3];t+=' · '+ad+(AG.acik.has(secili)?' (AÇIK)':yAcilir(secili)?(AG.p>0?' · açmak için tekrar dokun':' · puan yok'):' · önce yanındakini aç')}
    bil.textContent=t;
  }
  window.agacYenile=yenile;
  window.agacAc=a=>{agacAcik=a;el.hidden=!a;if(a){izler.clear();kizler.clear();KOL.N.ak=false;KOL.F.ak=false;key.sol=key.sag=key.asagi=key.zipla=false;secili=null;yenile()}};
  document.getElementById('agacB').addEventListener('click',()=>agacAc(true));
  el.addEventListener('click',e=>{if(e.target===el||e.target.id==='agac_kap')agacAc(false)});
  addEventListener('keydown',e=>{if(e.key==='Escape'&&agacAcik)agacAc(false)});
})();
