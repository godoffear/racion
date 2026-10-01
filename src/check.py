#!/usr/bin/env python3
"""Скриншоты index.html на ширине телефона (360×780) и горизонтально (780×360) + поиск ошибок JS
и элементов, вылезающих за экран. Нужен Playwright с Chromium:  pip install playwright && playwright install chromium
Запуск: python3 src/check.py [ГГГГ-ММ-ДДTЧЧ:ММ]   — дату можно подменить, чтобы проверить нужный день.
Скриншоты ложатся в /tmp/racion-*.png
"""
import asyncio, pathlib, sys
from playwright.async_api import async_playwright
when = sys.argv[1] if len(sys.argv) > 1 else None
FILE = (pathlib.Path(__file__).resolve().parent.parent / 'index.html').as_uri()
INIT = ("(()=>{const RD=Date,fix=new RD('%s').getTime();class FD extends RD{constructor(...a){if(a.length)super(...a);else super(fix)}"
        "static now(){return fix}};window.Date=FD})();" % when) if when else ''
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch()
        for w, h, tag in [(360, 780, 'p'), (780, 360, 'l')]:
            pg = await b.new_page(viewport={'width': w, 'height': h}); errs = []
            pg.on('pageerror', lambda e: errs.append(str(e)))
            if INIT: await pg.add_init_script(INIT)
            await pg.goto(FILE); await pg.wait_for_timeout(300)
            for t in ['today', 'menu', 'shop', 'weight']:
                await pg.click(f'[data-a="tab"][data-v="{t}"]'); await pg.wait_for_timeout(150)
                wide = await pg.evaluate("[...document.querySelectorAll('#app *')].filter(e=>e.getBoundingClientRect().right>innerWidth+1).slice(0,3).map(e=>e.tagName+'.'+e.className)")
                await pg.screenshot(path=f'/tmp/racion-{tag}-{t}.png', full_page=True)
                print(f'{w}×{h} {t}: ' + ('OK' if not wide else 'вылезает: ' + ', '.join(wide)))
            if errs: print('Ошибки JS:', errs)
            await pg.close()
        await b.close()
asyncio.run(main())
