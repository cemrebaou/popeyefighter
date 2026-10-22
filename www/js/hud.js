'use strict';
// Ekran bilgisi (enerji, kombo no, yazılar)
function hud(dt){
  if(S.kSon&&S.t-S.kSon.t>0.65&&!S.atk&&!S.kuyruk.length){S.kNo={no:S.kSon.no,t:S.t};kBonus()}      // zincir doğal olarak bitti
  const bw=Math.min(280,W*0.38),bx=(W-bw)/2,by=12;                        // can barı yok: can, karakterin kafasındaki yüzden okunur
  ctx.fillStyle='#fff';ctx.font='700 13px Nunito,sans-serif';ctx.textBaseline='middle';
  ctx.lineWidth=3;ctx.strokeStyle='rgba(31,42,51,.9)';ctx.textAlign='left';
  {const t='düşman: '+DUS.filter(e=>!e.olu).length,tx=bx+bw+10,ty=by+4;ctx.strokeText(t,tx,ty);ctx.fillText(t,tx,ty)}
  if(S.kNo&&S.t-S.kNo.t<1.2){const a=Math.min(1,(1.2-(S.t-S.kNo.t))*3);ctx.save();ctx.globalAlpha=a;ctx.font='900 30px Nunito,sans-serif';ctx.textAlign='right';ctx.textBaseline='middle';ctx.lineWidth=5;ctx.strokeStyle='rgba(31,42,51,.95)';ctx.fillStyle='#ffd23f';ctx.strokeText(S.kNo.no,bx-12,by+6);ctx.fillText(S.kNo.no,bx-12,by+6);ctx.restore();ctx.font='700 13px Nunito,sans-serif';ctx.textAlign='left';ctx.lineWidth=3;ctx.textBaseline='middle'}
  {const sg=5,gap=4,sw=(bw-gap*(sg-1))/sg,ey=by;                          // çift parmak enerjisi: 5 kesikli sarı bar
    for(let i=0;i<sg;i++){
      const x0=bx+i*(sw+gap),f=Math.max(0,Math.min(1,S.en-i));
      ctx.fillStyle='rgba(31,42,51,.8)';ctx.fillRect(x0-1,ey-1,sw+2,10);
      ctx.fillStyle=f>=1?'#ffd23f':'#b8932a';ctx.fillRect(x0,ey,sw*f,8);
    }
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
