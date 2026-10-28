'use strict';
// Düşman yaraları: vuruldukça canıyla orantılı olarak sadece ten görünen yerlerde (gövde, üst kol, ön kol) yaralar çıkar; can dolunca ters sırayla kaybolur.
// Ten ızgarası dyara_veri.js (DY_GRID, offline). Kaptanda (p) ten yok sayılır: yara çıkmaz. Yara görselleri ve örnek noktaları oyuncununkiyle ortak (yara.js).
const DY_PAR={govde:'govde',ustN:'ust',ustF:'ust',onN:'on',onF:'on'};      // yuva → parça görseli
const DY_M={},DY_HAVUZ=[4,5,6,7,8,9,10,11];      // düşmanda kullanılan yara görselleri (y4-y11)
function dyMaske(ad){
  if(DY_M[ad]!==undefined)return DY_M[ad];const g=DY_GRID[ad];if(!g)return DY_M[ad]=null;
  const t=atob(g.b),u=new Uint8Array(g.w*g.h);for(let i=0;i<u.length;i++)u[i]=(t.charCodeAt(i>>3)>>(7-(i&7)))&1;
  let n=0;for(const v of u)n+=v;
  return DY_M[ad]={gw:g.w,gh:g.h,w:g.w*3,h:g.h*3,u,n};
}
function dyUygun(m,px,py){if(px<0||py<0||px>=m.w||py>=m.h)return false;const gx=px/3|0,gy=py/3|0;return gx<m.gw&&gy<m.gh&&!!m.u[gy*m.gw+gx]}
function dyKur(e){      // bu düşmana özel rastgele yerleşim (ilk vuruşta bir kez)
  const q=e.sk||e.kc||'k',L=[],ad=[],alan={};let top=0;
  for(const s in DY_PAR){const m=dyMaske(q+'_'+DY_PAR[s]);if(!m||m.n<20)continue;ad.push(s);alan[s]=m.n;top+=m.n}
  if(top>0){let hata=0;
    while(hata<600&&L.length<36){
      let r=Math.random()*top,s=ad[0];for(const a of ad){r-=alan[a];if(r<=0){s=a;break}}
      const m=dyMaske(q+'_'+DY_PAR[s]);
      const n=DY_HAVUZ[Math.random()*DY_HAVUZ.length|0];
      const boy=YR_BANT.includes(n)?50:34+Math.random()*34;
      const a=n===10?(Math.random()-0.5)*0.4:(Math.random()-0.5)*2.2,ay=Math.random()<0.5?-1:1,ca=Math.cos(a),sa=Math.sin(a);
      const x=Math.random()*m.w,y=Math.random()*m.h,rr=boy*0.42;
      let iyi=dyUygun(m,x,y);
      if(iyi)for(const o of L)if(o.s===s&&Math.hypot(o.x-x,o.y-y)<o.rr+rr){iyi=false;break}      // üst üste gelmez
      if(iyi)for(const [u,v] of yrNokta(n)){const ux=u*boy*ay,vy=v*boy;if(!dyUygun(m,x+ux*ca-vy*sa,y+ux*sa+vy*ca)){iyi=false;break}}      // yaranın her yeri tende
      if(!iyi){hata++;continue}
      hata=0;L.push({s,n,x,y,boy,a,ay,rr});
    }
    for(let i=L.length-1;i>0;i--){const j=Math.random()*(i+1)|0;[L[i],L[j]]=[L[j],L[i]]}      // görünme sırası rastgele
  }
  return e.yr={L,k:0,c:{},v:{}};
}
function dyGuncelle(e){      // görünen yara sayısı can kaybıyla orantılı; değişince kaplamalar bir kez yeniden çizilir
  if(!e.max||e.kc==='p')return null;
  const yr=e.yr||(e.hp<e.max?dyKur(e):null);if(!yr||!yr.L.length)return null;
  const N=yr.L.length,k=kisit(Math.floor((e.max-Math.max(0,e.hp))/e.max*N+1e-6),0,N);
  if(k===yr.k)return yr;yr.k=k;
  for(const s in DY_PAR){
    const im=R[(e.sk||e.kc||'k')+'_'+DY_PAR[s]];if(!im||!im.width)continue;
    let c=yr.c[s];let var_=false;
    for(let i=0;i<k;i++)if(yr.L[i].s===s){var_=true;break}
    yr.v[s]=var_;if(!var_)continue;
    if(!c){c=yr.c[s]=document.createElement('canvas');c.width=im.width;c.height=im.height}
    const x=c.getContext('2d');x.clearRect(0,0,c.width,c.height);
    for(let i=0;i<k;i++){const o=yr.L[i];if(o.s!==s)continue;const w=YARAI[o.n];if(!w||!w.width)continue;const L=Math.max(w.width,w.height),sc=o.boy/L;
      x.save();x.translate(o.x,o.y);x.rotate(o.a);x.scale(o.ay*sc,sc);x.drawImage(w,-w.width/2,-w.height/2);x.restore()}
    x.globalCompositeOperation='destination-in';x.drawImage(im,0,0);x.globalCompositeOperation='source-atop';      // parçanın dışına taşmaz
    if(s==='ustF'||s==='onF'){x.fillStyle='rgba(40,35,60,.13)';x.fillRect(0,0,c.width,c.height)}      // arkadaki kol koyu
    x.globalCompositeOperation='source-over';
  }
  return yr;
}
function dyCiz(e,s,a){      // korsan parçası çizildikten hemen sonra, aynı bağlantı noktasıyla
  if(!e)return;let yr;try{yr=dyGuncelle(e)}catch(_){e.yr={L:[],k:0,c:{},v:{}};return}
  if(yr&&yr.v[s]&&yr.c[s])ctx.drawImage(yr.c[s],-a[0],-a[1]);
}
