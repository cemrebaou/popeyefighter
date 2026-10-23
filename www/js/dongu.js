'use strict';
// Arka plan, çizim, ana döngü
function arkaPlan(camX,zeminY){
  if(!GOK){GOK=ctx.createLinearGradient(0,0,0,zeminY);GOK.addColorStop(0,'#bfe3ee');GOK.addColorStop(1,'#f1ead2')}   // gökyüzü gradyanı bir kez oluşturulur
  ctx.fillStyle=GOK;ctx.fillRect(0,0,W,H);
  // uzak dağlar: yatay döşenir, kamerayla 0.2 hızında kayar
  {const Dg=R.dag,th=H*0.30,tw=th*Dg.width/Dg.height,y=zeminY-H*0.06-th;
   for(let x=((-camX*0.2)%tw+tw)%tw-tw;x<W;x+=tw)ctx.drawImage(Dg,Math.floor(x),y,Math.ceil(tw)+1,th)}
  // arka plan ağaçları: sabit rastgele dizilim; düşmana yakın yerlerde yapraksız (3,5,7) çoğalır, uzakta yapraklılar (0,1,2,4,6) çıkar
  {const AR=230,par=camX*0.6,i0=Math.floor((par-400)/AR),i1=Math.ceil((par+W+400)/AR),YP=[0,1,2,4,6],YS=[3,5,7];
   for(let i=i0;i<=i1;i++){
     const h=Math.imul(i^0x9e3779b9,2654435761)>>>0;if((h>>>9)%5===0)continue;
     const bx=i*AR+(((h>>>20)&255)/255-0.5)*120,wx=bx/0.6;let d=1e9;for(const p of ENPOS){const q=Math.abs(p-wx);if(q<d)d=q}
     const pb=kisit(1.05-d/2600,0.04,0.9),yaps=((h>>>13)&1023)/1023<pb,k=yaps?YS[(h>>>4)%3]:YP[(h>>>4)%5],im=AGAC[k];
     const hh=H*(yaps?0.25:0.27)*(0.85+((h>>>12)&255)/255*0.3),ww=hh*im.width/im.height;
     ctx.drawImage(im,bx-par-ww/2,zeminY-hh+H*0.012,ww,hh)}}
  {      // yol: aynı şerit peş peşe, altında başka zemin yok
    const Y=R.yol,tw=2400*SC,th=tw*Y.height/Y.width,y0=zeminY-(0-S.camY)*SC-th*0.35;
    for(let x=((W/2-camX*SC)%tw+tw)%tw-tw;x<W;x+=tw)ctx.drawImage(Y,Math.floor(x),y0,Math.ceil(tw)+1,th);
  }
}
function ciz(){
  ctx.setTransform(DPR,0,0,DPR,0,0);
  const zeminY=H*0.80;
  S.shx=S.sars>0.3?(Math.random()-.5)*S.sars:0;S.shy=S.sars>0.3?(Math.random()-.5)*S.sars:0;
  ctx.translate(S.shx,S.shy);
  arkaPlan(S.x,zeminY);
  catlakCiz();
  dusmanCiz();
  ispCiz();
  varilCiz(false);
  kanCiz();
  fxCiz(false);
  VT=ctx.getTransform();
  ctx.save();
  ctx.translate(W/2,zeminY-(S.y-S.camY)*SC);
  ctx.scale(SC*S.yon,SC);
  if(S.pence){ctx.shadowColor='#ffb02e';ctx.shadowBlur=(14+5*Math.sin(S.t*9))*DPR}      // bıçak modu: kenarlarından enerji barı renginde parlar
  karakter();
  ctx.restore();
  varilCiz(true);
  fxCiz(true);
  karCiz();
  efektCiz();
  ctx.setTransform(DPR,0,0,DPR,0,0);hud(S.dtG||0.016);
}

// ---------- Döngü ----------
let son=0;
function dongu(ms){
  requestAnimationFrame(dongu);      // önce sonraki kare istenir: bir karede hata olsa bile oyun donmaz
  if(listeAcik||(agacAcik&&!DEMO)){son=ms;return}      // kombo listesi / ağaç açıkken oyun durur (ağaçta yetenek önizlemesi hariç)
  if(DEMO)demoAdim();
  let dt=Math.min(0.05,(ms-son)/1000||0.016);      // 20 FPS'e kadar gerçek zamanlı (yavaş telefonda ağır çekime girmez)
  son=ms;S.dtG=dt;
  if(S.dur>0){S.dur-=dt;dt*=0.08}
  S.sars*=Math.pow(0.002,dt);S.t+=dt;
  const gA=DEMO?0:gyroAx(),ax=Math.max(-1,Math.min(1,(key.sag?1:0)-(key.sol?1:0)+gA)), yon=Math.abs(ax)>0.01?Math.sign(ax):0;
  const hed=ax*HIZ*(S.atk&&S.yer?0.35:1)*(S.yer&&asagiMi()?0.45:1);
  const ivme=S.yer?((gA===0&&S.vx*hed>=0&&Math.abs(hed)>Math.abs(S.vx))?2800:9000):6000;      // tuşla koşu yavaş hızlanır (telefon eğimi aynı kalır)
  if(yon){S.yon=yon;S.vx+=Math.sign(hed-S.vx)*Math.min(Math.abs(hed-S.vx),ivme*dt)}
  else{S.vx-=Math.sign(S.vx)*Math.min(Math.abs(S.vx),(S.yer?12000:2500)*dt)}
  if(S.sman){
    const m=S.sman,u=(S.t-m.t0)/m.T;
    if(u>=1){S.sman=null;S.spin=0}
    else{S.yon=m.dir;S.spin=Math.PI/2*(u<0.2?u/0.2:(u>0.8?(1-u)/0.2:1));S.vx=m.dir*3800*(u<0.85?1:(1-(u-0.85)/0.15))}
  }
  if(S.atk){const mv=HAREKET[S.atk.ad];if(mv&&mv.dash){const u=S.atk.t/mv.dur;if(u>=mv.dash[0]&&u<mv.dash[1])S.vx=S.yon*mv.dash[2]/((mv.dash[1]-mv.dash[0])*mv.dur)}}   // ileri atılan hareketler (uçan tekme vb.)
  if(S.yy){const m=S.yy,u=(S.t-m.t0)/m.T;S.vx=0;S.yon=m.dir;if(u>=1)S.yy=null;else if(!m.hit&&u>=0.3){m.hit=true;yerYumrukVur(m)}}
  if(S.alk){const m=S.alk,u=(S.t-m.t0)/m.T;if(u>=1)S.alk=null;else{if(u<0.4)S.vx*=0.8;if(!m.hit&&u>=0.4)alkisVur()}}
  catlakGuncelle();kanGuncelle(dt);karGuncelle(dt);
  if(S.pence){S.en-=dt*7.5;if(S.en<=0){S.en=0;penceKapa()}else if(S.blok&&S.t-S.pence.t0>0.5)penceKapa()}      // pençe: enerji dolma hızının 3 katı hızla biter; guard alınca bıçaklar girer
  else S.en=Math.min(250,S.en+dt*2.5*(S.t<(S.ispEnT||0)?2:1));      // ıspanaktan sonra 10 sn 2 kat dolum
  if(S._rh!==undefined&&S.hp<S._rh-0.001){S.hasT=S.t;S.regB=6+2*Math.random()}      // son hasar zamanı
  if(S.durum==='oyun'&&S.hp>0&&S.hp<HPMAX&&(S.t-(S.hasT||-9)>=(S.regB||6)||(S.blok&&YV('W'))))S.hp=Math.min(HPMAX,S.hp+HPMAX*0.025*(YV('X')?3:YV('O')?2:1)*dt);      // Can Dolumu x2/x3; Kalkanlı Savunma: blokta vurulsa da hemen dolar
  ispCepCiz();      // hasardan 6-8 sn (rastgele) sonra iyileşir
  S._rh=S.hp;
  if(S.t<S.lungeT){const u=(S.t-S.lungeS)/Math.max(0.1,S.lungeT-S.lungeS);S.vx=S.lungeV*(1-u*u)}
  if(S.kayKilit&&S.t>=S.lungeT&&Math.abs(S.vx)<HIZ*0.5)S.kayKilit=false;      // kayma bitip hız eşiğin altına inince yeni kayma açılır
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
    if(S.y<=zH&&(S.vy>=0||S.y<zH-1)){S.y=zH;S.vy=0;S.yer=true;torbaCal(INS,INSBAG,0.9);S.donuyor=false;S.spin=0;S.shoryu=0;S.tats=0;
      if(S.slam){S.slam=false;zeminVur(1.15,50*PK());S.sup={t0:S.t,T:0.6};patlat(S.x-70,1);patlat(S.x+100,1);karBas(S.x,300,KMIN-6,false);S.karYer=true}      // iki ayak yere: iki patlama
      if(S.dkick){S.dkick=null;zeminVur(0.5);patlat(S.x+S.yon*120,0.8);karBas(S.x,230,KMIN-4,false);S.karYer=true}}      // tek ayak: bir patlama
  }
  S.camY+=(S.y-S.camY)*(1-Math.exp(-dt*5));
  if(S.yer&&Math.abs(S.vx)>40)S.faz+=dt*Math.abs(S.vx)/HIZ*2*Math.PI*1.05*(1+0.45*kisit((Math.abs(S.vx)/HIZ-0.55)/0.35,0,1));
  {const k=Math.floor(S.faz/Math.PI);if(S.adk!==undefined&&k!==S.adk&&S.yer){adimCal(S.x);karBas(S.x+S.yon*(k%2?70:10),85,KMIN,Math.abs(S.vx)>HIZ*0.6,-S.yon)}S.adk=k}      // her adım karda iz bırakır
  pozGuncelle(dt);
  ciz();
  elHiz(dt);vurusKontrol();grabKontrol(dt);ikiElKontrol(dt);elDurum(dt);mermiGuncelle(dt);emerGuncelle(dt);dusmanGuncelle(dt);carpisma();blokGuncelle(dt);zitKontrol();ciftKontrol();yereKontrol();alkisKontrol();inisGuncelle();oyuncuHasar();
}
dusmanKur();      // ilk düşmanlar (tüm dosyalar yüklendikten sonra)
