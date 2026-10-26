'use strict';
// Anti yetenekler: oyuncu ölünce (verilmiş yeteneği varsa) ağaç zorunlu seçimle açılır, seçilen yetenek anti haline döner (YA(k)).
// Etkiler: hasar çarpanları (antiHasar), vuruş sonrası (antiVurSonra), öldürme (antiOldu), blok (antiBlok), her kare (antiGuncelle), iniş (antiInis), çizim (antiCiz).
const BCK=[];      // bumerang bıçaklar (Bıçak Atlama anti)
let ATES=[];       // ateş parçacıkları (dünya koordinatı)
// ---- ölüm: seçim ekranı kısa süre sonra açılır ----
function antiOlum(){
  if(antiAday().length){S.antiBek=S.t+1.3;return}
  if(HPMAX<=50){tamSifirla();return}      // öldürülecek skill yok, maks. can 50: oyun tamamen biter
  AG.cip++;HPMAX=Math.max(50,HPMAX-10);agKaydet();      // hiç verilmiş yetenek yokken ölüm: maks. can -10, her vuruşa +1 hasar (birikir)
  S.pops.push({x:S.x,y:S.y+1200,t:0,txt:dil('cip_pop'),f:1});
}
function tamSifirla(){      // her şey sıfırlanır: XP, seviye, skill'ler, öldürülenler, can/hasar cezaları
  AG.acik=new Set([YKOK]);AG.anti.clear();AG.cip=0;AG.top=0;agHesap();HPMAX=250;ENMAX=250;agKaydet();agBtn();
  S.tamSif=true;S.pops.push({x:S.x,y:S.y+1200,t:0,txt:dil('tam_pop'),f:1});
}
// ---- hasar çarpanı (vur içinde, yuvarlamadan önce) ----
function antiHasar(e,dmg){
  if(dmg>=9999||S.antiTik)return dmg;
  let k=1;const yum=S.cs==='y'&&!S.pence,tek=S.cs==='t';
  if(YA('H'))k*=1.2;                                   // can çalma yerine +%20 saldırı
  if(YA('X')&&S.hp<HPMAX*0.25)k*=1.5;                  // öfke: can %25 altında
  if(YA('T')&&S.pence)k*=1.2;                          // bıçak hasarı +%20
  if(YA('Y')&&yum)k*=1.3;                              // yumruk hasarı +%30
  if(YA('S')&&!S.yer)k*=1.5;                           // havadaki vuruşlar +%50
  if(YA('N')&&yum&&S.yer&&asagiMi())k*=2;              // çömelik yumruk 2x
  if(YA('YT')&&e.dus)k*=2;                             // yerde yatana 2x
  if(YA('L')&&tek){S.antiTek=(S.antiTek||0)+1;if(S.antiTek%3===0){k*=2;S.antiKrit=true}}      // her 3. tekme kritik
  dmg=dmg*k+AG.cip;      // yeteneksiz ölümlerden gelen düz hasar
  if(YA('F')&&yum&&!e.boss&&e.hp>0&&e.hp<=e.max*0.2)dmg=Math.max(dmg,Math.ceil(e.hp));      // canı %20 altındaki tek yumrukla ölür
  if(YA('M'))S.en=Math.min(ENMAX,S.en+2);              // her vuruş +2 enerji
  return dmg;
}
function antiVurSonra(e,dmg,hf){
  if(dmg>=9999||S.antiTik||e.olu)return;
  if(YA('Q')&&S.cs==='t'&&!e.tut){e.vx*=1.3;e.vy*=1.3}      // tekmeler %30 daha uzağa
  if(YA('I')&&!e.boss&&!e.tut&&Math.random()<0.15){e.st=Math.max(e.st||0,S.t+1.3);e.ser=e.st;S.pops.push({x:e.x,y:e.y+e.cy+e.r+120,t:0,txt:dil('sersem'),f:0.5})}      // %15 sersemletir
  if(YA('P')&&S.cs==='y'&&!S.pence&&Math.random()<0.25){if(!e.kanama)S.pops.push({x:e.x,y:e.y+e.cy+e.r+120,t:0,txt:dil('kanama'),f:0.4});e.kanama={son:S.t+4,tik:S.t+0.5}}      // %25 kanama
}
function antiOldu(e){
  if(YA('O')&&S.hp>0){const c=Math.round((e.max||100)*0.1);S.hp=Math.min(HPMAX,S.hp+c);S.pops.push({x:S.x,y:S.y+1050,t:0,txt:dil('can_pop',c),f:0.4,mavi:1})}      // öldürünce düşmanın maks. canının %10'u kadar can (boss dahil)
  e.yan=null;e.kanama=null;
}
const antiDolumYok=()=>false;      // Can Dolumu %2/%3 öldürülünce sadece bonus gider; karakterin kendi pasif dolumu kalır
function antiBlok(e){      // blok / parry: çevredeki düşmanlar sersemler (Alkış anti)
  if(!YA('AL')||S.t-(S.alAntiT||-9)<0.8)return;S.alAntiT=S.t;
  for(const o of DUS){if(o.olu||o.tut||Math.abs(o.x-S.x)>900)continue;o.st=Math.max(o.st||0,S.t+(o.boss?0.6:1.3));o.ser=o.st;o.vx=(o.x>=S.x?1:-1)*(o.boss?150:600)}
  S.pops.push({x:S.x,y:S.y+1150,t:0,txt:dil('sersem'),f:0.6});S.sars=Math.max(S.sars,8);
}
const antiBlokKat=()=>YA('W')?0.25:0.5;      // blokta geçen hasar
const antiHiz=()=>(YA('E')&&S.yer?1.2:1)*(YA('D')&&!S.yer?2:1);      // koşu +%20 / havada ileri hız 2x
const antiFirlat=()=>YA('G')?1.4:1;      // fırlatılan düşman daha uzağa
const antiCarp=e=>e.atil&&YA('G')?2:1;    // fırlatılan düşman çarptığına 2x
// ---- sürekli hasar (yanma, kanama) ----
function dotVur(e,d){
  if(e.hp-d<=0){S.antiTik=true;vur(e,d,0,0.1,0.05,e.y+e.cy);S.antiTik=false;return}
  e.hp-=d;e.fl=0.1;S.pops.push({x:e.x+(Math.random()-0.5)*80,y:e.y+e.cy+e.r,t:0,txt:'-'+d,f:0.12});
}
// ---- her kare ----
function antiGuncelle(dt){
  if(S.antiBek&&S.t>=S.antiBek){S.antiBek=0;if(S.durum==='yenildi')antiAc()}
  if(!S.yer)S.tepe=Math.max(S.tepe||S.y,S.y);else S.tepe=S.y;      // inişte düşme yüksekliği
  for(const e of DUS){
    if(e.olu){e.yan=null;e.kanama=null;continue}
    if(YA('J')&&!e.tut&&e.sonV!==undefined&&S.t-e.sonV<0.25&&e.vy>1000){e.yan={son:S.t+3,tik:(e.yan&&e.yan.tik)||S.t+0.5}}      // havaya fırlatılan düşman yanar
    if(e.yan){if(S.t>=e.yan.son)e.yan=null;else if(S.t>=e.yan.tik){e.yan.tik+=0.5;dotVur(e,5)}}
    if(e.kanama&&!e.olu){if(S.t>=e.kanama.son)e.kanama=null;else if(S.t>=e.kanama.tik){e.kanama.tik+=0.5;kanVurus(e.x,e.y+e.cy*(0.8+Math.random()*0.6),0.15,Math.random()<0.5?-1:1,false);dotVur(e,3)}}
  }
  if(S.durum!=='oyun')return;
  if(YA('A')&&S.yer&&Math.abs(S.vx)>HIZ*0.7){      // omuz atma: koşarak çarpınca yere serer
    const sg=Math.sign(S.vx);
    for(const e of DUS){
      if(e.olu||e.dus||e.tut||S.t<(e.omT||0))continue;
      const dx=(e.x-S.x)*sg;if(dx<0||dx>240||Math.abs(e.y-S.y)>300)continue;
      e.omT=S.t+1;if(Math.random()>=0.25)continue;      // her çarpışta değil: %25 şansla
      S.pSes='tekme';vur(e,25,sg,0.5,1,e.y+e.cy);S.pSes=false;      // çok güçlü omuz
      if(!e.olu&&!e.boss){e.cy0=e.cy0||e.cy;e.dus={t0:S.t,son:S.t+DUS_DUS+2.4+DUS_KALK,yn:sg};e.vx=sg*1900;e.vy=900}
      S.vx*=0.5;S.sars=Math.max(S.sars,18);titre(80);
    }
  }
  if(YA('B')){      // varile tekme: top gibi uçar
    const tek=(S.atk&&/^kick/.test(S.atk.ad))||(S.kay&&S.t<S.kay.t0+S.kay.T)||S.dkick;
    if(tek)for(const v of VAR){
      if(v.d!=='yer'&&v.d!=='dus')continue;
      for(const L of ['N','F']){const a=AY[L]&&AY[L].a;if(!a)continue;
        if(Math.abs(a[0]-v.x)<V_W/2+70&&a[1]<v.y+V_MRK+40){const dir=Math.sign(v.x-S.x)||S.yon;v.d='uc';v.tek=true;v.f=0.7;v.vx=dir*2900;v.vy=1200;v.vr=dir*9;ses('tekme');S.sars=Math.max(S.sars,8);break}}
    }
  }
  bicakGuncelle(dt);
}
// ---- iniş: yüksekten inince taşlar fışkırır (Süper Kahraman İnişi anti) ----
function antiInis(zH){
  if(!YA('U'))return;
  const h=(S.tepe||zH)-zH;S.tepe=zH;if(h<380)return;
  const dm=Math.round(kisit((h-300)/40,3,25)),g=kisit(h/900,0.6,1.7),R0=kisit(300+h*0.45,450,1100);
  S.sars=Math.max(S.sars,8+10*g);titre(Math.round(40*g));
  for(let i=-2;i<=2;i++)tasSac(S.x+i*R0*0.35,Math.round(2+3*g),g*(1-Math.abs(i)*0.18));
  fxEkle(R.patla,S.x,R0*0.9,0.4,true,Math.random()<0.5);
  for(const e of DUS){
    if(e.olu||e.tut)continue;const dx=e.x-S.x;
    if(Math.abs(dx)<R0+e.r*0.4&&e.y-zemin(e.x)<250)vur(e,dm,(dx>=0?1:-1)*0.6,0.8,0.4+0.3*g/1.7,S.y+100);
  }
}
// ---- bumerang bıçak (Bıçak Atlama anti) ----
function bicakAt(dir){
  if(!S.pence||BCK.length||S.durum!=='oyun')return;
  if(!enerji(25))return;
  BCK.push({x:S.x+dir*160,y:S.y+620,vx:dir*4200,dir,t0:S.t,geri:false,vurd:new Set(),a:0});savurCal(S.x);
}
function bicakGuncelle(dt){
  for(let i=BCK.length-1;i>=0;i--){
    const b=BCK[i];b.a+=dt*22*b.dir;
    if(!b.geri){b.x+=b.vx*dt;if(S.t-b.t0>0.5){b.geri=true;b.vurd.clear()}}
    else{const tx=S.x,ty=S.y+620,dx=tx-b.x,dy=ty-b.y,L=Math.hypot(dx,dy);if(L<180||S.t-b.t0>3){BCK.splice(i,1);continue}const st=Math.min(L,4600*dt);b.x+=dx/L*st;b.y+=dy/L*st}
    for(const e of DUS){
      if(e.olu||b.vurd.has(e))continue;
      if(Math.abs(b.x-e.x)<e.r*0.6+70&&b.y>e.y&&b.y<e.y+e.cy*2.1){b.vurd.add(e);S.pSes=true;S.cs='b';vur(e,30,b.geri?-b.dir:b.dir,0.2,0.5,b.y);S.cs=null;S.pSes=false}
    }
  }
}
// ---- çizim: ateş (saydam sarı → turuncu → kırmızı geçişli) ve bumerang bıçak ----
const ATS=(()=>{      // yumuşak ışık lekeleri: bir kez hazırlanır, her parçacık tek drawImage
  const yap=(dur)=>{const c=document.createElement('canvas');c.width=c.height=64;const x=c.getContext('2d'),g=x.createRadialGradient(32,32,0,32,32,32);dur.forEach(([o,r])=>g.addColorStop(o,r));x.fillStyle=g;x.fillRect(0,0,64,64);return c};
  return {
    oz:yap([[0,'rgba(255,255,235,1)'],[0.35,'rgba(255,240,150,.85)'],[1,'rgba(255,200,60,0)']]),
    sar:yap([[0,'rgba(255,225,90,.95)'],[0.45,'rgba(255,170,40,.6)'],[1,'rgba(255,120,20,0)']]),
    tur:yap([[0,'rgba(255,140,30,.85)'],[0.5,'rgba(240,80,20,.45)'],[1,'rgba(200,30,10,0)']]),
    kir:yap([[0,'rgba(220,40,15,.6)'],[0.55,'rgba(150,20,10,.25)'],[1,'rgba(90,10,10,0)']])
  };
})();
function atesUret(e,dt){
  const b=e._b,bs=e.bs||1,ps=[];
  if(b&&S.t-b.t<0.2){for(const n of ['kafa','boy','kal','dN','dF'])if(b[n])ps.push([b[n].x,b[n].y])}
  if(!ps.length)ps.push([e.x,e.y+e.cy]);
  let n=dt*55;while(n>0){if(n<1&&Math.random()>n)break;n--;
    if(ATES.length>220)ATES.shift();
    const p=ps[Math.floor(Math.random()*ps.length)];
    ATES.push({x:p[0]+(Math.random()-0.5)*90*bs,y:p[1]+(Math.random()-0.5)*90*bs,vx:(Math.random()-0.5)*120+e.vx*0.3,vy:380+Math.random()*420,s:(70+Math.random()*80)*bs,t0:S.t,L:0.45+Math.random()*0.4,f:Math.random()*6})}
}
function antiCiz(){
  const dt=S.dtG||0.016;
  for(const e of DUS)if(e.yan&&!e.olu)atesUret(e,dt);
  if(ATES.length){
    ctx.save();
    for(let i=ATES.length-1;i>=0;i--){const p=ATES[i],u=(S.t-p.t0)/p.L;if(u>=1){ATES.splice(i,1);continue}
      p.x+=(p.vx+Math.sin(S.t*9+p.f)*90)*dt;p.y+=p.vy*dt;p.vy+=120*dt}
    const ek=(im,op,u0,u1,bk,lit)=>{      // u0-u1: ömrün bu aralığında bu renk görünür
      ctx.globalCompositeOperation=lit?'lighter':'source-over';
      for(const p of ATES){const u=(S.t-p.t0)/p.L;if(u<u0||u>u1)continue;const k=(u-u0)/(u1-u0),a=op*Math.sin(Math.PI*k);
        const sz=p.s*SC*bk*(1+0.5*u)*(1-0.45*u),sx=W/2+(p.x-S.x)*SC,sy=ZY()-(p.y-S.camY)*SC;
        if(sx<-sz||sx>W+sz)continue;ctx.globalAlpha=a;ctx.drawImage(im,sx-sz/2,sy-sz*0.62,sz,sz*1.25)}
    };
    ek(ATS.kir,0.55,0.35,1,1.3,false);      // dış: saydam kırmızı (en son)
    ek(ATS.tur,0.75,0.12,0.85,1.1,false);   // turuncu
    ek(ATS.sar,0.8,0,0.6,0.9,true);         // sarı
    ek(ATS.oz,0.7,0,0.35,0.55,true);        // parlak beyaz-sarı çekirdek
    ctx.restore();
  }
  for(const b of BCK){      // dönen bıçak: gümüş ağız, kahverengi sap
    const sx=W/2+(b.x-S.x)*SC,sy=ZY()-(b.y-S.camY)*SC,s=SC;
    ctx.save();ctx.translate(sx,sy);ctx.rotate(b.a);ctx.scale(s,s);
    for(let j=0;j<2;j++){ctx.rotate(Math.PI);
      const g=ctx.createLinearGradient(0,-20,0,20);g.addColorStop(0,'#f4f7fa');g.addColorStop(0.5,'#aab4bd');g.addColorStop(1,'#5d6870');
      ctx.fillStyle=g;ctx.strokeStyle='#1f2a33';ctx.lineWidth=6;ctx.beginPath();ctx.moveTo(30,-14);ctx.quadraticCurveTo(120,-40,175,0);ctx.quadraticCurveTo(110,-6,30,14);ctx.closePath();ctx.fill();ctx.stroke()}
    ctx.fillStyle='#7a4a1c';ctx.strokeStyle='#1f2a33';ctx.lineWidth=6;ctx.beginPath();ctx.arc(0,0,34,0,Math.PI*2);ctx.fill();ctx.stroke();
    ctx.restore();
    ctx.save();ctx.globalAlpha=0.25;ctx.strokeStyle='#ffffff';ctx.lineWidth=4;ctx.beginPath();ctx.arc(sx,sy,190*s,0,Math.PI*2);ctx.stroke();ctx.restore();      // dönme izi
  }
}
