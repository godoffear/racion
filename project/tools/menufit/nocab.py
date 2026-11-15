import json,copy
from wk import mac,PR
PR['yogurt'].update(k=60,p=4,f=3,c=5)
from opt import optimize
SRC='../../src/'
w=json.load(open(SRC+'menus.json',encoding='utf-8'))
for wi,di in ((0,3),(0,6),(2,0),(3,0),(3,1)):
    d=w[wi][di]
    day={m[0]:[list(i) for i in m[1]] for m in d[1]}
    dishes={m[0]:(m[2] if len(m)>2 else None) for m in d[1]}
    for s in day:
        if any(i[0]=='cabbage' for i in day[s]):
            for i in day[s]:
                if i[0]=='cabbage':i[0]='zucchini'
            zz=[i for i in day[s] if i[0]=='zucchini']
            if len(zz)>1:zz[0][1]+=zz[1][1];day[s].remove(zz[1])
            dishes[s]=None
    best=None
    for seed in range(1,8):
        b,t,v=optimize(day,fixed=set(),iters=30000,seed=seed)
        if best is None or v<best[2]:best=(b,t,v)
        if v==0:break
    b,t,v=best
    for s in b:b[s]=[[i[0],int(i[1]) if float(i[1])==int(i[1]) else i[1]] for i in b[s] if not(i[0]=='oil' and i[1]<=0)]
    t=mac([tuple(i) for l in b.values() for i in l])
    d[1]=[[m[0],b[m[0]]]+([dishes[m[0]]] if dishes.get(m[0]) else []) for m in d[1]]
    print('base',wi,di,[round(x,1) for x in t],v,flush=True)
json.dump(w,open('menus_nocab.json','w',encoding='utf-8'),ensure_ascii=False,separators=(',',':'))
# неделя 3–9 ноября: остатки капусты (≈320 г) — Вт и Ср; Пт ужин и Вс обед — другой овощ
wk=json.load(open('week3_final.json'))
res={}
for d,slot,rep in (('2026-11-06','dinner','zucchini'),('2026-11-08','lunch','broccoli')):
    day=copy.deepcopy(wk[d])
    for i in day[slot]:
        if i[0]=='cabbage':i[0]=rep
    fixed={('bf','egg'),('bf','yogurt'),('lunch','tunaw'),('dinner','tunaw'),('lunch','egg')}
    best=None
    for seed in range(1,8):
        b,t,v=optimize(day,fixed=fixed,iters=30000,seed=seed)
        if best is None or v<best[2]:best=(b,t,v)
        if v==0:break
    b,t,v=best
    for s in b:b[s]=[[i[0],int(i[1]) if float(i[1])==int(i[1]) else i[1]] for i in b[s] if not(i[0]=='oil' and i[1]<=0)]
    t=mac([tuple(i) for l in b.values() for i in l]);res[d]=b
    print('week',d,[round(x,1) for x in t],v,flush=True)
wk.update(res)
json.dump(wk,open('week3_nocab.json','w'),ensure_ascii=False)
print('DONE',flush=True)
