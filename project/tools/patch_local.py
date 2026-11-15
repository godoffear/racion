#!/usr/bin/env python3
"""6.0 «полностью локально»: убирает GitHub (копия, восстановление, обновление с сайта), фото прогресса и лишнее в напоминаниях."""
import pathlib, re, sys
root = pathlib.Path(__file__).resolve().parent.parent
def load(n): return (root / 'src' / n).read_text(encoding='utf-8')
def save(n, s): (root / 'src' / n).write_text(s, encoding='utf-8')
def cut(s, a, b, keep_b=True, label=''):
    i = s.index(a); j = s.index(b, i)
    return s[:i] + (s[j:] if keep_b else s[j + len(b):])
def rep(s, old, new, count=1):
    n = s.count(old)
    if n != count: sys.exit(f'ОШИБКА: {n} вхождений вместо {count}: {old[:80]!r}')
    return s.replace(old, new)

# ---------------- app.js ----------------
s = load('app.js')
s = cut(s, "/* ===== 5.10: копия в приватный репозиторий GitHub", "function backupAge()")
s = cut(s, "  ${sec('g','Копия в GitHub'", "  ${GRP('Оформление и настройки')}")
s = cut(s, "  ${secPhotos()}\n", "  ${secReport()}")
s = rep(s, "+phViewHtml()+wizHtml();", "+wizHtml();")
# действия GitHub и исходное сохранение копии
s = cut(s, "  bsave:()=>{", "  xpand:d=>")
s = rep(s, "setTimeout(ghAuto,1500);{const c=ghCfg();if(c.token&&c.pending&&navigator.onLine)ghPush()}", "")
s = rep(s, "render();ghAuto()},60000);window.addEventListener('online',()=>ghAuto());", "render()},60000);")
s = rep(s, "setTimeout(ghAuto,2500);\n", "")
s = rep(s, "setTimeout(()=>checkUpdate(false),2000);\n", "")
s = rep(s, "if(IS_APP)return appCheckUpdate(manual);", "if(IS_APP)return;")
s = rep(s, "if(IS_APP)return appDoUpdate();", "if(IS_APP)return;")
s = rep(s, '<button class="link" data-a="updcheck">Проверить обновление</button>', "${IS_APP?'':'<button class=\"link\" data-a=\"updcheck\">Проверить обновление</button>'}")
s = rep(s, "nInit();bkRefresh();", "nInit();bkRefresh();")
s = rep(s, "try{localStorage.setItem('racion-boot','ok')}catch(_){}", "")
if re.search(r'gh[A-Z]|GHK|b64\(|racion-gh', s): 
    print('ВНИМАНИЕ app.js ещё упоминает GitHub:', set(re.findall(r'gh[A-Z]\w*|GHK|b64\(|racion-gh', s)))
save('app.js', s)

# ---------------- native.js ----------------
n = load('native.js')
n = rep(n, "const SITE='https://godoffear.github.io/racion/';\n", "")
n = rep(n, "const NATIVE_API=1; // растёт, когда приложению нужны новые функции APK; обновление сайта выше этого числа в APK не ставится\n", "")
n = rep(n, "  try{const c=ghCfg();R.sync({snapshot:JSON.stringify(Object.assign({},S,{_meta:{app:APP_VERSION,at:new Date().toISOString(),via:'android'}})),widget:JSON.stringify(widgetData()),token:c.token||'',repo:c.repo||''}).catch(()=>{})}catch(_){}",
           "  try{R.sync({widget:JSON.stringify(widgetData())}).catch(()=>{})}catch(_){}")
n = rep(n, "// ----- данные для виджета и снимок для фоновой копии -----", "// ----- данные для виджета -----") if "// ----- данные для виджета и снимок" in n else n.replace("/* ----- данные для виджета и снимок для фоновой копии ----- */", "/* ----- данные для виджета ----- */")
# обновление с сайта и GitHub-восстановление
n = cut(n, "/* ----- обновление «изнутри» APK", "/* ----- данные: перенос из старого приложения")
n = cut(n, "async function ghRaw(", "function wizHtml()")
n = rep(n, "  <div class=\"ph\">Из копии в GitHub</div>${restoreFormHtml()}\n", "")
n = rep(n, "<div class=\"small muted\">Вес, калипер, отметки и «Что дома» остались в старом «Рационе» (в браузере). Выбери, как их перенести.</div>", "<div class=\"small muted\">Вес, калипер, отметки и «Что дома» остались в старом «Рационе» (в браузере). Перенеси их файлом копии или начни с нуля.</div>")
n = rep(n, "if(typeof SH!=='undefined'&&SH){SH=null;render();return}", "if(typeof SH!=='undefined'&&SH){SH=null;render();return}")
n = rep(n, "    if(PHV.id||PHV.cmp){PHV.id=null;PHV.cmp=null;render();return}\n", "")
n = rep(n, "let GR={busy:false,msg:'',days:null,repo:'',tok:''};\n", "") if "let GR=" in n else n
# напоминания: одно уведомление за 30 минут до приёма
a = n.index("/* ----- напоминания ----- */"); b = n.index("let _lnReady=false;")
n = n[:a] + """/* ----- напоминания: каждое — за 30 минут до приёма пищи, чтобы успеть приготовить ----- */
const LEAD=30;
function remPlan(){
  const out=[],R=S.rm||{},now=Date.now(),base=pkey(dkey(new Date())),slots=Object.keys(SLOTS);
  for(let i=0;i<10;i++){const d=addDays(base,i),k=dkey(d),pl=dayPlan(d),w=wd(d);
    pl.meals.forEach(m=>{if(S.done[dk_(k,m.slot)]||(S.skip||{})[dk_(k,m.slot)])return;
      const [h,mi]=m.time.split(':').map(Number),meal=new Date(d.getFullYear(),d.getMonth(),d.getDate(),h,mi),at=new Date(meal.getTime()-LEAD*60000),id=dayNo(d)*20+slots.indexOf(m.slot);
      if(R.on!==0&&at.getTime()>now)out.push({id,at,title:'Через '+LEAD+' мин: '+SLOTS[m.slot].toLowerCase()+' в '+m.time,body:m.items.map(x=>cap(PR[x.p].s)+' '+qtyText(x)).join(' · ')+' · '+r0(macros(m.items).k)+' ккал',extra:{k,slot:m.slot},act:1})});
    if(R.weigh!==0&&w===4){const at=new Date(d.getFullYear(),d.getMonth(),d.getDate(),9,5);if(at.getTime()>now)out.push({id:800000+dayNo(d),at,title:'⚖️ Взвешивание натощак',body:'Взвесься до еды и воды и запиши вес.',extra:{go:'weight'}})}
    if(R.rep!==0&&w===6){const at=new Date(d.getFullYear(),d.getMonth(),d.getDate(),20,30);if(at.getTime()>now)out.push({id:810000+dayNo(d),at,title:'📊 Итоги недели готовы',body:'Посмотри отчёт: питание, вес, что поправить.',extra:{go:'report'}})}
  }
  return out;
}
""" + n[b:]
n = rep(n, "actions:[{id:'ate',title:'Съел ✓'},{id:'skip',title:'Пропустить'}]", "actions:[{id:'ate',title:'Съел ✓'},{id:'skip',title:'Пропустить'}]")
save('native.js', n)

# ---------------- v2.js ----------------
v = load('v2.js')
v = rep(v, "const LAZY={ch:1,ph:1,rp:1};", "const LAZY={ch:1,rp:1};")
v = cut(v, "/* ----- фото прогресса", "/* ----- отчёт недели ----- */")
v = rep(v, "function secPhotos(){return secF('ph','Фото прогресса',PH.loaded?PH.list.length+' шт':'',moreOpen.ph?phBody():'')}\n", "")
v = cut(v, "function secData(){", "let BK={};")
v = rep(v, "let BK={};", """function secData(){const ba=backupAge();
  return secF('b','Копия и перенос данных',S.lastBackup?(ba>30?'<span class="flag">пора сохранить</span>':'сохранена '+fmtDate(new Date(S.lastBackup))):'ещё не делал',
  `<div class="small muted">Все данные (вес, калипер, отметки, правки меню) хранятся только в этом приложении, на телефоне. Раз в месяц сохраняй копию: файл попадёт в «Загрузки». Этим же файлом переносят данные на другой телефон или в новую установку.</div>
  <div class="btns"><button class="btn pri" data-a="bsave">Сохранить копию в файл</button><label class="btn" for="bload">Загрузить копию из файла</label><input id="bload" type="file" hidden data-in="bload"></div>`)}
let BK={};""")
v = rep(v, "BK={lastAt:s.lastAt||0,error:s.error||'',widgets:s.widgets};", "BK={widgets:s.widgets};")
# фото / GitHub в действиях
for key in ("  phtag:d=>{PH.tag=d.v},\n", "  phview:d=>{PHV.id=d.v;PHV.cmp=null},\n", "  phvs:d=>{PHV.cmp=d.v},\n"):
    v = rep(v, key, "")
v = cut(v, "  phcmp:()=>{", "  tms:d=>{")
v = cut(v, "  grlast:()=>{", "  wizskip:()=>{")
# сохранение файла
v = cut(v, "// сохранение файла копии:", "document.addEventListener('input'")
v = rep(v, "document.addEventListener('input',e=>{const el=e.target,k=el.dataset&&el.dataset.in;if(k==='grf')GR[el.dataset.k]=el.value});\n", "")
v = rep(v, "document.addEventListener('change',e=>{const el=e.target;if(el.dataset&&el.dataset.in==='phadd'){const fs=Array.from(el.files||[]);el.value='';if(fs.length)phAdd(fs)}});\n", "")
v = rep(v, "document.addEventListener('toggle',e=>{if(e.target.id==='grbox')GR.open=e.target.open},true);\n", "")
v += """
// копия данных в файл: в «Загрузки» через Android
A.bsave=()=>{S.lastBackup=Date.now();save();moreOpen.b=true;const nm='Рацион_'+(x=>dkey(x)+'_'+pad(x.getHours())+'-'+pad(x.getMinutes()))(new Date())+'.json';
  nSaveFile(nm,JSON.stringify(S)).then(w=>{toast(w?'Копия сохранена: '+w:'Не удалось сохранить копию');render()});return true};
"""
# напоминания: без «готовки отдельно»
a = v.index("function secRemNative(){"); b = v.index("function secWidget(){")
v = v[:a] + """function secRemNative(){const R=S.rm||{},on=k=>R[k]!==0,rs=RS.ok;
  const t=(k,l)=>`<button class="pick ${on(k)?'on':''}" data-a="rmtog" data-v="${k}" aria-pressed="${on(k)}">${on(k)?'☑':'☐'} ${l}</button>`;
  return secF('r','Напоминания',rs?(RS.perm==='granted'?(on('on')?'за 30 мин до еды':'выключены'):'<span class="flag">нет разрешения</span>'):'',
  `<div class="small muted">Каждое напоминание приходит <b>за 30 минут до приёма пищи</b> — чтобы успеть приготовить. В нём что и сколько есть. Расписание ставится на 10 дней вперёд и обновляется при каждом входе и отметке «Съел».</div>
  <div class="picks" style="margin-top:8px">${t('on','Приёмы пищи')}${t('weigh','Взвешивание (пт 9:05)')}${t('rep','Итоги недели (вс 20:30)')}</div>
  <div class="ph">Состояние</div><ul class="notes"><li>Уведомления: ${rs?(RS.perm==='granted'?'разрешены ✓':'<b class="flag">не разрешены</b>'):'проверяю…'}</li><li>Точное время: ${rs?(RS.exact==='granted'?'разрешено ✓':'<b class="flag">не разрешено</b> — без этого Android может сдвигать напоминания'):'…'}</li>${rs&&RS.n!=null?`<li>Запланировано напоминаний: ${RS.n}</li>`:''}</ul>
  <div class="btns">${rs&&RS.perm!=='granted'?'<button class="btn pri" data-a="rmperm">Разрешить уведомления</button>':''}${rs&&RS.exact!=='granted'?'<button class="btn" data-a="rmexact">Разрешить точное время</button>':''}<button class="btn" data-a="rmtest">Проверить через 5 сек</button><button class="btn ghost" data-a="rmre">Обновить расписание</button></div>
  <p class="small muted" style="margin-bottom:0">Если напоминания опаздывают: Настройки телефона → Приложения → Рацион → Батарея → «Без ограничений».</p>`)}
""" + v[b:]
v = rep(v, "  rmlead:d=>{S.rm=S.rm||{};S.rm.lead=+d.v;save();nSchedule(true)},\n", "")
save('v2.js', v)

# ---------------- head.html: стили фото ----------------
h = load('head.html')
h = re.sub(r"\.phg\{.*?\n\.phcmp figure.*?\n", "", h, flags=re.S)
save('head.html', h)
print('патч применён')
