"""Подгонка граммов дня под норму: 1900–2000 ккал, белок 190–205, жиры 55–60, углеводы 120–145."""
import random,copy
from wk import mac,PR
NORM=((1900,2000),(190,205),(55,60),(120,145))
STEP={'oil':5,'rice':5,'oats':5,'protein':5,'chicken':10,'pork':10,'beef':10,'fish':10,'thigh':10,'shrimp':10,'squid':10,'mince':10,'kimchi':10,'zucchini':10,'cabbage':10,'broccoli':10,'pumpkin':10,'tomato':10,'mushroom':10,'bellpep':10,'carrot':10,'greens':10,'beans':10,'tofu':10,'onion':10,'pineapple':10}
LIM={'oil':(0,15),'rice':(20,120),'oats':(30,70),'protein':(30,45),'chicken':(60,300),'kimchi':(80,150)}
def viol(t,w=(1,3,12,6)):
    v=0
    for x,(a,b),k in zip(t,NORM,w):
        if x<a:v+=(a-x)*k
        if x>b:v+=(x-b)*k
    return v
def optimize(day,fixed=(),iters=40000,seed=1):
    rnd=random.Random(seed);ref=copy.deepcopy(day)
    idx=[(s,i) for s in day for i,it in enumerate(day[s]) if it[0] in STEP and (s,it[0]) not in fixed and s!='pre']
    T=lambda x:mac([tuple(i) for l in x.values() for i in l])
    best=copy.deepcopy(day);bv=viol(T(best));cur=copy.deepcopy(day);cv=bv
    d_=lambda x:0.02*sum(abs(x[s][i][1]-ref[s][i][1])/max(ref[s][i][1],5) for s,i in idx)
    for n in range(iters):
        x=copy.deepcopy(cur)
        for _ in range(rnd.choice((1,1,2,3))):
            s,i=rnd.choice(idx);id,q=x[s][i];st=STEP[id]
            lo,hi=LIM.get(id,(max(st,ref[s][i][1]*0.6),ref[s][i][1]*1.4+st))
            nq=q+rnd.choice((-2,-1,1,2))*st
            if nq<lo-1e-9 or nq>hi+1e-9:continue
            x[s][i][1]=nq
        v=viol(T(x))+d_(x)
        if v<=cv or rnd.random()<0.002:
            cur,cv=x,v
            if viol(T(x))<bv-1e-9 or (viol(T(x))==bv and v<viol(T(best))+d_(best)):best,bv=copy.deepcopy(x),viol(T(x))
        if bv==0 and n>3000:break
    return best,T(best),bv
