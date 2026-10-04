#!/usr/bin/env python3
"""Считает КБЖУ каждого дня в src/menus.json, проверяет норму и примерную стоимость недели.
Запуск: python3 src/menu_calc.py
КБЖУ, вес штуки и цены берутся прямо из src/app.js (PR и PRICES) — дублировать не нужно.
Приём в меню: [приём, [[продукт, кол-во], ...]] или [приём, [...], 'id блюда из RECIPES'].
"""
import json, pathlib, re
SRC = pathlib.Path(__file__).resolve().parent
APP = (SRC / 'app.js').read_text(encoding='utf-8')

def load_products():
    body = APP[APP.index('const PR={'):APP.index('};', APP.index('const PR={'))]
    P = {}
    for m in re.finditer(r"^\s*(\w+):\{(.*)\},?\s*$", body, re.M):
        pid, t = m.group(1), m.group(2)
        g = lambda k: (lambda x: float(x.group(1)) if x else None)(re.search(r"\b%s:(-?[\d.]+)" % k, t))
        if g('k') is None: continue
        u = re.search(r"u:'([^']+)'", t)
        P[pid] = (g('k'), g('p'), g('f'), g('c'), g('pg') if u and u.group(1) == 'шт' else None)
    return P

def load_prices():
    body = APP[APP.index('const PRICES={'):APP.index('};', APP.index('const PRICES={'))]
    return {k: [float(x) for x in v.split(',')] for k, v in re.findall(r"(\w+):\[([\d.,]+)\]", body)}

P = load_products()
PRICES = load_prices()
NORM = {'k': (1900, 2000), 'p': (160, 180), 'f': (55, 65), 'c': (120, 150)}
DAYS = ['Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс', 'Пн']

def mac(items):
    t = [0, 0, 0, 0]
    for p, q in items:
        k = P[p]; g = q * k[4] if k[4] else q
        for i in range(4): t[i] += k[i] * g / 100
    return t

def check(menus, quiet=False):
    bad = 0
    for wi, w in enumerate(menus):
        if not quiet: print(f'Меню {wi + 1}')
        need = {}
        for di, (typ, meals) in enumerate(w):
            t = [0] * 4; pre16 = 0
            for meal in meals:
                slot, items = meal[0], meal[1]
                for p, q in items: need[p] = need.get(p, 0) + q
                x = mac(items); t = [a + b for a, b in zip(t, x)]
                if slot in ('pre', 'bf', 'lunch'): pre16 += x[3]
            k, p, f, c = (round(v) for v in t)
            warn = []
            if not 1880 <= k <= 2000: warn.append('ккал')
            if not 188 <= p <= 208: warn.append('белок')
            if not 52 <= f <= 62: warn.append('жиры')
            if not 115 <= c <= 148: warn.append('углеводы')
            bad += bool(warn)
            if not quiet:
                dishes = ', '.join(m[2] for m in meals if len(m) > 2)
                print(f'  {DAYS[di]} {typ}: {k} ккал, Б {p}, Ж {f}, У {c}, до 16:00 {round(pre16 / max(t[3], 1) * 100)}%'
                      + ('  ⚠ ' + ', '.join(warn) if warn else '') + (f'  [{dishes}]' if dishes else ''))
        cost = sum(q / (PRICES[p][1] if len(PRICES.get(p, [])) > 1 else 1) * PRICES[p][0]
                   for p, q in need.items() if p in PRICES and len(PRICES[p]) > 1)
        if not quiet: print(f'  ≈ {round(cost / 1000) * 1000:,} ₫ без запасов'.replace(',', ' '))
    return bad

if __name__ == '__main__':
    menus = json.loads((SRC / 'menus.json').read_text(encoding='utf-8'))
    n = check(menus)
    print('Всё в норме' if not n else f'Дней вне нормы: {n}')
