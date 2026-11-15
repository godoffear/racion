# -*- coding: utf-8 -*-
"""6.7: «📷 Фото» в окне «Съел» (шоколадка, кофе и т.п.). Для фото берётся более точная модель flash (свой лимит)."""
import pathlib, sys
root = pathlib.Path(__file__).resolve().parent.parent
def rep(s, old, new, c=1):
    if s.count(old) != c: sys.exit('ОШИБКА %d≠%d: %r' % (s.count(old), c, old[:80]))
    return s.replace(old, new)
p = root/'src/ai.js'; s = p.read_text(encoding='utf-8')
# выбор модели: для текста — lite, для фото — обычная flash
s = rep(s, "function aiPick(list){", "function aiPick(list,photo){")
s = rep(s, "return (lite[0]||flash[0]||stable[0]||list[0]||{}).id}", "return (photo?(flash[0]||lite[0]):(lite[0]||flash[0])||stable[0]||list[0]||{}).id}")
s = rep(s, "async function aiAsk(parts){const c=aiCfg();if(!c.key)throw new Error('Сначала подключи ключ в «Ещё → Ассистент»');\n  const model=await aiModel(),bl=aiqBlock(model);",
           "async function aiPhotoModel(){const c=aiCfg();if(c.pmodel)return c.pmodel;if(c.ppicked&&Date.now()-(c.ppickedAt||0)<7*864e5)return c.ppicked;const l=await aiModels(),id=aiPick(l,true);if(!id)throw new Error('Не нашёл подходящую модель Gemini');c.ppicked=id;c.ppickedAt=Date.now();aiSave(c);return id}\nasync function aiAsk(parts,photo){const c=aiCfg();if(!c.key)throw new Error('Сначала подключи ключ в «Ещё → Ассистент»');\n  const model=photo?await aiPhotoModel():await aiModel(),bl=aiqBlock(model);")
s = rep(s, "function aiqLine(){const m=aiCurModel();", "function aiqLine(m){m=m||aiCurModel();")
# фото: уменьшение
s = rep(s, "/* =====================  окно «＋ Съел»  ===================== */",
 """async function aiShrink(f){const bmp=await createImageBitmap(f,{imageOrientation:'from-image'}),sc=Math.min(1,1280/Math.max(bmp.width,bmp.height)),cv=document.createElement('canvas');cv.width=Math.max(1,Math.round(bmp.width*sc));cv.height=Math.max(1,Math.round(bmp.height*sc));cv.getContext('2d').drawImage(bmp,0,0,cv.width,cv.height);
  const blob=await new Promise(r=>cv.toBlob(r,'image/jpeg',.82)),b64=await new Promise(r=>{const fr=new FileReader();fr.onload=()=>r(String(fr.result).split(',')[1]);fr.readAsDataURL(blob)});return {img:{mime:'image/jpeg',b64},url:URL.createObjectURL(blob)}}
/* =====================  окно «＋ Съел»  ===================== */""")
s = rep(s, "const EATM=[['voice','🎤 Голос'],['text','⌨ Текст'],['clip','📋 Буфер'],['db','🔎 База']];", "const EATM=[['voice','🎤 Голос'],['text','⌨ Текст'],['photo','📷 Фото'],['clip','📋 Буфер'],['db','🔎 База']];")
s = rep(s, "const EAT={text:'',heard:'',res:null,err:'',busy:false,scale:1};", "const EAT={text:'',heard:'',res:null,err:'',busy:false,scale:1,img:null,imgUrl:'',note:''};")
s = rep(s, "function eatReset(){EAT.text='';EAT.heard='';EAT.res=null;EAT.err='';EAT.busy=false;EAT.scale=1}", "function eatReset(){EAT.text='';EAT.heard='';EAT.res=null;EAT.err='';EAT.busy=false;EAT.scale=1;if(EAT.imgUrl)URL.revokeObjectURL(EAT.imgUrl);EAT.img=null;EAT.imgUrl='';EAT.note=''}")
# запуск для фото
s = rep(s, "async function readClip(){", """async function eatPhotoRun(){if(EAT.busy||!EAT.img)return;EAT.err='';EAT.res=null;EAT.busy=true;render();
  try{const hint=EAT.note.trim();EAT.res=aiFoodItems(await aiAsk([{text:AI_FOOD+'\\n\\nНа фото — съеденное или выпитое (шоколадка, кофе, перекус, блюдо). Если на упаковке видны вес или таблица пищевой ценности — используй их, это точнее оценки на глаз.'+(hint?' Подсказка пользователя: '+hint:'')},{inline_data:{mime_type:EAT.img.mime,data:EAT.img.b64}}],true));EAT.scale=1}catch(e){EAT.err=String(e&&e.message||e).slice(0,170)}
  EAT.busy=false;render()}
async function readClip(){""")
# интерфейс режима
s = rep(s, "  const q=ok&&(mode==='voice'||mode==='text')?`<div class=\"aiq\">${esc(aiqLine())}</div>`:'';\n  if((mode==='voice'||mode==='text')&&!ok)return",
           "  const q=ok&&(mode==='voice'||mode==='text')?`<div class=\"aiq\">${esc(aiqLine())}</div>`:ok&&mode==='photo'?`<div class=\"aiq\">${esc(aiqLine(aiCfg().pmodel||aiCfg().ppicked||aiCurModel()))}</div>`:'';\n  if((mode==='voice'||mode==='text'||mode==='photo')&&!ok)return")
s = rep(s, "  else h+=`<div class=\"eatv\"><button class=\"btn pri\" data-a=\"eatclip\">",
           """  else if(mode==='photo')h+=`<div class="field" style="margin-top:8px"><input id="eatnote" data-in="eatnote" value="${esc(EAT.note)}" placeholder="Подсказка (необязательно): что это, сколько" aria-label="Подсказка"></div>
    <div class="eatv"><label class="btn pri" for="eatcam">📷 Сфотографировать</label><label class="link small" for="eatgal">🖼 Выбрать из галереи</label>${EAT.busy?'<div class="small muted">Смотрю на фото…</div>':''}</div>
    <input id="eatcam" type="file" accept="image/*" capture="environment" hidden data-in="eatimg"><input id="eatgal" type="file" accept="image/*" hidden data-in="eatimg">${EAT.imgUrl?`<img class="aith" src="${EAT.imgUrl}" alt="Фото">`:''}${q}`;
  else h+=`<div class="eatv"><button class="btn pri" data-a="eatclip">""")
# обработчики
s = rep(s, "  if(k==='eatt')EAT.text=el.value});", "  if(k==='eatt')EAT.text=el.value;else if(k==='eatnote')EAT.note=el.value});")
a = s.index("document.addEventListener('change',async e=>{const el=e.target,k=el.dataset&&el.dataset.in;if(!k)return;")
s = s[:a] + s[a:].replace("  else if(k==='aiqlim'){", "  else if(k==='eatimg'){const f=el.files&&el.files[0];el.value='';if(!f)return;try{EAT.err='';EAT.res=null;const r=await aiShrink(f);if(EAT.imgUrl)URL.revokeObjectURL(EAT.imgUrl);EAT.img=r.img;EAT.imgUrl=r.url;eatPhotoRun()}catch(_){EAT.err='Не получилось открыть фото';render()}}\n  else if(k==='aiqlim'){", 1)
# сетка режимов: 5 колонок
p.write_text(s, encoding='utf-8')
h = root/'src/head.html'; x = h.read_text(encoding='utf-8')
x = rep(x, ".eatmodes{display:grid;grid-template-columns:repeat(4,1fr);gap:6px;margin:2px 0 10px}.eatmodes .pick{padding:8px 2px;text-align:center;font-size:.8rem;min-height:40px}", ".eatmodes{display:grid;grid-template-columns:repeat(5,1fr);gap:4px;margin:2px 0 10px}.eatmodes .pick{padding:8px 0;text-align:center;font-size:.72rem;min-height:40px;white-space:nowrap}")
h.write_text(x, encoding='utf-8')
m = root/'apk/android/app/src/main/AndroidManifest.xml'; t = m.read_text(encoding='utf-8')
if 'android.permission.CAMERA' not in t:
    t = t.replace('<uses-permission android:name="android.permission.RECORD_AUDIO" />', '<uses-permission android:name="android.permission.RECORD_AUDIO" />\n    <uses-permission android:name="android.permission.CAMERA" />\n    <uses-feature android:name="android.hardware.camera" android:required="false" />')
m.write_text(t, encoding='utf-8')
n = root/'src/native.js'; q = n.read_text(encoding='utf-8'); q = q.replace("const NATIVE_API=5;", "const NATIVE_API=6;"); n.write_text(q, encoding='utf-8')
print('ok')
