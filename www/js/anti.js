'use strict';
// Anti yetenekler: oyuncu ölünce (verilmiş yeteneği varsa) ağaç zorunlu seçimle açılır, seçilen yetenek anti haline döner (YA(k)).
// Etkiler: hasar çarpanları (antiHasar), vuruş sonrası (antiVurSonra), öldürme (antiOldu), blok (antiBlok), her kare (antiGuncelle), iniş (antiInis), çizim (antiCiz).
const BCK=[];      // bumerang bıçaklar (Bıçak Atlama anti)
let ATES=[];       // ateş parçacıkları (dünya koordinatı)
// ---- Oyuncu ölüm animasyonu: dizlerine düşer (yere çarpınca sekme + düşme sesi), elleriyle karnını tutar, karnından kan fışkırır, sonra yüz üstü yere yığılır ----
const OL_YIGIL=2.0;      // yığılma başlangıcı (sn); 0.7 sn sürer, sonra yerde yatar
function olumBasla(){
  S.ol={t0:S.t,dn:0,dy:0,diz:false,yat:false,gos:false,kT:0};S.rk=null;rkIptal();
  if(S.pence)penceKapa();
  S.atk=null;S.sarj=0;S.blok=false;S.sman=null;S.yy=null;S.alk=null;S.dkick=null;S.slam=false;S.shoryu=0;S.tats=0;S.donuyor=false;S.dag=null;S.ust=null;S.kay=null;S.sup=null;S.omuz=null;S.yeme=null;S.uzan=null;S.pend=null;
  zpkTemizle(true);bufCal(PDS,1);
  if(OGV.karin&&S.t-OGV.t<0.2)kanFiskir(OGV.karin[0],OGV.karin[1],S.yon,0.5);
}
function olumGuncelle(dt){
  const o=S.ol;if(!o)return;
  const u=S.t-o.t0,ez=x=>x*x*(3-2*x);
  if(!o.diz&&u>=0.4){o.diz=true;if(WDS)bufCal(WDS,1);else torbaCal(INS,INSBAG,1);karBas(S.x+S.yon*20,260,KMIN-4,false);tasSac(S.x,2,0.8);S.sars=Math.max(S.sars,5);titre(40)}      // dizler yere çarpar: zıplayıp düşme sesi
  o.dy=o.diz&&u<0.64?22*Math.sin(Math.PI*kisit((u-0.4)/0.24,0,1)):0;      // dizde hafif sekme
  if(u>0.1&&u<OL_YIGIL+0.3&&OGV.karin){o.kT-=dt;if(o.kT<=0){o.kT=0.12;kanFiskir(OGV.karin[0],OGV.karin[1],S.yon,0.18+0.15*Math.random())}}      // karından kan fışkırır
  o.dn=ez(kisit((u-OL_YIGIL)/0.7,0,1));S.spin=o.dn*Math.PI/2*0.97;
  if(!o.yat&&u>=OL_YIGIL+0.68){o.yat=true;bufCal(DSS,1);karBas(S.x,300,KMIN-6,false);tasSac(S.x,3,0.9);S.sars=Math.max(S.sars,8);titre(60)}      // yüz üstü yere çarpınca düşmanların yere düşme sesi
  if(!o.gos&&u>=3.0){o.gos=true;bufCal(GOS,1)}      // YENİLDİN yazısıyla birlikte
}
// ---- Süpermen anti (S): gizlilik ----
// Düşman oyuncuyu fark etmeden (e.akt yok) arkasındaysak: eğilerek yürürsek hiç dönmez (ayakta 900 birimden yakında duyar). Arkadan yumruk = 10x hasar (gizli vuruş).
// Biri ölünce ya da oyuncu zıplayınca ekranda (kenarında azıcık görünen dahil) fark etmemiş herkes döner ve gelir.
const gizliArka=e=>!e.akt&&!e.boss&&!e.agil&&Math.sign(S.x-e.x||1)!==(e.yon||1);
const gizliKal=(e,dx)=>YA('S')&&!DEMO&&!e.boss&&!e.agil&&Math.sign(dx||1)!==(e.yon||1)&&(asagiMi()||Math.abs(dx)>900);
function sesYay(){      // gürültü: ekrandaki tüm fark etmemiş düşmanlar uyanır
  if(DEMO||typeof DUS==='undefined')return;const yw=W/2/SC;
  for(const e of DUS)if(!e.olu&&!e.akt&&Math.abs(e.x-S.x)<yw+(e.r||200))e.akt=true;
}
// ---- Aduket anti (Y): basılı tutmalı roket yumruk ----
// Yumruk tarafına basılı tut (0.26 sn): yumruk geri çekilip titrer, ön kol+yumruk 1 sn'de %25 büyür (suyu elinde toplar). 1 sn = tam güç. Bırakınca öne roket gibi atılır:
// güç 1x–3x (15–45), menzil 450–1350 birim; enerji/bekleme yok. Giderken yumruktan geriye roket ateşi gibi su fışkırır, yumruk eski boyuna döner.
const RK_SURE=1;let SUL_SRC=null,SUC=[];
function sulSes(ac){      // şarj sesi: basılı tutarken döngüde çalar, bırakınca kesilir
  if(ac&&!SUL_SRC&&AC&&SULS&&!DEMO){const src=AC.createBufferSource(),g=AC.createGain();src.buffer=SULS;src.loop=true;g.gain.value=0.9;src.connect(g);g.connect(SFXC());src.start();SUL_SRC=src}
  else if(!ac&&SUL_SRC){try{SUL_SRC.stop()}catch(_){}SUL_SRC=null}
}
function armSc(ad){      // ön kol + yumruk ölçeği (şişmiş yumruk)
  if(S.cg&&S.cg.k===ad)return 1+0.25*S.cg.lv;
  if(S.rk&&S.rk.k===ad)return 1+(S.rk.sc0-1)*(1-kisit((S.t-S.rk.t0)/S.rk.T,0,1));
  return 1;
}
const cgAci=k=>{const kl=KOL[k];return kl.e>0.35?kisit(kl.th,-70,70):0};      // yumruğun gideceği yön: parmağın basıldığı yerden sürüklendiği yön
function rkIptal(){S.cg=null;SUC.length=0;sulSes(false)}
function rkAt(k){      // parmak kalktı: roket yumruk
  const c=S.cg;if(!c||c.k!==k)return;
  const lv=c.lv,ang=cgAci(k),dist=450*(1+2*lv),T=0.32+0.18*lv,ar=ang*D;
  S.rk={k,t0:S.t,T,lv,ang,sc0:1+0.25*lv,hit:new Set()};
  S.lungeS=S.t;S.lungeT=S.t+T;S.lungeV=S.yon*1.5*dist/T*Math.cos(ar);S.sonAtk=S.t;      // parmak yönüne atılım (hız zamanla düşer: toplam yol = dist)
  if(ang<-12){S.yer=false;S.vy=Math.max(-4200,1.25*dist/T*Math.sin(ar))}      // yukarı-ileri (saat 2 gibi): havaya doğru uçarak gider
  if(WWS)bufCal(WWS,1);
  rkIptal();S.sars=Math.max(S.sars,6+8*lv);titre(30+40*lv);
}
function rkGuncelle(dt){
  const ok=YA('Y')&&!S.pence&&S.durum==='oyun'&&!DEMO;
  if(S.cg){
    const c=S.cg,iz=izBul(c.k);
    if(!ok||!iz||S.blok||KOL[c.k==='N'?'F':'N'].ak||tutan(c.k)||S.sman||S.yy||S.alk||S.tats>0||S.dkick||S.shoryu>0||S.donuyor||S.slam||!S.yer){rkIptal()}
    else{
      c.lv=kisit((S.t-c.t0)/RK_SURE,0,1);sulSes(true);
      if(S.t-c.t0<RK_SURE){const n=Math.round(70*dt+Math.random());for(let i=0;i<n;i++)SUC.push({a:Math.random()*6.283,r:150+Math.random()*220,t:0,T:0.28+Math.random()*0.15})}      // 1 sn boyunca su yumruğa doğru çekilir
    }
  }else if(ok&&!S.rk&&S.yer&&!S.atk&&S.sarj<=0&&!S.sman&&!S.yy&&!S.alk&&!(S.tats>0)&&!S.dkick&&!(S.shoryu>0)&&!S.donuyor&&!S.slam&&!S.blok&&!S.ust&&!S.pend&&!S.yeme&&!ZPK.ac&&!tutmaVar()&&S.t-(S.yirtT||-9)>=1){
    for(const k of ['N','F']){
      const iz=izBul(k);
      if(!iz||iz.cg||iz.maxd>=22||performance.now()-iz.t0<260||KOL[k==='N'?'F':'N'].ak||tutan(k)||HS[k]==='tut')continue;
      S.cg={k,t0:S.t,lv:0};iz.cg=true;break;
    }
  }
  for(let i=SUC.length-1;i>=0;i--){const p=SUC[i];p.t+=dt;if(p.t>=p.T)SUC.splice(i,1)}
  const r=S.rk;
  if(r){
    if(S.t-r.t0>=r.T||S.durum!=='oyun'){S.rk=null;return}
    const h=EL[r.k],sc=armSc(r.k),n=Math.round((3+5*r.lv)*dt*60);
    for(let i=0;i<n&&ADKD.length<240;i++)ADKD.push({x:h.wx-S.yon*30*sc,y:h.wy+(Math.random()-0.5)*40,vx:-S.yon*(700+Math.random()*900)+S.vx*0.2,vy:(Math.random()-0.5)*600,t:0,T:0.3+Math.random()*0.3,k:(0.6+Math.random()*0.7)*0.8});      // roket ateşi gibi geriye su
    for(const e of DUS){
      if(e.olu||e.tut||r.hit.has(e)||!elDeg(e,r.k,60*sc))continue;
      r.hit.add(e);
      S.pSes=true;S.pHx=h.wx;S.cs='y';S.vEl=r.k;vur(e,15*(1+2*r.lv),S.yon*3000,0,0.5+0.5*r.lv,h.wy);S.pSes=false;S.cs=null;S.vEl=null;S.pHx=undefined;e.hitT[r.k]=S.t+0.5;
    }
  }
}
function cgPoz(o){      // şarj: kol geri gitmez; yumruk parmağın o an tutulduğu yöne (gideceği yöne) dönük bekler, hafif titrer, dirsekten öne doğru şişer
  const k=S.cg.k,u=k==='N'?'aNu':'aFu',r=k==='N'?'aNr':'aFr',lv=S.cg.lv;
  o[u]=cgAci(k)-90+Math.sin(S.t*70)*(1+2*lv);o[r]=80;o.lN=-12;o.bN=22;o.lF=16;o.bF=24;
}
function rkPoz(o){      // atılış: kol dümdüz uzanır, gövde ileri yatar
  const k=S.rk.k,u=k==='N'?'aNu':'aFu',r=k==='N'?'aNr':'aFr';
  o[u]=S.rk.ang-90;o[r]=90;o.torso+=14;o.bas-=4;o.lN=-45;o.bN=45;o.lF=35;o.bF=60;
}
function sulCiz(){      // yumruğa çekilen su damlaları + yumruk çevresinde mavi ışık
  if(!S.cg)return;
  const h=EL[S.cg.k],hx=W/2+(h.wx-S.x)*SC,hy=ZY()-(h.wy-S.camY)*SC;
  adkIsik(hx,hy,(90+90*S.cg.lv)*SC,0.35+0.35*S.cg.lv);
  const im=R.damla;if(!im)return;
  for(const p of SUC){
    const u=p.t/p.T,rr=p.r*Math.pow(1-u,1.4),sx=W/2+(h.wx+Math.cos(p.a)*rr-S.x)*SC,sy=ZY()-(h.wy+Math.sin(p.a)*rr-S.camY)*SC,w=95*0.75*SC,hh=w*im.height/im.width;
    donCiz(im,sx,sy,Math.atan2(Math.sin(p.a),-Math.cos(p.a)),Math.min(1,u*4)*Math.min(1,(1-u)*4+0.3),-w*0.75,-hh/2,w,hh);      // kalın ucu yumruğa doğru
  }
  tabanDon();
}
// ---- ölüm: seçim ekranı kısa süre sonra açılır ----
function antiOlum(){
  if(antiAday().length){S.antiBek=S.t+3.5;return}      // ölüm animasyonu bitince seçim ekranı açılır
  if(HPMAX<=100){tamSifirla();return}      // öldürülecek skill yok, maks. can 100: oyun tamamen biter
  AG.cip++;HPMAX=Math.max(100,HPMAX-10);agKaydet();if(HPMAX<=100)S.pops.push({x:S.x,y:S.y+1400,t:0,txt:dil('cip_son'),f:1.6});      // hiç verilmiş yetenek yokken ölüm: maks. can -10, her vuruşa +1 hasar (birikir)
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
  if(YA('G')&&yum)k*=0.9;                              // Hızlı Eller: yumruk hasarı -%10 (vuruşlar %20 hızlı: kombo.js atkGuncelle)
  if(YA('H'))k*=1.2;                                   // can çalma yerine +%20 saldırı
  if(YA('X')&&S.hp<HPMAX*0.25)k*=1.5;                  // öfke: can %25 altında
  if(YA('T')&&S.pence)k*=1.2;                          // bıçak hasarı +%20
  if(YA('Y')&&yum)k*=1.3;                              // yumruk hasarı +%30
  if(YA('S')&&yum&&gizliArka(e)){k*=10;S.antiKrit=true}      // gizli vuruş: fark etmemiş düşmana arkadan yumruk 10x
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
  if(YA('J')&&Math.random()<0.05){e.yan={son:S.t+4,tik:(e.yan&&e.yan.tik)||S.t+0.5};if(S.cs==='y'&&S.vEl)S.atesEl={k:S.vEl,son:S.t+0.6}}      // yakan yumruk alev alır      // Ateşli Aparkat öldürülünce: her vuruş %5 yakar, 4 sn
  if(YA('I')&&!e.tut&&Math.random()<(e.boss?0.025:0.05)){e.st=Math.max(e.st||0,S.t+(e.boss?0.65:1.3));e.ser=e.st;S.pops.push({x:e.x,y:e.y+e.cy+e.r+120,t:0,txt:dil('sersem'),f:0.5})}      // %15 sersemletir
  if(YA('P')&&S.cs==='y'&&!S.pence&&Math.random()<0.25){if(!e.kanama)S.pops.push({x:e.x,y:e.y+e.cy+e.r+120,t:0,txt:dil('kanama'),f:0.4});e.kanama={son:S.t+4,tik:S.t+0.5}}      // %25 kanama
}
function antiOldu(e){
  if(YA('O')&&S.hp>0){const c=Math.round((e.max||100)*0.1);S.hp=Math.min(HPMAX,S.hp+c);S.pops.push({x:S.x,y:S.y+1050,t:0,txt:dil('can_pop',c),f:0.4,mavi:1})}      // öldürünce düşmanın maks. canının %10'u kadar can (boss dahil)
  e.yan=null;e.kanama=null;
}
const antiDolumYok=()=>false;      // Can Dolumu %2/%3 öldürülünce sadece bonus gider; karakterin kendi pasif dolumu kalır
function antiBlok(e){      // blok / parry: çevredeki düşmanlar sersemler (Alkış anti)
  if(!YA('AL')||S.t-(S.alAntiT||-9)<0.8)return;S.alAntiT=S.t;
  for(const o of DUS){if(o.olu||o.tut||Math.abs(o.x-S.x)>900||(o.boss&&Math.random()<0.5))continue;o.st=Math.max(o.st||0,S.t+(o.boss?0.65:1.3));o.ser=o.st;o.vx=(o.x>=S.x?1:-1)*(o.boss?150:600)}
  S.pops.push({x:S.x,y:S.y+1150,t:0,txt:dil('sersem'),f:0.6});S.sars=Math.max(S.sars,8);
}
const antiBlokKat=()=>YA('W')?0.25:0.5;      // blokta geçen hasar
const antiHiz=()=>(YA('E')&&S.yer?1.2:1)*(YA('D')&&!S.yer?2:1);      // koşu +%20 / havada ileri hız 2x
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
    if(e.yan){if(S.t>=e.yan.son)e.yan=null;else if(S.t>=e.yan.tik){e.yan.tik+=0.5;dotVur(e,Math.max(1,Math.round((5+AG.cip)/2)))}}      // yanma: düz vuruşun (5 + ölüm bonusu) yarısı
    if(e.kanama&&!e.olu){if(S.t>=e.kanama.son)e.kanama=null;else if(S.t>=e.kanama.tik){e.kanama.tik+=0.5;kanVurus(e.x,e.y+e.cy*(0.8+Math.random()*0.6),0.15,Math.random()<0.5?-1:1,false);dotVur(e,3)}}
  }
  if(S.durum!=='oyun')return;
  if(YA('A')&&S.yer&&Math.abs(S.vx)>HIZ*0.7){      // omuz atma: koşarak çarpınca yere serer
    const sg=Math.sign(S.vx);
    for(const e of DUS){
      if(e.olu||e.dus||e.tut||S.t<(e.omT||0))continue;
      const dx=(e.x-S.x)*sg;if(S.omuz||dx<0||dx>400||Math.abs(e.y-S.y)>300)continue;
      e.omT=S.t+1;if(Math.random()>=0.25)continue;      // her yaklaşmada değil: %25 şansla
      S.omuz={t0:S.t,e,sg,hit:false};e.st=Math.max(e.st||0,S.t+0.2);      // önce omuz hamlesi (poz oyuncu.js), vuruş 0.14 sn sonra
    }
  }
  if(S.omuz){const o=S.omuz,u=S.t-o.t0,e=o.e;
    if(!o.hit&&u>=0.14){o.hit=true;
      if(!e.olu){S.pSes='tekme';vur(e,25,o.sg,0.5,1,e.y+e.cy);S.pSes=false;      // çok güçlü omuz
        if(!e.olu&&!e.boss){e.cy0=e.cy0||e.cy;e.dus={t0:S.t,son:S.t+DUS_DUS+2.4+DUS_KALK,yn:o.sg};e.vx=o.sg*1900;e.vy=900}}
      S.vx*=0.5;S.sars=Math.max(S.sars,18);titre(80)}
    if(u>0.45)S.omuz=null}
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
    if(Math.abs(dx)<R0+e.r*0.4&&e.y-zemin(e.x)<250)S.yerV=true;vur(e,dm,(dx>=0?1:-1)*0.6,0.8,0.4+0.3*g/1.7,S.y+100);S.yerV=false;
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
  let n=dt*38;while(n>0){if(n<1&&Math.random()>n)break;n--;
    if(ATES.length>220)ATES.shift();
    const p=ps[Math.floor(Math.random()*ps.length)];
    ATES.push({x:p[0]+(Math.random()-0.5)*90*bs,y:p[1]+(Math.random()-0.5)*90*bs,vx:(Math.random()-0.5)*120+e.vx*0.3,vy:380+Math.random()*420,s:(70+Math.random()*80)*bs,t0:S.t,L:0.45+Math.random()*0.4,f:Math.random()*6})}
}
function atesListe(L,dt,m){      // ateş parçacıkları: saydam sarı → turuncu → kırmızı geçişli; m: opaklık çarpanı
  if(!L.length)return;
  ctx.save();
  for(let i=L.length-1;i>=0;i--){const p=L[i],u=(S.t-p.t0)/p.L;if(u>=1){L.splice(i,1);continue}
    p.x+=(p.vx+Math.sin(S.t*9+p.f)*(p.sal||90))*dt;p.y+=p.vy*dt;p.vy+=120*dt}
  const ek=(im,op,u0,u1,bk,lit)=>{      // u0-u1: ömrün bu aralığında bu renk görünür
    ctx.globalCompositeOperation=lit?'lighter':'source-over';
    for(const p of L){const u=(S.t-p.t0)/p.L;if(u<u0||u>u1)continue;const k=(u-u0)/(u1-u0),a=op*m*Math.sin(Math.PI*k);
      const sz=p.s*SC*bk*(1+0.5*u)*(1-0.45*u),sx=W/2+(p.x-S.x)*SC,sy=ZY()-(p.y-S.camY)*SC;
      if(sx<-sz||sx>W+sz)continue;ctx.globalAlpha=a;ctx.drawImage(im,sx-sz/2,sy-sz*0.62,sz,sz*1.25)}
  };
  ek(ATS.kir,0.3,0.35,1,1.3,false);      // dış: saydam kırmızı (en son)
  ek(ATS.tur,0.42,0.12,0.85,1.1,false);   // turuncu
  ek(ATS.sar,0.45,0,0.6,0.9,true);        // sarı
  ek(ATS.oz,0.35,0,0.35,0.55,true);       // parlak beyaz-sarı çekirdek (hepsi hafif ve saydam)
  ctx.restore();
}
let ATESE=[];      // yakan yumruğun alevleri (karakterin önünde çizilir)
function atesElCiz(){      // yakan vuruş: yumruk bir süre alev alır; alevler yumruğun hareketinin gerisine doğru savrulur
  const dt=S.dtG||0.016,a=S.atesEl;
  if(a&&S.t<a.son){const h=EL[a.k];if(h){const v=Math.hypot(h.vx||0,h.vy||0)||1,sp=Math.min(1,v/3000),bx=-(h.vx||0)/v,by=-(h.vy||0)/v;
    let n=dt*70;while(n>0){if(n<1&&Math.random()>n)break;n--;if(ATESE.length>120)ATESE.shift();
      const g=200+900*sp;ATESE.push({x:h.wx+(Math.random()-0.5)*40,y:h.wy+(Math.random()-0.5)*40,vx:bx*g+(Math.random()-0.5)*120,vy:by*g+150+Math.random()*150,s:45+Math.random()*45,t0:S.t,L:0.25+Math.random()*0.25,f:Math.random()*6,sal:40})}}}      // hareketin tersine
  else if(a)S.atesEl=null;
  atesListe(ATESE,dt,0.9);
}
function antiCiz(){
  const dt=S.dtG||0.016;
  for(const e of DUS)if(e.yan&&!e.olu)atesUret(e,dt);
  atesListe(ATES,dt,1);
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
