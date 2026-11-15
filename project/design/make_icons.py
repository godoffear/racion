#!/usr/bin/env python3
"""10 вариантов иконки «Рацион». Каждая: фон (bg) + значок (fg) на холсте 108×108 (адаптивная иконка Android,
безопасная зона — центр ~66×66). Пишет icons/NN_name.svg (полная), icons/NN_fg.svg, icons/NN_bg.svg."""
import pathlib
out = pathlib.Path(__file__).parent / 'icons'; out.mkdir(exist_ok=True)

def grad(id_, a, b, ang=135):
    import math
    r = math.radians(ang); x2 = .5 + .5*math.cos(r); y2 = .5 + .5*math.sin(r)
    return f'<defs><linearGradient id="{id_}" x1="{1-x2:.2f}" y1="{1-y2:.2f}" x2="{x2:.2f}" y2="{y2:.2f}"><stop offset="0" stop-color="{a}"/><stop offset="1" stop-color="{b}"/></linearGradient></defs><rect width="108" height="108" fill="url(#{id_})"/>'
def flat(c): return f'<rect width="108" height="108" fill="{c}"/>'

I = []
# 1. Тарелка и приборы — зелёный
I.append(('plate','Тарелка и приборы', grad('g1','#2C8F72','#14503F'),
 '<circle cx="54" cy="54" r="21" fill="#F4F7F2"/><circle cx="54" cy="54" r="14.5" fill="none" stroke="#2C8F72" stroke-width="2.2"/>'
 '<g fill="#F4F7F2"><rect x="23" y="35" width="3" height="38" rx="1.5"/><path d="M20.5 35h8v9a4 4 0 0 1-8 0z" opacity=".0"/>'
 '<rect x="19.5" y="35" width="2.2" height="12" rx="1.1"/><rect x="23.3" y="35" width="2.2" height="12" rx="1.1"/><rect x="27.1" y="35" width="2.2" height="12" rx="1.1"/><path d="M19.5 45h9.8v3a4.9 4.9 0 0 1-9.8 0z"/>'
 '<rect x="22.9" y="48" width="2.8" height="26" rx="1.4"/>'
 '<path d="M85 35c-4 0-6.5 6-6.5 12 0 4 1.7 6 3.4 6.5V74a1.4 1.4 0 0 0 2.8 0V53.5c1.7-.5 3.4-2.5 3.4-6.5 0-6-2.5-12-6.5-12z" transform="translate(-2 0)"/></g>'))
# 2. Листок
I.append(('leaf','Листок', grad('g2','#3FA37C','#0F4A38',160),
 '<path d="M30 70C28 44 46 26 78 28c2 32-14 50-40 48" fill="#EAF6EE"/><path d="M33 73C44 58 54 48 70 38" stroke="#2C8F72" stroke-width="3.4" fill="none" stroke-linecap="round"/>'
 '<path d="M44 62c4-1 8-1 12 1M52 53c4 0 7 0 10 2" stroke="#2C8F72" stroke-width="2.4" fill="none" stroke-linecap="round"/>'))
# 3. Монограмма Р
I.append(('mono','Монограмма «Р»', grad('g3','#256F59','#0B2F25',150),
 '<path d="M38 80V28h19c11 0 17.5 6 17.5 15.5S68 59 57 59H49v21z M49 38v11h8c4.5 0 7-2 7-5.5S61.500 38 57 38z" fill="#F6EFD9" fill-rule="evenodd"/>'
 '<circle cx="73" cy="73" r="5.5" fill="#F2B632"/>'))
# 4. Кольцо БЖУ
I.append(('macro','Кольцо БЖУ', flat('#0F1A16'),
 '<g fill="none" stroke-width="9" stroke-linecap="round" transform="rotate(-90 54 54)"><circle cx="54" cy="54" r="24" stroke="#243A32"/>'
 '<circle cx="54" cy="54" r="24" stroke="#5BBE99" stroke-dasharray="62 150" /><circle cx="54" cy="54" r="24" stroke="#E2AE3C" stroke-dasharray="34 150" stroke-dashoffset="-68"/>'
 '<circle cx="54" cy="54" r="24" stroke="#7FA3DA" stroke-dasharray="36 150" stroke-dashoffset="-108"/></g>'
 '<text x="54" y="61" text-anchor="middle" font-family="Arial,Helvetica,sans-serif" font-weight="800" font-size="20" fill="#E4EDE8">Р</text>'))
# 5. Яблоко
I.append(('apple','Яблоко', flat('#F6EFDF'),
 '<path d="M54 36c-6-5-20-4-22 10-2 15 8 31 18 31 2 0 3-1 4-1s2 1 4 1c10 0 20-16 18-31-2-14-16-15-22-10z" fill="#D8412F"/>'
 '<path d="M54 36c0-6 3-11 9-13" stroke="#5A3A1A" stroke-width="3.4" fill="none" stroke-linecap="round"/><path d="M58 31c6-7 14-6 17-4-2 7-9 11-17 4z" fill="#3E9B5E"/>'
 '<path d="M40 46c1-4 4-6 7-6" stroke="#fff" stroke-opacity=".55" stroke-width="3" fill="none" stroke-linecap="round"/>'))
# 6. Миска с паром
I.append(('bowl','Миска с паром', grad('g6','#F08A4B','#C2512B',160),
 '<path d="M27 56h54c0 15-11 26-27 26S27 71 27 56z" fill="#FFF3E2"/><rect x="25" y="53" width="58" height="5" rx="2.5" fill="#FFF3E2"/>'
 '<g stroke="#FFF3E2" stroke-width="3.6" fill="none" stroke-linecap="round"><path d="M42 44c-4-4 4-7 0-12"/><path d="M54 44c-4-4 4-7 0-12"/><path d="M66 44c-4-4 4-7 0-12"/></g>'))
# 7. Гантель и вилка
I.append(('fit','Гантель', grad('g7','#2B2F36','#0F1114',150),
 '<g fill="#C6F24E"><rect x="24" y="40" width="9" height="28" rx="3"/><rect x="75" y="40" width="9" height="28" rx="3"/><rect x="33" y="44" width="7" height="20" rx="2.5"/><rect x="68" y="44" width="7" height="20" rx="2.5"/><rect x="40" y="51" width="28" height="6" rx="3"/></g>'
 '<path d="M54 74l4 5h-8z" fill="#C6F24E" opacity="0"/>'))
# 8. Яичница
I.append(('egg','Яичница', flat('#FFD65A'),
 '<path d="M30 52c-4-12 6-22 18-22 6-6 20-4 24 6 10 2 14 14 6 22-2 10-14 12-22 8-10 6-26 2-26-14z" fill="#FFFDF5" transform="translate(-1 3)"/>'
 '<circle cx="54" cy="56" r="13" fill="#F5A021"/><circle cx="49.500" cy="51.500" r="4" fill="#fff" fill-opacity=".55"/>'))
# 9. Весы
I.append(('scale','Кухонные весы', grad('g9','#1E8C8C','#0E4C54',150),
 '<rect x="26" y="40" width="56" height="38" rx="9" fill="#EAF7F5"/><path d="M38 40a16 16 0 0 1 32 0z" fill="#fff" opacity="0"/>'
 '<path d="M36 56a18 18 0 0 1 36 0" stroke="#1E8C8C" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M54 56l7-8" stroke="#D8412F" stroke-width="3.2" stroke-linecap="round"/><circle cx="54" cy="56" r="3" fill="#0E4C54"/>'
 '<rect x="38" y="31" width="32" height="7" rx="3.5" fill="#EAF7F5"/>'))
# 10. Галочка на тарелке
I.append(('check','Галочка', grad('g10','#7B5FD0','#3C2A86',150),
 '<circle cx="54" cy="54" r="26" fill="none" stroke="#F1ECFF" stroke-width="6"/><circle cx="54" cy="54" r="15.500" fill="#F1ECFF"/>'
 '<path d="M47 54l5.5 5.500L62.500 48" stroke="#5B3FB0" stroke-width="4.200" fill="none" stroke-linecap="round" stroke-linejoin="round"/>'))

def svg(inner, clip=False):
    c = '<clipPath id="cp"><rect width="108" height="108" rx="24"/></clipPath><g clip-path="url(#cp)">' if clip else '<g>'
    return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 108 108" width="432" height="432">{c}{inner}</g></svg>'
import re
for n,(id_,name,bg,fg) in enumerate(I,1):
    k = f'{n:02d}'
    if n==1: fg='<g transform="translate(54 54) scale(.84) translate(-54 -54)">'+fg+'</g>'
    (out/f'{k}_{id_}.svg').write_text(svg(bg+fg,True),encoding='utf-8')
    (out/f'{k}_fg.svg').write_text(f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 108 108">{fg}</svg>',encoding='utf-8')
    (out/f'{k}_bg.svg').write_text(f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 108 108">{bg}</svg>',encoding='utf-8')
(out/'names.txt').write_text('\n'.join(f'{n:02d} {i[0]} {i[1]}' for n,i in enumerate(I,1)),encoding='utf-8')
print(len(I),'icons')
