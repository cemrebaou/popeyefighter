'use strict';
// Ayarlar, sürüm, görsel yükleyici, ekran boyutu, oyuncu durumu (S)
// ---------- Görseller: hepsi tek yükleyiciyle; tamamı inince oyun başlar ----------
const OYUN_SURUM='v0.327';      // ekrandaki sürüm (her değişiklikte artar)
document.getElementById('surum').textContent=OYUN_SURUM;
const SURUM='?v=84';                 // görsel değişince artır: tarayıcı eski önbelleği kullanmasın
const KP=['kafa','govde','kalca','ust','on','elN','elF','uy','bacak','bot'];      // korsan parça seti (k: yumruklu, b: bıçaklı, p: tabancalı kaptan)
const ADLAR=['kalca','ustkol','onkol','onkol2','uyluk','altpan','bacak_bot','el_yum','el_yum_f','el_ac_n','el_ac_f','el_pN','el_pF','p_mermi','p_ates','h_elB','h_kanca','h_zincir','z_dolu','z_bos','z_mizrak','z_ip']      // z_: zıpkın (tabanca dolu/boş, mızrak, halat)
  .concat([...Array(11).keys()].map(i=>'govde'+i),...['k_','b_','p_','h_'].map(q=>KP.map(n=>q+n)));
const RES=2;                       // oyuncu parçaları oyun biriminin 2 katı çözünürlükte
const R={},YUZY=[],YUZ=[],YUZA=[],KARI=[],KANI=[],AGAC=[],TASI=[];      // YUZ: can kademesi yüzleri (0 tam can … 10 ölü), YUZA: darbe tepkisi yüzleri, KARI: kar taneleri, KANI: kan efektleri
function koyult(img,al=.28){            // arka taraftaki uzuvlar için hafif koyu kopya
  const c=document.createElement('canvas');c.width=img.width;c.height=img.height;
  const x=c.getContext('2d');x.drawImage(img,0,0);
  x.globalCompositeOperation='source-atop';x.fillStyle='rgba(40,35,60,'+al+')';x.fillRect(0,0,c.width,c.height);
  return c;
}
let kalan=0;
function yukle(src,al){
  kalan++;const im=new Image();
  im.onload=()=>{al(im);if(--kalan===0)gorselHazir()};
  im.onerror=()=>{document.getElementById('yuk').textContent=dil('yuk_hata',src)};
  im.src=src+SURUM;
}
ADLAR.forEach(a=>yukle('parca/'+a+'.webp',im=>R[a]=im));
yukle('parca/h_alt.webp',im=>R.h_alt=im);
['v_varil',...[...Array(14).keys()].map(i=>'v_c'+i),'v_h0','v_h1','v_h2'].forEach(a=>yukle('parca/'+a+'.webp',im=>R[a]=im));      // varil ve kırılınca saçılan parçaları (tahtalar, demir halkalar)
yukle('parca/spinach.png',im=>R.isp=im);yukle('parca/spinach-empty.png',im=>R.ispB=im);      // ıspanak kutusu (dolu / boş)      // kancacının tek parça belden aşağısı
['k_','b_','p_','h_'].forEach(q=>['vur','ahh'].forEach(n=>yukle('parca/'+q+n+'.webp',im=>R[q+n]=im)));
['k_','b_'].forEach(q=>yukle('parca/'+q+'aci.webp',im=>R[q+'aci']=im));      // canı azalıp kaçarken acı yüzü      // korsanların vurulunca acı yüzü (vur), yerde bayılmış yüzü (ahh)
for(let i=0;i<11;i++)yukle('yuz/yuz'+i+'.webp',im=>YUZ[i]=im);
for(let i=0;i<10;i++)yukle('yuz/yuzA'+i+'.webp',im=>YUZA[i]=im);
for(let i=0;i<11;i++)yukle('yuz/yuzY'+i+'.webp',im=>YUZY[i]=im);      // ıspanak yerken ağzı açık yüzler (can kademesine göre)
for(let i=3;i<=6;i++)yukle('fx/kan'+i+'.webp',im=>KANI[i]=im);
for(let i=0;i<3;i++)yukle('fx/kar'+i+'.webp',im=>KARI[i]=im);      // küçük kar topakları (adım, iniş, saçılma)
for(let i=0;i<4;i++)yukle('fx/tas'+i+'.webp',im=>TASI[i]=im);      // küçük taşlar (düşme, patlama)
['patla','sprey','yarik','aduket_su','damla'].forEach(n=>yukle('fx/'+n+'.webp',im=>R[n]=im));      // iniş kanatları, yere çakılma patlaması, kayma sıçraması
['bos','can','en','kalp'].forEach(n=>yukle('ui/bar_'+n+'.webp',im=>R['bar_'+n]=im));      // can/enerji barı: boş (büyük kalp), can dolgusu, enerji dolgusu, küçük kalp (yuvarlak)
function gorselHazir(){
  ['uyluk','altpan','bacak_bot'].forEach(n=>R[n+'_k']=koyult(R[n]));                 // oyuncunun arka bacağı
  ['ustkol','onkol2','el_yum_f','el_ac_n','el_pF'].forEach(n=>R[n+'_a']=koyult(R[n],.13));    // oyuncunun arka kolu ve eli
  for(const q of ['k_','b_','p_','h_']){for(const n of ['ust','on','elF'])R[q+n+'_k']=koyult(R[q+n],.13);for(const n of ['uy','bacak','bot'])R[q+n+'_k']=koyult(R[q+n],.3)}      // korsanın arkadaki kolu/bacağı
  R.z_dolu_a=koyult(R.z_dolu,.13);R.z_bos_a=koyult(R.z_bos,.13);      // arkadaki koldaki zıpkın
  R.p_elN_k=koyult(R.p_elN,.13);R.h_elN_k=koyult(R.h_elN,.13);R.h_elB_k=koyult(R.h_elB,.13);      // kancacının arkadaki kolunda kancalı / boş el
  document.getElementById('yuk').hidden=true;
  (function bas(){if(typeof dongu==='function')requestAnimationFrame(dongu);else setTimeout(bas,20)})();      // önbellekten görseller dongu.js yüklenmeden hazır olabilir: döngü tanımlanınca başlar
}
let DEMO=null;      // yetenek önizlemesi çalışıyor mu (demo.js)
let HPMAX=250;      // oyuncunun en yüksek canı
function hasarKat(hp){const g=Math.max(0,Math.min(10,(HPMAX-hp)/(HPMAX/10))),i=Math.min(9,Math.floor(g));return [i,g-i]}   // 11 hasar modeli arasında sürekli geçiş: i = alttaki model, f = üstteki sonraki modelin saydamsızlığı (can 100→90: model 0→1, ... 10→0: model 9→10)
function hasarCiz(ciz,i,f){ciz(i);if(f>0.004){const a=ctx.globalAlpha;ctx.globalAlpha=a*f;ciz(i+1);ctx.globalAlpha=a}}

// ---------- Ayarlar (parça birimi) ----------
const CR_H=320;                 // çömelmede kalça yüksekliği
const BACAK_BOY=477;            // eklemden zemine (kalça-diz 206 + diz-bilek 172 + bilek-taban 99)
const KARAKTER_BOY=1020;
const HIZ=1100, G=5600, ZIP1=2700, ZIP2=1700, KAY_YOL=650;      // KAY_YOL: kaymadan sonra yeni kayma için koşulması gereken yol      // zıplama hızları: yükseklik eskisinin yarısı (yükseklik hızın karesiyle orantılı)
const D=Math.PI/180;
// [başlangıç x, yükseklik]; sol baştaki ve sağ sondaki yüksek duvar bölümün sınırı
const ZEMIN=[[-1e9,0]];      // şimdilik düz zemin
const BOSS_X=42000;
const kafaY=()=>S.y+((S.yer&&asagiMi())?620:790);      // oyuncunun kafa yüksekliği (eğilince alçalır): kaptan buraya nişan alır

// ---------- Durum ----------
const cv=document.getElementById('c');let ctx=cv.getContext('2d');      // ctx: ceset resmi çizilirken geçici olarak başka tuvale döner (korsan.js cesetResim)
let W=0,H=0,DPR=1,SC=1,GOK=null;
function boyut(){
  DPR=Math.min(window.devicePixelRatio||1,2);GOK=null;   // 3x çözünürlük telefonda çok pahalı: en fazla 2x
  W=window.innerWidth;H=window.innerHeight;
  cv.width=Math.round(W*DPR);cv.height=Math.round(H*DPR);
  SC=Math.min(H*0.58/KARAKTER_BOY, W*0.45/KARAKTER_BOY);
}
window.addEventListener('resize',boyut);boyut();

const key={sol:false,sag:false,zipla:false,asagi:false};
const S={camY:0,atk:null,kuyruk:[],sonAtk:-9,x:0,y:0,vx:0,vy:0,yer:true,yon:1,ziplaTut:false,ekstra:1,spin:0,donuyor:false,faz:0,t:0};
const ROLL_SURE=0.55;
const P={}; // yumuşatılmış açılar
