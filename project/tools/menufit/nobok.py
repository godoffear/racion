import json,re,itertools
from wk import mac,PR
PR['yogurt'].update(k=60,p=4,f=3,c=5)
from opt import optimize,STEP
STEP.update(pineapple=10,dragon=10)
SRC='../../src/'
cnt=itertools.count()
import itertools
cy=itertools.count()
def swap(day):
    used={i[0] for l in day.values() for i in l}
    for s in day:
        for it in day[s]:
            if it[0]=='bokchoy':
                for _ in range(4):
                    c=['broccoli','zucchini','bellpep','broccoli'][next(cy)%4]
                    if c not in used:break
                it[0]=c;used.add(c)
    return day
def fit(day,fixed):
    best=None
    for seed in range(1,8):
        b,t,v=optimize(day,fixed=fixed,iters=30000,seed=seed)
        if best is None or v<best[2]:best=(b,t,v)
        if v==0:break
    b,t,v=best
    for s in b:b[s]=[[i[0],int(i[1]) if float(i[1])==int(i[1]) else i[1]] for i in b[s] if not(i[0]=='oil' and i[1]<=0)]
    return b,[round(x) for x in mac([tuple(i) for l in b.values() for i in l])],v
FIX={('bf','egg'),('bf','yogurt'),('lunch','tunaw'),('dinner','tunaw'),('lunch','egg'),('dinner','egg')}
w=json.load(open(SRC+'menus.json',encoding='utf-8'))
for wi,wk in enumerate(w):
    for di,d in enumerate(wk):
        if not any(i[0]=='bokchoy' for m in d[1] for i in m[1]):continue
        day={m[0]:[list(i) for i in m[1]] for m in d[1]};dishes={m[0]:(m[2] if len(m)>2 else None) for m in d[1]}
        b,t,v=fit(swap(day),FIX)
        d[1]=[[m[0],b[m[0]]]+([dishes[m[0]]] if dishes.get(m[0]) else []) for m in d[1]]
        print('base',wi,di,t,v,flush=True)
json.dump(w,open('menus_nobok.json','w',encoding='utf-8'),ensure_ascii=False,separators=(',',':'))
# overrides
app=open(SRC+'app.js',encoding='utf-8').read().split('\n')
out={}
for n,l in enumerate(app):
    m=re.match(r" '(2026-11-(09|1[0-6]))':(\{.*\}),$",l)
    if not m:continue
    js=re.sub(r"'",'"',m.group(3));js=re.sub(r"([{,])(\w+):",r'\1"\2":',js)
    o=json.loads(js)
    keys={s:(v[-1] if isinstance(v[-1],str) else None) for s,v in o.items()}
    day={s:[list(i) for i in v if isinstance(i,list)] for s,v in o.items()}
    if not any(i[0]=='bokchoy' for l2 in day.values() for i in l2):continue
    b,t,v=fit(swap(day),FIX)
    parts=[]
    for s in o:
        it=','.join("['%s',%s]"%(i[0],i[1]) for i in b[s])
        if keys[s]:it+=",'%s'"%keys[s]
        parts.append('%s:[%s]'%(s,it))
    app[n]=" '%s':{%s},"%(m.group(1),','.join(parts))
    print('ov',m.group(1),t,v,flush=True)
open('app_nobok.js','w',encoding='utf-8').write('\n'.join(app))
