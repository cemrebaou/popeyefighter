'use strict';
// Ekran bilgisi (enerji ve can tüpleri, kombo no, yazılar)
const TUP={enG:5,hpG:100,dam:[],sonD:-9,kab:[]};      // ekranda görünen enerji/can (yumuşak), düşen kan damlaları, enerji kabarcıkları
function tupGuncelle(dt){
  TUP.enG+=(S.en-TUP.enG)*Math.min(1,dt*8);
  if(S.hp<TUP.hpG||S.hp-TUP.hpG>40){TUP.hpG=Math.max(0,S.hp);TUP.dam.length=0}      // azalınca direkt azalır (yeni oyunda direkt dolar)
  if(Math.floor(S.hp-TUP.hpG-TUP.dam.length+1e-6)>=1&&S.t-TUP.sonD>0.07){TUP.dam.push({y:0,v:200});TUP.sonD=S.t}      // dolan her 1 can = tepeden bir damla
  for(let i=TUP.dam.length-1;i>=0;i--){const d=TUP.dam[i];d.v+=2400*dt;d.y+=d.v*dt;if(d.y>=1-TUP.hpG/100-0.01){TUP.dam.splice(i,1);TUP.hpG=Math.min(S.hp,TUP.hpG+1);TUP.spl=S.t}}      // y: tüp boyuna oran (0 tepe, 1 dip)
  if(Math.random()<dt*3*TUP.enG/5)TUP.kab.push({x:Math.random(),y:1,r:1+Math.random()*1.5,v:0.25+Math.random()*0.3});      // enerji içinde kabarcıklar
  for(let i=TUP.kab.length-1;i>=0;i--){const b=TUP.kab[i];b.y-=b.v*dt;if(b.y<1-TUP.enG/5+0.02)TUP.kab.splice(i,1)}
}
function kapsul(x,y,w,h){const r=w/2;ctx.beginPath();ctx.moveTo(x,y+r);ctx.arc(x+r,y+r,r,Math.PI,0);ctx.lineTo(x+w,y+h-r);ctx.arc(x+r,y+h-r,r,0,Math.PI);ctx.closePath()}
function tupCiz(x,y,w,h,f,c,can,parla,ek){      // c: [koyu kenar, ana renk, açık orta]; can: mantar tıpalı kan şişesi
  f=kisit(f,0,1);ctx.save();
  if(parla){ctx.shadowColor=parla;ctx.shadowBlur=10+5*Math.sin(S.t*8)}
  kapsul(x,y,w,h);ctx.fillStyle='rgba(15,22,30,.55)';ctx.fill();ctx.shadowBlur=0;      // cam içi (boş)
  ctx.save();kapsul(x+2,y+2,w-4,h-4);ctx.clip();
  const ih=h-4,sy=y+2+ih*(1-f),dal=Math.sin(S.t*3+(can?1:0))*1.2;
  const g=ctx.createLinearGradient(x,0,x+w,0);g.addColorStop(0,c[0]);g.addColorStop(0.3,c[2]);g.addColorStop(0.55,c[1]);g.addColorStop(1,c[0]);      // silindir gölgesi
  ctx.fillStyle=g;if(f>0)ctx.fillRect(x,sy,w,y+h-sy);
  if(f>0.005&&f<0.995){ctx.fillStyle=c[2];ctx.globalAlpha=0.8;ctx.beginPath();ctx.ellipse(x+w/2,sy+dal*0.3,w/2-2,2.2,0,0,Math.PI*2);ctx.fill();ctx.globalAlpha=1}      // sıvı yüzeyi (menisküs)
  if(can){for(const d of ek){ctx.fillStyle=c[1];ctx.beginPath();const dy=y+2+ih*d.y;ctx.ellipse(x+w/2,dy,2,3,0,0,Math.PI*2);ctx.fill()}      // tepeden düşen kan damlaları
    if(S.t-(TUP.spl||-9)<0.15){ctx.strokeStyle=c[2];ctx.globalAlpha=1-(S.t-TUP.spl)/0.15;ctx.lineWidth=1;ctx.beginPath();ctx.ellipse(x+w/2,sy,w/2-3,1.5+(S.t-TUP.spl)*20,0,0,Math.PI*2);ctx.stroke();ctx.globalAlpha=1}}
  else for(const b of ek){ctx.fillStyle='rgba(255,255,230,.7)';ctx.beginPath();ctx.arc(x+3+b.x*(w-6),y+2+ih*b.y,b.r,0,Math.PI*2);ctx.fill()}
  ctx.restore();
  const cg=ctx.createLinearGradient(x,0,x+w,0);cg.addColorStop(0,'rgba(255,255,255,.08)');cg.addColorStop(0.22,'rgba(255,255,255,.55)');cg.addColorStop(0.36,'rgba(255,255,255,.05)');cg.addColorStop(0.8,'rgba(255,255,255,0)');cg.addColorStop(0.92,'rgba(255,255,255,.25)');cg.addColorStop(1,'rgba(255,255,255,0)');
  kapsul(x,y,w,h);ctx.fillStyle=cg;ctx.fill();      // cam parlaması
  ctx.lineWidth=2;ctx.strokeStyle='rgba(20,28,36,.9)';ctx.stroke();ctx.lineWidth=1;ctx.strokeStyle='rgba(255,255,255,.3)';kapsul(x+1.5,y+1.5,w-3,h-3);ctx.stroke();
  const kg=ctx.createLinearGradient(x-2,0,x+w+2,0);      // üst kapak: can = mantar tıpa, enerji = metal
  if(can){kg.addColorStop(0,'#5a3418');kg.addColorStop(0.35,'#c08a55');kg.addColorStop(1,'#4a2a12')}else{kg.addColorStop(0,'#555');kg.addColorStop(0.35,'#eee');kg.addColorStop(1,'#444')}
  ctx.fillStyle=kg;ctx.fillRect(x-2,y-7,w+4,9);ctx.strokeStyle='rgba(20,28,36,.9)';ctx.strokeRect(x-2,y-7,w+4,9);
  if(!can){ctx.fillStyle=kg;ctx.fillRect(x-2,y+h-3,w+4,7);ctx.strokeRect(x-2,y+h-3,w+4,7)}
  ctx.restore();
}
function hud(dt){
  if(S.kSon&&S.t-S.kSon.t>0.65&&!S.atk&&!S.kuyruk.length){S.kNo={no:S.kSon.no,t:S.t};kBonus()}      // zincir doğal olarak bitti
  const bw=Math.min(280,W*0.38),bx=(W-bw)/2,by=12;
  ctx.fillStyle='#fff';ctx.font='700 13px Nunito,sans-serif';ctx.textBaseline='middle';
  ctx.lineWidth=3;ctx.strokeStyle='rgba(31,42,51,.9)';ctx.textAlign='left';
  {const t='düşman: '+DUS.filter(e=>!e.olu).length,tx=bx+bw+10,ty=by+4;ctx.strokeText(t,tx,ty);ctx.fillText(t,tx,ty)}
  if(S.kNo&&S.t-S.kNo.t<1.2){const a=Math.min(1,(1.2-(S.t-S.kNo.t))*3);ctx.save();ctx.globalAlpha=a;ctx.font='900 30px Nunito,sans-serif';ctx.textAlign='right';ctx.textBaseline='middle';ctx.lineWidth=5;ctx.strokeStyle='rgba(31,42,51,.95)';ctx.fillStyle='#ffd23f';ctx.strokeText(S.kNo.no,bx-12,by+6);ctx.fillText(S.kNo.no,bx-12,by+6);ctx.restore();ctx.font='700 13px Nunito,sans-serif';ctx.textAlign='left';ctx.lineWidth=3;ctx.textBaseline='middle'}
  tupGuncelle(dt);
  {const tw=16,th=Math.min(300,H*0.42),ty=Math.max(96,H*0.22),ey=by;      // enerji sağda, can solda: dik ince 3D cam tüpler
    tupCiz(W-18-tw,ty,tw,th,TUP.enG/5,['#7a5a08','#e8b51f','#fff3a8'],false,S.t<(S.ispEnT||0)?'#ffd23f':null,TUP.kab);
    tupCiz(18,ty,tw,th,TUP.hpG/100,['#4a0309','#b3121c','#ff6b6b'],true,null,TUP.dam);
    if(S.t-S.noEn<1.0&&Math.floor((S.t-S.noEn)*8)%2===0){ctx.fillStyle='#ff5a4a';ctx.font='900 14px Nunito,sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText('NO ENERGY',W/2,ey+24)}
  }
  const bs=DUS.find(e=>e.boss&&!e.olu);
  if(bs){
    const w2=Math.min(420,W*0.6),x2=(W-w2)/2;
    const by2=74;
    ctx.fillStyle='rgba(31,42,51,.85)';ctx.fillRect(x2-3,by2,w2+6,20);
    ctx.fillStyle='#e8453c';ctx.fillRect(x2,by2+3,w2*Math.max(0,bs.hp/bs.max),14);
    ctx.fillStyle='#fff';ctx.font='700 12px Nunito,sans-serif';ctx.textAlign='center';ctx.fillText('KAPTAN — kafasına vur (shoryuken / aduket)',W/2,by2+10);
  }
  if(S.t-S.mesajT<2){
    ctx.globalAlpha=Math.min(1,2-(S.t-S.mesajT));ctx.textAlign='center';ctx.font='56px Bangers,Impact,sans-serif';ctx.lineWidth=7;ctx.strokeStyle='#1f2a33';
    ctx.strokeText(S.mesaj,W/2,H*0.3);ctx.fillStyle='#ffd36b';ctx.fillText(S.mesaj,W/2,H*0.3);ctx.globalAlpha=1;
  }
  for(let i=S.pops.length-1;i>=0;i--){
    const p=S.pops[i];p.t+=dt;if(p.t>0.8){S.pops.splice(i,1);continue}
    const x=W/2+(p.x-S.x)*SC,y=ZY()-(p.y-S.camY)*SC-p.t*90;
    ctx.globalAlpha=1-p.t/0.8;ctx.font=(22+14*p.f)+'px Bangers,Impact,sans-serif';ctx.textAlign='center';
    ctx.lineWidth=5;ctx.strokeStyle='#fff';ctx.strokeText(p.txt,x,y);ctx.fillStyle='#e8453c';ctx.fillText(p.txt,x,y);ctx.globalAlpha=1;
  }
  if(S.durum!=='oyun'){
    ctx.fillStyle='rgba(31,42,51,.55)';ctx.fillRect(0,0,W,H);
    ctx.textAlign='center';ctx.font='64px Bangers,Impact,sans-serif';ctx.lineWidth=8;ctx.strokeStyle='#1f2a33';
    const t=S.durum==='tamam'?'BÖLÜM TAMAM!':'YENİLDİN';
    ctx.strokeText(t,W/2,H*0.4);ctx.fillStyle=S.durum==='tamam'?'#ffd36b':'#e8453c';ctx.fillText(t,W/2,H*0.4);
    ctx.font='700 18px Nunito,sans-serif';ctx.fillStyle='#fff';ctx.fillText('tekrar oynamak için ekrana dokun',W/2,H*0.4+50);
  }
}
