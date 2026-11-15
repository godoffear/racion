/* ===== 6.0: мост к Android (Capacitor): уведомления, голос, виджет, фоновая копия, Health Connect, таймеры ===== */
const NATIVE_API=6; // растёт, когда приложению нужен новый нативный код: тогда обновление ставится как APK
const UPDATE_API='https://api.github.com/repos/godoffear/racion-app/releases/latest';
const IS_APP=!!(window.Capacitor&&window.Capacitor.isNativePlatform&&window.Capacitor.isNativePlatform());
const _np={};
function NP(name){if(!IS_APP)return null;if(_np[name])return _np[name];try{const C=window.Capacitor;_np[name]=(C.Plugins&&C.Plugins[name])||(C.registerPlugin?C.registerPlugin(name):null)}catch(_){_np[name]=null}return _np[name]}
const dayNo=d=>Math.round((Date.UTC(d.getFullYear(),d.getMonth(),d.getDate())-Date.UTC(2026,0,1))/864e5);
const fmtMS=s=>{const m=Math.floor(s/60),x=s%60;return m>=60?Math.floor(m/60)+':'+pad(m%60)+':'+pad(x):pad(m)+':'+pad(x)};
async function nSaveFile(name,text,mime){const R=NP('RacionNative');if(!R)return null;try{const r=await R.saveFile({name,text,mime:mime||'application/json'});return r&&r.where||name}catch(e){toast('Не удалось сохранить файл');return null}}

/* ----- данные для виджета ----- */
function widgetData(){
  const P=curPal(),m=darkNow()?P.d:P.l,base=pkey(dkey(new Date())),days={};
  [0,1].forEach(off=>{const d=addDays(base,off),k=dkey(d),pl=dayPlan(d),ms=pl.meals.slice().sort((a,b)=>tmin(a.time)-tmin(b.time));let kk=0,pp=0;
    const meals=ms.map(mm=>{const x=macros(mm.items),dn=!!S.done[dk_(k,mm.slot)],sk=!!(S.skip||{})[dk_(k,mm.slot)];if(dn){kk+=x.k;pp+=x.p}
      return {t:mm.time,n:SLOTS[mm.slot],s:mm.items.map(i=>cap(PR[i.p].s)+' '+qtyText(i)).join(' · '),kc:r0(x.k),d:dn?1:sk?2:0}});
    ((S.extra||{})[k]||[]).forEach(x=>{kk+=x.k||0;pp+=x.p||0});
    days[k]={lbl:DAYS_FULL[wd(d)].toLowerCase()+', '+fmtDate(d),meals,k:r0(kk),p:r0(pp),kt:NORM.k[1],pt:NORM.p[0]}});
  return {bg:m.surface,ink:m.ink,muted:m.muted,accent:m.accent,line:m.line,alt:m.f,days};
}
let _syncT=0;
function nAfterSave(){if(!IS_APP)return;clearTimeout(_syncT);_syncT=setTimeout(nPush,2500)}
function nPush(){const R=NP('RacionNative');if(!R)return;
  try{const g=ghCfg();R.sync({widget:JSON.stringify(widgetData()),snapshot:JSON.stringify(Object.assign({},S,{_meta:{app:APP_VERSION,at:new Date().toISOString(),via:'android'}})),ghToken:g.token||'',ghRepo:g.repo||'',autoBackup:S.ab!==0}).catch(()=>{})}catch(_){}
  nSchedule(false)}

/* ----- напоминания: каждое — за 30 минут до приёма пищи, чтобы успеть приготовить ----- */
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
let _lnReady=false;
async function lnSetup(){const LN=NP('LocalNotifications');if(!LN||_lnReady)return LN;_lnReady=true;
  try{await LN.createChannel({id:'meals',name:'Приёмы пищи',description:'Напоминания о еде и готовке',importance:4,visibility:1,vibration:true,lights:true});
    await LN.createChannel({id:'timers',name:'Таймеры на кухне',description:'Сигнал, когда время вышло',importance:5,visibility:1,vibration:true,lights:true});
    await LN.registerActionTypes({types:[{id:'MEAL',actions:[{id:'ate',title:'Съел ✓'},{id:'skip',title:'Пропустить'}]}]});
    LN.addListener('localNotificationActionPerformed',ev=>{const x=(ev.notification&&ev.notification.extra)||{};
      if(x.k&&x.slot&&(ev.actionId==='ate'||ev.actionId==='skip')){S.skip=S.skip||{};const key=dk_(x.k,x.slot);
        if(ev.actionId==='ate'){S.done[key]=1;delete S.skip[key]}else{S.skip[key]=1;delete S.done[key]}
        save();render();toast((ev.actionId==='ate'?'Отмечено: ':'Пропущено: ')+SLOTS[x.slot].toLowerCase());return}
      if(x.go==='report'){tab='weight';moreOpen.rp=true;render();return}
      if(x.go==='weight'){tab='weight';moreOpen.w=true;render();return}
      if(x.k){tab='today';viewDate=x.k;render()}})}catch(_){}
  return LN}
async function nSchedule(force){
  const LN=await lnSetup();if(!LN)return;
  try{const perm=await LN.checkPermissions();if(perm.display!=='granted')return;
    const plan=remPlan(),sig=plan.map(x=>x.id+'@'+x.at.getTime()+':'+x.body.length).join(',');
    if(!force&&sig===localStorage.getItem('racion-remsig'))return;
    const pend=await LN.getPending(),ids=(pend.notifications||[]).filter(n=>n.id<900000).map(n=>({id:n.id}));
    if(ids.length)await LN.cancel({notifications:ids});
    if(plan.length)await LN.schedule({notifications:plan.map(x=>({id:x.id,title:x.title,body:x.body,largeBody:x.body,schedule:{at:x.at,allowWhileIdle:true},channelId:'meals',actionTypeId:x.act?'MEAL':undefined,extra:x.extra}))});
    localStorage.setItem('racion-remsig',sig)}catch(_){}}
async function remStatus(){const LN=NP('LocalNotifications');if(!LN)return {ok:false};
  try{const p=await LN.checkPermissions();let ex='granted';try{ex=(await LN.checkExactNotificationSetting()).exact_alarm}catch(_){}
    const pend=await LN.getPending();return {ok:true,perm:p.display,exact:ex,n:(pend.notifications||[]).filter(n=>n.id<900000).length}}catch(_){return {ok:false}}}
let RS={ok:null};
async function remRefresh(){RS=await remStatus();if(tab==='weight')render()}

/* ----- таймеры на кухне ----- */
let TM=[];try{TM=JSON.parse(localStorage.getItem('racion-tm')||'[]')}catch(_){TM=[]}
const tmSave=()=>{try{localStorage.setItem('racion-tm',JSON.stringify(TM))}catch(_){}};
const tmNid=id=>5000000+(id%1000000);
async function tmNotify(t){const LN=await lnSetup();if(!LN)return;try{const p=await LN.checkPermissions();if(p.display!=='granted'){const r=await LN.requestPermissions();if(r.display!=='granted')return}
  await LN.schedule({notifications:[{id:tmNid(t.id),title:'⏱ '+t.l,body:'Время вышло',schedule:{at:new Date(t.end),allowWhileIdle:true},channelId:'timers'}]})}catch(_){}}
async function tmUnnotify(t){const LN=NP('LocalNotifications');if(!LN)return;try{await LN.cancel({notifications:[{id:tmNid(t.id)}]})}catch(_){}}
let _wl=null;
async function tmAwake(){const on=TM.some(t=>!t.done);
  try{if(IS_APP){const K=NP('KeepAwake');if(K){on?await K.keepAwake():await K.allowSleep()}}else if(navigator.wakeLock){if(on&&!_wl)_wl=await navigator.wakeLock.request('screen');else if(!on&&_wl){await _wl.release();_wl=null}}}catch(_){}}
function tmBeep(){try{const C=window.AudioContext||window.webkitAudioContext,a=new C();[0,0.35,0.7].forEach(t=>{const o=a.createOscillator(),g=a.createGain();o.frequency.value=880;g.gain.value=0.2;o.connect(g);g.connect(a.destination);o.start(a.currentTime+t);o.stop(a.currentTime+t+0.2)})}catch(_){}}
function tmRing(t){tmBeep();try{const H=NP('Haptics');if(H)H.vibrate({duration:700});else navigator.vibrate&&navigator.vibrate([400,150,400,150,400])}catch(_){}toast('⏱ '+t.l+' — время вышло')}
function tmStart(sec,label){const t={id:Date.now()%1e9,l:String(label||'Таймер').slice(0,40),end:Date.now()+sec*1000};TM.push(t);tmSave();tmNotify(t);tmAwake();buzz();tmTick(true);toast('Таймер: '+fmtMS(sec))}
function tmDel(id){const t=TM.find(x=>x.id===id);TM=TM.filter(x=>x.id!==id);tmSave();if(t)tmUnnotify(t);tmAwake();tmTick(true)}
function tmTick(rebuild){
  const now=Date.now();let ch=false;TM.forEach(t=>{if(!t.done&&now>=t.end){t.done=1;ch=true;tmRing(t)}});if(ch){tmSave();tmAwake()}
  let bar=document.getElementById('tmbar');if(!bar){bar=document.createElement('div');bar.id='tmbar';bar.className='tmbar';bar.setAttribute('role','status');document.body.appendChild(bar)}
  bar.hidden=!TM.length;const sig=TM.map(t=>t.id+(t.done?'d':'')).join();
  if(rebuild||bar.dataset.sig!==sig){bar.dataset.sig=sig;bar.innerHTML=TM.map(t=>`<div class="tmc ${t.done?'done':''}" data-id="${t.id}"><span class="tml">⏱ ${esc(t.l)}</span><b>${t.done?'Готово!':fmtMS(Math.max(0,Math.round((t.end-now)/1000)))}</b><button data-a="tmx" data-v="${t.id}" aria-label="Убрать таймер">✕</button></div>`).join('')}
  else TM.forEach(t=>{if(t.done)return;const el=bar.querySelector(`[data-id="${t.id}"] b`);if(el)el.textContent=fmtMS(Math.max(0,Math.round((t.end-now)/1000)))})}
setInterval(tmTick,1000);
// ⏱ рядом с шагами рецепта, где есть время («5 мин», «20–25 мин», «1 час»)
function tmChips(t){const out=[],re=/(\d+)(?:\s*[–-]\s*(\d+))?\s*(минут\w*|мин\b|час\w*|ч\b)/gi;let x;
  while((x=re.exec(t))){const n=+x[1],h=/^ч/i.test(x[3]),sec=n*(h?3600:60);if(sec<60||sec>4*3600)continue;
    out.push(`<button class="tmb" data-a="tms" data-sec="${sec}" data-l="${esc(t.replace(/[.:].*$/,'').slice(0,28))}" aria-label="Поставить таймер на ${n} ${h?'ч':'мин'}">⏱ ${esc(x[0].trim())}</button>`)}
  return out.length?`<span class="tmw">${out.join('')}</span>`:''}

/* ----- голосовой ввод через Android ----- */
async function nVoice(cb){const SR=NP('SpeechRecognition');if(!SR){toast('Голос не поддерживается — напиши название');return}
  try{const a=await SR.available();if(!a.available){toast('На телефоне нет службы распознавания речи');return}
    const p=await SR.requestPermissions();if(p.speechRecognition!=='granted'){toast('Нужен доступ к микрофону');return}
    const r=await SR.start({language:'ru-RU',maxResults:1,prompt:'Что съел?',partialResults:false,popup:true});const t=r&&r.matches&&r.matches[0];
    if(t)cb(t);else toast('Не расслышал — попробуй ещё раз')}catch(_){toast('Не расслышал — попробуй ещё раз')}}

/* ----- Health Connect: шаги, активные калории, вес ----- */
const hcOn=()=>IS_APP&&S.hc&&S.hc.on;
async function hcAvail(){const H=NP('Health');if(!H)return {ok:false,why:'нет плагина'};try{const r=await H.isAvailable();return {ok:!!(r&&r.available),why:r&&r.reason||''}}catch(e){return {ok:false,why:String(e&&e.message||e)}}}
async function hcConnect(){const H=NP('Health');if(!H)return;
  try{const a=await hcAvail();if(!a.ok){toast('Health Connect недоступен: '+(a.why||'установи «Health Connect» из Google Play'));return}
    const r=await H.requestAuthorization({read:['steps','calories','weight']});
    if(!(r.readAuthorized||[]).length){toast('Доступ не выдан');return}
    S.hc=Object.assign(S.hc||{},{on:1,steps:{},cal:{},ok:r.readAuthorized});save();await hcSync(true);render()}catch(e){toast('Не получилось подключить: '+String(e&&e.message||e).slice(0,80))}}
let _hcAt=0;
async function hcSync(force){const H=NP('Health');if(!H||!hcOn())return;if(!force&&Date.now()-_hcAt<10*60000)return;_hcAt=Date.now();
  const start=addDays(pkey(dkey(new Date())),-27),end=new Date(Date.now()+60000);
  const agg=async dt=>{try{const r=await H.queryAggregated({dataType:dt,startDate:start.toISOString(),endDate:end.toISOString(),bucket:'day',aggregation:'sum'});return r.samples||[]}catch(_){return []}};
  const st=await agg('steps'),ca=await agg('calories');S.hc.steps=S.hc.steps||{};S.hc.cal=S.hc.cal||{};
  st.forEach(s=>{S.hc.steps[dkey(new Date(s.startDate))]=Math.round(s.value)});ca.forEach(s=>{S.hc.cal[dkey(new Date(s.startDate))]=Math.round(s.value)});
  S.hc.at=Date.now();save();if(tab==='weight'||tab==='today'){if(!document.activeElement.matches('input,textarea,select'))render()}}
async function hcWeights(){const H=NP('Health');if(!H)return;
  try{const r=await H.readSamples({dataType:'weight',startDate:addDays(pkey(dkey(new Date())),-60).toISOString(),endDate:new Date(Date.now()+60000).toISOString(),limit:200,ascending:true});
    const by={};(r.samples||[]).forEach(s=>{by[dkey(new Date(s.startDate))]=Math.round(s.value*10)/10});
    const add=Object.entries(by).filter(([d])=>!S.w.some(x=>x.d===d));
    if(!add.length){toast('Новых записей веса нет');return}
    if(!confirm('Добавить '+add.length+' замеров веса из Health Connect?'))return;
    add.forEach(([d,w])=>S.w.push({d,w}));S.w.sort((a,b)=>a.d<b.d?-1:1);save();render();toast('Добавлено: '+add.length)}catch(e){toast('Не удалось прочитать вес')}}

/* ----- данные: перенос из старого приложения, перенос файлом ----- */
const isEmptyState=()=>!(S.w||[]).length&&!Object.keys(S.done||{}).length&&!S.lastBackup&&!(S.myfoods||[]).length;
function applyRestore(x,quiet){if(!x||typeof x!=='object'||!('done' in x))throw new Error('Это не копия «Рациона»');
  if(!quiet&&!confirm('Заменить текущие данные копией?'))return false;
  delete x._meta;S=Object.assign(def(),x);migrate();save();seedHome();seedReceipt();seedFix7();seedFix7b();try{localStorage.setItem('racion-wiz','1')}catch(_){}return true}
function wizHtml(){if(!IS_APP||localStorage.getItem('racion-wiz')||!isEmptyState())return '';
  return `<div class="shbg"></div><section class="shp wiz" role="dialog" aria-label="Перенос данных"><div class="bh"><h3>Привет! Перенесём твои данные?</h3></div>
  <div class="small muted">Вес, калипер, отметки и «Что дома» остались в старом «Рационе» (в браузере). Перенеси их файлом копии или начни с нуля.</div>
  <div class="ph">Из файла</div><div class="small muted">В старом приложении: Ещё → Копия данных → «Сохранить копию». Файл упадёт в «Загрузки».</div>
  <div class="btns"><label class="btn" for="bload2">Выбрать файл копии</label><input id="bload2" type="file" hidden data-in="bload"></div>
  <div class="btns" style="margin-top:14px"><button class="btn ghost" data-a="wizskip">Начать с нуля</button></div></section>`}

/* ----- первый запуск: уведомления, кнопка «назад», возвращение в приложение ----- */
async function nInit(){
  if(!IS_APP)return;
  try{localStorage.setItem('racion-boot','ok')}catch(_){}
  try{if(Date.now()-(+localStorage.getItem('racion-updchk')||0)>12*3600e3)setTimeout(()=>appCheckUpdate(false),5000)}catch(_){}
  const App=NP('App');
  try{App&&App.addListener('backButton',()=>{
    if(typeof SH!=='undefined'&&SH){SH=null;render();return}
    if(typeof X!=='undefined'&&xOpen){xOpen='';render();return}
    if(typeof F!=='undefined'&&F){F=null;render();return}
    if(tab!=='today'){tab='today';render();window.scrollTo&&window.scrollTo(0,0);return}
    App.exitApp()})}catch(_){}
  try{App&&App.addListener('appStateChange',s=>{if(s&&!s.isActive)window._hiddenAt=Date.now();if(s&&s.isActive){try{resumeToday()}catch(_){}setTimeout(()=>{nPush();hcSync(false);remRefresh();tmTick(true)},600)}})}catch(_){}
  await lnSetup();remRefresh();setTimeout(nPush,1500);setTimeout(()=>hcSync(false),3000);
  setTimeout(()=>{try{const sp=document.getElementById('splash0');sp&&sp.remove()}catch(_){}},0);
}

/* ----- обновления из релизов GitHub: сайт-часть ставится сама, APK — через установщик Android ----- */
const vcmp=(a,b)=>{const x=String(a).split('.').map(Number),y=String(b).split('.').map(Number);for(let i=0;i<Math.max(x.length,y.length);i++){const d=(x[i]||0)-(y[i]||0);if(d)return d>0?1:-1}return 0};
let UPD=null,UPD_MSG='',UPD_BUSY=false;
async function appCheckUpdate(manual){
  if(!navigator.onLine){UPD_MSG='Нет интернета';if(manual)toast(UPD_MSG);return}
  UPD_BUSY=true;if(manual)render();
  try{const r=await fetch(UPDATE_API,{headers:{Accept:'application/vnd.github+json'},cache:'no-store'});
    if(r.status===404){UPD=null;UPD_MSG='Релизов пока нет'}
    else{if(!r.ok)throw new Error('GitHub ответил '+r.status);
      const j=await r.json(),ver=String(j.tag_name||'').replace(/^v/i,''),body=String(j.body||''),nat=+((body.match(/native:(\d+)/)||[])[1]||1),
        as=j.assets||[],web=as.find(a=>a.name==='app.html'),apk=as.find(a=>/\.apk$/i.test(a.name));
      if(ver&&vcmp(ver,APP_VERSION)>0){const needApk=nat>NATIVE_API||!web,url=needApk?(apk&&apk.browser_download_url):web.browser_download_url;
        if(!url){UPD=null;UPD_MSG='Версия '+ver+' вышла, но без файла для установки'}
        else{UPD={ver,kind:needApk?'apk':'web',url,notes:body.replace(/^\s*native:\d+\s*/m,'').trim()};updReady=true;UPD_MSG='Есть версия '+ver}}
      else{UPD=null;updReady=false;UPD_MSG='У тебя последняя версия ('+APP_VERSION+')'}}
    try{localStorage.setItem('racion-updchk',String(Date.now()))}catch(_){}
  }catch(e){UPD_MSG='Не получилось проверить: '+String(e&&e.message||e).slice(0,70)}
  UPD_BUSY=false;if(manual||UPD)render();if(manual)toast(UPD_MSG)}
async function appDoUpdate(){
  if(!UPD||UPD_BUSY)return;const R=NP('RacionNative');UPD_BUSY=true;UPD_MSG='Скачиваю версию '+UPD.ver+'…';render();
  try{if(UPD.kind==='web'){await R.updateWeb({url:UPD.url,ver:UPD.ver});UPD_MSG='Готово, перезапускаю…';render();setTimeout(()=>location.replace(location.origin+'/index.html'),700);return}
    const r=await R.installApk({url:UPD.url});
    UPD_MSG=r&&r.needPermission?'Разреши установку из этого приложения в настройках, вернись и нажми «Установить» ещё раз':'Открыл установщик Android — подтверди установку'}
  catch(e){UPD_MSG='Не получилось: '+String(e&&e.message||e).slice(0,80)}
  UPD_BUSY=false;render()}

/* ----- вечерняя автокопия: файл в «Загрузки/Рацион» + (по желанию) приватный репозиторий GitHub ----- */
const GHK='racion-gh';
function ghCfg(){try{return JSON.parse(localStorage.getItem(GHK)||'null')||{}}catch(_){return {}}}
function ghSave(c){try{localStorage.setItem(GHK,JSON.stringify(c))}catch(_){}}
const ghWhy=s=>s===401||s===403?'нет доступа: проверь токен и право «Contents: Read and write»':s===404?'репозиторий не найден (проверь имя и что токен выдан на него)':'GitHub ответил '+s;
async function ghCheck(c){const r=await fetch('https://api.github.com/repos/'+c.repo,{headers:{'Authorization':'Bearer '+c.token,'Accept':'application/vnd.github+json','X-GitHub-Api-Version':'2022-11-28'}});if(!r.ok)throw new Error(ghWhy(r.status));const j=await r.json();
  if(!(j.permissions&&j.permissions.push))throw new Error('токен без права записи (нужно «Contents: Read and write»)');if(!j.private)throw new Error('репозиторий публичный — копию с твоими данными туда нельзя, сделай его приватным');return true}
let BK={},_bkCatch=false;
async function bkRefresh(){const R=NP('RacionNative');if(!R)return;try{BK=await R.status();RS=Object.assign({},RS,{widgets:BK.widgets});
    if(!_bkCatch&&BK.auto){_bkCatch=true;const y=dkey(addDays(new Date(),-1));if(!BK.localDay||BK.localDay<y){setTimeout(()=>{try{R.backupNow()}catch(_){}setTimeout(bkRefresh,6000)},4000)}}
    if(tab==='weight'&&!document.activeElement.matches('input,textarea,select'))render()}catch(_){}}
