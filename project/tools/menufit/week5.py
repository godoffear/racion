import json,datetime,re
from wk import mac,PR
PR['yogurt'].update(k=60,p=4,f=3,c=5)
from opt import optimize,STEP
STEP.update(pineapple=10,dragon=10)
m=json.load(open('../../src/menus.json',encoding='utf-8'))[2]
BAD={'beef','fish','mince','pork','squid','shrimp'}
NOOD={0:'ramen_b',2:'ramen_ch',4:'ramen_o'}
base=datetime.date(2026,11,17);res={}
for di,d in enumerate(m):
    day={s[0]:[list(i) for i in s[1]] for s in d[1]}
    for s in day:
        for it in day[s]:
            if it[0] in BAD:it[0]='chicken'
        o=[]
        for it in day[s]:
            e=next((x for x in o if x[0]=='chicken' and it[0]=='chicken'),None)
            if e:e[1]+=it[1]
            else:o.append(it)
        day[s]=[[i[0],min(i[1],300) if i[0]=='chicken' else i[1]] for i in o]
    fixed={('bf','egg'),('bf','yogurt'),('lunch','tunaw'),('lunch','egg'),('dinner','egg')}
    if di in NOOD:
        n=NOOD[di]
        day['lunch']=[[n,1],['chicken',250],['zucchini',150],['kimchi',80],['oil',5]]
        day['bf']=[i for i in day['bf'] if i[0] not in('mango','pineapple','dragon')]+[['dragon',100]]
        day['snack']=[['protein',35]]
        day['dinner']=[['chicken',210],['broccoli',150],['kimchi',80],['oil',10]]
        fixed|={('lunch',n)}
    if di==4:day['dinner']=[['tunaw',1],['chicken',100],['broccoli',100],['oil',10],['kimchi',80]];fixed|={('dinner','tunaw')}
    if di==5:day['dinner']=[['tunaw',1],['chicken',120],['broccoli',140],['oil',10],['kimchi',100]];fixed|={('dinner','tunaw')}
    best=None
    for seed in range(1,10):
        b,t,v=optimize(day,fixed=fixed,iters=30000,seed=seed)
        if best is None or v<best[2]:best=(b,t,v)
        if v==0:break
    b,t,v=best
    for s in b:b[s]=[[i[0],int(i[1]) if float(i[1])==int(i[1]) else i[1]] for i in b[s] if not(i[0]=='oil' and i[1]<=0)]
    dt=(base+datetime.timedelta(days=di)).isoformat();res[dt]={'type':d[0],'meals':b}
    print(dt,d[0],[round(x) for x in mac([tuple(i) for l in b.values() for i in l])],v)
    for s in b:print('   ',s,b[s])
json.dump(res,open('week5.json','w'),ensure_ascii=False)
