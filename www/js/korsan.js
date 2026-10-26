'use strict';
// Kanca, korsan yapay zekâsı, oyuncu hasarı, korsan pozları ve çizimi
function kancaGuncelle(e,dt){      // kanca: hazırlık → atıldığı anki oyuncu yerine mermi gibi düz uçar → takılırsa çeker → ıskalar / ekrandan çıkarsa geri döner
  const h=e.kh,dur=S.t<(e.st||0)||e.tut||e.olu,u=e._u||[];
  if(h.ph==='haz'){if(dur){e.kh=null;return}
    if(S.t-h.t0>=0.5){const m=u[2]||u[0];if(!m){e.kh=null;return}
      h.ph='uc';h.x=m.x;h.y=m.y;const dx=S.x-h.x,dy=S.y+((S.yer&&asagiMi())?330:480)-h.y,L=Math.hypot(dx,dy)||1;h.vx=dx/L*1700;h.vy=dy/L*1700;savurCal(e.x)}      // atıldığı anki yere nişan alır
    return}
  if(h.ph==='uc'){
    if(dur){h.ph='don';return}
    h.x+=h.vx*dt;h.y+=h.vy*dt;if(h.y<zemin(h.x)+30){h.y=zemin(h.x)+30;if(h.vy<0)h.vy=0}
    if(S.durum==='oyun'&&oyuncuDeg(h.x,h.y,40)){      // vücudun neresine değerse hemen takılır
      if(dokunulmaz()){S.hp-=15;S.hitR={t0:S.t,z:'kafa',bk:(e.x-S.x)*S.yon>0?-1:1}}
      titre(40);torbaCal(BLD,BLDBAG,1);bufCal(GOH,1);kanFiskir(h.x,h.y,(e.x-S.x)>=0?1:-1,0.3);h.ox=h.x-S.x;h.oy=h.y-S.y;h.ph='cek';h.kT=S.t;h.cn=0.5;return}      // saplanınca bıçak sesi ve az kan
    if(Math.abs(h.x-S.x)>W/2/SC+250||h.y>S.y+2600)h.ph='don';      // ekrandan çıktı: geri döner
    return}
  if(h.ph==='cek'){      // takıldı: oyuncuyu kendine çeker
    if(dur||S.durum!=='oyun'){h.ph='don';return}
    if(S.t-(h.kT||S.t)>=(h.cn||0.5)){h.cn=(h.cn||0.5)+0.5;if(dokunulmaz()){S.hp-=1;S.pops.push({x:S.x,y:S.y+1050,t:0,txt:'-1',f:0.3})}}      // çekerken yarım saniyede 1 can
    h.x=S.x+(h.ox||0);h.y=S.y+(h.oy===undefined?480:h.oy);const d=e.x-S.x;
    if(S.t-(h.kT||0)>0.3){h.kT=S.t;kanFiskir(h.x,h.y,d>=0?1:-1,0.22)}if(Math.random()<dt*10)kanDamla(h.x+(Math.random()-0.5)*30,h.y,(Math.random()-0.5)*160,-80,0.5+Math.random()*0.4);      // çekilirken takıldığı yerden küçük kan ve damlalar
    if(Math.abs(d)<KANCA_BIRAK*(e.bs||1)){h.ph='don';e.mcd=0;return}      // bıraktığı mesafe
    S.x+=Math.sign(d)*1500*dt;S.vx=0;return}
  if(h.ph==='don'){const m=u[2]||u[0]||{x:e.x,y:e.y+500},dx=m.x-h.x,dy=m.y-h.y,L=Math.hypot(dx,dy),st=2600*dt;
    if(L<=st+20){e.kh=null;e.acd=S.t+2.5+Math.random()*1.5;return}
    h.vx=dx/L*2600;h.vy=dy/L*2600;h.x+=dx/L*st;h.y+=dy/L*st}
}
const KANCA_BIRAK=420,KANCA_YUM=610;      // kanca oyuncuyu yumruk atabileceği yakınlığa (420) çekip bırakır; 610'a kadar yumruk atar
const zEkr=(x,y)=>[W/2+(x-S.x)*SC,ZY()-(y-S.camY)*SC];
function zincirCiz(pts,s0,s1){      // dünya noktaları boyunca zincir halkaları; boyut s0 → s1 (küçülme)
  const im=R.h_zincir;if(!im||pts.length<2)return;const K=KSK.h,Z=1.44,L0=K.zl[0]*K.sc*0.82*Z;      // Z: halka boyu
  const seg=[];let tot=0;for(let i=1;i<pts.length;i++){const l=Math.hypot(pts[i][0]-pts[i-1][0],pts[i][1]-pts[i-1][1]);seg.push(l);tot+=l}
  if(tot<2)return;
  const at=d=>{let i=0;while(i<seg.length-1&&d>seg[i]){d-=seg[i];i++}const f=seg[i]?Math.min(1,d/seg[i]):0,a=pts[i],b=pts[i+1];return [a[0]+(b[0]-a[0])*f,a[1]+(b[1]-a[1])*f,Math.atan2(b[1]-a[1],b[0]-a[0])]};
  for(let d=0;d<tot;){const sc=s0+(s1-s0)*d/tot,st=L0*sc,p=at(Math.min(tot,d+st/2)),q=zEkr(p[0],p[1]),w=K.zl[0]*K.sc*sc*SC*Z,hh=K.zl[1]*K.sc*sc*SC*Z;
    ctx.save();ctx.translate(q[0],q[1]);ctx.rotate(-p[2]);ctx.drawImage(im,-w/2,-hh/2,w,hh);ctx.restore();d+=st}
}
function egri(a,b,sag,c){const P=[],cx=c?c[0]:(a[0]+b[0])/2,cy=c?c[1]:(a[1]+b[1])/2-sag;for(let i=0;i<=12;i++){const t=i/12,m=1-t;P.push([m*m*a[0]+2*m*t*cx+t*t*b[0],m*m*a[1]+2*m*t*cy+t*t*b[1]])}return P}      // sarkan zincir (ikinci derece eğri)
function kancaCiz(e,on){      // on=false: sırttaki makaradan uzak ele (gövdenin arkasında); on=true: elden kancaya + uçan kanca
  const u=e._u;if(!u||!u[3]||!u[4]||e.olu)return;
  const sp=[u[3].x,u[3].y],F=[u[4].x,u[4].y],yn=e.yon||1;
  if(!on){zincirCiz(egri(sp,F,0,[sp[0]-yn*70,F[1]-200]),1,1);return}
  const h=e.kh,uc_=h&&h.ph!=='haz';
  if(!uc_){if(u[2])zincirCiz(egri(F,[u[2].x,u[2].y],70),1,0.8);return}
  const N=u[1]?[u[1].x,u[1].y]:F,H=[h.x,h.y];      // kancayı atan el (arkadaki kol)
  zincirCiz(egri(F,N,50),1,0.85);zincirCiz(egri(N,H,h.ph==='don'?40:8),0.85,0.85);
  const im=R.h_kanca;if(!im)return;const q=zEkr(h.x,h.y),a=h.ph==='cek'?Math.atan2(S.y+480-e.y-500,S.x-e.x):(h.ph==='don'?Math.atan2(-h.vy,-h.vx):Math.atan2(h.vy,h.vx)),k=KSK.h.sc*(e.bs||1)*SC;
  ctx.save();ctx.translate(q[0],q[1]);ctx.rotate(-a);if(Math.cos(a)<0)ctx.scale(1,-1);ctx.scale(k,k);ctx.drawImage(im,-KSK.h.A.kanca[0],-KSK.h.A.kanca[1]);ctx.restore();
}
function korsanAI(e,dt,dx){      // insan gibi yürür; menzilde 1-3 vuruşluk kombo (k: yumruk, b: bıçak, p: yumruk + dipçik); kaptan uzaktan nişan alıp ateş eder
  const a=e.ka,ad=Math.abs(dx),bs=e.bs||1;
  if(!a)e.yon=dx>=0?1:-1;
  if(e.demo&&!a){e.moving=false;return}      // önizleme düşmanı: durur, saldırmaz
  e.moving=false;
  if(a){
    if(!a.wh&&(S.t-a.t0)/KDUR[a.k]>=0.2){a.wh=true;savurCal(e.x)}      // sallama sesi
    if(a.k==='B'&&e.kc==='b'&&!e.kSes&&S.t-a.t0>=KDUR.B*0.3){e.kSes=true;torbaCal(KLC,[],0.9)}      // bıçak savrulurken rastgele kılıç sesi
    if(e.kc!=='b'&&!a.ses){const u=(S.t-a.t0)/KDUR[a.k],ix=(a.k==='F'||(a.k==='B'&&e.kc==='p'))?1:0;if(u>=0.38&&u<=0.66&&ucDeger(e,60,ix,ix)){a.ses=true;ses('yumruk')}}      // yumruk değdiği an ses (blok olsa da)
    if(S.t>=a.t0+KDUR[a.k]){if(++a.i<a.seq.length){a.k=a.seq[a.i];a.t0=S.t;a.hit=false;a.ses=false;a.wh=false;e.kSes=false}else{e.ka=null;e[(e.kc==='p'||e.kc==='h')?'mcd':'acd']=S.t+0.6+Math.random()*0.8}}
    return;
  }
  if(e.kc==='h'){      // kancacı: hiç yürümez; yakında iki elle vurur, uzakta kanca atar
    if(e.kh)return;
    if(ad<KANCA_YUM*bs){if(S.durum==='oyun'&&S.t>=(e.mcd||0)){const n=2+Math.floor(Math.random()*2),seq=[];for(let i=0;i<n;i++)seq.push(i%2?'F':'N');e.ka={seq,i:0,k:seq[0],t0:S.t,hit:false};e.kSes=false}return}
    if(ad<2100&&S.durum==='oyun'&&S.t>=(e.acd||0))e.kh={ph:'haz',t0:S.t};
    return;
  }
  const MZ=e.kc==='b'?425:e.kc==='p'?430*bs:470,V=(e.boss?170:e.kc==='p'?210:260)*2;      // vurma menzili, yürüme hızı (eskinin 2 katı)
  if(!e.boss&&!e.kacti&&e.hp>0&&e.hp<e.max*0.25){e.kacti=true;e.kac={t0:S.t,hp0:e.hp,v:0};e.geri=false}      // canı ilk kez %25 altına düşünce bir kez kaçar
  if(e.kac){const k=e.kac;
    if(S.t-k.t0>=10||k.v>=4)e.kac=null;      // 10 sn dolunca ya da 4 kez vurulunca savaşa döner
    else{e.hp=Math.min(e.max*0.5,e.hp+(e.max*0.5-k.hp0)/10*dt);kYuru(e,dt,dx>=0?-1:1,V/2,true);return}}      // topallayarak uzaklaşır, canı %50'ye doğru dolar
  const vurBasla=()=>{if(S.durum!=='oyun'||S.t<((e.kc==='p'?e.mcd:e.acd)||0))return false;
    const n=1+Math.floor(Math.random()*(e.kc==='k'?3:2)),seq=[];
    for(let i=0;i<n;i++)seq.push(e.kc==='b'?'B':e.kc==='p'?(i%2?'B':'N'):i%2?'N':'F');
    e.ka={seq,i:0,k:seq[0],t0:S.t,hit:false};e.kSes=false;return true};
  if(!e.ks&&(e.geri||ad<MZ*0.55)){e.geri=ad<MZ*0.95;if(e.geri){if(ad<MZ&&vurBasla())return;kYuru(e,dt,dx>=0?-1:1,V*0.825,false);return}}      // içine girilince geri geri menzilin ucuna; geri giderken de vurabildiği an normal vurur
  if(e.kc==='p'&&(e.ks||(ad>=860*bs&&ad<1900))){      // ateş için en az mesafe eskisinin 2 katı      // nişan al (hazırlık sesi), 0.6 sn sonra ateş; ateşler arası 1-2 sn rastgele
    const ks=e.ks;
    if(ks){
      if(!ks.fired&&S.t-ks.t0>=0.6){ks.fired=true;ks.tf=S.t;pAtesle(e)}
      if(ks.fired&&S.t-ks.tf>=0.45){e.ks=null;e.acd=ks.tf+3+Math.random()*2}      // ateşler arası 3-5 sn
      return;
    }
    if(S.durum==='oyun'&&S.t>=(e.acd||0)){e.ks={t0:S.t,fired:false};bufCal(HAZ,0.9);return}
  }
  else if(ad<(e.kc==='b'?425:e.kc==='p'?430*bs:470)){
    vurBasla();
    return;
  }
  kYuru(e,dt,e.yon,V,false);
}
function kYuru(e,dt,dir,v,topal){      // yürüyüş: her adımda ses ve karda iz; dir bakılan yönün tersiyse geri geri yürür; topal: aksayarak (yüz uzaklaşma yönüne)
  if(topal)e.yon=dir;
  e.moving=true;const geri=dir!==e.yon;e.wf=(e.wf||0)+(geri?-1:1)*dt*4.6*v/(e.boss?340:e.kc==='p'?420:520)*2;
  const k=Math.floor(e.wf/Math.PI);if(e.adk!==undefined&&k!==e.adk){adimCal(e.x,e.boss?2.2:1);karBas(e.x+(e.yon||1)*(k%2?60:-40),80,KMIN)}e.adk=k;
  const nx=e.x+dir*v*dt*(topal?0.35+0.65*Math.abs(Math.sin(e.wf)):1);
  if(zemin(nx)-e.y<=70){e.x=nx;e.y=Math.max(e.y,zemin(nx))}else{e.vy=1800;e.vx=dir*380}   // basamak yüksekse zıpla
}
const dokunulmaz=()=>S.durum==='oyun'&&S.t>=S.inv&&!(S.shoryu>0)&&!(S.tats>0)&&!S.sman&&!S.alk;      // oyuncu şu an hasar alabilir mi
function oyuncuHasar(){
  if(S.durum!=='oyun')return;
  if(dokunulmaz())for(const e of DUS){
    if(e.olu||S.t<e.st||!korsanYakin(e))continue;
    const dm=e.boss?15:e.kc==='b'?15:10,yn=S.x>=e.x?1:-1;
    if(S.blok){
      if(S.t-S.blokT<0.5){                                   // tam zamanında blok = parry: düşman sersemler
        e.st=S.t+(e.boss?0.8:1.5);e.vx=-yn*(e.boss?250:1200);e.vy=500;S.inv=S.t+0.5;
        S.pops.push({x:S.x,y:S.y+950,t:0,txt:dil('parry'),f:1});titre(50);S.sars=Math.max(S.sars,8);
      }else{S.hp-=Math.max(1,Math.round(dm*0.5));titre(30)}   // normal blok: hasarın yarısı engellenir
    }else{
      if(e.kc==='b')bufCal(SAPLA,1);S.hp-=dm;
      const rel=kisit((e.y+e.cy-S.y)/800,0,1.1);S.hitR={t0:S.t,z:rel<0.4?'bacak':rel<0.78?'govde':'kafa',bk:((e.x-S.x)*S.yon>0)?1:-1};   // vurulan yer ve yön: tepki buna göre
    }
  }      // korunma süresi yok: her düşmanın her vuruşu ayrı sayılır (aynı vuruş bir kez)
  if(DEMO)S.hp=Math.max(S.hp,1);      // önizlemede ölünmez, bölüm bitmez
  else if(S.hp<=0){S.hp=0;S.durum='yenildi';S.durumT=S.t;bufCal(GOS,1)}      // kaybedince game over sesi
  else if(!S.bossGeldi){if(S.x>BOSS_X-2400)bossKur()}            // boss ancak yolun sonuna gelince
  else if(!DUS.some(e=>e.boss&&!(e.olm&&e.olm.yat&&S.t-e.olm.yat>1))){S.durum='tamam';S.durumT=S.t}
}
// ---- çizim ----
function uc(e,i,lx,ly){      // çizim sırasında uzvun dünya konumunu kaydet: vuruş = uzuv gerçekten değince
  if(!e||!e.t)return;
  const m=ctx.getTransform(),px=(m.e+m.a*lx+m.c*ly)/DPR,py=(m.f+m.b*lx+m.d*ly)/DPR;
  (e._u||(e._u=[]))[i]={x:S.x+(px-W/2)/SC,y:S.camY+(ZY()-py)/SC,t:S.t};
}
function bk(e,n,lx,ly){const m=ctx.getTransform(),px=(m.e+m.a*lx+m.c*ly)/DPR,py=(m.f+m.b*lx+m.d*ly)/DPR,b=e._b||(e._b={});b[n]={x:S.x+(px-W/2)/SC,y:S.camY+(ZY()-py)/SC};b.t=S.t}      // vücut noktası (kalça, boyun, kafa, diz, bot): düşmanın vurulabilir yeri
function ucDeger(e,r,ilk,son){      // kaydedilen uzuv noktalarından biri oyuncunun gövdesine değiyor mu
  const u=e._u;if(!u)return false;
  for(let i=ilk;i<=son;i++){const p=u[i];if(!p||S.t-p.t>0.25)continue;
    if(oyuncuDeg(p.x,p.y,r*0.5))return true}
  return false;
}
// ---------- Korsan (insan dövüşçü): oyuncunun iskeleti gibi omuz → dirsek → bilek, kalça → diz; parça halkaları eklem noktası ----------
// üç görünüm aynı iskelet ve hareketlerle: k = yumruklu, b = bıçaklı, p = tabancalı kaptan (boss)
const KSK={      // her korsan kendi görsel setinden, tüm parçalar aynı ölçekte (eklem noktaları = parçalardaki halkalar)
  k:{p:'k_',sc:0.855,A:{ust:[79.1,60.4],on:[134.9,48.3],elN:[87.2,38.2],elF:[92.7,41.0],uy:[111.2,54.2],bacak:[97.1,44.4],bot:[75.0,36.0],govde:[148.6,345.0],kalca:[112.4,26.8],kafa:[173.6,208.1],vur:[173.6,219.1],ahh:[173.6,217.1],aci:[140.0,219.0]},
     ust:185.6,on:172.3,uy:248.8,ak:[0,197.5],bh:111.0,bel:641.6,kN:[20.0,84.2],kF:[-16.0,84.2],omN:[-103.0,-220.2],omF:[50.6,-229.2],boyun:[12.6,-330.7]},
  b:{p:'b_',sc:0.794,A:{ust:[55.3,52.2],on:[125.2,45.5],elN:[65.9,32.1],elF:[91.8,40.6],uy:[87.9,39.7],bacak:[60.5,30.8],bot:[86.4,28.8],govde:[118.0,297.0],kalca:[98.4,49.7],kafa:[180.9,236.6],vur:[180.9,241.6],ahh:[180.9,246.6]},
     ust:137.0,on:165.6,uy:191.3,ak:[0,103.2],bh:249.2,bs:1.15,bel:624.4,kN:[15.0,75.9],kF:[-21.0,75.9],omN:[-53.2,-195.0],omF:[58.4,-204.0],boyun:[37.8,-283.5]},
  p:{p:'p_',sc:0.86,bf:1,A:{ust:[57.7,47.7],on:[104.6,39.0],elN:[133.9,38.5],elF:[85.1,40.1],uy:[74.3,45.2],bacak:[70.9,42.3],bot:[57.6,43.8],govde:[126.8,268.8],kalca:[85.8,50.2],kafa:[181.3,224.3],vur:[179.3,230.3],ahh:[179.3,246.3],ates:[3.0,45.9]},
  ust:137.0,on:130.3,uy:196.8,ak:[0,141.7],bh:131.2,bs:1.1,mz:[-0.0,352.4],bel:592.0,kN:[0.0,95.0],kF:[-36.0,95.0],omN:[-96.2,-151.8],omF:[47.8,-181.8],boyun:[-5.0,-231.6]},      // kaptan: belden aşağısı %10 büyük (bs, uyluk, bel yüksekliği), kafa 10 birim ileride
  h:{p:'h_',sc:0.9315,us:1.375,A:{ust:[65.4,43.8],on:[107.1,37.5],elN:[105.8,47.3],elB:[78.9,36.2],elF:[100.3,36.8],uy:[90.5,40.4],bacak:[75.6,36.1],bot:[68.2,25.7],govde:[176.8,326.0],alt:[182.8,47.4],kalca:[116.5,35.6],kafa:[69.1,128.1],vur:[67.1,127.1],ahh:[67.1,128.1],kanca:[15.8,49.6]},
  ust:145.0,on:134.6,uy:184.1,ak:[0.0,151.2],bh:145.3,bel:662.0,tek:1,kN:[0.0,77.8],kF:[-40.0,77.8],omN:[-112.1,-219.9],omF:[24.7,-253.7],boyun:[-8.6,-286.1],goz:[-69.6,62.2],zt:[39.3,95.0],sp:[-104.7,-289.3],zl:[61,28],ud:115.5,kd:27.3,ks:1.05}      // ud: belden üstü aşağı kayma, kd: kafa aşağı kayma, ks: kafa ek ölçeği      // kancacı: yürümez, kanca fırlatır (goz: kancanın zincir halkası, zt: zincirli elin zincir çıkışı, sp: sırttaki makara)
};
const KDUR={F:0.5,N:0.62,B:0.66},KBDUR=0.7;      // vuruş süreleri: F = uzak kol yumruğu, N = yakın kol yumruğu, B = yakın elle bıçak / dipçik savurma; KBDUR: tutulurken kafa atma
const KPZ={dur:{hx:0,torso:6,bas:-3,uN:-35,rN:-105,wN:0,uF:-55,rF:-100,wF:0,lN:3,kN:6,lF:-14,kF:12}};
KPZ.hazF=Object.assign({},KPZ.dur,{uF:-28,rF:-128,torso:2,hx:-15});
KPZ.vurF=Object.assign({},KPZ.dur,{uF:-90,rF:-4,wF:-6,torso:13,bas:2,hx:40,lN:4,kN:8,lF:-18,kF:16});
KPZ.hazN=Object.assign({},KPZ.dur,{uN:-22,rN:-132,torso:-4,hx:-25,uF:-60,rF:-110});
KPZ.vurN=Object.assign({},KPZ.dur,{uN:-88,rN:-6,wN:-6,uF:-35,rF:-115,torso:20,bas:4,hx:70,lN:4,kN:6,lF:-24,kF:20});
KPZ.hazB=Object.assign({},KPZ.dur,{uN:-205,rN:-75,wN:25,torso:-9,bas:-6,hx:-20,uF:-40,rF:-95});      // bıçaklı el başın üstünden arkaya kalkar
KPZ.vurB=Object.assign({},KPZ.dur,{uN:-55,rN:-12,wN:50,torso:20,bas:6,hx:75,uF:-30,rF:-110,lN:4,kN:6,lF:-26,kF:22});      // yukarıdan öne-aşağı savurur
const nfDegis=o=>{const r={};for(const k in o){const m=k.match(/^([urw])([NF])$/);r[m?m[1]+(m[2]==='N'?'F':'N'):k]=o[k]}return r};      // kolları yer değiştir (N ↔ F)
KPZ.hazP=nfDegis(Object.assign({},KPZ.hazB,{wN:50}));      // kaptan: silah ters tutulur (namlu havada, kendine doğru), el yukarıdan arkaya kalkar
KPZ.vurP=Object.assign(nfDegis(Object.assign({},KPZ.vurB,{uN:-80,rN:-6,wN:-144})),{torso:36,bas:8,hx:120,lN:2,kN:6,lF:-32,kF:26});      // dipçik / tutma yeriyle yukarıdan öne-aşağı vurur
KPZ.sars=Object.assign({},KPZ.dur,{torso:-16,bas:-20,hx:-35,uN:-12,rN:-70,uF:-28,rF:-60,lN:6,kN:18,lF:-12,kF:20});
KPZ.dus=Object.assign({},KPZ.dur,{torso:-26,bas:-28,hx:-20,uN:-150,rN:-35,wN:0,uF:-165,rF:-25,wF:0,lN:-50,kN:65,lF:-15,kF:35});      // darbe: gövde geri bükülür, kollar savrulur, bacaklar öne kalkar
KPZ.yat=Object.assign({},KPZ.dur,{torso:-4,bas:-14,hx:0,uN:-165,rN:-20,wN:0,uF:-130,rF:-30,wF:0,lN:-14,kN:28,lF:2,kF:10});      // sırtüstü: kollar yana açık, bacaklar gevşek
KPZ.diz=Object.assign({},KPZ.dur,{torso:24,bas:-8,hx:0,uN:-50,rN:-15,wN:0,uF:-10,rF:-30,wF:0,lN:-82,kN:88,lF:12,kF:100});      // tek diz: ön ayak basar, arka diz yerde, yakın el ön dizden destek alır
function dusPoz(e,p){      // yere düşme ve kalkma pozları
  const d=e.dus,ez=x=>x*x*(3-2*x),gs=d.son-DUS_KALK,b=90*(e.dusA||0),sg=d.yn===-(e.yon||1)?1:-1;      // sg: sırtüstü (1) / yüzüstü (-1)
  if(S.t<gs){const u=(S.t-d.t0)/DUS_DUS;
    if(u<1)return kKar(p,KPZ.dus,ez(kisit(u*2.5,0,1)));
    const y=kKar(KPZ.dus,KPZ.yat,ez(kisit((u-1)/0.5,0,1)));if(!e.olu)y.torso+=Math.sin(S.t*3)*1.5;return y}      // yerde nefes alır
  const g=(S.t-gs)/DUS_KALK,otur=Object.assign({},KPZ.dur,{torso:28,bas:-6,hx:0,uN:-50,rN:-20,wN:0,uF:35,rF:-10,wF:0,lN:sg*(b-90)-8,kN:45,lF:sg*(b-90)+4,kF:75});      // oturur: bacaklar yerde öne uzanır, bir diz kalkar, arka el yere dayanır
  if(g<0.35)return kKar(KPZ.yat,otur,ez(g/0.35));
  if(g<0.65)return kKar(otur,KPZ.diz,ez((g-0.35)/0.3));
  return kKar(KPZ.diz,p,ez((g-0.65)/0.35));
}
KPZ.hava=Object.assign({},KPZ.dur,{torso:0,uN:-70,rN:-50,uF:-85,rF:-40,lN:-30,kN:60,lF:12,kF:70});
function kolYere(e,dt){      // yerde yatarken kollar omuz kökünden döner, el yere değene kadar iner; yer çok uzaksa en fazla 80° döner
  const u=e._u,yk=e.yk||(e.yk=[0,0]),d=e.dus,yat=(e.olu&&(e.dusA||0)>0.85)||(d&&S.t-d.t0>DUS_DUS&&S.t<d.son-DUS_KALK),yn=e.yon||1,w=v=>((v+Math.PI*3)%(Math.PI*2))-Math.PI;
  for(const i of [0,1]){
    let hd=0;const h=u&&u[i],o=u&&u[i+5];
    if(yat&&h&&o&&S.t-h.t<0.1&&S.t-o.t<0.1){
      const vx=h.x-o.x,vy=h.y-o.y,L=Math.hypot(vx,vy)||1,f=Math.atan2(vy,vx),s=kisit((zemin(e.x)+18-o.y)/L,-1,1),a1=Math.asin(s),d1=w(a1-f),d2=w(Math.PI-a1-f);
      hd=kisit(yk[i]-(Math.abs(d1)<Math.abs(d2)?d1:d2)*yn/D,-80,80);
    }
    yk[i]+=(hd-yk[i])*Math.min(1,dt*6);
  }
}
function kKar(a,b,f){const o={};for(const n in a)o[n]=a[n]+(b[n]-a[n])*f;return o}
KPZ.dizler=Object.assign({},KPZ.dur,{torso:12,bas:-16,hx:0,uN:-25,rN:-25,wN:0,uF:-12,rF:-30,wF:0,lN:-2,kN:96,lF:4,kF:96});      // iki diz üstüne çökmüş
KPZ.olUc=Object.assign({},KPZ.dur,{torso:-32,bas:-24,hx:-45,uN:-82,rN:-22,wN:0,uF:-96,rF:-18,wF:0,lN:-48,kN:35,lF:-28,kF:45});      // uçarak ölüm: kollar öne (vurana doğru), kalça önde, gövde geride
KPZ.olOtur=Object.assign({},KPZ.dur,{torso:-10,bas:-12,hx:-10,uN:-30,rN:-30,wN:0,uF:-20,rF:-25,wF:0,lN:-88,kN:8,lF:-84,kF:14});      // kıç üstü oturmuş, bacaklar önde
KPZ.olUcT=Object.assign({},KPZ.dur,{torso:30,bas:18,hx:40,uN:45,rN:-20,wN:0,uF:60,rF:-25,wF:0,lN:28,kN:35,lF:42,kF:45});      // arkası dönükken uçarak ölüm: karnı ve kafası önde, kollar ve bacaklar arkada
KPZ.olYuz=Object.assign({},KPZ.dur,{torso:34,bas:6,hx:20,uN:-70,rN:-20,wN:0,uF:-45,rF:-20,wF:0,lN:-6,kN:75,lF:4,kF:85});      // yüzüstü yere sekme
KPZ.yatYuz=Object.assign({},KPZ.dur,{torso:0,bas:10,hx:0,uN:-110,rN:-8,wN:0,uF:-70,rF:-8,wF:0,lN:4,kN:8,lF:-4,kF:12});      // yüzüstü yere yapışmış: kollar açık
function olmPoz(e,p){
  const o=e.olm,ez=x=>x*x*(3-2*x);
  if(o.tip==='diz'){const u=S.t-o.t0;return u<0.45?kKar(p,KPZ.dizler,ez(u/0.45)):kKar(KPZ.dizler,KPZ.yat,e.dusA||0)}
  const U=o.ters?KPZ.olUcT:KPZ.olUc,O=o.ters?KPZ.olYuz:KPZ.olOtur;
  if(o.f==='hava')return kKar(p,U,ez(kisit((S.t-o.t0)/0.15,0,1)));
  if(o.f==='sek')return kKar(U,O,0.6);
  const a=e.dusA||0,y=kKar(O,o.ters?KPZ.yatYuz:KPZ.yat,a);
  if(o.ters)return y;      // yüzüstü: kollar açık yere yapışır
  if(o.kol===undefined)o.kol=Math.random()<0.6?0:1;      // kollar havada kalmaz: gövdenin yanına (ya da şansa göre başın arkasına) yere düşer
  const tN=o.kol?-178:6,tF=o.kol?-170:-4;y.uN=O.uN+(tN-O.uN)*a;y.uF=O.uF+(tF-O.uF)*a;y.rN=O.rN*(1-a)-8*a;y.rF=O.rF*(1-a)-6*a;return y;
}
function korsanPoz(e){
  const ez=x=>x*x*(3-2*x),t=e.anim||0;let p=Object.assign({},KPZ.dur);
  if(e.olm){const q=olmPoz(e,p);if(e.yk){q.uN+=e.yk[0];q.uF+=e.yk[1]}return q}
  if(!e.olu){p.torso+=Math.sin(t*2.2)*1.5;p.uN+=Math.sin(t*2.2)*3;p.uF+=Math.sin(t*2.2+1)*3}      // gardda nefes (ölü nefes almaz)
  if(e.kc==='b')p.wN+=60;      // bıçak gardda öne-yukarı bakar
  if(e.kc==='p'){p.uF=-6+Math.sin(t*2.2)*2;p.rF=-2;p.wF=0}
  if(e.kc==='h'){p.uF=-18+Math.sin(t*2.2)*3;p.rF=-58;p.wF=8;p.uN=-26;p.rN=-62;p.wN=0}      // kancacı: kancalı el arkadaki kolda, zincirli el önde      // kaptan: tabancalı kol düz aşağı sarkar, namlu kolla paralel
  if(e.moving){const ph=e.wf||0,s=Math.sin(ph),c=Math.cos(ph);      // yürüyüş: bacaklar sırayla, öne giden bacağın dizi bükülür; kollar ters salınır
    p.lN=-4-24*s;p.kN=6+38*Math.max(0,c);p.lF=-4+24*s;p.kF=6+38*Math.max(0,-c);p.uN+=9*s;p.uF-=9*s;p.torso+=3}
  if(e.kac&&!e.ka){const s=Math.sin(e.wf||0);      // canı azalıp kaçarken: kollar aşağı sarkık, bel hafif bükük, başı önde; aksayarak gider
    Object.assign(p,{uN:4+5*s,rN:-8,wN:0,uF:2-5*s,rF:-8,wF:0,torso:p.torso+16,bas:9})}
  const a=e.ka;
  if(a&&KDUR[a.k]){const u=(S.t-a.t0)/KDUR[a.k];
    if(u>=0&&u<1){const pb=e.kc==='p'&&a.k==='B',H=pb?KPZ.hazP:KPZ['haz'+a.k],V=pb?KPZ.vurP:KPZ['vur'+a.k];
      p=u<0.3?kKar(p,H,ez(u/0.3)):u<0.45?kKar(H,V,ez((u-0.3)/0.15)):u<0.62?Object.assign({},V):kKar(V,p,ez((u-0.62)/0.38))}}
  const kh=e.kh;
  if(e.kc==='h'&&kh&&!e.tut){      // kanca: geri kalkar, fırlatır; kol kancaya doğru uzanır, takılınca geri çeker
    if(kh.ph==='haz'){const u=kisit((S.t-kh.t0)/0.5,0,1);p=kKar(p,Object.assign({},p,{uF:-165,rF:-55,wF:20,torso:-10,bas:-4,hx:-25}),ez(u))}
    else{const K=KSK.h,dxl=(kh.x-e.x)*(e.yon||1),ys=e.y+(K.bel-K.omF[1]*K.us-(K.ud||0))*K.sc*(e.bs||1),th=Math.atan2(-dxl,ys-kh.y)/D;
      p=Object.assign(p,kh.ph==='cek'?{uF:-40,rF:-110,wF:0,torso:-12,bas:-3,hx:-30}:{uF:th,rF:-4,wF:0,torso:12,bas:2,hx:30})}
  }
  const ks=e.ks;
  if(e.kc==='p'&&ks&&!e.tut){      // nişan: tabanca oyuncunun kafasına doğrulur, ateşten sonra geri tepme ve indirme
    const K=KSK.p,dxl=Math.max((S.x-e.x)*(e.yon||1),60),ys=e.y+(K.bel-K.omF[1])*K.sc*(e.bs||1),th=Math.atan2(-dxl,ys-kafaY())/D;
    const u=S.t-ks.t0,ri=ez(kisit(u/0.45,0,1)),rec=ks.fired?Math.max(0,1-(S.t-ks.tf)/0.3):0,lo=ks.fired?ez(kisit((S.t-ks.tf-0.12)/0.25,0,1)):0;
    p=kKar(p,Object.assign({},KPZ.dur,{uF:th+4-14*rec,rF:-4,wF:0,torso:7-9*rec,bas:2,hx:-12*rec,uN:-45,rN:-95,wN:0}),ri*(1-lo));
  }
  if(e.tut){
    p=kKar(KPZ.sars,KPZ.hava,0.5+0.5*Math.sin(t*14));      // tutulunca çırpınır
    if(e.kb){const u=(S.t-e.kb.t0)/KBDUR,a=u<0.3?-0.4*ez(u/0.3):u<0.5?-0.4+1.4*ez((u-0.3)/0.2):u<0.65?1:ez(1-(u-0.65)/0.35);      // kafa atma: geri çeker, öne fırlatır
      p.hb=a;p.torso+=a*20;p.bas+=a*18}
  }
  else{
    if(e.y>zemin(e.x)+5)p=kKar(p,KPZ.hava,0.8);
    if(S.t<(e.st||0)){p=kKar(p,KPZ.sars,ez(kisit((e.st-S.t)/0.45,0,1)))}      // darbe tepkisi: geri savrulur
    if(!e.dus&&S.t-(e.hafT||-9)<0.25){const k=1-(S.t-e.hafT)/0.25;p.torso-=7*k;p.bas-=6*k}      // hafif vuruş: çok az geri eğilir
    if(e.dus){p=dusPoz(e,p);if(e.yk){p.uN+=e.yk[0];p.uF+=e.yk[1]}}
  }
  if(e.zpk&&!e.tut&&!e.olu&&!e.dus)p=zpkKorsanPoz(e,p);      // zıpkınlandı: elleri mızrakta, çırpınır
  return p;
}
function krp(img,a,fl){
  ctx.drawImage(img,-a[0],-a[1]);
  if(fl){ctx.save();ctx.globalCompositeOperation='lighter';ctx.globalAlpha=0.55;ctx.drawImage(img,-a[0],-a[1]);ctx.restore()}
}
const KFS=0.9;      // perspektif: arkadaki (uzak) kol ve bacak %90 boyutunda
function kKol(K,om,u,r,w,far,fl,e,ix){
  const P=K.p,A=K.A;
  ctx.save();ctx.translate(om[0],om[1]);if(e)uc(e,ix+5,0,0);if(far)ctx.scale(KFS,KFS);ctx.rotate(u*D);      // omuz noktası (5: yakın, 6: uzak)
  krp(R[P+(far?'ust_k':'ust')],A.ust,fl);
  ctx.translate(0,K.ust);ctx.rotate(r*D);
  let hn=far?'elF_k':'elN',ha=far?A.elF:A.elN;
  if(P==='p_'){hn=far?'elN_k':'elF';ha=far?A.elN:A.elF}      // kaptan: tabancalı el arkadaki kolda, yumruk öndeki kolda
  if(P==='h_'){const bos=far&&e&&e.kh&&e.kh.ph!=='haz';hn=far?(bos?'elB_k':'elN_k'):'elF';ha=far?(bos?A.elB:A.elN):A.elF}      // kancacı: kancalı el arkadaki kolda (atınca boş yumruk), zincirli el öndeki kolda
  ctx.save();ctx.translate(0,K.on);ctx.rotate(w*D);krp(R[P+hn],ha,fl);
  if(e){uc(e,ix,0,75);if(!far&&P==='b_'){uc(e,2,188.7,6.5);uc(e,3,343.1,11.9)}if(far&&P==='p_')uc(e,2,K.mz[0],K.mz[1]);if(P==='h_'){if(far)uc(e,2,K.goz[0],K.goz[1]);else uc(e,4,K.zt[0],K.zt[1])}}      // yumruğun / bıçağın dünya konumu: vuruş = gerçekten değince
  ctx.restore();
  if(e&&P==='h_'){const i=far?9:7;uc(e,i,0,K.on*0.35);uc(e,i+1,0,K.on*0.75)}      // kancacının ön kolu da vurur
  krp(R[P+(far?'on_k':'on')],A.on,fl);      // ön kol halkası dirseği örter
  ctx.restore();
}
function kBacak(K,h,l,k,far,fl,e){
  const P=K.p,A=K.A;
  const bs=K.bs||1;
  ctx.save();ctx.translate(h[0],h[1]);if(far)ctx.scale(KFS,KFS);ctx.rotate(l*D);
  ctx.save();ctx.translate(0,K.uy);if(e){const s=far?'F':'N';bk(e,'d'+s,0,0);bk(e,'a'+s,bs*K.ak[0],bs*(K.ak[1]+K.bh*0.6))}ctx.rotate(k*D);
  const bot=()=>{ctx.save();ctx.translate(bs*K.ak[0],bs*K.ak[1]);ctx.rotate(-(l+k)*D);ctx.scale(bs,bs);krp(R[P+(far?'bot_k':'bot')],A.bot,fl);ctx.restore()};      // bot hep düz: tabanı yere paralel, alt bacakla dönmez
  if(!K.bf)bot();
  ctx.save();ctx.scale(bs,bs);krp(R[P+(far?'bacak_k':'bacak')],A.bacak,fl);ctx.restore();
  if(K.bf)bot();      // uzun bot: pantolon botun içine girer (bot önde)
  ctx.restore();
  ctx.save();ctx.scale(bs,bs);krp(R[P+(far?'uy_k':'uy')],A.uy,fl);ctx.restore();
  ctx.restore();
}
function korsanYakin(e){      // sadece vuruş anındayken ve yumruk / bıçak oyuncuya gerçekten değiyorsa
  const a=e.ka;if(!a||a.hit||!KDUR[a.k])return false;
  const u=(S.t-a.t0)/KDUR[a.k];if(u<0.38||u>0.66)return false;
  let ok=a.k==='B'?(e.kc==='b'?(ucDeger(e,70,2,3)||ucDeger(e,60,0,0)):ucDeger(e,60,e.kc==='p'?1:0,e.kc==='p'?1:0)):a.k==='N'?ucDeger(e,60,0,0):ucDeger(e,60,1,1);
  if(!ok&&e.kc==='h'){const i=a.k==='N'?7:9;ok=ucDeger(e,90,i,i+1)}      // kancacı: ön kolu da vurur
  if(ok){a.hit=true;return true}
  return false;
}
function ciziKorsan(e,mask){
  const K=KSK[e.kc||'k'],fl=e.fl>0,p=korsanPoz(e),up=mask!=='alt',lo=mask!=='ust',ek=e.t?e:null;
  const kfy=K.kF[1]+0.05*(K.uy+(K.bs||1)*(K.ak[1]+K.bh)),ay=(h,l,k,sc=1)=>h[1]+sc*(K.uy*Math.cos(l*D)+(K.bs||1)*(K.ak[0]*Math.sin((l+k)*D)+K.ak[1]*Math.cos((l+k)*D)+K.bh));      // uzak bacak biraz aşağıdan başlar (kısaldığı için)      // belden ayak tabanına dikey mesafe
  const bel=mask?0:(K.tek||e.y>zemin(e.x)+5?K.bel:Math.max(ay(K.kN,p.lN,p.kN),ay([K.kF[0],kfy],p.lF,p.kF,KFS)));      // yerdeyse alttaki ayak zemine basar
  ctx.save();ctx.scale(K.sc*(e.bs||1)*(e.yon||1),K.sc*(e.bs||1));ctx.translate(mask?0:p.hx,-bel);if(ek&&!mask)bk(ek,'kal',0,0);
  if(up){ctx.save();ctx.translate(0,K.ud||0);ctx.rotate(p.torso*D);if(K.us)ctx.scale(K.us,K.us);kKol(K,K.omF,p.uF,p.rF,p.wF,true,fl,ek,1);ctx.restore()}      // uzak kol en arkada
  if(lo&&K.tek&&ek&&!mask){bk(ek,'dN',0,K.bel*0.5);bk(ek,'aN',0,K.bel*0.95);ek._b.dF=ek._b.dN;ek._b.aF=ek._b.aN}
  if(lo&&K.tek){ctx.save();if(K.us)ctx.scale(K.us,K.us);krp(R[K.p+'alt'],K.A.alt,fl);ctx.restore();if(mask==='alt')yaraCiz(e,0,-10,170)}      // kancacı: belden aşağısı tek parça (yürümez)
  else if(lo){
    kBacak(K,[K.kF[0],kfy],p.lF,p.kF,true,fl,mask?null:ek);
    krp(R[K.p+'kalca'],K.A.kalca,fl);
    kBacak(K,K.kN,p.lN,p.kN,false,fl,mask?null:ek);
    if(mask==='alt')yaraCiz(e,0,-10,170);
  }
  if(up){
    ctx.save();ctx.translate(0,K.ud||0);ctx.rotate(p.torso*D);if(K.us)ctx.scale(K.us,K.us);      // us: belden yukarısının ölçeği; ud: belden üstü aşağı kayma
    krp(R[K.p+'govde'],K.A.govde,fl);if(ek&&!mask)bk(ek,'boy',K.boyun[0],K.boyun[1]);if(ek&&K.sp)uc(ek,3,K.sp[0],K.sp[1]);      // kancacı: sırttaki zincir makarası
    if(mask==='ust')yaraCiz(e,0,0,170,true);
    ctx.save();ctx.translate(K.boyun[0]+(p.hb||0)*70,K.boyun[1]+(K.kd||0)+(p.hb||0)*28);ctx.rotate(p.bas*D);if(K.ks)ctx.scale(K.ks,K.ks);if(ek&&!mask){const hi=R[K.p+'kafa'];bk(ek,'kafa',hi.width/2-K.A.kafa[0],hi.height/2-K.A.kafa[1])}{const vy=e.vurT!=null&&S.t-e.vurT<0.6&&R[K.p+'vur'],ah=!vy&&e.dus&&(e.dusA||0)>0.5&&R[K.p+'ahh'];const ac=!vy&&!ah&&e.kac&&R[K.p+'aci'];krp(vy||ah||ac||R[K.p+'kafa'],vy?K.A.vur:ah?K.A.ahh:ac?(K.A.aci||K.A.vur):K.A.kafa,fl)};ctx.restore();
    kKol(K,K.omN,p.uN,p.rN,p.wN,false,fl,ek,0);      // yakın kol en önde
    ctx.restore();
  }
  ctx.restore();
}
const KH={kickLo:130,kick1:260,kick2:380,kick3:520,kick4:600,kickSl:470,kickBk:300,dizF:340,dizN:340,kickDA:[300,300],kickDB:[300,300],kickDC:[300,520],kickDD:[300,520],kickDE:[130,300],kickDF:[130,300],kickDG:[330,420],kickDH:[330,420],kickD6:[300,300,420,420,540,540],kickD6F:[300,300,420,420,540,540],kickFly:380,kickDive:230,dizJ:340,dizJF:340};
function kickH(ad,wi){let b=ad;if(/^kick(?!D)\w*[FN]$/.test(b))b=b.slice(0,-1);const h=KH[b];return Array.isArray(h)?h[Math.min(wi,h.length-1)]:(h||330)}   // tekmenin vurduğu yükseklik
function zEksen(){               // iki elle tutulan korsan: N eli boyunda, F eli kalçasında; gövde iki elin arasındaki eksene dizilir
  const N=EL.N,F=EL.F;let dx=N.wx-F.wx,dy=N.wy-F.wy;
  if(Math.hypot(dx,dy)<80){dx=(dx>=0?1:-1)*80;dy=0}
  const L=Math.hypot(dx,dy);return {ux:dx/L,uy:dy/L,phi:Math.atan2(dx,dy)};
}
function parcaCiz(){
  for(const p of S.parcalar){
    if(!p.at){
      if(izBul(p.el)&&S.t-p.t0<6){const h=EL[p.el];p.yan=h.wx<=EL[p.el==='N'?'F':'N'].wx?-1:1;p.x=h.wx+p.yan*70;p.y=h.wy;p.pt=S.t}      // parmak basılı: yarım ellerde kalır
      else{p.at=true;p.tT=S.t;const h=EL[p.el];p.vx=h.sv.x+S.vx+p.yan*250;p.vy=h.sv.y}     // parmak kalktı: yarım elin hızıyla bırakılır, yere düşer
    }else{
      const dt=Math.min(0.05,S.t-(p.pt||S.t));p.vy-=G*0.5*dt;p.x+=p.vx*dt;p.y+=p.vy*dt;
      if(p.y<=zemin(p.x)+161){const r0=p.rot+(p.phi||0),rh=Math.round((r0-Math.PI/2)/Math.PI)*Math.PI+Math.PI/2;p.rot+=(rh-r0)*Math.min(1,dt*10);p.yerT=p.yerT||S.t}else{p.rot+=p.yan*dt*6;p.yerT=0}      // yere değince yan yatar
      {const sp=Math.hypot(p.vx,p.vy);if(sp>900)for(const o of DUS){      // atılan yarım: adam atılmış gibi çarpar
        if(o.olu||o.tut||(p.vr||(p.vr=new Set())).has(o))continue;
        if(Math.hypot(p.x-o.x,p.y-(o.y+o.cy))<o.r*0.8+110){p.vr.add(o);const f=kisit((sp-1500)/3500,0,1),vx=p.vx,vy=p.vy;
          vur(o,10+25*f,vx,vy,f,p.y);bufCal(DEVS||DSS,1);p.vx*=-0.25;p.vy*=0.3;
          if(!o.olu&&!o.boss&&!o.tut){const yn=Math.sign(vx)||1;o.cy0=o.cy0||o.cy;if(o.dus)o.dus.son=Math.max(o.dus.son,S.t+DUS_DUS+1.8+DUS_KALK);else o.dus={t0:S.t,son:S.t+DUS_DUS+1.8+DUS_KALK,yn};o.vx=yn*700;o.vy=350}}}}
      if(p.y<zemin(p.x)+160){if(p.vy<-500){karBas(p.x,170,KMIN-6,true);tasSac(p.x,2,0.7);bufCal(DSS,0.8)}p.y=zemin(p.x)+160;p.vy=Math.abs(p.vy)*0.3;p.vx*=0.85}
      p.pt=S.t;
      if(!p.son&&p.yerT&&S.t-p.yerT>0.5&&Math.abs(p.vx)<60){p.son=true;parcaYap(p);continue}      // durdu: kalıcı ceset resmi olur, artık hesaplanmaz
    }
    if(p.son)continue;
    const sx=W/2+(p.x-S.x)*SC,sy=ZY()-(p.y-S.camY)*SC;
    ctx.save();ctx.translate(sx,sy);ctx.scale(SC,SC);ctx.filter='grayscale(1)';      // parçalanmış (ölü): siyah beyaz
    if(!p.at)p.phi=zEksen().phi;
    ctx.rotate((p.at?p.rot:0)+(p.phi||0));
    ctx.translate(0,p.kind==='ust'?(p.z.kc==='b'?270:198):-54);ciziKorsan(p.z,p.kind);
    ctx.restore();
  }
}
function dusmanCiz(){
  cesetCiz();
  parcaCiz();
  for(const e of DUS){
    const sx=W/2+(e.x-S.x)*SC, sy=ZY()-(e.y-S.camY)*SC, m=(e.r*2.2+150)*SC;
    if(sx<-m||sx>W+m){if(e.kh)kancaCiz(e,true);continue}                                   // ekran dışındaki düşman çizilmez
    const zc=e.kc==='h'&&!e.tut&&!e.iki;
    ctx.save();ctx.translate(sx,sy);ctx.scale(SC,SC);
    if(e.olu)ctx.filter='grayscale(1)';      // ölü düşman siyah beyaz (yere düşen canlıyla karışmasın)
    if(e.olu){if(e.olm||e.yerOl)ctx.globalAlpha=Math.max(0,1-(e.ol||0));else{ctx.globalAlpha=Math.max(0,1-e.ol/0.9);ctx.translate(0,-e.cy);ctx.rotate(e.rot);ctx.translate(0,e.cy)}
      if(e.olm){ctx.translate(0,-e.cy);ctx.rotate(e.olm.yn*(e.dusA||0)*Math.PI/2);ctx.translate(0,e.cy0)}}      // ölüm: dizden yüzüstü öne / oturduktan sırtüstü geri
    if(e.dus){ctx.translate(0,-e.cy);ctx.rotate(e.dus.yn*(e.dusA||0)*Math.PI/2);ctx.translate(0,e.cy0)}      // yere düşmüş: gövde ortası yere yakın, sırtüstü yatar
    if(e.tut){ctx.translate(0,-e.cy);ctx.rotate(Math.sin(e.anim*14)*0.12);ctx.translate(0,e.cy)}   // tutulunca çırpınır
    else if(e.zpk&&!e.olu){ctx.translate(0,-e.cy);ctx.rotate(Math.sin(e.anim*13)*0.05);ctx.translate(0,e.cy)}      // zıpkınlanınca hafif çırpınır
    if(e.iki){ctx.translate(0,-e.cy);ctx.rotate(e.phi||0);ctx.translate(0,e.cy)}   // iki elle tutulunca iki elin eksenine yatar (kafa N elinin tarafında)
    ciziKorsan(e);
    ctx.restore();
    if(zc){if(e.olu)ctx.filter='grayscale(1)';kancaCiz(e,false);kancaCiz(e,true);ctx.filter='none'}      // sırttan ele gelen zincir karakterin önünde
  }
}
// ---- Kalıcı cesetler: ölen düşman (ve yırtılan yarıları) yere yatıp durunca bir kez siyah beyaz resme çevrilir (CESET) ve silinir;
// sonra sadece ekrandayken tek drawImage ile çizilir (güncelleme, poz, filtre yok = yük yok). Önizlemede (DEMO) ceset kalmaz.
const CESET=[];
function cesetResim(ciz,cx,cy,x0,x1,y0,y1){      // ciz(): dünya birimiyle, (cx,cy) merkezli çizim (y aşağı); kutu merkeze göre x0..x1, y0..y1 (y yukarı +)
  const k=Math.min(SC*DPR,0.6),w=Math.ceil((x1-x0)*k),h=Math.ceil((y1-y0)*k);if(w<1||h<1)return null;
  const c=document.createElement('canvas');c.width=w;c.height=h;const x=c.getContext('2d'),es=ctx;
  ctx=x;try{x.setTransform(k,0,0,k,-x0*k,y1*k);ciz()}catch(h){CS_HATA=String(h&&h.message||h).slice(0,40)}finally{ctx=es}
  const q=8,pw=Math.ceil(w/q),ph=Math.ceil(h/q),pc=document.createElement('canvas');pc.width=pw;pc.height=ph;const px=pc.getContext('2d',{willReadFrequently:true});px.drawImage(c,0,0,pw,ph);      // sınır için sadece küçük bir kopya okunur (büyük resmi okumak takılma yapıyordu)
  let d;try{d=px.getImageData(0,0,pw,ph).data}catch(h){d=null;CS_HATA='gid '+String(h&&h.message||h).slice(0,30)}pc.width=pc.height=0;
  let a0=pw,b0=ph,a1=-1,b1=-1;
  if(!d){a0=1;b0=1;a1=pw-2;b1=ph-2}      // piksel okunamıyorsa (bazı telefon/uygulamalarda) kutunun tamamı kullanılır
  else for(let yy=0;yy<ph;yy++)for(let xx=0;xx<pw;xx++)if(d[(yy*pw+xx)*4+3]>0){if(xx<a0)a0=xx;if(xx>a1)a1=xx;if(yy<b0)b0=yy;if(yy>b1)b1=yy}
  if(a1<0){c.width=c.height=0;return null}
  const mx=Math.max(0,a0*q-q),my=Math.max(0,b0*q-q),Mx=Math.min(w-1,a1*q+2*q),My=Math.min(h-1,b1*q+2*q);
  const cw=Mx-mx+1,ch=My-my+1,o=document.createElement('canvas');o.width=cw;o.height=ch;const og=o.getContext('2d');og.filter='grayscale(1)';og.drawImage(c,mx,my,cw,ch,0,0,cw,ch);      // siyah beyaz + kırpma tek çizimde
  c.width=c.height=0;      // ara tuval hemen bırakılır
  const r={c:o,x:cx+x0+mx/k,y:cy+y1-my/k,w:cw/k,h:ch/k};
  if(window.createImageBitmap)createImageBitmap(o).then(bm=>{r.c=bm;o.width=o.height=0}).catch(()=>{});      // tuval yerine hafif resim (her ceset ayrı tuval kalınca telefon yavaşlıyordu)
  return r;
}
let CS_OK=0,CS_YOK=0,CS_HATA='';      // ceset resmi yapılabildi / yapılamadı (menüde sürümün yanında görünür)
function cesetEkle(r){if(!r){CS_YOK++;return false}CS_OK++;CESET.push(r);if(CESET.length>150)CESET.shift();return true}
function cesetKutu(e){      // ölü gövdenin kutusu: son çizimdeki vücut noktalarından (_b) + pay; yoksa geniş kutu
  const b=e._b;if(!b||S.t-b.t>1)return [-1300,1300,-250,950];
  let x0=1e9,x1=-1e9,y0=1e9,y1=-1e9;for(const k in b){const q=b[k];if(!q||q.x===undefined)continue;x0=Math.min(x0,q.x-e.x);x1=Math.max(x1,q.x-e.x);y0=Math.min(y0,q.y-e.y);y1=Math.max(y1,q.y-e.y)}
  if(x0>x1)return [-1300,1300,-250,950];
  return [Math.max(-1300,x0-260),Math.min(1300,x1+260),Math.max(-250,y0-200),Math.min(950,y1+260)];
}
function cesetYap(e){      // dusmanCiz'deki ölü çizimiyle aynı
  if(DEMO)return true;
  const c=Object.assign({},e);c.t=undefined;c.fl=0;
  return cesetEkle(cesetResim(()=>{
    if(c.olm){ctx.translate(0,-c.cy);ctx.rotate(c.olm.yn*(c.dusA||0)*Math.PI/2);ctx.translate(0,c.cy0)}
    if(c.dus){ctx.translate(0,-c.cy);ctx.rotate(c.dus.yn*(c.dusA||0)*Math.PI/2);ctx.translate(0,c.cy0)}
    ciziKorsan(c)},e.x,e.y,...cesetKutu(e)));
}
function parcaYap(p){      // parcaCiz'deki yarı çizimiyle aynı
  if(DEMO)return;
  const z=Object.assign({},p.z);
  cesetEkle(cesetResim(()=>{ctx.rotate(p.rot+(p.phi||0));ctx.translate(0,p.kind==='ust'?(p.z.kc==='b'?270:198):-54);ciziKorsan(z,p.kind)},p.x,p.y,-1000,1000,-550,650));
}
function cesetCiz(){for(const k of CESET){const sx=W/2+(k.x-S.x)*SC,w=k.w*SC;if(sx>W||sx+w<0)continue;ctx.drawImage(k.c,sx,ZY()-(k.y-S.camY)*SC,w,k.h*SC)}}
