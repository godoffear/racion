"""Справочник продуктов из src/app.js и подсчёт КБЖУ — для подгонки меню под норму."""
import re,os
s=open(os.path.join(os.path.dirname(__file__),'../../src/app.js'),encoding='utf-8').read()
i=s.index('const PR={');j=s.index('\n};',i);blk=s[i:j]
PR={}
for m in re.finditer(r"^ (\w+):\{(.*)$",blk,re.M):
    id,b=m.group(1),m.group(2)
    g=lambda k:(re.search(r"[,{]"+k+r":([\d.]+)",b) or [0,0])[1]
    PR[id]=dict(k=float(g('k')),p=float(g('p')),f=float(g('f')),c=float(g('c')),u='шт' if "u:'шт'" in b else 'г',pg=float(g('pg')) if g('pg') else 100)
def mac(items):
    t=[0,0,0,0]
    for it in items:
        p=PR[it[0]];g=it[1]*(p['pg'] if p['u']=='шт' else 1)/100
        for n,k in enumerate('kpfc'):t[n]+=p[k]*g
    return t
