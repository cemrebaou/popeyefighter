'use strict';
// Kar zemini, efektler (fx, patlama), kan
// ---- Kar zemini: sütun yükseklik dizisi (her 20 birim), basınca çöker, zamanla dolar; ezilince kar taneleri saçılır ----
const KX0=-1500,KS=20,KN=2500,KD=90,KMIN=26;      // KD: taze kar kalınlığı, KMIN: ezilmiş kar
const KAR=new Float32Array(KN).fill(KD);
let KLO=KN,KHI=-1;      // ezilmiş (dolmayı bekleyen) kar sütunlarının aralığı: her karede sadece burası güncellenir
S.karP=[];S.leke=[];
function karI(x){return kisit(Math.round((x-KX0)/KS),0,KN-1)}
function karBas(x,w,d,puf,dir){      // x civarındaki karı d kalınlığına ezer; puf: kenarlardan kar taneleri saçılır
  const a=karI(x-w/2),b=karI(x+w/2);let at=0;if(a<KLO)KLO=a;if(b>KHI)KHI=b;
  for(let i=a;i<=b;i++){const u=Math.abs((KX0+i*KS-x)/(w/2)),kenar=u<0.7?1:Math.max(0,1-(u-0.7)/0.3),hed=d+(KAR[i]-d)*(1-kenar);if(KAR[i]>hed){at+=KAR[i]-hed;KAR[i]=hed}}
  if(!puf||at<30)return;
  const n=Math.min(7,1+Math.floor(at/120));
  for(let j=0;j<n;j++){const sg=dir||(Math.random()<0.5?-1:1),px=x+sg*w*(0.3+Math.random()*0.3);karAt(px,zemin(px)+10,sg*(250+Math.random()*700),500+Math.random()*900)}
}
function karAt(x,y,vx,vy,tas){if(S.karP.length<90)S.karP.push({x,y,vx,vy,tas,im:Math.floor(Math.random()*(tas?4:3)),s:0.7+Math.random()*0.8,rot:Math.random()*6,vr:(Math.random()-0.5)*(tas?14:8)})}
function tasSac(x,n,g=1){const y=zemin(x)+10;for(let i=0;i<n;i++){const sg=Math.random()<0.5?-1:1;karAt(x+sg*Math.random()*80,y,sg*(200+Math.random()*600)*g,(700+Math.random()*900)*g,true)}for(let i=0;i<n+2;i++){const sg=Math.random()<0.5?-1:1;karAt(x+sg*Math.random()*90,y,sg*(250+Math.random()*700)*g,(500+Math.random()*900)*g)}}      // taş + kar saçılır
// ---- yer efektleri (görsel): ayağın dibinde kısa süre çıkar, büyüyerek fırlar ve söner ----
S.fxs=[];
function fxEkle(im,x,w,T,on,flip,vx){if(im&&S.fxs.length<24)S.fxs.push({im,x,y:zemin(x),w,T,on,flip,vx:vx||0,t0:S.t})}
function fxCiz(on){
  for(const f of S.fxs){if(f.on!==on)continue;const u=(S.t-f.t0)/f.T;if(u<0||u>=1)continue;
    const e=Math.min(1,u/0.22),gx=0.75+0.25*e,gy=0.35+0.65*e*(2-e),w=f.w*SC*gx,h=f.w*SC*f.im.height/f.im.width*gy;
    const sx=W/2+(f.x+f.vx*(S.t-f.t0)-S.x)*SC,sy=ZY()-(f.y-S.camY)*SC+6*SC;
    ctx.save();ctx.globalAlpha=u<0.5?1:1-(u-0.5)/0.5;ctx.translate(sx,sy);if(f.flip)ctx.scale(-1,1);ctx.drawImage(f.im,-w/2,-h,w,h);ctx.restore()}
}
function patlat(x,g){fxEkle(R.patla,x,380*g,0.42,true,Math.random()<0.5);tasSac(x,3,g)}      // yere çakılma: kısa patlama, sonra küçük kar ve taşlar
function karGuncelle(dt){
  {let lo=KN,hi=-1;for(let i=KLO;i<=KHI;i++)if(KAR[i]<KD){KAR[i]=Math.min(KD,KAR[i]+dt*3);if(KAR[i]<KD){if(i<lo)lo=i;hi=i}}KLO=lo;KHI=hi}      // izler zamanla yavaşça dolar (sadece ezilmiş aralık)
  if(S.yer&&!S.karYer){karBas(S.x,230,KMIN-4,false)}      // zıplamadan iniş: sadece iz, sıçrama yok
  S.karYer=S.yer;
  if(S.yer&&Math.abs(S.vx)<40)karBas(S.x,110,KMIN+4,false);      // dururken ayaklar karın içinde
  if(S.kay&&S.t<S.kay.t0+S.kay.T&&S.yer)karBas(S.x+S.yon*170,150,10,false,S.yon)      // kayma: sadece iz, sıçrama yok
  for(let i=S.karP.length-1;i>=0;i--){const p=S.karP[i];p.vy-=G*0.6*dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.rot+=p.vr*dt;
    if(p.vy<0&&p.y<=zemin(p.x)){if(!p.tas){const k=karI(p.x);KAR[k]=Math.min(KD+20,KAR[k]+3*p.s)}S.karP.splice(i,1)}}
  for(let i=S.fxs.length-1;i>=0;i--)if(S.t-S.fxs[i].t0>S.fxs[i].T)S.fxs.splice(i,1);
  for(let i=S.leke.length-1;i>=0;i--)if(S.t-S.leke[i].t0>25)S.leke.splice(i,1);
}
function karCiz(){      // karakterlerin önünde: karda kan lekeleri ve uçuşan kar taneleri
  const sy=y=>ZY()-(y-S.camY)*SC;
  for(const l of S.leke){const u=S.t-l.t0,sx=W/2+(l.x-S.x)*SC;if(sx<-100||sx>W+100)continue;
    ctx.globalAlpha=0.55*Math.min(1,(25-u)/6);ctx.fillStyle='#8e0d12';ctx.beginPath();ctx.ellipse(sx,sy(zemin(l.x))+3*SC,l.w*SC,l.w*0.22*SC,0,0,7);ctx.fill()}
  ctx.globalAlpha=1;
  for(const p of S.karP){const im=p.tas?TASI[p.im]:KARI[p.im],x=W/2+(p.x-S.x)*SC;if(!im||x<-60||x>W+60)continue;const w=(p.tas?40:44)*p.s*SC,h=w*im.height/im.width;
    donCiz(im,x,sy(p.y),p.rot,1,-w/2,-h/2,w,h)}
  tabanDon();
}
// ---- Kan efektleri: 3 fışkıran kan çizgisi, 4 büyük fışkırma, 5 kopuk yara, 6 damla (yere değen kan karda leke bırakır) ----
S.kan=[];
const KAN_A3=Math.atan2(-105,355),KAN_A6=Math.atan2(-1,1);      // görsellerdeki uç yönleri (3: sağ üst, 6: sağ üst)
function kanEkle(p){if(S.kan.length<260){p.t0=S.t;p.pc=!!S.pence;S.kan.push(p)}}      // pc: bıçak modunda çıkan kan (yerde 3 kat leke)
function kanDamla(x,y,vx,vy,s){kanEkle({k:6,x,y,vx,vy,s:s||1})}
function kanFiskir(x,y,yon,g){      // büyük fışkırma: 4 numaralı bulut + 3 numaralı çizgiler + damlalar; g = güç
  kanEkle({k:4,x,y,vx:yon*500*g,vy:350*g,s:0.8+0.5*g,r:(Math.random()-0.5)*0.6});
  const n=Math.round(4+5*g);
  for(let i=0;i<n;i++){const a=(Math.random()*1.3-0.15)*Math.PI/2,v=(1300+Math.random()*1500)*g;kanEkle({k:3,x,y,vx:yon*Math.cos(a)*v*(0.6+Math.random()*0.6),vy:Math.sin(a)*v+300,s:0.6+Math.random()*0.6})}
  for(let i=0;i<n;i++)kanDamla(x,y,yon*(300+Math.random()*1400)*g,(400+Math.random()*1500)*g,0.7+Math.random()*0.7);
}
function kanVurus(x,y,f,yon,yum){      // vuruşta az fışkırma (yumrukta biraz daha çok)
  const n=(yum?2+Math.round(3*f):1+Math.round(2*f))*(S.pence?2:1);      // bıçak modunda 2 kat
  for(let i=0;i<n;i++)kanDamla(x,y,yon*(300+Math.random()*900),300+Math.random()*1100,0.6+Math.random()*0.6);
  if(f>0.5)kanEkle({k:3,x,y,vx:yon*(1400+Math.random()*900),vy:500+Math.random()*700,s:0.6+0.4*f});
}
function yaraCiz(o,lx,ly,w,ters){      // ikiye ayrılan korsanın kesik yerinde kanlı yara; dünya konumu damlama için kaydedilir
  const im=KANI[5],h=w*im.height/im.width;
  ctx.save();ctx.translate(lx,ly);if(ters)ctx.scale(1,-1);ctx.globalAlpha*=0.95;ctx.drawImage(im,-w/2,-h*0.18,w,h);ctx.restore();
  if(!o)return;
  const m=ctx.getTransform(),px=(m.e+m.a*lx+m.c*ly)/DPR,py=(m.f+m.b*lx+m.d*ly)/DPR;
  if(o._yrT!==S.t){o._yr=[];o._yrT=S.t}
  o._yr.push({x:S.x+(px-W/2)/SC,y:S.camY+(ZY()-py)/SC,w});
}
function kanGuncelle(dt){
  for(const p of S.parcalar){const o=p.z;if(!o._yr||S.t-o._yrT>0.1)continue;for(const w of o._yr)if(Math.random()<dt*4.5)kanDamla(w.x+(Math.random()-0.5)*w.w*0.6,w.y-10,(Math.random()-0.5)*120,-60,0.45+Math.random()*0.45)}      // yaralar damlar
  for(let i=S.kan.length-1;i>=0;i--){
    const p=S.kan[i],u=S.t-p.t0;
    if(p.k===4){p.x+=p.vx*dt;p.y+=p.vy*dt;p.vx*=Math.pow(0.05,dt);p.vy*=Math.pow(0.05,dt);if(u>0.5)S.kan.splice(i,1);continue}
    p.vy-=G*(p.k===6?0.75:0.55)*dt;p.x+=p.vx*dt;p.y+=p.vy*dt;
    if(p.y<=zemin(p.x)&&p.vy<0){S.kan.splice(i,1);for(let j=0;j<(p.pc?3:1);j++)if(S.leke.length<150)S.leke.push({x:p.x+(j?(Math.random()-0.5)*90:0),w:(p.k===3?45:22)*p.s*(j?0.8:1),t0:S.t})}      // yere değdi: karda leke
    else if(u>3)S.kan.splice(i,1);
  }
}
function kanCiz(){
  for(const p of S.kan){
    const im=KANI[p.k],sx=W/2+(p.x-S.x)*SC,sy=ZY()-(p.y-S.camY)*SC,u=S.t-p.t0;
    if(sx<-300||sx>W+300)continue;
    let w,al=0.8,rot,sc=1;
    if(p.k===3){w=230*p.s;rot=Math.atan2(-p.vy,p.vx)-KAN_A3}
    else if(p.k===4){w=330*p.s;sc=0.6+u/0.45*0.6;al=0.9*(u<0.25?1:Math.max(0,1-(u-0.25)/0.2));rot=p.r}
    else{w=60*p.s;rot=Math.atan2(p.vy,-p.vx)-KAN_A6}      // damlanın sivri ucu düşüş yönünün tersine
    if(al<=0.01)continue;
    w*=sc*SC;const h=w*im.height/im.width;
    donCiz(im,sx,sy,rot,al,-w/2,-h/2,w,h);
  }
  tabanDon();
}
