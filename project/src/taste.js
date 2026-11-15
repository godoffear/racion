/* ===== 6.8: «Вкусы» — оценка обеда и ужина (😖 🙂 😍), список любимого и нелюбимого, подсказки в «Заменить» ===== */
const TASTE_SLOTS=['lunch','dinner'],TASTE_SKIP=['creatine','protein','oil','salt'];
const tasteSkipProd=id=>!PR[id]||PR[id].bulk||TASTE_SKIP.includes(id);
function tasteData(){S.taste=S.taste||{};S.taste.log=S.taste.log||[];S.taste.fav=S.taste.fav||{};return S.taste}
const tasteName=id=>cap(nameOf(PR[id]).replace(/:.*$/,'').toLowerCase());
let _tc={sig:'',map:null};
function tasteStats(){const T=tasteData(),sig=T.log.length+'|'+Object.keys(T.fav).length+'|'+JSON.stringify(T.pin||{})+'|'+Object.keys(T.hide||{}).length;if(_tc.sig===sig&&_tc.map)return _tc.map;
  const mp=new Map(),add=(key,type,name,v)=>{let x=mp.get(key);if(!x){x={key,type,name,l:0,n:0,d:0,total:0};mp.set(key,x)}x.total++;if(v>0)x.l++;else if(v<0)x.d++;else x.n++};
  T.log.forEach(e=>{const v=e.r===3?1:e.r===2?0:-1;
    if(e.dish)add('d:'+e.dish,'d',e.name||'Блюдо',v);
    (e.items||[]).forEach(p=>{if(tasteSkipProd(p))return;const pv=e.r===1&&e.bad&&e.bad.length?(e.bad.includes(p)?-1:0):v;add('p:'+p,'p',tasteName(p),pv)})});
  mp.forEach(x=>{const s=(x.l-x.d)/x.total;x.cls=s>=0.5?'l':s<=-0.34?'d':'n'});
  // ручная оценка (T.pin) главнее статистики; убранное (T.hide) не показываем
  Object.keys(T.pin||{}).forEach(k=>{let x=mp.get(k);if(!x){const id=k.slice(2);if(k.slice(0,2)!=='p:'||!PR[id])return;x={key:k,type:'p',name:tasteName(id),l:0,n:0,d:0,total:0};mp.set(k,x)}x.cls=T.pin[k];x.pinned=1});
  Object.keys(T.hide||{}).forEach(k=>mp.delete(k));
  _tc={sig,map:mp};return mp}
// продукты из овощей, которые вы вручную пометили «не нравится» — в меню на будущие дни заменяются другим овощем (см. dayPlan)
function tasteDisSet(){const p=(S.taste||{}).pin;if(!p)return null;const o=[];Object.keys(p).forEach(k=>{const id=k.slice(2);if(p[k]==='d'&&k.slice(0,2)==='p:'&&PR[id]&&['veg','fruit'].includes(useClass(id)))o.push(id)});return o.length?o:null}
function tasteRank(key){if(!S.taste)return 2;const T=tasteData();if(T.fav[key])return 0;const x=tasteStats().get(key);return !x?2:x.cls==='l'?1:x.cls==='d'?3:2}
function tasteMark(key){const r=tasteRank(key);return r===0?'⭐ ':r===1?'😍 ':r===3?'😖 ':''}

/* ----- плашка после «Съел» ----- */
const TASTE={ask:null,t:0};
function tasteHide(){clearTimeout(TASTE.t);TASTE.ask=null;const b=document.getElementById('tastebar');if(b)b.remove()}
function tasteShow(){const a=TASTE.ask;if(!a)return;let b=document.getElementById('tastebar');
  if(!b){b=document.createElement('div');b.id='tastebar';b.className='tastebar';b.setAttribute('role','status');document.body.appendChild(b)}
  const tm=document.getElementById('tmbar');b.style.bottom=tm&&!tm.hidden?'calc(76px + var(--sab) + '+(tm.offsetHeight+8)+'px)':'';
  b.className='tastebar'+(a.stage==='why'?' why':'');if(a.stage==='rate')b.innerHTML=`<div class="tq">Как вам «${esc(a.name)}»?</div><div class="te"><button data-a="tr" data-v="1" aria-label="Не очень">😖</button><button data-a="tr" data-v="2" aria-label="Нормально">🙂</button><button data-a="tr" data-v="3" aria-label="Супер">😍</button></div><button class="tx" data-a="tx" aria-label="Закрыть">✕</button>`;
  else b.innerHTML=`<div class="tq">Что не зашло? Можно пропустить</div><div class="tchips">${a.items.map(p=>`<button class="tc ${a.sel.has(p)?'on':''}" data-a="tw" data-v="${p}">${esc(tasteName(p))}</button>`).join('')}<button class="tc ${a.sel.has('*')?'on':''}" data-a="tw" data-v="*">Всё блюдо</button></div><button class="tdone" data-a="twd">Готово</button>`}
function tasteAsk(d,slot){try{const T=tasteData();if(T.off||!TASTE_SLOTS.includes(slot))return;if(T.log.some(e=>e.d===d&&e.s===slot))return;
  const m=dayPlan(pkey(d)).meals.find(x=>x.slot===slot);if(!m)return;
  const items=[...new Set(m.items.map(i=>i.p))].filter(p=>!tasteSkipProd(p));if(!items.length)return;
  const dish=m.rec||m.dish||'',name=dish&&RECBY[dish]?RECBY[dish][1]:items.slice(0,2).map(p=>tasteName(p).toLowerCase()).join(' и ');
  const same=T.log.filter(e=>dish?e.dish===dish:(!e.dish&&(e.items||[]).join()===items.join()));
  const last=same.slice(-3);if(same.length>=3&&last.every(e=>e.r===last[0].r)&&same.length%4!==0)return; // уверен — спрашиваю реже
  TASTE.ask={d,s:slot,dish,name,items,stage:'rate',sel:new Set(),e:null};tasteShow();clearTimeout(TASTE.t);TASTE.t=setTimeout(tasteHide,9000)}catch(_){}}
const _eatPlan=A.eat;A.eat=function(d){const k=dk_(viewDate,d.s),was=!!S.done[k],r=_eatPlan.apply(this,arguments);if(!was&&S.done[k])tasteAsk(viewDate,d.s);return r};
Object.assign(A,{
  tr:d=>{const a=TASTE.ask;if(!a)return true;const T=tasteData(),e={d:a.d,s:a.s,r:+d.v,dish:a.dish,name:a.name,items:a.items,bad:[]};T.log.push(e);if(T.log.length>600)T.log.splice(0,T.log.length-600);a.e=e;save();
    if(e.r===1){a.stage='why';tasteShow();clearTimeout(TASTE.t);TASTE.t=setTimeout(tasteHide,20000)}else{tasteHide();toast(e.r===3?'😍 Запомнил':'🙂 Записал')}return true},
  tx:()=>{tasteHide();return true},
  tw:d=>{const a=TASTE.ask;if(!a)return true;if(d.v==='*'){a.sel=a.sel.has('*')?new Set():new Set(['*'])}else{a.sel.delete('*');a.sel.has(d.v)?a.sel.delete(d.v):a.sel.add(d.v)}tasteShow();return true},
  twd:()=>{const a=TASTE.ask;if(a&&a.e){a.e.bad=a.sel.has('*')?[]:[...a.sel];save()}tasteHide();toast('😖 Учту');return true},
  tstab:d=>{TS.tab=d.v},
  tpin:d=>{const T=tasteData();T.pin=T.pin||{};T.pin[d.k]=d.v;if(T.hide)delete T.hide[d.k];_tc={sig:'',map:null};TS.tab=d.v;save();toast(d.v==='d'?'😖 Не нравится — учту':d.v==='l'?'😍 Нравится':'🙂 Нормально')},
  thide:d=>{const T=tasteData();T.hide=T.hide||{};T.hide[d.k]=1;if(T.pin)delete T.pin[d.k];delete T.fav[d.k];_tc={sig:'',map:null};save();toast('Убрал из списка')},
  tfav:d=>{const T=tasteData();if(T.fav[d.k])delete T.fav[d.k];else T.fav[d.k]=1;save()},
  ttog:()=>{const T=tasteData();T.off=T.off?0:1;save()},
  tclear:()=>{if(!confirm('Стереть все оценки?'))return true;S.taste={log:[],fav:{},off:S.taste&&S.taste.off?1:0};_tc={sig:'',map:null};save()}
});

/* ----- «Ещё → Вкусы» ----- */
const TS={tab:'l'};
function secTaste(){const T=tasteData(),mp=tasteStats(),all=[...mp.values()];
  const cnt=c=>all.filter(x=>x.cls===c).length,pr=x=>(T.fav[x.key]?1000:0)+(x.cls==='l'?x.l:x.cls==='d'?x.d:x.total);
  const list=all.filter(x=>x.cls===TS.tab).sort((a,b)=>pr(b)-pr(a)||a.name.localeCompare(b.name,'ru'));
  const sub=x=>(x.type==='d'?'блюдо':'продукт')+' · '+(x.cls==='l'?x.l+' из '+x.total+' раз':x.cls==='d'?x.d+' из '+x.total+' раз':x.total+' '+plural(x.total,['раз','раза','раз']));
  const body=`<div class="small muted">После обеда и ужина я спрашиваю, как вам блюдо. ⭐ — «хочу чаще»: такое блюдо или продукт будет первым в подсказках «Заменить».</div>
  <div class="picks tstabs">${[['l','😍'],['n','🙂'],['d','😖']].map(([c,e])=>`<button class="pick ${TS.tab===c?'on':''}" data-a="tstab" data-v="${c}" aria-pressed="${TS.tab===c}" aria-label="${c==='l'?'Нравится':c==='n'?'Нормально':'Не нравится'}">${e} ${cnt(c)}</button>`).join('')}</div>
  ${list.length?`<ul class="list tsl">${list.map(x=>`<li><div class="grow"><div class="nm">${esc(x.name)}</div><div class="sub">${sub(x)}</div></div>${[['l','😍'],['n','🙂'],['d','😖']].filter(([c])=>c!==x.cls).map(([c,e])=>`<button class="xdel" data-a="tpin" data-k="${esc(x.key)}" data-v="${c}" aria-label="${c==='l'?'Нравится':c==='n'?'Нормально':'Не нравится'}: ${esc(x.name)}">${e}</button>`).join('')}<button class="xdel" data-a="thide" data-k="${esc(x.key)}" aria-label="Убрать из списка: ${esc(x.name)}">✕</button><button class="xdel star" data-a="tfav" data-k="${esc(x.key)}" aria-pressed="${!!T.fav[x.key]}" aria-label="Хочу чаще: ${esc(x.name)}">${T.fav[x.key]?'⭐':'☆'}</button></li>`).join('')}</ul>`:`<div class="small muted" style="margin-top:8px">${all.length?'Здесь пока пусто.':'Пока нет оценок: после «Съел» на обеде или ужине появится вопрос.'}</div>`}
  <div class="field" style="margin-top:10px"><label for="tadd">Добавить продукт в «${TS.tab==='l'?'нравится':TS.tab==='n'?'нормально':'не нравится'}»</label><select id="tadd" data-in="tadd"><option value="">— выбрать продукт —</option>${Object.keys(PR).filter(id=>!tasteSkipProd(id)&&!PR[id].nobuy&&id!=='veg').sort((a,b)=>tasteName(a).localeCompare(tasteName(b),'ru')).map(id=>`<option value="${id}">${esc(tasteName(id))}</option>`).join('')}</select></div>
  <div class="small muted">Овощи и фрукты, отмеченные 😖, заменяются в меню на другие (овощ — кабачок, брокколи…, фрукт — апельсин, банан, манго). Остальное — через «Заменить».</div>
  <div class="picks" style="margin-top:10px"><button class="pick ${T.off?'':'on'}" data-a="ttog" aria-pressed="${!T.off}">${T.off?'☐':'☑'} Спрашивать после обеда и ужина</button></div>
  ${T.log.length?`<div class="btns"><button class="btn sm ghost" data-a="tclear">Стереть оценки</button></div>`:''}`;
  return secF('ts','Вкусы',cnt('l')||cnt('d')?`😍 ${cnt('l')} · 😖 ${cnt('d')}`:'',body)}
document.addEventListener('change',e=>{const el=e.target;if(el.dataset&&el.dataset.in==='tadd'&&el.value){const T=tasteData();T.pin=T.pin||{};T.pin['p:'+el.value]=TS.tab;if(T.hide)delete T.hide['p:'+el.value];_tc={sig:'',map:null};el.value='';save();render();toast('Добавил')}});
