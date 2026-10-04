#!/usr/bin/env python3
"""Проверка Тренера: скриншоты 360×780 и 780×360, ошибки JS, элементы, вылезающие за экран.
Запускает локальный сервер из корня репозитория (IndexedDB и service worker не работают с file://).
Запуск из корня репозитория:  python3 trener/dev/check.py [ГГГГ-ММ-ДДTЧЧ:ММ]
Скриншоты ложатся в /tmp/trener-*.png
"""
import asyncio, functools, http.server, pathlib, sys, threading
from playwright.async_api import async_playwright

ROOT = pathlib.Path(__file__).resolve().parents[2]
when = sys.argv[1] if len(sys.argv) > 1 else None
INIT = ("(()=>{const RD=Date,fix=new RD('%s').getTime();class FD extends RD{constructor(...a){if(a.length)super(...a);else super(fix)}"
        "static now(){return fix}};window.Date=FD})();" % when) if when else ''

class Quiet(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a): pass

srv = http.server.ThreadingHTTPServer(('127.0.0.1', 0), functools.partial(Quiet, directory=str(ROOT)))
threading.Thread(target=srv.serve_forever, daemon=True).start()
BASE = f'http://127.0.0.1:{srv.server_port}'
WIDE = "[...document.querySelectorAll('#app *, .sheet *')].filter(e=>e.getBoundingClientRect().right>innerWidth+1).slice(0,3).map(e=>e.tagName+'.'+e.className)"

async def shot(pg, name, label):
    wide = await pg.evaluate(WIDE)
    await pg.screenshot(path=f'/tmp/trener-{name}.png', full_page=True)
    print(f'{label}: ' + ('OK' if not wide else 'вылезает: ' + ', '.join(wide)))

async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch()
        # Рацион с service worker не должен подменять страницу Тренера
        ctx = await b.new_context()
        pg = await ctx.new_page(); await pg.goto(BASE + '/'); await pg.wait_for_timeout(1500)
        await pg.goto(BASE + '/'); await pg.wait_for_timeout(500)
        await pg.goto(BASE + '/trener/'); await pg.wait_for_timeout(500)
        print('Рацион не перехватывает /trener/:', 'OK' if await pg.title() == 'Тренер' else 'ОШИБКА — открылось «%s»' % await pg.title())
        await ctx.close()

        for w, h, tag in [(360, 780, 'p'), (780, 360, 'l')]:
            ctx = await b.new_context(viewport={'width': w, 'height': h})
            pg = await ctx.new_page(); errs = []
            pg.on('pageerror', lambda e: errs.append(str(e)))
            if INIT: await pg.add_init_script(INIT)
            await pg.goto(BASE + '/trener/'); await pg.wait_for_timeout(400)
            await shot(pg, f'{tag}-welcome', f'{w}×{h} первый запуск')
            await pg.fill('#s-weight', '82,5'); await pg.click('[data-a="welcome"]'); await pg.wait_for_timeout(200)
            for t in ['today', 'prog', 'stats', 'more']:
                await pg.click(f'[data-a="tab"][data-k="{t}"]'); await pg.wait_for_timeout(150)
                await shot(pg, f'{tag}-{t}', f'{w}×{h} {t}')
            await pg.click('[data-a="tab"][data-k="prog"]')
            await pg.click('[data-a="edit"][data-d="A"][data-i="0"]'); await pg.wait_for_timeout(150)
            await shot(pg, f'{tag}-edit', f'{w}×{h} правка упражнения')
            await pg.evaluate('history.back()'); await pg.wait_for_timeout(300)
            print('  «Назад» закрывает лист:', 'OK' if not await pg.query_selector('.sheet') else 'НЕТ')
            await pg.click('[data-a="tab"][data-k="today"]')
            await pg.click('[data-a="walk"]'); await pg.click('[data-a="w-min"][data-v="45"]'); await pg.fill('#w-steps', '6200')
            await pg.click('[data-a="w-save"]'); await pg.wait_for_timeout(200)
            await pg.click('.exl [data-a="tech"]') if await pg.query_selector('.exl [data-a="tech"]') else None
            await pg.wait_for_timeout(300)
            await shot(pg, f'{tag}-tech', f'{w}×{h} техника / сегодня')
            if errs: print('Ошибки JS:', errs)
            await ctx.close()
        await b.close()
    srv.shutdown()

asyncio.run(main())
