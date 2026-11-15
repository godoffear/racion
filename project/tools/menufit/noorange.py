import json,copy,itertools
from wk import mac,PR
PR['yogurt'].update(k=60,p=4,f=3,c=5)
from opt import optimize
SRC='../../src/'
ALT=['banana','mango']
def swap(day,k=0):
    used={i[0] for l in day.values() for i in l}
    for s in day:
        for it in day[s]:
            if it[0]=='orange':
                for c in itertools.islice(itertools.cycle(ALT),k,k+2):
                    if c not in used:it[0]=c;used.add(c);break
                else:it[0]='banana'
    return day
def fit(day,fixed,tries=7):
    best=None
    for seed in range(1,tries):
        b,t,v=optimize(day,fixed=fixed,iters=30000,seed=seed)
        if best is None or v<best[2]:best=(b,t,v)
        if v==0:break
    b,t,v=best
    for s in b:b[s]=[[i[0],int(i[1]) if float(i[1])==int(i[1]) else i[1]] for i in b[s] if not(i[0]=='oil' and i[1]<=0)]
    return b,mac([tuple(i) for l in b.values() for i in l]),v
w=json.load(open(SRC+'menus.json',encoding='utf-8'))
k=0
for wi,wk in enumerate(w):
    for di,d in enumerate(wk):
        if not any(i[0]=='orange' for m in d[1] for i in m[1] if isinstance(i,list)):continue
        day={m[0]:[list(i) for i in m[1]] for m in d[1]}
        dishes={m[0]:(m[2] if len(m)>2 else None) for m in d[1]}
        day=swap(day,k);k+=1
        b,t,v=fit(day,{('bf','egg'),('bf','yogurt')})
        d[1]=[[m[0],b[m[0]]]+([dishes[m[0]]] if dishes.get(m[0]) else []) for m in d[1]]
        print('base',wi,di,[round(x,1) for x in t],v,flush=True)
json.dump(w,open('menus_noorange.json','w',encoding='utf-8'),ensure_ascii=False,separators=(',',':'))
wk=json.load(open('week3_noapple.json'));res={}
for d in ('2026-11-07','2026-11-08'):
    day=swap(copy.deepcopy(wk[d]),k);k+=1
    fixed={('bf','egg'),('bf','yogurt'),('lunch','tunaw'),('dinner','tunaw'),('lunch','egg')}
    b,t,v=fit(day,fixed);res[d]=b
    print('week',d,[round(x,1) for x in t],v,flush=True)
wk.update(res);json.dump(wk,open('week3_noorange.json','w'),ensure_ascii=False)
print('DONE',flush=True)
