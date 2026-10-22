'use strict';
// Boss, aduket topu, kaptan mermisi, top/efekt çizimi
function bossKur(){
  S.bossGeldi=true;S.mesaj='KAPTAN!';S.mesajT=S.t;
  const x=BOSS_X;
  DUS.push({t:'korsan',kc:'p',boss:true,bs:1.25,x,y:zemin(x),vx:0,vy:0,hp:500,max:500,cy:560,r:265,yon:-1,anim:0,fl:0,st:S.t+1.2,olu:false,ol:0,rot:0,hitT:{N:0,F:0},wf:0,acd:S.t+1.5,ka:null});      // boss: tabancalı korsan, %25 büyük
}
function ates(dx,dy,ch,bx,by){    // aduket: topun ele göre yönüne (yukarı/aşağı dahil) gider
  if(!enerji(1)){S.sarj=0;return}
  const L=Math.hypot(dx,dy);let ux=dx/L,uy=dy/L;
  if(!(L>30)){ux=S.yon;uy=0}
  if(Math.abs(ux)>0.15&&Math.sign(ux)!==S.yon)donDon(Math.sign(ux));
  S.firT=S.t+0.4;S.firEl=Math.atan2(uy,Math.abs(ux))/D;S.sarj=0;
  MERMI.push({x:bx,y:by,vx:ux*2800,vy:uy*2800,r:60+120*ch,ch,t:0,hit:new Set()});
  
}
function pAtesle(e){      // namludan oyuncunun kafasına doğru tek mermi; sonra düz devam eder (eğilirsen ıskalar)
  const m=e._u&&e._u[2];if(!m)return;
  const el=e._u[1],V=2475;      // tabancayı tutan el (arkadaki kol)
  let dx=el?m.x-el.x:S.x-m.x,dy=el?m.y-el.y:kafaY()-m.y;      // namlunun gösterdiği yön (el → namlu ucu)
  if(Math.abs(dx)<1&&Math.abs(dy)<1){dx=S.x-m.x;dy=kafaY()-m.y}
  const L=Math.hypot(dx,dy)||1,ang=Math.atan2(dy,dx);
  EMER.push({x:m.x,y:m.y,vx:dx/L*V,vy:dy/L*V,t:0,ang,dm:30});EFL.push({x:m.x+Math.cos(ang)*14,y:m.y+Math.sin(ang)*14,ang,t:S.t});
  bufCal(PAT,0.9);S.sars=Math.max(S.sars,3);
}
function emerGuncelle(dt){
  for(let i=EMER.length-1;i>=0;i--){
    const p=EMER[i];p.t+=dt;p.x+=p.vx*dt;p.y+=p.vy*dt;
    if(p.y<zemin(p.x)||p.t>4||Math.abs(p.x-S.x)>4500){EMER.splice(i,1);continue}
    if(S.durum!=='oyun')continue;
    const ust=(S.yer&&asagiMi())?690:900;      // eğilince kafa hizası mermiden aşağıda kalır
    if(Math.abs(p.x-S.x)<80&&p.y>S.y+60&&p.y<S.y+ust){
      EMER.splice(i,1);
      if(dokunulmaz()){
        S.inv=S.t+1.0;titre(40);
        if(S.blok){S.hp-=4}else{S.hp-=(p.dm||14);S.hitR={t0:S.t,z:'kafa',bk:p.vx*S.yon<0?1:-1}}
      }
    }
  }
  for(let i=EFL.length-1;i>=0;i--)if(S.t-EFL[i].t>0.2)EFL.splice(i,1);
}
function emerCiz(){
  const im=R.p_mermi,fm=R.p_ates;
  if(im)for(const p of EMER){const sx=W/2+(p.x-S.x)*SC,sy=ZY()-(p.y-S.camY)*SC,w=im.width*SC*1.35,h=im.height*SC*1.35;
    ctx.save();ctx.translate(sx,sy);ctx.rotate(Math.atan2(-p.vy,p.vx));
    for(let k=3;k>=1;k--){ctx.globalAlpha=0.3/k*1.6;ctx.drawImage(im,-w/2-k*w*0.55,-h/2,w*1.4,h*0.8)}      // arkada hız izi
    ctx.globalAlpha=1;ctx.drawImage(im,-w/2,-h/2,w*1.2,h);ctx.restore()}
  if(fm)for(const f of EFL){const sx=W/2+(f.x-S.x)*SC,sy=ZY()-(f.y-S.camY)*SC,u=(S.t-f.t)/0.2;
    ctx.save();ctx.translate(sx,sy);ctx.rotate(-f.ang);ctx.globalAlpha=1-u*u;ctx.globalCompositeOperation='lighter';const k=SC*2.9*(0.8+0.5*u);ctx.scale(k,k);ctx.drawImage(fm,-KSK.p.A.ates[0],-KSK.p.A.ates[1]);ctx.restore()}
  ctx.globalAlpha=1;
}
function mermiGuncelle(dt){
  for(let i=MERMI.length-1;i>=0;i--){
    const p=MERMI[i];p.t+=dt;p.x+=p.vx*dt;p.y+=(p.vy||0)*dt;
    if(p.y<zemin(p.x)){S.sars=Math.max(S.sars,6);MERMI.splice(i,1);continue}
    for(const e of DUS){
      if(e.olu||p.hit.has(e))continue;
      if(Math.hypot(p.x-e.x,p.y-(e.y+e.cy))<e.r+p.r*0.8){p.hit.add(e);e.tut=null;vur(e,50,Math.sign(p.vx)||S.yon,0.25,0.5+0.5*p.ch,p.y)}
    }
    if(p.t>1.6||Math.abs(p.x-S.x)>4500||Math.abs(p.y-S.y)>3500)MERMI.splice(i,1);
  }
}
const TOP=(()=>{                  // enerji topu ışıması: bir kez çizilip hazır resim olarak kullanılır (her karede gradyan yok)
  const c=document.createElement('canvas');c.width=c.height=128;const x=c.getContext('2d');
  const g=x.createRadialGradient(64,64,0,64,64,64);
  g.addColorStop(0,'rgba(255,255,255,1)');g.addColorStop(.35,'rgba(150,230,255,.95)');g.addColorStop(.7,'rgba(60,140,255,.55)');g.addColorStop(1,'rgba(60,140,255,0)');
  x.fillStyle=g;x.fillRect(0,0,128,128);return c;
})();
function topCiz(wx,wy,r,t,a,kivilcim=true){
  const sx=W/2+(wx-S.x)*SC,sy=ZY()-(wy-S.camY)*SC,R=r*SC;
  ctx.globalAlpha=a;
  ctx.drawImage(TOP,sx-R,sy-R,R*2,R*2);
  if(!kivilcim){ctx.globalAlpha=1;return}
  ctx.strokeStyle='rgba(255,255,255,.85)';ctx.lineWidth=2;ctx.beginPath();
  for(let i=0;i<5;i++){const an=t*6+i*1.2566,l1=R*0.5,l2=R*(0.8+0.2*Math.sin(t*20+i));ctx.moveTo(sx+Math.cos(an)*l1,sy+Math.sin(an)*l1);ctx.lineTo(sx+Math.cos(an)*l2,sy+Math.sin(an)*l2)}
  ctx.stroke();ctx.globalAlpha=1;
}
// ---- Aduket görseli: kullanıcı görselleri (top, izli top) + krem/mavi ışık; parlamalar bir kez hazırlanır (mobil için her karede blur yok) ----
const ADK_K='253,251,232',ADK_M='115,174,221',ADK_IZ={cx:919,cy:305,r:160};      // izli görselde topun merkezi ve yarıçapı (1100 genişlikte)
const ADK_ISIK=(()=>{const c=document.createElement('canvas');c.width=c.height=128;const x=c.getContext('2d'),g=x.createRadialGradient(64,64,0,64,64,64);
  g.addColorStop(0,'rgba('+ADK_K+',.95)');g.addColorStop(.3,'rgba('+ADK_K+',.6)');g.addColorStop(.55,'rgba('+ADK_M+',.45)');g.addColorStop(1,'rgba('+ADK_M+',0)');
  x.fillStyle=g;x.fillRect(0,0,128,128);return c})();
function adkHazir(n){      // görselin etrafı mavi + krem parlamalı, hafif bulanık hâlesi olan hazır kopyası
  const k='_p_'+n;if(R[k])return R[k];const im=R[n];if(!im)return null;
  const p=Math.round(Math.max(im.width,im.height)*0.08),c=document.createElement('canvas');c.width=im.width+2*p;c.height=im.height+2*p;const x=c.getContext('2d');
  try{x.filter='blur('+Math.round(p*0.35)+'px)';x.globalAlpha=0.7;x.drawImage(im,p,p);x.filter='none'}catch(_){}      // yumuşak hâle
  x.globalAlpha=1;x.shadowColor='rgb('+ADK_M+')';x.shadowBlur=p*0.9;x.drawImage(im,p,p);
  x.shadowColor='rgb('+ADK_K+')';x.shadowBlur=p*0.3;x.globalAlpha=0.85;x.drawImage(im,p,p);
  return R[k]={c,p};
}
function adkIsik(sx,sy,G,a){ctx.save();ctx.globalCompositeOperation='lighter';ctx.globalAlpha=a;ctx.drawImage(ADK_ISIK,sx-G,sy-G,G*2,G*2);ctx.restore()}
function adkTop(wx,wy,r,t,a){      // elde büyüyen top: dönen görsel, nabız gibi atan ışık
  const sx=W/2+(wx-S.x)*SC,sy=ZY()-(wy-S.camY)*SC,Rr=r*SC*1.1,g=adkHazir('aduket_top');
  if(!g){topCiz(wx,wy,r,t,a);return}
  adkIsik(sx,sy,Rr*(2.2+0.2*Math.sin(t*13)),a*0.6);
  const s=2*Rr/R.aduket_top.width;
  ctx.save();ctx.translate(sx,sy);ctx.rotate(t*5);ctx.scale(s,s);ctx.globalAlpha=a*0.92;ctx.drawImage(g.c,-g.c.width/2,-g.c.height/2);ctx.restore();
  adkIsik(sx,sy,Rr*0.9,a*(0.35+0.15*Math.sin(t*21)));      // ortadaki parlak çekirdek
  ctx.globalAlpha=1;
}
function adkMermi(p){      // atılan top: izli görsel topa yapışık, gidiş yönüne döner; arkada ekstra ışık izi
  const g=adkHazir('aduket_iz'),sx=W/2+(p.x-S.x)*SC,sy=ZY()-(p.y-S.camY)*SC,Rr=p.r*SC*1.1;
  if(!g){const L=Math.hypot(p.vx,p.vy)||1;for(let i=3;i>=1;i--)topCiz(p.x-p.vx/L*i*100,p.y-p.vy/L*i*100,p.r*(1-0.18*i),S.t+i,0.35/i*1.5,false);topCiz(p.x,p.y,p.r,S.t,1);return}
  const L=Math.hypot(p.vx,p.vy)||1,ux=p.vx/L,uy=-p.vy/L,u=Math.min(1,p.t/0.12);
  for(let i=4;i>=1;i--)adkIsik(sx-ux*i*Rr*0.95,sy-uy*i*Rr*0.95,Rr*(1.7-0.22*i),0.32*u/i);      // ışık izi
  adkIsik(sx,sy,Rr*(2.3+0.2*Math.sin(S.t*15)),0.55);
  const yn=ux<0?-1:1,s=Rr/ADK_IZ.r;
  ctx.save();ctx.translate(sx,sy);ctx.scale(yn,1);ctx.rotate(Math.atan2(uy,ux*yn));ctx.scale(s,s);ctx.globalAlpha=0.88*u;
  ctx.drawImage(g.c,-(ADK_IZ.cx+g.p),-(ADK_IZ.cy+g.p));ctx.restore();
  if(u<1)adkTop(p.x,p.y,p.r,S.t,1-u);      // çıkışta top yavaşça izli görsele döner
  adkIsik(sx,sy,Rr*0.85,0.3+0.12*Math.sin(S.t*23));
  ctx.globalAlpha=1;
}
function efektCiz(){
  if(S.sarj>0){const rh=(EL.N.wx*S.yon>=EL.F.wx*S.yon)?EL.N:EL.F;adkTop(rh.wx,rh.wy,40+170*S.sarj,S.t,1)}      // top, bakılan yöndeki elde büyür
  for(const p of MERMI)adkMermi(p);
  emerCiz();
}
