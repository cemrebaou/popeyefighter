'use strict';
// Vuruş, isabet kontrolü, tutma, yırtma, düşman güncelleme
const DUS_DUS=0.45,DUS_KALK=1.0;      // yere düşüş ve kalkış süreleri
// ---- Temas: vuruş sadece vuran parça (yumruk / bıçak / diz / bot) vücudun o anki pozuna gerçekten değince ----
function segUz(px,py,a,b){const vx=b.x-a.x,vy=b.y-a.y,L=vx*vx+vy*vy;let t=L?((px-a.x)*vx+(py-a.y)*vy)/L:0;t=t<0?0:t>1?1:t;return Math.hypot(px-a.x-vx*t,py-a.y-vy*t)}
const GKAP=[['kal','boy',0.52],['boy','kafa',0.48],['kal','dN',0.3],['dN','aN',0.27],['kal','dF',0.3],['dF','aF',0.27]];      // düşman vücudu: kapsüller (yarıçap e.r ile orantılı); yerde yatarken de pozla birlikte yatar
function dusDeg(e,x,y,pad){
  const b=e._b;
  if(!b||S.t-b.t>0.2)return Math.hypot(x-e.x,y-(e.y+e.cy))<e.r*0.8+pad;      // çizilmemişse (ekran dışı) eski daire
  for(const [p,q,r] of GKAP){const A=b[p],C=b[q];if(A&&C&&segUz(x,y,A,C)<e.r*r+pad)return true}
  return false;
}
const nk=a=>a&&{x:a[0],y:a[1]};
function oyuncuDeg(x,y,pad){      // nokta oyuncunun vücuduna değiyor mu (eğilince/yatınca poza uyar)
  if(!OGV.kal||S.t-OGV.t>0.2)return Math.abs(x-S.x)<120+pad&&y>S.y-pad&&y<S.y+850+pad;
  const K=[[OGV.kal,OGV.boyun,115],[OGV.boyun,OGV.kafa,105],[OGV.kal,AY.N.d,70],[AY.N.d,AY.N.a,62],[OGV.kal,AY.F.d,70],[AY.F.d,AY.F.a,62]];
  for(const [a,b,r] of K){if(a&&b&&segUz(x,y,nk(a),nk(b))<r+pad)return true}
  return false;
}
function elDeg(e,k,pad){const h=EL[k];if(dusDeg(e,h.wx,h.wy,pad))return true;return !!(S.pence&&h.b1&&(dusDeg(e,h.b1[0],h.b1[1],pad*0.7)||dusDeg(e,h.b2[0],h.b2[1],pad*0.6)))}      // yumruk ya da bıçak
function ayakDeg(e,L,pad){const a=AY[L];return !!(a&&a.d&&(dusDeg(e,a.d[0],a.d[1],pad)||dusDeg(e,a.a[0],a.a[1],pad)||dusDeg(e,a.u[0],a.u[1],pad)))}      // diz ya da bot
function yereDeg(e){const b=e._b;if(!b||S.t-b.t>0.25)return true;let lo=1e9;for(const n of ['kafa','boy','kal'])if(b[n])lo=Math.min(lo,b[n].y);return lo-zemin(e.x)<e.r*0.75}      // ölünün kafası/gövdesi yerde mi
function vur(e,dmg,vx,vy,f,hy){
  let krit=false;e.sonV=S.t;e.vurT=S.t;if(e.kac)e.kac.v++;      // vurT: 0.6 sn acı yüzü
        // son vuruş zamanı (tutulu korsan 1 sn vurulmazsa kafa atar)
  if(e.boss){f*=0.25;dmg*=0.5;if(hy!==undefined&&hy>e.y+900){dmg*=3;krit=true}}      // kaptan: kafasına vuruş 3 kat
  dmg=Math.round(dmg);titre(12+Math.round(70*f));
  const olu0=e.olu;e.hp-=dmg;e.fl=0.15;
  if(dmg<9999){const kyn=e.x>=S.x?1:-1,bs=e.bs||1;      // kan her zaman düşmanın gövdesi üzerinde çıkar (boşa giden yumrukta bile)
    const kx=kisit(S.pHx===undefined?e.x-kyn*59*bs:S.pHx,e.x-99*bs,e.x+99*bs),ky=kisit(hy===undefined?e.y+e.cy:hy,e.y+135*bs,e.y+882*bs);
    kanVurus(kx,ky,f,kyn,S.pSes===true);if(e.hp<=0&&!olu0)kanFiskir(kx,ky,kyn,0.8)}
  if(S.bNo){e.hafT=S.t}      // bıçak vuruşu (20): itmez, düşürmez, sersemletmez; sadece geri eğilir
  else if(!e.boss&&(dmg>10||(dmg===10&&Math.random()<0.5)))e.st=S.t+0.45+0.5*f;else if(dmg<=10)e.hafT=S.t;      // 10 üstü: her zaman sersemler (vuramaz, geri savrulur); tam 10: %50      // 10 altı vuruş sersemletmez: sadece yüz değişir, hafif geri eğilir      // kaptan sersemlemez (sadece parry)
  const L=Math.hypot(vx,vy)||1,dx=vx/L+(e.x>=S.x?1:-1)*0.35,dy=vy/L;
  const kb=0.5*(250+2450*kisit(dmg/50,0,1))*(e.boss?0.25:1);      // itme hasarla orantılı
  if(!S.bNo&&!e.tut&&dmg>=10&&!(S.ust&&S.ust.e===e)){e.vx=dx*kb;e.vy=e.boss?0:dy*kb+250}      // üstündeyken yerdekini itmez
  if(!S.bNo&&!e.boss&&e.kc!=='h'&&!e.tut&&e.hp>0&&dmg>=10&&dmg<9999&&Math.random()<0.25){      // 10 üstü vuruş: %25 ihtimalle: biraz geri uçup yere düşer; hasar arttıkça yerde sersem kalma uzar
    const yn=e.x>=S.x?1:-1,sr=kisit(1.8+(dmg-10)*0.06,1.8,5);      // yerde yatma süresi (eskisinin ~2 katı)e.cy0=e.cy0||e.cy;
    if(e.dus)e.dus.son=Math.max(e.dus.son,S.t+sr+DUS_KALK);else e.dus={t0:S.t,son:S.t+DUS_DUS+sr+DUS_KALK,yn};
    e.vx=yn*Math.max(500,Math.min(Math.abs(e.vx),1000));e.vy=Math.min(e.vy,550)}      // biraz daha uzağa düşer
  else if(e.dus&&!e.tut){e.vx*=0.3;e.vy=Math.min(e.vy,120)}      // yerdeyken hafif vuruş onu fazla oynatmaz
  if(e.hp<=0){e.tut=null;e.olu=true;e.ol=0;if(e.dus){e.yerOl=true;e.dus.son=S.t+999;e.vx=e.vy=0}else if(dmg<9999){const uc=dmg>=25||e.y>zemin(e.x)+5||Math.abs(e.vx)>1100;e.cy0=e.cy0||e.cy;e.dusA=0;      // ölüm: sert darbe = uçarak kıç üstü düşüp geri yatar, değilse dizler üstüne çöküp yüzüstü düşer
    if(uc){const yn=Math.sign(e.vx)||(e.x>=S.x?1:-1);e.vx=yn*Math.max(900,Math.abs(e.vx)*1.2);e.vy=Math.max(e.vy,0)+900;e.olm={tip:'uc',f:'hava',t0:S.t,yn,ters:(S.x-e.x)*(e.yon||1)<0}}
    else{e.vx*=0.3;e.vy=0;e.olm={tip:'diz',t0:S.t,yn:e.yon||1}}}else{e.vx*=1.4;e.vy+=700}if(!olu0){ypKazan(e.boss?3:1);ispDus(e.x,e.y+e.cy);bufCal(OLS[e.kc||'k'],1)}}      // yerdeyken ölürse olduğu yerde ölür (dönmez); ölüm sesi      // %25 ıspanak düşer
  if(S.pSes){if(S.pence&&S.pSes===true)torbaCal(BLD,BLDBAG,1);else ses(S.pSes==='tekme'?'tekme':'yumruk')}      // bıçak modunda bıçak sesleri
  S.dur=Math.max(S.dur,0.04+0.08*f);S.sars=Math.max(S.sars,4+14*f);
  S.pops.push({x:e.x,y:e.y+e.cy+e.r,t:0,txt:(krit?'KRİTİK -':'-')+dmg,f:krit?1:f});
}
function vurusKontrol(){
  const dugme=S.atk&&!S.atk.tv&&HAREKET[S.atk.ad].p;
  for(const k of ['N','F']){
    const h=EL[k];
    if(S.sarj>0||!(dugme||kolAktif(KOL[k]))||h.v<1500||HS[k]==='ac')continue;      // açık el vurmaz, sadece tutar
    for(const e of DUS){
      if(e.olu||e.hitT[k]>S.t||e.tut===k||e.iki)continue;      // kendi tuttuğuna vurmaz, diğer elle vurabilir
      if(!elDeg(e,k,45))continue;
      if(dugme&&(e.x-S.x)*S.yon<-40)continue;      // kombo vuruşu arkadakine işlemez
      const f=kisit((h.v-1500)/6000,0,1);
      const kd=kDmg(S.atk);if(kd!==null&&!S.atk.tv){S.cE=e;S.cEt=S.t}
      S.pSes=true;S.pHx=h.wx;S.bNo=!!S.pence;vur(e,S.pence?20:kd!==null&&!S.atk.tv?kd*PK():(S.atk&&/^pa[NF]$/.test(S.atk.ad)?15:15*PK()),h.vx,h.vy,f,h.wy);S.pSes=false;S.bNo=false;S.pHx=undefined;e.hitT[k]=S.t+(S.pence?0.15:0.4);if(S.pence&&S.hp>0)S.hp=Math.min(HPMAX,S.hp+HPMAX/100);      // bıçak vuruşu +1 can
    }
  }
  if(S.kay&&S.t<S.kay.t0+S.kay.T&&S.yer){      // Sub-Zero kayması: alçak çelme, havaya fırlatır
    for(const e of DUS){
      if(e.olu||e.kyT===S.kay.t0)continue;
      const dx=(e.x-S.x)*S.yon;
      if(!(ayakDeg(e,'N',60)||ayakDeg(e,'F',60)))continue;
      e.kyT=S.kay.t0;const d0=e.dus;S.pSes='tekme';vur(e,15,S.yon*0.5,1,0.6,S.y+50);S.pSes=false;if(!e.tut){e.vy=1900;e.vx=S.yon*300}
      if(!e.olu&&!e.tut&&!e.boss){if(Math.random()<0.5){e.cy0=e.cy0||e.cy;if(e.dus)e.dus.son=Math.max(e.dus.son,S.t+DUS_DUS+1.8+DUS_KALK);else e.dus={t0:S.t,son:S.t+DUS_DUS+1.8+DUS_KALK,yn:S.yon}}else if(!d0&&e.dus)e.dus=null}      // %50 yere serer      // kayan tekme: yarım zıplama kadar yukarı, çok az ileri
    }
  }
  if(S.sman){                       // süpermen uçuşu: önündeki her şeye çarpar
    const m=S.sman;
    for(const e of DUS){
      if(e.olu||e.smT===m.t0)continue;
      const dx=(e.x-S.x)*m.dir,ey=e.y+e.cy-S.y;
      if(elDeg(e,'N',60)||elDeg(e,'F',60)){e.smT=m.t0;vur(e,50*PK(),m.dir,0.15,0.7+0.3*m.ch,S.y+400)}
    }
  }
  if(S.dkick){                      // uçan tekme: ayak ucu çarptığına sert vurur
    const al=S.dkick.al*D,fx=S.x+S.dkick.dir*Math.sin(al)*430,fy=S.y+398-Math.cos(al)*430;
    for(const e of DUS){
      if(e.olu||e.dkT===S.dkick.t0)continue;
      if(ayakDeg(e,'N',70)||ayakDeg(e,'F',70)){e.dkT=S.dkick.t0;S.pSes='tekme';vur(e,15,S.dkick.dir,-0.5,0.8,fy);S.pSes=false}
    }
  }
  if(S.tats>0){                     // kasırga: etrafındaki herkese vurur
    for(const e of DUS){
      if(e.olu||e.tsT>S.t)continue;
      const dx=e.x-S.x,ey=e.y+e.cy-S.y;
      if(ayakDeg(e,'N',70)||ayakDeg(e,'F',70)){e.tsT=S.t+1.0;vur(e,50,dx>=0?1:-1,0.4,0.5,S.y+400)}
    }
  }
  if(S.shoryu>0&&S.vy<0){           // shoryuken: yükselirken önündeki ve üstündeki düşmanlara sert vurur
    for(const e of DUS){
      if(e.olu||e.shT===S.shId)continue;
      const dx=(e.x-S.x)*S.yon,ey=e.y+e.cy-S.y;
      if(elDeg(e,S.shArm,60)||(S.shBoth&&elDeg(e,S.shArm==='N'?'F':'N',60))||ayakDeg(e,S.shDiz,50)){e.shT=S.shId;vur(e,32*PK(),S.yon*0.3,1,0.85,S.y+900)}
    }
  }
  const a=S.atk;
  if(a&&a.tv&&!a.tvH&&a.t/HAREKET[a.ad].dur>=0.3){      // tutulana vuruş: kolun yumruğu vurduğu anda hasar
    a.tvH=true;
    const e=DUS.find(x=>x.tut&&!x.olu);
    if(e){const L=a.ad[0],dm={j:6,c:12,h:10,u:14,o:16,b:9,w:8,s:18,z:15,k:17}[L]||8;S.pSes=true;vur(e,dm,S.yon,L==='u'?1:(L==='o'?-0.6:0.1),0.4+dm/40,e.y+e.cy);S.pSes=false}
  }
  if(a&&/^(kick|diz)/.test(a.ad)){      // tekme / diz: sabit hasar, öne doğru fırlatır (çift tekmede iki ayrı vuruş penceresi)
    const mv=HAREKET[a.ad],u=a.t/mv.dur,PEN=mv.win||[[0.4,0.7]];
    a.vw=a.vw||[];
    for(let wi=0;wi<PEN.length;wi++){
      if(a.vw[wi]||u<PEN[wi][0]||u>PEN[wi][1])continue;
      const tekme=a.ad.indexOf('kick')===0, menzil=tekme?520:360;
      for(const e of DUS){
        if(e.olu)continue;
        const arkaT=a.ad.indexOf('kickBk')===0,dx=(e.x-S.x)*S.yon*(arkaT?-1:1), ey=e.y+e.cy-S.y;
        let dg=false;for(const L of (efLeg(a.ad)||'NF'))if(ayakDeg(e,L,55))dg=true;
        if(!dg)continue;
        const kd=kDmg(a);if(kd!==null){S.cE=e;S.cEt=S.t}
        S.pSes=tekme?'tekme':true;vur(e,kd!==null?Math.max(1,Math.round(kd/PEN.length)):(tekme?24:16),S.yon*(arkaT?-1:1),0.3,tekme?0.7:0.5,S.y+kickH(a.ad,wi));S.pSes=false;a.vw[wi]=true;
      }
    }
  }
}
// ---- tutma: ekrana basılı tut, eli yavaş götür, düşmanı yakala; bırakınca fırlat ----
function yirt(e,hiz){             // iki elle tutulan korsanı belden ikiye ayır: üst gövde N elinde, alt gövde F elinde; hızlı çekişte yarılar fırlar
  ses('parca');{const mx=(EL.N.wx+EL.F.wx)/2,my=(EL.N.wy+EL.F.wy)/2;kanFiskir(mx,my,1,1.2);kanFiskir(mx,my,-1,1.2)}
  const hizli=hiz>1000,v=kisit(hiz*0.9,1200,4200),z={yon:e.yon,anim:e.anim,fl:0,moving:false,kc:e.kc};      // çekişin gücü = yarıların fırlama hızı
  for(const el of ['N','F']){const yan=EL[el].wx<=EL[el==='N'?'F':'N'].wx?-1:1;S.parcalar.push({el,yan,kind:el==='N'?'ust':'alt',z,phi:e.phi||0,t0:S.t,at:hizli,tT:hizli?S.t:0,x:EL[el].wx,y:EL[el].wy,vx:yan*v,vy:hizli?900:0,rot:0})}
  S.yirtT=S.t;e.iki=false;vur(e,99999,0,0,0.3,e.y);S.pops.pop();e.ol=0.95;titre(60);
}
function tutReddet(e){            // canı enerjimizden fazla: yırtılamaz, düşman elimizden fırlar (hasar yok), biraz ileride tekrar bize gelir
  const yn=e.x>=S.x?1:-1;
  e.tut=null;e.iki=false;e.atil=true;e.noTut=S.t+1.2;e.vx=yn*1900;e.vy=650;e.st=S.t+0.55;e.fl=0.15;
  S.noEn=S.t;S.yirtT=S.t;S.pops.push({x:e.x,y:e.y+e.cy+e.r,t:0,txt:'ENERJİ YETMEDİ!',f:0.3});titre(60);
}
function ikiElKontrol(dt){
  S.parcalar=S.parcalar.filter(p=>p.at?S.t-p.tT<1.8:S.t-p.t0<6);
  if(S.pence)return;
  const a=izBul('N'),b=izBul('F');
  let e=DUS.find(x=>x.tut&&!x.olu);
  if(e&&!e.iki){                                   // tek elle tutuyoruz: diğer parmak basılı kalırsa ikinci el de tutuşa katılır
    const o=e.tut==='N'?'F':'N',iz2=izBul(o),iz1=izBul(e.tut);
    if(iz1&&iz2&&iz2.tm&&!iz2.joined&&performance.now()-iz2.t0>=260){
      iz2.joined=true;iz2.tm=false;e.iki=true;bufCal(GRS,1);e.yatT=S.t;e.sp0=Math.abs(iz1.lx-iz2.lx);e.ripT=0;e.sph=[];
      const mx=(EL.N.wx+EL.F.wx)/2,my=(EL.N.wy+EL.F.wy)/2;e.tx=e.x-mx;e.ty=e.y+e.cy-my;
    }
    return;
  }
  if(!e||!e.iki)return;
  if(!a||!b){e.iki=false;e.tut=null;return}
  const sp=Math.abs(a.lx-b.lx),now=S.t;
  e.sph=e.sph||[];e.sph.push({t:now,sp});while(e.sph.length>1&&now-e.sph[0].t>0.2)e.sph.shift();
  const rate=(sp-e.sph[0].sp)/Math.max(0.05,now-e.sph[0].t);     // parmakların ayrılma hızı (px/sn) = çekişin gücü
  if(sp-e.sp0>Math.max(90,W*0.1)&&S.t>=e.ripT){          // güçlü çekiş: enerji harca, korsanı belden ikiye ayır; yavaş çekişte tutmaya devam eder
    const ger=Math.max(1,Math.ceil(e.hp-1e-9));      // düşmanın o anki canı kadar enerji
    if(enerji(ger))yirt(e,rate);else tutReddet(e);
  }
}
function grabKontrol(dt){
  if(S.sarj>0||S.pence)return;
  if(KOL.N.ak&&KOL.F.ak&&!DUS.some(e=>e.tut)){      // iki el basılı: iki taraftan birden tut
    const hz=EL.N.v<=1100&&EL.F.v<=1100&&KOL.N.e>=0.25&&KOL.F.e>=0.25;
    let en=null;
    if(hz)for(const e of DUS){
      if(e.olu||e.tut||e.boss||e.noTut>S.t)continue;
      if(Math.hypot(EL.N.wx-e.x,EL.N.wy-(e.y+e.cy))<e.r+70&&Math.hypot(EL.F.wx-e.x,EL.F.wy-(e.y+e.cy))<e.r+70){en=e;break}
    }
    if(en){
      DW.iki=(DW.iki||0)+dt;
      if(DW.iki>0.12){
        DW.iki=0;en.tut='N';en.iki=true;bufCal(GRS,1);en.yatT=S.t;en.ripT=0;
        const a=izBul('N'),b=izBul('F');en.sp0=a&&b?Math.abs(a.lx-b.lx):0;
        const mx=(EL.N.wx+EL.F.wx)/2,my=(EL.N.wy+EL.F.wy)/2;en.tx=en.x-mx;en.ty=en.y+en.cy-my;en.vx=en.vy=0;
      }
      return;
    }
    DW.iki=0;
    if(ikiYakin())return;                              // iki el aynı düşmana yaklaşırken tek el tutuşu araya girmez
  }
  for(const k of ['N','F']){
    const h=EL[k];
    if(tutan(k)||varilElde(k)){DW[k]=0;continue}          // bir el bir düşman
    const ac=HS[k]==='ac';
    if(!KOL[k].ak||(!ac&&(KOL[k].e<0.25||h.v>1100))){DW[k]=0;continue}
    let en=null,ed=1e9;
    for(const e of DUS){
      if(e.olu||e.tut||e.boss||(!ac&&e.hitT[k]>S.t)||e.noTut>S.t)continue;
      const d=Math.hypot(h.wx-e.x,h.wy-(e.y+e.cy));
      if((d<e.r+70||(ac&&elDeg(e,k,40)))&&d<ed){ed=d;en=e}      // açık el vücudun herhangi bir yerine değince tutar
    }
    if(!en){DW[k]=0;continue}
    DW[k]+=dt;
    if(ac||DW[k]>0.12){
      en.tut=k;DW[k]=0;bufCal(GRS,1);
      let tx=en.x-h.wx,ty=en.y+en.cy-h.wy;const L=Math.hypot(tx,ty);if(L>200){tx*=200/L;ty*=200/L}
      en.tx=tx;en.ty=ty;en.vx=en.vy=0;
    }
  }
}
function tutBirak(k){
  if(varilBirak(k))return;      // elde varil varsa onu bırakır / fırlatır
  const e=DUS.find(x=>x.tut===k||(x.iki&&x.tut));if(!e)return;
  e.tut=null;e.iki=false;
  const h=EL[k],vx=h.sv.x+S.vx,vy=h.sv.y,v=Math.hypot(vx,vy);
  if(v>800){e.atil=true;const f=kisit((v-800)/5000,0,1);vur(e,Math.round(4+36*f),vx,vy,f);e.vx*=1.3;e.vy*=1.3}   // fırlatma: hıza göre hasar ve uçuş
  else{e.vx=e.vy=0;e.st=S.t+0.5}
}
function olmGuncelle(e,dt){      // ölüm hareketi; yere yattıktan 5 sn sonra söner (true = sil)
  const o=e.olm,z=zemin(e.x),ez=w=>w*w;e.vurT=S.t;      // yüzünde darbe ifadesi
  const yat=a=>{e.dusA=ez(a);e.cy=e.cy0+(110-e.cy0)*e.dusA;if(a>=1){if(!o.ses){o.ses=true;bufCal(DSS,0.9);karBas(e.x,200,KMIN-4,false)}o.yat=o.yat||S.t}};
  if(o.tip==='diz'){e.vx*=Math.pow(0.02,dt);e.x+=e.vx*dt;if(e.y>z){e.vy=(e.vy||0)-G*dt;e.y=Math.max(z,e.y+e.vy*dt)}else{e.y=z;e.vy=0}yat(kisit((S.t-o.t0-0.45)/0.45,0,1))}      // 0.45 sn dizler üstüne çöker, sonra yüzüstü öne düşer
  else if(o.f==='hava'||o.f==='sek'){
    e.vy-=G*dt;let nx=e.x+e.vx*dt;if(zemin(nx)>e.y+30){e.vx*=-0.2;nx=e.x}e.x=nx;e.y+=e.vy*dt;
    if(e.y<=z){e.y=z;
      if(o.f==='hava'){o.f='sek';bufCal(DEVS||DSS,1);tasSac(e.x,2,0.8);titre(30);e.vy=Math.max(450,Math.abs(e.vy)*0.3);e.vx*=0.5}      // kıçının üstüne düşer, seker
      else{o.f='otur';o.t1=S.t;e.vy=0}}
  }else{e.vx*=Math.pow(0.01,dt);e.x+=e.vx*dt;e.y=z;yat(kisit((S.t-o.t1-0.15)/0.45,0,1))}      // oturduğu yerden gövde geri yere düşer
  kolYere(e,dt);      // yatınca kollar havada kalmaz, yere değene kadar iner
  if(o.yat&&!o.tk2&&S.t-o.yat>0.6&&!yereDeg(e)){e.dusA=0;e.cy=e.cy0||e.cy;e.olm={tip:'diz',t0:S.t,yn:e.yon||1,tk2:1};return false}      // ölmüş ama kafası/gövdesi yere değmiyor: dizler üstüne çöküp yere düşer (ölüm ancak yere değince biter)
  if(o.yat&&S.t-o.yat>5){e.ol=(S.t-o.yat-5)/0.6;return e.ol>1}
  return false;
}
function dusmanGuncelle(dt){
  for(let i=DUS.length-1;i>=0;i--){
    const e=DUS[i];e.anim+=dt;if(e.fl>0)e.fl-=dt;
    if(e.kh)kancaGuncelle(e,dt);
    if(e.tut&&!e.olu){
      if(e._tg===undefined){e._tg=S.t;e.kb=null}      // tutulurken 1 sn vurulmazsa kafa atar (çırpınma devam eder); her vuruş sayacı sıfırlar
      if(!e.kb&&S.durum==='oyun'&&S.t-Math.max(e.sonV||0,e._tg)>=(e.iki?2:1))e.kb={t0:S.t,hit:false};
      if(e.kb){
        const u=(S.t-e.kb.t0)/KBDUR;
        if(!e.kb.hit&&u>=0.45){
          e.kb.hit=true;ses('yumruk');
          if(dokunulmaz()&&Math.abs(e.x-S.x)<900){S.hp-=S.blok?5:10;titre(40);S.hitR={t0:S.t,z:'kafa',bk:((e.x-S.x)*S.yon>0)?1:-1}}
        }
        if(u>=1){e.kb=null;e.sonV=S.t}
      }
      if(e.iki){const ek=zEksen(),u=Math.min(1,(S.t-(e.yatT||S.t))/0.45);      // boyun N elinde, kalça F elinde; gövde iki elin eksenine yatar
        e.x=(EL.N.wx+EL.F.wx)/2+ek.ux*13.5;e.y=(EL.N.wy+EL.F.wy)/2+ek.uy*13.5-e.cy;e.phi=u*u*(3-2*u)*ek.phi}
      else{const h=EL[e.tut];e.x=h.wx+e.tx;e.y=h.wy+e.ty-e.cy}
      e.st=S.t+0.3;e.vx=e.vy=0;continue;
    }
    e._tg=undefined;e.kb=null;
    if(e.olu&&e.yerOl){      // yerde ölen: havadaysa düşmeye devam eder, yatışı tamamlanır; 5 sn yatar, sonra söner
      const z=zemin(e.x);if(e.y>z){e.vy=(e.vy||0)-G*dt;e.y=Math.max(z,e.y+e.vy*dt)}else{e.y=z;e.vy=0}
      e.cy0=e.cy0||e.cy;e.dusA=(e.dusA||0)+(1-(e.dusA||0))*Math.min(1,dt*8);e.cy=e.cy0+(110-e.cy0)*e.dusA;
      e.olY=(e.olY||0)+dt;kolYere(e,dt);
      if(e.olY>0.8&&!yereDeg(e)){e.yerOl=false;e.dus=null;e.dusA=0;e.cy=e.cy0;e.olm={tip:'diz',t0:S.t,yn:e.yon||1,tk2:1};continue}      // kafası/gövdesi yere değmiyor: dizler üstüne çöküp düşer
      e.ol=Math.max(0,(e.olY-5)/0.6);if(e.ol>1)DUS.splice(i,1);continue}      // yerde ölen: 5 sn yatar, sonra söner
    if(e.olu&&e.olm){if(olmGuncelle(e,dt))DUS.splice(i,1);continue}
    if(e.olu){e.ol+=dt;e.vy-=G*0.5*dt;e.x+=e.vx*dt;e.y+=e.vy*dt;e.rot+=dt*9*(e.vx<0?-1:1);if(e.ol>0.9)DUS.splice(i,1);continue}
    if(e.dus){const d=e.dus;      // yerde: 0.35 sn'de düşer, yatar, son 0.5 sn'de kalkar; tutulursa hemen kalkar (elle kaldırma)
      if(S.ust&&S.ust.e===e)d.son=Math.max(d.son,S.t+DUS_KALK+0.15);      // üstündeyken kalkamaz
      if(e.tut||S.t>=d.son){e.dus=null;e.cy=e.cy0;e.dusA=0;e.yk=null}
      else{const gs=d.son-DUS_KALK,ez=w=>w*w*(3-2*w);let hd;
        if(S.t>=gs){const g=(S.t-gs)/DUS_KALK;hd=g<0.35?1-0.55*ez(g/0.35):g<0.65?0.45-0.37*ez((g-0.35)/0.3):0.08*(1-ez((g-0.65)/0.35))}      // oturur → tek diz → ayağa kalkar
        else{const u=(S.t-d.t0)/DUS_DUS;if(u>=1&&!d.ses){d.ses=true;bufCal(DSS,0.9)}hd=u<1?u*u:1-0.07*Math.sin(Math.PI*kisit((u-1)/0.35,0,1))}      // hızlanarak düşer, sırtı yere çarpınca hafif seker
        e.dusA=(e.dusA||0)+(hd-(e.dusA||0))*Math.min(1,dt*20);e.cy=e.cy0+(110-e.cy0)*e.dusA;e.st=Math.max(e.st,d.son);kolYere(e,dt)}}
    const stun=S.t<e.st,dx=S.x-e.x,zH=zemin(e.x),yer=e.y<=zH+1;
    if(!e.akt&&(Math.abs(dx)<1500||stun))e.akt=true;               // oyuncu yaklaşınca uyanır (dalga gibi gelmez)
    if(stun||!yer||e.vy>0){                                         // savrulma / havada
      e.moving=false;if(stun){if(e.ka){e[(e.kc==='p'||e.kc==='h')?'mcd':'acd']=e.ka.t0+0.6+Math.random()*0.8}e.ka=null;e.ks=null}      // yarıda kalan vuruşun sayacı vuruş başından işler: durakladığı sürede dolar, süre dolmuşsa hemen vurur
      e.vy-=G*dt;let nx=e.x+e.vx*dt;
      if(zemin(nx)>e.y+30){e.vx*=-0.2;nx=e.x}
      e.x=nx;e.y+=e.vy*dt;e.vx*=Math.pow(yer?0.02:0.5,dt);
      const z=zemin(e.x);if(e.y<=z){if(e.vy<-1500)tasSac(e.x,2,0.8);if(e.atil){e.atil=false;bufCal(DEVS||DSS,1);if(!e.olu&&!e.boss&&!e.dus){e.cy0=e.cy0||e.cy;e.dus={t0:S.t,son:S.t+DUS_DUS+1.5+DUS_KALK,yn:Math.sign(e.vx)||1}}}e.y=z;e.vy=e.vy<-1500?-e.vy*0.25:0}      // fırlatılan yere düşünce yatar
      continue;
    }
    e.vx=e.vy=0;e.y=zH;
    if(e.akt)korsanAI(e,dt,dx);
  }
}
