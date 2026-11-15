/* ===== 6.5: ассистент Gemini внутри окна «＋ Съел» (голос / текст / буфер / база) и разбор фото покупок; учёт запросов ===== */
const AIK='racion-ai'; // ключ лежит только в этом телефоне (в копию данных не попадает)
function aiCfg(){try{return JSON.parse(localStorage.getItem(AIK)||'null')||{}}catch(_){return {}}}
function aiSave(c){try{localStorage.setItem(AIK,JSON.stringify(c))}catch(_){}}
const aiCurModel=()=>{const c=aiCfg();return c.model||c.picked||''};
function openExt(u){const R=NP('RacionNative');if(R&&R.openUrl)R.openUrl({url:u}).catch(()=>{});else window.open(u,'_blank','noopener')}
const hhmm=ms=>{const d=new Date(ms);return pad(d.getHours())+':'+pad(d.getMinutes())};
const num=v=>{const x=parseFloat(String(v==null?'':v).replace(',','.'));return isFinite(x)?x:0};

/* ----- учёт запросов. Google не сообщает остаток, поэтому считаем сами; настоящий лимит узнаём из ответа Google, когда он наступает ----- */
const AIQK='racion-aiq',AIQ_DEF=250; // 250 в день — типичный бесплатный лимит для Flash; точное число подхватится из ответа Google или задаётся вручную
const ptDay=ms=>new Intl.DateTimeFormat('en-CA',{timeZone:'America/Los_Angeles'}).format(new Date(ms||Date.now()));
function ptNextMidnight(){const now=Date.now(),p=new Intl.DateTimeFormat('en-GB',{timeZone:'America/Los_Angeles',hour:'2-digit',minute:'2-digit',second:'2-digit',hourCycle:'h23'}).formatToParts(new Date(now)),g=t=>+p.find(x=>x.type===t).value;
  return now+86400000-((g('hour')*60+g('minute'))*60+g('second'))*1000}
function aiqLoad(){let q={};try{q=JSON.parse(localStorage.getItem(AIQK)||'null')||{}}catch(_){}const d=ptDay();if(q.day!==d){q.day=d;q.n={};q.hits=[]}q.lim=q.lim||{};q.block=q.block||{};q.hits=(q.hits||[]).filter(t=>Date.now()-t<600000);return q}
const aiqSave=q=>{try{localStorage.setItem(AIQK,JSON.stringify(q))}catch(_){}};
const aiqUsed=m=>(aiqLoad().n[m]||0);
const aiqLimit=m=>{const l=aiqLoad().lim[m];return l&&l.n>0?l:{n:/flash-lite/.test(m||'')?1000:AIQ_DEF,known:false}};
function aiqNote(m){const q=aiqLoad();q.n[m]=(q.n[m]||0)+1;q.hits.push(Date.now());aiqSave(q)}
function aiqBlock(m){const q=aiqLoad(),b=q.block[m];if(b&&b.until>Date.now())return b;if(b){delete q.block[m];aiqSave(q)}return null}
function aiqFrom429(m,tx){let j={};try{j=JSON.parse(tx)}catch(_){}const det=((j.error||{}).details)||[],viol=[];let retry=0;
  det.forEach(d=>{if(/QuotaFailure/.test(d['@type']||''))(d.violations||[]).forEach(v=>viol.push(v));if(/RetryInfo/.test(d['@type']||'')){const s=parseFloat(String(d.retryDelay||'').replace('s',''));if(s>0)retry=s}});
  const day=viol.some(v=>/PerDay/i.test(v.quotaId||'')||/PerDay/i.test(v.quotaMetric||'')),q=aiqLoad();
  if(day){const dv=viol.find(v=>/PerDay/i.test(v.quotaId||'')),val=dv&&parseInt(dv.quotaValue,10);if(val>0){q.lim[m]={n:val,known:true};q.n[m]=Math.max(q.n[m]||0,val)}q.block[m]={kind:'day',until:ptNextMidnight()}}
  else q.block[m]={kind:'min',until:Date.now()+Math.min(300,Math.max(20,retry||60))*1000};
  aiqSave(q)}
const aiqBlockText=b=>!b?'':b.kind==='day'?'Лимит запросов на сегодня исчерпан. Снова можно в '+hhmm(b.until)+' (обновляется раз в сутки)':'Слишком часто — подожди '+Math.max(1,Math.ceil((b.until-Date.now())/1000))+' с';
function aiqLine(m){m=m||aiCurModel();if(!m)return '';const b=aiqBlock(m);if(b)return aiqBlockText(b);const L=aiqLimit(m);return 'Осталось ≈ '+Math.max(0,L.n-aiqUsed(m))+' из '+L.n+' · обновится в '+hhmm(ptNextMidnight())}

/* ----- сеть: через Android (без ограничений браузера), в браузере — обычный fetch ----- */
async function aiRaw(path,method,body){const c=aiCfg(),url='https://generativelanguage.googleapis.com/v1beta/'+path,R=NP('RacionNative');
  if(R&&R.httpJson){const r=await R.httpJson({url,method,key:c.key||'',body:body||''});return {status:r.status,text:r.body||''}}
  const r=await fetch(url,{method,headers:{'x-goog-api-key':c.key||'','Content-Type':'application/json'},body:body||undefined});return {status:r.status,text:await r.text()}}
function aiErrText(st,tx){let m='';try{m=(JSON.parse(tx).error||{}).message||''}catch(_){}
  if(st===400&&/API key|api_key|INVALID/i.test(m))return 'Ключ не подошёл — проверь, что скопировал его целиком';
  if(st===400)return 'Запрос не принят'+(m?': '+m.slice(0,80):'');
  if(st===401||st===403)return 'Нет доступа с этим ключом'+(m?' ('+m.slice(0,70)+')':'')+'. Возможно, в твоём регионе или для этой модели бесплатный доступ закрыт';
  if(st===404)return 'Модель не найдена — выбери другую в «Ещё → Ассистент»';
  if(st===429)return 'Лимит запросов исчерпан — повтори позже';
  if(st>=500)return 'Сервис Google занят, повтори через минуту';
  return 'Ошибка '+st+(m?': '+m.slice(0,80):'')}
async function aiModels(){const r=await aiRaw('models?pageSize=200','GET');if(r.status!==200)throw new Error(aiErrText(r.status,r.text));
  const j=JSON.parse(r.text);return (j.models||[]).filter(m=>(m.supportedGenerationMethods||[]).includes('generateContent')&&/^models\/gemini-/.test(m.name)).map(m=>({id:m.name.replace(/^models\//,''),label:m.displayName||m.name}))}
function aiPick(list,photo){const ver=id=>parseFloat((id.match(/gemini-([\d.]+)/)||[0,0])[1]),bad=/preview|exp|image|tts|audio|live|thinking|embedding|robotics|computer|-\d{3}$/i;
  const stable=list.filter(m=>!bad.test(m.id)),flash=stable.filter(m=>/-flash$/.test(m.id)).sort((a,b)=>ver(b.id)-ver(a.id)),lite=stable.filter(m=>/-flash-lite$/.test(m.id)).sort((a,b)=>ver(b.id)-ver(a.id));
  return (photo?(flash[0]||lite[0]):(lite[0]||flash[0])||stable[0]||list[0]||{}).id} // для текста берём самую экономную: flash-lite (у неё обычно самый большой бесплатный лимит)
async function aiModel(){const c=aiCfg();if(c.model)return c.model;if(c.picked&&c.pv===2&&Date.now()-(c.pickedAt||0)<7*864e5)return c.picked;
  const l=await aiModels(),id=aiPick(l);if(!id)throw new Error('Не нашёл подходящую модель Gemini');c.picked=id;c.pickedAt=Date.now();c.pv=2;aiSave(c);return id}
function aiParseJson(t){t=String(t||'').replace(/^```(?:json)?\s*/i,'').replace(/```\s*$/,'').trim();try{return JSON.parse(t)}catch(_){const m=t.match(/\{[\s\S]*\}/);if(m)return JSON.parse(m[0]);throw new Error('Ответ пришёл не в том виде — попробуй ещё раз')}}
async function aiPhotoModel(){const c=aiCfg();if(c.pmodel)return c.pmodel;if(c.ppicked&&Date.now()-(c.ppickedAt||0)<7*864e5)return c.ppicked;const l=await aiModels(),id=aiPick(l,true);if(!id)throw new Error('Не нашёл подходящую модель Gemini');c.ppicked=id;c.ppickedAt=Date.now();aiSave(c);return id}
async function aiAsk(parts,photo){const c=aiCfg();if(!c.key)throw new Error('Сначала подключи ключ в «Ещё → Ассистент»');
  const model=photo?await aiPhotoModel():await aiModel(),bl=aiqBlock(model);if(bl)throw new Error(aiqBlockText(bl));
  const body=JSON.stringify({contents:[{role:'user',parts}],generationConfig:{temperature:0.2,maxOutputTokens:6000,responseMimeType:'application/json'}});
  const r=await aiRaw('models/'+model+':generateContent','POST',body);
  if(r.status===429){aiqFrom429(model,r.text);throw new Error(aiqBlockText(aiqBlock(model))||aiErrText(429,r.text))}
  if(r.status!==200)throw new Error(aiErrText(r.status,r.text));
  aiqNote(model);
  const j=JSON.parse(r.text),cand=(j.candidates||[])[0];if(!cand||!cand.content){const why=(j.promptFeedback||{}).blockReason||(cand&&cand.finishReason)||'';throw new Error('Пустой ответ'+(why?' ('+why+')':'')+' — попробуй ещё раз')}
  return aiParseJson((cand.content.parts||[]).map(p=>p.text||'').join(''))}

/* ----- запросы ----- */
const AI_FOOD=`Ты помощник по питанию в приложении. Пользователь живёт во Вьетнаме (Нячанг): названия могут быть вьетнамскими или русскими, блюда часто местные. Определи, что съедено, оцени порцию и КБЖУ для ВСЕЙ порции каждой позиции (не на 100 г). Если порция не названа — возьми типичную. Названия по-русски. Ответь ТОЛЬКО JSON без пояснений: {"items":[{"n":"название","q":"порция, например «2 шт» или «350 г»","k":ккал,"p":белки г,"f":жиры г,"c":углеводы г}],"note":"одна короткая фраза, если оценка очень неуверенная, иначе пустая строка"}. Числа — обычные числа без единиц.`;
function aiFoodItems(j){const items=Array.isArray(j.items)?j.items:[];if(!items.length)throw new Error('Ничего не нашёл — попробуй сформулировать иначе или сделать фото ближе');
  return {kind:'food',note:String(j.note||''),items:items.slice(0,20).map(x=>({n:String(x.n||'?').slice(0,70),q:String(x.q||'').slice(0,30),k:Math.min(3500,Math.max(0,num(x.k))),p:Math.max(0,num(x.p)),f:Math.max(0,num(x.f)),c:Math.max(0,num(x.c)),on:true}))}}
async function aiShrink(f){const bmp=await createImageBitmap(f,{imageOrientation:'from-image'}),sc=Math.min(1,1280/Math.max(bmp.width,bmp.height)),cv=document.createElement('canvas');cv.width=Math.max(1,Math.round(bmp.width*sc));cv.height=Math.max(1,Math.round(bmp.height*sc));cv.getContext('2d').drawImage(bmp,0,0,cv.width,cv.height);
  const blob=await new Promise(r=>cv.toBlob(r,'image/jpeg',.82)),b64=await new Promise(r=>{const fr=new FileReader();fr.onload=()=>r(String(fr.result).split(',')[1]);fr.readAsDataURL(blob)});return {img:{mime:'image/jpeg',b64},url:URL.createObjectURL(blob)}}
/* =====================  окно «＋ Съел»  ===================== */
const EATM=[['voice','🎤 Голос'],['text','⌨ Текст'],['photo','📷 Фото'],['clip','📋 Буфер'],['db','🔎 База']];
const EAT={got:'',text:'',heard:'',res:null,err:'',busy:false,scale:1,img:null,imgUrl:'',note:''};
function eatMode(){let m='';try{m=localStorage.getItem('racion-eatmode')||''}catch(_){}if(!EATM.some(x=>x[0]===m))m=aiCfg().key?'voice':'db';return m}
function eatReset(){EAT.text='';EAT.heard='';EAT.res=null;EAT.err='';EAT.busy=false;EAT.scale=1;if(EAT.imgUrl)URL.revokeObjectURL(EAT.imgUrl);EAT.img=null;EAT.imgUrl='';EAT.note='';EAT.got=''}
function eatSum(){const s=EAT.res&&EAT.res.kind==='food'?EAT.scale:1,t={k:0,p:0,f:0,c:0};((EAT.res&&EAT.res.items)||[]).forEach(i=>{if(i.on&&!i.plan){t.k+=i.k*s;t.p+=i.p*s;t.f+=i.f*s;t.c+=i.c*s}});return t}
async function eatRun(){if(EAT.busy)return;EAT.err='';EAT.res=null;
  if(!EAT.text.trim()){EAT.err='Скажи или напиши, что съел';render();return}
  EAT.busy=true;render();
  try{EAT.res=aiFoodItems(await aiAsk([{text:AI_FOOD+'\n\nЧто съел: '+EAT.text.trim()}]));EAT.scale=1}catch(e){EAT.err=String(e&&e.message||e).slice(0,170)}
  EAT.busy=false;render();eatScroll()}
async function eatPhotoRun(){if(EAT.busy||!EAT.img)return;EAT.err='';EAT.res=null;EAT.busy=true;render();
  try{const hint=EAT.note.trim();EAT.res=aiFoodItems(await aiAsk([{text:AI_FOOD+'\n\nНа фото — съеденное или выпитое (шоколадка, кофе, перекус, блюдо). Если на упаковке видны вес или таблица пищевой ценности — используй их, это точнее оценки на глаз.'+(hint?' Подсказка пользователя: '+hint:'')},{inline_data:{mime_type:EAT.img.mime,data:EAT.img.b64}}],true));EAT.scale=1}catch(e){EAT.err=String(e&&e.message||e).slice(0,170)}
  EAT.busy=false;render();eatScroll()}
function eatScroll(){setTimeout(()=>{const e=document.querySelector('.eats .eatsum')||document.querySelector('.eats .flag');if(e&&e.scrollIntoView)e.scrollIntoView({block:'center',behavior:'smooth'})},80)}
async function readClip(){const R=NP('RacionNative');if(R&&R.readClip){try{return (await R.readClip()).text||''}catch(_){}}try{return await navigator.clipboard.readText()}catch(_){return ''}}
function eatResHtml(){const R=EAT.res;if(!R)return '';const t=eatSum(),ms=dayPlan(pkey(viewDate)).meals.slice().sort((a,b)=>tmin(a.time)-tmin(b.time)),food=R.kind==='food',sc=food?EAT.scale:1;
  if(!ms.some(m=>m.slot===X.s)&&ms.length){const n=new Date(),nm=n.getHours()*60+n.getMinutes(),today=viewDate===dkey(appNow()),b=today?ms.slice().sort((a,c)=>Math.abs(tmin(a.time)-nm)-Math.abs(tmin(c.time)-nm))[0]:ms[0];X.s=b.slot;X.t=b.time}
  return `<ul class="list ail">${R.items.map((i,n)=>i.plan?`<li class="${i.on?'':'off'}"><div class="grow"><div class="nm">Отметить «${esc(SLOTS[i.plan]||i.plan)}» съеденным</div></div><button class="xdel" data-a="eatitem" data-i="${n}" aria-label="Убрать">${i.on?'✕':'↺'}</button></li>`:
    `<li class="${i.on?'':'off'}"><div class="grow"><div class="nm">${esc(i.n)}</div><div class="sub">${i.q?esc(i.q)+' · ':''}Б ${r0(i.p*sc)} · Ж ${r0(i.f*sc)} · У ${r0(i.c*sc)}</div></div><b>${r0(i.k*sc)}</b><button class="xdel" data-a="eatitem" data-i="${n}" aria-label="${i.on?'Убрать':'Вернуть'}: ${esc(i.n)}">${i.on?'✕':'↺'}</button></li>`).join('')}</ul>
  <div class="eatsum"><b>${r0(t.k)} ккал</b> · Б ${r0(t.p)} · Ж ${r0(t.f)} · У ${r0(t.c)}</div>${R.note?`<div class="small muted">${esc(R.note)}</div>`:''}
  <div class="eatrow">${food?`<div class="picks eatsc">${[[0.8,'меньше'],[1,'как есть'],[1.25,'больше']].map(([v,l])=>`<button class="pick ${EAT.scale===v?'on':''}" data-a="eatscale" data-v="${v}">${l}</button>`).join('')}</div>`:''}
</div>
  <div class="ph">Куда записать?</div><div class="picks">${ms.map(m=>`<button class="pick ${X.s===m.slot?'on':''}" data-a="xslot" data-s="${m.slot}">${SLOTS[m.slot]} · ${m.time}</button>`).join('')}</div>
  <div class="btns"><button class="btn pri" data-a="eatsave" ${t.k>0||R.items.some(i=>i.plan&&i.on)?'':'disabled'}>Записать · ${esc(SLOTS[X.s]||'')}</button></div>`}
function eatDbBody(){const ms=dayPlan(pkey(viewDate)).meals;
  return `<div class="ph" style="margin-top:0">Какой приём</div><div class="picks">${ms.map(m=>`<button class="pick ${X.s===m.slot?'on':''}" data-a="xslot" data-s="${m.slot}">${SLOTS[m.slot]} · ${m.time}</button>`).join('')}</div>${xForm({slot:X.s})}`}
function eatHtml(){if(xOpen!=='sheet'||tab!=='today')return '';const mode=eatMode(),ok=!!aiCfg().key;
  let h=`<div class="shbg" data-a="xclose"></div><section class="shp eats" role="dialog" aria-label="Съел"><div class="bh"><h3>Съел · ${viewDate===dkey(appNow())?'сегодня':fmtDate(pkey(viewDate))}</h3><button class="xcl" data-a="xclose" aria-label="Закрыть">✕</button></div>
  <div class="eatmodes" role="tablist">${EATM.map(([v,l])=>`<button class="pick ${mode===v?'on':''}" role="tab" aria-selected="${mode===v}" data-a="eatmode" data-v="${v}">${l}</button>`).join('')}</div>`;
  if(mode==='db')return h+eatDbBody()+`</section>`;
  const q=ok&&(mode==='voice'||mode==='text')?`<div class="aiq">${esc(aiqLine())}</div>`:ok&&mode==='photo'?`<div class="aiq">${(aiCfg().pmodel||aiCfg().ppicked)?esc(aiqLine(aiCfg().pmodel||aiCfg().ppicked)):'Лимит фото считается отдельно от текста'}</div>`:'';
  if((mode==='voice'||mode==='text'||mode==='photo')&&!ok)return h+`<div class="small" style="margin-top:10px">Для голоса и текста нужен бесплатный ключ Gemini — подключается один раз.</div><div class="btns"><button class="btn pri" data-a="aisetup">Подключить ассистента</button></div></section>`;
  if(mode==='voice')h+=`<div class="eatv"><button class="micbig ${EAT.busy?'busy':''}" data-a="eatmic" aria-label="Нажми и говори" ${EAT.busy?'disabled':''}>🎤</button>
    <div class="small ${EAT.heard?'':'muted'}">${EAT.busy?'Считаю…':EAT.heard?esc(EAT.heard):'Нажми и скажи, что съел'}</div>
</div>${q}`;
  else if(mode==='text')h+=`<textarea id="eatt" rows="2" data-in="eatt" placeholder="Что съел? Например: два яйца и суп фо бо">${esc(EAT.text)}</textarea>
    <div class="eatrow2"><button class="btn pri grow" data-a="eatrun" ${EAT.busy?'disabled':''}>${EAT.busy?'Считаю…':'Посчитать'}</button></div>${q}`;
  else if(mode==='photo')h+=`<div class="field" style="margin-top:8px"><input id="eatnote" data-in="eatnote" value="${esc(EAT.note)}" placeholder="Подсказка (необязательно): что это, сколько" aria-label="Подсказка"></div>
    <div class="eatv"><label class="btn pri" for="eatcam">📷 Сфотографировать</label><label class="link small" for="eatgal">🖼 Выбрать из галереи</label>${EAT.busy?'<div class="small muted">'+(EAT.res||EAT.got==='ok'?'Смотрю на фото…':esc(EAT.got||'Смотрю на фото…'))+'</div>':''}</div>
    <input id="eatcam" type="file" accept="image/*" capture="environment" hidden data-in="eatimg"><input id="eatgal" type="file" accept="image/*" hidden data-in="eatimg">${EAT.imgUrl?`<div class="small" style="text-align:center;margin-top:6px"><b>Фото принято ✓</b></div><img class="aith" src="${EAT.imgUrl}" alt="Фото">${!EAT.res&&!EAT.busy?`<div class="btns"><button class="btn pri" data-a="eatsend">Отправить на анализ</button></div>`:''}`:''}${q}`;
  else h+=`<div class="eatv"><button class="btn pri" data-a="eatclip">📋 Вставить из буфера</button><div class="small muted">Строка «РАЦИОН: название | ккал | Б | Ж | У» из чата</div><button class="link small" data-a="eatask">Скопировать запрос для чата</button></div>`;
  if(EAT.err)h+=`<div class="small flag" style="margin-top:8px">${esc(EAT.err)}</div>`;
  return h+eatResHtml()+`</section>`}

/* ----- действия ----- */
Object.assign(A,{
  eatmode:d=>{try{localStorage.setItem('racion-eatmode',d.v)}catch(_){}EAT.res=null;EAT.err='';EAT.heard=''},
  eatrun:()=>{eatRun();return true},
  eatsend:()=>{eatPhotoRun();return true},
  eatmic:()=>{if(!aiCfg().key){toast('Сначала подключи ассистента');return true}nVoice(t=>{EAT.text=t;EAT.heard='«'+t+'»';eatRun()});return true},
  eatclip:async()=>{const t=await readClip(),L=parseLines(t);
    if(!t.trim()||!L.length){EAT.err='В буфере нет строки «РАЦИОН: …». Скопируй ответ из чата и попробуй ещё раз';EAT.res=null;render();return true}
    EAT.err='';EAT.res={kind:'clip',note:'',items:L.map(x=>x.plan?{plan:x.plan,on:true}:{n:x.n,q:'',k:x.k||0,p:x.p||0,f:x.f||0,c:x.c||0,t:x.t,on:true})};render();return true},
  eatask:async()=>{const q='Посчитай КБЖУ и ответь строкой для вставки (по одной на позицию): РАЦИОН: название | ккал | белки | жиры | углеводы. Что съел: ';try{await navigator.clipboard.writeText(q);toast('Запрос скопирован — допиши, что съел, и вставь в чат')}catch(_){toast('Не скопировалось')}return true},
  eatitem:d=>{const i=EAT.res.items[+d.i];i.on=!i.on},
  eatscale:d=>{EAT.scale=+d.v},
  eatsave:()=>{const R=EAT.res;if(!R)return true;const day=viewDate,L=S.extra[day]=S.extra[day]||[],now=day===dkey(appNow())?pad(new Date().getHours())+':'+pad(new Date().getMinutes()):'13:00',sc=R.kind==='food'?EAT.scale:1;let n=0;
    R.items.forEach((i,k)=>{if(!i.on)return;if(i.plan){S.done[dk_(day,i.plan)]=1;if(S.skip)delete S.skip[dk_(day,i.plan)];n++;return}
      L.push({id:Date.now().toString(36)+k,n:(i.n+(i.q&&R.kind==='food'?', '+i.q:'')).slice(0,80),k:r0(i.k*sc),p:r0(i.p*sc),f:r0(i.f*sc),c:r0(i.c*sc),t:i.t||X.t||now,s:X.s});if(R.kind==='clip')xRemember(i.n,i.k,i.p,i.f,i.c);n++});
    if(!n){toast('Нечего записывать');return true}if(!L.length)delete S.extra[day];xOpen='';eatReset();cleanOld();save();toast('Записано: '+n);adjOffer(day)},
  aisetup:()=>{xOpen='';tab='weight';moreOpen.ai=true;window.scrollTo&&window.scrollTo(0,0)},
  openurl:d=>{openExt(d.u);return true},
  aikeyon:async()=>{const key=((document.getElementById('aikey')||{}).value||'').trim();if(key.length<20){toast('Вставь ключ целиком');return true}
    const c={key};aiSave(c);AIS.msg='Проверяю ключ…';render();
    try{const l=await aiModels();AIS.models=l;const id=aiPick(l);c.picked=id;c.pickedAt=Date.now();c.pv=2;aiSave(c);AIS.msg='Подключено ✓ Модель: '+id}catch(e){aiSave({});AIS.msg='Не получилось: '+String(e&&e.message||e)}
    render();return true},
  aicheck:async()=>{AIS.msg='Проверяю…';render();try{const l=await aiModels();AIS.models=l;AIS.msg='Ключ работает ✓ Доступно моделей: '+l.length}catch(e){AIS.msg='Не получилось: '+String(e&&e.message||e)}render();return true},
  aitest:async()=>{AIS.msg='Тест: считаю «яйцо варёное»…';render();try{const j=await aiAsk([{text:AI_FOOD+'\n\nЧто съел: одно варёное яйцо'}]),i=(j.items||[])[0];AIS.msg=i?'Работает ✓ Ответ: '+i.n+', '+r0(num(i.k))+' ккал, Б '+r0(num(i.p)):'Ответ пустой'}catch(e){AIS.msg='Не получилось: '+String(e&&e.message||e)}render();return true},
  aioff:()=>{if(!confirm('Отключить ассистента? Ключ удалится с этого телефона.'))return true;aiSave({});AIS.models=null;AIS.msg=''},
  aiqreset:()=>{const q=aiqLoad();const m=aiCurModel();q.n[m]=0;delete q.block[m];aiqSave(q);toast('Счётчик обнулён')}
});
const AIS={models:null,msg:''};
document.addEventListener('input',e=>{const el=e.target,k=el.dataset&&el.dataset.in;if(!k)return;
  if(k==='eatt')EAT.text=el.value;else if(k==='eatnote')EAT.note=el.value});
document.addEventListener('change',async e=>{const el=e.target,k=el.dataset&&el.dataset.in;if(!k)return;
  if(k==='eatslot'){X.s=el.value;const m=dayPlan(pkey(viewDate)).meals.find(x=>x.slot===el.value);if(m)X.t=m.time}
  else if(k==='aimodel'){const c=aiCfg();c.model=el.value;aiSave(c);toast(el.value?'Модель: '+el.value:'Модель выбирается сама');render()}
  else if(k==='eatimg'){const f=el.files&&el.files[0];if(!f)return;EAT.err='';EAT.res=null;EAT.busy=true;EAT.got='Получаю фото…';render();
    try{const r=await aiShrink(f);if(EAT.imgUrl)URL.revokeObjectURL(EAT.imgUrl);EAT.img=r.img;EAT.imgUrl=r.url;EAT.got='ok'}catch(e){EAT.img=null;EAT.got='';EAT.err='Не получилось открыть фото: '+String(e&&e.message||e).slice(0,100)}
    try{el.value=''}catch(_){}EAT.busy=false;render()}
  else if(k==='aiqlim'){const m=aiCurModel(),v=Math.round(parseNum(el.value));if(m&&v>0){const q=aiqLoad();q.lim[m]={n:v,known:false};aiqSave(q);toast('Лимит: '+v+' в день');render()}}
});

/* ----- настройки: «Ещё → Ассистент» ----- */
function secAssistant(){const c=aiCfg(),on=!!c.key,list=AIS.models||(c.picked?[{id:c.picked,label:c.picked}]:[]),m=aiCurModel(),L=m?aiqLimit(m):{n:AIQ_DEF},u=m?aiqUsed(m):0,left=Math.max(0,L.n-u),b=m?aiqBlock(m):null;
  return secF('ai','Ассистент (Gemini)',on?(m?(b&&b.kind==='day'?'лимит исчерпан':'≈ '+left+' запросов'):'подключён'):'не подключён',
  on?`<div class="small muted">Считает КБЖУ по тому, что ты скажешь или напишешь, в окне «＋ Съел».</div>
    <div class="ph">Запросы на сегодня</div>
    <div class="qbar" role="img" aria-label="Использовано ${u} из ${L.n}"><i style="width:${Math.min(100,u/Math.max(1,L.n)*100)}%"></i></div>
    <div class="small"><b>Осталось ≈ ${left}</b> из ${L.n} · использовано ${u}</div>
    ${b?`<div class="small flag" style="margin-top:4px">${esc(aiqBlockText(b))}</div>`:''}
    <div class="small muted">Обновится в <b>${hhmm(ptNextMidnight())}</b> по твоему времени</div>
    <details style="margin-top:8px"><summary class="small muted">Как это считается</summary>
    <ul class="notes"><li>Google обновляет дневной лимит раз в сутки — в полночь по Калифорнии, у тебя это ${hhmm(ptNextMidnight())}</li>
    <li>Лимит свой у каждой модели и общий на весь твой проект Google. Google не сообщает остаток, поэтому приложение считает свои запросы; если тот же ключ работает где-то ещё, остаток будет меньше</li>
    <li>Когда Google ответит «лимит исчерпан», приложение запомнит настоящую цифру и покажет, когда можно снова</li></ul>
    <div class="field"><label for="aiqlim">Лимит в день для модели ${esc(m||'')}</label><input id="aiqlim" inputmode="numeric" data-in="aiqlim" value="${L.n}"></div>
    <div class="btns"><button class="btn sm" data-a="openurl" data-u="https://aistudio.google.com/rate-limit">Точные лимиты в AI Studio</button><button class="btn sm ghost" data-a="aiqreset">Обнулить счётчик</button></div></details>
    <div class="ph">Модель</div><select data-in="aimodel" aria-label="Модель"><option value="">Выбирать самому${c.picked?' (сейчас '+esc(c.picked)+')':''}</option>${list.map(x=>`<option value="${esc(x.id)}" ${c.model===x.id?'selected':''}>${esc(x.id)}</option>`).join('')}</select>
    ${AIS.msg?`<div class="small ${/^Не /.test(AIS.msg)?'flag':''}" style="margin-top:6px">${esc(AIS.msg)}</div>`:''}
    <div class="btns"><button class="btn" data-a="aitest">Тест</button><button class="btn" data-a="aicheck">Проверить ключ</button><button class="btn ghost" data-a="aioff">Отключить</button></div>`
  :`<div class="small muted">Считает КБЖУ по тому, что ты скажешь или напишешь. Использует бесплатный уровень Google Gemini.</div>
    <ol class="notes"><li>Открой страницу ключей Google: <button class="link" data-a="openurl" data-u="https://aistudio.google.com/app/apikey">aistudio.google.com/app/apikey</button> и войди своим Google-аккаунтом</li><li>Нажми «Create API key» и выбери любой проект. Карту привязывать не нужно</li><li>Скопируй ключ (он начинается с <b>AIza</b>) и вставь ниже</li></ol>
    <div class="field"><label for="aikey">Ключ Gemini</label><input id="aikey" type="password" autocomplete="off" autocapitalize="off" placeholder="AIza…"></div>
    ${AIS.msg?`<div class="small ${/^Не /.test(AIS.msg)?'flag':''}">${esc(AIS.msg)}</div>`:''}
    <div class="btns"><button class="btn pri" data-a="aikeyon">Подключить</button></div>
    <p class="small muted" style="margin-bottom:0">Ключ хранится только в телефоне и не попадает в копии. Бесплатный уровень Google может использовать присланные тексты для улучшения своих сервисов — не диктуй личное.</p>`)}

const _eatopen=A.eatopen;A.eatopen=function(){eatReset();return _eatopen.apply(this,arguments)};

/* =====================  подгонка остальных приёмов дня после записи  ===================== */
let ADJ=null,ADJU=null;
function adjOffer(day){try{
  const ms=dayPlan(pkey(day)).meals,today=day===dkey(appNow()),now=new Date(),nm=now.getHours()*60+now.getMinutes(),mn=nm<240?nm+1440:nm,T={k:0,p:0,f:0,c:0},add=x=>['k','p','f','c'].forEach(a=>T[a]+=x[a]||0);
  ms.filter(m=>S.done[dk_(day,m.slot)]).forEach(m=>add(macros(m.items)));((S.extra||{})[day]||[]).forEach(add);
  const R=ms.filter(m=>fOpen(day,m)&&(!today||tmin(m.time)>=mn-60)).map(m=>({slot:m.slot,items:m.items.map(i=>({p:i.p,q:i.q})),base:m.items.map(i=>({p:i.p,q:i.q}))}));
  if(!R.length){ADJ=null;return}
  const t0=Object.assign({},T);R.forEach(r=>{const x=macros(r.base);['k','p','f','c'].forEach(a=>t0[a]+=x[a])});
  const pl=fSolve(T,R);pl.t0=t0;pl.day=day;
  ADJ=pl.adj.length?pl:null}catch(_){ADJ=null}}
function adjHtml(){if(!ADJ&&ADJU&&tab==='today')return `<div class="bar-top"><span>Подогнал приёмов: ${ADJU.n}.</span><button class="btn" data-a="adjundo">Вернуть как было</button><button class="xcl" data-a="adjuhide" aria-label="Закрыть">✕</button></div>`;if(!ADJ||tab!=='today')return '';const pl=ADJ,t=pl.t,t0=pl.t0,ok=(v,a,b)=>v>=a&&v<=b,sg=v=>(v>0?'+':'−')+r0(Math.abs(v));
  const rows=pl.adj.map(a=>{const u=PR[a.p].u==='шт'?'шт':'г',tx=a.from===0?'+ '+a.to+' '+u:a.to===0?a.from+' → 0 '+u:a.from+' → '+a.to+' '+u;
    return `<li><span class="grow"><b>${SLOTS[a.slot]}</b> · ${esc(cap(PR[a.p].s))}<small class="im">${sg(a.m.k)} ккал${Math.abs(a.m.p)>=2?' · Б '+sg(a.m.p):''}${Math.abs(a.m.c)>=3?' · У '+sg(a.m.c):''}${Math.abs(a.m.f)>=3?' · Ж '+sg(a.m.f):''}</small></span><b>${tx}</b></li>`}).join('');
  const cell=(v,l,rg,good)=>`<div class="nt"><b class="${good?'':'over'}">${r0(v)}</b><div class="nl">${l}</div><div class="nn">${rg}</div></div>`,bad=!ok(t.k,1880,2010)||t.c>150||t.p<185;
  return `<div class="shbg" data-a="adjno"></div><section class="shp adjs" role="dialog" aria-label="Подогнать день"><div class="bh"><h3>Подогнать остальной день?</h3><button class="xcl" data-a="adjno" aria-label="Закрыть">✕</button></div>
  <div class="small">С учётом записанного день выходил бы на <b>${r0(t0.k)} ккал</b>${t0.k>2010?' — это больше нормы':''}. Предлагаю поправить:</div>
  <ul class="il">${rows}</ul>
  <div class="small muted" style="margin-top:10px">День после подгонки (прогноз)</div><div class="ng">${cell(t.k,'ккал','1900–2000',ok(t.k,1880,2010))}${cell(t.p,'белки, г','190–205',t.p>=185)}${cell(t.f,'жиры, г','55–60',t.f<=64)}${cell(t.c,'углев., г','120–145',t.c<=150)}</div>
  ${bad?`<div class="small flag" style="margin-top:6px">Целиком уложить не получается: белок и основу блюд я не урезаю.${t.k>2010?' Сверх нормы останется ≈ '+r0(t.k-2000)+' ккал.':''} Можно применить как есть.</div>`:''}
  <div class="btns" style="margin-top:10px"><button class="btn pri" data-a="adjapply">Подогнать</button><button class="btn ghost" data-a="adjno">Оставить как есть</button></div></section>`}
Object.assign(A,{
  adjno:()=>{ADJ=null},
  adjuhide:()=>{ADJU=null},
  adjundo:()=>{const u=ADJU;ADJU=null;if(!u)return true;S.edits=S.edits||{};Object.keys(u.old).forEach(k=>{if(u.old[k]===undefined)delete S.edits[k];else S.edits[k]=u.old[k]});save();toast('Вернул как было')},
  adjapply:()=>{const pl=ADJ;if(!pl)return true;const day=pl.day,old={};let n=0;
    pl.R.forEach(r=>{if(r.items.some((i,k)=>!r.base[k]||i.q!==r.base[k].q)||r.items.length!==r.base.length){S.edits=S.edits||{};const kk=dk_(day,r.slot);old[kk]=S.edits[kk];S.edits[kk]=r.items.filter(i=>i.q>0).map(i=>[i.p,i.q]);n++}});
    ADJ=null;ADJU=n?{n,old}:null;clearTimeout(window._adjT);if(n)window._adjT=setTimeout(()=>{if(ADJU&&ADJU.old===old){ADJU=null;render()}},25000);cleanOld();save();toast(n?'Подогнал приёмов: '+n:'Менять нечего')}
});
// ручной ввод («База») тоже предлагает подгонку, если запись добавилась
const _xsave=A.xsave;A.xsave=function(){const day=viewDate,n0=((S.extra||{})[day]||[]).length,r=_xsave.apply(this,arguments);if(((S.extra||{})[day]||[]).length>n0)adjOffer(day);return r};
