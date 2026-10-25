'use strict';
// Menü: sağ üstteki ayarlar düğmesi. Oyun ekranında sadece can barı, yön/zıplama tuşları, ıspanak ve zıpkın kalır;
// ses efektleri, müzik, eğim sensörü (+dengele), tam ekran, dil, kombo listesi, yetenek ağacı ve sürüm bu menünün içindedir. Menü açıkken oyun durur.
let menuAcik=false;
{
  const el=document.getElementById('menu'),btn=document.getElementById('menuB');
  const tg=k=>el.querySelector(`.m_sat[data-k="${k}"] .m_tg`);
  function menuYenile(){
    tg('ses').classList.toggle('ac',!!AYAR.ses);
    tg('muz').classList.toggle('ac',!!AYAR.muz);
    tg('sens').classList.toggle('ac',!!GYRO.ak);
    tg('tam').classList.toggle('ac',!!document.fullscreenElement);
    document.getElementById('m_kal').hidden=!GYRO.ak;
    document.getElementById('m_dilA').textContent=DIL.toUpperCase();
    document.getElementById('m_sur').textContent='POPEYE FIGHTER '+OYUN_SURUM+' · '+CS_OK+'/'+CS_YOK+(CS_HATA?' '+CS_HATA:'');      // ceset teşhisi (geçici)
  }
  window.menuAc=a=>{
    if(a){if(agacAcik)agacAc(false);if(listeAcik)listeAc(false);izler.clear();kizler.clear();KOL.N.ak=false;KOL.F.ak=false;key.sol=key.sag=key.asagi=key.zipla=false;menuYenile()}
    menuAcik=a;el.hidden=!a;btn.classList.toggle('aktif',a);
  };
  btn.addEventListener('click',()=>menuAc(!menuAcik));
  el.addEventListener('click',e=>{if(e.target===el)menuAc(false)});      // panelin dışına dokununca kapanır
  el.querySelectorAll('.m_sat').forEach(r=>r.addEventListener('click',async e=>{
    const k=r.dataset.k;
    if(k==='ses'){AYAR.ses=!AYAR.ses;ayarKaydet()}
    else if(k==='muz'){AYAR.muz=!AYAR.muz;ayarKaydet()}
    else if(k==='sens'){if(e.target.id==='m_kal'){document.getElementById('sifir').click();return}await sensorToggle()}
    else if(k==='tam'){document.getElementById('tam').click();setTimeout(menuYenile,400)}
    else if(k==='dil')dilSonraki();
    menuYenile();
  }));
  document.getElementById('m_kombo').addEventListener('click',()=>{menuAc(false);listeAc(true)});
  document.getElementById('m_yet').addEventListener('click',()=>{menuAc(false);agacAc(true)});
  document.getElementById('m_devam').addEventListener('click',()=>menuAc(false));
  document.addEventListener('fullscreenchange',()=>{if(menuAcik)menuYenile()});
  DIL_DIN.push(()=>{if(menuAcik)menuYenile()});
  addEventListener('keydown',e=>{if(e.key==='Escape'&&menuAcik)menuAc(false)});
}
