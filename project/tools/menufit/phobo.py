import json,re
from wk import mac,PR
PR['yogurt'].update(k=60,p=4,f=3,c=5)
PR['phobo']=dict(k=600,p=45,f=14,c=65,u='шт',pg=100)
from opt import optimize,STEP
STEP.update(pineapple=10,dragon=10)
SRC='../../src/'
app=open(SRC+'app.js',encoding='utf-8').read().split('\n')
FIX={('bf','egg'),('bf','yogurt'),('lunch','phobo'),('lunch','tunaw'),('dinner','tunaw'),('dinner','egg'),('dinner','tunaw')}
for n,l in enumerate(app):
    m=re.match(r" '(2026-11-(14|15|18|22))':(\{.*\}),$",l)
    if not m:continue
    js=re.sub(r"'",'"',m.group(3));js=re.sub(r"([{,])(\w+):",r'\1"\2":',js)
    o=json.loads(js)
    keys={s:(v[-1] if isinstance(v[-1],str) else None) for s,v in o.items()}
    day={s:[list(i) for i in v if isinstance(i,list)] for s,v in o.items()}
    day['lunch']=[['phobo',1]];keys['lunch']=None
    if not any(i[0]=='egg' for i in day['dinner']):day['dinner'].append(['egg',2])
    if m.group(1) in('2026-11-18','2026-11-14') and not any(i[0]=='tunaw' for i in day['dinner']):day['dinner'].append(['tunaw',1])
    if m.group(1)=='2026-11-14':day['snack']=[i for i in day['snack'] if i[0] not in('pineapple','dragon')]
    best=None
    for seed in range(1,10):
        b,t,v=optimize(day,fixed=FIX,iters=30000,seed=seed)
        if best is None or v<best[2]:best=(b,t,v)
        if v==0:break
    b,t,v=best
    for s in b:b[s]=[[i[0],int(i[1]) if float(i[1])==int(i[1]) else i[1]] for i in b[s] if not(i[0]=='oil' and i[1]<=0)]
    parts=[]
    for s in o:
        it=','.join("['%s',%s]"%(i[0],i[1]) for i in b[s])
        if keys[s]:it+=",'%s'"%keys[s]
        parts.append('%s:[%s]'%(s,it))
    app[n]=" '%s':{%s},"%(m.group(1),','.join(parts))
    print(m.group(1),[round(x) for x in mac([tuple(i) for l2 in b.values() for i in l2])],v)
    for s in b:print('   ',s,b[s])
open('app_phobo.js','w',encoding='utf-8').write('\n'.join(app))
