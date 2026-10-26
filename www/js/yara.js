'use strict';
// Yaralar: can azaldıkça oyuncunun gövdesine, kollarına ve pantolonuna rastgele yara görselleri (www/yara/yN.webp) "boya gibi" basılır.
// Her yeni oyunda yaralar rastgele yerleştirilir: üst üste gelmez, parçanın dışına, eklem halkalarına, dövmeye ve göğsün alt çizgisine taşmaz.
// Yerleşebilen yara sayısı N ise her HPMAX/N can kaybında bir yara görünür (can dolunca ters sırayla kaybolur).
// Her parça için bir kaplama tuvali var; yara sayısı değişince bir kez yeniden çizilir, karede sadece parçanın üstüne tek drawImage (yük yok).
// 1-2: pantolon yırtığı (sadece pantolonda); 5, 9: yara bandı (sabit boy, sık); diğerleri derinin her yerinde, büyüklü küçüklü.
const YARAI=[];for(let i=1;i<=16;i++)yukle('yara/y'+i+'.webp',im=>YARAI[i]=im);
const YR_PANT=[1,2],YR_BANT=[5,9],YR_DERI=[3,4,6,7,8,10,11,12,13,14,15,16],YR_BANT_BOY=58;
// yuva: parça görseli, deri/pantolon, koyulaştırma, yara boyu [en az, en çok] (görsel px; oyun birimi = px/RES), yasak daireler [x,y,r] ve yasak bant
const YR_YUVA={
  govde:{im:'govde0',tur:'d',koyu:0,boy:[46,86],yas:[[94,183,66],[309,120,46]],ust:96,alt:478,bant:[262,350]},
  ustkol_N:{im:'ustkol',tur:'d',koyu:0,boy:[42,66],yas:[[88,61,72],[65,308,62]]},
  ustkol_F:{im:'ustkol',tur:'d',koyu:.13,boy:[42,66],yas:[[88,61,72],[65,308,62]]},
  onkol:{im:'onkol',tur:'d',koyu:0,boy:[40,62],yas:[[57,97,64],[338,97,64],[173,94,52]]},
  onkol2:{im:'onkol2',tur:'d',koyu:.13,boy:[40,62],yas:[[57,97,64],[338,97,64]]},
  uyluk_N:{im:'uyluk',tur:'p',koyu:0,max:4,boy:[52,80],yas:[[132,95,72],[146,507,66]]},
  uyluk_F:{im:'uyluk',tur:'p',koyu:.28,max:3,boy:[52,80],yas:[[132,95,72],[146,507,66]]},
  altpan_N:{im:'altpan',tur:'p',koyu:0,max:3,boy:[48,72],yas:[[123,64,64],[86,408,62]]},
  altpan_F:{im:'altpan',tur:'p',koyu:.28,max:2,boy:[48,72],yas:[[123,64,64],[86,408,62]]}
};
const YARA={ok:false,L:[],k:-1,c:{},var:{}};
function yrMaske(im){      // görselin piksel verisi (bir kez)
  const c=document.createElement('canvas');c.width=im.width;c.height=im.height;const x=c.getContext('2d',{willReadFrequently:true});x.drawImage(im,0,0);
  const d=x.getImageData(0,0,c.width,c.height).data;c.width=c.height=0;return {w:im.width,h:im.height,d};
}
const YR_M={};
function yrUygun(y,m,px,py){      // bu piksel yara alabilir mi: deri/pantolon rengi, yasak daire ve bantların dışında
  px|=0;py|=0;if(px<0||py<0||px>=m.w||py>=m.h)return false;
  const i=(py*m.w+px)*4,d=m.d,r=d[i],g=d[i+1],b=d[i+2];if(d[i+3]<250)return false;
  if(y.tur==='d'){if(!(r>120&&r>=g&&g>=b&&r-b>30&&r+g+b>330))return false}
  else if(!(b>r+8&&r+g+b>150))return false;
  for(const [x0,y0,rr] of y.yas)if((px-x0)*(px-x0)+(py-y0)*(py-y0)<rr*rr)return false;
  if(y.ust&&py<y.ust)return false;if(y.alt&&py>y.alt)return false;if(y.bant&&py>y.bant[0]&&py<y.bant[1])return false;
  return true;
}
function yrNokta(n){      // yara görselinin dolu yerlerinden örnek noktalar (merkeze göre, uzun kenar = 1)
  if(YR_M['n'+n])return YR_M['n'+n];
  const im=YARAI[n],m=yrMaske(im),L=Math.max(m.w,m.h),P=[];
  for(let j=0;j<m.h;j+=Math.max(2,m.h/14|0))for(let i=0;i<m.w;i+=Math.max(2,m.w/14|0))if(m.d[(j*m.w+i)*4+3]>120)P.push([(i-m.w/2)/L,(j-m.h/2)/L]);
  return YR_M['n'+n]=P;
}
function yaraKur(){      // yeni rastgele yerleşim; görseller hazır değilse false
  for(let i=1;i<=16;i++)if(!YARAI[i]||!YARAI[i].width)return false;
  for(const k in YR_YUVA){const y=YR_YUVA[k];if(!R[y.im]||!R[y.im].width)return false;if(!YR_M[y.im])YR_M[y.im]=yrMaske(R[y.im])}
  const L=[],ad=Object.keys(YR_YUVA),alan={};let top=0;
  for(const k of ad){const y=YR_YUVA[k],m=YR_M[y.im];let a=0;for(let j=0;j<m.h;j+=6)for(let i=0;i<m.w;i+=6)if(yrUygun(y,m,i,j))a++;alan[k]=a;top+=a}
  let hata=0;
  while(hata<1500&&L.length<120){
    let r=Math.random()*top,k=ad[0];for(const q of ad){r-=alan[q];if(r<=0){k=q;break}}
    const y=YR_YUVA[k],m=YR_M[y.im];
    if(y.max&&L.filter(o=>o.k===k).length>=y.max){top-=alan[k];alan[k]=0;if(top<=0)break;continue}      // pantolonda arada bir (dolunca artık seçilmez)
    const n=y.tur==='p'?YR_PANT[Math.random()*2|0]:(Math.random()<0.3?YR_BANT[Math.random()*2|0]:YR_DERI[Math.random()*YR_DERI.length|0]);
    const boy=YR_BANT.includes(n)?YR_BANT_BOY*(y.boy[1]<70?0.85:1):y.boy[0]+Math.random()*(y.boy[1]-y.boy[0]);
    const a=n===10?(Math.random()-0.5)*0.4:(Math.random()-0.5)*2.2,ay=Math.random()<0.5?-1:1,ca=Math.cos(a),sa=Math.sin(a);
    const x=Math.random()*m.w,yy=Math.random()*m.h,rr=boy*0.42;
    let iyi=yrUygun(y,m,x,yy);
    if(iyi)for(const o of L)if(o.k===k&&Math.hypot(o.x-x,o.y-yy)<o.rr+rr){iyi=false;break}      // üst üste gelmez
    if(iyi)for(const [u,v] of yrNokta(n)){const ux=u*boy*ay,vy=v*boy;if(!yrUygun(y,m,x+ux*ca-vy*sa,yy+ux*sa+vy*ca)){iyi=false;break}}      // yaranın her yeri deride / pantolonda
    if(!iyi){hata++;continue}
    hata=0;L.push({k,n,x,y:yy,boy,a,ay,rr});
  }
  for(let i=L.length-1;i>0;i--){const j=Math.random()*(i+1)|0;[L[i],L[j]]=[L[j],L[i]]}      // görünme sırası rastgele
  YARA.L=L;YARA.k=-1;YARA.ok=true;return true;
}
function yaraGuncelle(){      // can kaybına göre görünen yara sayısı; değişince kaplamalar yeniden çizilir
  if(!YARA.ok&&!yaraKur())return;
  const N=YARA.L.length,k=N?kisit(Math.floor((HPMAX-Math.max(0,S.hp))/HPMAX*N+1e-6),0,N):0;
  if(k===YARA.k)return;YARA.k=k;
  for(const q in YR_YUVA){const y=YR_YUVA[q],im=R[y.im];let c=YARA.c[q];
    if(!c){c=YARA.c[q]=document.createElement('canvas');c.width=im.width;c.height=im.height}
    const x=c.getContext('2d');x.clearRect(0,0,c.width,c.height);let var_=false;
    for(let i=0;i<k;i++){const o=YARA.L[i];if(o.k!==q)continue;const w=YARAI[o.n],L=Math.max(w.width,w.height),s=o.boy/L;
      x.save();x.translate(o.x,o.y);x.rotate(o.a);x.scale(o.ay*s,s);x.drawImage(w,-w.width/2,-w.height/2);x.restore();var_=true}
    if(var_){x.globalCompositeOperation='destination-in';x.drawImage(im,0,0);x.globalCompositeOperation='source-atop';if(y.koyu){x.fillStyle='rgba(40,35,60,'+y.koyu+')';x.fillRect(0,0,c.width,c.height)}x.globalCompositeOperation='source-over'}      // parçanın dışına taşmaz; arkadaki uzuvda koyu
    YARA.var[q]=var_;
  }
}
function yaraCiz(q,px,py){const c=YARA.c[q];if(c&&YARA.var[q])ctx.drawImage(c,-px,-py,c.width/RES,c.height/RES)}      // parçanın hemen üstüne, aynı bağlantı noktasıyla
