# Draws the Little Us app icon (a jar with a heart sprout) on a 32x32 pixel grid and
# saves it scaled up without smoothing. Run: python3 make-icon.py
from PIL import Image
N=32
im=Image.new('RGBA',(N,N))
P=im.load()
C=dict(bg='#E9A9A1',bg2='#F2C2B6',ink='#38493D',glass='#E4F0EA',glass2='#CFE3DA',hi='#FFFFFF',wood='#B88D60',woodD='#775B46',woodL='#D9B783',
       grass='#8DB06A',grassD='#6F925B',grassL='#A8C77C',soil='#9C7650',heart='#D9536A',heartL='#F08A98',leaf='#6F925B',leafL='#9DBA74',star='#FFE7A8',shadow='#D18F88')
def h(c): c=C[c]; return tuple(int(c[i:i+2],16) for i in (1,3,5))+(255,)
def px(x,y,c):
  if 0<=x<N and 0<=y<N: P[x,y]=h(c)
def rect(x,y,w,hh,c):
  for yy in range(y,y+hh):
    for xx in range(x,x+w): px(xx,yy,c)
# background with soft inner glow
rect(0,0,N,N,'bg')
# a soft light from the top, in two bands
for y in range(N):
  for x in range(N):
    d=((x-15.5)/15)**2+((y-8)/14)**2
    if d<0.55: px(x,y,'bg2')
# ground shadow under the jar
for x in range(9,23):
  px(x,29,'shadow')
for x in range(11,21):
  px(x,30,'shadow')
# jar body (rounded) x 7..24, y 11..27
x0,x1,y0,y1=7,24,11,27
def inside(x,y,r=3):
  if not(x0<=x<=x1 and y0<=y<=y1): return False
  cx=min(max(x,x0+r),x1-r); cy=min(max(y,y0+r),y1-r)
  return (x-cx)**2+(y-cy)**2<=r*r+0.5
for y in range(N):
  for x in range(N):
    if inside(x,y): px(x,y,'glass')
# grass and soil inside
for y in range(21,28):
  for x in range(N):
    if inside(x,y): px(x,y,'grass' if y>21 else 'grassL')
for y in range(25,28):
  for x in range(N):
    if inside(x,y): px(x,y,'grassD')
# glass tint near edges
for y in range(N):
  for x in range(N):
    if inside(x,y) and not inside(x-1,y) and y<21: px(x,y,'glass2')
    if inside(x,y) and not inside(x+1,y) and y<21: px(x,y,'glass2')
# outline
for y in range(N):
  for x in range(N):
    if not inside(x,y) and any(inside(x+dx,y+dy) for dx,dy in ((1,0),(-1,0),(0,1),(0,-1))): px(x,y,'ink')
# neck
rect(10,9,12,2,'glass2'); rect(9,9,1,2,'ink'); rect(22,9,1,2,'ink')
# lid
rect(8,6,16,3,'wood'); rect(8,6,16,1,'woodL'); rect(8,8,16,1,'woodD')
rect(7,6,1,3,'ink'); rect(24,6,1,3,'ink'); rect(8,5,16,1,'ink'); rect(8,9,16,0,'ink')
rect(14,3,4,2,'woodD'); rect(13,3,1,2,'ink'); rect(18,3,1,2,'ink'); rect(14,2,4,1,'ink')
# glass highlight
rect(9,13,1,6,'hi'); rect(10,12,1,2,'hi')
# sprout: stem + leaves
rect(15,16,2,6,'leaf')
# two round leaves, the right one a little higher
for (x,y) in [(12,18),(13,18),(14,18),(11,19),(12,19),(13,19),(14,19)]: px(x,y,'leafL')
for (x,y) in [(12,20),(13,20),(14,20)]: px(x,y,'leaf')
for (x,y) in [(17,17),(18,17),(19,17),(17,18),(18,18),(19,18),(20,18)]: px(x,y,'leafL')
for (x,y) in [(17,19),(18,19),(19,19)]: px(x,y,'leaf')
px(12,18,'leafL'); px(11,18,'bgx') if False else None
# heart bloom
heart=[".XX.XX.","XXXXXXX","XXXXXXX",".XXXXX.","..XXX..","...X..."]
for j,row in enumerate(heart):
  for i,ch in enumerate(row):
    if ch=='X': px(12+i,10+j,'heart')
px(13,11,'heartL'); px(14,11,'heartL'); px(13,12,'heartL')
# sparkle
px(21,13,'star'); px(20,14,'star'); px(22,14,'star'); px(21,15,'star'); px(21,14,'hi')
im.save('icon32.png')
im.resize((1024,1024),Image.NEAREST).save('icon-1024.png')
im.resize((512,512),Image.NEAREST).save('preview.png')
