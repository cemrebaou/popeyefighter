'use strict';
// Özel hareketler: enerji, kayma, shoryu, iniş, pençe, süpermen, yer yumruğu/yarık, alkış, kasırga, blok, çarpışma
// ---- özel hareketler ----
function enerji(n){if(S.en>=n-1e-6){S.en-=n;return true}S.noEn=S.t;return false}
function donDon(d){S.yon=d;for(const z of izler.values())z.yon=d}
function ciftAtil(yon){           // tek parmak kayması: sadece koşarken (en az max hızın yarısı), koşu hızıyla orantılı uzağa kayar
  if(S.ust||!S.yer||S.shoryu>0||S.tats>0)return;
  const r=Math.min(1,S.vx*yon/HIZ);if(r<0.5)return;
  donDon(yon);
  S.lungeS=S.t;S.lungeT=S.t+0.30;S.lungeV=yon*3400*(0.5+r);S.kay={t0:S.t,T:0.30};S.kayCif=S.t;S.sars=Math.max(S.sars,6);
}
function tutmaVar(){return DUS.some(e=>e.tut)||ikiYakin()||HS.N!=='yum'||HS.F!=='yum'||S.parcalar.some(p=>!p.at)}      // tutuyorken ya da tutmaya çalışırken (el açık) özel hareketler tetiklenmez
function ciftKontrol(){
  const a=izBul('N'),b=izBul('F');
  if(!a||!b||S.sarj>0||S.tats>0||S.durum!=='oyun'||S.t-S.kayCif<0.6)return;
  if(tutmaVar())return;
  const ka=kayma(a,0.15),kb=kayma(b,0.15);
  if(!ka||!kb||izHiz(a,0.12)<800||izHiz(b,0.12)<800)return;
  const ok=k=>k.d>80&&Math.abs(k.dy)<0.9*Math.abs(k.dx)&&k.d/k.yol>0.7;
  if(ok(ka)&&ok(kb)&&ka.dx*kb.dx>0&&Math.abs(ka.dx-kb.dx)<0.6*Math.max(Math.abs(ka.dx),Math.abs(kb.dx))){a.atil=b.atil=true;supermenKay(Math.sign(ka.dx))}
}
function shoryu(iz){              // çok hızlı yukarı sürükleme: tek dizi katlayarak yükselen yumruk; havada ikincisi DİĞER elle ve diğer dizle
  const o=KOL[iz.t==='N'?'F':'N'], both=o.ak&&o.e>0.6&&Math.sin(o.th*D)<-0.5;
  if(S.yer){
    S.shArm=iz.t;S.shBoth=both;S.shDiz=iz.t==='N'?'F':'N';
    S.yer=false;S.vy=-(both?3800:3300);S.vx=iz.yon*450;S.ekstra=1;
  }else if(S.ekstra>0&&!(S.tats>0)){
    S.ekstra--;
    if(S.shoryu>0){S.shArm=S.shArm==='N'?'F':'N';S.shDiz=S.shArm==='N'?'F':'N'}   // eller ve dizler değişir
    else{S.shArm=iz.t;S.shDiz=iz.t==='N'?'F':'N'}
    S.shBoth=false;S.vy=-3000;S.vx=iz.yon*450;
  }else return;
  S.donuyor=false;S.spin=0;S.slam=false;S.shoryu=S.t;S.shId++;GYRO.zipBit=S.t+0.9;
}
function inisGuncelle(){          // havada aşağı sürükleme: tek parmak = çekiş yönüne uçan tekme, iki parmak = süper kahraman inişi
  const q=S.pend;if(!q||S.t<q.t)return;
  S.pend=null;
  if(S.yer||S.slam||S.dkick||S.tats>0)return;
  const o=izBul(q.iz.t==='N'?'F':'N');
  const oAsagi=!!(o&&KOL[o.t].ak&&((KOL[o.t].e>0.25&&Math.sin(KOL[o.t].th*D)>0.2)||(o.ly-o.y0>25&&o.ly-o.y0>0.4*Math.abs(o.lx-o.x0))));   // diğer parmak da aşağı çekiyor (kol açısı ya da ham parmak hareketi)
  if(oAsagi||q.ikinci){      // süper kahraman: hızla iner, yumruk yere
    if(!enerji(1))return;
    S.slam=true;S.vy=Math.max(S.vy,0)+4800;S.donuyor=false;S.shoryu=0;S.vx*=0.3;
  }else{                                                                 // uçan tekme: swipe yönünde, bacak o yöne uzanır
    const L=Math.hypot(q.dx,q.dy)||1,sd=(Math.sign(q.dx)*q.iz.yon)||S.yon;
    const al=kisit(Math.atan2(Math.abs(q.dx),q.dy)/D,8,80), v=4200;
    S.dkick={dir:sd,al,vx:sd*v*Math.abs(q.dx)/L,t0:S.t};
    S.yon=sd;S.vy=v*q.dy/L;S.vx=S.dkick.vx;S.donuyor=false;S.shoryu=0;
  }
}
function zeminVur(g,sabit){
  S.sars=Math.max(S.sars,18*g);titre(Math.round(90*g));
  for(const e of DUS){
    if(e.olu)continue;
    const dx=e.x-S.x,ey=e.y+e.cy-S.y;
    if(Math.abs(dx)<(800+e.r*0.5)*g&&ey>-e.r&&ey<600)vur(e,sabit||Math.round(30*g),(dx>=0?1:-1)*0.6,0.9,0.7*g+0.1,S.y+100);
  }
}
function suplex(k){               // tutulan düşman + hızlı aşağı sürükleme = yere çakma
  const e=DUS.find(x=>x.tut===k||(x.iki&&x.tut));if(!e)return;
  e.iki=false;
  e.tut=null;vur(e,38,0,-1,0.8);
  titre(90);
}
function ozelTus(k){            // PC denemesi: H süpermen, G pençe aç/kapa, B dönen tekme, N yer yumruğu (havada süper kahraman inişi), M Sub-Zero kayması
  if(S.durum!=='oyun'||S.sarj>0||S.sman||S.yy||S.alk||S.tats>0||S.dkick||S.slam||tutmaVar())return;
  if(k==='h')supermenKay(S.yon);
  else if(k==='g'){if(S.pence)penceKapa();else penceAc()}
  else if(k==='b'){if(!enerji(1))return;S.tats=S.t;S.spin=0;S.shoryu=0;S.slam=false;S.donuyor=false;S.vx=S.yon*500;if(S.yer){S.yer=false;S.vy=-900}}
  else if(k==='n'){
    if(S.yer){if(S.t-S.kayCif<0.6||!enerji(1))return;S.yy={t0:S.t,T:0.55,dir:S.yon,hit:false};S.kay=null;S.lungeT=-1;S.vx=0;}
    else{if(!enerji(1))return;S.slam=true;S.vy=Math.max(S.vy,0)+4800;S.donuyor=false;S.shoryu=0;S.vx*=0.3;}
  }
  else if(k==='m')ciftAtil(S.yon);
}
function penceAc(){      // bıçaklar çıkar: eller aşağı savrulur, yarı çömelir, kılıç sesi; enerji 3 kat hızla azalır
  if(S.pence||S.durum!=='oyun')return;if(S.en<0.3){S.noEn=S.t;return}
  S.pence={t0:S.t};bufCal(SWD,1);titre(40);S.sars=Math.max(S.sars,6);
}
function penceKapa(){if(!S.pence)return;S.pence=null;S.ust=null;bufCal(SWD,0.8)}      // bıçaklar geri girer: eski tutabilen yumruklar
const PK=()=>S.pence?2:1;      // pençede yumrukla yapılan vuruşlar 2 kat
// ---- Bıçak modu vuruşları: kol aparkat başı gibi aşağı-geri çekilir, dirsekten ileri saplar (2 kat hızlı) ----
// yumruk = düz karşıya (pd), tekme = aşağı (pa), yukarı çekme = aparkat gibi yukarı (pu); yerdekinin üstündeyken her basış yere saplama (py)
function penceVur(tip,side){
  if(S.atk&&S.kuyruk.length>=2)return;
  if(S.ust){if(S.ust.f!=='diz')return;tip='y'}
  atkIstek('#p'+tip+side);
}
function yerdekineAtla(sx,sy){      // bıçak modunda yerde yatan düşmana dokunulursa üstüne atlar
  if(!S.pence||S.ust||!S.yer||S.durum!=='oyun')return false;
  const wx=S.x+(sx-W/2)/SC,wy=S.camY+(ZY()-sy)/SC;
  const e=DUS.find(z=>z.dus&&!z.olu&&!z.tut&&!z.iki&&(z.dusA||0)>0.6&&Math.abs(wx-z.x)<z.r*2.4&&wy-z.y<z.r*1.8);
  if(!e)return false;
  const yn=e.x>=S.x?1:-1,tx=e.x-yn*120,T=kisit(0.3+Math.abs(tx-S.x)/3000,0.35,0.7);
  S.ust={e,f:'atla',vx:(tx-S.x)/T,yn};S.yon=yn;S.yer=false;S.vy=-0.5*G*T;S.atk=null;S.kuyruk.length=0;S.kay=null;S.lungeT=-1;ziplaCal();
  return true;
}
function ustGuncelle(){      // atlarken düşmanın yanına iner, sonra dizlerinin üstünde kalır; düşman yerde kalır
  const u=S.ust,e=u.e;
  if(!S.pence||e.olu||!e.dus||e.tut||S.durum!=='oyun'){S.ust=null;return}
  S.yon=u.yn;
  if(u.f==='atla'){S.vx=u.vx;if(S.yer){u.f='diz';u.t0=S.t;S.vx=0;titre(40);karBas(S.x,220,KMIN-4,false)}}
  else S.vx=0;
}
function ustKalk(){S.ust=null;S.sonAtk=S.t}      // yukarı çekince kalkar
function supermenKay(dir){        // iki parmak yatay kaydırma: süpermen gibi yatay uçarak ileri yumruk (Sub-Zero kaymasının ~2 katı mesafe)
  if(S.ust||!enerji(1))return;
  donDon(dir);
  S.sman={t0:S.t,T:0.38,dir,ch:0.5};S.lungeT=-1;S.kay=null;S.shoryu=0;S.kayCif=S.t;
  S.sars=Math.max(S.sars,12);
}
function yereKontrol(){           // yerdeyken iki parmak birlikte hızlı aşağı = yer yumruğu (bakılan yöne çatlak)
  if(tutmaVar())return;      // bir şey tutuluyorsa (ya da iki elle tutmaya gidiyorsak) çift el hareketleri tetiklenmez
  const a=izBul('N'),b=izBul('F');
  if(!a||!b||!S.yer||S.ust||S.sarj>0||S.tats>0||S.sman||S.yy||S.alk||S.durum!=='oyun'||S.t-S.kayCif<0.6)return;
  const ka=kayma(a,0.15),kb=kayma(b,0.15);
  if(!ka||!kb||izHiz(a,0.12)<800||izHiz(b,0.12)<800)return;
  const ok=k=>k.dy>70&&Math.abs(k.dx)<0.8*k.dy;
  if(ok(ka)&&ok(kb)){
    a.atil=b.atil=a.sla=b.sla=true;
    if(S.blok||S.t-(S.blokSonT||-9)<0.6){if(!S.pence)penceAc();return}      // guarddan iki parmak aşağı: bıçaklar çıkar (yer yarma çalışmaz)
    if(!enerji(1))return;
    S.yy={t0:S.t,T:0.55,dir:S.yon,hit:false};S.kay=null;S.lungeT=-1;S.vx=0;
  }
}
const CV=1600,CTW=650;      // yarığın açılma hızı (birim/sn) ve bir yarık görselinin dünya genişliği (iki görsel uç uca)
function yarikSesDur(c,t){if(c&&c.src){try{c.g.gain.cancelScheduledValues(AC.currentTime);c.g.gain.setValueAtTime(c.g.gain.value,AC.currentTime);c.g.gain.linearRampToValueAtTime(0,AC.currentTime+t);c.src.stop(AC.currentTime+t+0.05)}catch(_){}c.src=null}}
function yerYumrukVur(m){         // iki yumruk yere iner: vurulan yerde patlama, yarık bakılan yönde açılarak ilerler, yerdeki düşmanları havaya fırlatır
  yarikSesDur(S.catlak,0.2);
  const x=S.x+m.dir*120;
  S.catlak={x,y:zemin(x),dir:m.dir,t0:S.t,len:CTW*4,T:CTW*4/CV+3.3,spT:0};      // 2 kat uzağa yarar
  patlat(x,0.95);bufCal(YAR,1);
  S.sars=Math.max(S.sars,20);titre(100);
}
function catlakGuncelle(){
  const c=S.catlak;if(!c)return;
  const u=S.t-c.t0,d=Math.min(c.len,u*CV);
  if(u>c.T){yarikSesDur(c,0.05);S.catlak=null;return}
  if(d<c.len){if(S.t-c.spT>0.035){c.spT=S.t;const tx=c.x+c.dir*d,ty=zemin(tx)+10;      // açılan ucundan taş ağırlıklı fışkırma
      for(let i=0;i<2;i++)karAt(tx+(Math.random()-0.5)*40,ty,c.dir*(80+Math.random()*420)+(Math.random()-0.5)*300,900+Math.random()*1000,true);
      karAt(tx,ty,(Math.random()-0.5)*600,700+Math.random()*900)}}
  else if(!c.sesB){c.sesB=true;if(AC&&YARS){const src=AC.createBufferSource(),g=AC.createGain();src.buffer=YARS;src.loop=true;g.gain.value=0.9;src.connect(g);g.connect(AC.destination);src.start();c.src=src;c.g=g}}      // yarıldıktan sonra: yarık kaybolana kadar süren ses
  if(!c.sonu&&u>c.T-0.8){c.sonu=true;yarikSesDur(c,0.8)}
  for(const e of DUS){
    if(e.olu||e.catT===c.t0)continue;
    const dx=(e.x-c.x)*c.dir,ey=e.y+e.cy-S.y;
    if(dx>-80&&dx<d&&ey>-e.r&&ey<350+e.r){e.catT=c.t0;vur(e,50*PK(),c.dir*0.25,1,0.85,S.y+100)}
  }
}
function catlakCiz(){      // yarık görseli: vurulan yerden başlar, maskeyle yavaşça ilerleyerek görünür; bir süre kalır, söner
  const c=S.catlak,im=R.yarik;if(!c||!im)return;
  const u=S.t-c.t0,d=Math.min(c.len,u*CV),al=u<c.T-0.8?1:Math.max(0,(c.T-u)/0.8);
  const tw=CTW*SC,th=tw*im.height/im.width;
  ctx.save();ctx.globalAlpha=al;ctx.translate(W/2+(c.x-S.x)*SC,ZY()-(c.y-S.camY)*SC);if(c.dir<0)ctx.scale(-1,1);
  ctx.beginPath();ctx.rect(0,-th,d*SC,th*2);ctx.clip();
  for(let i=0;i*CTW<d;i++)ctx.drawImage(im,i*(tw-1),-th*0.52,tw,th);
  ctx.restore();
}
function alkisKontrol(){          // iki parmak ortaya doğru birleşir = alkış şok dalgası
  if(tutmaVar())return;      // bir şey tutuluyorsa (ya da iki elle tutmaya gidiyorsak) çift el hareketleri tetiklenmez
  const a=izBul('N'),b=izBul('F');
  if(!a||!b||S.ust||S.sarj>0||S.tats>0||S.sman||S.yy||S.alk||S.durum!=='oyun'||S.t-S.kayCif<0.6)return;
  const ka=kayma(a,0.2),kb=kayma(b,0.2);
  if(!ka||!kb||izHiz(a,0.15)<500||izHiz(b,0.15)<500)return;
  const sol=a.lx<b.lx?ka:kb, sag=a.lx<b.lx?kb:ka;
  if(sol.dx>110&&sag.dx<-110&&Math.abs(sol.dy)<0.7*sol.dx&&Math.abs(sag.dy)<0.7*(-sag.dx)){
    a.atil=b.atil=true;a.turn=0;b.turn=0;
    if(!enerji(1))return;
    S.alk={t0:S.t,T:0.75,hit:false};S.vx*=0.2;S.kay=null;S.lungeT=-1;
  }
}
function alkisVur(){
  S.alk.hit=true;S.yer=false;S.vy=-1500;
  S.sars=Math.max(S.sars,22);titre(110);
  for(const e of DUS){
    if(e.olu)continue;
    const dx=e.x-S.x,ey=e.y+e.cy-S.y;
    if(Math.abs(dx)<1000+e.r*0.5&&ey>-e.r&&ey<900)vur(e,50*PK(),(dx>=0?1:-1)*0.9,0.45,0.9,S.y+300);
  }
}
function zitKontrol(){            // iki parmak zıt yöne yatay kayar = kasırga tekmesi
  if(tutmaVar())return;      // bir şey tutuluyorsa (ya da iki elle tutmaya gidiyorsak) çift el hareketleri tetiklenmez
  const a=izBul('N'),b=izBul('F');
  if(!a||!b||S.sarj>0||S.tats>0||S.durum!=='oyun'||Math.abs(a.turn)>1||Math.abs(b.turn)>1)return;
  const ka=kayma(a,0.2),kb=kayma(b,0.2);
  if(ka&&kb&&ka.d>130&&kb.d>130&&ka.dx*kb.dx<0&&(a.lx<b.lx?ka.dx<0:kb.dx<0)&&Math.abs(ka.dy)<0.6*Math.abs(ka.dx)&&Math.abs(kb.dy)<0.6*Math.abs(kb.dx)&&ka.d/ka.yol>0.85&&kb.d/kb.yol>0.85){
    if(!enerji(1)){a.turn=0;b.turn=0;return}
    S.tats=S.t;S.spin=0;S.shoryu=0;S.slam=false;S.donuyor=false;S.vx=S.yon*500;
    if(S.yer){S.yer=false;S.vy=-900}
    a.turn=0;b.turn=0;
  }
}
function blokGuncelle(dt){        // iki parmak ekranda hareketsiz = blok
  const a=izBul('N'),b=izBul('F');
  const ok=!!(a&&b&&S.durum==='oyun'&&S.sarj<=0&&!(S.tats>0)&&Math.abs(a.turn)<1&&Math.abs(b.turn)<1&&KOL.N.e<0.5&&KOL.F.e<0.5&&izHiz(a,0.25)<150&&izHiz(b,0.25)<150&&!DUS.some(e=>e.tut)&&!ikiYakin());
  if(ok){S.blokDw+=dt;if(S.blokDw>0.2&&!S.blok){S.blok=true;S.blokT=S.t}}else{S.blokDw=0;S.blok=false}
  if(S.blok)S.blokSonT=S.t;
}
function carpisma(){              // fırlayan düşman başka düşmana çarpınca ikisi de hasar alır (bowling)
  for(const e of DUS){
    if(e.olu||e.tut||S.t>=e.st)continue;
    const sp=Math.hypot(e.vx,e.vy);if(sp<1500||e.bwT>S.t)continue;
    for(const o of DUS){
      if(o===e||o.olu||o.tut)continue;
      if(Math.hypot(e.x-o.x,(e.y+e.cy)-(o.y+o.cy))<(e.r+o.r)*0.8){
        const f=kisit((sp-1500)/3500,0,1),vx=e.vx,vy=e.vy;
        e.bwT=S.t+0.4;vur(o,10+25*f,vx,vy,f,e.y+e.cy);vur(e,6,-vx*0.3,0.2,0.2);break;
      }
    }
  }
}
