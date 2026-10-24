'use strict';
// Zıpkın: iki kola takılı kanca tabancası. Sol alttaki butonla (PC'de X) açılır/kapanır; açıkken yumruk yerine ekrana basınca o yarının kolu
// (sağ yarı = ön kol N, sol yarı = arka kol F) parmağın bastığı yere zıpkın atar, arkasından halat (parca/z_ip, uç uca döşenir) uzanır.
// Parmak basılı kaldıkça halat tutulur; parmak kalkınca halat bırakılır, zıpkın geri sarılır (sallanırken bırakınca hızla savrulur).
// Nesneye (ev, kazık, lamba, iskele) saplanınca parmak joystick gibi çalışır (merkez = ilk basılan yer):
//   çapaya doğru kaydır = kendini çek / tırman, ters yöne = halatı sal / in, yana gezdir = sallan; çapaya doğru hızlı fiske = çapaya fırla.
//   Asılıyken zıplama = halatları bırakıp sıçra. Telefon eğimi / sol-sağ tuşları da sallar.
// Düşmana saplanınca: 20 hasar, düşman iki eliyle mızrağı tutup çırpınır (saldıramaz). Parmağı kendine doğru çek = düşmanı çek
//   (oyuncu uzaklaşınca da sürüklenir), hızlı geri fiske = kendine savur, düşmana doğru hızlı fiske = mızrağı kopar. Kaptan tutmaz, mızrak kısa sürede çıkar.
// Varile saplanınca: geri çek = sürükle, geri fiske = kendine fırlat (yoldaki düşmana çarpar).
const ZP_HIZ=7500,ZP_DON=6500,ZP_MAX=4500,ZP_MIN=260,ZP_SAR=1900,ZP_SALLA=3000,ZP_HASAR=20,ZP_KAL=14,ZP_YAKIN=400;      // uçuş/geri sarma hızı, halat en uzun/en kısa, tırmanma hızı, sallanma gücü, hasar, halat kalınlığı, düşmanı çekince durduğu mesafe
const ZP_AGIZ=[160,-12],ZP_TAB=[236,80],ZP_UC=[97.5,24.5],ZP_DUGUM=66,ZP_GOM={c:24,d:30,v:30};      // ön kol uzayında namlu ağzı; tabanca görselinde namlu ağzı; mızrak görselinde uç; halatın bağlandığı düğüm uçtan geride; saplanınca uç ne kadar gömülür
const ZPK={ac:false,N:null,F:null},zizler=new Map(),ZMASK={};      // ZPK.N/F: o koldaki zıpkın (null = takılı, dolu); zizler: zıpkını tutan parmaklar
let ZP_PAT=null;
const zpkBtn=document.getElementById('zpkB');
zpkBtn.addEventListener('pointerdown',e=>{e.preventDefault();e.stopPropagation();zpkMod(!ZPK.ac)});
function zpkMod(a){ZPK.ac=a;zpkBtn.classList.toggle('ac',a);if(!a)zpkTemizle(true)}
function zpkTemizle(hemen){zizler.clear();for(const k of ['N','F']){if(!ZPK[k])continue;zpkBirak(k);if(hemen)ZPK[k]=null}}
const zpkIzBul=k=>{for(const z of zizler.values())if(z.t===k)return z;return null};
const zpkTutamak=()=>[S.x,S.y+(S.yer&&asagiMi()?540:720)];      // halatın oyuncuyu çektiği nokta (omuz hizası)
function zpkAgiz(k){const z=EL[k].zr;return z?[S.x+z[0],S.y+z[1]]:[S.x+S.yon*60,S.y+700]}      // namlu ağzının dünya konumu (kol çizilirken gövdeye göre kaydedilir)
const zpkCapa=c=>c.p===1?[c.X,c.Y]:[c.X*c.p+S.x*(1-c.p*c.p),S.camY*(1-c.p)+c.Y];      // çapa: derinlik katmanındaki (p) nokta, şu anki dünya konumu (ev katmanı yavaş kayar)
function zpkHedefNok(h){const t=h.hd;
  if(t.tip==='d')return [t.e.x+h.ox*(t.e.yon||1),t.e.y+h.oy];
  if(t.tip==='v')return [t.v.x,t.v.y];
  if(t.tip==='c')return zpkCapa(t);
  return null}
// ---- dokunulan yerde ne var: düşman > varil > ön kazık > lamba > iskele > arka kazık > ev; yoksa boşluk (zıpkın uçar, geri döner) ----
function zpkMaske(ad,im){
  let m=ZMASK[ad];if(m!==undefined)return m;
  try{const k=Math.min(1,128/Math.max(im.width,im.height)),w=Math.max(1,Math.round(im.width*k)),h=Math.max(1,Math.round(im.height*k)),c=document.createElement('canvas');c.width=w;c.height=h;
    const x=c.getContext('2d');x.drawImage(im,0,0,w,h);const d=x.getImageData(0,0,w,h).data,a=new Uint8Array(w*h);for(let i=0;i<w*h;i++)a[i]=d[i*4+3];m={w,h,a}}catch(_){m=null}
  ZMASK[ad]=m;return m;
}
function zpkDolu(ad,im,u,v){      // görselin (u,v) oranındaki noktası (ve biraz çevresi) dolu mu
  if(u<-0.03||u>1.03||v<-0.03||v>1.03)return false;
  const m=zpkMaske(ad,im);if(!m)return u>=0&&u<=1&&v>=0&&v<=1;
  const cx=u*m.w,cy=v*m.h;
  for(let dy=-2;dy<=2;dy++)for(let dx=-2;dx<=2;dx++){const x=Math.floor(cx+dx),y=Math.floor(cy+dy);if(x>=0&&y>=0&&x<m.w&&y<m.h&&m.a[y*m.w+x]>90)return true}
  return false;
}
function zpkKazik(wx,wy,on){
  const K=CVR.kazik;if(!K)return null;
  const h=KAZIK_BOY*(on?1:KAZIK_KUC),w=h*K.width/K.height,oy=on?-KAZIK_ON:KAZIK_ARK,cx=Math.round(wx/KAZIK_ARA)*KAZIK_ARA;
  return zpkDolu('kazik',K,(wx-(cx-w/2))/w,((oy+h/2)-wy)/h)?{tip:'c',p:1,X:wx,Y:wy,wx,wy}:null;
}
function zpkHedef(sx,sy){
  const wx=S.x+(sx-W/2)/SC,wy=S.camY+(ZY()-sy)/SC;
  let en=null,ed=1e9;
  for(const e of DUS){if(e.olu||e.tut||e.dus)continue;if(dusDeg(e,wx,wy,70)){const d=Math.abs(wx-e.x);if(d<ed){ed=d;en=e}}}
  if(en)return {tip:'d',e:en,wx,wy};
  for(const v of VAR)if((v.d==='yer'||v.d==='dus')&&Math.abs(wx-v.x)<V_W/2+25&&Math.abs(wy-v.y)<V_MRK+25)return {tip:'v',v,wx,wy};
  let r=zpkKazik(wx,wy,true);if(r)return r;
  for(const l of CV_LMB){const im=CVR['lamba'+l.k];if(!im||Math.abs(wx-l.x)>700)continue;const h=LAMBA_BOY[l.k],w=h*im.width/im.height;
    if(zpkDolu('lamba'+l.k,im,(wx-(l.x-w/2))/w,1-(wy-LAMBA_GERI)/h))return {tip:'c',p:1,X:wx,Y:wy,wx,wy}}
  {const T=CVR.tahta;if(T){const th=TAHTA_W*T.height/T.width;if(wy<=th*TAHTA_AYAK&&wy>=-th*(1-TAHTA_AYAK))return {tip:'c',p:1,X:wx,Y:wy,wx,wy}}}      // iskele tahtası
  r=zpkKazik(wx,wy,false);if(r)return r;
  {const p=EV_P,s=SC*p,taban=Math.round(ZY()+S.camY*SC*p-TAHTA_ARKA*SC+6*s)+3;      // evler (cevreArka ile aynı yerleşim)
    for(const e of CV_EV){const im=CVR[e.ad];if(!im)continue;const w=e.h*im.width/im.height,cx=W/2+(e.x+w/2-S.x*p)*s,hp=e.h*s,wp=hp*im.width/im.height;
      if(sx<cx-wp/2-6||sx>cx+wp/2+6)continue;
      if(zpkDolu(e.ad,im,(sx-(cx-wp/2))/wp,(sy-(taban-hp))/hp))return {tip:'c',p,X:(wx-S.x*(1-p*p))/p,Y:wy-S.camY*(1-p),wx,wy}}}
  return {tip:'yok',wx,wy};
}
// ---- atış, uçuş, saplanma, geri sarma ----
function zpkAt(k,sx,sy){
  if(S.durum!=='oyun'||ZPK[k])return;
  const t=zpkHedef(sx,sy),h={ph:'haz',t0:S.t,hd:t,x:0,y:0,vx:0,vy:0,a:0,L:0,yol:0,bir:false};
  if(t.tip==='d'){const yn=t.e.yon||1;h.ox=(t.wx-t.e.x)*yn;h.oy=t.wy-t.e.y}
  ZPK[k]=h;
  if(Math.abs(t.wx-S.x)>80)S.yon=t.wx>S.x?1:-1;      // hedefe döner
}
function zpkBirak(k){const h=ZPK[k];if(!h)return;h.bir=true;      // parmak kalktı
  if(h.ph==='tak'){if(h.hd.tip==='c'&&!S.yer)S.zpUcT=S.t+1.5;zpkKopar(k,h,false)}}
function zpkKopar(k,h,sert){      // halat bırakılır / mızrak çıkar, zıpkın geri sarılır
  const t=h.hd;
  if(t.tip==='d'){const e=t.e;if(e.zpk&&e.zpk.k===k)e.zpk=null;
    if(!e.olu){const yn=Math.cos(h.a)>=0?1:-1;e.st=Math.max(e.st||0,S.t+(sert?0.6:0.35));if(sert){kanFiskir(h.x,h.y,-yn,0.5);bufCal(SAPLA,0.7)}else kanVurus(h.x,h.y,0.3,-yn,false)}}
  h.ph='don';h.hd={tip:'yok'};
}
function zpkSapla(k,h,e){
  h.ph='tak';h.tT=S.t;
  if(e){      // düşman: 20 hasar, iki eliyle mızrağı tutar
    h.hd={tip:'d',e};const yn=e.yon||1;h.ox=(h.x-e.x)*yn;h.oy=h.y-e.y;h.yn0=yn;
    bufCal(ZPS_I,1);
    const d0=e.dus,ph=S.pHx;S.pHx=h.x;vur(e,ZP_HASAR,Math.cos(h.a),Math.sin(h.a),0.4,h.y);S.pHx=ph;
    if(!d0&&e.dus){e.dus=null;e.dusA=0;if(e.cy0)e.cy=e.cy0}      // zıpkınla yere düşmez, mızrağı tutar
    if(e.olu){h.ph='don';h.hd={tip:'yok'};return}
    e.vx=e.vy=0;
    if(e.zpk||e.boss||h.bir)h.oto=S.t+(e.boss?0.45:0.25);      // kaptan tutmaz; ikinci zıpkın / bırakılmış parmak: mızrak kısa sürede çıkar
    else e.zpk={k};
    h.L=Math.max(ZP_YAKIN,Math.abs(e.x-S.x));
    return}
  const t=h.hd,g=zpkTutamak();
  bufCal(ZPS_O,t.tip==='v'?0.9:1);
  h.L=kisit(Math.hypot(h.x-g[0],h.y-g[1]),ZP_MIN,ZP_MAX);
  if(h.bir){if(t.tip==='c'){h.ph='don';h.hd={tip:'yok'}}else h.oto=S.t+0.15}
}
function zpkUc(k,h,dt){
  const t=h.hd;
  if((t.tip==='d'&&(t.e.olu||t.e.tut||t.e.dus||!DUS.includes(t.e)))||(t.tip==='v'&&!(VAR.includes(t.v)&&(t.v.d==='yer'||t.v.d==='dus')))){      // hedef gitti: boşluğa uçar
    const p=zpkHedefNok(h);h.hd={tip:'yok',wx:p[0],wy:p[1]};h.dx=p[0]-h.x;h.dy=p[1]-h.y;h.menz=h.yol+Math.hypot(h.dx,h.dy)+300}
  const hn=zpkHedefNok(h),dx=hn?hn[0]-h.x:h.dx,dy=hn?hn[1]-h.y:h.dy,L=Math.hypot(dx,dy)||1,ux=dx/L,uy=dy/L,st=ZP_HIZ*dt,n=Math.max(1,Math.ceil(st/60)),s=st/n;
  h.vx=ux*ZP_HIZ;h.vy=uy*ZP_HIZ;h.a=Math.atan2(uy,ux);
  for(let i=0;i<n;i++){
    if(hn&&Math.hypot(hn[0]-h.x,hn[1]-h.y)<=s+1){h.x=hn[0];h.y=hn[1];zpkSapla(k,h,h.hd.tip==='d'?h.hd.e:null);return}
    h.x+=ux*s;h.y+=uy*s;h.yol+=s;
    for(const e of DUS){if(e.olu||e.tut||e.dus)continue;if(dusDeg(e,h.x,h.y,22)){zpkSapla(k,h,e);return}}      // yoldaki düşmana saplanır
    if((!hn&&(h.yol>=h.menz||h.y<-700))||h.yol>ZP_MAX+500){h.ph='don';h.hd={tip:'yok'};return}
  }
}
function zpkDon(k,h,dt){const m=zpkAgiz(k),dx=m[0]-h.x,dy=m[1]-h.y,L=Math.hypot(dx,dy),st=ZP_DON*dt;
  if(L<=st+12){ZPK[k]=null;return}
  h.x+=dx/L*st;h.y+=dy/L*st;h.a=Math.atan2(-dy,-dx)}      // ucu dışarı bakarak geri sarılır
function zpkJoy(iz,h){      // parmak: ilk basılan yere göre joystick (al: çapaya doğru +, px: yana) ve hızlı fiske (fl: +1 çapaya doğru, -1 geri)
  if(!iz)return null;
  const g=zpkTutamak(),ax=h.x-g[0],ay=-(h.y-g[1]),L=Math.hypot(ax,ay)||1,ux=ax/L,uy=ay/L;      // ekranda oyuncudan çapaya yön
  const ox=iz.lx-iz.x0,oy=iz.ly-iz.y0,a=ox*ux+oy*uy,pq=ox-a*ux;
  const r={al:Math.sign(a)*kisit((Math.abs(a)-18)/62,0,1),px:Math.sign(pq)*kisit((Math.abs(pq)-14)/60,0,1),fl:0};
  const hs=iz.hist,son=hs[hs.length-1];
  if(son&&performance.now()/1000-son.t<0.06&&S.t-(iz.fT||-9)>0.3){const m=kayma(iz,0.1);
    if(m&&m.d>45&&izHiz(iz,0.1)>1300){const f=(m.dx*ux+m.dy*uy)/m.d;r.fl=f>0.6?1:f<-0.6?-1:0;if(r.fl){iz.fT=S.t;iz.hist=[son]}}}
  return r;
}
function zpkTak(k,h,dt){
  const t=h.hd,iz=zpkIzBul(k);
  if(h.oto&&S.t>=h.oto){zpkKopar(k,h,false);return}
  if(t.tip==='d'){const e=t.e;
    if(e.olu||e.tut||e.dus||!DUS.includes(e)){zpkKopar(k,h,false);return}
    const p=zpkHedefNok(h);h.x=p[0];h.y=p[1];
    if(e.boss||!(e.zpk&&e.zpk.k===k))return;
    e.yon=S.x>=e.x?1:-1;e.st=Math.max(e.st||0,S.t+0.3);e.ka=null;      // mızrağı tutup çırpınır: saldıramaz
    const dist=Math.abs(e.x-S.x),yer=e.y<=zemin(e.x)+1;h.L=Math.max(ZP_YAKIN,Math.min(h.L,dist));
    const j=zpkJoy(iz,h);
    if(j){
      if(j.fl>0){zpkKopar(k,h,true);return}      // düşmana doğru fiske: mızrağı kopar
      if(j.fl<0&&yer&&dist>ZP_YAKIN+80){const T=0.36;e.vx=(S.x>e.x?1:-1)*Math.min(3200,(dist-ZP_YAKIN)/T);e.vy=G*T/2;e.atil=true;e.st=S.t+T+0.25;bufCal(GRS,0.8)}      // geri fiske: kendine savurur, yanına düşer
      else if(j.al<0)h.L=Math.max(ZP_YAKIN,h.L+j.al*1300*dt)}      // geri çek: halat kısalır, düşman sürüklenir
    if(yer&&dist>h.L+1)e.x=S.x+(e.x>S.x?1:-1)*h.L;
    return}
  if(t.tip==='v'){const v=t.v;
    if(!VAR.includes(v)||(v.d!=='yer'&&v.d!=='dus')){zpkKopar(k,h,false);return}
    h.x=v.x;h.y=v.y;
    const j=zpkJoy(iz,h);
    if(j){const dist=Math.abs(v.x-S.x),yn=S.x>v.x?1:-1;
      if(j.fl>0){zpkKopar(k,h,false);return}
      if(j.fl<0&&dist>350){const T=0.45;v.d='uc';v.vx=yn*Math.min(3000,(dist-250)/T);v.vy=G*T/2;v.vr=yn*4;v.f=0.45;v.rot=0;zpkKopar(k,h,false);bufCal(GRS,0.8);return}
      if(j.al<0&&dist>350&&v.d==='yer')v.x+=yn*900*(-j.al)*dt}
    return}
  const A=zpkCapa(t);h.x=A[0];h.y=A[1];      // çevre çapası
  const j=zpkJoy(iz,h);if(!j)return;
  if(j.al>0){const g=zpkTutamak(),d=Math.hypot(A[0]-g[0],A[1]-g[1]);if(d<h.L)h.L=Math.max(ZP_MIN,d)}      // gevşek halat önce toplanır
  if(j.al)h.L=kisit(h.L-j.al*ZP_SAR*dt,ZP_MIN,ZP_MAX);
  if(!S.yer&&j.px)S.vx+=j.px*ZP_SALLA*dt;
  if(j.fl>0){const g=zpkTutamak(),dx=A[0]-g[0],dy=A[1]-g[1],d=Math.hypot(dx,dy)||1;
    if(d>ZP_MIN+150){S.vx=dx/d*3000;S.vy=-dy/d*3000;S.yer=false;S.zpZip={k,t0:S.t};S.zpUcT=S.t+1.5;savurCal(S.x)}}      // çapaya fırla
}
function zpkAsili(){if(S.yer)return false;for(const k of ['N','F']){const h=ZPK[k];if(h&&h.ph==='tak'&&h.hd.tip==='c')return true}return false}      // halata asılı (havada)
function zpkKisit(dt){      // halat oyuncuyu çapadan uzaklaştırmaz: sarkaç gibi sallanır
  let as=false;
  for(let it=0;it<2;it++)for(const k of ['N','F']){const h=ZPK[k];if(!h||h.ph!=='tak'||h.hd.tip!=='c')continue;
    as=true;
    const A=zpkCapa(h.hd),g=zpkTutamak(),dx=g[0]-A[0],dy=g[1]-A[1],d=Math.hypot(dx,dy)||1;
    if(S.zpZip&&S.zpZip.k===k&&S.t-S.zpZip.t0<0.6)h.L=Math.max(ZP_MIN,Math.min(h.L,d));
    if(d<=h.L)continue;
    const nx=dx/d,ny=dy/d,cx=A[0]+nx*h.L-g[0],cy=A[1]+ny*h.L-g[1];
    S.x+=cx;S.y+=cy;
    const vu=-S.vy,rad=S.vx*nx+vu*ny;if(rad>0){S.vx-=rad*nx;S.vy=-(vu-rad*ny)}
    if(S.yer&&cy>1.5){S.yer=false;if(S.vy>0)S.vy=0}
  }
  if(!as)return;
  const zH=zemin(S.x);if(S.y<zH){S.y=zH;if(S.vy>0)S.vy=0}
  if(!S.yer){S.vx*=1-0.25*dt;const v=Math.hypot(S.vx,S.vy);if(v>4200){S.vx*=4200/v;S.vy*=4200/v}}
}
function zpkGuncelle(dt){
  if(!ZPK.N&&!ZPK.F)return;
  if(S.durum!=='oyun'){zpkTemizle(true);return}
  for(const k of ['N','F']){const h=ZPK[k];if(!h)continue;
    if(h.ph==='haz'){if(S.t-h.t0<0.07)continue;      // kol nişan alır, sonra ateşler
      const m=zpkAgiz(k);h.x=m[0];h.y=m[1];h.ph='uc';savurCal(S.x);
      if(h.hd.tip==='yok'){h.dx=h.hd.wx-m[0];h.dy=h.hd.wy-m[1];h.menz=kisit(Math.hypot(h.dx,h.dy)*1.15,1600,ZP_MAX)}}
    if(h.ph==='uc')zpkUc(k,h,dt);
    else if(h.ph==='tak')zpkTak(k,h,dt);
    else if(h.ph==='don')zpkDon(k,h,dt);
  }
  zpkKisit(dt);
  const h=ZPK.N&&ZPK.N.ph==='tak'?ZPK.N:ZPK.F;      // takılıyken çapaya / düşmana bakar
  if(h&&h.ph==='tak'&&Math.abs(h.x-S.x)>80)S.yon=h.x>S.x?1:-1;
}
// ---- poz ve çizim ----
function zpkPoz(o){      // zıpkınlı kol hedefe / mızrağa doğru dümdüz uzanır; halata asılıyken bacaklar sarkar, harekete göre geride kalır
  if(!ZPK.ac||DEMO)return;
  if(zpkAsili()&&!S.atk){const w=kisit(S.vx*S.yon/2500,-1,1);Object.assign(o,{lN:-15+25*w,bN:28,lF:6+25*w,bF:38,kN:0,kF:0,torso:2-8*w,bas:-6})}
  for(const k of ['N','F']){const h=ZPK[k],q=EL[k];if(!h||q.sx===undefined)continue;
    const T=h.ph==='haz'?(zpkHedefNok(h)||[h.hd.wx,h.hd.wy]):[h.x,h.y];
    const th=Math.atan2(-(T[1]-q.sy),(T[0]-q.sx)*S.yon)/D-(o.torso||0)-(o.pelv||0);
    o['a'+k+'u']=th-90;o['a'+k+'r']=0;
  }
}
function zpkKolCiz(ad,far){      // kol() içinde ön kol uzayında: tabanca ön kolun üstüne bağlı (mızrak takılıysa dolu görsel)
  const im=R[(ZPK[ad]?'z_bos':'z_dolu')+(far?'_a':'')];if(!im)return;
  ctx.save();ctx.translate(ZP_AGIZ[0],ZP_AGIZ[1]);{const q=dunyaNok(0,0);EL[ad].zr=[q[0]-S.x,q[1]-S.y]}
  resim(im,ZP_TAB[0],ZP_TAB[1]);ctx.restore();
}
function zpkUcVis(h){      // mızrağın görünen ucu ve açısı (saplanınca biraz gömülür)
  let a=h.a,x=h.x,y=h.y;
  if(h.ph==='tak'){const t=h.hd;if(t.tip==='d'&&(t.e.yon||1)!==h.yn0)a=Math.PI-a;const g=ZP_GOM[t.tip]||24;x+=Math.cos(a)*g;y+=Math.sin(a)*g}
  return [x,y,a];
}
function zpkIpCiz(pts){      // halat görseli çizgi boyunca uç uca (desen, parçalar arası kesintisiz)
  const im=R.z_ip;if(!im||pts.length<2)return;
  if(!ZP_PAT)ZP_PAT=ctx.createPattern(im,'repeat-x');
  const k=ZP_KAL*SC/22;let acc=0;
  ctx.save();ctx.fillStyle=ZP_PAT;
  for(let i=1;i<pts.length;i++){
    const a=zEkr(pts[i-1][0],pts[i-1][1]),b=zEkr(pts[i][0],pts[i][1]),dx=b[0]-a[0],dy=b[1]-a[1],L=Math.hypot(dx,dy);if(L<0.5)continue;
    const c=dx/L,s=dy/L;
    ctx.setTransform(c*k*DPR,s*k*DPR,-s*k*DPR,c*k*DPR,(a[0]-c*acc+s*23*k+S.shx)*DPR,(a[1]-s*acc-c*23*k+S.shy)*DPR);
    ctx.fillRect(acc/k,12,L/k+0.8,22);acc+=L;
  }
  ctx.restore();
}
function zpkMizrakCiz(x,y,a){
  const im=R.z_mizrak;if(!im)return;const q=zEkr(x,y);
  ctx.save();ctx.translate(q[0],q[1]);ctx.rotate(-a);if(Math.cos(a)<0)ctx.scale(1,-1);ctx.scale(SC,SC);
  ctx.drawImage(im,-ZP_UC[0],-ZP_UC[1],im.width/RES,im.height/RES);ctx.restore();
}
function zpkCiz(k){      // halat ve mızrak (F karakterin arkasında, N önünde çizilir)
  const h=ZPK[k];if(!h||h.ph==='haz'||DEMO)return;
  const m=zpkAgiz(k),[tx,ty,a]=zpkUcVis(h),bx=tx-Math.cos(a)*ZP_DUGUM,by=ty-Math.sin(a)*ZP_DUGUM;
  let sag=0;
  if(h.ph==='tak'&&h.hd.tip==='c'){const g=zpkTutamak();sag=Math.min(900,Math.max(0,h.L-Math.hypot(h.x-g[0],h.y-g[1]))*0.55)}      // gevşek halat sarkar
  else if(h.ph==='don')sag=50;else if(h.ph==='uc')sag=Math.min(120,h.yol*0.03);
  zpkIpCiz(sag>2?egri(m,[bx,by],sag):[m,[bx,by]]);
  zpkMizrakCiz(tx,ty,a);
}
function zpkKorsanPoz(e,p){      // zıpkınlanan düşman: iki eli mızrağın sapında (ters kinematik), çırpınır
  const z=e.zpk,h=z&&ZPK[z.k];if(!h||h.ph!=='tak'||h.hd.e!==e||e.boss)return p;
  const K=KSK[e.kc||'k'],t=S.t,yn=e.yon||1,u=e._u;
  Object.assign(p,{torso:-10+Math.sin(t*15)*6,bas:-14+Math.sin(t*11)*10,hx:-20,lN:-14+Math.sin(t*9)*10,kN:20+Math.max(0,Math.sin(t*9))*20,lF:8-Math.sin(t*9)*10,kF:24});
  if(!u)return p;
  const [tx,ty,a]=zpkUcVis(h),ca=Math.cos(a),sa=Math.sin(a),gx=tx-ca*ZP_GOM.d,gy=ty-sa*ZP_GOM.d,hed={N:20,F:62};      // ellerin sapta tuttuğu yer: giriş noktasından geride
  for(const s of ['N','F']){const om=u[s==='N'?5:6];if(!om||S.t-om.t>0.25)continue;
    const far=s==='F',scl=K.sc*(e.bs||1)*(K.us||1)*(far?KFS:1),j=Math.sin(t*17+(far?1.7:0))*14;
    const lx=(gx-ca*hed[s]-om.x)*yn/scl,ly=-(gy-sa*hed[s]+j-om.y)/scl,ang=Math.atan2(ly,lx)-p.torso*D,d=Math.hypot(lx,ly),A=K.ust,B=K.on+40;
    let U=ang,Rr=0;
    if(d<A+B-1){const al=Math.acos(kisit((A*A+d*d-B*B)/(2*A*d),-1,1)),be=Math.acos(kisit((A*A+B*B-d*d)/(2*A*B),-1,1));U=ang+al;Rr=-(Math.PI-be)}      // dirsek aşağıda
    p['u'+s]=U/D-90;p['r'+s]=Rr/D;p['w'+s]=0;
  }
  return p;
}
