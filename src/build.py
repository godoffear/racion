#!/usr/bin/env python3
"""Собирает index.html из исходников: src/head.html + src/app.js (+ меню из src/menus.json).
Запуск из корня репозитория:  python3 src/build.py
"""
import json, pathlib, re, sys
root = pathlib.Path(__file__).resolve().parent.parent
src = root / 'src'
head = (src / 'head.html').read_text(encoding='utf-8')
app = (src / 'app.js').read_text(encoding='utf-8')
menus = json.loads((src / 'menus.json').read_text(encoding='utf-8'))
old = json.loads((src / 'menus_old.json').read_text(encoding='utf-8'))  # меню до 4.9
assert len(menus) == 4 and all(len(w) == 7 for w in menus), 'menus.json: 4 недели по 7 дней (Вт–Пн)'
if '__WEEKS__' not in app:
    sys.exit('В app.js нет метки __WEEKS__')
out = head + app.replace('__OLDWEEKS__', json.dumps(old, ensure_ascii=False, separators=(',', ':'))).replace('__WEEKS__', json.dumps(menus, ensure_ascii=False, separators=(',', ':'))) + '\n</script>\n</body>\n</html>\n'
(root / 'index.html').write_text(out, encoding='utf-8')
ver = re.search(r"APP_VERSION='([^']+)'", app)
print(f"index.html собран: {len(out)//1024} КБ, версия {ver.group(1) if ver else '?'}")
