import json,copy
from wk import mac,PR
PR['yogurt'].update(k=60,p=4,f=3,c=5)
from opt import optimize
m=json.load(open('../../src/menus.json',encoding='utf-8'))[1]
BAD={'beef','fish','mince','pork','squid','shrimp'}
res={}
base=__import__('datetime').date(2026,11,10)
for di,d in enumerate(m):
    day={s[0]:[list(i) for i in s[1]] for s in d[1]}
    if di==4: # суббота -> силовая: пре-тренировка, креатин из завтрака в пре
        day['bf']=[i for i in day['bf'] if i[0]!='creatine']
        day={'pre':[['protein',30],['creatine',5]],**day}
    for s in day:
        for it in day[s]:
            if it[0] in BAD:it[0]='chicken'
    # слить две строки курицы в одном приёме
    for s in day:
        o=[]
        for it in day[s]:
            e=next((x for x in o if x[0]==it[0] and it[0]=='chicken'),None)
            if e:e[1]+=it[1]
            else:o.append(it)
        day[s]=o
    for s in day:
        for it in day[s]:
            if it[0]=='chicken':it[1]=min(it[1],300)
    if di==2:
        day['dinner'].append(['oil',10]);day['snack'].append(['oil',10]);
        for it in day['lunch']+day['dinner']:
            if it[0]=='chicken':it[1]=200
    if di==5:
        day['dinner'].append(['oil',10]);day['snack'].append(['oil',10])
    if di==3:
        day['dinner']=[['egg',2],['tunaw',1],['chicken',60],['bellpep',190],['kimchi',100]]
    if di==5:
        day['dinner']=[['chicken',150],['tunaw',1],['greens',200],['kimchi',100],['oil',10]]
    if di==6:
        day['dinner']=[['tunaw',1],['chicken',90],['bellpep',120],['onion',70],['oil',10],['kimchi',80]]
    fixed={('dinner','tunaw'),('bf','egg'),('bf','yogurt'),('lunch','tunaw'),('lunch','egg'),('dinner','egg')}
    best=None
    for seed in range(1,8):
        b,t,v=optimize(day,fixed=fixed,iters=30000,seed=seed)
        if best is None or v<best[2]:best=(b,t,v)
        if v==0:break
    b,t,v=best
    for s in b:b[s]=[[i[0],int(i[1]) if float(i[1])==int(i[1]) else i[1]] for i in b[s] if not(i[0]=='oil' and i[1]<=0)]
    dt=(base+__import__('datetime').timedelta(days=di)).isoformat()
    res[dt]={'type':'S' if di in(0,2,3,4,6) else d[0],'meals':b}
    print(dt,res[dt]['type'],[round(x) for x in mac([tuple(i) for l in b.values() for i in l])],v,flush=True)
    for s in b:print('   ',s,b[s])
json.dump(res,open('week4.json','w'),ensure_ascii=False)
