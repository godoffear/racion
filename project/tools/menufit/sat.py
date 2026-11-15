import json,re
from wk import mac,PR
PR['yogurt'].update(k=60,p=4,f=3,c=5)
from opt import optimize
SRC='../../src/'
w=json.load(open(SRC+'menus.json',encoding='utf-8'))
for wi,wk in enumerate(w):
    d=wk[4];assert d[0]=='W'
    day={m[0]:[list(i) for i in m[1]] for m in d[1]};dishes={m[0]:(m[2] if len(m)>2 else None) for m in d[1]}
    day['bf']=[i for i in day['bf'] if i[0]!='creatine']
    day={'pre':[['protein',30],['creatine',5]],**day};dishes['pre']=None
    best=None
    for seed in range(1,8):
        b,t,v=optimize(day,fixed={('bf','egg'),('bf','yogurt')},iters=30000,seed=seed)
        if best is None or v<best[2]:best=(b,t,v)
        if v==0:break
    b,t,v=best
    for s in b:b[s]=[[i[0],int(i[1]) if float(i[1])==int(i[1]) else i[1]] for i in b[s] if not(i[0]=='oil' and i[1]<=0)]
    wk[4]=['S',[[s,b[s]]+([dishes[s]] if dishes.get(s) and s!='bf' or (s=='bf' and dishes.get(s)) else []) for s in b]]
    print(wi,[round(x) for x in mac([tuple(i) for l in b.values() for i in l])],v)
json.dump(w,open('menus_sat.json','w',encoding='utf-8'),ensure_ascii=False,separators=(',',':'))
# overrides
wk=json.load(open('week4.json'))
rows=[]
for dt,d in wk.items():
    parts=[]
    for s,items in d['meals'].items():
        l=','.join("['%s',%s]"%(i[0],i[1]) for i in items)
        if s=='bf':l+=",'oatfruit'"
        parts.append("%s:[%s]"%(s,l))
    rows.append(" '%s':{%s},"%(dt,','.join(parts)))
open('ov_week4.txt','w').write('\n'.join(rows)+'\n')
