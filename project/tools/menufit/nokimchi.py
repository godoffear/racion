import json,re
from wk import mac,PR
PR['yogurt'].update(k=60,p=4,f=3,c=5)
PR['phobo']=dict(k=600,p=45,f=14,c=65,u='шт',pg=100)
from opt import optimize,STEP
STEP.update(pineapple=10,dragon=10)
SRC='../../src/'
FIX={('bf','egg'),('bf','yogurt'),('lunch','tunaw'),('dinner','tunaw'),('lunch','egg'),('dinner','egg'),('lunch','phobo'),('lunch','ramen_b'),('lunch','ramen_ch'),('lunch','ramen_o')}
def fit(day):
    day={s:[i for i in l if i[0]!='kimchi'] for s,l in day.items()}
    best=None
    for seed in range(1,9):
        b,t,v=optimize(day,fixed=FIX,iters=30000,seed=seed)
        if best is None or v<best[2]:best=(b,t,v)
        if v==0:break
    b,t,v=best
    for s in b:b[s]=[[i[0],int(i[1]) if float(i[1])==int(i[1]) else i[1]] for i in b[s] if not(i[0]=='oil' and i[1]<=0)]
    return b,[round(x) for x in mac([tuple(i) for l in b.values() for i in l])],v
w=json.load(open(SRC+'menus.json',encoding='utf-8'))
for wi,wk in enumerate(w):
    for di,d in enumerate(wk):
        if not any(i[0]=='kimchi' for m in d[1] for i in m[1]):continue
        day={m[0]:[list(i) for i in m[1]] for m in d[1]};dishes={m[0]:(m[2] if len(m)>2 else None) for m in d[1]}
        b,t,v=fit(day)
        d[1]=[[m[0],b[m[0]]]+([dishes[m[0]]] if dishes.get(m[0]) else []) for m in d[1]]
        print('base',wi,di,t,v,flush=True)
json.dump(w,open('menus_nokimchi.json','w',encoding='utf-8'),ensure_ascii=False,separators=(',',':'))
app=open(SRC+'app.js',encoding='utf-8').read().split('\n')
for n,l in enumerate(app):
    m=re.match(r" '(2026-(\d\d)-(\d\d))':(\{.*\}),$",l)
    if not m or m.group(1)<'2026-11-16' or 'kimchi' not in l:continue
    js=re.sub(r"'",'"',m.group(4));js=re.sub(r"([{,])(\w+):",r'\1"\2":',js)
    o=json.loads(js)
    keys={s:(v[-1] if isinstance(v[-1],str) else None) for s,v in o.items()}
    day={s:[list(i) for i in v if isinstance(i,list)] for s,v in o.items()}
    b,t,v=fit(day)
    parts=[]
    for s in o:
        it=','.join("['%s',%s]"%(i[0],i[1]) for i in b[s])
        if keys[s]:it+=",'%s'"%keys[s]
        parts.append('%s:[%s]'%(s,it))
    app[n]=" '%s':{%s},"%(m.group(1),','.join(parts))
    print('ov',m.group(1),t,v,flush=True)
open('app_nokimchi.js','w',encoding='utf-8').write('\n'.join(app))
