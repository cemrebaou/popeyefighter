'use strict';
// Liman çevresi (ön plan tasarımı): tahta iskele zemini (uç uca döşenir), arkada evler (derinlik katmanı), iskelede nesneler, en önde seyrek çalılar.
// Katmanlar: ev katmanı p=0.85 (daha uzak: yavaş kayar, küçük görünür), iskele + nesneler p=1 (karakterlerle aynı), ön çalılar p=1.12 (kameraya yakın, karakterlerin önünde).
// En arkada gökyüzü/deniz görseli (gok) dongu.js arkaPlan'da. Tüm ölçüler oyun birimi (Popeye boyu KARAKTER_BOY=1020).
const CVR={};
const CV_ADLAR=['gok','tahta','ev0','ev1','ev2','ev3','ev4','ev5','ev6','ev7','lamba0','lamba1','top','yuk0','yuk1','cuval','kasa0','kasa1','kasa2','tabela','kaya','cali0','cali1','cali2','cali3','cali4','cali5','palmiye','fener'];
for(const a of CV_ADLAR)yukle('cevre/'+a+'.webp',im=>CVR[a]=im);
const TAHTA_W=2400,TAHTA_AYAK=0.346;      // bir tahta şeridinin dünya eni; ayakların bastığı çizgi görselin üstünden bu oranda (yüzeyin ortası)
const TAHTA_ARKA=150;                     // tahta yüzeyinin arka kenarı: ayak çizgisinden bu kadar geride (evler buraya oturur)
const EV_P=0.85,ON_P=1.12;
const EV_BOY=[1511,1582,1189,1451,1142,1402,1432,1365];      // ev cephelerinin dünya boyları (çizimdeki oranlar korunur)
const EV_ORAN=[0.887,0.582,1.211,0.985,1.141,0.928,0.878,0.998];      // en / boy
const NS_BOY={lamba0:1250,lamba1:1230,top:500,yuk0:430,yuk1:430,cuval:470,kasa0:430,kasa1:430,kasa2:440,tabela:610,kaya:480,palmiye:2000,fener:2300,cali0:330,cali1:320,cali2:320,cali3:330,cali4:300,cali5:320};
const EV_EN={palmiye:0.812,fener:0.305};      // en / boy
let CV_EV=[],CV_NS=[],CV_ON=[];
(function cevreKur(){      // sabit tohumlu rastgele dizilim: her oyunda aynı liman
  let tohum=20261024;const r=()=>{tohum=(Math.imul(tohum,1103515245)+12345)>>>0;return (tohum>>>8)/16777216};
  const sec=a=>a[Math.floor(r()*a.length)];
  // evler: 2-3'lü sokak kümeleri, aralarda boşluk (arkadaki dağlar/ağaçlar görünür), boşluklarda bazen palmiye
  let lx=-900,son=-1,fenerOK=false;const SON=(BOSS_X+3500)*EV_P,FENER_X=(BOSS_X-900)*EV_P;
  while(lx<SON){
    const n=2+Math.floor(r()*2);
    for(let i=0;i<n;i++){let k;do k=Math.floor(r()*8);while(k===son);son=k;CV_EV.push({ad:'ev'+k,x:lx,h:EV_BOY[k]});lx+=EV_BOY[k]*EV_ORAN[k]+20+r()*60}      // evler arası dar sokak aralığı
    let bos=500+r()*900;      // kümeler arası boşluk: arkadaki deniz görünür; içine konan şey kenarlara değmez
    if(!fenerOK&&lx+bos>FENER_X){const fw=NS_BOY.fener*EV_EN.fener;bos=Math.max(bos,fw+500);CV_EV.push({ad:'fener',x:lx+(bos-fw)/2,h:NS_BOY.fener,on:true});fenerOK=true}      // fener: boss bölgesinin işareti
    else if(r()<0.45){const h=NS_BOY.palmiye*(0.9+r()*0.2),pw=h*EV_EN.palmiye;if(bos>=pw+160)CV_EV.push({ad:'palmiye',x:lx+(bos-pw)/2,h})}
    lx+=bos;
  }
  // iskele nesneleri: düzenli sokak lambaları + aralarda yük yığınları; varillerin (V_KONUM) yanını boş bırak
  for(let x=-600,i=0;x<BOSS_X+2500;x+=2600,i++)CV_NS.push({ad:i%2?'lamba1':'lamba0',x});
  const GRUP=[['kasa0'],['kasa1','kasa2'],['kasa2','kasa0','kasa1'],['yuk0'],['yuk1'],['cuval'],['cuval','kasa1'],['top'],['tabela'],['cali0'],['cali3','kasa1'],['cali5'],['kasa0','cali2'],['yuk0','kasa2']];
  for(let x=300;x<BOSS_X+2000;x+=900+r()*1500){
    if(V_KONUM.some(v=>Math.abs(v-x)<700)||CV_NS.some(n=>n.ad.startsWith('lamba')&&Math.abs(n.x-x)<350))continue;
    let gx=x;for(const ad of sec(GRUP)){CV_NS.push({ad,x:gx});gx+=330+r()*60}
  }
  for(let x=1800;x<BOSS_X+3000;x+=2600+r()*2600)CV_ON.push({ad:'kaya',x});
})();
function cvCiz(im,sx,taban,h){      // taban: ekranda alt kenar (px), h: ekranda boy (px)
  if(!im)return;const w=h*im.width/im.height;
  if(sx+w/2<-40||sx-w/2>W+40)return;
  ctx.drawImage(im,Math.round(sx-w/2),Math.round(taban-h),Math.round(w),Math.round(h));
}
function cevreArka(zeminY){      // arkaPlan'ın sonunda: evler, deniz, tahta iskele, iskele nesneleri
  const gy=zeminY+S.camY*SC;      // dünya y=0 (ayak çizgisi) ekranda
  {const gp=zeminY+S.camY*SC*EV_P-TAHTA_ARKA*SC,s=SC*EV_P;      // ev katmanı: daha uzakta, yavaş kayar
    for(const e of CV_EV){const im=CVR[e.ad];if(!im)continue;const w=e.h*im.width/im.height;cvCiz(im,W/2+(e.x+w/2-S.x*EV_P)*s,gp+(e.on?0:6*s),e.h*s)}}
  const T=CVR.tahta;if(!T)return;
  const tw=TAHTA_W*SC,th=tw*T.height/T.width,y0=gy-th*TAHTA_AYAK;
  ctx.fillStyle='#4783a7';ctx.fillRect(0,y0+th*0.92,W,H);      // iskelenin altında deniz
  ctx.fillStyle='#7fb0cf';ctx.fillRect(0,y0+th*0.92,W,Math.max(2,th*0.05));
  for(let x=((W/2-S.x*SC)%tw+tw)%tw-tw;x<W;x+=tw-1)ctx.drawImage(T,Math.floor(x),y0,Math.ceil(tw)+1,th);
  const ny=gy-90*SC;      // nesneler iskelenin arka yarısında, karakterlerin arkasında
  for(const n of CV_NS)cvCiz(CVR[n.ad],W/2+(n.x-S.x)*SC,ny,NS_BOY[n.ad]*SC);
}
function cevreOn(zeminY){      // karakterlerin önünde: kameraya yakın seyrek kayalar (iskelenin ön kenarında)
  const s=SC*ON_P,ty=zeminY+S.camY*SC*ON_P+250*SC;
  for(const c of CV_ON)cvCiz(CVR[c.ad],W/2+(c.x-S.x*ON_P)*s,ty,NS_BOY[c.ad]*s);
}
