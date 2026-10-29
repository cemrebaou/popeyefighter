'use strict';
// Varil: yolda durur, elle tutulur (el varile 0.12 sn değince), fırlatılınca çarptığı yerde (düşman / yer) parçalanır: 14 tahta + 3 demir halka sağa sola saçılır
let VAR=[],VPAR=[],VSES_T=-9;      // VAR: variller (x,y = merkez), VPAR: saçılan parçalar
const VDW={N:0,F:0};
const V_OL=0.378,V_PX=0.756,V_W=323,V_MRK=190,V_YUK=70;      // V_YUK: yerdeki varil ayak çizgisinin bu kadar üstünde (iskelenin biraz arkasında durur, ayağa çarpmaz)
// V_OL: orijinal çizim px → birim, V_PX: kayıtlı görsel px → birim, V_W: varil eni, V_MRK: tabandan merkeze
const V_KONUM=[2600,6300,12400,18000,24200,28600,34000];
const V_MAXV=3250;      // (+%25)
const V_CARP=2.0;      // parmak hızı çarpanı: az parmak hızıyla en yüksek hıza ulaşır (en yüksek hız ~1625 parmak hızında)      // fırlatılan varilin en yüksek hızı (hasar fırlatma gücünden hesaplanır, bu sınırdan etkilenmez)
const V_HALKA=[-201,241,432];      // halkaların varil merkezine göre yüksekliği (orijinal px, aşağı +)
function varilKur(){VAR=V_KONUM.map(x=>({x,y:zemin(x)+V_MRK+V_YUK,vx:0,vy:0,rot:0,vr:0,d:'yer',k:null}));VPAR=[]}
const varilElde=k=>VAR.some(v=>v.d==='tut'&&v.k===k);
function vSes(buf,L,B,x,v){
  if(!AC||AC.state!=='running')return;
  const g=kisit(1-Math.abs(x-S.x)/4500,0.2,1)*v;
  if(L)torbaCal(L,B,g);else bufCal(buf,g);
}
function varilBirak(k){            // parmak kalkınca: hızlıysa fırlatır, yavaşsa yere bırakır
  const v=VAR.find(z=>z.d==='tut'&&z.k===k);if(!v)return false;
  const h=EL[k],vx=h.sv.x+S.vx,vy=h.sv.y,sp=Math.hypot(vx,vy);
  v.k=null;
  if(sp>700){v.d='uc';v.f=kisit((sp*1.3-700)/4000,0,1);const s=Math.min(1,V_MAXV/(sp*V_CARP));v.vx=vx*V_CARP*s;v.vy=vy*V_CARP*s;v.vr=(Math.sign(v.vx)||1)*(3+sp/1500)}      // hız sınırlı, hasar gücü aynı
  else{v.d='dus';v.vx=S.vx*0.5;v.vy=0;v.vr=0}
  return true;
}
function varilKir(v){              // ilk çarpma: kırılma sesi, parçalar varilin şeklinden dağılır
  vSes(TCS,null,null,v.x,1);
  const c=Math.cos(v.rot),s=Math.sin(v.rot);
  const ek=(im,rx,ry,demir)=>{      // rx, ry: varil merkezine göre (birim, sağ / aşağı +)
    const d=Math.sign(rx)||(Math.random()<0.5?-1:1);
    VPAR.push({im,x:v.x+rx*c-ry*s,y:v.y-(rx*s+ry*c),vx:v.vx*0.25+rx*5+d*(150+Math.random()*450),vy:500+Math.random()*900+Math.max(0,v.vy)*0.2,
      rot:v.rot,vr:(Math.random()-0.5)*16,demir,sek:0,yat:null,hed:0,vurd:[]});
  };
  for(let i=0;i<14;i++)ek('v_c'+i,(-427.5+(i+0.5)*61.07)*V_OL,60*V_OL,false);
  V_HALKA.forEach((y,i)=>ek('v_h'+i,(Math.random()-0.5)*40,y*V_OL,true));
  VAR.splice(VAR.indexOf(v),1);
  ispDus(v.x,v.y-V_MRK,0.5);      // %50 ıspanak düşer
}
function varilGuncelle(dt){
  for(const k of ['N','F']){        // tutma
    if(S.durum!=='oyun'||!YV('B')||varilElde(k)||tutan(k)){VDW[k]=0;continue}
    const h=EL[k],ac=HS[k]==='ac';if(!KOL[k].ak||(!ac&&(KOL[k].e<0.15||h.v>1600))){VDW[k]=0;continue}
    const v=VAR.find(z=>(z.d==='yer'||z.d==='dus')&&Math.abs(h.wx-z.x)<V_W/2+90&&Math.abs(h.wy-z.y)<V_MRK+110);      // büyük alma alanı: ayaktayken varilin üstüne hafif değmek yeter
    if(!v){VDW[k]=0;continue}
    VDW[k]+=dt;if(ac||VDW[k]>0.06){v.d='tut';v.k=k;v.rot=0;v.vx=v.vy=0;VDW[k]=0;bufCal(GRS,1);if(S.uzan)S.uzan=null}      // eğilip aldıysa varil alınınca ayağa kalkar
  }
  for(let i=VAR.length-1;i>=0;i--){
    const v=VAR[i];
    if(v.d==='yer')continue;
    if(v.d==='tut'){
      if(!KOL[v.k].ak||S.durum!=='oyun'){varilBirak(v.k);continue}
      const h=EL[v.k];v.x=h.wx+S.yon*(V_W/2-20);v.y=h.wy;continue;      // el varilin yanından tutar
    }
    if(v.d==='uc'){      // hızlı fırlatmada düşmanın içinden geçmesin: adım başına en çok ~80 birim ilerler, her adımda çarpışma bakılır
      const n=Math.min(80,Math.max(1,Math.ceil(Math.hypot(v.vx,v.vy)*dt/40))),h=dt/n;
      for(let s=0;s<n;s++){
        v.vy-=G*h;v.x+=v.vx*h;v.y+=v.vy*h;v.rot+=v.vr*h;
        const f=v.f!==undefined?v.f:kisit((Math.hypot(v.vx,v.vy)-700)/4000,0,1);
        const e=DUS.find(e=>{if(e.olu||e.tut)return false;const ust=e.y+(e.dus?e.cy*0.9:e.cy*2);      // düşmanın tüm boyu (kutu): değince çarpar
          return Math.abs(v.x-e.x)<V_W/2+e.r*0.55&&v.y-V_MRK*0.85<ust&&v.y+V_MRK*0.85>e.y});
        if(e){const kf=v.y>e.y+e.cy*1.4,dm=Math.round((15+35*f)*(kf?2:1));vur(e,dm,v.vx,v.vy,f);if(kf){bufCal(VKS,1);S.pops.push({x:e.x,y:e.y+e.cy*2,t:0,txt:dil('kritik'),f:1.3})}varilKir(v);break}      // düşmana çarpınca kırılır
        const zz=zemin(v.x)+V_MRK+V_YUK;
        if(v.y<=zz&&v.tek){v.y=zz;      // tekmelenen varil kırılmaz: seker, yuvarlanır, yavaşlayıp yerde durur (tekrar tekme bekler)
          if(v.vy<-350){v.vy=-v.vy*0.35;v.vx*=0.75;vSes(null,TD,TDBAG,v.x,0.6)}
          else{v.vy=0;const sg=Math.sign(v.vx);v.vx-=sg*Math.min(Math.abs(v.vx),2200*h);v.vr=v.vx/(V_W*0.5);      // yerde yuvarlanır
            if(Math.abs(v.vx)<60){const hd=Math.round(v.rot/(2*Math.PI))*2*Math.PI;v.rot+=(hd-v.rot)*Math.min(1,h*10);if(Math.abs(hd-v.rot)<0.03){v.rot=hd;v.d='yer';v.tek=false;v.vx=v.vy=v.vr=0}}}      // hacıyatmaz gibi hep dik oturur
          if(v.d==='yer')break;continue}
        if(v.y<=zz){v.y=zz;varilKir(v);break}     // yere çarpınca kırılır (fırlatılan)
      }
      continue;
    }
    v.vy-=G*dt;v.x+=v.vx*dt;v.y+=v.vy*dt;v.rot+=v.vr*dt;
    const z=zemin(v.x)+V_MRK+V_YUK;
    if(v.y<=z){v.y=z;v.d='yer';v.vx=v.vy=v.vr=0;v.rot=0;vSes(null,TD,TDBAG,v.x,0.7)}      // bırakılan varil yere oturur
  }
  for(let i=VPAR.length-1;i>=0;i--){
    const p=VPAR[i];
    if(p.yat){p.rot+=(p.hed-p.rot)*Math.min(1,dt*12);if(S.t-p.yat>6)VPAR.splice(i,1);continue}      // yere yatar, 6 sn sonra söner
    p.vy-=G*dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.rot+=p.vr*dt;
    if(p.demir){      // demir halka insana çarpınca ses
      for(const e of DUS){if(e.olu||p.vurd.includes(e))continue;if(Math.hypot(p.x-e.x,p.y-(e.y+e.cy))<e.r+40){p.vurd.push(e);vSes(null,DMR,DMRBAG,p.x,0.9)}}
      if(!p.vurd.includes(S)&&Math.hypot(p.x-S.x,p.y-(S.y+450))<220){p.vurd.push(S);vSes(null,DMR,DMRBAG,p.x,0.9)}
    }
    const z=zemin(p.x)+15;
    if(p.y<=z&&p.vy<0){
      p.y=z;
      if(p.demir)vSes(null,DMR,DMRBAG,p.x,0.8);else if(S.t-VSES_T>0.06){VSES_T=S.t;vSes(null,TD,TDBAG,p.x,0.8)}      // tahta sesleri üst üste binmesin
      if(p.sek<2&&p.vy<-350){p.vy=-p.vy*0.3;p.vx*=0.5;p.vr*=0.5;p.sek++}      // seker
      else{p.vx=p.vy=0;p.yat=S.t;const b=p.demir?0:Math.PI/2;p.hed=b+Math.round((p.rot-b)/Math.PI)*Math.PI}      // yatay yatar (tahta enine, halka düz)
    }
  }
}
function vCiz(im,x,y,rot,a){
  if(!im)return;
  const s=SC*V_PX,w=im.width*s,h=im.height*s,sx=W/2+(x-S.x)*SC,sy=ZY()-(y-S.camY)*SC;
  if(sx<-w-200||sx>W+w+200)return;
  ctx.save();ctx.translate(sx,sy);if(rot)ctx.rotate(rot);if(a<1)ctx.globalAlpha=a;ctx.drawImage(im,-w/2,-h/2,w,h);ctx.restore();
}
let VT=null;      // karakter çizilmeden önceki dünya dönüşümü (eldeki varil karakterin katmanları arasında çizilir)
function varilElCiz(k){const v=VAR.find(z=>z.d==='tut'&&z.k===k);if(!v||!VT)return;ctx.save();ctx.setTransform(VT);ctx.shadowBlur=0;vCiz(R.v_varil,v.x,v.y,v.rot,1);ctx.restore()}      // arka el: elin önünde; ön el: elin arkasında
function varilCiz(on){              // on=false: yerdeki variller (oyuncunun arkasında), on=true: uçan varil ve parçalar (önde); eldeki varil karakterle birlikte çizilir
  for(const v of VAR){const yer=v.d==='yer'||v.d==='dus';if(yer===on||v.d==='tut')continue;vCiz(R.v_varil,v.x,v.y,v.rot,1)}
  if(on)for(const p of VPAR)vCiz(R[p.im],p.x,p.y,p.rot,p.yat?kisit(6-(S.t-p.yat),0,1):1);
}
