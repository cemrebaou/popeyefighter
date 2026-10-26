'use strict';
// Düşman yerleşimi ve yeni oyun
function korsanYap(x,kc){const e={t:'korsan',kc,x,y:zemin(x),vx:0,vy:0,hp:100,max:100,cy:450,r:211,yon:1,anim:Math.random()*9,fl:0,st:0,olu:false,ol:0,rot:0,hitT:{N:0,F:0},wf:0,acd:0,ka:null};if(kc==='h'){e.cy=558;e.r=259}return e}
function dusmanKur(){      // yol boyunca yerleşik korsanlar: k = yumruklu, b = bıçaklı; yolun sonunda kaptan (boss) gelir
  DUS=[];ENPOS=[BOSS_X];varilKur();
  const ekle=(x,kc)=>(ENPOS.push(x),DUS.push(korsanYap(x,kc)));
  [3800,5200,9600,11200,14800,16000,19200,21000,23000,25800,27000,31600,33400,35200].forEach(x=>{ekle(x,'k');DUS[DUS.length-1].hp=DUS[DUS.length-1].max=150});
  [4500,7400,10400,13600,16800,20200,22000,24600,29000,32200,34400].forEach(x=>ekle(x,'b'));
  [8600,15800,23600,30400,37200].forEach(x=>{ekle(x,'h');const e=DUS[DUS.length-1];e.hp=e.max=200;e.cy=558;e.r=259});      // kancacılar
}
function yeniOyun(){YARA.ok=false;ISP=[];ISP_Y=[];ADKD=[];S.yeme=null;S.ust=null;S.dag=null;S.ispEnT=0;S.uzan=null;S.pence=null;MERMI=[];EMER=[];EFL=[];S.hitR=null;S.sarjP=null;S.en=ENMAX;S.antiBek=0;S.tamSif=false;S.tepe=0;BCK.length=0;S.noEn=-9;S.yy=null;S.alk=null;yarikSesDur(S.catlak,0.1);S.catlak=null;S.sman=null;S.dkick=null;S.sup=null;S.pend=null;S.sarj=0;S.shoryu=0;S.slam=false;S.tats=0;S.blok=false;S.bossGeldi=false;S.hp=HPMAX;S.inv=0;S.x=0;S.y=0;S.vx=0;S.vy=0;S.durum='oyun';S.pops.length=0;S.parcalar=[];S.kan=[];S.karP=[];S.leke=[];KAR.fill(KD);CESET.length=0;ZPK.cd=0;zpkTemizle(true);dusmanKur()}
// ---- sesler: kayıtlı ses dosyaları (WebAudio) ----
