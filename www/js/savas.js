'use strict';
// Vuruş, isabet kontrolü, tutma, yırtma, düşman güncelleme
function vur(e,dmg,vx,vy,f,hy){
  let krit=false;e.sonV=S.t;e.vurT=S.t;      // vurT: 0.6 sn acı yüzü
        // son vuruş zamanı (tutulu korsan 1 sn vurulmazsa kafa atar)
  if(e.boss){f*=0.25;dmg*=0.5;if(hy!==undefined&&hy>e.y+900){dmg*=3;krit=true}}      // kaptan: kafasına vuruş 3 kat
  dmg=Math.round(dmg);titre(12+Math.round(70*f));
  const olu0=e.olu;e.hp-=dmg;e.fl=0.15;
  if(dmg<9999){const kyn=e.x>=S.x?1:-1,bs=e.bs||1;      // kan her zaman düşmanın gövdesi üzerinde çıkar (boşa giden yumrukta bile)
    const kx=kisit(S.pHx===undefined?e.x-kyn*59*bs:S.pHx,e.x-99*bs,e.x+99*bs),ky=kisit(hy===undefined?e.y+e.cy:hy,e.y+135*bs,e.y+882*bs);
    kanVurus(kx,ky,f,kyn,S.pSes===true);if(e.hp<=0&&!olu0)kanFiskir(kx,ky,kyn,0.8)}
  if(!e.boss)e.st=S.t+0.45+0.5*f;      // kaptan sersemlemez (sadece parry)
  const L=Math.hypot(vx,vy)||1,dx=vx/L+(e.x>=S.x?1:-1)*0.35,dy=vy/L;
  const kb=0.5*(250+2450*kisit(dmg/50,0,1))*(e.boss?0.25:1);      // itme hasarla orantılı
  if(!e.tut){e.vx=dx*kb;e.vy=e.boss?0:dy*kb+250}
  if(!e.boss&&!e.tut&&e.hp>0&&dmg>=25&&dmg<9999){      // ağır vuruş (25+): biraz geri uçup yere düşer; hasar arttıkça yerde sersem kalma uzar
    const yn=e.x>=S.x?1:-1,sr=kisit(0.8+(dmg-25)*0.06,0.8,4);e.cy0=e.cy0||e.cy;
    if(e.dus)e.dus.son=Math.max(e.dus.son,S.t+sr+0.5);else e.dus={t0:S.t,son:S.t+0.35+sr+0.5,yn};
    e.vx=yn*Math.min(Math.abs(e.vx),700);e.vy=Math.min(e.vy,450)}
  else if(e.dus&&!e.tut){e.vx*=0.3;e.vy=Math.min(e.vy,120)}      // yerdeyken hafif vuruş onu fazla oynatmaz
  if(e.hp<=0){e.tut=null;e.olu=true;e.ol=0;e.vx*=1.4;e.vy+=700}
  if(S.pSes)ses(S.pSes==='tekme'?'tekme':'yumruk');
  S.dur=Math.max(S.dur,0.04+0.08*f);S.sars=Math.max(S.sars,4+14*f);
  S.pops.push({x:e.x,y:e.y+e.cy+e.r,t:0,txt:(krit?'KRİTİK -':'-')+dmg,f:krit?1:f});
}
function vurusKontrol(){
  const dugme=S.atk&&!S.atk.tv&&HAREKET[S.atk.ad].p;
  for(const k of ['N','F']){
    const h=EL[k];
    if(S.sarj>0||!(dugme||kolAktif(KOL[k]))||h.v<1500)continue;
    for(const e of DUS){
      if(e.olu||e.hitT[k]>S.t||e.tut===k||e.iki)continue;      // kendi tuttuğuna vurmaz, diğer elle vurabilir
      if(Math.hypot(h.wx-e.x,h.wy-(e.y+e.cy))>e.r+60)continue;
      const f=kisit((h.v-1500)/6000,0,1);
      const kd=kDmg(S.atk);if(kd!==null&&!S.atk.tv)S.cE=e;
      S.pSes=true;S.pHx=h.wx;vur(e,(kd!==null&&!S.atk.tv?kd:5)*PK(),h.vx,h.vy,f,h.wy);S.pSes=false;S.pHx=undefined;e.hitT[k]=S.t+0.4;
    }
  }
  if(S.kay&&S.t<S.kay.t0+S.kay.T&&S.yer){      // Sub-Zero kayması: alçak çelme, havaya fırlatır
    for(const e of DUS){
      if(e.olu||e.kyT===S.kay.t0)continue;
      const dx=(e.x-S.x)*S.yon;
      if(dx<-100||dx>520+e.r*0.7||e.y>S.y+300)continue;
      e.kyT=S.kay.t0;S.pSes='tekme';vur(e,18,S.yon*0.5,1,0.6,S.y+50);S.pSes=false;if(!e.tut){e.vy=1900;e.vx=S.yon*300}      // kayan tekme: yarım zıplama kadar yukarı, çok az ileri
    }
  }
  if(S.sman){                       // süpermen uçuşu: önündeki her şeye çarpar
    const m=S.sman;
    for(const e of DUS){
      if(e.olu||e.smT===m.t0)continue;
      const dx=(e.x-S.x)*m.dir,ey=e.y+e.cy-S.y;
      if(dx>-150&&dx<650+e.r&&ey>-e.r&&ey<1000){e.smT=m.t0;vur(e,50*PK(),m.dir,0.15,0.7+0.3*m.ch,S.y+400)}
    }
  }
  if(S.dkick){                      // uçan tekme: ayak ucu çarptığına sert vurur
    const al=S.dkick.al*D,fx=S.x+S.dkick.dir*Math.sin(al)*430,fy=S.y+398-Math.cos(al)*430;
    for(const e of DUS){
      if(e.olu||e.dkT===S.dkick.t0)continue;
      if(Math.hypot(fx-e.x,fy-(e.y+e.cy))<e.r+130){e.dkT=S.dkick.t0;S.pSes='tekme';vur(e,30,S.dkick.dir,-0.5,0.8,fy);S.pSes=false}
    }
  }
  if(S.tats>0){                     // kasırga: etrafındaki herkese vurur
    for(const e of DUS){
      if(e.olu||e.tsT>S.t)continue;
      const dx=e.x-S.x,ey=e.y+e.cy-S.y;
      if(Math.abs(dx)<480+e.r*0.6&&ey>-e.r&&ey<900){e.tsT=S.t+1.0;vur(e,50,dx>=0?1:-1,0.4,0.5,S.y+400)}
    }
  }
  if(S.shoryu>0&&S.vy<0){           // shoryuken: yükselirken önündeki ve üstündeki düşmanlara sert vurur
    for(const e of DUS){
      if(e.olu||e.shT===S.shId)continue;
      const dx=(e.x-S.x)*S.yon,ey=e.y+e.cy-S.y;
      if(dx>-150&&dx<500+e.r&&ey>-100&&ey<1300){e.shT=S.shId;vur(e,32*PK(),S.yon*0.3,1,0.85,S.y+900)}
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
        if(dx<0||dx>menzil+e.r||ey<-e.r||ey>(tekme?1000:700))continue;
        const kd=kDmg(a);if(kd!==null)S.cE=e;
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
  e.tut=null;e.iki=false;e.noTut=S.t+1.2;e.vx=yn*1900;e.vy=650;e.st=S.t+0.55;e.fl=0.15;
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
      iz2.joined=true;iz2.tm=false;e.iki=true;e.yatT=S.t;e.sp0=Math.abs(iz1.lx-iz2.lx);e.ripT=0;e.sph=[];
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
    const ger=Math.max(1,Math.ceil(e.hp/50-1e-9));      // her 50 can = 1 enerji
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
        DW.iki=0;en.tut='N';en.iki=true;en.yatT=S.t;en.ripT=0;
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
    if(tutan(k)){DW[k]=0;continue}          // bir el bir düşman
    if(!KOL[k].ak||KOL[k].e<0.25||h.v>1100){DW[k]=0;continue}
    let en=null,ed=1e9;
    for(const e of DUS){
      if(e.olu||e.tut||e.boss||e.hitT[k]>S.t||e.noTut>S.t)continue;
      const d=Math.hypot(h.wx-e.x,h.wy-(e.y+e.cy));
      if(d<e.r+70&&d<ed){ed=d;en=e}
    }
    if(!en){DW[k]=0;continue}
    DW[k]+=dt;
    if(DW[k]>0.12){
      en.tut=k;DW[k]=0;
      let tx=en.x-h.wx,ty=en.y+en.cy-h.wy;const L=Math.hypot(tx,ty);if(L>200){tx*=200/L;ty*=200/L}
      en.tx=tx;en.ty=ty;en.vx=en.vy=0;
    }
  }
}
function tutBirak(k){
  const e=DUS.find(x=>x.tut===k||(x.iki&&x.tut));if(!e)return;
  e.tut=null;e.iki=false;
  const h=EL[k],vx=h.sv.x+S.vx,vy=h.sv.y,v=Math.hypot(vx,vy);
  if(v>800){const f=kisit((v-800)/5000,0,1);vur(e,Math.round(4+36*f),vx,vy,f);e.vx*=1.3;e.vy*=1.3}   // fırlatma: hıza göre hasar ve uçuş
  else{e.vx=e.vy=0;e.st=S.t+0.5}
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
          if(dokunulmaz()&&Math.abs(e.x-S.x)<900){S.hp-=S.blok?3:10;S.inv=S.t+1.0;titre(40);S.hitR={t0:S.t,z:'kafa',bk:((e.x-S.x)*S.yon>0)?1:-1}}
        }
        if(u>=1){e.kb=null;e.sonV=S.t}
      }
      if(e.iki){const ek=zEksen(),u=Math.min(1,(S.t-(e.yatT||S.t))/0.45);      // boyun N elinde, kalça F elinde; gövde iki elin eksenine yatar
        e.x=(EL.N.wx+EL.F.wx)/2+ek.ux*13.5;e.y=(EL.N.wy+EL.F.wy)/2+ek.uy*13.5-e.cy;e.phi=u*u*(3-2*u)*ek.phi}
      else{const h=EL[e.tut];e.x=h.wx+e.tx;e.y=h.wy+e.ty-e.cy}
      e.st=S.t+0.3;e.vx=e.vy=0;continue;
    }
    e._tg=undefined;e.kb=null;
    if(e.olu){e.ol+=dt;e.vy-=G*0.5*dt;e.x+=e.vx*dt;e.y+=e.vy*dt;e.rot+=dt*9*(e.vx<0?-1:1);if(e.ol>0.9)DUS.splice(i,1);continue}
    if(e.dus){const d=e.dus;      // yerde: 0.35 sn'de düşer, yatar, son 0.5 sn'de kalkar; tutulursa hemen kalkar (elle kaldırma)
      if(e.tut||S.t>=d.son){e.dus=null;e.cy=e.cy0;e.dusA=0}
      else{const hd=S.t>d.son-0.5?(w=>1-w*w*(3-2*w))(kisit((S.t-(d.son-0.5))/0.5,0,1)):kisit((S.t-d.t0)/0.35,0,1);e.dusA=(e.dusA||0)+(hd-(e.dusA||0))*Math.min(1,dt*14);e.cy=e.cy0+(110-e.cy0)*e.dusA;e.st=Math.max(e.st,d.son)}}
    const stun=S.t<e.st,dx=S.x-e.x,zH=zemin(e.x),yer=e.y<=zH+1;
    if(!e.akt&&(Math.abs(dx)<1500||stun))e.akt=true;               // oyuncu yaklaşınca uyanır (dalga gibi gelmez)
    if(stun||!yer||e.vy>0){                                         // savrulma / havada
      e.moving=false;if(stun){if(e.ka){e[(e.kc==='p'||e.kc==='h')?'mcd':'acd']=e.ka.t0+0.6+Math.random()*0.8}e.ka=null;e.ks=null}      // yarıda kalan vuruşun sayacı vuruş başından işler: durakladığı sürede dolar, süre dolmuşsa hemen vurur
      e.vy-=G*dt;let nx=e.x+e.vx*dt;
      if(zemin(nx)>e.y+30){e.vx*=-0.2;nx=e.x}
      e.x=nx;e.y+=e.vy*dt;e.vx*=Math.pow(yer?0.02:0.5,dt);
      const z=zemin(e.x);if(e.y<=z){if(e.vy<-1500)tasSac(e.x,2,0.8);e.y=z;e.vy=e.vy<-1500?-e.vy*0.25:0}
      continue;
    }
    e.vx=e.vy=0;e.y=zH;
    if(e.akt)korsanAI(e,dt,dx);
  }
}
