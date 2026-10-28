'use strict';
// Platform bölümü (Deneme dalı): yer parçaları www/plt/*.webp, tek yönlü platformlar (alttan geçilir, üstüne basılır),
// hareketli arabalar (yat), aşağı-yukarı kütük (dik), basınca düşen (dus), yaylar/trambolin (yay). Uzun yükseltilmiş yollar: eski tahta zemin uç uca (YOL, kazıksız).
// Zemindeki çukurlar ZEMIN tablosunda (ayar.js, -6000). Çukura düşen: 40 can kaybı, son güvenli yere döner.
const PLT_K=5.5;      // görsel pikseli → dünya birimi
const PAR={b0:.14,b1:.14,b2:.14,b3:.14,b4:.14,s0:.15,s1:.15,s2:.15,s3:.15,l0:.16,l1:.16,k0:.19,r0:.12,t0:.21,t1:.2,t2:.22,a0:.13,a1:.13,a2:.13,a3:.13,y0:.11,y1:.12,y2:.13,y3:.12};      // ayak çizgisi: görselin üstünden oran
const PRI={};for(const a in PAR)yukle('plt/'+a+'.webp',im=>PRI[a]=im);
const CUKUR_Y=-6000;
// Bölüm 1. x: sol kenar, y: üst yüzey (ayak çizgisi), yer:1 = zemine oturur. tip: yay (k: zıplatma katı), yat (a: yatay yol, T: süre, f: faz), dik (a: dikey yol), dus (basınca düşer)
const BOLUM1=[
  {ad:'s0',x:1500,yer:1},{ad:'b1',x:2300,y:800},{ad:'t0',x:3300,yer:1},
  {ad:'y1',x:5500,yer:1,tip:'yay',k:1.55},{ad:'b0',x:5900,y:1500},
  {ad:'a0',x:8300,y:150,tip:'yat',a:1100,T:5},
  {ad:'l0',x:14550,y:250},{ad:'r0',x:15800,y:450,tip:'dus'},{ad:'l1',x:16800,y:100,tip:'dik',a:700,T:3.2},
  {ad:'s2',x:18200,yer:1},{ad:'b2',x:18900,y:900},{ad:'y3',x:20500,yer:1,tip:'yay',k:1.95},
  {ad:'a2',x:21650,y:100,tip:'yat',a:700,T:4},{ad:'a3',x:23550,y:300,tip:'yat',a:800,T:4,f:0.5},{ad:'b3',x:24900,y:1700},
  {ad:'y0',x:26000,yer:1,tip:'yay',k:1.5},{ad:'s3',x:26700,y:1500},{ad:'t1',x:27400,yer:1},
  {ad:'k0',x:28700,y:200,tip:'yat',a:350,T:2.4},{ad:'s1',x:29700,y:450,tip:'dus'},
  {ad:'t2',x:31200,yer:1},{ad:'b4',x:32200,y:700}
];
const YOL=[{x0:8700,x1:12600,y:1300,dx:0,dy:0},{x0:21300,x1:24500,y:2400,dx:0,dy:0}];      // yükseltilmiş tahta yollar
let PLT=[],PLT_T=0,PLT_ALT=null;
const ZEMIN_PAR=[];for(let i=0;i<ZEMIN.length;i++)if(ZEMIN[i][1]>CUKUR_Y+1)ZEMIN_PAR.push([ZEMIN[i][0],i+1<ZEMIN.length?ZEMIN[i+1][0]:1e9]);      // zemin parçaları [x0,x1]
const zeminVar=x=>zemin(x)>CUKUR_Y+1;
function pltKur(){
  PLT_T=0;PLT_ALT=null;S.pltOn=null;
  PLT=BOLUM1.map(d=>{const p=Object.assign({tip:'sabit'},d);p.y0=p.y;p.x0=p.x;p.dx=0;p.dy=0;p.sq=0;p.basT=0;p.vy=0;p.yok=0;return p});
}
function pltBoy(p){const im=PRI[p.ad];if(!im)return null;return [im.width*PLT_K,im.height*PLT_K]}
function pltGuncelle(dt){
  PLT_T+=dt;
  for(const p of PLT){
    const b=pltBoy(p);if(!b)continue;
    if(p.yer&&p.yy===undefined){p.yy=b[1]*(1-PAR[p.ad])-25;p.y0=p.y=p.yy}      // zemine oturan parça: alt kenarı iskelede
    const ox=p.x,oy=p.y;
    if(p.tip==='yat')p.x=p.x0+p.a*(1-Math.cos(2*Math.PI*(PLT_T/p.T+(p.f||0))))/2;
    else if(p.tip==='dik')p.y=p.y0+p.a*(1-Math.cos(2*Math.PI*(PLT_T/p.T+(p.f||0))))/2;
    else if(p.tip==='dus'){
      if(p.basT&&PLT_T-p.basT>0.45){p.vy+=G*0.6*dt;p.y-=p.vy*dt;if(p.y<CUKUR_Y){p.basT=0;p.vy=0;p.yok=PLT_T+2.5}}
      if(p.yok&&PLT_T>=p.yok){p.yok=0;p.y=p.y0}      // 2.5 sn sonra yerine geri gelir
    }else p.y=p.y0;
    if(p.yok)p.y=CUKUR_Y-1000;
    p.dx=p.x-ox;p.dy=p.y-oy;p.sq=Math.max(0,p.sq-dt*4);
  }
  if(S.yer&&S.pltOn){S.x+=S.pltOn.dx;S.y+=S.pltOn.dy}      // hareketli platform oyuncuyu taşır
  for(let i=DUS.length-1;i>=0;i--){const e=DUS[i];if(e.y<-2500&&!e.boss&&!e.tut&&!(S.ust&&S.ust.e===e))DUS.splice(i,1)}      // çukura düşen düşman kaybolur
}
function pltDestek(x,y){      // x'te, y'nin altındaki (veya hemen üstündeki) en yüksek yüzey; PLT_ALT: üstüne basılan platform
  let en=zemin(x);PLT_ALT=null;
  for(const p of PLT){const b=pltBoy(p);if(!b||p.yok)continue;const w=b[0];
    if(x>p.x+w*0.05&&x<p.x+w*0.95&&p.y<=y+40&&p.y>en){en=p.y;PLT_ALT=p}}
  for(const r of YOL)if(x>r.x0&&x<r.x1&&r.y<=y+40&&r.y>en){en=r.y;PLT_ALT=r}
  return en;
}
function pltSonra(){      // iniş/ayakta durma sonrası: yay, düşen platform, güvenli nokta, çukur
  const p=S.yer?PLT_ALT:null;S.pltOn=p;
  if(p&&p.tip==='yay'){S.vy=-ZIP1*p.k;S.yer=false;S.pltOn=null;p.sq=1;S.ekstra=(YV('D')?1:0)+(YA('K')?1:0);S.donuyor=false;ziplaCal()}
  else if(p&&p.tip==='dus'&&!p.basT)p.basT=PLT_T;
  if(S.yer){
    if(!p&&zeminVar(S.x-300)&&zeminVar(S.x+300)){S.guvX=S.x;S.guvY=S.y}
    else if(p&&(p.tip==='sabit'||p.x1)){const x0=p.x1?p.x0:p.x,x1=p.x1?p.x1:p.x+pltBoy(p)[0];if(S.x>x0+250&&S.x<x1-250){S.guvX=S.x;S.guvY=S.y}}
  }
  if(S.y<-2200&&S.durum==='oyun'){      // çukura düştü
    S.hp=Math.max(0,S.hp-40);S.pops.push({x:S.x,y:S.y+1050,t:0,txt:'-40',f:0.3});
    S.x=S.guvX||0;S.y=(S.guvY||0)+300;S.vx=0;S.vy=0;S.yer=false;S.camY=S.guvY||0;S.camZ=S.guvY||0;S.inv=S.t+1.5;S.atk=null;S.kuyruk.length=0;S.lungeT=-1;
    if(typeof zpkTemizle==='function')zpkTemizle(true);
  }
}
function pltCiz(){      // platformlar ve yükseltilmiş yollar: karakterlerin arkasında
  const zY=ZY(),sy=y=>zY-(y-S.camY)*SC;
  const T=CVR.tahta;
  if(T){const tw=TAHTA_W*SC,th=tw*T.height/T.width;
    for(const r of YOL){const a=W/2+(r.x0-S.x)*SC,b=W/2+(r.x1-S.x)*SC;if(b<0||a>W)continue;
      const y0=sy(r.y)-th*TAHTA_AYAK;ctx.save();ctx.beginPath();ctx.rect(a,y0-10,b-a,th+20);ctx.clip();
      for(let x=a;x<b;x+=tw-1)ctx.drawImage(T,Math.floor(x),y0,Math.ceil(tw)+1,th);
      ctx.restore()}}
  for(const p of PLT){const im=PRI[p.ad];if(!im||p.yok)continue;const w=im.width*PLT_K*SC,h=im.height*PLT_K*SC,x=W/2+(p.x-S.x)*SC;
    if(x+w<0||x>W)continue;
    let top=sy(p.y)-h*PAR[p.ad],hh=h;
    if(p.tip==='yay'&&p.sq>0){const k=1-0.3*Math.sin(p.sq*Math.PI);hh=h*k;top+=h-hh}      // yay basılınca sıkışır
    let sx=0;if(p.tip==='dus'&&p.basT&&PLT_T-p.basT<0.45)sx=(Math.random()-0.5)*8;      // düşmeden önce titrer
    ctx.drawImage(im,Math.round(x+sx),Math.round(top),Math.round(w),Math.round(hh))}
}
function zeminKlip(){      // çukurlarda tahta iskele çizilmez
  ctx.beginPath();for(const [a,b] of ZEMIN_PAR){const x0=Math.max(-10,W/2+(a-S.x)*SC),x1=Math.min(W+10,W/2+(b-S.x)*SC);if(x1>x0)ctx.rect(x0,-10,x1-x0,H+20)}ctx.clip();
}
pltKur();
