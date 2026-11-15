# -*- coding: utf-8 -*-
"""6.5: ассистент только текст/голос (без фото), экономная модель; в лавке — на сколько дней и по сколько."""
import pathlib, re, sys
root = pathlib.Path(__file__).resolve().parent.parent
def cut(s, a, b, keep_b=True):
    i = s.index(a); j = s.index(b, i); return s[:i] + (s[j:] if keep_b else s[j+len(b):])
def rep(s, old, new, c=1):
    if s.count(old) != c: sys.exit('ОШИБКА %d≠%d: %r' % (s.count(old), c, old[:70]))
    return s.replace(old, new)

# ---------- ai.js ----------
p = root/'src/ai.js'; s = p.read_text(encoding='utf-8')
# модель: самая экономная — flash-lite
s = rep(s, "return (flash[0]||lite[0]||stable[0]||list[0]||{}).id}", "return (lite[0]||flash[0]||stable[0]||list[0]||{}).id} // для текста берём самую экономную: flash-lite (у неё обычно самый большой бесплатный лимит)")
s = rep(s, "async function aiModel(){const c=aiCfg();if(c.model)return c.model;if(c.picked&&Date.now()-(c.pickedAt||0)<7*864e5)return c.picked;",
           "async function aiModel(){const c=aiCfg();if(c.model)return c.model;if(c.picked&&c.pv===2&&Date.now()-(c.pickedAt||0)<7*864e5)return c.picked;")
s = rep(s, "c.picked=id;c.pickedAt=Date.now();aiSave(c);return id}", "c.picked=id;c.pickedAt=Date.now();c.pv=2;aiSave(c);return id}")
s = rep(s, "c.picked=id;c.pickedAt=Date.now();aiSave(c);AIS.msg='Подключено ✓ Модель: '+id}", "c.picked=id;c.pickedAt=Date.now();c.pv=2;aiSave(c);AIS.msg='Подключено ✓ Модель: '+id}")
s = rep(s, "const aiqLimit=m=>{const l=aiqLoad().lim[m];return l&&l.n>0?l:{n:AIQ_DEF,known:false}};", "const aiqLimit=m=>{const l=aiqLoad().lim[m];return l&&l.n>0?l:{n:/flash-lite/.test(m||'')?1000:AIQ_DEF,known:false}};")
s = rep(s, "generationConfig:{temperature:0.2,responseMimeType:'application/json'}", "generationConfig:{temperature:0.2,maxOutputTokens:1500,responseMimeType:'application/json'}")
# убрать каталог/покупки/фото
s = cut(s, "function aiCatalog(){", "function aiFoodItems(j){")
s = cut(s, "async function aiShrink(f){", "/* =====================  окно «＋ Съел»  ===================== */")
s = rep(s, "const EAT={text:'',heard:'',img:null,imgUrl:'',res:null,err:'',busy:false,scale:1};", "const EAT={text:'',heard:'',res:null,err:'',busy:false,scale:1};")
s = rep(s, "EAT.scale=1;if(EAT.imgUrl)URL.revokeObjectURL(EAT.imgUrl);EAT.img=null;EAT.imgUrl=''}", "EAT.scale=1}")
a = s.index("async function eatRun(){"); b = s.index("async function readClip(){")
s = s[:a] + """async function eatRun(){if(EAT.busy)return;EAT.err='';EAT.res=null;
  if(!EAT.text.trim()){EAT.err='Скажи или напиши, что съел';render();return}
  EAT.busy=true;render();
  try{EAT.res=aiFoodItems(await aiAsk([{text:AI_FOOD+'\\n\\nЧто съел: '+EAT.text.trim()}]));EAT.scale=1}catch(e){EAT.err=String(e&&e.message||e).slice(0,170)}
  EAT.busy=false;render()}
""" + s[b:]
s = rep(s, """    <label class="link small" for="eatimg">📷 Или сфотографировать блюдо</label></div>${q}`;""", """</div>${q}`;""")
s = rep(s, """<div class="eatrow2"><label class="btn" for="eatimg" aria-label="Фото блюда">📷</label><button class="btn pri grow" data-a="eatrun" ${EAT.busy?'disabled':''}>${EAT.busy?'Считаю…':'Посчитать'}</button></div>${q}`;""", """<div class="eatrow2"><button class="btn pri grow" data-a="eatrun" ${EAT.busy?'disabled':''}>${EAT.busy?'Считаю…':'Посчитать'}</button></div>${q}`;""")
s = rep(s, """  if(mode!=='clip')h+=`<input id="eatimg" type="file" accept="image/*" hidden data-in="eatimg">${EAT.imgUrl?`<img class="aith" src="${EAT.imgUrl}" alt="Фото блюда">`:''}`;\n""", "")
# блок покупок по фото целиком
s = cut(s, "/* =====================  фото покупок (в «Что дома»)  ===================== */", "/* ----- действия ----- */")
s = rep(s, "  aiopen:d=>{AI.open=true;AI.res=null;AI.err='';AI.img=null;AI.imgUrl=''},\n  aiclose:()=>{AI.open=false},\n  aisetup:()=>{AI.open=false;xOpen='';", "  aisetup:()=>{xOpen='';")
s = cut(s, "  aishopsave:()=>{", "  openurl:d=>")
s = rep(s, "  if(k==='eatt')EAT.text=el.value;\n  else if(k==='aiq'&&AI.res)AI.res.items[+el.dataset.i].q=Math.max(0,Math.round(parseNum(el.value)))});", "  if(k==='eatt')EAT.text=el.value});")
s = rep(s, "  else if(k==='aion'&&AI.res){const i=AI.res.items[+el.dataset.i];if(i.id)i.on=el.checked;else i.add=el.checked}\n", "")
a = s.index("  else if(k==='eatimg'){"); b = s.index("/* ----- настройки: «Ещё → Ассистент» ----- */")
s = s[:a] + "});\n\n" + s[b:]
s = rep(s, "Считает КБЖУ по голосу, тексту и фото в окне «＋ Съел» и разбирает фото чека в «Покупках».", "Считает КБЖУ по тому, что ты скажешь или напишешь, в окне «＋ Съел».")
s = rep(s, "Считает КБЖУ по голосу, тексту и фото и разбирает фото чека. Использует бесплатный уровень Google Gemini.", "Считает КБЖУ по тому, что ты скажешь или напишешь. Использует бесплатный уровень Google Gemini.")
s = rep(s, "Бесплатный уровень Google может использовать присланные данные для улучшения своих сервисов — не отправляй документы и личные фото.", "Бесплатный уровень Google может использовать присланные тексты для улучшения своих сервисов — не диктуй личное.")
p.write_text(s, encoding='utf-8')

# ---------- app.js ----------
p = root/'src/app.js'; s = p.read_text(encoding='utf-8')
s = rep(s, "+mfHtml()+wizHtml()+aiHtml();", "+mfHtml()+wizHtml();")
s = rep(s, '<button class="btn sm" data-a="aiopen" data-v="shop">🧾 По фото покупок</button>', '')
# лавка: на сколько дней и по сколько
s = rep(s, "    let h=r.home;wn.forEach((w,k)=>{const t=Math.min(h,w);h-=t;const b=w-t;if(b<=0)return;",
           "    const dn=NEARWIN.map(([,,a,b])=>{const o=[];for(let i=a;i<b;i++){let t=0;dayPlan(addDays(L.cs,i)).meals.forEach(m=>m.items.forEach(x=>{if(x.p===r.id)t+=x.q}));if(t>0)o.push([DAYS[wd(addDays(L.cs,i))].toLowerCase(),t])}return o});\n    let h=r.home;wn.forEach((w,k)=>{const t=Math.min(h,w);h-=t;const b=w-t;if(b<=0)return;")
s = rep(s, "vi:(r.p.vi||'').split(' (')[0],sec:r.p.sec,u:r.p.u})})});\n  return out}",
           "vi:(r.p.vi||'').split(' (')[0],sec:r.p.sec,u:r.p.u,nd:dn[k].length,days:dn[k].map(([d,q])=>d+' '+fq(q,r.p.u)).join(' · ')})})});\n  return out}")
s = rep(s, '<span class="vi">${esc(x.vi||\'\')}</span></span><span class="q">${esc(x.q)}</span></button>${nm?',
           '<span class="vi">${esc(x.vi||\'\')}</span>${x.days?`<small class="dd">на ${x.nd} ${plural(x.nd,[\'день\',\'дня\',\'дней\'])}: ${esc(x.days)}</small>`:\'\'}</span><span class="q">${esc(x.q)}</span></button>${nm?')
s = rep(s, ".map(x=>x.n+' '+x.q);\n    if(fl.length)h+=`<div class=\"card due xcard\"><button class=\"xcl\" data-a=\"dismiss\" data-v=\"lavka\"",
           ".map(x=>x.n+' '+x.q+(x.days?' ('+x.days+')':''));\n    if(fl.length)h+=`<div class=\"card due xcard\"><button class=\"xcl\" data-a=\"dismiss\" data-v=\"lavka\"")
p.write_text(s, encoding='utf-8')

# ---------- head.html ----------
p = root/'src/head.html'; s = p.read_text(encoding='utf-8')
s = s.replace('.btn[disabled]{opacity:.55}', '.btn[disabled]{opacity:.55}\n.shl .dd{display:block;font-size:.76rem;color:var(--muted);margin-top:2px;font-weight:400}', 1)
p.write_text(s, encoding='utf-8')
print('патч применён')
