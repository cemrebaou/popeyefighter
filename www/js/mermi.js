'use strict';
// Boss, aduket topu, kaptan mermisi, top/efekt çizimi
function bossKur(){
  S.bossGeldi=true;const x=BOSS_X;
  if(ZOR_N>=1){      // 2. bölümden itibaren boss: kılıç ustası (kaptanın 1.5 katı can/saldırı, çevik)
    S.mesaj='boss_geldi2';S.mesajT=S.t;const hp=Math.round(750*ZK());
    DUS.push({t:'korsan',kc:'b',sk:'m',boss:true,agil:true,bs:1.15,hy:820,vk:1.35,hz:0.75,dm:22,xp:Math.round(200*XPK()),x,y:zemin(x),vx:0,vy:0,hp,max:hp,cy:540,r:255,yon:-1,anim:0,fl:0,st:S.t+1.2,olu:false,ol:0,rot:0,hitT:{N:0,F:0},wf:0,acd:S.t+1.5,ka:null});return}
  S.mesaj='boss_geldi';S.mesajT=S.t;
  DUS.push({t:'korsan',kc:'p',boss:true,bs:1.25,x,y:zemin(x),vx:0,vy:0,hp:Math.round(500*ZK()),max:Math.round(500*ZK()),cy:560,r:265,yon:-1,anim:0,fl:0,st:S.t+1.2,olu:false,ol:0,rot:0,hitT:{N:0,F:0},wf:0,acd:S.t+1.5,ka:null,xp:200});      // boss: tabancalı korsan, %25 büyük
}
function ates(dx,dy,ch,bx,by){    // aduket: topun ele göre yönüne (yukarı/aşağı dahil) gider
  if(!enerji(50)){S.sarj=0;return}
  const L=Math.hypot(dx,dy);let ux=dx/L,uy=dy/L;
  if(!(L>30)){ux=S.yon;uy=0}
  if(Math.abs(ux)>0.15&&Math.sign(ux)!==S.yon)donDon(Math.sign(ux));
  S.firT=S.t+0.4;S.firEl=Math.atan2(uy,Math.abs(ux))/D;S.sarj=0;
  MERMI.push({x:bx,y:by,vx:ux*2800,vy:uy*2800,r:60+120*ch,ch,t:0,hit:new Set()});
  
}
function pAtesle(e){      // namludan oyuncunun kafasına doğru tek mermi; sonra düz devam eder (eğilirsen ıskalar)
  const m=e._u&&e._u[2];if(!m)return;
  const K=KSK[e.sk||'p'],el=e._u[(K.gun&&K.gunNear)?0:1],V=2475;      // tabancayı tutan el (gunNear: tabanca öndeki kolda, 0; yoksa arkadaki kolda, 1)
  let dx=el?m.x-el.x:S.x-m.x,dy=el?m.y-el.y:kafaY()-m.y;      // namlunun gösterdiği yön (el → namlu ucu)
  if(Math.abs(dx)<1&&Math.abs(dy)<1){dx=S.x-m.x;dy=kafaY()-m.y}
  const L=Math.hypot(dx,dy)||1,ang=Math.atan2(dy,dx);
  EMER.push({x:m.x,y:m.y,vx:dx/L*V,vy:dy/L*V,t:0,ang,dm:Math.round((e.bdm||30)*ZK()),k:e.sk==='f'?0.55:1,e:e.sk==='f'?e:null});const fk=e.sk==='f',fo=fk?0:14;EFL.push({x:m.x+Math.cos(ang)*fo,y:m.y+Math.sin(ang)*fo,ang,t:S.t,k:fk?0.45:1,f:fk,e:fk?e:null});      // kadın: patlama tam namlu ucundan, kendi görseli (parca/f_ates)
  bufCal(fk&&FPAT?FPAT:PAT,0.9);S.sars=Math.max(S.sars,3);
}
function emerGuncelle(dt){
  for(let i=EMER.length-1;i>=0;i--){
    const p=EMER[i];p.t+=dt;p.x+=p.vx*dt;p.y+=p.vy*dt;{const u=p.e&&p.t<0.05&&p.e._u&&p.e._u[2];if(u&&S.t-u.t<0.1){p.x=u.x;p.y=u.y}}      // kadın: mermi ilk anda canlı namlu ucundan çıkar (geri tepmede namlu kalksa da altından çıkmaz)
    
    if(p.y<zemin(p.x)||p.t>4||Math.abs(p.x-S.x)>4500){EMER.splice(i,1);continue}
    if(S.durum!=='oyun')continue;
    const ust=(S.yer&&asagiMi())?690:900;      // eğilince kafa hizası mermiden aşağıda kalır
    if(oyuncuDeg(p.x,p.y,15)){
      EMER.splice(i,1);
      if(dokunulmaz()){
        titre(40);
        {S.hp-=(p.dm||14);S.hitR={t0:S.t,z:'kafa',bk:p.vx*S.yon<0?1:-1}}
      }
    }
  }
  for(let i=EFL.length-1;i>=0;i--)if(S.t-EFL[i].t>0.2)EFL.splice(i,1);
}
function emerCiz(){
  const im=R.p_mermi,fm=R.p_ates;
  if(im)for(const p of EMER){const sx=W/2+(p.x-S.x)*SC,sy=ZY()-(p.y-S.camY)*SC,w=im.width*SC*1.35*(p.k||1),h=im.height*SC*1.35*(p.k||1);
    ctx.save();ctx.translate(sx,sy);ctx.rotate(Math.atan2(-p.vy,p.vx));
    for(let k=3;k>=1;k--){ctx.globalAlpha=0.3/k*1.6;ctx.drawImage(im,-w/2-k*w*0.55,-h/2,w*1.4,h*0.8)}      // arkada hız izi
    ctx.globalAlpha=1;ctx.drawImage(im,-w/2,-h/2,w*1.2,h);ctx.restore()}
  for(const f of EFL){const fi=f.f?(R.f_ates||fm):fm;if(!fi)continue;const fa=f.f&&R.f_ates?KSK.f.A.ates:KSK.p.A.ates;{const u=f.e&&f.e._u,m=u&&u[2],g=u&&u[0];if(m&&g&&!f.e.olu&&S.t-m.t<0.1){f.x=m.x;f.y=m.y;f.ang=Math.atan2(m.y-g.y,m.x-g.x)}}      // kadın: ateş namlu ucuna yapışık, namluyla döner
    const sx=W/2+(f.x-S.x)*SC,sy=ZY()-(f.y-S.camY)*SC,u=(S.t-f.t)/0.2;
    ctx.save();ctx.translate(sx,sy);ctx.rotate(-f.ang);ctx.globalAlpha=1-u*u;ctx.globalCompositeOperation='lighter';const k=SC*2.9*(f.k||1)*(0.8+0.5*u);ctx.scale(k,k);ctx.drawImage(fi,-fa[0],-fa[1]);ctx.restore()}
  ctx.globalAlpha=1;
}
function mermiGuncelle(dt){
  adkGuncelle(dt);
  for(let i=MERMI.length-1;i>=0;i--){
    const p=MERMI[i];p.t+=dt;p.x+=p.vx*dt;p.y+=(p.vy||0)*dt;
    if(p.y<zemin(p.x)){S.sars=Math.max(S.sars,6);MERMI.splice(i,1);continue}
    for(const e of DUS){
      if(e.olu||p.hit.has(e))continue;
      if(dusDeg(e,p.x,p.y,p.r*0.8*ADK_O)){p.hit.add(e);e.tut=null;bufCal(ADKC,1);vur(e,50,Math.sign(p.vx)||S.yon,0.25,0.5+0.5*p.ch,p.y)}
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
// ---- Aduket: dönen su girdabı görseli (fx/aduket_su), dönerken iki yana spinli su damlaları (fx/damla, kalın ucu gidiş yönünde) saçar ----
const ADK_M='115,174,221';
const ADK_ISIK=(()=>{const c=document.createElement('canvas');c.width=c.height=128;const x=c.getContext('2d'),g=x.createRadialGradient(64,64,0,64,64,64);
  g.addColorStop(0,'rgba(200,235,255,.7)');g.addColorStop(.45,'rgba('+ADK_M+',.35)');g.addColorStop(1,'rgba('+ADK_M+',0)');
  x.fillStyle=g;x.fillRect(0,0,128,128);return c})();
function adkIsik(sx,sy,G,a){ctx.save();ctx.globalCompositeOperation='lighter';ctx.globalAlpha=a;ctx.drawImage(ADK_ISIK,sx-G,sy-G,G*2,G*2);ctx.restore()}
const ADK_O=0.7;      // aduket görsel boyutu
let ADKD=[];      // saçılan su damlaları (dünya)
function adkDamla(x,y,r,vx,vy,yn,n,kk=1){      // girdabın kenarından teğet yönde (dönüş yönüne) damla fırlar; iki yana da gider
  for(let i=0;i<n;i++){
    if(ADKD.length>140)return;
    const a=Math.random()*Math.PI*2,c=Math.cos(a),s=Math.sin(a),V=700+Math.random()*700,rr=r*(0.75+Math.random()*0.25);
    ADKD.push({x:x+c*rr,y:y+s*rr,vx:vx*0.5+yn*s*V+c*250,vy:vy*0.5-yn*c*V+s*250,t:0,T:0.45+Math.random()*0.35,k:(0.6+Math.random()*0.7)*kk});
  }
}
function adkSic(x,y,yn,n){      // vurulan yerden dalga gibi su fışkırır: yukarı-ileri yelpaze, iki yana da damla (damlalar yarı boyda)
  for(let i=0;i<n;i++){
    if(ADKD.length>140)return;
    const a=Math.PI*(0.1+0.8*Math.random()),V=700+Math.random()*900,sg=Math.random()<0.7?yn:-yn;
    ADKD.push({x:x+(Math.random()-0.5)*30,y:y,vx:Math.cos(a)*V*sg*0.9+yn*200,vy:Math.sin(a)*V+200,t:0,T:0.45+Math.random()*0.35,k:(0.6+Math.random()*0.7)*0.5});
  }
}
let ADK_SRC=null,ADK_DT=0;
function adkSes(ac){      // aduket oluşurken su sesi döngüde çalar, atınca (ya da şarj bitince) kesilir
  if(ac&&!ADK_SRC&&AC&&ADKS&&!DEMO){const src=AC.createBufferSource(),g=AC.createGain();src.buffer=ADKS;src.loop=true;g.gain.value=0.9;src.connect(g);g.connect(SFXC());src.start();ADK_SRC=src}
  else if(!ac&&ADK_SRC){try{ADK_SRC.stop()}catch(_){}ADK_SRC=null}
}
function adkGuncelle(dt){      // mermiGuncelle içinde: damla saçma, hareket, ses
  adkSes(S.sarj>0);
  ADK_DT+=dt;const n=Math.floor(ADK_DT*40);ADK_DT-=n/40;
  if(n>0){
    if(S.sarj>0){const rh=(EL.N.wx*S.yon>=EL.F.wx*S.yon)?EL.N:EL.F;adkDamla(rh.wx,rh.wy,(40+170*S.sarj)*1.1*ADK_O,0,0,S.yon,n)}
    for(const p of MERMI)adkDamla(p.x,p.y,p.r*1.1*ADK_O,p.vx,p.vy||0,p.vx<0?-1:1,n);
  }
  for(let i=ADKD.length-1;i>=0;i--){const d=ADKD[i];d.t+=dt;if(d.t>=d.T){ADKD.splice(i,1);continue}d.vy-=2600*dt;d.x+=d.vx*dt;d.y+=d.vy*dt}
}
function adkGirdap(sx,sy,Rr,rot,a){      // girdap görseli: çizimdeki top kenarı Rr'ye denk gelir (köpükler dışarı taşar)
  const im=R.aduket_su;if(!im)return;const w=Rr*2.5,h=w*im.height/im.width;
  ctx.save();ctx.translate(sx,sy);ctx.rotate(rot);ctx.globalAlpha=a;ctx.drawImage(im,-w/2,-h/2,w,h);ctx.restore();ctx.globalAlpha=1;
}
function adkTop(wx,wy,r,t,a){      // elde büyüyen girdap
  const sx=W/2+(wx-S.x)*SC,sy=ZY()-(wy-S.camY)*SC,Rr=r*SC*1.1*ADK_O;
  if(!R.aduket_su){topCiz(wx,wy,r,t,a);return}
  adkIsik(sx,sy,Rr*(1.9+0.15*Math.sin(t*13)),a*0.4);
  adkGirdap(sx,sy,Rr,t*7*S.yon,a);
}
function adkMermi(p){      // atılan girdap: gidiş yönüne doğru döner, arkada hafif ışık izi
  const sx=W/2+(p.x-S.x)*SC,sy=ZY()-(p.y-S.camY)*SC,Rr=p.r*SC*1.1*ADK_O;
  if(!R.aduket_su){topCiz(p.x,p.y,p.r,S.t,1);return}
  const L=Math.hypot(p.vx,p.vy||0)||1,ux=p.vx/L,uy=-(p.vy||0)/L,yn=ux<0?-1:1;
  for(let i=3;i>=1;i--)adkIsik(sx-ux*i*Rr*0.9,sy-uy*i*Rr*0.9,Rr*(1.5-0.2*i),0.22/i);
  adkGirdap(sx,sy,Rr,S.t*10*yn,1);
}
function adkDamlaCiz(){
  const im=R.damla;if(!im)return;
  for(const d of ADKD){
    const sx=W/2+(d.x-S.x)*SC,sy=ZY()-(d.y-S.camY)*SC,w=95*d.k*SC,h=w*im.height/im.width;
    if(sx<-w||sx>W+w)continue;
    donCiz(im,sx,sy,Math.atan2(-d.vy,d.vx),Math.min(1,(d.T-d.t)/(d.T*0.35)),-w*0.75,-h/2,w,h);      // kalın ucu (sağ) gidiş yönünde
  }
  tabanDon();
}
function efektCiz(){
  if(S.sarj>0){const rh=(EL.N.wx*S.yon>=EL.F.wx*S.yon)?EL.N:EL.F;adkTop(rh.wx,rh.wy,40+170*S.sarj,S.t,1)}      // top, bakılan yöndeki elde büyür
  for(const p of MERMI)adkMermi(p);
  adkDamlaCiz();
  emerCiz();
}
