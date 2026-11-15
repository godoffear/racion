# -*- coding: utf-8 -*-
"""Собирает папку ../ux-package для другой нейросети (UX-оформление): очищенные исходники + собранный index.html.
Личное убирается (лекарства, имя). Запуск из project/:  python3 tools/make_ux_package.py"""
import pathlib, shutil, re, subprocess, sys
root = pathlib.Path(__file__).resolve().parent.parent
out = root.parent / 'ux-package'
keep_docs = {'README_FOR_AI.md', 'ARCHITECTURE.md', 'SCREENS.md'}
# чистим всё, кроме docs/screenshots/demo_seed.js, которые ведём вручную
for p in out.glob('*'):
    if p.name in ('docs', 'screenshots', 'demo_seed.js'): continue
    shutil.rmtree(p) if p.is_dir() else p.unlink()
pr = out / 'project'
(pr / 'src').mkdir(parents=True); (pr / 'design').mkdir(parents=True)
for f in (root / 'src').iterdir():
    if f.suffix in ('.js', '.html', '.py', '.json'): shutil.copy(f, pr / 'src' / f.name)
shutil.copy(root / 'design' / 'palettes.json', pr / 'design' / 'palettes.json')
shutil.copytree(root / 'design' / 'icons2', pr / 'design' / 'icons2', ignore=shutil.ignore_patterns('*.png', 'widget.html', 'sheet.png'))
main = root / 'apk' / 'android' / 'app' / 'src' / 'main'
dst = pr / 'android-sources'
shutil.copytree(main / 'res', dst / 'res', ignore=shutil.ignore_patterns('mipmap-*', 'drawable-nodpi', 'drawable-port*', 'drawable-land*', '*.png'))
shutil.copytree(main / 'java', dst / 'java'); shutil.copy(main / 'AndroidManifest.xml', dst / 'AndroidManifest.xml')
# очистка личного
app = pr / 'src' / 'app.js'; s = app.read_text(encoding='utf-8')
s = re.sub(r"const MEDS=\{.*?\};", "const MEDS={from:'2000-01-01|1',to:'2000-01-02|0',list:[['Лекарство 1','','1 таблетка'],['Лекарство 2','','1 таблетка']],drops:['Капли','']};", s, count=1, flags=re.S)
s = s.replace('// Лекарства по рецепту 13 окт 2026 (воспаление левого уха)', '// Пример блока «лекарства после еды» (в этой копии данные заменены на примеры)')
app.write_text(s, encoding='utf-8')
for f in (pr / 'src').glob('*.js'):
    t = f.read_text(encoding='utf-8'); t2 = t.replace('Андрей', 'пользователь')
    if t2 != t: f.write_text(t2, encoding='utf-8')
(pr / 'src' / 'menu_gen.py').unlink(missing_ok=True) if sys.version_info >= (3, 8) else None
r = subprocess.run([sys.executable, 'src/build.py'], cwd=pr, capture_output=True, text=True); print(r.stdout.strip(), r.stderr.strip())
(out / 'app').mkdir(exist_ok=True); shutil.move(str(pr / 'index.html'), out / 'app' / 'index.html')
print('готово:', out)
