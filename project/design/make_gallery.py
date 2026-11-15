import json,glob
pal=json.load(open('palettes.json'))
icons=sorted(f for f in glob.glob('icons/*.svg') if not f.endswith(('_fg.svg','_bg.svg')))
names={}
for l in open('icons/names.txt',encoding='utf-8').read().split('\n'):
    a=l.split(' ',2); names[a[0]]=a[2]
def mock(p,mode):
    c=p[mode]
    return ('<div class="mock" style="background:%(bg)s;color:%(ink)s"><div class="mh" style="color:%(muted)s">Сегодня</div>'
    '<div class="mc" style="background:%(surface)s;border-color:%(line)s"><b>Обед · 15:00</b><span style="color:%(muted)s">Курица, рис, кимчи</span><div class="bar" style="background:%(sunk)s"><i style="background:%(accent)s;width:62%%"></i></div>'
    '<div class="mm"><u style="background:%(p)s"></u><u style="background:%(f)s"></u><u style="background:%(c)s"></u></div></div>'
    '<div class="mc now" style="background:%(now)s;color:%(now-ink)s">Ближайший приём</div>'
    '<div class="btn" style="background:%(accent)s;color:%(accent-ink)s">Съел ✓</div></div>')%c
h='''<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Рацион — иконки и палитры</title>
<style>body{font:16px system-ui,sans-serif;margin:0;padding:20px;background:#f3f3f3;color:#111}h1{font-size:1.4rem}h2{margin-top:32px}
.g{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:16px}.i{background:#fff;border-radius:16px;padding:12px;text-align:center}.i svg{width:100%;height:auto}.i b{display:block;margin-top:6px}
.pg{display:grid;grid-template-columns:repeat(auto-fill,minmax(250px,1fr));gap:18px}.pc{background:#fff;border-radius:16px;padding:12px}.pc h3{margin:0 0 8px}.two{display:grid;grid-template-columns:1fr 1fr;gap:8px}
.mock{border-radius:14px;padding:10px;font-size:12px;min-height:150px}.mh{font-size:11px;margin-bottom:6px}.mc{border:1px solid;border-radius:10px;padding:8px;margin-bottom:6px;display:flex;flex-direction:column;gap:3px}.mc.now{border:0;font-weight:600}
.bar{height:6px;border-radius:3px;overflow:hidden}.bar i{display:block;height:100%}.mm{display:flex;gap:4px}.mm u{height:5px;flex:1;border-radius:3px}.btn{text-align:center;padding:7px;border-radius:9px;font-weight:700}</style>
<h1>Рацион — 10 иконок и 10 палитр</h1><p>Напиши номера: иконку (1–10) и палитру (1–10). Палитру потом можно поменять прямо в приложении: «Ещё → Настройки → Оформление».</p><h2>Иконки</h2><div class="g">'''
for i,f in enumerate(icons,1):
    svg=open(f,encoding='utf-8').read().replace('width="432" height="432"','')
    h+='<div class="i">%s<b>%d. %s</b></div>'%(svg,i,names['%02d'%i])
h+='</div><h2>Палитры (светлая и тёмная)</h2><div class="pg">'
for i,p in enumerate(pal,1):
    h+='<div class="pc"><h3>%d. %s</h3><div class="two">%s%s</div></div>'%(i,p['n'],mock(p,'l'),mock(p,'d'))
h+='</div>'
open('gallery.html','w',encoding='utf-8').write(h); print(len(h))
