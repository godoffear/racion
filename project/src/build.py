#!/usr/bin/env python3
"""Собирает index.html из исходников: src/head.html + src/app.js (+ меню из src/menus.json, справочник еды, мост к Android, оформление).
Запуск из корня:  python3 src/build.py
"""
import json, pathlib, re, sys
root = pathlib.Path(__file__).resolve().parent.parent
src = root / 'src'
head = (src / 'head.html').read_text(encoding='utf-8')
app = (src / 'app.js').read_text(encoding='utf-8')
menus = json.loads((src / 'menus.json').read_text(encoding='utf-8'))
old = json.loads((src / 'menus_old.json').read_text(encoding='utf-8'))  # меню до 4.9
pal = json.loads((root / 'design' / 'palettes.json').read_text(encoding='utf-8'))
assert len(menus) == 4 and all(len(w) == 7 for w in menus), 'menus.json: 4 недели по 7 дней (Вт–Пн)'
for m in ('__WEEKS__', '/*__FOODS__*/', '/*__NATIVE__*/', '/*__V2__*/', '/*__AI__*/', '/*__TASTE__*/', '/*__AIW__*/'):
    if m not in app:
        sys.exit(f'В app.js нет метки {m}')
app = app.replace('/*__FOODS__*/', (src / 'foods.js').read_text(encoding='utf-8'))
app = app.replace('/*__NATIVE__*/', (src / 'native.js').read_text(encoding='utf-8'))
app = app.replace('/*__AI__*/', (src / 'ai.js').read_text(encoding='utf-8'))
app = app.replace('/*__TASTE__*/', (src / 'taste.js').read_text(encoding='utf-8'))
app = app.replace('/*__AIW__*/', (src / 'prep.js').read_text(encoding='utf-8'))
app = app.replace('/*__V2__*/', (src / 'v2.js').read_text(encoding='utf-8').replace('__PALETTES__', json.dumps(pal, ensure_ascii=False, separators=(',', ':'))))
out = head + app.replace('__OLDWEEKS__', json.dumps(old, ensure_ascii=False, separators=(',', ':'))).replace('__WEEKS__', json.dumps(menus, ensure_ascii=False, separators=(',', ':'))) + '\n</script>\n</body>\n</html>\n'
(root / 'index.html').write_text(out, encoding='utf-8')
ver = re.search(r"APP_VERSION='([^']+)'", app)
print(f"index.html собран: {len(out)//1024} КБ (симв.), версия {ver.group(1) if ver else '?'}")
