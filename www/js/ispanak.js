'use strict';
// Ispanak: düşmandan %25 düşer; kol aşağı 0.5 sn tutulunca çömelip belden eğilir, el kutuya değerse alır, yer (+%10 can), boş kutuyu arkaya atar
let ISP=[],ISPS=null,YEMS=null,ISP_Y=[];      // ISP_Y: kutudan dökülen ıspanak yaprakları            // ISP: yerdeki/uçan kutular, ISPS: düşme sesi
const ISP_BOY=180;               // görselin (500 px kare) oyun birimi boyu; kutunun kendisi ~133 birim
const ISP_MRK=80;                // kutu tabanından ortasına
const ISP_AGIZ=[150,-350];        // ağızdan biraz yukarıda ve uzakta, el ileriden tutar        // gövde uzayında ağız önü (el buraya gelir)
const ISP_UST=[150,-390],ISP_ALT=[150,-390];      // gövde uzayında: dirsek V gibi katlı, el ağzın üstünde (üst) ve ağza inmiş (alt)
const ISP_OMUZ=45,ISP_DIRSEK=-20,ISP_BILEK0=-15;      // dökme pozuna ek: omuzdan saat yönü, dirsekten saat yönü tersi (derece)
const ISP_D0=0.25,ISP_D1=0.95,ISP_SALLA=14;      // hızlı 3 sallama (dökme) aralığı (yavaşlatılmış zaman), omuzdan sallama açısı
const ispDip=t=>t<ISP_D0||t>=ISP_D1?0:Math.pow(Math.abs(Math.sin((t-ISP_D0)/(ISP_D1-ISP_D0)*Math.PI*3)),0.6);      // 0 geride, 1 ağza doğru; 3 kez, sert
const ISP_YAVAS=1.25;            // yeme animasyonu toplam süre çarpanı (%25 uzun)
const ISP_G=4200;                // atılan / düşen kutunun yerçekimi
Object.assign(S,{uzT:{N:0,F:0},uzan:null,yeme:null});

function ispSes(x,yarim){
  if(!AC||AC.state!=='running'||!ISPS||DEMO)return;
  const g0=kisit(1-Math.abs(x-S.x)/7000,0.3,1),src=AC.createBufferSource(),g=AC.createGain();
  src.buffer=ISPS;g.gain.value=g0;src.connect(g);g.connect(SFXC());
  if(yarim){const d=ISPS.duration/2,n=AC.currentTime;g.gain.setValueAtTime(g0,n+d*0.75);g.gain.linearRampToValueAtTime(0,n+d);src.start(n,0,d)}      // sesin ilk yarısı
  else src.start();
}
function ispDus(x,y,p=0.25){            // düşman ölünce (%25) / varil kırılınca (%50): kutu havaya fırlar, yere düşer
  if(ISP.length>=12||Math.random()>=p*(YA('TOP')?2:1))return;      // Ispanak Cebi anti: 2 kat sık
  ISP.push({x,y,vx:(Math.random()-0.5)*600,vy:1100,rot:(Math.random()-0.5)*0.4,vr:(Math.random()-0.5)*4,d:'dus',bos:false,sek:0});
}
function ispAt(k){               // boş kutu arkaya atılır: ilk iniş ekranın içinde, ikinci sekişte ekrandan çıkar
  const h=EL[k],d=-S.yon,T=0.8,y0=h.wy-ISP_MRK,hx=S.x+d*0.55*(W/2)/SC;
  ISP.push({x:h.wx,y:y0,vx:(hx-h.wx)/T,vy:(zemin(hx)-y0+0.5*ISP_G*T*T)/T,rot:0,vr:d*11,d:'at',bos:true,sek:0,yn:d});
  const uK=k==='N'?'aNu':'aFu';if(P[uK]<-180)P[uK]+=360;      // kol arkadan aşağı iner (öne doğru tam tur atmaz)
}
function elIK(k,tx,ty){          // gövde uzayında el (yumruk ortası) hedefe: [üst kol, ön kol] açıları
  const sc=k==='N'?1.1:1,o=k==='N'?[-59,-149]:[28,-158],dx=(tx-o[0])/sc,dy=(ty-o[1])/sc;
  const L1=Math.hypot(11.35,123.6),L2=205,f1=Math.atan2(123.6,-11.35);
  const d=kisit(Math.hypot(dx,dy),L2-L1+1,L1+L2-1),ta=Math.atan2(dy,dx),al=Math.acos(kisit((L1*L1+d*d-L2*L2)/(2*L1*d),-1,1));
  let b=null;for(const sg of [1,-1]){const a=ta+sg*al,ex=L1*Math.cos(a),ey=L1*Math.sin(a);if(!b||ey>b.ey)b={a,ex,ey}}      // dirsek aşağıda kalan çözüm
  const wr=v=>((v+540)%360)-180,u=wr((b.a-f1)/D);
  return [u,wr(Math.atan2(dy-b.ey,dx-b.ex)/D-u)];
}
function ispPoz(o){              // hedefPoz sonunda: eğilme ve yeme animasyonu
  if(S.uzan&&S.yer){
    // yere uzanma: gövde normal eğilmedeki kadar eğik kalır (ekstra eğilme yok)
  }
  if(S.yeme){
    const m=S.yeme,t=(S.t-m.t0)/ISP_YAVAS,uK=m.k==='N'?'aNu':'aFu',rK=m.k==='N'?'aNr':'aFr';let a;
    if(t<ISP_D1){const d=ispDip(t);a=elIK(m.k,ISP_UST[0],ISP_UST[1]);a[0]+=ISP_OMUZ-ISP_SALLA*d;a[1]+=ISP_DIRSEK;o.bas=-6-8*d;o.torso=-2}      // alır almaz dirsekten katlayıp ağzın üstüne getirir, iki kez ağza indirip kaldırır
    else if(t<ISP_D1+0.35){a=[-170,-25];o.torso=4;o.bas=0}       // kutuyu kaldırır
    else if(t<ISP_D1+0.45){a=[-240,15];o.torso=-12;o.bas=-6}     // arkaya savurur
    else a=[4,60];
    o[uK]=a[0];o[rK]=a[1];
  }
}
const ISP_EL={N:['el_isp_n',27.44,78.77,123.0,-40.3],F:['el_isp_f_a',27.44,83.67,101.9,-40.5]};      // ıspanak tutan eller: görsel, bilek halkası, kutu ağzı (bilekten)
function ispElCiz(ad){           // kol() içinde bilekte: ıspanak alınca el, kutuyu tutan ele dönüşür (uzak elde yer kaydedilir, yüzün önünde sonra çizilir). true: el çizildi/çizilecek
  const m=S.yeme;if(!m||m.k!==ad||m.atildi)return false;
  if(ad==='F'&&!m.onCiz){m.tf=ctx.getTransform();return true}
  const d=ISP_EL[ad],im=R[d[0]];if(!im)return false;
  const t=(S.t-m.t0)/ISP_YAVAS,q=ctx.getTransform(),th=Math.atan2(q.b,q.d);
  const w=t>=ISP_D1||t<0.1?0:-0.25+ISP_BILEK0*D-0.15*ispDip(t);      // bilek az bükülür: sallama omuzdan
  ctx.save();ctx.rotate(w);resim(im,d[1],d[2]);
  m.agz=dunyaNok(d[3],d[4]);m.agzT=S.t;      // kutunun ağzı (yapraklar buradan dökülür)
  ctx.restore();return true;
}
function ispOnCiz(){              // arka eldeki kutu: yüzün önünde
  const m=S.yeme;if(!m||m.k!=='F'||m.atildi||!m.tf)return;
  ctx.save();ctx.setTransform(m.tf);m.onCiz=true;ispElCiz('F');m.onCiz=false;ctx.restore();m.tf=null;
}
function ispGuncelle(dt){
  if(!S.yeme&&!S.uzan&&S.yer&&S.durum==='oyun'&&!S.pence&&!S.atk&&S.sarj<=0){      // kol 0.5 sn'den uzun aşağı: eğil
    for(const k of ['N','F']){const K=KOL[k],ok=K.ak&&K.e>0.7&&Math.abs(K.th-90)<60&&!tutan(k)&&!varilElde(k);S.uzT[k]=ok?S.uzT[k]+dt:0;if(S.uzT[k]>0.5){S.uzan={k,B:0};break}}
  }else{S.uzT.N=S.uzT.F=0}
  if(S.uzan){
    const u=S.uzan;
    if(!KOL[u.k].ak||!S.yer||S.durum!=='oyun')S.uzan=null;      // parmak kalkınca doğrulur
    else{
      const h=EL[u.k],hy=h.wy-zemin(h.wx);
      if(hy>25)u.B=Math.min(85,u.B+dt*110);else if(hy<0)u.B=Math.max(0,u.B-dt*110);      // el yere değene kadar belden eğilir
      for(let i=0;i<ISP.length;i++){const c=ISP[i];if(c.d==='yer'&&Math.hypot(h.wx-c.x,h.wy-(c.y+ISP_MRK))<130){ISP.splice(i,1);S.yeme={k:u.k,t0:S.t,bos:false,atildi:false};S.uzan=null;break}}
    }
  }
  if(S.yeme){
    const m=S.yeme,t=(S.t-m.t0)/ISP_YAVAS;      // yerken belden aşağısı serbest: yürünebilir
    if(!m.ses&&t>=ISP_D0+0.15){m.ses=true;bufCal(YEMS,1)}      // yeme sesi: ağza dökmeye başlayınca
    if(!m.bos&&t>=ISP_D1-0.15){m.bos=true;const ik=YV('TOP')?2:1;S.hp=Math.min(HPMAX,S.hp+HPMAX*0.1*ik);S.en=Math.min(ENMAX,S.en+50*ik);S.ispEnT=S.t+10;S.pops.push({x:S.x,y:S.y+1050,t:0,txt:'+'+HPMAX*0.1*ik,f:0.3,mavi:1})}      // max canın %10'u, +50 enerji; Ispanak Cebi açıksa ikisi de 2 kat (yerden de cepten de)
    if(ispDip(t)>0.45&&m.agz&&S.t-m.agzT<0.2&&!DEMO){m.yb=(m.yb||0)+dt*ISP_Y_HIZ;while(m.yb>=1){m.yb--;ispYaprak(m)}}      // dökülen yapraklar
    if(!m.atildi&&t>=ISP_D1+0.45){m.atildi=true;ispAt(m.k)}
    if(t>=ISP_D1+1.0)S.yeme=null;
  }
  {const a=ispAgiz();for(let i=ISP_Y.length-1;i>=0;i--){const y=ISP_Y[i],k=(S.t-y.t0)/y.T;      // yapraklar: kutunun ağzından eğri bir yolla açık ağzın içine akar; yaklaştıkça kararıp küçülür, ağızda kaybolur
    if(k>=1){ISP_Y.splice(i,1);continue}
    const e=k*k*(3-2*k),mx=(y.x0+a[0])/2+y.ox,my=Math.max(y.y0,a[1])+y.oy;      // kutu ağzı → (yukarı kavisli orta nokta) → ağız
    y.x=(1-e)*(1-e)*y.x0+2*(1-e)*e*mx+e*e*a[0];y.y=(1-e)*(1-e)*y.y0+2*(1-e)*e*my+e*e*a[1];y.r+=y.vr*dt;y.k=k}}
  for(let i=ISP.length-1;i>=0;i--){
    const c=ISP[i];
    if(c.d==='yer')continue;
    c.vy-=(c.d==='at'?ISP_G:G)*dt;c.x+=c.vx*dt;c.y+=c.vy*dt;c.rot+=c.vr*dt;
    const z=zemin(c.x);if(c.y>z||c.vy>0)continue;
    c.y=z;
    if(c.d==='at'){
      if(c.sek===0){ispSes(c.x);c.sek=1;const T=0.65,ex=S.x+c.yn*((W/2)/SC+300);c.vx=(ex-c.x)/T;if(c.vx*c.yn<300)c.vx=c.yn*300;c.vy=0.5*ISP_G*T}      // ilk iniş: tam ses, ekran dışına seker
      else{ispSes(c.x,true);ISP.splice(i,1)}                // ikinci iniş: yarım ses, kutu silinir
    }else if(c.sek===0&&c.vy<-300){ispSes(c.x);c.sek=1;c.vy=-c.vy*0.28;c.vx*=0.4}      // ilk değişte ses + ufak sekme
    else{if(c.sek===0)ispSes(c.x);c.d='yer';c.vx=c.vy=0;c.w0=S.t;c.wa=kisit(Math.atan2(Math.sin(c.rot),Math.cos(c.rot)),-0.45,0.45)||(Math.random()<0.5?-0.3:0.3)}      // oturur, salınır
  }
}
const ISP_BILEK=1.1,ISP_EGIM=1.9,ISP_Y_HIZ=150;      // dökerken kutunun eğimi (radyan), saniyede dökülen yaprak
let ISP_KARA=null;
function ispAgiz(){if(OGV.agiz&&S.t-OGV.t<0.3)return OGV.agiz;const k=OGV.kafa,b=OGV.boyun;return (k&&b&&S.t-OGV.t<0.3)?[k[0]+(b[0]-k[0])*0.45+S.yon*50,k[1]+(b[1]-k[1])*0.45]:[S.x+S.yon*60,S.y+880]}      // ağız (dünya)
function ispYaprak(m){      // kutunun ağzından bir yaprak: ağzın içine akar
  if(ISP_Y.length>140)return;
  const x=m.agz[0]+(Math.random()-0.5)*30,y=m.agz[1]+(Math.random()-0.5)*20;
  ISP_Y.push({x0:x,y0:y,x,y,ox:(Math.random()-0.5)*40,oy:20+Math.random()*50,T:0.28+Math.random()*0.14,r:Math.random()*6.3,vr:(Math.random()-0.5)*10,t0:S.t,s:0.8+Math.random()*0.4,k:0});      // hepsi ağza gider, saçılmaz
}
function ispYaprakCiz(){      // karakterin önünde
  const im=R.yaprak;if(!im||!ISP_Y.length)return;
  if(!ISP_KARA||ISP_KARA.k!==im){const c=document.createElement('canvas');c.width=im.width;c.height=im.height;const x=c.getContext('2d');x.drawImage(im,0,0);x.globalCompositeOperation='source-in';x.fillStyle='#0d1408';x.fillRect(0,0,c.width,c.height);c.k=im;ISP_KARA=c}      // yaprağın kararmış hali (bir kez)
  for(const y of ISP_Y){const k=y.k||0,q=zEkr(y.x,y.y),sk=1-0.8*Math.pow(Math.max(0,(k-0.45)/0.55),1.3),w=46*y.s*SC*sk,h=w*im.height/im.width,kr=kisit((k-0.4)/0.5,0,1);      // ağza yaklaştıkça küçülür ve kararır
    ctx.save();ctx.translate(q[0],q[1]);ctx.rotate(y.r);ctx.drawImage(im,-w/2,-h/2,w,h);if(kr>0){ctx.globalAlpha=kr;ctx.drawImage(ISP_KARA,-w/2,-h/2,w,h)}ctx.restore()}
}
function ispCiz(){
  const zY=ZY(),s=ISP_BOY*SC;
  for(const c of ISP){
    const im=c.bos?R.ispB:R.isp;if(!im)continue;
    const sx=W/2+(c.x-S.x)*SC,sy=zY-(c.y-S.camY)*SC;
    if(sx<-s*2||sx>W+s*2)continue;
    ctx.save();ctx.translate(sx,sy);
    if(c.d==='yer'){const u=S.t-c.w0,r=u<1.2?c.wa*Math.exp(-5*u)*Math.cos(16*u):0;ctx.translate(r>0?s*0.3:-s*0.3,0);ctx.rotate(r);ctx.drawImage(im,(r>0?-0.8:-0.2)*s,-0.956*s,s,s)}      // altı üstüne oturma salınımı (alt köşesinde döner)
    else{ctx.translate(0,-0.445*s);ctx.rotate(c.rot);ctx.drawImage(im,-s/2,-0.511*s,s,s)}
    ctx.restore();
  }
}
