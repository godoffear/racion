"""Замена свинины, говядины, рыбы и фарша в базовых неделях menus.json на курицу и тунец в соку; подгонка под норму."""
import json,re,copy
from wk import mac,PR
PR['yogurt'].update(k=60,p=4,f=3,c=5)
from opt import optimize,STEP,LIM
STEP.update(pineapple=10,dragon=10,tunaw=1)
LIM['chicken']=(60,340);LIM['oil']=(0,20);LIM['protein']=(10,45)
SRC='../../src/'
FIX={('bf','egg'),('bf','yogurt'),('lunch','tunaw'),('dinner','tunaw'),('lunch','egg'),('dinner','egg')}
BAD={'pork','beef','fish','mince'}
# рецепты-курица: ключ -> набор продуктов (без масла)
src=open(SRC+'app.js',encoding='utf-8').read()
REC={}
for l in src.split('\n'):
    m=re.match(r"\s*\['([^']+)',\s*'([^']+)',\s*\[([^\]]*)\],\s*(\[\[.*?\]\])\s*,\s*\[",l)
    if m:
        slots=re.findall(r"'(\w+)'",m.group(3));ids=frozenset(a for a in re.findall(r"\['(\w+)',",m.group(4)) if a!='oil')
        if ids&{'pork','beef','fish','mince','shrimp','squid','sweet','potato','corn','nuts','mushroom','apple','orange','banana','greens','bokchoy','kimchi','tofu','thigh','cabbage','tunao','sardine','carrot'}:continue
        if 'chicken' in ids or 'tunaw' in ids:REC[(tuple(slots),ids)]=m.group(1)
def key_for(slot,items):
    ids=frozenset(i[0] for i in items if i[0]!='oil')
    for (sl,s),k in REC.items():
        if slot in sl and s==ids:return k
    return None
def convert(slot,items):
    out=[];ch=0;tuna=0
    for id,q in items:
        if id=='chicken':ch+=q
        elif id in('pork','beef','mince'):ch+=q
        elif id=='fish':
            tuna+=1;ch+=max(q-130,0)
        else:out.append([id,q])
    res=[]
    if ch:res.append(['chicken',ch])
    if tuna:res.append(['tunaw',tuna])
    res=res+out
    if not any(i[0]=='oil' for i in res):res.append(['oil',5])
    return res
def fit(day):
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
        if not any(i[0] in BAD for m in d[1] for i in m[1]):continue
        day={};dishes={}
        for m in d[1]:
            items=[list(i) for i in m[1]]
            if any(i[0] in BAD for i in items):
                items=convert(m[0],items);dishes[m[0]]=key_for(m[0],items)
            else:dishes[m[0]]=(m[2] if len(m)>2 else None)
            day[m[0]]=items
        b,t,v=fit(day)
        # ключ блюда после подгонки (набор не меняется)
        d[1]=[[m[0],b[m[0]]]+([key_for(m[0],b[m[0]]) or dishes[m[0]]] if (key_for(m[0],b[m[0]]) or dishes[m[0]]) else []) for m in d[1]]
        print('base',wi,di,d[0],t,v,flush=True)
json.dump(w,open('menus_nomeat.json','w',encoding='utf-8'),ensure_ascii=False,separators=(',',':'))
