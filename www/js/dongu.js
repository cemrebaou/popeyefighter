'use strict';
// Arka plan, çizim, ana döngü
function arkaPlan(camX,zeminY){
  if(!GOK){GOK=ctx.createLinearGradient(0,0,0,zeminY);GOK.addColorStop(0,'#bfe3ee');GOK.addColorStop(1,'#f1ead2')}   // gökyüzü gradyanı bir kez oluşturulur
  ctx.fillStyle=GOK;ctx.fillRect(0,0,W,H);
  // en arka: gökyüzü + deniz görseli, ekran boyunu tam kaplar, uç uca döşenir (her ikinci kopya aynalanır: kenarlar dikişsiz), çok yavaş kayar
  {const G=CVR[GOK_AD];if(G){const th=H,tw=th*G.width/G.height,ofs=S.x*SC*0.06,i0=Math.floor(ofs/tw);
    for(let i=i0;(i-i0)*tw-((ofs%tw)+tw)%tw<W;i++){const x=Math.floor((i-i0)*tw-((ofs%tw)+tw)%tw);
      if(i&1){ctx.save();ctx.translate(x+Math.ceil(tw),0);ctx.scale(-1,1);ctx.drawImage(G,0,0,Math.ceil(tw)+1,th);ctx.restore()}else ctx.drawImage(G,x,0,Math.ceil(tw)+1,th)}}}
  cevreArka(zeminY);      // evler, tahta iskele, iskele nesneleri (cevre.js)
}
function ciz(){
  ctx.setTransform(DPR,0,0,DPR,0,0);
  const zeminY=ZY();
  S.shx=S.sars>0.3?(Math.random()-.5)*S.sars:0;S.shy=S.sars>0.3?(Math.random()-.5)*S.sars:0;
  ctx.translate(S.shx,S.shy);
  arkaPlan(S.x,zeminY);
  catlakCiz();
  varilCiz(false);      // yerdeki variller düşmanların arkasında
  dusmanCiz();
  antiCiz();      // yanan düşman ateşi, bumerang bıçak
  ispCiz();
  kanCiz();
  fxCiz(false);
  zpkCiz('F');      // arka koldaki zıpkının halatı karakterin arkasında
  VT=ctx.getTransform();
  ctx.save();
  ctx.translate(W/2,zeminY-(S.y-S.camY)*SC);
  ctx.scale(SC*S.yon,SC);
  if(S.pence){ctx.shadowColor='#ffb02e';ctx.shadowBlur=(14+5*Math.sin(S.t*9))*DPR}      // bıçak modu: kenarlarından enerji barı renginde parlar
  karakter();
  ctx.restore();
  zpkCiz('N');atesElCiz();      // (ıspanak yaprakları oyuncu.js'te, kutunun arkasında); yakan yumruğun alevi karakterin önünde
  varilCiz(true);
  fxCiz(true);
  karCiz();
  cevreOn(zeminY);
  efektCiz();
  ctx.setTransform(DPR,0,0,DPR,0,0);hud(S.dtG||0.016);
}

// ---------- Döngü ----------
let son=0;
function dongu(ms){
  if(ms===dongu.ms)return;dongu.ms=ms;      // aynı kare iki kez çağrılırsa (çift döngü) atlanır
  requestAnimationFrame(dongu);      // önce sonraki kare istenir: bir karede hata olsa bile oyun donmaz
  if(menuAcik||listeAcik||(agacAcik&&!DEMO)){son=ms;if(ZPK.N||ZPK.F||zizler.size)zpkTemizle(true);return}      // kombo listesi / ağaç açıkken oyun durur (ağaçta yetenek önizlemesi hariç)
  if(DEMO)demoAdim();
  let dt=Math.min(0.05,(ms-son)/1000||0.016);      // 20 FPS'e kadar gerçek zamanlı (yavaş telefonda ağır çekime girmez)
  son=ms;S.dtG=dt;
  if(S.dur>0){S.dur-=dt;dt*=0.08}
  S.sars*=Math.pow(0.002,dt);S.t+=dt;
  const gA=DEMO?0:gyroAx(),ax=S.ol?0:Math.max(-1,Math.min(1,(key.sag?1:0)-(key.sol?1:0)+gA)), yon=Math.abs(ax)>0.01?Math.sign(ax):0;
  const hed=ax*HIZ*(S.atk&&S.yer?0.35:1)*(S.yer&&asagiMi()?0.45:1)*antiHiz();
  const ivme=S.yer?((gA===0&&S.vx*hed>=0&&Math.abs(hed)>Math.abs(S.vx))?2800:9000):6000;      // tuşla koşu yavaş hızlanır (telefon eğimi aynı kalır)
  const asili=zpkAsili(),ucus=!S.yer&&S.t<(S.zpUcT||0);      // zıpkın: halata asılıyken eğim/tuşlar sallar; halatı bırakınca savrulma hızı korunur
  if(asili)S.vx+=ax*ZP_SALLA*0.7*dt;
  else if(yon){S.yon=yon;if(!(ucus&&S.vx*hed>0&&Math.abs(S.vx)>Math.abs(hed)))S.vx+=Math.sign(hed-S.vx)*Math.min(Math.abs(hed-S.vx),ivme*dt)}
  else{S.vx-=Math.sign(S.vx)*Math.min(Math.abs(S.vx),(S.yer?12000:ucus?300:2500)*dt)}
  if(S.sman){
    const m=S.sman,u=(S.t-m.t0)/m.T;
    if(u>=1){S.sman=null;S.spin=0}
    else{S.yon=m.dir;S.spin=Math.PI/2*(u<0.2?u/0.2:(u>0.8?(1-u)/0.2:1));S.vx=m.dir*3800*(u<0.85?1:(1-(u-0.85)/0.15))}
  }
  if(S.atk){const mv=HAREKET[S.atk.ad];if(mv&&mv.dash){const u=S.atk.t/mv.dur;if(u>=mv.dash[0]&&u<mv.dash[1])S.vx=S.yon*mv.dash[2]/((mv.dash[1]-mv.dash[0])*mv.dur)}}   // ileri atılan hareketler (uçan tekme vb.)
  if(S.yy){const m=S.yy,u=(S.t-m.t0)/m.T;S.vx=0;S.yon=m.dir;if(u>=1)S.yy=null;else if(!m.hit&&u>=0.3){m.hit=true;yerYumrukVur(m)}}
  if(S.alk){const m=S.alk,u=(S.t-m.t0)/m.T;if(u>=1)S.alk=null;else{if(u<0.4)S.vx*=0.8;if(!m.hit&&u>=0.4)alkisVur()}}
  antiGuncelle(dt);catlakGuncelle();kanGuncelle(dt);karGuncelle(dt);
  if(S.pence){S.en-=dt*7.5;if(S.en<=0){S.en=0;penceKapa()}else if(S.blok&&S.t-S.pence.t0>0.5)penceKapa()}      // pençe: enerji dolma hızının 3 katı hızla biter; guard alınca bıçaklar girer
  else S.en=Math.min(ENMAX,S.en+dt*2.5*(S.t<(S.ispEnT||0)?2:1));      // ıspanaktan sonra 10 sn 2 kat dolum
  if(S._rh!==undefined&&S.hp<S._rh-0.001){S.hasT=S.t;S.regB=6+2*Math.random()}      // son hasar zamanı
  if(S.durum==='oyun'&&S.hp>0&&S.hp<HPMAX&&((S.t-(S.hasT||-9)>=(S.regB||6)&&!antiDolumYok())||(S.blok&&YV('W'))))S.hp=Math.min(HPMAX,S.hp+HPMAX*0.01*(YV('X')?3:YV('O')?2:1)*dt);      // saniyede max canın %1'i; Can Dolumu %2 / %3; Kalkanlı Savunma: blokta vurulsa da hemen dolar
  ispCepCiz();zpkBtnCiz();      // hasardan 6-8 sn (rastgele) sonra iyileşir
  S._rh=S.hp;
  if(S.t<S.lungeT){const u=(S.t-S.lungeS)/Math.max(0.1,S.lungeT-S.lungeS);S.vx=S.lungeV*(1-u*u)}
  if(S.kayKilit&&S.t>=S.lungeT){      // kayma bitince: durur/yavaşlarsa ya da koşarak biraz yol alırsa yeni kayma açılır (koş-kay-koş-kay)
    const v=Math.abs(S.vx);if(v<=HIZ*1.02&&v>=HIZ*0.5)S.kayYol=(S.kayYol||0)+v*dt;
    if(v<HIZ*0.5||(S.kayYol||0)>=KAY_YOL){S.kayKilit=false;S.kayYol=0}}
  if(S.dkick)S.vx=S.dkick.vx;
  if(S.ust)ustGuncelle();
  if(S.dag)dagGuncelle(dt);
  if(S.sup&&S.t<S.sup.t0+S.sup.T)S.vx=0;      // kayarak yumruk: kısa süre öne atılır
  ispGuncelle(dt);varilGuncelle(dt);
  {const nx=S.x+S.vx*dt;                                        // yüksek basamak/kutu duvar gibidir: üstüne zıplamak gerekir
    if(zemin(nx)>S.y+(S.yer?75:30)){S.vx=0;S.lungeT=-1}else S.x=nx}
  atkGuncelle(dt);
  const zH=zemin(S.x);
  if(S.yer){
    if(zH<S.y-70){S.yer=false;S.vy=0}                      // yüksek basamaktan düşme
    else{S.y+=(zH-S.y)*(1-Math.exp(-dt*(zH>S.y?28:22)));if(Math.abs(S.y-zH)<0.4)S.y=zH}
  }
  if(!S.yer){
    S.vy+=G*dt;S.y-=S.vy*dt;
    if(S.tats>0){const u=S.t-S.tats;if(u>0.8){S.tats=0;S.spin=0}else{S.vy=-250;S.spin+=dt*Math.PI*2*2/0.8}}   // kasırga: havada asılı döner
    if(S.donuyor){S.spin+=dt*Math.PI*2/ROLL_SURE;if(S.spin>=Math.PI*2){S.spin=0;S.donuyor=false}}
    if(S.y<=zH&&(S.vy>=0||S.y<zH-1)){S.y=zH;S.vy=0;S.yer=true;if(WDS)bufCal(WDS,0.9);else torbaCal(INS,INSBAG,0.9);if(!S.slam&&!S.dkick)antiInis(zH);S.donuyor=false;S.spin=0;S.shoryu=0;S.tats=0;
      if(S.slam){S.slam=false;zeminVur(1.15,50*PK());S.sup={t0:S.t,T:0.6};karBas(S.x,300,KMIN-6,false);S.karYer=true}      // iki ayak yere: iki patlama
      if(S.dkick){const t0=S.dkick.t0;S.dkick=null;zeminVur(0.5,0,t0);karBas(S.x,230,KMIN-4,false);S.karYer=true}}      // tek ayak: bir patlama
  }
  const z0=zemin(S.x),zJ=1-0.2*kisit((S.y-z0-500)/1100,0,1);      // yükseğe çıkınca (500 üstü) kamera geri çekilir: en çok %20 daha uzak (1600'de)
  {const hz=(ZPK.ac&&!DEMO?ZOOM_ZPK:ZOOM)*zJ;if(Math.abs(hz-ZM)>1e-4){ZM+=(hz-ZM)*(1-Math.exp(-dt*4));if(Math.abs(hz-ZM)<1e-3)ZM=hz;SC=SC0*ZM;GOK=null}}      // zıpkın modunda %50 uzak (alttan açmaz, üste açar)
  zpkGuncelle(dt);      // zıpkın: uçuş, saplanma, halat kısıtı
  {const hd=Math.max(Math.min(S.y,z0),S.y+KARAKTER_BOY-(ZY()-H*0.1)/SC);S.camY+=(hd-S.camY)*(1-Math.exp(-dt*5))}      // ölü bölge: kamera yerde kalır, sadece kafa ekranın üst %10'una girince yukarı takip eder
  if(S.yer&&Math.abs(S.vx)>40)S.faz+=dt*Math.abs(S.vx)/HIZ*2*Math.PI*1.05*(1+0.45*kisit((Math.abs(S.vx)/HIZ-0.55)/0.35,0,1));
  {const k=Math.floor(S.faz/Math.PI);if(S.adk!==undefined&&k!==S.adk&&S.yer){adimCal(S.x);karBas(S.x+S.yon*(k%2?70:10),85,KMIN,false)}S.adk=k}      // her adım karda iz bırakır
  olumGuncelle(dt);pozGuncelle(dt);
  if(S.dag&&R.blade){      // blade: bıçak atlama uçuşu sırasında oyuncunun önünde iki bıçak görseli
    const bsx=W/2+(S.x-S.x)*SC,bsy=ZY()-(S.y+200-S.camY)*SC;      // oyuncunun ön-alt tarafında
    const bw=R.blade.width*SC*0.6,bh=R.blade.height*SC*0.6;
    ctx.save();ctx.translate(bsx,bsy);ctx.scale(S.dag.dir,1);ctx.globalAlpha=0.85;ctx.drawImage(R.blade,-bw/2,-bh/2,bw,bh);ctx.restore();
  }
  ciz();
  elHiz(dt);vurusKontrol();grabKontrol(dt);ikiElKontrol(dt);elDurum(dt);mermiGuncelle(dt);emerGuncelle(dt);dusmanGuncelle(dt);carpisma();blokGuncelle(dt);zitKontrol();ciftKontrol();yereKontrol();alkisKontrol();inisGuncelle();oyuncuHasar();
}
dusmanKur();      // ilk düşmanlar (tüm dosyalar yüklendikten sonra)
