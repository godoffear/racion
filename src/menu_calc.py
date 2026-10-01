#!/usr/bin/env python3
"""Считает КБЖУ каждого дня в src/menus.json и проверяет норму.
Запуск: python3 src/menu_calc.py
Значения продуктов должны совпадать с таблицей PR в src/app.js.
"""
import json, pathlib
# ккал, Б, Ж, У на 100 г; последний элемент — вес штуки в граммах (для продуктов в штуках)
P = {
 'egg':(143,12.6,9.5,0.7,55),'chicken':(110,23,1.5,0,None),'thigh':(150,18,8.5,0,None),'fish':(105,20,2.5,0,None),
 'shrimp':(85,20,0.5,0,None),'squid':(92,16,1.4,3,None),'pork':(120,21,3.5,0,None),'tofu':(100,10,6,2,None),
 'protein':(390,78,6,8,None),'creatine':(0,0,0,0,None),'oats':(366,12.5,6.2,60,None),'rice':(350,7,0.7,77,None),
 'sweet':(86,1.6,0.1,20,None),'banana':(89,1.1,0.3,23,120),'apple':(52,0.3,0.2,14,180),'cucumber':(15,0.7,0.1,3.6,150),
 'veg':(30,1.5,0.2,6,None),'nuts':(600,18,53,16,None),'oil':(884,0,100,0,None),
 'tomato':(18,0.9,0.2,3.9,None),'mushroom':(25,3,0.3,3.5,None),'ricenoodle':(360,6,0.6,80,None)}
NORM = {'k':(1900,2000),'p':(160,180),'f':(55,65),'c':(120,150)}
DAYS = ['Вт','Ср','Чт','Пт','Сб','Вс','Пн']
def mac(items):
    t=[0,0,0,0]
    for p,q in items:
        k=P[p]; g=q*k[4] if k[4] else q
        for i in range(4): t[i]+=k[i]*g/100
    return t
menus=json.loads((pathlib.Path(__file__).parent/'menus.json').read_text(encoding='utf-8'))
for wi,w in enumerate(menus):
    print(f'Меню {wi+1}')
    for di,(typ,meals) in enumerate(w):
        t=[0]*4; pre16=0
        for slot,items in meals:
            x=mac(items); t=[a+b for a,b in zip(t,x)]
            if slot in ('pre','bf','lunch'): pre16+=x[3]
        k,p,f,c=(round(v) for v in t)
        warn=[]
        if not 1850<=k<=2000: warn.append('ккал')
        if p<NORM['p'][0]: warn.append('белок')
        if not 52<=f<=70: warn.append('жиры')
        print(f'  {DAYS[di]} {typ}: {k} ккал, Б {p}, Ж {f}, У {c}, углеводы до 16:00 {round(pre16/t[3]*100)}%'+('  ⚠ '+', '.join(warn) if warn else ''))
