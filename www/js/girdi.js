'use strict';
// Klavye, dokunmatik tuşlar, sensör (gyro), parmakla kol sürükleme
function tus(e,d){
  const k=e.key;
  if(k==='ArrowLeft'||k==='a'||k==='A')key.sol=d;
  else if(k==='ArrowRight'||k==='d'||k==='D')key.sag=d;
  else if(k==='ArrowUp'||k===' '||k==='w'||k==='W'||k==='z'||k==='Z'){ if(d&&!key.zipla)ziplaBas(); key.zipla=d; }
  else if(k==='ArrowDown'||k==='s'||k==='S')key.asagi=d;
  else if((k==='j'||k==='J')&&d&&!e.repeat){S.jEl=S.jEl==='N'?'F':'N';komboTap('y',S.jEl)}      // dokunmatikteki gibi yumruk (eller sırayla), kombo zinciri çalışır
  else if((k==='k'||k==='K')&&d&&!e.repeat){S.kEl=S.kEl==='N'?'F':'N';tekmeAt(S.kEl)}            // tekme
  else if('gGhHbBnNmM'.includes(k)&&k.length===1&&d&&!e.repeat)ozelTus(k.toLowerCase());
  else return;
  e.preventDefault();
}
addEventListener('keydown',e=>tus(e,true));addEventListener('keyup',e=>tus(e,false));
function dokunTus(id,fn){
  const el=document.getElementById(id);
  const bas=e=>{e.preventDefault();el.classList.add('bas');fn(true)};
  const birak=e=>{e.preventDefault();el.classList.remove('bas');fn(false)};
  el.addEventListener('pointerdown',bas);el.addEventListener('pointerup',birak);
  el.addEventListener('pointerleave',birak);el.addEventListener('pointercancel',birak);
}
dokunTus('asa',d=>key.asagi=d);
dokunTus('sol',d=>key.sol=d);dokunTus('sag',d=>key.sag=d);
dokunTus('zipla',d=>{if(d&&!key.zipla)ziplaBas();key.zipla=d});

// ---------- Sensör: telefonu direksiyon gibi tut ----------
// sağa/sola çevir = yürü (eğim ne kadar büyükse o kadar hızlı), direksiyonu hızla arkaya kır (ekran tavana) = zıpla (şiddet = zıplama gücü),
// ekranı kendine doğru yatır = çömel
const GYRO={egilKal:false,egilHazir:true,hazir:true,ak:false,steer:0,egil:false,zipBit:-9,u0z:0,kalT:0,oz:null,rate:0,sonT:0,sonZip:-9};
const ACI_OLU=3.5, ACI_TAM=20, ZIP_ESIK=2.2;
const asagiMi=()=>key.asagi||GYRO.egilKal||!!S.uzan;      // S.uzan: kol aşağıda, yere uzanma
const ziplaTut=()=>key.zipla||S.t<GYRO.zipBit;
function ekranAci(){const a=(screen.orientation&&typeof screen.orientation.angle==='number')?screen.orientation.angle:(window.orientation||0);return((a%360)+360)%360}
function gyroAx(){
  if(!GYRO.ak||performance.now()/1000-GYRO.sonT>0.5)return 0;
  const a=Math.abs(GYRO.steer);if(a<ACI_OLU)return 0;
  const r=a<8?0.12+0.33*(a-ACI_OLU)/(8-ACI_OLU):0.45+0.55*Math.min(1,(a-8)/(ACI_TAM-8));   // çok az eğim = rahat yürüyüş, ~20° = tam koşu
  return Math.sign(GYRO.steer)*Math.min(1,r);
}
function sensorOku(e){
  if(e.beta==null||e.gamma==null)return;
  const now=performance.now()/1000, b=e.beta*D, g=e.gamma*D;
  const ux=-Math.sin(g)*Math.cos(b), uy=Math.sin(b), uz=Math.cos(g)*Math.cos(b);   // "yukarı" vektörü cihaz eksenlerinde
  const a=ekranAci();let sr,su;                                                   // ekran düzlemine çevir
  if(a===90){sr=-uy;su=ux}else if(a===270){sr=uy;su=-ux}else if(a===180){sr=-ux;su=-uy}else{sr=ux;su=uy}
  if(Math.hypot(sr,su)>0.35){const ang=Math.max(-90,Math.min(90,Math.atan2(-sr,su)/D));GYRO.steer+=(ang-GYRO.steer)*0.4}
  else GYRO.steer*=0.8;
  if(now<GYRO.kalT){GYRO.u0z=uz;GYRO.oz=uz;GYRO.sonT=now;return}                 // dengeleme: tuttuğun duruş "nötr"
  const dz=uz-GYRO.u0z;
  if(dz<-0.35){if(GYRO.egilHazir){GYRO.egilKal=!GYRO.egilKal;GYRO.egilHazir=false}}   // ekranı kendine yatır: eğil / bir daha yatır: kalk
  else if(dz>-0.22)GYRO.egilHazir=true;
  if(GYRO.oz!==null&&GYRO.sonT>0){
    const dt=now-GYRO.sonT;
    if(dt>0.001){GYRO.rate+=((uz-GYRO.oz)/dt-GYRO.rate)*0.5}
  }
  GYRO.oz=uz;GYRO.sonT=now;
  const kosu=S.yer&&Math.abs(S.vx)>HIZ*0.4;                   // koşarken minik hareket bile yüksek zıplatır
  if(GYRO.rate<0.3||now-GYRO.sonZip>0.6)GYRO.hazir=true;     // bir hareket = bir zıplama (yürürken titreme kilitlemesin diye zaman aşımı var)
  const esik=S.yer?(kosu?0.8:1.0):0.7;
  if(GYRO.hazir&&GYRO.rate>esik&&now-GYRO.sonZip>0.2){
    const guc=Math.min(1.45,Math.max(S.yer?0.8:0.85,0.8+0.5*Math.min(1,(GYRO.rate-esik)/2.5))*(kosu?1.18:1));
    ziplaBas(guc);GYRO.zipBit=S.t+0.9;GYRO.sonZip=now;GYRO.hazir=false;
  }
}
const sensBtn=document.getElementById('sens'), yaz=t=>{sensBtn.textContent='🎮 SENSÖR: '+t};
async function sensorToggle(){
  if(GYRO.ak){GYRO.ak=false;GYRO.egilKal=false;GYRO.steer=0;document.body.classList.remove('sensor');removeEventListener('deviceorientation',sensorOku);yaz('KAPALI');return}
  try{
    if(window.DeviceOrientationEvent&&typeof DeviceOrientationEvent.requestPermission==='function'){
      if(await DeviceOrientationEvent.requestPermission()!=='granted'){yaz('İZİN YOK');return}
    }
  }catch(_){yaz('İZİN YOK');return}
  GYRO.steer=0;GYRO.rate=0;GYRO.sonT=0;GYRO.oz=null;GYRO.kalT=performance.now()/1000+1.5;GYRO.ak=true;document.body.classList.add('sensor');
  addEventListener('deviceorientation',sensorOku);
  yaz('HAZIRLAN… (nötr tut)');
  setTimeout(()=>{if(!GYRO.ak)return;yaz(GYRO.sonT?'AÇIK':'VERİ YOK')},1600);
}
sensBtn.addEventListener('click',sensorToggle);
const tamBtn=document.getElementById('tam');
tamBtn.addEventListener('click',async()=>{
  try{
    if(document.fullscreenElement){await document.exitFullscreen();if(screen.orientation&&screen.orientation.unlock)screen.orientation.unlock();return}
    await document.documentElement.requestFullscreen({navigationUI:'hide'});
    try{await screen.orientation.lock('landscape')}catch(_){}
  }catch(_){tamBtn.textContent='⛶ Desteklenmiyor';setTimeout(()=>tamBtn.textContent='⛶ Tam ekran',1800)}
});
document.getElementById('kapat').addEventListener('click',()=>{if(GYRO.ak)sensorToggle()});
document.getElementById('sifir').addEventListener('click',()=>{if(GYRO.ak){GYRO.kalT=performance.now()/1000+1;yaz('HAZIRLAN… (nötr tut)');setTimeout(()=>{if(GYRO.ak)yaz('AÇIK')},1100)}});

// ---------- Kol kontrolü: ekranda sürükle, kol o yöne vursun ----------
// sağ yarı = ön kol (N), sol yarı = arka kol (F). Sürükleme yönü = kolun yönü, mesafe = uzanma
const KOL={N:{ak:false,th:0,e:0,bit:-9},F:{ak:false,th:0,e:0,bit:-9}};
const izler=new Map(), SINIR=14, TAM=120, TUT=0.14;
const kolAktif=k=>k.ak||S.t-k.bit<TUT;
const kolVar=()=>kolAktif(KOL.N)||kolAktif(KOL.F);
const tutan=k=>DUS.some(e=>e.tut&&!e.olu&&(e.tut===k||e.iki));      // bu el bir düşmanı tutuyor mu (iki elle tutuşta ikisi de)
const ikiYakin=()=>{if(S.t-(S.yirtT||-9)<1)return true;if(!(KOL.N.ak&&KOL.F.ak))return false;for(const e of DUS){if(e.olu||e.tut||e.boss)continue;if(Math.hypot(EL.N.wx-e.x,EL.N.wy-(e.y+e.cy))<e.r+70&&Math.hypot(EL.F.wx-e.x,EL.F.wy-(e.y+e.cy))<e.r+70)return true}return false};
const izBul=t=>{for(const z of izler.values())if(z.t===t)return z;return null};
function izHiz(iz,pen){          // piksel/sn: son 'pen' saniyedeki yer değiştirme
  const h=iz.hist;if(h.length<2)return 0;
  const son=h[h.length-1];let a=h[0];for(const q of h){if(son.t-q.t<=pen){a=q;break}}
  const dt=son.t-a.t;return dt>0.02?Math.hypot(son.x-a.x,son.y-a.y)/dt:0;
}
function kayma(iz,pen){          // son 'pen' saniyede: yer değiştirme ve izlenen yol
  const h=iz.hist;if(h.length<2)return null;
  const son=h[h.length-1];let a=h[0];for(const q of h){if(son.t-q.t<=pen){a=q;break}}
  let yol=0,pr=a;for(const q of h){if(q.t<=a.t)continue;yol+=Math.hypot(q.x-pr.x,q.y-pr.y);pr=q}
  return {dx:son.x-a.x,dy:son.y-a.y,d:Math.hypot(son.x-a.x,son.y-a.y),yol};
}
function kolHesap(iz,x,y){
  let yn=iz.yon;
  if(tutan(iz.t)){                       // tutan kol: karakter dönünce kol sıçramaz, parmak hareketi ekranda aynı yöne çalışır
    yn=S.yon;if(iz.hy===undefined)iz.hy=yn;
    if(iz.hy!==yn){iz.x0=x+(x-iz.x0);iz.hy=yn}         // sabitleme noktası yansıtılır: kolun açısı aynı kalır, devamı parmağı izler
  }else iz.hy=undefined;
  const dx=(x-iz.x0)*yn, dy=y-iz.y0, L=Math.hypot(dx,dy), k=KOL[iz.t];
  if(DUS.some(e=>e.tut&&e.tut!==iz.t&&!e.iki)){k.e=0;return}       // diğer elle tutuyorsak: bu taraf kol hareketi/jest yapmaz, dokunuşlar tutulana vuruş olur
  if(L<SINIR){k.e=0;return}
  k.th=Math.atan2(dy,dx)/D;
  k.e=Math.min(1,(L-SINIR)/(TAM-SINIR));
  if(S.durum!=='oyun'||S.sarj>0||S.t-(S.yirtT||-9)<1)return;      // yırtmadan hemen sonra parmak hareketleri başka hareket tetiklemez
  const hz=izHiz(iz,0.12), asagiG=dy>0&&Math.abs(dx)<1.6*dy, asagi=dy>0&&Math.abs(dx)<0.8*dy, yukari=dy<0&&Math.abs(dx)<0.8*(-dy), ileri=dx>0&&Math.abs(dy)<0.7*dx;
  if(tutan(iz.t)){                                   // düşman tutuyorsak: hızlı aşağı = yere çak
    if(!iz.sup&&asagi&&k.e>=0.6&&hz>1400){iz.sup=true;suplex(iz.t)}
    return;
  }
  if(k.e<0.9||tutmaVar())return;
  const o2=izBul(iz.t==='N'?'F':'N');      // iki parmak öncelikli: diğer parmak da hareket ediyorsa tek parmak hareketleri yerine çift parmak hareketleri çalışır
  const ikili=!!(o2&&KOL[o2.t].ak&&(KOL[o2.t].e>0.25||izHiz(o2,0.2)>300));
  if(!iz.sho&&yukari&&hz>(S.pence?1000:1600)){iz.sho=true;if(S.ust)ustKalk();else if(S.pence)penceVur('u',iz.t);else shoryu(iz)}      // bıçak modunda yukarı çekme: aparkat gibi saplama; üstündeyken kalkar
  if(S.ust)return;
  if(S.pence&&!iz.atil&&hz>1000&&Math.abs(dy)>=0.7*Math.abs(dx)&&Math.abs(dx)>=0.8*Math.abs(dy)){iz.atil=true;yerdekineAtla();return}      // bıçak modunda çapraz kaydırma: yerdekinin üstüne sıçra
                               // çok hızlı yukarı = shoryuken
  else if(!iz.sla&&asagiG&&hz>1500&&!S.yer&&(!S.pend||S.pend.iz!==iz)){iz.sla=true;if(S.pend){S.pend.t=S.t;S.pend.ikinci=true}else S.pend={t:S.t+(o2&&KOL[o2.t].ak?0.28:0.15),iz,dx,dy}}   // havada hızlı aşağı: ikinci parmağı kısa süre bekle; ikinci parmak da aşağı çekerse hemen süper kahraman   // havada hızlı aşağı: ikinci parmağa kısa süre bak, sonra karar ver
  else if(!iz.atil&&Math.abs(dy)<0.7*Math.abs(dx)&&hz>1100){      // yatay hızlı sürükleme (her iki yön): karakter o yöne döner ve kayar
    const o=izBul(iz.t==='N'?'F':'N'), ko=o?kayma(o,0.2):null;
    if(ko&&Math.abs(ko.dx)>50&&ko.dx*dx<0)return;      // diğer parmak ters yöne gidiyor: birleştirme/açma hareketi, kayma değil
    const sup2=!!(o&&KOL[o.t].ak&&KOL[o.t].e>0.5&&Math.abs(Math.cos(KOL[o.t].th*D))>0.5&&Math.sign(Math.cos(KOL[o.t].th*D))===Math.sign(dx));
    if(ikili&&!sup2)return;                               // diğer parmak başka iş yapıyorsa tek parmak kayması tetiklenmez
    iz.atil=true;
    const dirW=Math.sign(x-iz.x0)||iz.yon;
    if(S.pence){dagAtla(dirW);return}      // bıçak modunda yatay kaydırma (ekranın her yerinde): bıçaklı uçma
    if(sup2){o.atil=true;supermenKay(dirW)}   // iki parmak: süpermen kayması (çelme kaymasının 2 katı)
    else ciftAtil(dirW);   // tek parmak: Sub-Zero kayması
  }
}
function daireKontrol(){         // iki parmakla bir daire = aduket hazır (tam dolu); sonrası parmaklar sadece yön verir, kalkınca top o yöne gider
  if(tutmaVar())return;      // bir şey tutuluyorsa (ya da iki elle tutmaya gidiyorsak) çift el hareketleri tetiklenmez
  if(S.durum!=='oyun')return;
  const a=izBul('N'),b=izBul('F');
  if(!a||!b)return;
  if(S.sarj>0){
    let mx=0,my=0,n=0;for(const iz of [a,b]){mx+=iz.lx-iz.x0;my+=iz.ly-iz.y0;n++}
    mx/=n;my/=n;
    const d=Math.sign(mx);
    if(Math.abs(mx)>40&&d!==S.yon){                                // kollar hangi yana çekilirse karakter oraya döner
      donDon(d);
      for(const iz of [a,b]){const k=KOL[iz.t];k.th=Math.atan2(iz.ly-iz.y0,(iz.lx-iz.x0)*iz.yon)/D}
    }
    const yo=Math.abs(mx)>40?d:S.yon,rf=(EL.N.wx*yo>=EL.F.wx*yo)?'N':'F',riz=rf==='N'?a:b;      // aduket: bakılan yöndeki el/parmak referans (sağa bakıyorsa sağdaki, sola bakıyorsa soldaki)
    S.sarjP={dx:riz.lx-riz.x0,dy:-(riz.ly-riz.y0),bx:EL[rf].wx,by:EL[rf].wy};   // atış yönü ve çıkış noktası o elden
    return;
  }
  const t=Math.min(Math.abs(a.turn),Math.abs(b.turn));
  if(t>1.6*Math.PI){
    a.turn=0;b.turn=0;
    if(S.en>=1&&!S.sman&&!S.yy&&!S.alk&&!(S.tats>0)){S.sarj=1;S.sarjP=null;}else S.noEn=S.t;
  }
}
// Tekme bölgesi: orta çizginin iki yanında, karakterin altındaki çatı biçimli alan (dışı ve üstü yumruk bölgesi). Sağ yarı = sağ bacak (N), sol yarı = sol bacak (F)
const kizler=new Map();
function tekmeBolgesi(x,y){
  const dx=Math.abs(x-W/2), gen=0.26*W;
  return dx<gen&&y>H*(0.57+0.155*dx/gen);
}
function tekmeAt(t){
  if(S.durum!=='oyun'||S.sarj>0||S.sman||S.yy||S.alk||S.tats>0||S.dkick||S.shoryu>0||S.donuyor||S.slam)return;
  if(S.atk&&S.kuyruk.length>=2)return;
  const te=DUS.find(z=>z.tut&&!z.olu);
  if(te){atkIstek('#'+((te.x-S.x)*S.yon<-20?'kickBk':'kick1')+(t==='N'?'':'F'));return}      // tutarken: tutulan düşmana tekme; arkadaysa at tekmesi (diz yok)
  komboTap('t',t);
}
cv.addEventListener('pointerdown',e=>{
  e.preventDefault();
  if(S.durum!=='oyun'){if(S.t>S.durumT+0.8)yeniOyun();return}
  const t=e.clientX<W/2?'F':'N';
  if(tekmeBolgesi(e.clientX,e.clientY)){try{cv.setPointerCapture(e.pointerId)}catch(_){}kizler.set(e.pointerId,{t,t0:performance.now(),x0:e.clientX,y0:e.clientY,maxd:0});return}
  if(KOL[t].ak)return;
  try{cv.setPointerCapture(e.pointerId)}catch(_){}
  izler.set(e.pointerId,{t,x0:e.clientX,y0:e.clientY,yon:S.yon,hist:[{t:performance.now()/1000,x:e.clientX,y:e.clientY}],lx:e.clientX,ly:e.clientY,pv:null,turn:0,sho:false,atil:false,sla:false,sup:false,t0:performance.now(),maxd:0,tm:DUS.some(e=>e.tut&&e.tut!==t&&!e.iki),joined:false});
  KOL[t].ak=true;KOL[t].e=0;
});
cv.addEventListener('pointermove',e=>{
  const kz=kizler.get(e.pointerId);if(kz){kz.maxd=Math.max(kz.maxd,Math.hypot(e.clientX-kz.x0,e.clientY-kz.y0));return}
  const iz=izler.get(e.pointerId);if(!iz)return;
  const now=performance.now()/1000;
  iz.hist.push({t:now,x:e.clientX,y:e.clientY});while(iz.hist.length>1&&now-iz.hist[0].t>0.5)iz.hist.shift();
  (iz.yol||(iz.yol=[{x:iz.x0,y:iz.y0}])).length<300&&iz.yol.push({x:e.clientX,y:e.clientY});      // tüm parmak yolu (dağ hareketi için)
  iz.maxd=Math.max(iz.maxd,Math.hypot(e.clientX-iz.x0,e.clientY-iz.y0));
  const vx=e.clientX-iz.lx,vy=e.clientY-iz.ly;
  if(Math.hypot(vx,vy)>6){                                   // dönme açısı biriktir: daire = sürekli aynı yöne dönüş
    if(iz.pv)iz.turn+=Math.atan2(iz.pv.x*vy-iz.pv.y*vx,iz.pv.x*vx+iz.pv.y*vy);
    iz.pv={x:vx,y:vy};iz.lx=e.clientX;iz.ly=e.clientY;
  }
  kolHesap(iz,e.clientX,e.clientY);
  daireKontrol();
});
const kolBit=e=>{
  const kz=kizler.get(e.pointerId);if(kz){kizler.delete(e.pointerId);if(e.type==='pointerup'&&kz.maxd<30&&performance.now()-kz.t0<400)tekmeAt(kz.t);return}
  const iz=izler.get(e.pointerId);if(!iz)return;izler.delete(e.pointerId);
  const tap=!iz.tm&&e.type==='pointerup'&&!DUS.some(z=>z.tut===iz.t)&&S.sarj<=0&&!iz.joined&&iz.maxd<22&&performance.now()-iz.t0<320&&!iz.sho&&!iz.atil&&!iz.sla&&!iz.sup;   // kısa dokunuş = kombo vuruşu
  if(iz.tm&&!iz.joined&&e.type==='pointerup'&&performance.now()-iz.t0<350)tutKombo(iz.t);      // bir elle tutmuşken diğer tarafa kısa bas/çek: parmak kalkınca boştaki kol tutulana vurur (basılı kalırsa ikinci el tutuşa katılır)
  tutBirak(iz.t);
  const k=KOL[iz.t];k.ak=false;k.bit=S.t;S.sonAtk=S.t;
  if(tap)komboTap('y',iz.t);
  if(S.sarj>0){const m=S.sarjP;S.sarjP=null;if(m)ates(m.dx,m.dy,1,m.bx,m.by);else S.sarj=0;for(const z of izler.values())z.turn=0}   // parmak kalkınca aduket kol yönüne gider
};
cv.addEventListener('pointerup',kolBit);cv.addEventListener('pointercancel',kolBit);
function kolUygula(o,k,u,r,gu,ga){
  const wr=a=>((a+540)%360)-180, eu=k.e, ef=Math.min(1,k.e*1.5);   // yumruk önde gider, üst kol arkadan gelir
  const U=gu+wr(k.th-90-gu)*eu, A=ga+wr(k.th-ga)*ef;
  o[u]=U;o[r]=A-U;
  return Math.cos(k.th*D)*k.e;
}
