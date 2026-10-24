'use strict';
// Yetenek önizlemesi: ağaçta bir yeteneğe dokununca arkadaki oyunda karakter o hareketi sessizce, döngüyle gösterir.
// Başlarken oyunun tüm durumu kaydedilir; ağaç kapanınca (ya da başka yetenek seçilince) her şey kayıttaki haline döner.
// Can çalma yeteneklerinde sahte düşük can gösterilir, vurdukça dolar. Diğer pasifler (can dolumu, maks. can…) için önizleme yok.
const DM_SABIT=()=>({S,EL,AY,OGV,DW,KOL,HS,ACT,VDW,key,P,BAR,GYRO,KALP});      // içi yerinde geri yüklenen sabit nesneler
function dmKopya(o,m){      // derin kopya: aynı nesneye giden bağlar kopyada da aynı nesneye gider; görsel, ses, sınıf nesneleri olduğu gibi kalır
  if(o===null||typeof o!=='object')return o;
  if(m.has(o))return m.get(o);
  if(ArrayBuffer.isView(o)){const c=o.slice();m.set(o,c);return c}
  if(Array.isArray(o)){const c=[];m.set(o,c);for(let i=0;i<o.length;i++)c[i]=dmKopya(o[i],m);return c}
  if(o instanceof Set){const c=new Set();m.set(o,c);for(const v of o)c.add(dmKopya(v,m));return c}
  if(o instanceof Map){const c=new Map();m.set(o,c);for(const [k,v] of o)c.set(k,dmKopya(v,m));return c}
  const p=Object.getPrototypeOf(o);if(p!==Object.prototype&&p!==null)return o;
  const c={};m.set(o,c);for(const k of Object.keys(o))c[k]=dmKopya(o[k],m);return c;
}
function dmSabitle(o,m){if(o&&typeof o==='object'&&!m.has(o)){m.set(o,o);for(const v of Object.values(o))dmSabitle(v,m)}}      // değişmeyen tablolar kopyalanmaz (kimlik karşılaştırmaları bozulmasın)
function demoKaydet(){
  const m=new Map(),sb=DM_SABIT(),r={sb:{}};
  for(const t of [KB,HAREKET,KAGAC,KSK,KPZ,KICK_AD,LG,GK,R,YET,AG])dmSabitle(t,m);
  for(const n in sb)m.set(sb[n],sb[n]);
  for(const n in sb){const o=sb[n],c={};for(const k of Object.keys(o))c[k]=dmKopya(o[k],m);r.sb[n]=c}
  r.ar=dmKopya({DUS,MERMI,EMER,EFL,ISP,VAR,VPAR},m);
  r.kar=KAR.slice();r.isc=ISP_CEP;r.son=sonYon;
  return r;
}
function demoGeri(r){
  const sb=DM_SABIT();
  for(const n in sb){const o=sb[n],c=r.sb[n];for(const k of Object.keys(o))if(!(k in c))delete o[k];Object.assign(o,c)}
  ({DUS,MERMI,EMER,EFL,ISP,VAR,VPAR}=r.ar);
  KAR.set(r.kar);KLO=0;KHI=KN-1;ISP_CEP=r.isc;sonYon=r.son;
}
// ---- önizleme sahnesi ----
function dmCanDusur(){S.hp=HPMAX*0.35;S.regB=999;S.hasT=S.t}      // can çalma önizlemesi: sahte düşük can (kendiliğinden dolmaz); vurdukça dolar, önizleme bitince gerçek can geri gelir
function dmDusman(dx,kc,hp){const e=korsanYap(S.x+dx,kc);e.demo=true;e.hp=e.max=hp||300;e.yon=-1;e.acd=e.mcd=1e9;DUS.push(e);return e}
function dmKol(k,th,e){const o=KOL[k];o.ak=true;o.th=th;o.e=e}
function dmKolBirak(k){const o=KOL[k];o.ak=false;o.e=0;o.bit=-9}
const dmGec=(t,a,b,x,y)=>x+(y-x)*kisit((t-a)/(b-a),0,1);      // t: a→b arasında x'ten y'ye
function dmTut(k,e){      // el düşmana değmediyse yine de tutar (önizleme)
  if(e.olu||e.tut)return;const h=EL[k];e.tut=k;e.vx=e.vy=0;
  let tx=e.x-h.wx,ty=e.y+e.cy-h.wy;const L=Math.hypot(tx,ty);if(L>200){tx*=200/L;ty*=200/L}e.tx=tx;e.ty=ty;
}
function dmTutDemo(t,o,D){      // İnsan Tutma / Sıkı Tutuş: önüne düşman çıkar, uzanıp tutar, bir süre tutar, bırakır
  if(t<1.9)dmKol('N',dmGec(t,0.2,0.7,40,-5),dmGec(t,0.2,0.7,0.2,1));
  if(o(1.0)&&D.e)dmTut('N',D.e);
  if(o(1.9)){tutBirak('N');dmKolBirak('N')}
}
function dmYirtDemo(t,o,D){      // Yırtma: elinde bıçaklı belirir, iki eliyle yırtar; 2 sn sonra yenisi gelir
  const ac=kisit((t-0.5)/0.35,0,1);
  if(t<1.3){dmKol('N',-10-25*ac,0.75+0.25*ac);dmKol('F',-10+215*ac,0.75+0.25*ac)}
  const e=D.e;
  if(o(0.15)&&e&&!e.olu){e.tut='N';e.iki=true;e.vx=e.vy=0;e.yatT=S.t;e.ripT=0;e.sph=[];
    const mx=(EL.N.wx+EL.F.wx)/2,my=(EL.N.wy+EL.F.wy)/2;e.tx=e.x-mx;e.ty=e.y+e.cy-my}
  if(o(0.85)&&e&&!e.olu&&e.tut)yirt(e,2600);
  if(o(1.3)){dmKolBirak('N');dmKolBirak('F')}
}
const DEMOLAR={      // T: döngü süresi (sn), kur: sahne, f(t, o): o(an) o ana ilk gelişte true; yv: önizlemede ayrıca açık sayılan yetenekler
  C:{T:2.4,kur(D){dmDusman(420,'k')},f(t,o){if(o(0.2))komboTap('y','N');if(o(0.5))komboTap('y','F');if(o(0.8))komboTap('y','N')}},
  I:{T:3,kur(D){dmDusman(420,'k')},f(t,o){if(o(0.2))komboTap('y','N');if(o(0.5))komboTap('y','F')}},
  A:{T:3,kur(D){D.e=dmDusman(360,'k')},f:dmTutDemo},
  G:{T:3,yv:['A'],kur(D){D.e=dmDusman(360,'k')},f:dmTutDemo},
  B:{T:3.4,kur(D){VAR.push({x:S.x+260,y:zemin(S.x+260)+V_MRK+V_YUK,vx:0,vy:0,rot:0,vr:0,d:'yer',k:null})},
     f(t,o){
       if(t<1.3)dmKol('N',dmGec(t,0.1,0.5,20,75),1);
       else if(t<2.3)dmKol('N',dmGec(t,1.3,1.8,75,-35),1);
       if(o(1.1)){const v=VAR.find(z=>z.d==='yer');if(v&&!varilElde('N')){v.d='tut';v.k='N';v.rot=0;v.vx=v.vy=0;S.uzan=null}}      // uzanıp alır
       if(o(2.3)){const v=VAR.find(z=>z.d==='tut');if(v){v.k=null;v.d='uc';v.f=0.5;v.vx=2200;v.vy=900;v.vr=4}dmKolBirak('N')}      // fırlatır
     }},
  F:{T:3.2,kur(D){D.e=dmDusman(330,'b',100)},f(t,o,D){dmYirtDemo(t,o,D)}},
  R:{T:3.2,yv:['F'],kur(D){D.e=dmDusman(330,'b',100);dmCanDusur()},f(t,o,D){dmYirtDemo(t,o,D)}},
  H:{T:3,canK:8,kur(D){dmDusman(420,'k');dmCanDusur()},f(t,o){for(const a of [0.2,0.5,0.8,1.4,1.7,2.0])if(o(a))komboTap('y',a*10%2<1?'N':'F')}},      // can çalma: yumrukladıkça sahte can barı dolar
  M:{T:3,canK:8,kur(D){dmDusman(420,'k');dmCanDusur()},f(t,o){for(const a of [0.2,0.5,0.8,1.4,1.7,2.0])if(o(a))komboTap('y',a*10%2<1?'N':'F')}},
  Q:{T:3,canK:8,kur(D){dmDusman(450,'k');dmCanDusur()},f(t,o){for(const a of [0.2,0.9,1.6])if(o(a))komboTap('t','N')}},      // tekmeyle can çalma
  T:{T:3.2,canK:8,yv:['P'],kur(D){dmDusman(420,'k');dmCanDusur()},f(t,o){if(o(0.15))penceAc();for(const a of [0.7,1.0,1.3,1.6,1.9])if(o(a))komboTap('y',a*10%2<1?'N':'F');if(o(2.6))penceKapa()}},      // bıçakla can çalma
  N:{T:2.8,f(t,o){if(o(0.2))ozelTus('n')}},
  S:{T:2.4,kur(D){dmDusman(1000,'k')},f(t,o){if(o(0.2))ozelTus('h')}},
  Y:{T:2.8,f(t,o){if(o(0.1)){S.sarj=1;S.sarjP=null}if(o(1.1))ates(1,0.05,1,EL.N.wx,EL.N.wy)}},
  D:{T:2.6,f(t,o){if(o(0.1)){key.zipla=true;ziplaBas()}if(o(0.45))ziplaBas();if(o(0.8))key.zipla=false}},
  K:{T:2.2,f(t,o){if(o(0.1)){key.zipla=true;ziplaBas()}if(o(0.6))key.zipla=false}},
  E:{T:2.2,f(t,o){if(t<0.4)key.sag=true;if(o(0.4)){key.sag=false;S.vx=HIZ;ciftAtil(1)}}},
  L:{T:2.4,kur(D){dmDusman(450,'k')},f(t,o){if(o(0.2))ozelTus('b')}},
  U:{T:2.6,f(t,o){if(o(0.1)){key.zipla=true;ziplaBas()}if(o(0.45))key.zipla=false;if(o(0.5))ozelTus('n')}},
  J:{T:2.6,kur(D){dmDusman(380,'k')},f(t,o){if(o(0.2))shoryu({t:'N',yon:1})}},
  P:{T:2.8,kur(D){dmDusman(420,'k')},f(t,o){if(o(0.2))penceAc();if(o(0.9))komboTap('y','N');if(o(1.3))komboTap('y','F');if(o(2.3))penceKapa()}},
  Z:{T:3.2,yv:['P'],kur(D){dmDusman(1400,'k')},f(t,o){if(o(0.1))penceAc();if(o(0.6))dagAtla(1)}},
  AL:{T:2.8,kur(D){dmDusman(500,'k');dmDusman(-500,'k')},f(t,o){if(o(0.2)){S.alk={t0:S.t,T:0.75,hit:false};S.vx=0}}},
  YT:{T:2.6,kur(D){dmDusman(700,'k')},f(t,o){if(o(0.1)){key.zipla=true;ziplaBas()}if(o(0.4))key.zipla=false;if(o(0.45))S.pend={t:S.t,iz:{t:'N',yon:1},dx:350,dy:450}}},
  TOP:{T:3.6,f(t,o){if(o(0.1)&&!S.yeme)S.yeme={k:'N',t0:S.t,bos:false,atildi:false}}},
};
function demoSifirla(){      // her döngüde: karakter başladığı yere ışınlanır, sahne yeniden kurulur
  const D=DEMO;
  DUS=[];VAR=[];VPAR=[];MERMI=[];ADKD=[];EMER=[];EFL=[];ISP=[];
  if(S.catlak)yarikSesDur(S.catlak,0.05);
  Object.assign(S,{yeme:null,ust:null,dag:null,uzan:null,pence:null,hitR:null,sarj:0,sarjP:null,en:250,yy:null,alk:null,sman:null,dkick:null,sup:null,pend:null,
    shoryu:0,slam:false,tats:0,blok:false,hp:HPMAX,inv:0,x:D.x0,vx:0,vy:0,yon:1,durum:'oyun',atk:null,kay:null,lungeT:-1,kayKilit:false,kayCif:-9,donuyor:false,
    spin:0,ekstra:1,parcalar:[],sonAtk:-9,yirtT:-9,bossGeldi:true,catlak:null,noEn:-9,ispEnT:0});
  S.kuyruk.length=0;S.y=zemin(S.x);S.yer=true;
  for(const k of ['N','F']){dmKolBirak(k);HS[k]='yum';ACT[k]=0}
  key.sol=key.sag=key.zipla=key.asagi=false;
  D.ates={};D.t0=S.t;D.e=null;
  if(D.d.kur)D.d.kur(D);
}
function demoBasla(k){
  demoBitir();
  const d=DEMOLAR[k];if(!d)return;
  DEMO={k,d,yv:[k,...(d.yv||[])],kayit:demoKaydet(),x0:S.x,t0:S.t,ates:{},e:null};
  document.getElementById('agac').classList.add('demo');
  demoSifirla();
}
function demoAdim(){
  const D=DEMO;let t=S.t-D.t0;
  if(t>=D.d.T){demoSifirla();t=0}
  D.d.f(t,a=>{if(t>=a&&!D.ates[a]){D.ates[a]=1;return true}return false},D);
}
function demoBitir(){
  if(!DEMO)return;
  if(S.catlak)yarikSesDur(S.catlak,0.05);
  const r=DEMO.kayit;DEMO=null;demoGeri(r);
  document.getElementById('agac').classList.remove('demo');
}
