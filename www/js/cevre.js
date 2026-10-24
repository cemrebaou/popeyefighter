'use strict';
// Liman çevresi: en arkada gökyüzü/deniz (gok, dongu.js arkaPlan), evler (derinlik katmanı), tahta iskele zemini (uç uca döşenir), en önde iskele kazıkları.
// Katmanlar: ev katmanı p=0.85 (uzak: yavaş kayar, küçük görünür), iskele p=1 (karakterlerle aynı), kazıklar p=1.12 (kameraya yakın, karakterlerin önünde).
// Diğer nesneler (kasa, lamba, palmiye, fener…) netlik yetersiz olduğu için şimdilik kaldırıldı; daha net görseller gelince eklenecek. Ölçüler oyun birimi (Popeye boyu KARAKTER_BOY=1020).
const CVR={};
const CV_ADLAR=['gok','tahta','kazik','ev0','ev1','ev2','ev3','ev4','ev5','ev6','ev7'];
for(const a of CV_ADLAR)yukle('cevre/'+a+'.webp',im=>CVR[a]=im);
const TAHTA_W=2400,TAHTA_AYAK=0.346;      // bir tahta şeridinin dünya eni; ayakların bastığı çizgi görselin üstünden bu oranda (yüzeyin ortası)
const TAHTA_ARKA=150;                     // tahta yüzeyinin arka kenarı: ayak çizgisinden bu kadar geride (evler buraya oturur)
const EV_P=0.85,ON_P=1.12;
const EV_BOY=[1511,1582,1189,1451,1142,1402,1432,1365];      // ev cephelerinin dünya boyları (çizimdeki oranlar korunur)
const EV_ORAN=[0.887,0.582,1.211,0.985,1.141,0.928,0.878,0.998];      // en / boy
const KAZIK_EN=250,KAZIK_UST=110,KAZIK_ARA=TAHTA_W;      // ön kazık: eni, üst ucu ayak çizgisinin bu kadar altında (iskelenin ön kenarına biraz biner), aralık = bir tahta şeridi
let CV_EV=[];
(function cevreKur(){      // sabit tohumlu rastgele dizilim: her oyunda aynı liman
  let tohum=20261024;const r=()=>{tohum=(Math.imul(tohum,1103515245)+12345)>>>0;return (tohum>>>8)/16777216};
  // evler: 2-3'lü sokak kümeleri, aralarda boşluk (arkadaki deniz görünür); evler birbirine binmez
  let lx=-900,son=-1;const SON=(BOSS_X+3500)*EV_P;
  while(lx<SON){
    const n=2+Math.floor(r()*2);
    for(let i=0;i<n;i++){let k;do k=Math.floor(r()*8);while(k===son);son=k;CV_EV.push({ad:'ev'+k,x:lx,h:EV_BOY[k]});lx+=EV_BOY[k]*EV_ORAN[k]+20+r()*60}      // evler arası dar sokak aralığı
    lx+=500+r()*900;
  }
})();
function cvCiz(im,sx,taban,h){      // taban: ekranda alt kenar (px), h: ekranda boy (px)
  if(!im)return;const w=h*im.width/im.height;
  if(sx+w/2<-40||sx-w/2>W+40)return;
  ctx.drawImage(im,Math.round(sx-w/2),Math.round(taban-h),Math.round(w),Math.round(h));
}
function cevreArka(zeminY){      // arkaPlan'ın sonunda: evler, deniz, tahta iskele
  const gy=zeminY+S.camY*SC;      // dünya y=0 (ayak çizgisi) ekranda
  {const gp=zeminY+S.camY*SC*EV_P-TAHTA_ARKA*SC,s=SC*EV_P;      // ev katmanı: daha uzakta, yavaş kayar
    for(const e of CV_EV){const im=CVR[e.ad];if(!im)continue;const w=e.h*im.width/im.height;cvCiz(im,W/2+(e.x+w/2-S.x*EV_P)*s,gp+6*s,e.h*s)}}
  const T=CVR.tahta;if(!T)return;
  const tw=TAHTA_W*SC,th=tw*T.height/T.width,y0=gy-th*TAHTA_AYAK;
  ctx.fillStyle='#4783a7';ctx.fillRect(0,y0+th*0.92,W,H);      // iskelenin altında deniz
  ctx.fillStyle='#7fb0cf';ctx.fillRect(0,y0+th*0.92,W,Math.max(2,th*0.05));
  for(let x=((W/2-S.x*SC)%tw+tw)%tw-tw;x<W;x+=tw-1)ctx.drawImage(T,Math.floor(x),y0,Math.ceil(tw)+1,th);
}
function cevreOn(zeminY){      // karakterlerin önünde: eşit aralıklı iskele kazıkları; üst ucu iskelenin ön kenarına biner, altı ekrandan çıkar
  const K=CVR.kazik;if(!K)return;
  const s=SC*ON_P,ust=zeminY+(S.camY*ON_P+KAZIK_UST*ON_P)*SC,w=KAZIK_EN*s;
  if(ust>=H)return;
  const h=H-ust+20,sh=Math.min(K.height,h/w*K.width);      // görselin üstten gereken kadarı (oran bozulmaz; çok uzunsa görsel uzatılır)
  const ara=KAZIK_ARA*s,ofs=W/2-S.x*ON_P*s;
  for(let x=((ofs%ara)+ara)%ara-ara;x<W+ara;x+=ara){if(x+w/2<0||x-w/2>W)continue;ctx.drawImage(K,0,0,K.width,sh,Math.round(x-w/2),Math.round(ust),Math.round(w),Math.round(h))}
}
