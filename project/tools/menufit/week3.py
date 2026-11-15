import json,sys
from wk import mac,PR
PR['yogurt'].update(k=60,p=4,f=3,c=5)
from opt import optimize
DAYS=['2026-11-03','2026-11-04','2026-11-05','2026-11-06','2026-11-07','2026-11-08','2026-11-09']
types=['S','W','S','S','W','R','S']
fr_bf=['banana','mango','apple','banana','orange','mango','banana']
fr_sn=['apple','orange','banana','mango','apple','orange','apple']
M={0:dict(L=[('pork',180)],D=[('chicken',270)]),1:dict(L=[('chicken',270)],D=[('chicken',180),('tunaw',1)]),2:dict(L=[('chicken',270)],D=[('chicken',266)]),
3:dict(L=[('chicken',160),('tunaw',1),('egg',1)],D=[('chicken',280)]),4:dict(L=[('chicken',173),('egg',1)],D=[('chicken',250)]),
5:dict(L=[('chicken',250)],D=[('chicken',190),('tunaw',1)]),6:dict(L=[('chicken',280)],D=[('chicken',230)])}
fixedchicken={(0,'D'),(1,'L'),(1,'D'),(2,'L'),(2,'D'),(3,'L'),(3,'D'),(4,'L')}
veg={0:dict(L=[('zucchini',200)],D=[('cabbage',150),('zucchini',195)]),1:dict(L=[('broccoli',150)],D=[('cabbage',150),('tomato',100)]),
2:dict(L=[('cucumber',1),('tomato',100)],D=[('broccoli',150),('bellpep',100)]),3:dict(L=[('cucumber',1)],D=[('cabbage',150),('pumpkin',150)]),
4:dict(L=[('bellpep',100)],D=[('broccoli',150),('tomato',100)]),5:dict(L=[('cabbage',150)],D=[('pumpkin',150),('bellpep',100)]),
6:dict(L=[('cucumber',1),('tomato',100)],D=[('bellpep',100),('broccoli',150)])}
out={}
for i,d in enumerate(DAYS):
    day={}
    if types[i]=='S':day['pre']=[['protein',30],['creatine',5]]
    bf=[['oats',50],['egg',3],[fr_bf[i],1],['yogurt',1]]
    if types[i]!='S':bf.append(['creatine',5])
    day['bf']=bf
    day['lunch']=[[a,b] for a,b in M[i]['L']]+[[a,b] for a,b in veg[i]['L']]+[['rice',45],['kimchi',120],['oil',10]]
    day['dinner']=[[a,b] for a,b in M[i]['D']]+[[a,b] for a,b in veg[i]['D']]+[['kimchi',100],['oil',10]]
    day['snack']=[['protein',35],[fr_sn[i],1],['oil',0]]
    fixed={('bf','egg'),('bf','yogurt'),('lunch','tunaw'),('dinner','tunaw'),('lunch','egg'),('lunch','pork')}
    if (i,'L') in fixedchicken:fixed.add(('lunch','chicken'))
    if (i,'D') in fixedchicken:fixed.add(('dinner','chicken'))
    best=None
    for seed in range(1,25):
        b,t,v=optimize(day,fixed=fixed,iters=50000,seed=seed)
        if best is None or v<best[2]:best=(b,t,v)
        if v==0:break
    b,t,v=best
    for s in b:b[s]=[[x[0],int(x[1]) if float(x[1])==int(x[1]) else x[1]] for x in b[s] if not(x[0]=='oil' and x[1]<=0)]
    t=mac([tuple(x) for l in b.values() for x in l]);out[d]=b
    print(d,[round(x,1) for x in t],'viol',round(v,1))
    for s,l in b.items():print('   ',s,l)
json.dump(out,open('week3.json','w'),ensure_ascii=False)
tot={}
for day in out.values():
    for l in day.values():
        for x in l:tot[x[0]]=tot.get(x[0],0)+x[1]
print(tot)
