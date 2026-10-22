'use strict';
// El dünya konumu ve el hızı, ortak durum (EL, DUS, MERMI)

// ---------- Düşmanlar ve dövüş ----------
// Yumruk hızı (elin gövdeye göre hızı) hasarı ve geri fırlatmayı belirler; J/K düğmeleri sabit hasar verir.
Object.assign(S,{hp:100,inv:0,dur:0,sars:0,shx:0,shy:0,durum:'oyun',durumT:0,pops:[],sarj:0,firT:-1,lungeT:-1,lungeS:0,lungeV:0,shoryu:0,shId:0,shArm:'N',shBoth:false,shDiz:'F',slam:false,tats:0,blok:false,blokT:-9,blokDw:0,bossGeldi:false,halka:null,mesaj:'',mesajT:-9,kay:null,sman:null,en:5,noEn:-9,kayCif:-9,dkick:null,sup:null,pend:null});
const ZY=()=>H*0.80, kisit=(v,a,b)=>Math.max(a,Math.min(b,v));
const EL={N:{wx:0,wy:0,px:null,py:null,vx:0,vy:0,v:0,sv:{x:0,y:0}},F:{wx:0,wy:0,px:null,py:null,vx:0,vy:0,v:0,sv:{x:0,y:0}}}, DW={N:0,F:0};
let sonYon=1, DUS=[], MERMI=[];
function dunyaNok(lx,ly){const m=ctx.getTransform(),sx=(m.a*lx+m.c*ly+m.e)/DPR-S.shx,sy=(m.b*lx+m.d*ly+m.f)/DPR-S.shy;return [S.x+(sx-W/2)/SC,S.camY+(ZY()-sy)/SC]}
function elKaydet(ad){            // ön kol uzayında yumruk noktasının dünya konumu
  const m=ctx.getTransform(), lx=248, ly=0, h=EL[ad];
  const sx=(m.a*lx+m.c*ly+m.e)/DPR-S.shx, sy=(m.b*lx+m.d*ly+m.f)/DPR-S.shy;
  h.wx=S.x+(sx-W/2)/SC; h.wy=S.camY+(ZY()-sy)/SC;
}
function elHiz(dt){
  const ok=S.yon===sonYon&&!S.donuyor&&dt>0;
  for(const k of ['N','F']){
    const h=EL[k], rx=h.wx-S.x, ry=h.wy-S.y;
    if(h.px!==null&&ok){h.vx=(rx-h.px)/dt;h.vy=(ry-h.py)/dt;h.v=Math.hypot(h.vx,h.vy)}else{h.vx=h.vy=h.v=0}
    h.sv.x+=(h.vx-h.sv.x)*0.5;h.sv.y+=(h.vy-h.sv.y)*0.5;     // yumuşatılmış el hızı (fırlatma için)
    h.px=rx;h.py=ry;
  }
  sonYon=S.yon;
}
