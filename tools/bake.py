# Popeye sprite sayfalarından (Adsız tasarım 1 ve 3) oyun atlasını üretir.
# Çıktı: www/assets/popeye.png / popeye.json / popeye_data.js
import json, os
import numpy as np
from PIL import Image
from scipy import ndimage
from seg2 import yukle, segment, rows, D

HEDEF='/home/claude/popeyefighter/www/assets'
SPIN='/root/.claude/uploads/44bdca3f-3d20-5eb2-a194-4572c570329f/d2ab9c58-image.png'
ATLAS_OLCEK=0.84          # ortak ölçek -> atlas pikseli (oyunda sprite 0.5 ile gösterilir)
HEDEF_KAFA=77.0*D         # idle kafa/şapka genişliği (tam çözünürlük px); tüm hareketler buna eşitlenir
BAND=40*D
KAT_EL={'k':1.135}   # önden görünen tekme satırı: boy, 'p' satırı duruşuyla eşitlendi

def kafa(mask):
    ws=[]
    for y in range(min(BAND,mask.shape[0])):
        xs=np.where(mask[y])[0]
        if len(xs): ws.append(xs.max()-xs.min()+1)
    return max(ws) if ws else 0

def bol(R_row, hedef_adet):
    """Birleşik (dokunan) kareleri en dar boşluktan ikiye böler."""
    fs=list(R_row)
    while len(fs)<hedef_adet:
        f=max(fs,key=lambda f:f['box'][2]-f['box'][0])
        fs.remove(f)
        x0,y0,x1,y1=f['box']
        m=np.isin(LAB[y0:y1,x0:x1],[i+1 for i in f['ids']]) if 'xr' not in f else None
        col=m.sum(0).astype(float)
        col=np.convolve(col,np.ones(5)/5,mode='same')
        w=len(col); a,b=int(w*0.3),int(w*0.7)
        cut=x0+a+int(np.argmin(col[a:b]))
        for (xa,xb) in ((x0,cut),(cut,x1)):
            sub=m[:,xa-x0:xb-x0]; ys=np.where(sub.any(1))[0]
            fs.append(dict(box=(xa,y0+ys.min(),xb,y0+ys.max()+1),ids=f['ids'],xr=(xa,xb)))
    fs.sort(key=lambda f:f['box'][0])
    return fs

def kes(a,lab,f):
    x0,y0,x1,y1=f['box']
    sub=np.isin(lab[y0:y1,x0:x1],[i+1 for i in f['ids']])
    if 'xr' in f:
        sub[:, :f['xr'][0]-x0]=False; sub[:, f['xr'][1]-x0:]=False
    m=np.repeat(np.repeat(sub,D,0),D,1)
    crop=a[y0*D:y1*D,x0*D:x1*D].copy()
    crop[~m,3]=0
    ys,xs=np.where(crop[...,3]>20)
    crop=crop[ys.min():ys.max()+1,xs.min():xs.max()+1]
    return crop

def isle(satirlar):
    """satirlar: {ad: [crop,...]} -> {ad: [(PIL, ax, ay)]} kafa genişliğine göre ölçekli."""
    out={}
    for ad,crops in satirlar.items():
        ws=[kafa(c[...,3]>20) for c in crops]
        med=float(np.median(ws)); temiz=[w for w in ws if 0.8*med<=w<=1.2*med]
        med2=float(np.median(temiz)) if temiz else med
        kat=HEDEF_KAFA/med2
        if ad in KAT_EL: kat=KAT_EL[ad]   # kafa ölçümünün güvenilmediği satırlar (önden görünüm)
        print(f'{ad:5s} kafa {med2/D:5.1f} -> ölçek {kat:.3f}  {[round(w/D) for w in ws]}')
        fr=[]
        for c,w in zip(crops,ws):
            r=float(np.clip(med2/w,0.88,1.12)) if (w and 0.8*med2<=w<=1.2*med2) else 1.0
            k=ATLAS_OLCEK/D*kat*r
            im=Image.fromarray(c,'RGBA'); W,H=im.size
            im=im.resize((max(1,round(W*k)),max(1,round(H*k))),Image.LANCZOS)
            al=np.array(im)[...,3]; Hh=al.shape[0]
            ys=np.where(al.max(1)>40)[0]; bot=ys.max()
            band=al[max(0,bot-int(Hh*0.07)):bot+1]; xs=np.where(band.max(0)>40)[0]
            ax=float(xs.mean()) if len(xs) else im.size[0]/2
            fr.append((im,ax,float(bot+1)))
        out[ad]=fr
    return out

satirlar={}
# --- Sayfa 1: idle / yürüme / zıplama / jab
a=yukle(0); LAB,fr=segment(a); R=rows(fr)
jump=sorted(R[2][1]+R[3][1]+R[4][1],key=lambda f:f['box'][0]) if False else None
sol=[f for r in R for f in r[1]]
# satırları y'ye göre ayır: idle(8) walk(7) jump(7: üç küme) back(8) punch(6)
def kume(R,idx): return [f for i in idx for f in R[i][1]]
print('sayfa1 satır sayıları',[len(r[1]) for r in R])
satirlar['idle']=[kes(a,LAB,f) for f in sorted(R[0][1],key=lambda f:f['box'][0])]
satirlar['walk']=[kes(a,LAB,f) for f in sorted(R[1][1],key=lambda f:f['box'][0])]
satirlar['jump']=[kes(a,LAB,f) for f in sorted(kume(R,[2,3,4]),key=lambda f:f['box'][0])]
satirlar['pa']=[kes(a,LAB,f) for f in sorted(R[6][1],key=lambda f:f['box'][0])]
del a
# --- Sayfa 3: saldırılar
a=yukle(1); LAB,fr=segment(a); R=rows(fr)
print('sayfa3 satır sayıları',[len(r[1]) for r in R])
ja=sorted(kume(R,[1,2]),key=lambda f:f['box'][0])
satirlar['ja']=[kes(a,LAB,f) for f in ja]
satirlar['p']=[kes(a,LAB,f) for f in sorted(R[3][1],key=lambda f:f['box'][0])]
k=bol(R[4][1],6); satirlar['k']=[kes(a,LAB,f) for f in k]
m=bol(R[5][1],6); satirlar['m']=[kes(a,LAB,f) for f in m]
del a
for ad,c in satirlar.items(): print(ad,len(c))
anims=isle(satirlar)

# --- Çift zıplama topu (tek kare, merkez çapalı)
sp=Image.open(SPIN).convert('RGBA')
bb=sp.getchannel('A').point(lambda v:255 if v>20 else 0).getbbox(); sp=sp.crop(bb)
GEN=280; sp=sp.resize((GEN,round(sp.size[1]*GEN/sp.size[0])),Image.LANCZOS)

# --- Atlas paketleme
items=[]
for n,fr in anims.items():
    for i,(im,ax,ay) in enumerate(fr): items.append((f'{n}_{i}',im,ax,ay))
items.append(('spin_0',sp,sp.size[0]/2,sp.size[1]/2))
items.sort(key=lambda t:-t[1].size[1])
PAD=2; W=2048; x=y=0; rowh=0; yer={}
for ad,im,ax,ay in items:
    w,h=im.size
    if x+w+PAD>W: x=0; y+=rowh+PAD; rowh=0
    yer[ad]=(x,y); x+=w+PAD; rowh=max(rowh,h)
H=1
while H<y+rowh+PAD: H*=2
atlas=Image.new('RGBA',(W,H),(0,0,0,0)); frames={}; ankor={}
for ad,im,ax,ay in items:
    px,py=yer[ad]; atlas.paste(im,(px,py)); w,h=im.size
    frames[ad]={"frame":{"x":px,"y":py,"w":w,"h":h},"rotated":False,"trimmed":False,
                "spriteSourceSize":{"x":0,"y":0,"w":w,"h":h},"sourceSize":{"w":w,"h":h}}
    ankor[ad]=[round(ax,1),round(ay,1),w,h]
os.makedirs(HEDEF,exist_ok=True)
atlas.save(f'{HEDEF}/popeye.png',optimize=True)
json.dump({"frames":frames,"meta":{"image":"popeye.png","size":{"w":W,"h":H},"scale":"1"}},open(f'{HEDEF}/popeye.json','w'))
sayi={n:len(v) for n,v in anims.items()}; sayi['spin']=1
with open(f'{HEDEF}/popeye_data.js','w') as f:
    f.write('// Otomatik üretildi (tools/bake.py). Elle değiştirme.\n')
    f.write('// POPEYE_KARE: kare grubu -> kare adedi, POPEYE_ANKOR: kare -> [ayakX, ayakY, genişlik, yükseklik] (atlas pikseli)\n')
    f.write('const POPEYE_KARE = '+json.dumps(sayi)+';\n')
    f.write('const POPEYE_ANKOR = '+json.dumps(ankor,separators=(',',':'))+';\n')
print('atlas',W,H,'kare',len(items),os.path.getsize(f'{HEDEF}/popeye.png')//1024,'KB')
