'use strict';
// Liman çevresi: en arkada gökyüzü/deniz (gok, dongu.js arkaPlan), evler (derinlik katmanı), tahta iskele zemini (uç uca döşenir), en önde iskele kazıkları.
// Katmanlar: ev katmanı p=0.85 (uzak: yavaş kayar, küçük görünür), iskele + kazıklar p=1 (karakterlerle aynı). Kazıklar çift sıra: ön sıra karakterlerin önünde, arka sıra (küçük) iskelenin arkasında.
// Diğer nesneler (kasa, lamba, palmiye, fener…) netlik yetersiz olduğu için şimdilik kaldırıldı; daha net görseller gelince eklenecek. Ölçüler oyun birimi (Popeye boyu KARAKTER_BOY=1020).
const CVR={};
const EV_SET='yev';      // kullanılan ev seti: 'ev' = eski düz cepheler (ev0-7), 'yev' = yeni kulübeler (yev0-7); ikisi de repoda duruyor
const GOK_AD='gok2';      // en arka plan: 'gok2' = sadece gökyüzü (3:1), 'gok' = eski gökyüzü + deniz
const CV_OBJ_AD='ciftvaril capa kasalar halat yonlevha varil sandik harita fener baliklevha kasa'.split(' ');      // v0.386: ateş, saksı, baltalı kütük kaldırıldı
const CV_ADLAR=[GOK_AD,'sahil','kum','zemin','dag_yakin','deniz',...CV_OBJ_AD.map(a=>'o_'+a),'tahta','kazik','lamba0','lamba1',...[0,1,2,3,4,5,6,7].map(i=>EV_SET+i)];
for(const a of CV_ADLAR)yukle('cevre/'+a+'.webp',im=>CVR[a]=im);
const TAHTA_W=2400,TAHTA_AYAK=0.346;      // bir tahta şeridinin dünya eni; ayakların bastığı çizgi görselin üstünden bu oranda (yüzeyin ortası)
const TAHTA_ARKA=150;                     // tahta yüzeyinin arka kenarı: ayak çizgisinden bu kadar geride (evler buraya oturur)
const EV_P=0.75,EV_GERI=160,EV_YOK=[2];      // ev katmanı derinliği (v0.379: 0.85→0.75, daha uzak/küçük) ve tabanının iskele arka kenarından geride (yukarıda) kalışı (dünya birimi)
      // EV_YOK: rastgele dizilime girmeyen evler (yev2 sarı samanlı)
const EV_TAB={ev:{boy:[1511,1582,1189,1451,1142,1402,1432,1365],oran:[0.892,0.588,1.191,0.988,1.16,0.938,0.877,1.014]},      // evlerin dünya boyları (çizimdeki oranlar korunur) ve en/boy
  yev:{boy:[1293,1200,1325,1308,1240,1500,1405,1310],oran:[1.095,1.136,1.024,1.074,1.118,0.906,1.062,0.921]}};
const EV_BOY=EV_TAB[EV_SET].boy,EV_ORAN=EV_TAB[EV_SET].oran;
const KAZIK_BOY=976,KAZIK_ON=332,KAZIK_ARK=15,KAZIK_KUC=0.78,KAZIK_ARA=TAHTA_W;      // uzun kazık (v0.365): tepeleri eskisiyle aynı yerde (ön: ayak çizgisinin 156 altı, arka: 396 üstü), altları suya iner; KAZIK_ON/ARK = kazık ortası;      // iskele kazıkları (yolla aynı katman, aynı hız): ön kazığın ortası iskelenin ön kenarında (ayak çizgisinin 159 altı), arka kazık arka kenarda ve perspektifle küçük; aralık = bir tahta şeridi
const SAHIL_UST=70;      // sahilin üst kenarı ev tabanının bu kadar üstünde: yarı 3D evlerin alt köşelerindeki boşlukları kapatır (evler kumun önünde)
const SAHIL_W=2900,SAHIL_DILIM=28,SAHIL_P1=1.18;      // sahil (kum→ıslak kum→köpük→sığ su): dünya eni, yatay dilim sayısı, en alt dilimin kayma hızı (üst dilim EV_P)
const LAMBA_BOY=[1350,1330],LAMBA_GERI=100;      // sokak lambaları: dünya boyu; tabanı ayak çizgisinin bu kadar gerisinde (iskelenin arka yarısı, karakterlerin arkası)
let CV_EV=[],CV_LMB=[],CV_OBJ=[];
// Çevre objeleri (v0.376, yeni set, cevre/o_*.webp): ev katmanında, sadece evler arasındaki boşluklarda (evlere değmez, birbirine değmez, evin üstünde durmaz). Boy = dünya birimi (varil 294), oran = en/boy.
// dy: hafif öne çıkma (5–40: az perspektif; biraz büyür, aşağı iner).
const CV_OBJ_BOY={ates:210,ciftvaril:437,capa:499,kasalar:439,halat:270,yonlevha:378,saksi:455,varil:294,sandik:350,kutuk:460,harita:338,fener:461,baliklevha:424,kasa:286},CV_OBJ_ORAN={ates:1.667,ciftvaril:0.858,capa:0.753,kasalar:0.798,halat:1.323,yonlevha:0.641,saksi:0.828,varil:0.824,sandik:1.079,kutuk:0.862,harita:1.048,fener:0.721,baliklevha:0.77,kasa:0.952},CV_OBJ_K=1;
function cevreKur(t1,t2){      // tohumlu rastgele dizilim; ilk açılış sabit tohum, her yeniden başlamada (yeniOyun) yeni tohum
  CV_EV=[];CV_LMB=[];CV_OBJ=[];
  let tohum=t1;const r=()=>{tohum=(Math.imul(tohum,1103515245)+12345)>>>0;return (tohum>>>8)/16777216};
  // evler: 2-3'lü sokak kümeleri, aralarda boşluk (arkadaki deniz görünür); evler birbirine binmez. bosluk: kümeler arası evsiz aralıklar (objeler buraya)
  let lx=-900,son=-1,sag=null;const SON=(BOSS_X+3500)*EV_P,bosluk=[];
  while(lx<SON){
    if(sag!==null)bosluk.push([sag,lx]);
    const n=2+Math.floor(r()*2);
    for(let i=0;i<n;i++){let k;do k=Math.floor(r()*8);while(k===son||EV_YOK.includes(k));son=k;CV_EV.push({ad:EV_SET+k,x:lx,h:EV_BOY[k]});sag=lx+EV_BOY[k]*EV_ORAN[k];lx+=EV_BOY[k]*EV_ORAN[k]+20+r()*60}      // evler arası dar sokak aralığı
    lx+=700+r()*900;
  }
  for(let x=-400;x<BOSS_X+2500;x+=1800+r()*2000){if(V_KONUM.some(v=>Math.abs(v-x)<450))x+=600;CV_LMB.push({k:r()<0.5?0:1,x})}      // lambalar rastgele aralıklarla, varillerin üstüne gelmez
  {let tt=t2;const q=()=>{tt=(Math.imul(tt,1103515245)+12345)>>>0;return (tt>>>8)/16777216};      // objeler: ayrı tohum
    let son2='';
    for(const [a0,b0] of bosluk){let c=a0+90;const bit=b0-90;      // evlere her iki yandan 90 pay: değmez
      let ilk=true;
      for(;;){
        const dy=Math.round(5+q()*35),k=1+dy/300;
        const sig=CV_OBJ_AD.filter(n=>n!==son2&&CV_OBJ_BOY[n]*k*CV_OBJ_ORAN[n]<=bit-c);
        if(!sig.length||(!ilk&&q()<0.35))break;
        const ad=sig[Math.floor(q()*sig.length)],w=CV_OBJ_BOY[ad]*k*CV_OBJ_ORAN[ad];
        CV_OBJ.push({ad,x:c+w/2,dy});son2=ad;ilk=false;c+=w+120+q()*180}      // objeler birbirine değmez
    }
    CV_OBJ.sort((a,b)=>a.dy-b.dy)}      // arkadakiler önce
}
cevreKur(20261024,20261027);
function cvCiz(im,sx,taban,h){      // taban: ekranda alt kenar (px), h: ekranda boy (px)
  if(!im)return;const w=h*im.width/im.height;
  if(sx+w/2<-40||sx-w/2>W+40)return;
  ctx.drawImage(im,Math.round(sx-w/2),Math.round(taban-h),Math.round(w),Math.round(h));
}
function atesCiz(sx,taban,h,w,id){      // kamp ateşi alevi (v0.385): odunların üstünde sürekli yanan harlı alev; üst odunları örter, alt odunlar az görünür
  if(sx+w<-40||sx-w>W+40)return;
  const t=performance.now()/1000+id*3.7,by=taban-h*0.5,bw=w*0.72,fh=h*1.35;
  ctx.save();ctx.globalCompositeOperation='lighter';
  const g=ctx.createRadialGradient(sx,by-fh*0.3,0,sx,by-fh*0.3,fh*1.1);g.addColorStop(0,'rgba(255,150,40,'+(0.3+0.06*Math.sin(t*11))+')');g.addColorStop(1,'rgba(255,120,30,0)');
  ctx.fillStyle=g;ctx.fillRect(sx-fh*1.1,by-fh*1.4,fh*2.2,fh*2.2);
  ctx.globalCompositeOperation='source-over';
  const L=[['#c8321a',1,1],['#ff7a1a',0.8,0.82],['#ffc23a',0.58,0.62],['#fff2b0',0.32,0.36]];
  for(let l=0;l<L.length;l++){const c=L[l][0],ww=bw*L[l][1],kh=L[l][2],n=5,tw=ww/n*1.5;ctx.fillStyle=c;
    ctx.beginPath();ctx.ellipse(sx,by,ww/2,ww*0.1,0,0,Math.PI*2);ctx.fill();
    for(let i=0;i<n;i++){const u=(i+0.5)/n-0.5,x=sx+u*ww*0.85,env=1-Math.abs(u)*1.3,fl=0.75+0.25*Math.sin(t*9+i*2.1+l)+0.12*Math.sin(t*23+i*5.3),th=fh*kh*env*fl,sw=Math.sin(t*6+i*1.7+l*0.5)*ww*0.08;
      ctx.beginPath();ctx.moveTo(x-tw/2,by);ctx.quadraticCurveTo(x-tw*0.5,by-th*0.5,x+sw,by-th);ctx.quadraticCurveTo(x+tw*0.5,by-th*0.5,x+tw/2,by);ctx.closePath();ctx.fill()}}
  ctx.globalCompositeOperation='lighter';ctx.fillStyle='#ffb040';
  for(let j=0;j<6;j++){const p=(t*0.7+j/6)%1,x=sx+Math.sin(j*12.9+t*2)*bw*0.3*(1+p),y=by-fh*(0.4+p*1.1);ctx.globalAlpha=1-p;ctx.beginPath();ctx.arc(x,y,h*0.025*(1-p*0.5),0,Math.PI*2);ctx.fill()}
  ctx.restore();
}
function cevreArka(zeminY){      // arkaPlan'ın sonunda: kum, evler, arka kazıklar, tahta iskele (iskelenin altında en arkadaki gökyüzü/deniz görseli görünür)
  const gy=zeminY+S.camY*SC;      // dünya y=0 (ayak çizgisi) ekranda
  const T=CVR.tahta;if(!T)return;
  const tw=TAHTA_W*SC,th=tw*T.height/T.width,y0=gy-th*TAHTA_AYAK;
  {const gp=zeminY-(TAHTA_ARKA+EV_GERI)*SC,s=SC*EV_P;      // ev katmanı: daha uzakta, yavaş kayar
    dagCiz(zeminY);      // en arka katman: dağ (yavaş, dikeyde sabit); orta katman (zemin+evler+objeler) onu keser: dağın altı zeminin arkasında kalır
    if(CVR.kum&&CVR.deniz)kumDeniz(zeminY,s);      // kum (tek parça, ev hızı) + akan deniz
    else{const K=CVR.sahil;if(K){const r0=zeminY-TAHTA_ARKA*SC+6*s-SAHIL_UST*s;ctx.fillStyle='#2893c2';ctx.fillRect(0,r0,W,H-r0)}}
    for(const e of CV_EV){const im=CVR[e.ad];if(!im)continue;const w=e.h*im.width/im.height;cvCiz(im,W/2+(e.x+w/2-S.x*EV_P)*s,Math.round(gp+6*s)+3,e.h*s)}
    for(let i=0;i<CV_OBJ.length;i++){const o=CV_OBJ[i],im=CVR['o_'+o.ad];if(!im)continue;const k=1+o.dy/300,ox=W/2+(o.x-S.x*EV_P)*s,ty=Math.round(gp+(6+o.dy)*s)+3,oh=CV_OBJ_BOY[o.ad]*CV_OBJ_K*k*s;cvCiz(im,ox,ty,oh);if(o.ad==='ates')atesCiz(ox,ty,oh,oh*im.width/im.height,i)}}      // çevre objeleri: evlerin önünde
  {const a=Math.round(y0+th*0.55),b=Math.round(y0+th*1.35),g=ctx.createLinearGradient(0,a,0,b);g.addColorStop(0,'rgba(20,40,60,0.38)');g.addColorStop(1,'rgba(20,40,60,0)');ctx.fillStyle=g;ctx.fillRect(0,a,W,b-a)}      // iskelenin altında gölge
  kazikCiz(zeminY,false);      // arka kazıklar: alt yarısı iskele tahtasının arkasında kalır
  for(let x=((W/2-S.x*SC)%tw+tw)%tw-tw;x<W;x+=tw-1)ctx.drawImage(T,Math.floor(x),y0,Math.ceil(tw)+1,th);
  sicramaCiz(y0+th*0.97);      // tahtanın alt kenarına vuran su
  const ly=gy-LAMBA_GERI*SC;for(const l of CV_LMB)cvCiz(CVR['lamba'+l.k],W/2+(l.x-S.x)*SC,ly,LAMBA_BOY[l.k]*SC);      // sokak lambaları iskelenin üstünde
}
// Kum + deniz (v0.368): evlerin altından ekranın altına. Üstte kum (dünyada sabit, uç uca döşenir), altında deniz (en üstü kıyı köpüğü).
// İkisi de yatay dilimlerle perspektifli: üst dilim ev katmanı hızında (EV_P), alt dilimler giderek SAHIL_P1 hızına çıkar. Deniz kendi kendine akar:
// deniz kumdan bağımsız, dere gibi sürekli yavaşça sola akar (DZ_X); koşunca parallaksla daha hızlı kayar.
const ZEMIN_W=1700,DAG_P=0.35,DAG_BOY=3450,DAG_GERI=260;      // v0.389: dağ %25 daha küçük (4600→3450); tabanı iskele arka kenarından DAG_GERI geride (evlerin arkasında)
      // zemin dokusu dünya eni; yakın dağ: derinlik (evlerden uzak, yavaş kayar) ve dünya boyu
const KUM_ORAN=0.36,DZ_AKIS=70,DZ_KIYI=0.12,DZ_PER=60,DZ_HIZ=0.22;      // + ekrana doğru akış: kıyı payı, kayma (görsel px), devir (1/sn)      // bandın kum payı; deniz kendi kendine sola akar (dünya birimi/sn), koşunca parallaksla daha hızlı kayar
let DZ_X=0,DZ_T=-1;
const dagTaban=(zeminY,cy)=>zeminY-(TAHTA_ARKA+DAG_GERI)*SC+cy*SC*DAG_P;      // dağın alt kenarı (ekranda)
function dagCiz(zeminY){      // yakın dağ: evlerle orantılı, biraz uzakta (DAG_P); zeminin ÖNÜNDE çizilir (zemin dağın altına girer)
  const D=CVR.dag_yakin;if(!D)return;const s=SC*DAG_P,h=DAG_BOY*s,w=h*D.width/D.height;
  const taban=dagTaban(zeminY,0);      // arka plan dikeyde sabit (zıplayınca oynamaz)      // zemin bandının biraz altı: alt kenarı (taşlar) zeminle örtülür
  for(let x=((W/2-S.x*DAG_P*s)%w+w)%w-w;x<W;x+=w-1)ctx.drawImage(D,Math.floor(x),Math.round(taban-h),Math.ceil(w)+1,Math.round(h));
}
function kumDeniz(zeminY,s){
  const KM=CVR.kum,DZ=CVR.deniz;
  const r00=zeminY-TAHTA_ARKA*SC+6*s-SAHIL_UST*s,yh=Math.max(60,H-r00),N0=34,stp=yh/N0,nK0=Math.round(N0*KUM_ORAN);
  const ust=dagTaban(zeminY,0)-550*SC*DAG_P,ek=Math.max(0,Math.round((r00-ust)/stp));      // v0.391: zemin dağın eteğinden daha içeri taşsın (550), dağın profili kum ile pürüzlü buluşsun; ek dilim sayısı (deniz aynı yerde kalır)
  const N=N0+ek,nK=nK0+ek,r0=r00-ek*stp,yhZ=nK*stp,ekH=Math.max(1,ek-EV_GERI*SC/stp);      // ekH: ev tabanı satırı
  const pb=i=>i<ekH?DAG_P+(EV_P-DAG_P)*i/ekH:i<ek?EV_P:EV_P+(SAHIL_P1-EV_P)*(i-ek)/N0;      // derinlik: üst uç dağla aynı hızda (zıplayınca kopmaz), ev tabanında ev hızı, aşağı doğru iskeleye yaklaşır
  const yb=i=>r0+stp*i;      // dikeyde sabit
  if(DZ_T>=0)DZ_X+=Math.max(0,Math.min(0.1,S.t-DZ_T))*DZ_AKIS;DZ_T=S.t;      // dere gibi sürekli sola akış
  for(let i=0;i<N;i++){
    const kum=i<nK,im=kum?(CVR.zemin||KM):DZ,j=kum?i:i-nK,n=kum?nK:N-nK,p=pb(i+0.5);
    const dy=Math.floor(yb(i)),dh=Math.ceil(yb(i+1))-dy+1;if(dy>H||dy+dh<0)continue;
    const pm=(EV_P+SAHIL_P1)/2;
    const sh=im.height/n,sy0=sh*j,sw=kum?yhZ*im.width/im.height:yh*(1-KUM_ORAN)*im.width/im.height*p/pm;      // zemin: TEK görsel bandın boyuna büyütülür (dikeyde tekrar yok), yana uç uca; deniz: dilimli perspektif
    const ox=kum?((W/2-S.x*EV_P*SC*EV_P)%sw+sw)%sw-sw:((W/2-(S.x+DZ_X)*p*SC*p)%sw+sw)%sw-sw;      // zemin tüm dilimlerde aynı yatay kayma (ev hızı; basamak/kayma yok), deniz ayrıca akar
    const akar=!kum&&sy0>im.height*DZ_KIYI,fz=(S.t*DZ_HIZ)%1;      // açık su ayrıca ekrana doğru akar (kıyı köpüğü sabit)
    for(let x=ox;x<W;x+=sw-1){
      ctx.drawImage(im,0,sy0,im.width,sh,Math.floor(x),dy,Math.ceil(sw)+1,dh);
      if(akar)for(let k=0;k<2;k++){const f=(fz+k*0.5)%1,a=0.55*Math.sin(Math.PI*f),sy=Math.max(im.height*DZ_KIYI,sy0-f*DZ_PER);      // iki aşağı kayan saydam kopya (v0.368 hali), sola akışla birlikte
        ctx.globalAlpha=a;ctx.drawImage(im,0,sy,im.width,sh,Math.floor(x),dy,Math.ceil(sw)+1,dh)}
      ctx.globalAlpha=1}
  }
  {const ty=Math.floor(yb(0));ctx.fillStyle='rgba(38,26,12,0.85)';ctx.fillRect(0,ty,W,Math.max(2,Math.round(3*SC)))}      // zemin üst kenarı: çizgi (dağı keser)
  const alt=Math.floor(yb(N));if(alt<H){ctx.fillStyle='#2b9ac4';ctx.fillRect(0,alt,W,H-alt)}      // görselin altı: denizin en koyu rengi
}
// Su sıçraması: iskele tahtasının alt kenarına dalga vurur, damlacıklar saçılır (dünya koordinatı)
let SICRA=[],SICRA_T=0;
function sicramaCiz(yAlt){      // yAlt: tahtanın alt kenarı (ekran px)
  const dt=S.dtG||0.016;
  if(S.t>SICRA_T){SICRA_T=S.t+2.5+Math.random()*4;      // seyrek: dalga ekrandaki bir ön kazığa vurur
    const L=Math.ceil((S.x-W/2/SC)/KAZIK_ARA),R2=Math.floor((S.x+W/2/SC)/KAZIK_ARA);
    if(R2>=L){const wx=(L+Math.floor(Math.random()*(R2-L+1)))*KAZIK_ARA,wy=S.camY+(ZY()-(H-4))/SC,n=8+Math.random()*6|0;      // kazığın x ortası, ekranın altında su hizası (kazığın dibi görünmez)
      for(let i=0;i<n&&SICRA.length<120;i++)SICRA.push({x:wx+(Math.random()-0.5)*120,y:wy,vx:(Math.random()-0.5)*600,vy:700+Math.random()*900,r:4+Math.random()*6,t0:S.t,yy:wy})
      SICRA.push({x:wx,y:wy,kopuk:1,t0:S.t,r:90+Math.random()*50})}}
  ctx.save();
  for(let i=SICRA.length-1;i>=0;i--){const d=SICRA[i],sx=W/2+(d.x-S.x)*SC,sy=ZY()-(d.y-S.camY)*SC;
    if(d.kopuk){const u=(S.t-d.t0)/0.45;if(u>=1){SICRA.splice(i,1);continue}      // vuran dalganın köpük yayı
      ctx.globalAlpha=0.45*(1-u);ctx.strokeStyle='#f4fdff';ctx.lineWidth=Math.max(1.5,5*SC*(1-u)+1);ctx.beginPath();ctx.ellipse(sx,sy,d.r*SC*(0.5+u),d.r*SC*0.35*(0.4+u),0,Math.PI,2*Math.PI);ctx.stroke();continue}
    d.vy-=G*0.55*dt;d.x+=d.vx*dt;d.y+=d.vy*dt;
    if(d.y<d.yy-60){SICRA.splice(i,1);continue}
    const a=kisit(1-Math.max(0,d.yy-d.y)/60,0,1);ctx.globalAlpha=0.5*a;
    ctx.fillStyle='#d9f6ff';ctx.beginPath();ctx.ellipse(sx,sy,d.r*SC,d.r*SC*1.25,Math.atan2(-d.vy,d.vx)+Math.PI/2,0,Math.PI*2);ctx.fill();
    ctx.fillStyle='#ffffff';ctx.beginPath();ctx.arc(sx-d.r*SC*0.3,sy-d.r*SC*0.35,d.r*SC*0.35,0,Math.PI*2);ctx.fill()}
  ctx.restore();
}
function kazikCiz(zeminY,on){      // on: karakterlerin önündeki sıra (iskelenin ön kenarı), değilse arka sıra (arka kenar, iskele tahtasının arkasında kalır)
  const K=CVR.kazik;if(!K)return;
  const k=on?1:KAZIK_KUC,h=KAZIK_BOY*k*SC,w=h*K.width/K.height,orta=zeminY+S.camY*SC+(on?KAZIK_ON:-KAZIK_ARK)*SC;
  const ara=KAZIK_ARA*SC,ofs=W/2-S.x*SC;
  for(let x=((ofs%ara)+ara)%ara-ara;x<W+ara;x+=ara){if(x+w/2<0||x-w/2>W)continue;ctx.drawImage(K,Math.round(x-w/2),Math.round(orta-h/2),Math.round(w),Math.round(h))}
}
function cevreOn(zeminY){kazikCiz(zeminY,true)}      // karakterlerin önünde: ön kazık sırası
