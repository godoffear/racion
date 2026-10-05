#!/usr/bin/env python3
"""Генератор 4 меню для «Рациона»: блюда по дням (W) + подбор граммов под норму (pen).
Запуск: python3 src/menu_gen.py            — показать КБЖУ всех дней
        python3 src/menu_gen.py --write    — записать src/menus.json
Список блюд R должен совпадать с RECIPES в app.js (id, продукты, шаги). Меняешь блюдо здесь — поменяй и там.
Порядок: правка W/R → --write → python3 src/menu_calc.py → build → check.
"""
import json, sys, itertools, pathlib
SRC = pathlib.Path(__file__).resolve().parent
sys.path.insert(0, str(SRC))
import menu_calc as MC
P, mac = MC.P, MC.mac

# [id, название, приёмы, продукты, шаги]
R = [
 # ---- завтраки
 ['oatban','Овсянка с бананом и варёные яйца',['bf'],[['egg',3],['oats',50],['banana',1]],['Овсянку залить кипятком на 5 мин','Банан нарезать сверху','Яйца из запаса']],
 ['omtom','Омлет с помидорами и багет',['bf'],[['egg',3],['tomato',100],['bread',1]],['Помидоры кубиками 2 мин на сковороде','Влить взбитые яйца, под крышкой 3–4 мин','С багетом']],
 ['sweeteggs','Батат с яйцами и огурцом',['bf'],[['sweet',200],['egg',3],['cucumber',1]],['Батат на пару в рисоварке 20–25 мин — удобно сварить с вечера','Яйца из запаса, огурец нарезать']],
 ['tunabm','Бань ми с тунцом и яйцом',['bf','lunch'],[['bread',1],['tunaw',1],['egg',1],['cucumber',1]],['Багет 1 мин на сухой сковороде','Тунец без жидкости размять с перцем и лаймом','В багет — тунец, яйцо кружками, огурец']],
 ['oatmango','Овсянка с манго, йогурт и яйца',['bf'],[['oats',50],['mango',1],['yogurt',1],['egg',2]],['Овсянку залить кипятком на 5 мин','Манго кубиками, йогурт сверху','Яйца из запаса']],
 # ---- обеды (старые id сохранены)
 ['friedrice','Жареный рис с курицей и яйцом',['lunch'],[['chicken',120],['egg',1],['rice',40],['veg',150],['oil',5]],['Рис лучше вчерашний, из холодильника','Курицу кубиками 5 мин на сковороде','Сдвинуть, вбить яйцо, перемешать','Добавить рис и овощи, 3–4 мин на сильном огне, соль, перец']],
 ['shrimprice','Жареный рис с креветками',['lunch'],[['shrimp',150],['egg',1],['rice',40],['veg',150],['oil',5]],['Креветки 2 мин на сковороде, отложить','Яйцо на сковороду, перемешать','Рис и овощи 3–4 мин, вернуть креветки, лайм']],
 ['curry','Курица с бататом, тушёная с куркумой',['lunch'],[['chicken',150],['sweet',200],['veg',150],['oil',5]],['Курицу кубиками обжарить 3 мин','Батат кубиками, ½ стакана воды, куркума, перец','Под крышкой 15 мин, в конце овощи на 3 мин']],
 ['porkstir','Свинина с овощами и рисом',['lunch'],[['pork',150],['rice',40],['veg',200],['oil',5]],['Свинину тонкими полосками 5 мин на сильном огне','Овощи туда же на 3–4 мин, чеснок, перец','С рисом из рисоварки']],
 ['tofutom','Тофу в помидорах с яйцом и рисом',['lunch'],[['tofu',200],['tomato',150],['egg',2],['rice',30]],['Помидоры кубиками 3 мин на сковороде без масла','Тофу кубиками туда же, 5 мин','Влить взбитые яйца, помешать 1 мин','С рисом']],
 ['beefbroc','Говядина с брокколи и рисом',['lunch','dinner'],[['beef',150],['broccoli',200],['rice',50],['oil',5]],['Брокколи соцветиями 3 мин в кипятке или на пару','Говядину тонко, 2 мин на сильном огне с чесноком','Брокколи туда же на 1 мин, перец','С рисом из рисоварки']],
 ['tunarice','Рис с тунцом, яйцом и огурцом',['lunch'],[['tunaw',2],['rice',50],['egg',1],['cucumber',1],['veg',100]],['Рис из рисоварки','Тунец без жидкости, яйцо из запаса','Огурец и овощи нарезать, лайм, перец — готовить не нужно']],
 ['porkpot','Свинина с картофелем и капустой',['lunch'],[['pork',150],['potato',250],['cabbage',150],['oil',5]],['Картофель кубиками на пару в рисоварке 15 мин','Свинину полосками 5 мин на сковороде','Капусту туда же на 4 мин, затем картофель, перец, чеснок']],
 ['mincebeans','Фарш со стручковой фасолью и рисом',['lunch'],[['mince',120],['beans',200],['rice',50]],['Фарш на сухую сковороду 5 мин, разбивая лопаткой','Фасоль кусочками туда же, ¼ стакана воды, под крышкой 5 мин','Чеснок, перец, с рисом']],
 ['chickpump','Курица, тушённая с тыквой, и рис',['lunch'],[['chicken',180],['pumpkin',250],['onion',50],['rice',30],['oil',5]],['Лук и курицу кубиками обжарить 3 мин','Тыкву кубиками, ½ стакана воды, куркума','Под крышкой 12 мин, с рисом']],
 ['fishsweet','Рыба на пару с бататом и зеленью',['lunch'],[['fish',200],['sweet',250],['greens',150]],['Батат кусками на пару в рисоварке 20 мин','Рыбу на решётку к батату на последние 10 мин, лимон, имбирь','Водяной шпинат 2 мин в кипятке, чеснок']],
 ['thighrice','Курица с куркумой, рис и огурец',['lunch'],[['chicken',180],['rice',50],['cucumber',1]],['Филе натереть куркумой, солью, перцем','Полосками на сковороду 8–10 мин, средний огонь','С рисом и огурцом']],
 ['banhmichick','Бань ми с курицей и овощами',['lunch'],[['bread',2],['chicken',150],['cucumber',1],['carrot',50]],['Курицу полосками 6 мин на сковороде, перец, чеснок','Морковь соломкой, огурец полосками','Багеты подогреть 1 мин, начинить курицей и овощами']],
 ['beefgreens','Говядина с водяным шпинатом и рисом',['lunch'],[['beef',150],['rice',50],['greens',150],['cucumber',1]],['Рис из рисоварки','Говядину тонко, 2 мин на сильном огне с чесноком','Водяной шпинат кусками туда же на 2 мин, перец, лайм','С рисом и огурцом']],
 ['shrimpcab','Креветки с капустой, морковью и рисом',['lunch'],[['shrimp',180],['rice',40],['carrot',80],['cabbage',100],['oil',5]],['Морковь и капусту соломкой 3 мин на сковороде','Креветки туда же на 2 мин, чеснок, перец','С рисом из рисоварки, лайм']],
 # ---- ужины
 ['omelet','Омлет с курицей и овощами',['dinner'],[['egg',2],['chicken',100],['veg',200]],['Курицу мелко и обжарить 5 мин без масла','Овощи на 3 мин','Залить взбитыми яйцами, под крышкой 4 мин']],
 ['squidsalad','Тёплый салат с кальмаром',['dinner'],[['squid',200],['cucumber',1],['tomato',100],['oil',5]],['Кальмар кольцами в кипяток на 1 мин','Огурец и помидоры нарезать','Смешать, масло, лайм, соль, чили']],
 ['chickmush','Курица с грибами',['dinner'],[['chicken',200],['mushroom',150],['veg',100],['oil',5]],['Курицу полосками 6 мин на сковороде','Грибы и овощи туда же на 5 мин','Соль, перец, чеснок']],
 ['fishtom','Рыба в помидорах',['dinner'],[['fish',200],['tomato',200],['veg',100],['oil',5]],['Помидоры кубиками 3 мин на сковороде','Рыбу сверху, под крышку на 8 мин','Овощи сбоку на пару минут, перец, лайм']],
 ['beefpep','Говядина с болгарским перцем и луком',['dinner'],[['beef',150],['bellpep',150],['onion',50],['oil',5]],['Перец и лук полосками 3 мин на сильном огне','Говядину тонко туда же на 2 мин','Чеснок, чёрный перец, соль']],
 ['gingchick','Курица с имбирём и бок-чоем',['dinner'],[['chicken',200],['bokchoy',200],['oil',5]],['Курицу полосками 6 мин с тёртым имбирём и чесноком','Бок-чой разрезать вдоль, туда же на 2–3 мин','Соль, перец']],
 ['tunasalad','Салат с тунцом, яйцом и овощами',['dinner','late'],[['tunaw',2],['egg',1],['cucumber',1],['tomato',150],['oil',5]],['Тунец без жидкости, яйцо из запаса','Огурец и помидоры нарезать','Смешать, масло, лайм, перец — готовить не нужно']],
 ['shrimpbroc','Креветки с брокколи и чесноком',['dinner'],[['shrimp',200],['broccoli',200],['oil',5]],['Брокколи 3 мин в кипятке','Креветки 2–3 мин на сильном огне с чесноком','Брокколи туда же на 1 мин, перец, лайм']],
 ['porkgreens','Свинина с водяным шпинатом и чесноком',['dinner'],[['pork',180],['greens',250],['oil',5]],['Свинину тонко 5 мин на сковороде','Водяной шпинат с чесноком туда же на 2–3 мин на сильном огне','Соль, перец']],
 ['meatballs','Тефтели из фарша в томате',['dinner'],[['mince',150],['tomato',200],['onion',50]],['Фарш с солью и перцем скатать в шарики','Помидоры и лук 3 мин на сковороде','Тефтели туда же, под крышку на 10 мин']],
 ['tofumince','Тофу с фаршем в томате',['dinner'],[['tofu',200],['mince',80],['tomato',150]],['Фарш на сухую сковороду 4 мин','Помидоры кубиками туда же на 3 мин','Тофу кубиками, под крышку на 5 мин, перец, зелёный лук']],
 ['squidpep','Кальмар с перцем и луком',['dinner'],[['squid',200],['bellpep',150],['onion',50],['oil',5]],['Перец и лук 3 мин на сильном огне','Кальмар кольцами туда же ровно на 2 мин','Чеснок, перец, лайм']],
 ['fishpan','Рыба на сковороде с овощами',['dinner'],[['fish',200],['veg',200],['oil',5]],['Рыбу посолить, поперчить, 3–4 мин с каждой стороны','Овощи туда же или рядом на 3 мин','Лайм, чеснок']],
 ['shrimppump','Креветки с тыквой',['dinner'],[['shrimp',150],['pumpkin',250],['onion',50]],['Тыкву кусками на пару в рисоварке 15 мин','Лук полукольцами 3 мин на сковороде, креветки туда же на 2–3 мин','Тыкву к креветкам, перец, соль']],
 # ---- поздний перекус
 ['eggcuke','Яйца с огурцом и помидором',['late'],[['egg',3],['cucumber',1],['tomato',100]],['Яйца из запаса, овощи нарезать, соль и перец']],
 ['tofuveg','Тофу с овощами',['late'],[['tofu',150],['veg',100]],['Тофу и овощи на сухую сковороду на 5 мин']],
 ['tunacuke','Тунец с огурцом',['late'],[['tunaw',1],['cucumber',1]],['Тунец без жидкости, огурец нарезать, перец и лайм']],
 ['sardveg','Сардины с помидором',['late'],[['sardine',1],['tomato',100]],['Сардины из банки, помидор нарезать — готовить не нужно']],
 # ---- неделя 6–12 окт (по чеку): блюда без приёмов не предлагаются в выборе
 ['chickzuc','Курица с кабачками и рисом',['lunch'],[['chicken',180],['zucchini',200],['rice',40],['cucumber',1],['tomato',100]],['Кабачки кружками 4–5 мин на сухой антипригарной сковороде','Курицу полосками туда же 6 мин, чеснок, перец, соль','С рисом; огурец и помидор нарезать']],
 ['thighgreens','Бёдра с водяным шпинатом и рисом',[],[['thigh',220],['greens',200],['rice',40]],['С бёдер снять кожу, нарезать полосками','8–10 мин на сухой сковороде, чеснок','Водяной шпинат туда же на 2–3 мин на сильном огне','С рисом']],
 ['thighgreensd','Бёдра с водяным шпинатом',[],[['thigh',220],['greens',300]],['С бёдер снять кожу, нарезать полосками','8–10 мин на сухой сковороде, чеснок','Водяной шпинат туда же на 2–3 мин на сильном огне']],
 ['chickmushz','Курица с грибами и кабачками',['dinner'],[['chicken',220],['mushroom',250],['zucchini',150]],['Грибы и кабачки 5 мин на сухой сковороде','Курицу полосками туда же 6 мин','Соль, перец, чеснок']],
 ['shrimpcab2','Креветки с капустой, морковью и рисом',['lunch'],[['shrimp',180],['rice',40],['carrot',80],['cabbage',150],['cucumber',1]],['Капусту и морковь соломкой 4 мин на сухой сковороде, 2 ст. л. воды','Креветки туда же на 2–3 мин, чеснок, перец','С рисом, лайм']],
 ['fishtomz','Рыба баса в помидорах с кабачками',['dinner'],[['fish',270],['tomato',200],['zucchini',150]],['Помидоры и кабачки 4 мин на сковороде без масла','Рыбу кусками сверху, под крышку на 8 мин','Перец, лайм, зелень']],
 ['thighpot','Бёдра с картофелем и капустой',[],[['thigh',220],['potato',250],['cabbage',150],['tomato',100]],['Картофель кубиками на пару в рисоварке 15 мин','С бёдер снять кожу, полосками 8–10 мин на сухой сковороде','Капусту туда же на 4 мин, затем картофель, перец, чеснок']],
 ['chickcab','Курица с капустой и морковью',['dinner'],[['chicken',220],['cabbage',200],['carrot',100]],['Капусту и морковь соломкой 5 мин на сухой сковороде, 2 ст. л. воды','Курицу полосками туда же 6 мин','Соль, перец, чеснок']],
 ['chickbroc','Курица с брокколи и рисом',['lunch'],[['chicken',200],['broccoli',250],['rice',40],['tomato',100]],['Брокколи соцветиями 3 мин в кипятке или на пару','Курицу полосками 6 мин на сухой сковороде, чеснок','Брокколи туда же на 1 мин, с рисом и помидором']],
 ['thightom','Бёдра в помидорах с кабачками',[],[['thigh',220],['tomato',200],['zucchini',150],['onion',50]],['С бёдер снять кожу, кусочками 8 мин на сухой сковороде','Лук, помидоры и кабачки туда же','Под крышкой 8 мин, перец, соль']],
 ['fishpump','Рыба на пару с тыквой и брокколи',['lunch'],[['fish',270],['pumpkin',300],['broccoli',200]],['Тыкву кусками на пару в рисоварке 15 мин','Рыбу и брокколи туда же на последние 10 мин','Соль, перец, лайм']],
 ['shrimptofu','Креветки с тофу в помидорах',['dinner'],[['shrimp',140],['tofu',150],['tomato',200]],['Помидоры кубиками 3 мин на сковороде без масла','Тофу кубиками туда же на 4 мин','Креветки на 2–3 мин, перец, зелёный лук']],
 ['tofuzuc','Тофу с кабачками',['late'],[['tofu',150],['zucchini',150]],['Тофу и кабачки кубиками 5 мин на сухой сковороде, соль, перец']],
 ['tunaveg','Тунец с огурцом и помидором',['late'],[['tunaw',1],['cucumber',1],['tomato',100]],['Тунец без жидкости, огурец и помидор нарезать, перец и лайм']],
 ['oatjack','Овсянка с джекфрутом и варёные яйца',['bf'],[['egg',3],['oats',50],['jackfruit',100]],['Овсянку залить кипятком на 5 мин','Джекфрут кусочками сверху','Яйца из запаса']],
]
RB = {r[0]: r for r in R}
SNACKF = [['apple',1],['banana',1],['mango',1],['orange',1],['pineapple',200],['dragon',200],['papaya',200]]
TYPES = ['S','W','S','S','W','R','S']
W = [
 [('oatban','friedrice','shrimpbroc','eggcuke'),('omtom','beefgreens','fishpan','tunacuke'),('oatban','thighrice','porkgreens','tunacuke'),('sweeteggs','shrimpcab','chickmush','eggcuke'),('tunabm','chickpump','squidpep','tofuveg'),('oatmango','curry','meatballs','tunacuke'),('oatban','porkpot','fishtom','sardveg')],
 [('oatban','beefbroc','gingchick','eggcuke'),('sweeteggs','thighrice','tunasalad','tofuveg'),('omtom','mincebeans','shrimpbroc','eggcuke'),('oatban','fishsweet','omelet','eggcuke'),('oatmango','friedrice','squidsalad','tunacuke'),('tunabm','curry','porkgreens','tofuveg'),('oatban','tunarice','beefpep','eggcuke')],
 [('oatban','porkstir','shrimppump','eggcuke'),('oatban','curry','fishtom','eggcuke'),('sweeteggs','shrimprice','tofumince','tunacuke'),('oatban','chickpump','beefpep','tunacuke'),('tunabm','beefgreens','fishpan','eggcuke'),('sweeteggs','banhmichick','shrimpbroc','eggcuke'),('oatban','thighrice','squidpep','tunacuke')],
 [('oatban','tofutom','gingchick','tunacuke'),('sweeteggs','shrimpcab','meatballs','tunacuke'),('oatban','beefbroc','tunasalad','eggcuke'),('oatban','friedrice','porkgreens','eggcuke'),('oatmango','fishsweet','chickmush','eggcuke'),('tunabm','mincebeans','squidsalad','tunacuke'),('oatban','curry','fishtom','eggcuke')],
]
CARB = {'rice','potato','sweet','bread','oats','corn','pumpkin'}
MEAT = {'chicken','thigh','fish','shrimp','squid','pork','beef','mince','tofu','tunaw','sardine','egg'}

def opts(p, q):
    """варианты количества для гибкого продукта (с разумными пределами порций)"""
    if P[p][4]:  # штучное
        hi = 3 if p == 'egg' else q + 1
        return sorted({x for x in (q - 1, q, q + 1) if 1 <= x <= hi})
    lo, hi = max(10, q * 0.6), q * 1.5
    if p in MEAT: lo, hi = max(lo, 100), min(max(hi, q * 1.6), 280 if p in ('chicken','fish','shrimp','squid') else 250)
    if p == 'rice': lo = max(lo, 30)
    return [x for x in range(int(-(-lo // 10) * 10), int(hi) + 1, 10)]

def pen(t, cpre):
    k, p, f, c = t
    s = 0
    s += max(0, 1890 - k) ** 2 + max(0, k - 1990) ** 2
    s += 6 * (max(0, 192 - p) ** 2 + max(0, p - 206) ** 2)
    s += 8 * (max(0, 55 - f) ** 2 + max(0, f - 59) ** 2)
    s += 8 * (max(0, 122 - c) ** 2 + max(0, c - 142) ** 2)
    s += 0.01 * (k - 1945) ** 2
    s += 2000 * max(0, 0.6 - cpre / max(c, 1))   # большая часть углеводов до 16:00
    return s

KIMD={'porkgreens','beefpep','gingchick','chickmush','squidpep','meatballs','tofumince','omelet','shrimpbroc'}
def build_day(typ, bf, lunch, dinner, late, fruit):
    meals = []
    if typ == 'S': meals.append(['pre', [['protein', 30], ['creatine', 5]], None])
    b = [list(x) for x in RB[bf][3]] + ([['creatine', 5]] if typ != 'S' else [])
    meals.append(['bf', b, bf])
    meals.append(['lunch', [list(x) for x in RB[lunch][3]] + [['kimchi', 150]], lunch])
    meals.append(['snack', [['protein', 30], list(fruit), ['nuts', 20]], None])
    meals.append(['dinner', [list(x) for x in RB[dinner][3]] + ([['kimchi', 100]] if dinner in KIMD else []), dinner])
    meals.append(['late', [list(x) for x in RB[late][3]], late])
    return meals

def flex_vars(meals):
    """какие продукты подстраиваем: углевод обеда, углевод завтрака, белок ужина, белок обеда, орехи, масло ужина"""
    v = []
    M = {m[0]: m for m in meals}
    def first(slot, S):
        for it in M[slot][1]:
            if it[0] in S: return it
    for slot, S in [('lunch', CARB), ('bf', CARB), ('dinner', MEAT), ('lunch', MEAT), ('late', MEAT), ('bf', {'egg'})]:
        it = first(slot, S)
        if it and all(it is not x for x in v): v.append(it)
    v.append(M['snack'][1][2])  # орехи
    v.append(M['snack'][1][0])  # протеин в перекусе
    if not P[M['snack'][1][1][0]][4]: v.append(M['snack'][1][1])  # фрукт в граммах
    oil = [it for it in M['dinner'][1] if it[0] == 'oil']
    if oil: v.append(oil[0])
    return v

def solve(meals):
    v = flex_vars(meals)
    base = [it[1] for it in v]
    choices = []
    for it in v:
        if it[0] == 'nuts': choices.append([10, 15, 20, 25, 30])
        elif it[0] == 'oil': choices.append([0, 5, 10])
        elif it[0] == 'protein': choices.append([30, 35, 40])
        else: choices.append(opts(it[0], it[1]))
    def score():
        t = [0] * 4; cpre = 0
        for m in meals:
            x = mac(m[1]); t = [a + b for a, b in zip(t, x)]
            if m[0] in ('pre', 'bf', 'lunch'): cpre += x[3]
        dev = sum(abs(it[1] - b) / (b or 1) for it, b in zip(v, base))
        return pen(t, cpre) + 8 * dev, t
    small = [i for i, it in enumerate(v) if it[0] in ('nuts', 'oil', 'protein') or P[it[0]][4]]
    big = [i for i in range(len(v)) if i not in small]
    bestall = None
    for combo in itertools.product(*[choices[i] for i in small]):
        for i, q in zip(small, combo): v[i][1] = q
        for i in big: v[i][1] = base[i]
        for _ in range(4):  # покоординатный спуск по граммам
            for i in big:
                bq, bs = v[i][1], None
                for q in choices[i]:
                    v[i][1] = q; sc = score()[0]
                    if bs is None or sc < bs: bq, bs = q, sc
                v[i][1] = bq
        sc = score()[0]
        if bestall is None or sc < bestall[0]: bestall = (sc, [it[1] for it in v])
    for it, q in zip(v, bestall[1]): it[1] = q
    best = (score()[0], [it[1] for it in v], score()[1])
    for it, q in zip(v, best[1]): it[1] = q
    return best

menus = []
for wi, week in enumerate(W):
    days = []
    for di, (bf, lunch, dinner, late) in enumerate(week):
        meals = build_day(TYPES[di], bf, lunch, dinner, late, SNACKF[(di + wi * 3) % 7])
        solve(meals)
        out = []
        for slot, items, rid in meals:
            items = [[p, q] for p, q in items if q > 0]
            out.append([slot, items, rid] if rid else [slot, items])
        days.append([TYPES[di], out])
    menus.append(days)

bad = MC.check(menus)
print('вне нормы:', bad)
if '--write' in sys.argv:
    (SRC / 'menus.json').write_text(json.dumps(menus, ensure_ascii=False, separators=(',', ':')), encoding='utf-8')
    print('записано: src/menus.json')
