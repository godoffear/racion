/* ===== 6.0: оформление, графики, фото прогресса, отчёт недели, разделы «Ещё» по группам ===== */
const PALETTES=__PALETTES__;
const curPal=()=>PALETTES.find(p=>p.id===S.pal)||PALETTES[0];
const darkNow=()=>{const t=S.theme||'auto';return t==='dark'||(t==='auto'&&window.matchMedia&&matchMedia('(prefers-color-scheme: dark)').matches)};
function applyTheme(){
  const P=curPal(),css=o=>Object.entries(o).map(([k,v])=>`--${k}:${v}`).join(';');
  let el=document.getElementById('palcss');if(!el){el=document.createElement('style');el.id='palcss';document.head.appendChild(el)}
  el.textContent=`:root{${css(P.l)}}@media (prefers-color-scheme:dark){:root:not([data-theme="light"]){${css(P.d)}}}:root[data-theme="dark"]{${css(P.d)}}:root[data-theme="light"]{${css(P.l)}}`;
  const t=S.theme||'auto';if(t==='auto')document.documentElement.removeAttribute('data-theme');else document.documentElement.setAttribute('data-theme',t);
  const m=darkNow()?P.d:P.l,mc=document.querySelector('meta[name=theme-color]');if(mc)mc.content=m.bg;
  if(IS_APP){const SB=NP('SystemBars');try{SB&&SB.setStyle({style:darkNow()?'DARK':'LIGHT'})}catch(_){}try{NP('RacionNative')&&nAfterSave()}catch(_){}}
}
try{matchMedia('(prefers-color-scheme: dark)').addEventListener('change',()=>{if((S.theme||'auto')==='auto'){applyTheme();render()}})}catch(_){}

/* ----- общие помощники разделов ----- */
const LAZY={ch:1,rp:1};
const secF=(id,title,right,body)=>`<details class="card" id="mo-${id}" ${moreOpen[id]?'open':''}><summary><b>${title}</b><span class="muted small">${right}</span></summary>${body}</details>`;
const GRP=t=>`<h2 class="grp">${t}</h2>`;
const pickRow=(a,cur,items)=>`<div class="picks">${items.map(([v,l])=>`<button class="pick ${String(cur)===String(v)?'on':''}" data-a="${a}" data-v="${v}" aria-pressed="${String(cur)===String(v)}">${l}</button>`).join('')}</div>`;

/* ----- статистика по дням и неделям ----- */
function dayStat(d){const k=dkey(d),pl=dayPlan(d).meals,ex=(S.extra||{})[k]||[],dn=pl.filter(m=>S.done[dk_(k,m.slot)]),skm=pl.filter(m=>(S.skip||{})[dk_(k,m.slot)]);
  const e={k:0,p:0,f:0,c:0};dn.forEach(m=>{const x=macros(m.items);e.k+=x.k;e.p+=x.p;e.f+=x.f;e.c+=x.c});ex.forEach(x=>{e.k+=x.k||0;e.p+=x.p||0;e.f+=x.f||0;e.c+=x.c||0});
  const full=dn.length+skm.length>=pl.length-1||(dn.length>=3&&ex.length>0);
  return {d,k:r0(e.k),p:r0(e.p),f:r0(e.f),c:r0(e.c),full,ok:full&&e.k>=NORM.k[0]-100&&e.k<=NORM.k[1]+100&&e.p>=NORM.p[0]-10,skipped:skm.map(m=>m.slot),done:dn.length,n:pl.length}}
function weekStats(end){const days=[];for(let i=6;i>=0;i--)days.push(dayStat(addDays(end,-i)));
  const f=days.filter(x=>x.full),n=f.length,sum=a=>f.reduce((s,x)=>s+x[a],0),skip={};days.forEach(x=>x.skipped.forEach(s=>{skip[s]=(skip[s]||0)+1}));
  const ws=(S.w||[]).slice().sort((a,b)=>a.d<b.d?-1:1),a0=dkey(addDays(end,-6)),a1=dkey(end),inW=ws.filter(x=>x.d>=a0&&x.d<=a1),before=ws.filter(x=>x.d<a0).pop();
  const wEnd=inW.length?inW[inW.length-1]:null,wStart=before||(inW.length>1?inW[0]:null);
  const st=days.map(x=>(S.hc&&S.hc.steps||{})[dkey(x.d)]).filter(v=>v>0);
  return {days,n,ok:f.filter(x=>x.ok).length,avgK:n?r0(sum('k')/n):0,avgP:n?r0(sum('p')/n):0,avgF:n?r0(sum('f')/n):0,avgC:n?r0(sum('c')/n):0,skip,skipN:Object.values(skip).reduce((a,b)=>a+b,0),
    wEnd,wStart,steps:st.length?r0(st.reduce((a,b)=>a+b,0)/st.length):0,from:addDays(end,-6),to:end}}
const sgn=(v,u,d)=>{const x=Math.round(v*(d||1))/(d||1);return (x>0?'+':x<0?'−':'')+String(Math.abs(x)).replace('.',',')+(u||'')};

/* ----- графики (SVG, без библиотек) ----- */
function chSvg(o){
  const W=320,H=160,L=36,R=8,T=8,B=22,iw=W-L-R,ih=H-T-B,X=x=>L+(x-o.x0)/((o.x1-o.x0)||1)*iw,Y=y=>T+(o.ymax-y)/((o.ymax-o.ymin)||1)*ih;
  let s=`<svg class="ch" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(o.aria||'График')}">`;
  for(const v of (o.ticks||[0,1,2,3].map(i=>o.ymin+(o.ymax-o.ymin)*i/3))){const y=Y(v);s+=`<line class="gl" x1="${L}" x2="${W-R}" y1="${y.toFixed(1)}" y2="${y.toFixed(1)}"/><text class="gt" x="${L-4}" y="${(y+3).toFixed(1)}" text-anchor="end">${o.yf?o.yf(v):Math.round(v)}</text>`}
  if(o.band)s+=`<rect class="gb" x="${L}" y="${Y(o.band[1]).toFixed(1)}" width="${iw}" height="${Math.max(1,Y(o.band[0])-Y(o.band[1])).toFixed(1)}"/>`;
  (o.bars||[]).forEach(b=>{const bw=Math.max(2,iw/((o.x1-o.x0)+1)*.7),x=X(b[0])-bw/2,y=Y(b[1]);s+=`<rect class="${b[2]||'gbar'}" x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${bw.toFixed(1)}" height="${Math.max(0,Y(o.ymin)-y).toFixed(1)}" rx="1.5"/>`});
  (o.hl||[]).forEach(h=>{s+=`<line class="gh" x1="${L}" x2="${W-R}" y1="${Y(h).toFixed(1)}" y2="${Y(h).toFixed(1)}"/>`});
  (o.series||[]).forEach(se=>{if(se.pts.length>1)s+=`<polyline class="${se.cls}" points="${se.pts.map(p=>X(p[0]).toFixed(1)+','+Y(p[1]).toFixed(1)).join(' ')}"/>`;
    if(se.dots)se.pts.forEach(p=>{s+=`<circle class="gdot" cx="${X(p[0]).toFixed(1)}" cy="${Y(p[1]).toFixed(1)}" r="2.8"/>`})});
  (o.xl||[]).forEach(([x,t])=>{s+=`<text class="gt" x="${X(x).toFixed(1)}" y="${H-6}" text-anchor="${x<=o.x0?'start':x>=o.x1?'end':'middle'}">${esc(t)}</text>`});
  return s+'</svg>'}
const niceRange=(lo,hi,pad)=>{let a=lo-pad,b=hi+pad;if(b-a<1){b+=.5;a-=.5}return [a,b]};
function chartWeight(R){
  const end=pkey(dkey(new Date())),start=addDays(end,-R*7+1),i0=dkey(start),ws=(S.w||[]).slice().sort((a,b)=>a.d<b.d?-1:1),pts=ws.filter(x=>x.d>=i0);
  if(!pts.length)return `<div class="small muted">За этот период нет записей веса. Запиши вес в разделе «Вес» выше.</div>`;
  const idx=d=>Math.round((pkey(d)-start)/864e5),avg=pts.map(p=>{const near=ws.filter(x=>x.d<=p.d&&idx(x.d)>=idx(p.d)-6);return [idx(p.d),near.reduce((a,x)=>a+x.w,0)/near.length]});
  const vals=pts.map(p=>p.w).concat([82.5]),[ymin,ymax]=niceRange(Math.min(...vals),Math.max(...vals),.4),f=ws.filter(x=>x.d<i0).pop(),first=pts[0],last=pts[pts.length-1];
  const xl=[[0,fmtDate(start)],[Math.round((R*7-1)/2),fmtDate(addDays(start,Math.round((R*7-1)/2)))],[R*7-1,fmtDate(end)]];
  const d=last.w-(f||first).w;
  return chSvg({aria:'График веса',x0:0,x1:R*7-1,ymin,ymax,yf:v=>String(Math.round(v*10)/10).replace('.',','),hl:[82.5],xl,series:[{pts:pts.map(p=>[idx(p.d),p.w]),cls:'gl2',dots:1},{pts:avg,cls:'gl1'}]})+
   `<div class="legend"><span><i class="lg1"></i>среднее за 7 дней</span><span><i class="lg2"></i>замеры</span><span><i class="lgh"></i>цель 82,5</span></div>
   <div class="small muted">Сейчас ${kg(last.w)} кг. За период ${sgn(d,' кг',10)}${R>=2?` · около ${sgn(d/R,' кг',10)} в неделю`:''}. Среднее за 7 дней — ${kg(avg[avg.length-1][1])} кг: оно показывает тренд без скачков от воды и соли.</div>`}
function chartCaliper(R){
  const cs=(S.cal||[]).slice().sort((a,b)=>a.d<b.d?-1:1);if(!cs.length)return `<div class="small muted">Замеров калипера пока нет — добавь в разделе «Калипер».</div>`;
  const end=pkey(dkey(new Date())),span=Math.max(R*7,28),start=addDays(end,-span+1),pts=cs.filter(x=>x.d>=dkey(start)),use=pts.length>1?pts:cs.slice(-6),x0=pkey(use[0].d),sp=Math.max(1,Math.round((pkey(use[use.length-1].d)-x0)/864e5)),
    [ymin,ymax]=niceRange(Math.min(...use.map(c=>c.b),12),Math.max(...use.map(c=>c.b),13),1);
  return chSvg({aria:'График калипера',x0:0,x1:sp,ymin,ymax,yf:v=>String(Math.round(v*10)/10).replace('.',','),hl:[12.5],xl:[[0,fmtDate(x0)],[sp,fmtDate(pkey(use[use.length-1].d))]],series:[{pts:use.map(c=>[Math.round((pkey(c.d)-x0)/864e5),c.b]),cls:'gl1',dots:1}]})+
   `<div class="legend"><span><i class="lg1"></i>живот, ед.</span><span><i class="lgh"></i>цель 12–13</span></div><div class="small muted">Сейчас ${String(use[use.length-1].b).replace('.',',')} ед.${use.length>1?' · изменение за период '+sgn(use[use.length-1].b-use[0].b,' ед.',10):''}</div>`}
function chartFood(R,mt){
  const end=addDays(pkey(dkey(appNow())),-1),n=R*7,st=[];for(let i=n-1;i>=0;i--)st.push(dayStat(addDays(end,-i)));
  const key=mt==='p'?'p':'k',lo=mt==='p'?NORM.p[0]-10:NORM.k[0]-100,hi=mt==='p'?NORM.p[1]+20:NORM.k[1]+100,f=st.filter(x=>x.full);
  if(!f.length)return `<div class="small muted">Пока нет дней с отметками. Отмечай приёмы кнопкой «Съел» — тогда здесь появится картина.</div>`;
  const ymax=Math.ceil(Math.max(mt==='p'?250:2400,...f.map(x=>x[key]))/(mt==='p'?50:500))*(mt==='p'?50:500),tk=[];for(let v=0;v<=ymax;v+=(mt==='p'?50:500))tk.push(v);const bars=st.map((x,i)=>x.full?[i,x[key],(mt==='p'?x.p>=lo:x.k>=lo&&x.k<=hi)?'gbar ok':'gbar off']:null).filter(Boolean);
  const wk=[];for(let w=0;w<R;w++){const a=st.slice(w*7,w*7+7),ff=a.filter(x=>x.full);wk.push({d:a[0].d,e:a[6].d,n:ff.length,ok:ff.filter(x=>x.ok).length,k:ff.length?r0(ff.reduce((s,x)=>s+x.k,0)/ff.length):0,p:ff.length?r0(ff.reduce((s,x)=>s+x.p,0)/ff.length):0})}
  return pickRow('chm',mt||'k',[['k','Ккал'],['p','Белок']])+chSvg({aria:mt==='p'?'Белок по дням':'Ккал по дням',x0:0,x1:n-1,ymin:0,ymax,ticks:tk,band:[lo,mt==='p'?ymax:hi],bars,xl:[[0,fmtDate(st[0].d)],[n-1,fmtDate(st[n-1].d)]]})+
   `<div class="legend"><span><i class="lgb ok"></i>в норме</span><span><i class="lgb off"></i>вне нормы</span><span><i class="lgp"></i>зона нормы</span></div>
   <ul class="list wkl">${wk.slice().reverse().map(w=>`<li><div class="grow"><b>${fmtDate(w.d)} – ${fmtDate(w.e)}</b><div class="sub">${w.n?`в среднем ${w.k} ккал · белок ${w.p} г`:'нет отметок'}</div></div><span class="${w.n&&w.ok>=w.n-1?'':'muted'}">${w.n?w.ok+' из '+w.n:'—'}</span></li>`).join('')}</ul>`}
function chartSteps(R){
  const st=(S.hc&&S.hc.steps)||{},n=Math.min(28,R*7),end=pkey(dkey(new Date())),days=[];for(let i=n-1;i>=0;i--){const d=addDays(end,-i);days.push([d,st[dkey(d)]||0])}
  const vals=days.map(x=>x[1]).filter(v=>v>0);if(!vals.length)return `<div class="small muted">Шагов пока нет: нажми «Обновить» в разделе «Здоровье».</div>`;
  const avg=r0(vals.reduce((a,b)=>a+b,0)/vals.length),ymax=Math.max(10000,...vals)*1.05;
  return chSvg({aria:'Шаги по дням',x0:0,x1:n-1,ymin:0,ymax,yf:v=>(v>=1000?Math.round(v/1000)+'к':Math.round(v)),hl:[avg],bars:days.map((x,i)=>x[1]>0?[i,x[1],'gbar ok']:null).filter(Boolean),xl:[[0,fmtDate(days[0][0])],[n-1,fmtDate(days[n-1][0])]]})+`<div class="small muted">В среднем ${avg.toLocaleString('ru-RU')} шагов в день (линия). Данные — из Health Connect.</div>`}
const CH={t:'w',r:8,m:'k'};
function chBody(){const tabs=[['w','Вес'],['c','Калипер'],['n','Питание']].concat(hcOn()?[['s','Шаги']]:[]);
  let h=pickRow('cht',CH.t,tabs)+pickRow('chr',CH.r,[[4,'4 нед'],[8,'8 нед'],[12,'12 нед']]);
  h+=CH.t==='w'?chartWeight(CH.r):CH.t==='c'?chartCaliper(CH.r):CH.t==='n'?chartFood(CH.r,CH.m):chartSteps(CH.r);return h}

/* ----- отчёт недели ----- */
function reportBody(){
  const end=addDays(pkey(dkey(appNow())),-1),C=weekStats(end),P=weekStats(addDays(end,-7)),adv=[];
  const slotMost=Object.entries(C.skip).sort((a,b)=>b[1]-a[1])[0];
  if(C.n<4)adv.push('Отмечено мало дней — нажимай «Съел» после каждого приёма, тогда отчёт будет точным.');
  else{
    if(C.avgP<NORM.p[0]-10)adv.push(`Белка в среднем ${C.avgP} г при норме ${NORM.p[0]}–${NORM.p[1]} г. Не пропускай перекус с протеином и порции белка в обеде и ужине.`);
    if(C.avgK>NORM.k[1]+100)adv.push(`Калорий в среднем ${C.avgK} — выше нормы (${NORM.k[0]}–${NORM.k[1]}). Загляни в «еду вне плана» и в напитки.`);
    else if(C.avgK<NORM.k[0]-150)adv.push(`Калорий в среднем ${C.avgK} — заметно ниже нормы. Для набора мышц добавь рис или фрукт к приёму.`);
    if(slotMost&&slotMost[1]>=2)adv.push(`Чаще всего пропускается: ${SLOTS[slotMost[0]].toLowerCase()} (${slotMost[1]} раз). Если он не подходит по времени — сдвинь или замени его.`);
    if(C.ok>=6)adv.push('Отличная неделя: почти все дни в норме. Держи тот же ритм.');
    else if(C.ok>=4)adv.push('Хорошая неделя. Подтяни дни, где не хватило белка, — это быстрее всего улучшит результат.');
  }
  if(!C.wEnd)adv.push('На этой неделе вес не записан — взвешивайся по пятницам натощак.');
  const row=(l,a,b,u,dd)=>`<li><div class="grow">${l}</div><b>${a}${u||''}</b><span class="muted small" style="min-width:64px;text-align:right">${b===null?'':sgn(a-b,u||'',dd||1)}</span></li>`;
  const sum=summaryCard().replace('<section class="card sum"><h3>Итог недели</h3>','<div class="sum">').replace(/<\/section>$/,'</div>');
  return sum+`<div class="ph">К прошлой неделе</div><ul class="list cmpl">${row('Дней в норме',C.ok,P.n?P.ok:null,'')}${row('Ккал в среднем',C.avgK,P.n?P.avgK:null,'')}${row('Белок в среднем, г',C.avgP,P.n?P.avgP:null,'')}${C.steps?row('Шагов в день',C.steps,P.steps||null,''):''}</ul>
  <div class="ph">Что поправить</div><ul class="notes">${adv.map(t=>`<li>${esc(t)}</li>`).join('')||'<li>Всё идёт по плану</li>'}</ul>
  <div class="small muted">Отчёт считается за 7 дней до вчерашнего. В воскресенье в 20:30 придёт напоминание.</div>`}

/* ----- разделы «Ещё» ----- */
function secCharts(){return secF('ch','Графики','вес · питание',moreOpen.ch?chBody():'')}
function secReport(){return secF('rp','Отчёт недели','',moreOpen.rp?reportBody():'')}
function secTimers(){return secF('tm','Таймеры на кухне',TM.filter(t=>!t.done).length?TM.filter(t=>!t.done).length+' идёт':'',
  `<div class="small muted">Сигнал придёт даже с выключенным экраном. В рецептах у шагов с временем есть кнопка ⏱.</div>${`<div class="picks">${[1,3,5,10,15,20,30,45].map(m=>`<button class="pick" data-a="tms" data-sec="${m*60}" data-l="Таймер ${m} мин">${m} мин</button>`).join('')}</div>`}
  <div class="addrow" style="margin-top:8px"><input id="tmmin" inputmode="decimal" placeholder="Минут" aria-label="Минут"><input id="tmlab" placeholder="Название (необязательно)" aria-label="Название таймера"><button class="btn pri" data-a="tmcustom">Старт</button></div>`)}
function secUpdate(){
  const right=UPD?'<span class="flag">есть '+esc(UPD.ver)+'</span>':'версия '+APP_VERSION;
  return secF('u','Обновление приложения',right,
  `<div class="small muted">Установлена версия <b>${APP_VERSION}</b>. Обновления приходят из релизов в GitHub.</div>
  ${UPD_MSG?`<div class="small ${/^Не /.test(UPD_MSG)?'flag':''}" style="margin:8px 0">${esc(UPD_MSG)}</div>`:''}
  ${UPD?`<div class="card" style="margin:8px 0;background:var(--sunk);box-shadow:none"><b>Версия ${esc(UPD.ver)}</b>${UPD.notes?`<div class="small" style="margin-top:4px;white-space:pre-wrap">${esc(UPD.notes)}</div>`:''}<div class="small muted" style="margin-top:6px">${UPD.kind==='web'?'Установится сразу: данные и настройки сохранятся, приложение перезапустится само.':'Это обновление с новыми функциями телефона: Android спросит подтверждение установки. Данные сохранятся.'}</div></div>`:''}
  <div class="btns">${UPD?`<button class="btn pri" data-a="upd" ${UPD_BUSY?'disabled':''}>${UPD.kind==='web'?'Обновить':'Установить'} ${esc(UPD.ver)}</button>`:''}<button class="btn ${UPD?'':'pri'}" data-a="updcheck" ${UPD_BUSY?'disabled':''}>Проверить обновление</button></div>`)}
function secTheme(){const P=curPal();
  return secF('th','Оформление',P.n+' · '+({auto:'как в системе',light:'светлая',dark:'тёмная'}[S.theme||'auto']),
  `<div class="ph" style="margin-top:0">Тема</div>${pickRow('theme',S.theme||'auto',[['auto','Как в системе'],['light','Светлая'],['dark','Тёмная']])}
  <div class="ph">Цвета</div><div class="palg">${PALETTES.map(p=>{const m=darkNow()?p.d:p.l;return `<button class="palb ${p.id===P.id?'on':''}" data-a="pal" data-v="${p.id}" aria-pressed="${p.id===P.id}"><span class="sw"><i style="background:${m.bg}"></i><i style="background:${m.accent}"></i><i style="background:${m.now}"></i></span>${esc(p.n)}</button>`}).join('')}</div>`)}
function secRemNative(){const R=S.rm||{},on=k=>R[k]!==0,rs=RS.ok;
  const t=(k,l)=>`<button class="pick ${on(k)?'on':''}" data-a="rmtog" data-v="${k}" aria-pressed="${on(k)}">${on(k)?'☑':'☐'} ${l}</button>`;
  return secF('r','Напоминания',rs?(RS.perm==='granted'?(on('on')?'за 30 мин до еды':'выключены'):'<span class="flag">нет разрешения</span>'):'',
  `<div class="small muted">Каждое напоминание приходит <b>за 30 минут до приёма пищи</b> — чтобы успеть приготовить. В нём что и сколько есть. Расписание ставится на 10 дней вперёд и обновляется при каждом входе и отметке «Съел».</div>
  <div class="picks" style="margin-top:8px">${t('on','Приёмы пищи')}${t('weigh','Взвешивание (пт 9:05)')}${t('rep','Итоги недели (вс 20:30)')}</div>
  <div class="ph">Состояние</div><ul class="notes"><li>Уведомления: ${rs?(RS.perm==='granted'?'разрешены ✓':'<b class="flag">не разрешены</b>'):'проверяю…'}</li><li>Точное время: ${rs?(RS.exact==='granted'?'разрешено ✓':'<b class="flag">не разрешено</b> — без этого Android может сдвигать напоминания'):'…'}</li>${rs&&RS.n!=null?`<li>Запланировано напоминаний: ${RS.n}</li>`:''}</ul>
  <div class="btns">${rs&&RS.perm!=='granted'?'<button class="btn pri" data-a="rmperm">Разрешить уведомления</button>':''}${rs&&RS.exact!=='granted'?'<button class="btn" data-a="rmexact">Разрешить точное время</button>':''}<button class="btn" data-a="rmtest">Проверить через 5 сек</button><button class="btn ghost" data-a="rmre">Обновить расписание</button></div>
  <p class="small muted" style="margin-bottom:0">Если напоминания опаздывают: Настройки телефона → Приложения → Рацион → Батарея → «Без ограничений».</p>`)}
function secWidget(){const W=[['line','Сводка','3×2','Приём со списком продуктов, калории и белок за день'],['ring','Кольцо','2×2','Два кольца: калории и белок за день'],['meal','Приём','2×2','Время, название и состав ближайшего приёма'],['day','День','4×2','Все приёмы дня списком, ближайший выделен']];
  return secF('wg','Виджеты на рабочий стол',RS&&RS.widgets!=null?(RS.widgets?RS.widgets+' на экране':''):'',
  `<div class="small muted">Выбери подходящий вид — каждый можно растянуть и поставить сколько угодно. Цвета берутся из выбранной палитры. Нажми на виджет, чтобы открыть приложение.</div>
  <ul class="list">${W.map(([k,n,sz,d])=>`<li><div class="grow"><div class="nm">${n} · ${sz}</div><div class="sub">${d}</div></div><button class="btn sm" data-a="wgpin" data-k="${k}">Добавить</button></li>`).join('')}</ul>
  <div class="btns"><button class="btn" data-a="wgrefresh">Обновить виджеты</button></div>
  <p class="small muted" style="margin-bottom:0">Если кнопка не сработала: задержи палец на пустом месте рабочего стола → «Виджеты» → «Рацион».</p>`)}
function secHealth(){const H=S.hc||{},on=hcOn(),tk=dkey(new Date()),st=(H.steps||{})[tk],ca=(H.cal||{})[tk];
  return secF('hc','Здоровье (Health Connect)',on?(st!=null?st.toLocaleString('ru-RU')+' шагов':'подключено'):'не подключено',
  on?`<ul class="notes"><li>Сегодня: ${st!=null?st.toLocaleString('ru-RU')+' шагов':'нет данных'}${ca?' · активных ккал: '+ca:''}</li><li>Данные приходят из Health Connect: часы, браслет или само приложение «Шагомер» пишут туда шаги</li><li>${H.at?'Обновлено в '+pad(new Date(H.at).getHours())+':'+pad(new Date(H.at).getMinutes()):'Ещё не обновлялось'}</li></ul>
  <div class="btns"><button class="btn pri" data-a="hcsync">Обновить</button><button class="btn" data-a="hcweight">Подтянуть вес</button><button class="btn ghost" data-a="hcset">Права доступа</button><button class="btn ghost" data-a="hcoff">Отключить</button></div>`
  :`<div class="small muted">Рацион сможет показывать шаги и активные калории на экране «Сегодня», в графиках и в отчёте недели. Данные только читаются и остаются на телефоне.</div><div class="btns"><button class="btn pri" data-a="hcon">Подключить Health Connect</button></div>`)}
const fmtAt=ms=>{const d=new Date(ms);return fmtDate(d)+' '+pad(d.getHours())+':'+pad(d.getMinutes())};
function secData(){const ba=backupAge(),g=ghCfg(),on=S.ab!==0,B=BK||{},tokUrl='https://github.com/settings/personal-access-tokens/new?name=Racion%20auto-backup&description=%D0%90%D0%B2%D1%82%D0%BE%D0%BA%D0%BE%D0%BF%D0%B8%D1%8F%20%D0%A0%D0%B0%D1%86%D0%B8%D0%BE%D0%BD%D0%B0&target_name=godoffear&expires_in=365&contents=write';
  const right=B.localAt?'авто · '+fmtAt(B.localAt):(S.lastBackup?(ba>30?'<span class="flag">пора сохранить</span>':'сохранена '+fmtDate(new Date(S.lastBackup))):'ещё не делал');
  return secF('b','Копия и перенос данных',right,
  `<div class="small muted">Все данные (вес, калипер, отметки, правки меню) хранятся только в этом приложении, на телефоне. Копию можно сохранить в файл и перенести на другой телефон.</div>
  <div class="btns"><button class="btn pri" data-a="bsave">Сохранить копию в файл</button><label class="btn" for="bload">Загрузить копию из файла</label><input id="bload" type="file" hidden data-in="bload"></div>
  ${IS_APP?`<div class="ph">Автокопия каждый вечер в 23:59</div>
  <div class="picks"><button class="pick ${on?'on':''}" data-a="abtog" aria-pressed="${on}">${on?'☑ Включена':'☐ Выключена'}</button></div>
  <ul class="notes"><li>В файл: ${B.localAt?fmtAt(B.localAt)+' → «Загрузки/Рацион» (хранятся последние 14)':'ещё не делалась'}${B.localErr?' · <span class="flag">'+esc(B.localErr)+'</span>':''}</li>
  <li>GitHub: ${B.ghOn?(B.ghAt?'отправлено '+fmtAt(B.ghAt):'подключено, ждёт первой отправки')+(B.ghErr?' · <span class="flag">'+esc(B.ghErr)+'</span>':''):'не подключён'}</li></ul>
  <div class="btns"><button class="btn" data-a="bknow">Сделать копию сейчас</button></div>
  <details style="margin-top:10px" id="ghbox" ${GHB.open?'open':''}><summary class="small muted">${B.ghOn?'GitHub подключён: '+esc(g.repo||''):'Подключить отправку на GitHub'}</summary>
  ${B.ghOn?`<div class="btns"><button class="btn sm" data-a="ghtest">Проверить доступ</button><button class="btn ghost sm" data-a="ghoff">Отключить</button></div>`:
  `<ol class="notes"><li>На GitHub создан <b>приватный</b> репозиторий для копий (<b>godoffear/racion-backups</b> уже создан)</li>
  <li><button class="link" data-a="openurl" data-u="${tokUrl}">Открой страницу создания токена</button>: имя уже вписано. Выбери <b>Only select repositories → racion-backups</b>, права <b>Contents: Read and write</b> уже стоят — нажми Generate token и скопируй токен</li>
  <li>Вставь токен ниже и нажми «Подключить»</li></ol>
  <div class="field"><label for="ghrepo">Репозиторий</label><input id="ghrepo" value="${esc(g.repo||'godoffear/racion-backups')}" autocapitalize="off" autocomplete="off"></div>
  <div class="field"><label for="ghtok">Токен</label><input id="ghtok" type="password" autocomplete="off" placeholder="github_pat_…"></div>
  <div class="btns"><button class="btn pri" data-a="ghon">Подключить</button></div>`}</details>`:''}`)}
const GHB={open:false};
function todayExtra(){let h='';
  if(hcOn()&&viewDate===dkey(appNow())){const tk=dkey(new Date()),st=(S.hc.steps||{})[tk],ca=(S.hc.cal||{})[tk];if(st!=null)h+=`<div class="hcchip" role="note">👣 ${st.toLocaleString('ru-RU')} шагов${ca?' · 🔥 '+ca+' ккал активных':''}</div>`}
  if(IS_APP&&!S.setupDone&&RS.ok&&(RS.perm!=='granted'||RS.exact==='denied'))h+=`<div class="card due xcard"><b>Включи напоминания о еде</b><div class="small muted">Нужно разрешение на уведомления — тогда приложение напомнит о каждом приёме и о готовке. Со временем пригодится и «точное время».</div><div class="btns"><button class="btn pri" data-a="rmperm">Разрешить</button><button class="btn sm ghost" data-a="setupdone">Позже</button></div></div>`;
  return h}
const _vToday=vToday;vToday=function(){const h=_vToday(),x=todayExtra();return x?h.replace('</header>','</header>'+x):h};

/* ----- действия ----- */
Object.assign(A,{
  theme:d=>{S.theme=d.v;save();applyTheme()},
  pal:d=>{S.pal=d.v;save();applyTheme()},
  cht:d=>{CH.t=d.v},chr:d=>{CH.r=+d.v},chm:d=>{CH.m=d.v},
  tms:d=>{tmStart(+d.sec,d.l||'Таймер');return true},
  tmx:d=>{tmDel(+d.v);return true},
  tmcustom:()=>{const m=parseNum((document.getElementById('tmmin')||{}).value),l=((document.getElementById('tmlab')||{}).value||'').trim();if(!(m>0)){toast('Впиши минуты');return true}tmStart(Math.round(m*60),l||'Таймер '+String(m).replace('.',',')+' мин');return true},
  rmtog:d=>{S.rm=S.rm||{};S.rm[d.v]=S.rm[d.v]===0?1:0;save();nSchedule(true)},
  rmperm:async()=>{const LN=await lnSetup();if(!LN)return true;try{const r=await LN.requestPermissions();if(r.display==='granted'){try{const e=await LN.checkExactNotificationSetting();if(e.exact_alarm!=='granted'){toast('Теперь разреши точное время');await LN.changeExactNotificationSetting()}}catch(_){}await nSchedule(true)}else toast('Без разрешения напоминаний не будет')}catch(_){}remRefresh();return true},
  rmexact:async()=>{const LN=NP('LocalNotifications');try{await LN.changeExactNotificationSetting()}catch(_){}setTimeout(remRefresh,1500);return true},
  rmtest:async()=>{const LN=await lnSetup();if(!LN)return true;try{const p=await LN.checkPermissions();if(p.display!=='granted'){const r=await LN.requestPermissions();if(r.display!=='granted'){toast('Нет разрешения на уведомления');return true}}
    await LN.schedule({notifications:[{id:5999999,title:'Рацион · проверка',body:'Так будут выглядеть напоминания',schedule:{at:new Date(Date.now()+5000),allowWhileIdle:true},channelId:'meals',actionTypeId:'MEAL',extra:{}}]});toast('Через 5 секунд придёт уведомление')}catch(e){toast('Не получилось: '+String(e&&e.message||e).slice(0,60))}return true},
  rmre:async()=>{await nSchedule(true);remRefresh();toast('Расписание обновлено');return true},
  setupdone:()=>{S.setupDone=1;save()},
  wgpin:async d=>{const R=NP('RacionNative');try{const r=await R.pinWidget({kind:d.k||'day'});toast(r&&r.requested?'Подтверди добавление в окне Android':'Телефон не умеет добавлять сам — задержи палец на рабочем столе → Виджеты → Рацион')}catch(_){toast('Не получилось')}setTimeout(bkRefresh,2500);return true},
  wgrefresh:()=>{nPush();bkRefresh();toast('Виджет обновлён');return true},
  hcon:()=>{hcConnect();return true},
  hcsync:async()=>{await hcSync(true);toast('Обновлено');return true},
  hcweight:()=>{hcWeights();return true},
  hcset:()=>{const H=NP('Health');try{H&&H.openHealthConnectSettings()}catch(_){}return true},
  hcoff:()=>{if(!confirm('Отключить Health Connect? Сохранённые шаги останутся.'))return true;S.hc.on=0;save()},
  abtog:()=>{S.ab=S.ab===0?1:0;save();nPush();setTimeout(bkRefresh,500)},
  bknow:()=>{const R=NP('RacionNative');nPush();setTimeout(async()=>{try{await R.backupNow();toast('Делаю копию…');setTimeout(bkRefresh,5000)}catch(_){toast('Не получилось')}},800);return true},
  ghon:async()=>{const repo=((document.getElementById('ghrepo')||{}).value||'').trim(),token=((document.getElementById('ghtok')||{}).value||'').trim();
    if(!/^[\w.-]+\/[\w.-]+$/.test(repo)){toast('Репозиторий в виде владелец/имя');return true}if(!token){toast('Вставь токен');return true}
    toast('Проверяю доступ…');try{await ghCheck({repo,token});ghSave({repo,token});GHB.open=true;nPush();toast('Подключено. Первая отправка — в 23:59 или кнопкой «Сделать копию сейчас»');setTimeout(bkRefresh,800)}catch(e){toast(String(e&&e.message||e).slice(0,90))}render();return true},
  ghtest:async()=>{const c=ghCfg();toast('Проверяю…');try{await ghCheck(c);toast('Доступ есть ✓')}catch(e){toast(String(e&&e.message||e).slice(0,90))}return true},
  ghoff:()=>{if(!confirm('Отключить отправку на GitHub? Токен удалится с этого телефона.'))return true;ghSave({});nPush();setTimeout(bkRefresh,600)},
  wizskip:()=>{try{localStorage.setItem('racion-wiz','1')}catch(_){}}
});

// копия данных в файл: в «Загрузки» через Android
A.bsave=()=>{S.lastBackup=Date.now();save();moreOpen.b=true;const nm='Рацион_'+(x=>dkey(x)+'_'+pad(x.getHours())+'-'+pad(x.getMinutes()))(new Date())+'.json';
  nSaveFile(nm,JSON.stringify(S)).then(w=>{toast(w?'Копия сохранена: '+w:'Не удалось сохранить копию');render()});return true};
document.addEventListener('toggle',e=>{if(e.target.id==='ghbox')GHB.open=e.target.open},true);
