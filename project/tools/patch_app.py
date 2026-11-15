#!/usr/bin/env python3
"""Одноразовая правка src/app.js под версию 6.0 (каждая замена обязана сработать ровно один раз)."""
import pathlib, sys
p = pathlib.Path(__file__).resolve().parent.parent / 'src' / 'app.js'
s = p.read_text(encoding='utf-8')
def rep(old, new, count=1):
    global s
    n = s.count(old)
    if n != count:
        sys.exit(f'ОШИБКА: ожидалось {count} вхождений, найдено {n}: {old[:70]!r}')
    s = s.replace(old, new)

rep("const APP_VERSION='5.34';", "const APP_VERSION='6.0';")
# новые поля состояния
rep("function def(){return {", "function def(){return {pal:'forest',theme:'auto',rm:{},hc:{},")
# сохранение → синхронизация с Android (виджет, фоновая копия, расписание)
rep("function save(){try{localStorage.setItem(LS,JSON.stringify(S))}catch(e){toast('Не удалось сохранить')}}",
    "function save(){try{localStorage.setItem(LS,JSON.stringify(S))}catch(e){toast('Не удалось сохранить')}try{nAfterSave()}catch(_){}}")
# render: мастер переноса и просмотр фото
rep("+sheetHtml()+freeHtml()+eatHtml()+mfHtml();", "+sheetHtml()+freeHtml()+eatHtml()+mfHtml()+phViewHtml()+wizHtml();")
# таймеры у шагов рецепта
rep("a.map(t=>`<li>${esc(t.replace(/\\.$/,''))}</li>`).join('')", "a.map(t=>`<li>${esc(t.replace(/\\.$/,''))}${tmChips(t)}</li>`).join('')")
# голос
rep("fmic:()=>{const SR=window.SpeechRecognition||window.webkitSpeechRecognition;",
    "fmic:()=>{if(IS_APP){nVoice(t=>{F.n=t;F.fromList=0;const el=document.getElementById('fn');if(el)el.value=F.n;fUpd()});return true}const SR=window.SpeechRecognition||window.webkitSpeechRecognition;")
rep("xmic:()=>{const SR=window.SpeechRecognition||window.webkitSpeechRecognition;",
    "xmic:()=>{if(IS_APP){nVoice(t=>{X.eq=t;X.sel=null;const el=document.getElementById('eq');if(el)el.value=X.eq;const l=document.getElementById('elist');if(l)l.innerHTML=eatList()});return true}const SR=window.SpeechRecognition||window.webkitSpeechRecognition;")
# справочник: записи «на 100 г» считаем по умолчанию на обычную порцию
rep("fsug:d=>{const p=xAll()[+d.i];if(!p)return true;Object.assign(F,{n:p[0],k:String(p[2]),p:String(p[3]),f:String(p[4]),c:String(p[5]),fromList:1})},",
    "fsug:d=>{const p=xAll()[+d.i];if(!p)return true;const q=fdQ(p),m=fdMac(p,q);Object.assign(F,{n:fdName(p,q),k:String(r0(m.k)),p:String(r0(m.p)),f:String(r0(m.f)),c:String(r0(m.c)),fromList:1})},")
rep("data-a=\"fsug\" data-i=\"${i}\">${esc(all[i][0])} <small>${all[i][2]} ккал</small>", "data-a=\"fsug\" data-i=\"${i}\">${esc(all[i][0])} <small>${r0(fdMac(all[i],fdQ(all[i])).k)} ккал</small>")
# раскрытие тяжёлых разделов — перерисовать один раз
rep("document.addEventListener('toggle',e=>{if(e.target.id&&e.target.id.startsWith('mo-'))moreOpen[e.target.id.slice(3)]=e.target.open;",
    "document.addEventListener('toggle',e=>{if(e.target.id&&e.target.id.startsWith('mo-')){const id=e.target.id.slice(3),was=!!moreOpen[id];moreOpen[id]=e.target.open;if(LAZY[id]&&e.target.open&&!was)render()}")
# «Установить из Chrome» — только для браузера
rep("${sa?'':'Установить:", "${sa||IS_APP?'':'Установить:")
# обновление: в APK — своё
rep("async function checkUpdate(manual){\n", "async function checkUpdate(manual){\n  if(IS_APP)return appCheckUpdate(manual);\n")
rep("async function doUpdate(){\n", "async function doUpdate(){\n  if(IS_APP)return appDoUpdate();\n")
rep("if('serviceWorker' in navigator&&location.protocol==='https:')navigator.serviceWorker.register('sw.js')", "if(!IS_APP&&'serviceWorker' in navigator&&location.protocol==='https:')navigator.serviceWorker.register('sw.js')")
# вставка модулей перед блоком «Офлайн и обновления»
rep("/* ===== Офлайн и обновления ===== */", "/*__FOODS__*/\n/*__NATIVE__*/\n/*__V2__*/\n/* ===== Офлайн и обновления ===== */")
# запуск
rep("seedFix7b();\nrender();\nsetTimeout(ghAuto,2500);", "seedFix7b();\napplyTheme();\nrender();\ntmTick(true);tmAwake();\nsetTimeout(ghAuto,2500);\nnInit();bkRefresh();\ntry{localStorage.setItem('racion-boot','ok')}catch(_){}")

# --- «Ещё» по группам ---
a = s.index("function vWeight(){"); b = s.index("/* ===== Действия ===== */")
v = s[a:b]
def vrep(old, new):
    global v
    if v.count(old) != 1: sys.exit(f'ОШИБКА vWeight: {v.count(old)} вхождений: {old[:60]!r}')
    v = v.replace(old, new)
vrep("  ${goalCard()}\n  ${sec('w',", "  ${goalCard()}\n  ${GRP('Прогресс')}\n  ${sec('w',")
vrep("  <section class=\"card frcard\">", "  ${secCharts()}\n  ${secPhotos()}\n  ${secReport()}\n  ${GRP('Питание')}\n  <section class=\"card frcard\">")
# убираем отдельный «Итог недели» (он теперь внутри «Отчёта недели»)
i0 = v.index("  ${sec('s','Итог недели'"); i1 = v.index("  ${sec('r','Напоминания на телефон'")
v = v[:i0] + "  ${GRP('Кухня')}\n  ${secTimers()}\n  ${GRP('Телефон')}\n" + v[i1:]
# напоминания: в APK — нативные, в браузере — прежний .ics
j0 = v.index("  ${sec('r','Напоминания на телефон'"); j1 = v.index("  ${sec('b','Копия данных'")
blk = v[j0:j1].strip()
assert blk.startswith("${") and blk.endswith("}")
inner = blk[2:-1]
v = v[:j0] + "  ${IS_APP?(secRemNative()+secWidget()+secHealth()):" + inner + "}\n  ${GRP('Данные')}\n" + v[j1:]
k0 = v.index("  ${sec('b','Копия данных'"); k1 = v.index("  ${sec('g','Копия в GitHub'")
v = v[:k0] + "  ${secData()}\n" + v[k1:]
vrep("  ${sec('o','Настройки',", "  ${GRP('Оформление и настройки')}\n  ${secTheme()}\n  ${sec('o','Настройки',")
s = s[:a] + v + s[b:]
p.write_text(s, encoding='utf-8')
print('app.js: патч применён')
