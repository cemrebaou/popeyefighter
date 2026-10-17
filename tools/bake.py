# Popeye satır görsellerinden (idle, walk, jump, p, pa) oyun atlasını üretir. tools/bake.py olarak saklanır.
# Tek ölçek kuralı: her satır, idle karelerindeki kafa genişliğine göre TEK çarpanla ölçeklenir
# (satır içinde kare kare ayarlama yok), böylece vuruşlar arasında boyut oynamaz.
import json, os, itertools
import numpy as np
from PIL import Image
from scipy import ndimage
Image.MAX_IMAGE_PIXELS=None

UP='/root/.claude/uploads/44bdca3f-3d20-5eb2-a194-4572c570329f/'
SATIRLAR={            # ad: (dosya, kare adedi)
  'idle': ('5b3238e8-image.png',8),
  'walk': ('0178d673-image.png',7),
  'jump': ('58c942ef-image.png',7),
  'p':    ('d1ec9286-image.png',6),
  'pa':   ('d2e77140-image.png',6),
}
SPIN=UP+'d2ab9c58-image.png'
HEDEF='/home/claude/popeyefighter/www/assets'
D=4
IDLE_BOY=480.0        # idle karesinin atlas pikseli cinsinden boyu
BAND=40*D             # kafa genişliği ölçümü: siluetin en üst satırları
SPIN_GEN=273          # çift zıplama topu genişliği (atlas px) -> oyunda ~50 birim

def kafa(mask):
    ws=[]
    for y in range(min(BAND,mask.shape[0])):
        xs=np.where(mask[y])[0]
        if len(xs): ws.append(xs.max()-xs.min()+1)
    return max(ws) if ws else 0

def parcalar(w, hedef):
    """Bileşen genişliklerine (w) toplam 'hedef' kare dağıtır; kare başına genişlik farkını en aza indirir."""
    n=len(w); en=None
    for ks in itertools.product(range(1,hedef-n+2),repeat=n):
        if sum(ks)!=hedef: continue
        v=np.var([wi/k for wi,k in zip(w,ks)])
        if en is None or v<en[0]: en=(v,ks)
    return en[1]

def kes_satir(yol, adet):
    a=np.array(Image.open(yol).convert('RGBA'))
    H,W=a.shape[:2]
    al=a[...,3]>20
    kucuk=al[:H//D*D,:W//D*D].reshape(H//D,D,W//D,D).max(axis=(1,3))
    lab,n=ndimage.label(kucuk,structure=np.ones((3,3)))
    areas=ndimage.sum(kucuk,lab,range(1,n+1)); objs=ndimage.find_objects(lab)
    main=[k for k in range(n) if areas[k]>=375]
    small=[k for k in range(n) if 3<=areas[k]<375]
    grp={k:[k] for k in main}
    def dist(b1,b2):
        dy=max(b1[0].start-b2[0].stop,b2[0].start-b1[0].stop,0); dx=max(b1[1].start-b2[1].stop,b2[1].start-b1[1].stop,0)
        return dx*dx+dy*dy
    for k in small:
        best=min(main,key=lambda j:dist(objs[k],objs[j]))
        if dist(objs[k],objs[best])<900: grp[best].append(k)
    comps=[]
    for k,ks in grp.items():
        x0=min(objs[j][1].start for j in ks); x1=max(objs[j][1].stop for j in ks)
        y0=min(objs[j][0].start for j in ks); y1=max(objs[j][0].stop for j in ks)
        comps.append((x0,y0,x1,y1,ks))
    comps.sort(key=lambda c:c[0])
    ks=parcalar([c[2]-c[0] for c in comps],adet)
    kareler=[]
    for (x0,y0,x1,y1,ids),k in zip(comps,ks):
        m=np.isin(lab[y0:y1,x0:x1],[i+1 for i in ids])
        kesim=[x0]
        if k>1:
            col=np.convolve(m.sum(0).astype(float),np.ones(5)/5,mode='same'); w=x1-x0
            adaylar=sorted(range(int(w*0.08),int(w*0.92)),key=lambda i:col[i])
            sec=[]
            for i in adaylar:   # en derin vadiler, birbirinden yeterince uzak
                if all(abs(i-s)>0.55*w/k for s in sec): sec.append(i)
                if len(sec)==k-1: break
            kesim+= [x0+s for s in sorted(sec)]
        kesim.append(x1)
        print('  bileşen',x1-x0,'->',k,'parça, kesimler',[c-x0 for c in kesim])
        for xa,xb in zip(kesim[:-1],kesim[1:]):
            sub=m[:,xa-x0:xb-x0]
            ys=np.where(sub.any(1))[0]
            ya,yb=y0+ys.min(),y0+ys.max()+1
            mm=np.repeat(np.repeat(m[ys.min():ys.max()+1,xa-x0:xb-x0],D,0),D,1)
            crop=a[ya*D:yb*D,xa*D:xb*D].copy(); crop[~mm,3]=0
            yy,xx=np.where(crop[...,3]>20)
            kareler.append(crop[yy.min():yy.max()+1,xx.min():xx.max()+1])
    kareler.sort(key=lambda c:0)  # sıra zaten soldan sağa
    return kareler

satir={}
for ad,(dosya,adet) in SATIRLAR.items():
    print(ad); satir[ad]=kes_satir(UP+dosya,adet)
    assert len(satir[ad])==adet,(ad,len(satir[ad]))

# Satır başına tek ölçek: idle kafa genişliği referans
kafa_med={ad:float(np.median([kafa(c[...,3]>20) for c in cr])) for ad,cr in satir.items()}
idle_boy=float(np.median([c.shape[0] for c in satir['idle']]))
k0=IDLE_BOY/idle_boy
anims={}
for ad,cr in satir.items():
    kat=kafa_med['idle']/kafa_med[ad]
    k=k0*kat
    if ad=='pa': k*=1.045   # jab kareleri diğer yumruk karelerinden ~%5 kısa çıkıyordu; boy eşitlendi
    print(f'{ad:5s} kafa {kafa_med[ad]/D:5.1f}  satır çarpanı {kat:.3f}  nihai ölçek {k:.4f}')
    fr=[]
    for c in cr:
        im=Image.fromarray(c,'RGBA'); w,h=im.size
        im=im.resize((max(1,round(w*k)),max(1,round(h*k))),Image.LANCZOS)
        al=np.array(im)[...,3]; Hh=al.shape[0]
        ys=np.where(al.max(1)>40)[0]; bot=ys.max()
        band=al[max(0,bot-int(Hh*0.07)):bot+1]; xs=np.where(band.max(0)>40)[0]
        ax=float(xs.mean()) if len(xs) else im.size[0]/2
        fr.append((im,ax,float(bot+1)))
    anims[ad]=fr

# Çift zıplama topu
sp=Image.open(SPIN).convert('RGBA'); bb=sp.getchannel('A').point(lambda v:255 if v>20 else 0).getbbox(); sp=sp.crop(bb)
sp=sp.resize((SPIN_GEN,round(sp.size[1]*SPIN_GEN/sp.size[0])),Image.LANCZOS)

# Atlas paketleme
items=[(f'{n}_{i}',im,ax,ay) for n,fr in anims.items() for i,(im,ax,ay) in enumerate(fr)]
items.append(('spin_0',sp,sp.size[0]/2,sp.size[1]/2))
items.sort(key=lambda t:-t[1].size[1])
PAD=2; W=2048; x=y=0; rowh=0; yer={}
for ad,im,ax,ay in items:
    w,h=im.size
    if x+w+PAD>W: x=0; y+=rowh+PAD; rowh=0
    yer[ad]=(x,y); x+=w+PAD; rowh=max(rowh,h)
Hh=1
while Hh<y+rowh+PAD: Hh*=2
atlas=Image.new('RGBA',(W,Hh),(0,0,0,0)); frames={}; ankor={}
for ad,im,ax,ay in items:
    px,py=yer[ad]; atlas.paste(im,(px,py)); w,h=im.size
    frames[ad]={"frame":{"x":px,"y":py,"w":w,"h":h},"rotated":False,"trimmed":False,
                "spriteSourceSize":{"x":0,"y":0,"w":w,"h":h},"sourceSize":{"w":w,"h":h}}
    ankor[ad]=[round(ax,1),round(ay,1),w,h]
os.makedirs(HEDEF,exist_ok=True)
atlas.save(f'{HEDEF}/popeye.png',optimize=True)
json.dump({"frames":frames,"meta":{"image":"popeye.png","size":{"w":W,"h":Hh},"scale":"1"}},open(f'{HEDEF}/popeye.json','w'))
sayi={n:len(v) for n,v in anims.items()}; sayi['spin']=1
with open(f'{HEDEF}/popeye_data.js','w') as f:
    f.write('// Otomatik üretildi (tools/bake.py). Elle değiştirme.\n')
    f.write('// POPEYE_KARE: kare grubu -> kare adedi, POPEYE_ANKOR: kare -> [ayakX, ayakY, genişlik, yükseklik] (atlas pikseli)\n')
    f.write('const POPEYE_KARE = '+json.dumps(sayi)+';\n')
    f.write('const POPEYE_ANKOR = '+json.dumps(ankor,separators=(',',':'))+';\n')
print('atlas',W,Hh,'kare',len(items),os.path.getsize(f'{HEDEF}/popeye.png')//1024,'KB')
