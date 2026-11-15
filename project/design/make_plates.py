#!/usr/bin/env python3
"""10 новых иконок «тарелка и приборы». Холст 108×108, безопасная зона — центр ~66×66. Пишет icons2/NN_*.svg (+ _fg/_bg)."""
import pathlib, math
out = pathlib.Path(__file__).parent / 'icons2'; out.mkdir(exist_ok=True)
CREAM = '#FBF6E6'

def grad(i, a, b, ang=150):
    r = math.radians(ang); x2 = .5 + .5*math.cos(r); y2 = .5 + .5*math.sin(r)
    return f'<defs><linearGradient id="{i}" x1="{1-x2:.2f}" y1="{1-y2:.2f}" x2="{x2:.2f}" y2="{y2:.2f}"><stop offset="0" stop-color="{a}"/><stop offset="1" stop-color="{b}"/></linearGradient></defs><rect width="108" height="108" fill="url(#{i})"/>'
flat = lambda c: f'<rect width="108" height="108" fill="{c}"/>'

def fork(x, y, c, s=1, rot=0):
    return (f'<g transform="translate({x} {y}) rotate({rot}) scale({s})" fill="{c}"><rect x="-6" y="0" width="2.3" height="18" rx="1.15"/><rect x="-1.15" y="0" width="2.3" height="18" rx="1.15"/>'
            f'<rect x="3.7" y="0" width="2.3" height="18" rx="1.15"/><path d="M-6 13h12v3a6 6 0 0 1-12 0z"/><rect x="-1.7" y="19" width="3.4" height="27" rx="1.7"/></g>')
def knife(x, y, c, s=1, rot=0):
    # лезвие смотрит влево — на тарелку (нож стоит справа от неё)
    return (f'<g transform="translate({x} {y}) rotate({rot}) scale({-s} {s})" fill="{c}"><path d="M-1.7 0C3.6 2 5.4 11 4.4 24H-1.7z"/><rect x="-1.7" y="23" width="3.4" height="23" rx="1.7"/></g>')
def spoon(x, y, c, s=1, rot=0):
    return (f'<g transform="translate({x} {y}) rotate({rot}) scale({s})" fill="{c}"><ellipse cx="0" cy="8" rx="6.2" ry="8.6"/><rect x="-1.7" y="14" width="3.4" height="32" rx="1.7"/></g>')
def plate(cx, cy, r, fill=CREAM, ring='#2C8F72', sw=2):
    return f'<circle cx="{cx}" cy="{cy}" r="{r}" fill="{fill}"/><circle cx="{cx}" cy="{cy}" r="{r*.7:.1f}" fill="none" stroke="{ring}" stroke-width="{sw}"/>'
leaf = lambda cx, cy, c, s=1, rot=-35: f'<g transform="translate({cx} {cy}) rotate({rot}) scale({s})"><path d="M0 -9C8 -6 9 4 0 10C-9 4 -8 -6 0 -9z" fill="{c}"/><path d="M0 -6V8" stroke="{CREAM}" stroke-width="1.2" stroke-linecap="round"/></g>'

I = []
# 1 Классика: вилка и нож по бокам, листик на тарелке
I.append(('classic', 'Классика', grad('a1', '#34A07F', '#124A3B'), plate(54, 54, 20) + leaf(54, 54, '#2C8F72', .9) + fork(27, 31, CREAM) + knife(81, 31, CREAM)))
# 2 Скрещённые приборы под тарелкой
def thru(fn, c, rot, s=1):
    return f'<g transform="translate(54 54) rotate({rot}) translate(0 -{23*s})">' + fn(0, 0, c, s) + '</g>'
I.append(('cross', 'Скрещённые', grad('a2', '#1E5C49', '#0B2F25'), thru(fork, '#F2B632', 40, 1.3) + thru(spoon, '#F2B632', -40, 1.3) + plate(54, 54, 17, CREAM, '#1E6B55', 2) + leaf(54, 54, '#1E6B55', .7)))
# 3 Круглый значок
I.append(('badge', 'Значок', flat('#F4ECD6'), '<circle cx="54" cy="54" r="34" fill="#1E6B55"/>' + plate(54, 54, 14, CREAM, '#1E6B55', 1.8) + fork(30, 39, CREAM, .6) + knife(78, 39, CREAM, .6)))
# 4 Тёплая: оранжевый закат
I.append(('sunset', 'Закат', grad('a4', '#F7A84F', '#CF5B2C'), plate(54, 54, 22, '#FFF6E6', '#E07B39', 2) + '<circle cx="54" cy="54" r="9" fill="#E07B39"/><circle cx="54" cy="54" r="4.5" fill="#FFF6E6"/>' + fork(26.5, 31, '#FFF6E6') + spoon(81.5, 31, '#FFF6E6')))
# 5 Тарелка с долями БЖУ
pie = ''
cx = cy = 54; r = 13.5
for a0, a1, c in ((-90, 30, '#2C8F72'), (30, 140, '#E2AE3C'), (140, 270, '#4A73B0')):
    x0 = cx + r*math.cos(math.radians(a0)); y0 = cy + r*math.sin(math.radians(a0)); x1 = cx + r*math.cos(math.radians(a1)); y1 = cy + r*math.sin(math.radians(a1))
    pie += f'<path d="M{cx} {cy}L{x0:.2f} {y0:.2f}A{r} {r} 0 {1 if a1-a0>180 else 0} 1 {x1:.2f} {y1:.2f}z" fill="{c}"/>'
I.append(('macro', 'Тарелка БЖУ', flat('#10201A'), '<circle cx="54" cy="54" r="23" fill="' + CREAM + '"/>' + pie + fork(26, 31, '#CFE3D8') + spoon(82, 31, '#CFE3D8')))
# 6 Готово: галочка на тарелке
I.append(('done', 'Готово', grad('a6', '#2AA29B', '#0F5560'), plate(54, 54, 22, CREAM, '#2AA29B', 2) + '<path d="M44.5 54.5l7 7 12-14" stroke="#0F5560" stroke-width="4.6" fill="none" stroke-linecap="round" stroke-linejoin="round"/>' + fork(26, 31, CREAM) + knife(82, 31, CREAM)))
# 7 Контур золотом
st = '#F2B632'
I.append(('line', 'Контур', flat('#0E3B3F'), f'<circle cx="54" cy="54" r="21" fill="none" stroke="{st}" stroke-width="3"/><circle cx="54" cy="54" r="13" fill="none" stroke="{st}" stroke-width="1.6" opacity=".7"/>' +
          f'<g fill="none" stroke="{st}" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M22 31v14a4.5 4.5 0 0 0 9 0V31M26.5 31v32M26.5 45v26"/><path d="M82 31c5 3 6 12 5 22H82zM82 53v18"/></g>'))
# 8 Еда на тарелке (рис, брокколи, яйцо)
food = ('<circle cx="54" cy="54" r="28" fill="#E6DAB9"/><circle cx="54" cy="54" r="25" fill="#FFFDF6"/>'
        '<ellipse cx="46" cy="58" rx="9" ry="7" fill="#F4E9C8"/><circle cx="43" cy="55" r="1.3" fill="#E2D5AC"/><circle cx="48" cy="57" r="1.3" fill="#E2D5AC"/><circle cx="46" cy="61" r="1.3" fill="#E2D5AC"/>'
        '<g fill="#3E9B5E"><circle cx="63" cy="46" r="5"/><circle cx="68" cy="51" r="4.2"/><circle cx="60" cy="51" r="3.8"/></g><rect x="62" y="52" width="2.6" height="7" rx="1.3" fill="#2F7C49"/>'
        '<ellipse cx="55" cy="44" rx="7.5" ry="6" fill="#fff" stroke="#E7E1CF" stroke-width=".8"/><circle cx="55" cy="44" r="3" fill="#F5A021"/>')
I.append(('food', 'С едой', flat('#F3E9D2'), food + fork(21.5, 31, '#1E6B55', .9) + spoon(86.5, 31, '#1E6B55', .9)))
# 9 Рассвет с паром
steam = '<g stroke="#14503F" stroke-width="2.8" fill="none" stroke-linecap="round" opacity=".85"><path d="M47 32c-3-3 3-5 0-9"/><path d="M54 32c-3-3 3-5 0-9"/><path d="M61 32c-3-3 3-5 0-9"/></g>'
I.append(('steam', 'Горячее', grad('a9', '#FFD25E', '#F08A3A'), steam + plate(54, 60, 19, '#FFFDF4', '#F08A3A', 2) + fork(27, 38, '#14503F', .8) + knife(81, 38, '#14503F', .8)))
# 10 Салфетка-подложка
I.append(('mat', 'Сервировка', flat('#F6EFDB'), '<rect x="17" y="22" width="74" height="64" rx="11" fill="#1E6B55"/>' + plate(54, 54, 19, CREAM, '#1E6B55', 2) + fork(28.5, 33, CREAM, .72) + knife(79.5, 33, CREAM, .72)))

def svg(inner, clip=False):
    c = '<clipPath id="cp"><rect width="108" height="108" rx="24"/></clipPath><g clip-path="url(#cp)">' if clip else '<g>'
    return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 108 108" width="432" height="432">{c}{inner}</g></svg>'
names = []
for n, (id_, name, bg, fg) in enumerate(I, 1):
    k = f'{n:02d}'
    (out/f'{k}_{id_}.svg').write_text(svg(bg+fg, True), encoding='utf-8')
    (out/f'{k}_fg.svg').write_text(f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 108 108">{fg}</svg>', encoding='utf-8')
    (out/f'{k}_bg.svg').write_text(f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 108 108">{bg}</svg>', encoding='utf-8')
    names.append(f'{k} {id_} {name}')
(out/'names.txt').write_text('\n'.join(names), encoding='utf-8')
print(len(I))
