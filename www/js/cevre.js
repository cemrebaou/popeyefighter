'use strict';
// Liman çevresi: en arkada gökyüzü/deniz (gok, dongu.js arkaPlan), evler (derinlik katmanı), tahta iskele zemini (uç uca döşenir), en önde iskele kazıkları.
// Katmanlar: ev katmanı p=0.85 (uzak: yavaş kayar, küçük görünür), iskele + kazıklar p=1 (karakterlerle aynı). Kazıklar çift sıra: ön sıra karakterlerin önünde, arka sıra (küçük) iskelenin arkasında.
// Diğer nesneler (kasa, lamba, palmiye, fener…) netlik yetersiz olduğu için şimdilik kaldırıldı; daha net görseller gelince eklenecek. Ölçüler oyun birimi (Popeye boyu KARAKTER_BOY=1020).
const CVR={};
const CV_ADLAR=['gok','sahil','tahta','kazik','ev0','ev1','ev2','ev3','ev4','ev5','ev6','ev7'];
for(const a of CV_ADLAR)yukle('cevre/'+a+'.webp',im=>CVR[a]=im);
const TAHTA_W=2400,TAHTA_AYAK=0.346;      // bir tahta şeridinin dünya eni; ayakların bastığı çizgi görselin üstünden bu oranda (yüzeyin ortası)
const TAHTA_ARKA=150;                     // tahta yüzeyinin arka kenarı: ayak çizgisinden bu kadar geride (evler buraya oturur)
const EV_P=0.85;
const EV_BOY=[1511,1582,1189,1451,1142,1402,1432,1365];      // ev cephelerinin dünya boyları (çizimdeki oranlar korunur)
const EV_ORAN=[0.892,0.588,1.191,0.988,1.16,0.938,0.877,1.014];      // en / boy
const KAZIK_BOY=630,KAZIK_ON=159,KAZIK_ARK=TAHTA_ARKA,KAZIK_KUC=0.78,KAZIK_ARA=TAHTA_W;      // iskele kazıkları (yolla aynı katman, aynı hız): ön kazığın ortası iskelenin ön kenarında (ayak çizgisinin 159 altı), arka kazık arka kenarda ve perspektifle küçük; aralık = bir tahta şeridi
const SAHIL_W=2900,SAHIL_DILIM=28,SAHIL_P1=1.18;      // sahil (kum→ıslak kum→köpük→sığ su): dünya eni, yatay dilim sayısı, en alt dilimin kayma hızı (üst dilim EV_P)
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
function cevreArka(zeminY){      // arkaPlan'ın sonunda: kum, evler, arka kazıklar, tahta iskele (iskelenin altında en arkadaki gökyüzü/deniz görseli görünür)
  const gy=zeminY+S.camY*SC;      // dünya y=0 (ayak çizgisi) ekranda
  const T=CVR.tahta;if(!T)return;
  const tw=TAHTA_W*SC,th=tw*T.height/T.width,y0=gy-th*TAHTA_AYAK;
  {const gp=zeminY+S.camY*SC*EV_P-TAHTA_ARKA*SC,s=SC*EV_P;      // ev katmanı: daha uzakta, yavaş kayar
    const K=CVR.sahil,ky=Math.round(gp+6*s);if(K&&ky<H){      // sahil: evlerin alt çizgisinden ekranın altına kadar; yatay dilimlere bölünür, üst dilim evlerle (uzak, yavaş), alt dilimler giderek hızlı ve büyük kayar = gerçek zemin perspektifi
      const yh=H-ky;
      for(let i=0;i<SAHIL_DILIM;i++){
        const f=(i+0.5)/SAHIL_DILIM,p=EV_P+(SAHIL_P1-EV_P)*f,sw=SAHIL_W*SC*p,sy0=K.height*i/SAHIL_DILIM,sh=K.height/SAHIL_DILIM,dy=Math.floor(ky+yh*i/SAHIL_DILIM),dh=Math.ceil(ky+yh*(i+1)/SAHIL_DILIM)-dy+1;
        for(let x=((W/2-S.x*p*SC*p)%sw+sw)%sw-sw;x<W;x+=sw-1)ctx.drawImage(K,0,sy0,K.width,sh,Math.floor(x),dy,Math.ceil(sw)+1,dh)}}
    for(const e of CV_EV){const im=CVR[e.ad];if(!im)continue;const w=e.h*im.width/im.height;cvCiz(im,W/2+(e.x+w/2-S.x*EV_P)*s,Math.round(gp+6*s)+3,e.h*s)}}
  {const a=Math.round(y0+th*0.55),b=Math.round(y0+th*1.35),g=ctx.createLinearGradient(0,a,0,b);g.addColorStop(0,'rgba(20,40,60,0.38)');g.addColorStop(1,'rgba(20,40,60,0)');ctx.fillStyle=g;ctx.fillRect(0,a,W,b-a)}      // iskelenin altında gölge
  kazikCiz(zeminY,false);      // arka kazıklar: alt yarısı iskele tahtasının arkasında kalır
  for(let x=((W/2-S.x*SC)%tw+tw)%tw-tw;x<W;x+=tw-1)ctx.drawImage(T,Math.floor(x),y0,Math.ceil(tw)+1,th);
}
function kazikCiz(zeminY,on){      // on: karakterlerin önündeki sıra (iskelenin ön kenarı), değilse arka sıra (arka kenar, iskele tahtasının arkasında kalır)
  const K=CVR.kazik;if(!K)return;
  const k=on?1:KAZIK_KUC,h=KAZIK_BOY*k*SC,w=h*K.width/K.height,orta=zeminY+S.camY*SC+(on?KAZIK_ON:-KAZIK_ARK)*SC;
  const ara=KAZIK_ARA*SC,ofs=W/2-S.x*SC;
  for(let x=((ofs%ara)+ara)%ara-ara;x<W+ara;x+=ara){if(x+w/2<0||x-w/2>W)continue;ctx.drawImage(K,Math.round(x-w/2),Math.round(orta-h/2),Math.round(w),Math.round(h))}
}
function cevreOn(zeminY){kazikCiz(zeminY,true)}      // karakterlerin önünde: ön kazık sırası
