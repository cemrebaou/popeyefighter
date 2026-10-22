'use strict';
// Zıplama, zemin, oyuncu pozu, oyuncu çizimi (kol, bacak, karakter)
function ziplaBas(guc=1){
  if(S.ust)return;
  if(S.yer){S.vy=-ZIP1*guc;S.yer=false;S.ekstra=1;S.donuyor=false;ziplaCal()}
  else if(S.ekstra>0){S.ekstra--;S.vy=-ZIP2*guc;S.donuyor=true;S.spin=0;ziplaCal()}
}

// ---------- Zemin: şimdilik düz yol (ZEMIN tablosu ileride basamak/platform eklemeye hazır) ----------
function zemin(x){
  let lo=0,hi=ZEMIN.length-1;
  while(lo<hi){const m=(lo+hi+1)>>1;if(ZEMIN[m][0]<=x)lo=m;else hi=m-1}
  return ZEMIN[lo][1];
}

// ---------- Poz hesabı ----------
function hedefPoz(){
  const t=S.t, hiz=Math.abs(S.vx)/HIZ;
  const o={};
  if(!S.yer){
    if(S.tats>0){          // kasırga tekmesi: tek bacak yatay, kollar iki yana
      Object.assign(o,{lN:-92,bN:-6.5,lF:-20,bF:50,torso:0,bas:0,aNu:-90,aNr:90,aFu:-90,aFr:90});
    }else if(S.dkick){     // uçan tekme: bacak çekiş yönüne uzanır, diğer diz kırık, yumruk geride
      Object.assign(o,{lN:-S.dkick.al,bN:-6.5,lF:-70,bF:105,torso:-14,bas:-3,aNu:-150,aNr:90,aFu:-45,aFr:-20});
    }else if(S.slam){      // süper kahraman inişi (havada): dizler toplu, yumruk geride
      Object.assign(o,{lN:-60,bN:90,lF:-30,bF:80,torso:20,bas:-10,aNu:-150,aNr:70,aFu:-70,aFr:30});
    }else if(S.shoryu>0){  // shoryuken: tek diz yukarıda (diz kolun karşı bacağı), diğer bacak düz
      Object.assign(o,S.shDiz==='N'?{lN:-95,bN:118,lF:6,bF:4}:{lN:6,bN:4,lF:-95,bF:118},{torso:-3,bas:-2,aNu:-26,aNr:-44,aFu:-10,aFr:-52});
    }else if(S.donuyor){   // top pozu: bacaklar karna, kollar göğse
      Object.assign(o,{lN:-125,bN:145,lF:-112,bF:140,torso:72,bas:-12,aNu:-62,aNr:92,aFu:-78,aFr:105});   // sıkı top: dizler karına, kollar dizleri sarar, çene göğse
    }else if(S.vy<0){
      Object.assign(o,{lN:-40,bN:75,lF:-12,bF:35,torso:6,bas:0,aNu:-80,aNr:30,aFu:-60,aFr:25});
    }else{
      Object.assign(o,{lN:-18,bN:12,lF:14,bF:25,torso:4,bas:2,aNu:-30,aNr:40,aFu:-20,aFr:45});
    }
  }else if(hiz>0.05){
    const f=S.faz, s=Math.sin(f), c=Math.cos(f);
    const r=kisit((hiz-0.55)/0.35,0,1), ly=(a,b)=>a+(b-a)*r;      // r: yürüyüşten koşuya geçiş
    o.lN=ly(-28,-62)*s; o.bN=ly(38,105)*Math.max(0,c);
    o.lF=ly(28,62)*s;  o.bF=ly(38,105)*Math.max(0,-c);
    o.torso=ly(6+2*c*c,18+3*c*c); o.bas=ly(1.5*s,-4+2*s);
    o.aNu=ly(3-22*s,-15+55*s); o.aNr=ly(55+25*Math.max(0,s),-45-15*s);     // koşuda dirsekler ~90° bükülü, yumruklar göğüs/çene hizasında, kollar bacakların tersine sallanır
    o.aFu=ly(-2+22*s,-15-55*s); o.aFr=ly(55+25*Math.max(0,-s),-45+15*s);
  }else{            // bekleme: nefes alma
    const n=Math.sin(t*2.2);
    o.lN=7; o.bN=3; o.lF=-9; o.bF=6;
    o.torso=2+1.2*n; o.bas=-1*n;
    o.aNu=4+2*n; o.aNr=60;
    o.aFu=-2+2*n; o.aFr=65;
  }
  o.kN=0;o.kF=0;o.pelv=0;o.hx=0;o.hy=0;o.hb=0;o.cr=0;o.cw=0.5;
  if(S.yer&&hiz>0.05){o.kN=kisit((o.bN-35)/45,0,1);o.kF=kisit((o.bF-35)/45,0,1)}   // koşuda geride kalkan ayak: parmak ucu aşağı, taban arkayı gösterir
  if(S.yer&&asagiMi()){      // çömelme: bir bacak önde çapraz, diğeri diz üstü geride; yürürken bacaklar rol değiştirir
    const sn=Math.sin(S.faz), w=hiz>0.05?0.5+0.5*sn:1;      // w=1: yakın bacak önde
    const ON_={l:-90,b:135}, ARKA={l:20,b:37};   // ön bacak derin çömelme; arka bacak: üst bacak aşağı, alt bacak geride, ayak ucu yere değer
    o.lN=ARKA.l+(ON_.l-ARKA.l)*w; o.bN=ARKA.b+(ON_.b-ARKA.b)*w; o.kN=1-w;
    o.lF=ARKA.l+(ON_.l-ARKA.l)*(1-w); o.bF=ARKA.b+(ON_.b-ARKA.b)*(1-w); o.kF=w;
    o.cr=1; o.cw=w; o.pelv=32; o.hy=14; o.hb=50+(hiz>0.05?6*sn:0); o.torso=13+(hiz>0.05?4*sn:0); o.bas=-26; o.aNu=-38; o.aNr=40; o.aFu=-26; o.aFr=45;
  }
  if(S.atk||S.t-S.sonAtk<0.9||kolVar()){   // vuruş sürerken guard; bırakınca kollar iner
    o.aNu=-26;o.aNr=-44;o.aFu=-10;o.aFr=-52;
  }
  o.ofs=0;o.lift=0;
  if(S.atk)atkPozu(o);
  if(kolVar()&&!S.donuyor&&!(S.tats>0)){      // sürükleme: o kol parmağı izler, ayaklar yerinde
    let ileri=0;
    if(kolAktif(KOL.N)&&!(S.atk&&KOL.N.e<0.3&&!tutan('N')))ileri+=kolUygula(o,KOL.N,'aNu','aNr',-26,-70);
    if(kolAktif(KOL.F)&&!(S.atk&&KOL.F.e<0.3&&!tutan('F')))ileri+=kolUygula(o,KOL.F,'aFu','aFr',-10,-62);
    if(!(S.yer&&asagiMi())){o.torso+=12*ileri;o.bas+=2*ileri}      // çömelirken kol hareketi gövdeyi oynatmaz
  }
  if(S.shoryu>0&&!S.yer){          // yükselen yumruk kolu
    if(S.shArm==='N'||S.shBoth){o.aNu=-165;o.aNr=75}
    if(S.shArm==='F'||S.shBoth){o.aFu=-165;o.aFr=75}
  }
  if(S.kay&&S.t<S.kay.t0+S.kay.T&&S.yer){      // Sub-Zero kayması
    Object.assign(o,{lN:-74,bN:0,lF:-110,bF:140,kN:0,kF:0,torso:-14,bas:8,pelv:0,hx:0,hy:0,hb:0,aNu:-105,aNr:8,aFu:55,aFr:12});   // bir bacak yerde öne uzanır, diğeri altında; gövde öne eğik
  }
  if(S.sup&&S.t<S.sup.t0+S.sup.T&&S.yer){      // süper kahraman inişi (yerde): tek diz yerde, yumruk yere
    Object.assign(o,{lN:-95,bN:125,kN:0,lF:30,bF:60,kF:1,pelv:28,hy:14,hb:40,torso:30,bas:-24,aNu:-20,aNr:90,aFu:70,aFr:90});
  }
  if(S.blok&&S.yer){o.aNu=-90;o.aNr=4;o.aFu=-82;o.aFr=-6;o.torso+=2;o.bas=-4}      // blok: dirsekler önde, yumruklar yüzün hizasında (guard)
  if(S.sman){                       // süpermen: iki kol ileri, bacaklar arkada düz, gövde yatay
    Object.assign(o,{lN:8,bN:3,lF:-6,bF:4,kN:0,kF:0,torso:0,bas:0,pelv:0,hx:0,hy:0,hb:0,aNu:-175,aNr:85,aFu:-175,aFr:85,lift:-180});
  }
  if(S.yy){                         // yer yumruğu: iki kol tepeye kalkar, sonra iki yumruk yere iner
    const u=(S.t-S.yy.t0)/S.yy.T;
    if(u<0.3)Object.assign(o,{lN:-30,bN:50,lF:15,bF:30,kN:0,kF:0,torso:-8,bas:6,pelv:6,hy:4,hb:-6,aNu:-170,aNr:18,aFu:-170,aFr:18});
    else Object.assign(o,{lN:-95,bN:125,lF:30,bF:60,kN:0,kF:1,pelv:28,hy:14,hb:40,torso:32,bas:-24,aNu:-30,aNr:95,aFu:-30,aFr:95});
  }
  if(S.alk){                        // alkış: önce ezilmiş çömelme (eller ortada), sonra zıplayıp kolları iki yana açar
    const u=(S.t-S.alk.t0)/S.alk.T;
    if(u<0.4)Object.assign(o,{lN:-85,bN:130,lF:-55,bF:120,kN:0,kF:0,pelv:30,hy:18,hb:45,torso:34,bas:-26,aNu:-62,aNr:-34,aFu:-58,aFr:-38});
    else Object.assign(o,{lN:4,bN:0,lF:-4,bF:0,kN:0,kF:0,pelv:0,hy:0,hb:0,torso:-4,bas:4,aNu:-100,aNr:0,aFu:100,aFr:0});
  }
  if(S.ust&&S.ust.f==='diz'&&S.yer){      // yerdekinin üstünde: iki diz ve alt bacaklar yerde, belden yukarısı vurur
    Object.assign(o,{lN:-4,bN:96,lF:6,bF:92,kN:1,kF:1,pelv:0,hx:0,hy:0,hb:0,cr:0,lift:0});o.ofs*=0.3;
    if(!S.atk){o.torso=8;o.bas=-6;if(!kolVar()){o.aNu=-40;o.aNr=70;o.aFu=-30;o.aFr=75}}
  }
  if(S.dag&&!S.yer)Object.assign(o,{aNu:-92,aNr:4,aFu:-80,aFr:-8,torso:22,bas:6});      // dağ sıçraması: bıçaklar önde
  if(S.sarj>0)o.torso+=4;                                                // şarjda kollar parmakları izler, top iki yumruğun ortasında büyür
  if(S.hitR){                       // darbe tepkisi: vurulan yer geriye (vuranın ters yönüne) savrulur
    const u=(S.t-S.hitR.t0)/0.55;
    if(u<1){
      const en=u<0.18?u/0.18:Math.pow(1-(u-0.18)/0.82,1.6), b=S.hitR.bk, ad=(k,v)=>{if(o[k]!==undefined)o[k]+=v};
      if(S.hitR.z==='kafa'){ad('bas',-b*40*en);ad('torso',-b*12*en);ad('hb',-b*6*en)}
      else if(S.hitR.z==='govde'){ad('torso',-b*32*en);ad('bas',-b*14*en);ad('hb',-b*14*en);ad('aNu',b*18*en);ad('aFu',b*18*en)}
      else{ad('lN',b*42*en);ad('bN',Math.max(0,b)*60*en);ad('lF',b*24*en);ad('bF',Math.max(0,b)*32*en);ad('torso',b*10*en);ad('bas',b*4*en)}
    }
  }
  if(S.pence&&S.t-S.pence.t0<0.8){      // bıçak çıkarma: kollar kalkar, hızla aşağı savrulur; dizler kırılır, gövde belden öne eğilir, kafa karşıya bakar
    const u=(S.t-S.pence.t0)/0.8,ez=x=>x*x*(3-2*x),A=u<0.25?ez(u/0.25):u<0.7?1:ez(1-(u-0.7)/0.3),sw=ez(kisit((u-0.22)/0.13,0,1));
    const kl={aNu:-150+125*sw,aNr:70-80*sw,aFu:-140+120*sw,aFr:75-85*sw};
    for(const k in kl)o[k]=o[k]+(kl[k]-o[k])*A;
    o.torso+=22*A;o.bas-=18*A;o.lN+=(-28-o.lN)*A;o.bN+=(52-o.bN)*A;o.lF+=(-8-o.lF)*A;o.bF+=(44-o.bF)*A;
  }
  ispPoz(o);
  if(S.t<S.firT){const el=S.firEl||0;o.aNu=-90-el;o.aNr=90;o.aFu=-90-el;o.aFr=90;o.torso+=10}       // ateş: iki kol öne
  return o;
}
const ANAH=['lN','bN','lF','bF','torso','bas','aNu','aNr','aFu','aFr','ofs','lift','kN','kF','pelv','hx','hy','hb','cr','cw'];
function pozGuncelle(dt){
  const h=hedefPoz(), k=1-Math.exp(-dt*((S.atk||kolVar()||S.yy||S.alk||(S.yeme&&S.t-S.yeme.t0>1.8))?45:(S.yer?22:16)));
  ANAH.forEach(a=>{P[a]=(P[a]===undefined)?h[a]:P[a]+(h[a]-P[a])*k});
}

// ---------- Çizim ----------
function resim(img,px,py){ctx.drawImage(img,-px,-py,img.width/RES,img.height/RES)}
// Bacak: kalça (uyluk) -> diz (alt pantolon) -> ayak bileği (bacak + bot), üç ayrı parça (görsellerdeki halka merkezleri eklem noktası)
const T_X=7,T_Y=205.9, S_X=-18.5,S_Y=172, F_SOL=99;
function efSiddet(){const a=S.atk;if(!a||!a.fl)return 0;const u=a.t/HAREKET[a.ad].dur;return Math.sin(Math.PI*kisit((u-0.15)/0.7,0,1))}   // vuruş anında tepe yapan ışıltı şiddeti
function efLeg(ad){if(/^kickD/.test(ad))return 'NF';if(ad==='kick4'||ad==='dizF'||ad==='dizJF'||/^kick(?!D)\w*F$/.test(ad))return 'F';if(/^(kick|diz)/.test(ad))return 'N';return ''}
function ekParla(img,x,y,I){ctx.save();ctx.globalCompositeOperation='lighter';ctx.globalAlpha=Math.min(1,I*0.8);resim(img,x,y);ctx.restore()}   // parçayı üstüne ekleyerek parlatır
function parilti(x,y,r,I,fl){
  if(I<=0.02)return;const g=ctx.createRadialGradient(x,y,0,x,y,r);
  const c=fl==='*'?'255,214,90':'255,240,170';
  g.addColorStop(0,'rgba(255,255,255,'+(0.95*I)+')');g.addColorStop(0.35,'rgba('+c+','+(0.7*I)+')');g.addColorStop(1,'rgba('+c+',0)');
  ctx.save();ctx.globalCompositeOperation='lighter';ctx.fillStyle=g;ctx.beginPath();ctx.arc(x,y,r,0,7);ctx.fill();ctx.restore();
}
function bacak(l,k,ank,koyu){
  const sfx=koyu?'_k':'';
  const lb=S.atk&&S.atk.fl&&efLeg(S.atk.ad).indexOf(koyu?'F':'N')>=0, lI=lb?efSiddet():0, lf=lb&&S.atk.fl==='*'&&lI>0;   // tekme/diz bitişinde bacağın tamamı parlar
  ctx.save();if(koyu)ctx.scale(KFS,KFS);ctx.rotate(l*D);      // arkadaki (sol) bacak perspektif için %90
  ctx.save();ctx.translate(T_X,T_Y);ctx.rotate(k*D);
  ctx.save();ctx.translate(S_X,S_Y);ctx.rotate(ank*D);resim(R['bacak_bot'+sfx],55,22);   // bot en arkada
  if(lf)ekParla(R['bacak_bot'+sfx],55,22,lI);else if(lb)parilti(70,80,80,lI,'+');
  ctx.restore();
  resim(R['altpan'+sfx],61.6,32.1);
  if(lf)ekParla(R['altpan'+sfx],61.6,32.1,lI);
  ctx.restore();
  resim(R['uyluk'+sfx],66,47.5);                                                                        // uyluk dizi örter
  if(lf)ekParla(R['uyluk'+sfx],66,47.5,lI);
  ctx.restore();
}
let BONg=0;              // kalça eklemi ile gövde kalçası arasındaki yatay fark (karakter() içinde ayarlanır)
function govdeUzayi(fn){ctx.save();ctx.translate(P.hx,-P.hy);ctx.rotate(P.pelv*D);ctx.translate(10.1+BONg,-81.4);ctx.rotate(P.torso*D);fn();ctx.restore()}   // gövde bel noktası: karnı kalçanın üstüne biner
// Kol: üst kol -> dirsek -> ön kol (el, ön kolun altında; ön kol dirsek halkasında döner). Omuz noktaları bel noktasına göre.
// el görselleri [anahtar, bilek x, bilek y]: yakın elde sırt görünür (yumruk, el_ac_f, el_tut_f); uzak elde avuç/parmaklar bize bakar (el_yum_f, el_ac_n, el_tut_n; sonuncular koyulaştırılmış)
const KOL_EL={N:{yum:['el_yum',26.35,58.35],ac:['el_ac_f',25.6,77.45],tut:['el_yum',26.35,58.35]},      // tutarken yumruk
              F:{yum:['el_yum_f_a',26.1,49.75],ac:['el_ac_n_a',25.55,82.35],tut:['el_yum_f_a',26.1,49.75]}};
const PENCE_EL={N:['el_pN',22.42,47.76],F:['el_pF_a',21.49,46.0]};      // pençe modu: bıçaklı eller (yakın el sırtı, uzak el parmakları görünür)
const HS={N:'yum',F:'yum'}, ACT={N:0,F:0};     // el durumu: yum = yumruk, ac = tutmaya hazır açık el, tut = düşmanı tutuyor
function elDurum(dt){
  if(S.pence){HS.N=HS.F='yum';ACT.N=ACT.F=0;return}      // pençede eller açılmaz (tutma kapalı)
  for(const k of ['N','F']){
    if(S.yeme&&S.yeme.k===k&&!S.yeme.atildi){HS[k]='tut';ACT[k]=0;continue}      // ıspanak tutuyor
    if(tutan(k)||S.parcalar.some(p=>!p.at&&p.el===k)){HS[k]='tut';ACT[k]=0;continue}
    if(S.sarj<=0&&KOL[k].ak&&KOL[k].e>0.25&&EL[k].v<900)ACT[k]+=dt;else ACT[k]=0;   // basılı tutup yavaş çekiştirme: eller açılır
    HS[k]=ACT[k]>0.08?'ac':'yum';
  }
}
function kol(omuzX,omuzY,u,r,ad,far,sc){
  const sf=far?'_a':'';
  ctx.save();ctx.translate(omuzX,omuzY);{const q=dunyaNok(0,0);EL[ad].sx=q[0];EL[ad].sy=q[1]}ctx.scale(sc,sc);ctx.rotate(u*D);
  resim(R['ustkol'+sf],43.8,30.65);
  const bitis=S.atk&&S.atk.fl==='*'&&S.atk.ad[1]===ad&&/^[jchuobwszk][NF]$/.test(S.atk.ad), bI=bitis?efSiddet():0;      // kombo bitiş vuruşu: kolun tamamı parlar
  if(bI>0)ekParla(R['ustkol'+sf],43.8,30.65,bI);
  ctx.translate(-11.35,123.6);ctx.rotate(r*D);            // dirsek: üst kol halkası ile ön kol halkası üst üste
  elKaydet(ad);
  {const d=S.pence?PENCE_EL[ad]:KOL_EL[ad][HS[ad]||'yum'];
   ctx.save();ctx.translate(140.4,0);if(ad==='N')ispElCiz(ad);resim(R[d[0]],d[1],d[2]);if(bI>0)ekParla(R[d[0]],d[1],d[2],bI);if(ad==='F')ispElCiz(ad);ctx.restore();}   // el bilekte
  resim(R[far?'onkol2_a':'onkol'],28.5,far?48.3:48.6);
  if(bI>0)ekParla(R[far?'onkol2_a':'onkol'],28.5,far?48.3:48.6,bI);
  else if(S.atk&&S.atk.fl==='+'&&S.atk.ad[1]===ad&&/^[jchuobwszk][NF]$/.test(S.atk.ad))parilti(248,0,95,efSiddet(),'+');   // yumruk çerçevesi parlar
  ctx.restore();
}
function ayakAci(l,b,diz){const hdf=(S.yer&&Math.abs(S.vx)>40&&!asagiMi())?135:100;const f=((S.atk&&S.atk.ad.indexOf('kick')===0)||S.tats>0||S.dkick||(S.kay&&S.t<S.kay.t0+S.kay.T))?0:((S.yer&&!S.atk)?0.85:0.45),d=-(l+b)*f;return d+((hdf-(l+b))-d)*diz}   // diz: 1 = geride; hdf 100 = ayak ucu yere değer, 135 = koşuda geride kalkan ayak: taban arkaya-yukarı bakar
// ---- Ayak-zemin uyumu (iki kemikli ters kinematik) ----
const rot=(x,y,deg)=>{const t=deg*D,c=Math.cos(t),s=Math.sin(t);return [x*c-y*s,x*s+y*c]};
const L1=Math.hypot(T_X,T_Y),L2=Math.hypot(S_X,S_Y),DL1=Math.atan2(-T_X,T_Y),DL2=Math.atan2(-S_X,S_Y);
function ayakNokta(l,k,ank,kn){          // kalça uzayında bilek ve zemine değen nokta (topuk/ayak ucu karışımı)
  const v1=rot(T_X,T_Y,l),v2=rot(S_X,S_Y,l+k),ax=v1[0]+v2[0],ay=v1[1]+v2[1];
  const c=rot(103*kn,F_SOL-9*kn,l+k+ank);
  return {ax,ay,cpx:c[0],cpy:c[1],cx:ax+c[0],cy:ay+c[1]};
}
function ikCoz(tx,ty){
  const d=Math.min(L1+L2-0.5,Math.max(Math.abs(L1-L2)+0.5,Math.hypot(tx,ty)));
  const tau=Math.atan2(-tx,ty),al=Math.acos((L1*L1+d*d-L2*L2)/(2*L1*d)),ga=Math.acos((L1*L1+L2*L2-d*d)/(2*L1*L2));
  const th=tau-al,flex=Math.PI-ga;
  return {l:(th-DL1)/D,k:(th+flex-DL2-(th-DL1))/D};
}
function karakter(){
  const ALT=15, BON=6/SC-ALT;   // kalçadan aşağısı (kalça + bacaklar) ekranda 6 piksel öne, ayrıca 15 birim geriye
  let N={l:P.lN,k:P.bN,kn:P.kN},F={l:P.lF,k:P.bF,kn:P.kF};
  N.a=ayakAci(N.l,N.k,N.kn);F.a=ayakAci(F.l,F.k,F.kn);
  const nN=ayakNokta(N.l,N.k,N.a,N.kn),nF=ayakNokta(F.l,F.k,F.a,F.kn);
  const yukN=S.yer?Math.max(nN.cy,nF.cy):BACAK_BOY;
  const yuk=S.yer?yukN+(CR_H-yukN)*P.cr:BACAK_BOY;      // çömelmede kalça alçalır; her iki ayak da yere basar (aşağıda ters kinematik)
  const celme=S.kay&&S.t<S.kay.t0+S.kay.T;
  const ikAcik=S.yer&&!celme&&!(S.ust&&S.ust.f==='diz')&&!S.sman&&!(S.hitR&&S.hitR.z==='bacak'&&S.t<S.hitR.t0+0.5)&&!(S.atk&&(S.atk.ad.indexOf('kick')===0||S.atk.ad.indexOf('diz')===0));
  if(ikAcik){
    [[N,nN,P.cw],[F,nF,1-P.cw]].forEach(([B,n,wf])=>{
      const dunyaX=S.x+S.yon*(P.ofs+BON+n.cx), gH=zemin(dunyaX);
      const kz=P.cr, tx0=n.ax+P.hb, tx1=(-80+170*wf)+P.hb;      // çömelmede ayak noktaları: ön ayak öne, arka ayak geriye (kalçaya göre)
      const hedefCy=n.cy+(yuk-n.cy)*kz+(S.y-gH);               // kalçadan yere gereken derinlik (çömelmede ayak tam yere iner)
      const fa=B.l+B.k+B.a;                               // ayağın yönü korunur
      const fs=B===F?KFS:1,t=ikCoz((tx0+(tx1-tx0)*kz-P.ofs)/fs,(hedefCy-n.cpy)/fs);      // yumruk atılırken ayaklar yerinde sabit kalır, kalça/gövde öne gider (bacaklar uzar/bükülür)   // kalça geri kaydıysa ayak yerinde kalır, bacaklar yeniden şekillenir
      const wI=1-kisit(P.lift/30,0,1),l0=B.l,k0=B.k;      // hafif zıplamada (aparkat, süpermen) bacaklar kareden gelir
      const sar=v=>((v%360)+540)%360-180,tl=l0+sar(t.l-l0),tk=k0+sar(t.k-k0);      // açı farkı en kısa yoldan: uçan tekmeden dönerken ayak 360° dönmez
      B.l=l0+(tl-l0)*wI;B.k=k0+(tk-k0)*wI;B.a=fa-(B.l+B.k);
    });
  }
  ctx.save();
  ctx.translate(P.ofs-P.hb,-yuk-P.lift);   // kalça ve üstü geriye (sola) kayar
  if(S.donuyor||S.tats>0||S.sman){ctx.translate(0,-170);ctx.rotate(S.spin);ctx.translate(0,170);}   // yuvarlanma: gövde ortasından ileri doğru döner
  BONg=BON;
  govdeUzayi(()=>{ kol(28,-158,P.aFu,P.aFr,'F',true,1.0); });   // uzak kol en arka katmanda: biraz küçük, omza oturur
  ctx.save();ctx.translate(BON,0);
  bacak(F.l,F.k,F.a,true);
  ctx.restore();
  ctx.save();ctx.translate(P.hx+BON,-P.hy);ctx.rotate(P.pelv*D);resim(R.kalca,73.5,118.8);ctx.restore();   // kalça (şort) bacakların önünde, gövdenin arkasında
  ctx.save();ctx.translate(BON,0);bacak(N.l,N.k,N.a,false);ctx.restore();   // yakın bacak kalçanın önünde
  govdeUzayi(()=>{ ctx.scale(1.1,1.1);const [i,f]=hasarKat(S.hp);hasarCiz(n=>resim(R['govde'+n],97.7,246.4),i,f); });      // gövde (%10 büyük) karnıyla kalçanın üstüne biner; canla yüzle aynı anda, yumuşak geçişle değişir
  govdeUzayi(()=>{
    ctx.save();ctx.translate(9,-262);ctx.rotate(P.bas*D);ctx.translate(5/SC,0);{if(S._lh!=null&&S.hp<S._lh){S.agT0=S.t;S.agLv=Math.min(9,Math.floor((100-Math.max(S._lh,1))/10))}S._lh=S.hp;const ph=S.t-(S.agT0==null?-9:S.agT0);if(ph>=0&&ph<0.6)ctx.drawImage(YUZA[S.agLv],-112.5,-226.6,240.1,269.4);else{const [i,f]=hasarKat(S.hp),ye=S.yeme&&S.t-S.yeme.t0>0.7&&S.t-S.yeme.t0<1.85;hasarCiz(n=>ye?ctx.drawImage(YUZY[n],-95.4,-192.4,205.8,298.2):ctx.drawImage(YUZ[n],-106.8,-213.8,228.7,256.6),i,f)}}      // ıspanak yerken ağzı açık yüz      // vurulunca 0.6 sn acı yüzü
    ctx.restore();
    kol(-59,-149,P.aNu,P.aNr,'N',false,1.1);         // yakın kol (%10 büyük)
  });
  ispOnCiz();
  ctx.restore();
}
