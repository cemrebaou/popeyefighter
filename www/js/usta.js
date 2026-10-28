'use strict';
// Kılıç ustası (2. bölüm boss'u, e.agil): kıpır kıpır. Vurulunca bazen geri takla / küçük geri sıçrama, oyuncunun saldırısına karşı bazen eğilir, zıplar, geri çekilir
// (kaçışın ilk 0.32 sn'sinde vuruş ıskalar: KAÇTI). Kaçıştan sonra sık sık öne atlayıp kılıç savurur; kendi saldırısını bitirince bazen havaya sıçrar.
const USTA_CD=1.4;      // iki kaçış / atılma arası en az bekleme (sn)
function ustaBaslat(e,tip,aw){      // aw: oyuncudan uzaklaşma yönü (1 / -1)
  e.ag={tip,t0:S.t,T:0.6};e.ka=null;e.ks=null;e.flip=null;
  if(tip==='flip'){e.vx=aw*1500;e.vy=1750;e.ag.T=0.62;e.flip={t0:S.t,T:0.62}}      // geri takla
  else if(tip==='hop'){e.vx=aw*1000;e.vy=1150;e.ag.T=0.4}      // küçük geri sıçrama
  else if(tip==='jump'){e.vx=aw*250;e.vy=1950;e.ag.T=0.7}      // dikey kaçış
  else if(tip==='leap'){e.vx=-aw*1800;e.vy=1450;e.ag.T=0.6;e.ka={seq:['B'],i:0,k:'B',t0:S.t,hit:false};e.kSes=false}      // öne atlayıp kılıç savurur
  else if(tip==='egil'){e.ag.T=0.6+Math.random()*0.3;e.cyB=e.cyB||e.cy;e.cy=e.cyB*0.72}      // eğilir: vücut alçalır (yüksek vuruşlar ıskalar)
  e.evT=S.t+USTA_CD;
}
function ustaKacti(e){      // kaçışın ilk anında gelen vuruş ıskalar
  const a=e.ag;if(!a||a.tip==='egil'||a.tip==='leap'||S.t-a.t0>0.32)return false;
  S.pops.push({x:e.x,y:e.y+e.cy+e.r,t:0,txt:dil('kacti'),f:0.6});return true;
}
function ustaVurdu(e){      // vurulunca %38 şansla geri takla / sıçrama
  if(e.olu||e.hp<=0||e.tut||(e.ag&&e.ag.tip!=='egil')||S.t<(e.evT||0))return;
  if(Math.random()<0.38)ustaBaslat(e,Math.random()<0.55?'flip':'hop',e.x>=S.x?1:-1);
}
function ustaTehdit(e,ad){      // oyuncu yakında saldırıyor mu (vuruş, özel hareket ya da hızlı el)
  if(ad>900)return false;
  if(S.atk||S.shoryu>0||S.slam||S.sup||S.dkick||S.sman||S.alk)return true;
  for(const k of ['N','F']){const h=EL[k];if(h.v>1300&&Math.hypot(h.wx-e.x,h.wy-(e.y+e.cy))<e.r+650)return true}
  return false;
}
function ustaKontrol(e,dt,dx,stun,yer){      // her karede (dusmanGuncelle): kaçış durumları ve yeni hareket kararları
  if(e.olu||e.tut||e.dus)return;
  const ad=Math.abs(dx),aw=e.x>=S.x?1:-1,a=e.ag;
  if(e.cyB&&!(a&&a.tip==='egil')){e.cy=e.cyB;e.cyB=0}      // eğilme bitti
  if(a){
    const u=S.t-a.t0;
    if(a.tip==='egil'){if(u>=a.T||stun)e.ag=null;return}
    if(u>0.2&&yer&&e.vy<=0){      // indi
      e.ag=null;e.flip=null;
      if(a.tip!=='leap'&&!stun&&S.durum==='oyun'&&ad>380&&ad<1300&&Math.random()<0.55)ustaBaslat(e,'leap',aw);      // karşı atak: öne atlayıp vurur
    }
    return;
  }
  if(stun||!yer||S.durum!=='oyun'||!e.akt)return;
  const th=ustaTehdit(e,ad);
  if(th&&!e._th&&S.t>=(e.evT||0)){
    e._th=true;
    if(Math.random()<0.5){const r=Math.random(),yak=ad<380;
      ustaBaslat(e,yak?(r<0.45?'hop':r<0.8?'flip':'jump'):(r<0.35?'egil':r<0.6?'hop':r<0.8?'jump':'flip'),aw);return}
  }else if(!th)e._th=false;
  if(e._ka&&!e.ka&&S.t>=(e.evT||0)&&Math.random()<0.45){e._ka=false;ustaBaslat(e,Math.random()<0.6?'jump':'hop',aw);return}      // vuruşu bitirir bitirmez havaya sıçrar
  e._ka=!!e.ka;
  if(!e.ka&&ad>520&&ad<950&&S.t>=(e.leapT||0)&&S.t>=(e.evT||0)&&Math.random()<dt*1.2){e.leapT=S.t+2.2+Math.random()*1.5;ustaBaslat(e,'leap',aw)}      // uzaktan öne atılır
}
