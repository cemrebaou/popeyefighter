from PIL import Image
import numpy as np
from scipy import ndimage
Image.MAX_IMAGE_PIXELS=None
YOL=['/mnt/user-data/uploads/Adsız_tasarım__1_.png','/mnt/user-data/uploads/Adsız_tasarım__3_.png']
D=4
def yukle(i):
    return np.array(Image.open(YOL[i]).convert('RGBA'))
def segment(a, area_main=375):
    H,W=a.shape[:2]
    al=a[...,3]>20
    kucuk=al[:H//D*D,:W//D*D].reshape(H//D,D,W//D,D).max(axis=(1,3))
    lab,n=ndimage.label(kucuk,structure=np.ones((3,3)))
    areas=ndimage.sum(kucuk,lab,range(1,n+1))
    objs=ndimage.find_objects(lab)
    main=[k for k in range(n) if areas[k]>=area_main]
    small=[k for k in range(n) if 3<=areas[k]<area_main]
    groups={k:[k] for k in main}
    def dist(b1,b2):
        dy=max(b1[0].start-b2[0].stop,b2[0].start-b1[0].stop,0)
        dx=max(b1[1].start-b2[1].stop,b2[1].start-b1[1].stop,0)
        return dx*dx+dy*dy
    for k in small:
        best=min(main,key=lambda j:dist(objs[k],objs[j]))
        if dist(objs[k],objs[best])<(60/D*1.0)**2*4: groups[best].append(k)
    frames=[]
    for k,ks in groups.items():
        y0=min(objs[j][0].start for j in ks);y1=max(objs[j][0].stop for j in ks)
        x0=min(objs[j][1].start for j in ks);x1=max(objs[j][1].stop for j in ks)
        frames.append(dict(box=(x0,y0,x1,y1),ids=ks))
    return lab,frames
def rows(frames,tol=22):
    fs=sorted(frames,key=lambda f:(f['box'][1]+f['box'][3])/2)
    R=[]
    for f in fs:
        yc=(f['box'][1]+f['box'][3])/2
        if R and abs(R[-1][0]-yc)<tol*3: R[-1][1].append(f); R[-1][0]=np.mean([(g['box'][1]+g['box'][3])/2 for g in R[-1][1]])
        else: R.append([yc,[f]])
    for r in R: r[1].sort(key=lambda f:f['box'][0])
    return R
if __name__=="__main__":
    for i in (0,1):
        a=yukle(i); lab,fr=segment(a); R=rows(fr)
        print('sheet',i,a.shape,'frames',len(fr))
        for yc,fs in R: print(' yc',int(yc),'n',len(fs),[(f['box'][0],f['box'][2]) for f in fs])
