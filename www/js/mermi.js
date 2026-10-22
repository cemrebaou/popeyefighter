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
function efektCiz(){
  if(S.sarj>0){const rh=(EL.N.wx*S.yon>=EL.F.wx*S.yon)?EL.N:EL.F;topCiz(rh.wx,rh.wy,40+170*S.sarj,S.t,1)}      // top, bakılan yöndeki elde büyür
  for(const p of MERMI){{const L=Math.hypot(p.vx,p.vy)||1;for(let i=3;i>=1;i--)topCiz(p.x-p.vx/L*i*100,p.y-p.vy/L*i*100,p.r*(1-0.18*i),S.t+i,0.35/i*1.5,false)}topCiz(p.x,p.y,p.r,S.t,1)}
  emerCiz();
}
