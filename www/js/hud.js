'use strict';
// Ekran bilgisi (can/enerji barı, kalp, kombo no, yazılar)
const BAR={en:5,hp:100};      // ekranda görünen enerji/can (yumuşak)
// Can + enerji barı (sol üst): boş görselin üstüne dolu görseller, eğik uca paralel çizgiyle maskelenir. Kalp: can dolarken atar (küçük kalp görseli + kalp sesi)
const BARG=547,BARY=192,BEG=0.42;      // görsel boyutu, dolum ucunun eğimi
const KALP={on:false,t0:0,n:-1,src:null};
function kalpSesDur(){if(KALP.src){try{KALP.src.stop()}catch(_){}KALP.src=null}}
function kalpGuncelle(){
  const ak=S.durum==='oyun'&&S.hp>0&&S.hp<100&&S.t-(S.hasT||-9)>=(S.regB||3);      // can dolma modu (düşman vurunca / can dolunca biter)
  if(ak&&!KALP.on){KALP.on=true;KALP.t0=S.t;KALP.n=-1}
  if(!ak&&KALP.on){KALP.on=false;kalpSesDur()}
  if(!KALP.on)return false;
  const u=S.t-KALP.t0,n=Math.floor(u/1.5);
  if(n!==KALP.n){KALP.n=n;kalpSesDur();if(AC&&AC.state==='running'&&KALPS){const src=AC.createBufferSource();src.buffer=KALPS;src.connect(AC.destination);src.start();KALP.src=src}}      // her atış: ses çalar
  return u%1.5<0.5;      // sesle kalp küçülür, yarım sn sonra büyür, 1 sn sonra tekrar
}
function barDol(im,f,y0,u0,u1){
  if(!im||f<=0.002)return;
  const uf=u0+(u1-u0)*Math.min(1,f);
  ctx.save();ctx.beginPath();ctx.moveTo(-2,-2);ctx.lineTo(uf+BEG*(y0+2),-2);ctx.lineTo(uf-BEG*(BARY+2-y0),BARY+2);ctx.lineTo(-2,BARY+2);ctx.closePath();ctx.clip();
  ctx.drawImage(im,0,0,BARG,BARY);ctx.restore();
}
function barCiz(dt){
  BAR.en+=(S.en-BAR.en)*Math.min(1,dt*8);
  if(S.hp<BAR.hp||S.hp-BAR.hp>40)BAR.hp=Math.max(0,S.hp);else BAR.hp+=(S.hp-BAR.hp)*Math.min(1,dt*6);      // azalınca direkt, dolarken yumuşak
  const kk=kalpGuncelle();
  if(!R.bar_bos)return;
  const bw=Math.min(360,W*0.42),s=bw/BARG;
  ctx.save();ctx.translate(10,8);ctx.scale(s,s);
  ctx.drawImage(R.bar_bos,0,0,BARG,BARY);
  barDol(R.bar_kir,BAR.hp/100,33,158.9,531.1);      // kırmızı can
  if(S.t<(S.ispEnT||0)){ctx.shadowColor='#ffd23f';ctx.shadowBlur=(8+4*Math.sin(S.t*8))*s*DPR}      // ıspanak sonrası enerji parlar
  barDol(R.bar_tur,BAR.en/5,92.5,174.6,485.6);      // ince enerji
  ctx.shadowBlur=0;
  if(kk&&R.bar_kalp)ctx.drawImage(R.bar_kalp,0,0,BARG,BARY);      // küçük kalp
  ctx.restore();
}
function hud(dt){
  if(S.kSon&&S.t-S.kSon.t>0.65&&!S.atk&&!S.kuyruk.length){S.kNo={no:S.kSon.no,t:S.t};kBonus()}      // zincir doğal olarak bitti
  const bw=Math.min(280,W*0.38),bx=(W-bw)/2,by=12;
  ctx.fillStyle='#fff';ctx.font='700 13px Nunito,sans-serif';ctx.textBaseline='middle';
  ctx.lineWidth=3;ctx.strokeStyle='rgba(31,42,51,.9)';ctx.textAlign='left';
  {const t='düşman: '+DUS.filter(e=>!e.olu).length,tx=bx+bw+10,ty=by+4;ctx.strokeText(t,tx,ty);ctx.fillText(t,tx,ty)}
  if(S.kNo&&S.t-S.kNo.t<1.2){const a=Math.min(1,(1.2-(S.t-S.kNo.t))*3);ctx.save();ctx.globalAlpha=a;ctx.font='900 30px Nunito,sans-serif';ctx.textAlign='right';ctx.textBaseline='middle';ctx.lineWidth=5;ctx.strokeStyle='rgba(31,42,51,.95)';ctx.fillStyle='#ffd23f';const nx=Math.max(bx-12,Math.min(360,W*0.42)+60);ctx.strokeText(S.kNo.no,nx,by+6);ctx.fillText(S.kNo.no,nx,by+6);ctx.restore();ctx.font='700 13px Nunito,sans-serif';ctx.textAlign='left';ctx.lineWidth=3;ctx.textBaseline='middle'}
  barCiz(dt);
  if(S.t-S.noEn<1.0&&Math.floor((S.t-S.noEn)*8)%2===0){ctx.fillStyle='#ff5a4a';ctx.font='900 14px Nunito,sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText('NO ENERGY',W/2,by+24)}
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
