'use strict';
// Saldırı hareketleri (HAREKET), kombo ağacı, kombo listesi

// ---------- Saldırılar (parça pozları, zaman çizelgesi 0..1) ----------
// aNu/aFu: üst kol açısı (0 = aşağı sarkık, -90 = ileri); aNa/aFa: ön kolun mutlak yönü (0 = ileri, -90 = yukarı)
const D6_SURE=1.33,D6_IT=70;      // altılı tekme süresi (sn) ve tekme başına ilerleme/itme (birim)
const HAREKET={
  kick1:{dur:0.62,keys:[[0,{lN:-30,bN:75,torso:-4,bas:-2,ofs:0,lift:0,aNu:-26,aNa:-70,aFu:-10,aFa:-62}],[0.22,{lN:-105,bN:105,torso:-3,bas:-2,ofs:10,lift:0,aNu:-50,aNa:-60,aFu:-5,aFa:-70}],[0.42,{lN:-92,bN:-6.5,torso:-6,bas:-2,ofs:55,lift:0,aNu:-85,aNa:-40,aFu:45,aFa:115}],[0.66,{lN:-93,bN:-6.5,torso:-7,bas:-2,ofs:65,lift:0,aNu:-85,aNa:-40,aFu:45,aFa:115}],[0.85,{lN:-105,bN:105,torso:-3,bas:-2,ofs:10,lift:0,aNu:-50,aNa:-60,aFu:-5,aFa:-70}],[1,{lN:7,bN:3,torso:6,bas:0,ofs:0,lift:0,aNu:-26,aNa:-70,aFu:-10,aFa:-62}]]},
  kick2:{dur:0.62,keys:[[0,{lN:-30,bN:75,torso:-4,bas:-2,ofs:0,lift:0,aNu:-26,aNa:-70,aFu:-10,aFa:-62}],[0.22,{lN:-105,bN:105,torso:-3,bas:-2,ofs:10,lift:0,aNu:-50,aNa:-60,aFu:-5,aFa:-70}],[0.42,{lN:-112,bN:-6.5,torso:-6,bas:-2,ofs:55,lift:0,aNu:-85,aNa:-40,aFu:45,aFa:115}],[0.66,{lN:-113,bN:-6.5,torso:-7,bas:-2,ofs:65,lift:0,aNu:-85,aNa:-40,aFu:45,aFa:115}],[0.85,{lN:-105,bN:105,torso:-3,bas:-2,ofs:10,lift:0,aNu:-50,aNa:-60,aFu:-5,aFa:-70}],[1,{lN:7,bN:3,torso:6,bas:0,ofs:0,lift:0,aNu:-26,aNa:-70,aFu:-10,aFa:-62}]]},
  kick3:{dur:0.62,keys:[[0,{lN:-30,bN:75,torso:-4,bas:-2,ofs:0,lift:0,aNu:-26,aNa:-70,aFu:-10,aFa:-62}],[0.22,{lN:-105,bN:105,torso:-3,bas:-2,ofs:10,lift:0,aNu:-50,aNa:-60,aFu:-5,aFa:-70}],[0.42,{lN:-135,bN:-6.5,torso:-6,bas:-2,ofs:55,lift:0,aNu:-85,aNa:-40,aFu:45,aFa:115}],[0.66,{lN:-136,bN:-6.5,torso:-7,bas:-2,ofs:65,lift:0,aNu:-85,aNa:-40,aFu:45,aFa:115}],[0.85,{lN:-105,bN:105,torso:-3,bas:-2,ofs:10,lift:0,aNu:-50,aNa:-60,aFu:-5,aFa:-70}],[1,{lN:7,bN:3,torso:6,bas:0,ofs:0,lift:0,aNu:-26,aNa:-70,aFu:-10,aFa:-62}]]},
  kick4:{dur:0.62,keys:[[0,{lF:-30,bF:75,torso:-4,bas:-2,ofs:0,lift:0,aNu:-26,aNa:-70,aFu:-10,aFa:-62}],[0.22,{lF:-105,bF:105,torso:-3,bas:-2,ofs:10,lift:0,aNu:-5,aNa:-70,aFu:-50,aFa:-60}],[0.42,{lF:-150,bF:-6.5,torso:-6,bas:-2,ofs:55,lift:0,aNu:45,aNa:115,aFu:-85,aFa:-40}],[0.66,{lF:-151,bF:-6.5,torso:-7,bas:-2,ofs:65,lift:0,aNu:45,aNa:115,aFu:-85,aFa:-40}],[0.85,{lF:-105,bF:105,torso:-3,bas:-2,ofs:10,lift:0,aNu:-5,aNa:-70,aFu:-50,aFa:-60}],[1,{lF:-9,bF:6,torso:6,bas:0,ofs:0,lift:0,aNu:-26,aNa:-70,aFu:-10,aFa:-62}]]},
  dizF:{dur:.46,keys:[[0,{lF:-20,bF:50,torso:2,bas:0,ofs:0,lift:0,aNu:-26,aNa:-70,aFu:-10,aFa:-62}],[0.35,{lF:-112,bF:112,torso:12,bas:-4,ofs:50,lift:0,aNu:-30,aNa:-60,aFu:-20,aFa:-60}],[0.62,{lF:-114,bF:114,torso:14,bas:-4,ofs:62,lift:0,aNu:-30,aNa:-60,aFu:-20,aFa:-60}],[1,{lF:-9,bF:6,torso:6,bas:0,ofs:0,lift:0,aNu:-26,aNa:-70,aFu:-10,aFa:-62}]]},
  dizN:{dur:.46,keys:[[0,{lN:-20,bN:50,torso:2,bas:0,ofs:0,lift:0,aNu:-26,aNa:-70,aFu:-10,aFa:-62}],[0.35,{lN:-112,bN:112,torso:12,bas:-4,ofs:50,lift:0,aNu:-30,aNa:-60,aFu:-20,aFa:-60}],[0.62,{lN:-114,bN:114,torso:14,bas:-4,ofs:62,lift:0,aNu:-30,aNa:-60,aFu:-20,aFa:-60}],[1,{lN:7,bN:3,torso:6,bas:0,ofs:0,lift:0,aNu:-26,aNa:-70,aFu:-10,aFa:-62}]]}
};
function atkYarat(tur){      // '#ad@dp[L]~no[*+]': ad = hareket, dp = zincirdeki sıra, L = son vuruş, no = kombo numarası, '+' kombo ilerliyor / '*' tamamlandı (ışıltı); '#!' = tutulan düşmana vuruş
  let fl='',no=0,n=0,sn=false;
  if(/[*+]$/.test(tur)){fl=tur.slice(-1);tur=tur.slice(0,-1)}
  const mm=tur.match(/~(\d+)$/);if(mm){no=+mm[1];tur=tur.slice(0,mm.index)}
  const nn=tur.match(/@(\d+)(L?)$/);if(nn){n=+nn[1];sn=!!nn[2];tur=tur.slice(0,nn.index)}
  const tv=tur.indexOf('#!')===0;
  return {ad:tur.slice(tv?2:1),t:0,tv,fl,no,n,son:sn};
}
function atkIstek(tur){
  if(!S.atk)S.atk=atkYarat(tur);
  else if(S.kuyruk.length<3)S.kuyruk.push(tur);
}
function atkGuncelle(dt){
  if(!S.atk)return;
  S.atk.t+=dt*(YA('G')?1.25:1);      // Hızlı Eller: vuruşlar arası bekleme %20 kısa
  if(!S.atk.wh){const mv0=HAREKET[S.atk.ad];if(mv0&&S.atk.t>=mv0.dur*(mv0.win?mv0.win[0][0]*0.65:0.22)){S.atk.wh=true;savurCal(S.x)}}      // sallama sesi
  if(S.atk.no&&!S.atk.nG){const mv=HAREKET[S.atk.ad];if(S.atk.t/mv.dur>=(mv.win?mv.win[mv.win.length-1][0]:(mv.p?0.3:0.4))){S.atk.nG=true;S.kNo={no:S.atk.no,t:S.t}}}   // kombo numarası, tamamlayan vuruşun vurduğu anda görünür
  if(S.atk.t>=HAREKET[S.atk.ad].dur){
    S.sonAtk=S.t;S.atk=null;
    if(S.kuyruk.length)S.atk=atkYarat(S.kuyruk.shift());
  }
}
function atkPozu(o){
  const m=HAREKET[S.atk.ad],u=Math.min(1,S.atk.t/m.dur),K=m.keys;
  let i=0;while(i<K.length-2&&u>K[i+1][0])i++;
  const a=K[i],b=K[i+1];let f=(u-a[0])/(b[0]-a[0]);f=Math.max(0,Math.min(1,f));f=f*f*(3-2*f);
  for(const n in a[1])o[n]=a[1][n]+(b[1][n]-a[1][n])*f;
  if(S.atk.tv){                                   // tutulana vuruş: vuran kol tutan elin konumuna uzanır, yumruk orada biter
    const e=DUS.find(x=>x.tut&&!x.olu),ar=S.atk.ad[1];
    if(e&&(ar==='N'||ar==='F')){
      const sh=EL[ar],hd=EL[e.tut];
      if(sh.sx!==undefined){
        const dxl=(hd.wx-sh.sx)*S.yon,dyl=hd.wy-sh.sy,d=Math.max(30,Math.hypot(dxl,dyl)),sc=ar==='N'?1.1:1.0,L1=124.1*sc,L2=248*sc;
        let fu,ff;
        const phT=Math.atan2(dyl,dxl);
        if(d>=L1+L2-2){fu=ff=phT}
        else{const al=Math.acos(kisit((L1*L1+d*d-L2*L2)/(2*L1*d),-1,1));fu=phT-al;      // dirsek aşağıda
          const ex=L1*Math.cos(fu),ey=L1*Math.sin(fu);ff=Math.atan2(dyl-ey,dxl-ex)}
        const w=u<0.3?u/0.3:(u<0.58?1:Math.max(0,1-(u-0.58)/0.42)), sw=w*w*(3-2*w);
        const au=ar==='N'?'aNu':'aFu',aa=ar==='N'?'aNa':'aFa';
        o[au]=o[au]*(1-sw)+(-fu/D-90)*sw;o[aa]=o[aa]*(1-sw)+(-ff/D)*sw;
      }
      o.torso*=0.3;o.bas*=0.3;o.ofs=0;o.lift=0;
    }
  }
  if(o.aNa!==undefined)o.aNr=o.aNa-o.aNu;
  if(o.aFa!==undefined)o.aFr=o.aFa-o.aFu;
}

// ---------- Dokunma kombo sistemi ----------
// Ekranın sağ yarısına dokun = R (ön kol), sol yarısına dokun = L (arka kol). Peş peşe dokunuşlar kombo zincirini ilerletir (en çok 6 dokunuş; oynayan + sırada en çok 3).
// Harf: j=jab, c=düz (cross), h=kanca (hook), u=aparkat, o=üstten (overhand), b=gövde yumruğu; N=ön kol, F=arka kol.
const GK={N:['aNu','aNa','aFu','aFa',[-10,-62]],F:['aFu','aFa','aNu','aNa',[-26,-70]]};
const LG={n:{lN:7,bN:3,lF:-9,bF:6},c:{lN:-18,bN:30,lF:-24,bF:36},t:{lN:-60,bN:90,lF:-40,bF:80},s:{lN:22,bN:30,lF:28,bF:40}};   // bacak pozları: n duruş, c çömel, t zıplarken topla, s süpermen (arkaya uzat)
function ph(arm,dur,fr){
  const g=GK[arm],bacak=fr.some(([t,v])=>v.lg);
  return {dur,p:true,keys:fr.map(([t,v])=>{const o={torso:v.tor||0,bas:v.bas||0,ofs:v.ofs||0,lift:v.lift||0};
    o[g[0]]=v.u;o[g[1]]=v.a;o[g[2]]=g[4][0];o[g[3]]=g[4][1];if(bacak)Object.assign(o,LG[v.lg||'n']);return [t,o]})};
}
['N','F'].forEach(arm=>{
  const rn=arm==='N'?{u:-26,a:-70}:{u:-10,a:-62}, rec=[1,{u:rn.u,a:rn.a,tor:6}];
  HAREKET['j'+arm]=ph(arm,.26,[[0,{u:-12,a:-150,bas:-2}],[.28,{u:-90,a:0,tor:14,bas:4,ofs:55}],[.5,{u:-90,a:0,tor:14,bas:4,ofs:62}],rec]);
  HAREKET['c'+arm]=ph(arm,.36,[[0,{u:-5,a:-150,tor:-14,bas:-4}],[.32,{u:-92,a:0,tor:34,bas:6,ofs:140}],[.55,{u:-92,a:0,tor:34,bas:6,ofs:150}],rec]);
  HAREKET['h'+arm]=ph(arm,.38,[[0,{u:-70,a:-175,tor:-20,bas:-5}],[.3,{u:-88,a:-12,tor:32,bas:6,ofs:105}],[.52,{u:-88,a:-4,tor:32,bas:6,ofs:115}],rec]);
  HAREKET['u'+arm]=ph(arm,.44,[[0,{u:20,a:20,tor:-10,bas:-4,lg:'c'}],[.35,{u:-150,a:-90,tor:14,bas:5,ofs:75,lift:44,lg:'t'}],[.6,{u:-150,a:-90,tor:14,bas:5,ofs:85,lift:50,lg:'t'}],rec]);
  HAREKET['o'+arm]=ph(arm,.40,[[0,{u:-170,a:-120,tor:-20,bas:-5}],[.3,{u:-82,a:14,tor:36,bas:7,ofs:125}],[.55,{u:-80,a:18,tor:36,bas:7,ofs:135}],rec]);
  HAREKET['b'+arm]=ph(arm,.32,[[0,{u:-8,a:-120,tor:-4}],[.3,{u:-60,a:22,tor:30,bas:6,ofs:85}],[.55,{u:-60,a:22,tor:30,bas:6,ofs:95}],rec]);
  HAREKET['w'+arm]=ph(arm,.38,[[0,{u:-12,a:-150,bas:-2}],[.18,{u:-90,a:0,tor:12,bas:3,ofs:50}],[.3,{u:-60,a:-60,tor:8,ofs:25}],[.46,{u:-90,a:0,tor:18,bas:5,ofs:80}],[.7,{u:-90,a:0,tor:18,bas:5,ofs:88}],rec]);   // çift hızlı jab
  HAREKET['s'+arm]=ph(arm,.48,[[0,{u:-8,a:-130,tor:-14,bas:-3,lg:'c'}],[.3,{u:-92,a:0,tor:34,bas:6,ofs:175,lift:42,lg:'s'}],[.58,{u:-92,a:0,tor:34,bas:6,ofs:190,lift:40,lg:'s'}],rec]);   // süpermen yumruğu: ileri atılır
  HAREKET['z'+arm]=ph(arm,.48,[[0,{u:75,a:-15,tor:-36,bas:-6}],[.36,{u:-92,a:0,tor:42,bas:8,ofs:125}],[.62,{u:-92,a:0,tor:42,bas:8,ofs:135}],rec]);   // dönerek arka yumruk
  HAREKET['k'+arm]=ph(arm,.52,[[0,{u:-178,a:-100,tor:-22,bas:-6}],[.4,{u:-84,a:10,tor:38,bas:8,ofs:135}],[.64,{u:-84,a:10,tor:38,bas:8,ofs:145}],rec]);   // büyük kanca (haymaker)
});
['N','F'].forEach(arm=>{      // bıçak modu saplamaları (normal yumrukların 2 katı hızlı)
  const rn=arm==='N'?{u:-26,a:-70}:{u:-10,a:-62},rec=[1,{u:rn.u,a:rn.a,tor:6}],geri={u:20,a:20,tor:-10,bas:-4};      // geri: aparkatın başı (kol aşağı-geri çekili)
  HAREKET['pd'+arm]=ph(arm,.2,[[0,geri],[.35,{u:-90,a:0,tor:6,bas:2,ofs:70}],[.6,{u:-90,a:0,tor:6,bas:2,ofs:75}],rec]);      // yumruk: omuz hizasında dümdüz karşıya, kol yere paralel, gövde az yatar
  HAREKET['pa'+arm]=ph(arm,.24,[[0,Object.assign({lg:'n'},geri)],[.35,{u:-52,a:42,tor:42,bas:10,ofs:115,lift:-70,lg:'c'}],[.62,{u:-50,a:46,tor:44,bas:10,ofs:120,lift:-72,lg:'c'}],[1,{u:rn.u,a:rn.a,tor:6,lg:'n'}]]);      // tekme: dizler kırılır, kalça alçalır, gövde öne eğilir, kol önde yere doğru uzanıp saplar
  HAREKET['pu'+arm]=ph(arm,.24,[[0,Object.assign({lg:'c'},geri)],[.35,{u:-125,a:-70,tor:14,bas:5,ofs:80,lift:30,lg:'t'}],[.6,{u:-125,a:-70,tor:14,bas:5,ofs:85,lift:34,lg:'t'}],[1,{u:rn.u,a:rn.a,tor:6,lg:'n'}]]);      // aparkat gibi yukarı
  HAREKET['py'+arm]=ph(arm,.22,[[0,{u:-150,a:-100,tor:-6,bas:-4}],[.4,{u:-28,a:80,tor:34,bas:10,ofs:40}],[.62,{u:-28,a:80,tor:34,bas:10,ofs:40}],[1,{u:-70,a:-40,tor:12}]]);      // yerdekine saplama
});
{ // çift tekme: ufak sıçrayıp önce bir bacakla, sonra diğeriyle
  const G0={aNu:-26,aNa:-70,aFu:-10,aFa:-62}, GC={aNu:-50,aNa:-60,aFu:-5,aFa:-70}, GA={aNu:-85,aNa:-40,aFu:45,aFa:115}, GB={aNu:45,aNa:115,aFu:-85,aFa:-40};
  const K=(t,v)=>[t,Object.assign({torso:-4,bas:-2,ofs:0,lift:0},v)];
  const dbl=(h1,h2)=>[K(0,Object.assign({lN:-30,bN:75,lF:-9,bF:6},G0)),
    K(.14,Object.assign({lN:-105,bN:105,lF:6,bF:4,lift:55,ofs:10},GC)),
    K(.27,Object.assign({lN:h1,bN:-6.5,lF:14,bF:20,lift:78,ofs:55},GA)),
    K(.40,Object.assign({lN:-100,bN:100,lF:-40,bF:95,lift:80,ofs:25},GC)),
    K(.55,Object.assign({lN:25,bN:30,lF:h2,bF:-6.5,lift:80,ofs:60},GB)),
    K(.75,Object.assign({lN:20,bN:20,lF:-105,bF:105,lift:40,ofs:10},G0)),
    K(1,Object.assign({lN:7,bN:3,lF:-9,bF:6,torso:6,bas:0},G0))];
  const sw=o=>{const r={};for(const n in o){r[n.replace(/^([lbaz]*)([NF])/,(m,a,b)=>a+(b==='N'?'F':'N'))]=o[n]}return r};
  const cift=(a,b,h1,h2)=>{const A=dbl(h1,h2);HAREKET[a]={dur:.9,win:[[.22,.34],[.5,.62]],keys:A};HAREKET[b]={dur:.9,win:[[.22,.34],[.5,.62]],keys:A.map(([t,v])=>[t,sw(v)])}};
  cift('kickDA','kickDB',-92,-92);      // çift tekme: ikisi de orta
  cift('kickDC','kickDD',-92,-135);     // orta + üst
  cift('kickDE','kickDF',-62,-95);      // alt + orta
  cift('kickDG','kickDH',-95,-125);     // zıplayarak ilerleyen çift tekme
  [HAREKET.kickDG,HAREKET.kickDH].forEach(m=>{m.dur=1.0;m.dash=[.1,.7,340];m.keys.forEach(([t,v])=>{v.lift=(v.lift||0)*1.6+(t>.1&&t<.9?25:0)})});
  { // altılı havada tekme (kombo 30 bitişi): bacaklar sırayla 6 tekme; ilk 2 çift tekmelerle aynı yükseklikte, sonraki 2 biraz daha yukarı ve ileri, son 2 en yukarı ve en ileri. Hasar 6 pencereye bölünür (30 → 6 x 5)
    const H=[-92,-112,-135],OF=[55,95,140],LI=[78,112,150],A=[K(0,Object.assign({lN:-30,bN:75,lF:-9,bF:6},G0))],win=[];
    for(let i=0;i<6;i++){const p=i>>1,t=0.07+i*0.145,n=i%2===0;
      A.push(K(t,Object.assign(n?{lN:-100,bN:100,lF:-40,bF:95}:{lN:20,bN:20,lF:-105,bF:105},{lift:LI[p],ofs:OF[p]-35},GC)));      // bacağı topla
      A.push(K(t+0.065,Object.assign(n?{lN:H[p],bN:-6.5,lF:14,bF:20}:{lN:25,bN:30,lF:H[p],bF:-6.5},{lift:LI[p],ofs:OF[p]},n?GA:GB)));      // tekme
      win.push([t+0.04,t+0.11])}
    A.push(K(0.95,Object.assign({lN:20,bN:20,lF:-105,bF:105,lift:40,ofs:10},G0)),K(1,Object.assign({lN:7,bN:3,lF:-9,bF:6,torso:6,bas:0},G0)));
    HAREKET.kickD6={dur:D6_SURE,win,dash:[.07,.95,D6_IT*6],keys:A};HAREKET.kickD6F={dur:D6_SURE,win,dash:[.07,.95,D6_IT*6],keys:A.map(([t,v])=>[t,sw(v)])};      // tüm tekmeler boyunca ileri gider; her tekme düşmanı D6_IT iter
  }
  { // alçak tekme (aşağı) ve kayarak tekme (Sub-Zero kayması)
    const lo=JSON.parse(JSON.stringify(HAREKET.kick1));lo.keys.forEach(([t,v])=>{if(v.lN<-85)v.lN=-60});HAREKET.kickLo=lo;
    const KS=(t,v)=>[t,Object.assign({torso:-4,bas:-2,ofs:0,lift:0},G0,v)];
    HAREKET.kickSl={dur:.62,win:[[.3,.72]],keys:[
      KS(0,{lN:-30,bN:75,lF:-9,bF:6}),
      KS(.2,{lN:-68,bN:15,lF:70,bF:60,torso:-24,bas:-4,ofs:80,lift:70}),
      KS(.4,{lN:-80,bN:-6.5,lF:80,bF:-6.5,torso:-10,bas:-5,ofs:200,lift:120}),
      KS(.72,{lN:-80,bN:-6.5,lF:80,bF:-6.5,torso:-10,bas:-5,ofs:230,lift:120}),
      KS(.9,{lN:-30,bN:60,lF:10,bF:60,torso:-8,ofs:70,lift:40}),
      KS(1,{lN:7,bN:3,lF:-9,bF:6,torso:6,bas:0})]};
    const BK=(t,v)=>[t,Object.assign({torso:-4,bas:-2,ofs:0,lift:0},G0,v)];      // at tekmesi: öne eğilir, bacak arkaya tabanla fırlar (arkada tutulan düşman için)
    HAREKET.kickBk={dur:.62,win:[[.36,.66]],keys:[
      BK(0,{lN:-30,bN:75,lF:-9,bF:6}),
      BK(.22,{lN:25,bN:105,lF:-9,bF:6,torso:26,bas:-6}),
      BK(.42,{lN:88,bN:-6.5,lF:-9,bF:6,torso:36,bas:-8}),
      BK(.66,{lN:88,bN:-6.5,lF:-9,bF:6,torso:36,bas:-8}),
      BK(.85,{lN:25,bN:105,lF:-9,bF:6,torso:20,bas:-4}),
      BK(1,{lN:7,bN:3,lF:-9,bF:6,torso:6,bas:0})]};
  }
}
{ // ters yönlü tekmeler (diğer bacak)
  const sw=o=>{const r={};for(const n in o){r[n.replace(/^([lbaz]*)([NF])/,(m,a,b)=>a+(b==='N'?'F':'N'))]=o[n]}return r};
  for(const n of ['kick1','kick2','kick3','kickLo','kickSl','kickBk'])HAREKET[n+'F']={dur:HAREKET[n].dur,keys:HAREKET[n].keys.map(([t,v])=>[t,sw(v)])};
  HAREKET.kick4N={dur:HAREKET.kick4.dur,keys:HAREKET.kick4.keys.map(([t,v])=>[t,sw(v)])};
}
{ // havalı hareketler: uçan tekme, çift uçan tekme (cift() bloğunda), havadan aşağı tekme, zıplayan diz. dash:[başlangıç u, bitiş u, mesafe] = karakter ileri gider
  const sw=o=>{const r={};for(const n in o){r[n.replace(/^([lbaz]*)([NF])/,(m,a,b)=>a+(b==='N'?'F':'N'))]=o[n]}return r};
  const G0={aNu:-26,aNa:-70,aFu:-10,aFa:-62}, GC={aNu:-50,aNa:-60,aFu:-5,aFa:-70}, GF={aNu:-150,aNa:-60,aFu:-45,aFa:-65};
  const K=(t,v)=>[t,Object.assign({torso:-4,bas:-2,ofs:0,lift:0},G0,v)];
  const S0=K(0,{lN:-30,bN:75,lF:-9,bF:6}), S1=K(1,{lN:7,bN:3,lF:-9,bF:6,torso:6,bas:0});
  HAREKET.kickFly={dur:.72,win:[[.3,.62]],dash:[.15,.55,380],keys:[S0,
    K(.18,Object.assign({lN:-70,bN:100,lF:-50,bF:90,lift:35,torso:10,ofs:10},GC)),
    K(.34,Object.assign({lN:-88,bN:-6.5,lF:-75,bF:105,lift:120,ofs:60,torso:-16,bas:-3},GF)),
    K(.6,Object.assign({lN:-88,bN:-6.5,lF:-75,bF:105,lift:105,ofs:70,torso:-16,bas:-3},GF)),
    K(.84,Object.assign({lN:-30,bN:60,lF:10,bF:60,lift:20,torso:6,ofs:20},GC)),S1]};
  HAREKET.kickDive={dur:.7,win:[[.36,.64]],dash:[.12,.55,260],keys:[S0,
    K(.2,Object.assign({lN:-80,bN:110,lF:-60,bF:100,lift:100,ofs:10,torso:10,bas:-4},GC)),
    K(.38,Object.assign({lN:-52,bN:-6.5,lF:-100,bF:120,lift:80,ofs:80,torso:26,bas:6},GF)),
    K(.62,Object.assign({lN:-52,bN:-6.5,lF:-100,bF:120,lift:35,ofs:105,torso:26,bas:6},GF)),
    K(.82,Object.assign({lN:-20,bN:40,lF:10,bF:40,lift:0,torso:12,ofs:30},GC)),S1]};
  HAREKET.dizJ={dur:.56,win:[[.32,.62]],dash:[.14,.5,260],keys:[S0,
    K(.2,Object.assign({lN:-70,bN:100,lF:-40,bF:80,lift:30,torso:8},GC)),
    K(.38,{lN:-125,bN:140,lF:20,bF:30,lift:90,ofs:70,torso:12,bas:-2,aNu:-60,aNa:-40,aFu:-70,aFa:-45}),
    K(.62,{lN:-125,bN:140,lF:20,bF:30,lift:80,ofs:80,torso:12,bas:-2,aNu:-60,aNa:-40,aFu:-70,aFa:-45}),
    K(.84,Object.assign({lN:-30,bN:60,lF:10,bF:60,lift:15,torso:6},GC)),S1]};
  for(const n of ['kickFly','kickDive'])HAREKET[n+'F']={dur:HAREKET[n].dur,win:HAREKET[n].win,dash:HAREKET[n].dash,keys:HAREKET[n].keys.map(([t,v])=>[t,sw(v)])};
  HAREKET.dizJF={dur:HAREKET.dizJ.dur,win:HAREKET.dizJ.win,dash:HAREKET.dizJ.dash,keys:HAREKET.dizJ.keys.map(([t,v])=>[t,sw(v)])};
}
// ---- Kombo sistemi: sadece Y (yumruk bölgesi) ve T (tekme bölgesi) dizisine bakılır; sağ/sol sadece hangi kol/bacağın oynayacağını belirler ----
const KICK_AD={kLo:['kickLo','kickLoF'],k1:['kick1','kick1F'],k2:['kick2','kick2F'],k3:['kick3','kick3F'],k4:['kick4N','kick4'],kSl:['kickSl','kickSlF'],diz:['dizN','dizF'],kDA:['kickDA','kickDB'],kD6:['kickD6','kickD6F'],kDC:['kickDC','kickDD'],kDE:['kickDE','kickDF'],
  kFly:['kickFly','kickFlyF'],kDG:['kickDG','kickDH'],kDv:['kickDive','kickDiveF'],dzJ:['dizJ','dizJF']};   // [sağ(N), sol(F)]
const KAGAC={   // y/t dizisi -> o adımın hareket türü, 30 kombo (yumruk: j jab, c düz, h kanca, u aparkat(yükselir), o üstten, b gövde, w çift jab, s süpermen, z dönerek, k haymaker; tekme: KICK_AD; kFly uçan, kDG çift uçan, kDv havadan aşağı tekme, dzJ zıplayan diz)
  y:'j', yy:'c', yyy:'h', yyyy:'u', yyyyy:'o', yyyyyt:'kD6', yyyyt:'kDv', yyyt:'k3', yyt:'kSl',
  yt:'kLo', yty:'w', ytyy:'z', ytyyy:'k', ytyyt:'kDC', ytyt:'kDE', ytt:'kFly',
  t:'k1', tt:'diz', ttt:'dzJ', tttt:'kDG', tty:'s', ttyy:'h', ttyt:'k2',
  ty:'b', tyy:'c', tyyt:'k', tyyy:'u', tyyyy:'o', tyyyt:'kDv', tyt:'kDA'
};
const KB={ch:{}};
const KOMBO_SIRA=Object.keys(KAGAC).sort((a,b)=>{const f=k=>k.replace(/y/g,'0').replace(/t/g,'1');return a.length-b.length||(f(a)<f(b)?-1:1)});   // vuruş sayısına göre, benzerler yan yana
KOMBO_SIRA.forEach((k,qi)=>{let n=KB;[...k].forEach((c,i)=>{n=n.ch[c]||(n.ch[c]={m:KAGAC[k.slice(0,i+1)],ch:{}})});n.no=qi+1});   // her kombonun numarası (sıra no)
S.kb={n:KB,t:-9};
// ---- Kombo listesi penceresi (kağıt): her kombo yumruk/tekme resimleriyle ----
let listeAcik=false;
{
  const ic=document.getElementById('liste_ic');let onceki=0;
  KOMBO_SIRA.forEach((k,i)=>{
    const sat=document.createElement('div');sat.className='sat'+(k.length!==onceki&&i?' yeni':'');onceki=k.length;
    const no=document.createElement('b');no.textContent=i+1;sat.appendChild(no);
    for(const c of k){const im=document.createElement('img');im.src='ui/ic_'+(c==='y'?'yumruk':'tekme')+'.webp?v=43';im.alt=c;sat.appendChild(im)}
    ic.appendChild(sat);
  });
  const el=document.getElementById('liste');
  window.listeAc=a=>{if(a&&agacAcik)agacAc(false);listeAcik=a;el.hidden=!a;document.getElementById('kombolB').classList.toggle('aktif',a);if(a){izler.clear();kizler.clear();KOL.N.ak=false;KOL.F.ak=false;key.sol=key.sag=key.asagi=key.zipla=false;ic.scrollTop=0}};
  document.getElementById('kombolB').addEventListener('click',()=>listeAc(!listeAcik));      // ikon açıkken tekrar dokununca kapanır
  el.addEventListener('click',e=>{if(e.target===el)listeAc(false)});
  addEventListener('keydown',e=>{if(e.key==='Escape'&&listeAcik)listeAc(false)});
}
S.parcalar=[];
const TUT_DESEN=['jjchuo','bbhhuc','huhuoc','jcbhuo','buchbo'];   // tutulana vuruş desenleri (6'şar): j jab, c düz, h kanca, u aparkat, o üstten, b gövde
S.tk={i:0,p:0,t:-9};
function tutKombo(arm){
  if(S.durum!=='oyun'||S.sarj>0)return;
  if(S.atk&&S.kuyruk.length>=3)return;
  if(S.t-S.tk.t>0.9)S.tk.i=0;
  const pat=TUT_DESEN[S.tk.p%TUT_DESEN.length];
  const m=pat[S.tk.i]+arm;
  S.tk.i++;S.tk.t=S.t;
  if(S.tk.i>=pat.length){S.tk.i=0;S.tk.p++}
  atkIstek('#!'+m);
}
// Kombo hasarı (sadece gerçekten değen vuruşlarla; bitiş bonusu son vuruş değdiyse): ara vuruşlar 5; zincir bitince toplam 10 x vuruş sayısı (6'lı = 60, 5'li = 50, 4'lü = 40...). Bitiş vuruşunda ya da (zincir devam edebiliyorsa) durunca eklenir
const kDmg=a=>a&&a.n?(a.son?5*a.n+5:5):null;
function kBonus(){const k=S.kSon;S.kSon=null;if(k&&S.cE&&!S.cE.olu&&(S.cEt||-9)>=k.t)vur(S.cE,5*k.n,S.yon*0.3,0.4,0.5,S.cE.y+S.cE.cy);S.cE=null}
function komboTap(d,side){
  if(S.durum!=='oyun'||S.sarj>0||S.sman||S.yy||S.alk||S.tats>0||S.dkick||S.shoryu>0||S.donuyor||S.slam)return;
  if(S.pence){penceVur(d==='t'?'a':'d',side);return}      // bıçak modu: yumruk = düz saplama, tekme = aşağı saplama
  if(S.atk&&S.kuyruk.length>=3)return;
  let n=S.t-S.kb.t>0.65?KB:S.kb.n, c=n.ch[d], dp=(S.kb.d||0)+1;
  if(n===KB)dp=1;
  if(!c){c=KB.ch[d];dp=1}                              // zincirde devamı yoksa yeni zincir başlar
  if((n===KB||!n.ch[d])&&S.kSon)kBonus();            // zincir kopmuşsa önceki kombonun tamamlama bonusu
  if(dp===1)S.cE=null;
  const son=!Object.keys(c.ch).length;
  S.kb.n=son?KB:c;S.kb.t=S.t;S.kb.d=son?0:dp;          // zincir bittiyse sıfırla
  if(son&&dp>=2&&c.no){S.kSon=null}else if(dp>=2&&c.no)S.kSon={no:c.no,t:S.t,n:dp};else S.kSon=null;     // zincir devam edebiliyorsa: durursa o an biten kombo sayılır
  const ad=d==='t'?KICK_AD[c.m][side==='N'?0:1]:c.m+side;           // yumruk: tür + basılan taraf; tekme: türün o taraftaki bacağı
  atkIstek('#'+ad+'@'+dp+(son?'L':'')+(son&&dp>=2&&c.no?'~'+c.no:'')+(son&&dp>=3?'*':(dp>=2?'+':'')));
}

