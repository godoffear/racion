// Тренер — экраны и навигация. Ванильный JS без зависимостей.
// Отрисовка: функции v*() возвращают HTML-строку, клики ловит один обработчик по data-a.
const APP_VERSION = '0.1';

// ───── Даты ─────
const pad = n => String(n).padStart(2, '0');
const dk = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const pk = s => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); };
const addDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
const monday = d => { const x = new Date(d.getFullYear(), d.getMonth(), d.getDate()); return addDays(x, -((x.getDay() + 6) % 7)); };
const WD = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
const WD_FULL = ['воскресенье', 'понедельник', 'вторник', 'среда', 'четверг', 'пятница', 'суббота'];
const MON = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];
const fmtDate = d => `${WD[d.getDay()]}, ${d.getDate()} ${MON[d.getMonth()]}`;

// ───── Числа ─────
const fmt = x => String(Math.round(x * 100) / 100).replace('.', ',');
const num = s => { const x = parseFloat(String(s).replace(',', '.')); return isFinite(x) ? x : null; };
const steps = n => n >= 1000 ? (n / 1000).toFixed(1).replace('.0', '').replace('.', ',') + ' тыс' : String(n);
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

// ───── Иконки ─────
const I = {
  today: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="3" y="5" width="18" height="16" rx="3"/><path d="M3 10h18M8 3v4M16 3v4"/></svg>',
  prog: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 7v10M18 7v10M3 10v4M21 10v4M6 12h12"/></svg>',
  stats: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19h16M6 15l4-5 4 3 5-7"/></svg>',
  more: '<svg viewBox="0 0 24 24" fill="currentColor"><circle cx="5" cy="12" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="19" cy="12" r="2"/></svg>',
  dumb: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M6 7v10M18 7v10M3 10v4M21 10v4M6 12h12"/></svg>',
  walk: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="13" cy="4" r="1.6"/><path d="M10 21l2-6 3 3v3M9 11l3-3 3 3 3 1M12 8l-1 5"/></svg>',
  check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12l5 5 9-10"/></svg>',
};

// ───── План ─────
const planOf = d => D.program.week[d.getDay()] || 'rest';
const isTrain = p => !!D.program.days[p];

// Подходы упражнения по всем завершённым тренировкам: [{date, it:{ex,sets,…}}], новые в конце.
function exHistory(ex) {
  const out = [];
  for (const w of D.workouts) if (w.done) for (const it of w.items) if (it.ex === ex && it.sets && it.sets.some(s => !s.warm)) out.push({ date: w.date, it });
  return out;
}
// Последний рабочий вес (до этапа прогрессии — просто лучший подход прошлой тренировки).
// Для гравитрона — наименьшая помощь.
function lastWork(ex, item) {
  const h = exHistory(ex); if (!h.length) return null;
  const sets = h[h.length - 1].it.sets.filter(s => !s.warm);
  const inRange = sets.filter(s => s.reps >= item.lo && s.reps <= item.hi);
  const pool = inRange.length ? inRange : sets;
  const ws = pool.map(s => s.kg).filter(x => x != null);
  if (!ws.length) return null;
  return EX[ex].type === 'assist' ? Math.min(...ws) : Math.max(...ws);
}
const curAssist = () => lastWork('gravitron', { lo: 1, hi: 99 });
// Пора ли менять вис на негативы: помощь меньше 30% веса тела.
function negReady() {
  const a = curAssist(), bw = D.settings.weight;
  return a != null && bw && a < bw * 0.3;
}
// Упражнения дня с учётом этапа пути к подтягиванию.
function dayItems(dayId) {
  const day = D.program.days[dayId]; if (!day) return [];
  return day.items.map(x => x.pull === 'hang' && negReady() ? Object.assign({}, x, { ex: 'neg', sets: 3, lo: 3, hi: 5, rest: 90 }) : x);
}

function repsLabel(x) {
  const e = EX[x.ex], r = x.lo === x.hi ? x.lo : `${x.lo}–${x.hi}`;
  return `${x.sets}×${r}${e.type === 'time' ? ' с' : ''}`;
}
function workLabel(x) {
  const e = EX[x.ex];
  if (e.type === 'time') return { t: 'на время', c: 'pick' };
  if (e.type === 'bw') return { t: 'свой вес', c: 'pick' };
  const w = lastWork(x.ex, x);
  if (w == null) return { t: 'подбор', c: 'pick' };
  return { t: (e.type === 'assist' ? 'помощь ' : '') + fmt(w) + ' кг', c: '' };
}

// ───── Ходьба и шаги ─────
const walksOn = key => D.walks.filter(w => w.date === key);
function stepsOn(key) {
  const ws = walksOn(key), day = ws.find(w => w.kind === 'day');
  return day ? day.steps : ws.reduce((s, w) => s + (w.steps || 0), 0);
}
const walkMinOn = key => walksOn(key).reduce((s, w) => s + (w.min || 0), 0);

// ───── Состояние экрана ─────
let tab = 'today';
const $ = s => document.querySelector(s);

function render() {
  const v = { today: vToday, prog: vProgram, stats: vStats, more: vMore }[tab];
  $('#app').innerHTML = v();
  $('#tabs').innerHTML = [['today', 'Сегодня'], ['prog', 'Программа'], ['stats', 'Прогресс'], ['more', 'Ещё']]
    .map(([k, t]) => `<button data-a="tab" data-k="${k}" class="${tab === k ? 'on' : ''}">${I[k]}${t}</button>`).join('');
}

// ───── Сегодня ─────
function vWeek(now) {
  const m = monday(now), tk = dk(now);
  let h = '<div class="week">';
  for (let i = 0; i < 7; i++) {
    const d = addDays(m, i), key = dk(d), p = planOf(d);
    const trained = D.workouts.some(w => w.date === key && w.done), walked = walkMinOn(key) > 0;
    let icon = isTrain(p) ? I.dumb : p === 'walk' ? I.walk : '—';
    if (trained) icon = I.check;
    else if (walked && !isTrain(p)) icon = I.check;
    const cls = ['wd', key === tk ? 'today' : '', trained ? 'done' : '', walked && !trained ? 'wdone' : ''].join(' ');
    h += `<div class="${cls}"><b>${WD[d.getDay()]}</b><span class="num">${d.getDate()}</span><i>${icon}</i></div>`;
  }
  return h + '</div>';
}

function vToday() {
  const now = new Date(), p = planOf(now), key = dk(now);
  let h = `<div class="top"><div><div class="muted">${fmtDate(now)}</div><h1>Сегодня</h1></div></div>`;
  h += vWeek(now) + '<div class="cols"><div>';
  if (isTrain(p)) {
    const day = D.program.days[p], items = dayItems(p), done = D.workouts.find(w => w.date === key && w.done);
    h += `<div class="card"><div class="card-h"><div><div class="muted small">${WD_FULL[now.getDay()]}</div><h2>${esc(day.name)}</h2></div>
      <span class="tag">≈ ${dayMinutes({ items })} мин</span></div><ul class="exl">`;
    for (const x of items) {
      const w = workLabel(x);
      h += `<li class="tap" data-a="tech" data-ex="${x.ex}"><div class="n"><b>${esc(EX[x.ex].name)}</b><span>${repsLabel(x)}</span></div><div class="w ${w.c}">${w.t}</div></li>`;
    }
    h += '</ul>';
    h += done ? `<div class="btn ghost">${I.check} Тренировка сделана</div>` : `<button class="btn main" data-a="start">Начать тренировку</button>`;
    h += '</div>';
  } else {
    const walkDay = p === 'walk';
    h += `<div class="card"><div class="card-h"><div><div class="muted small">${WD_FULL[now.getDay()]}</div><h2>${walkDay ? 'День ходьбы' : 'Отдых'}</h2></div></div>
      <p class="muted" style="margin:0">${walkDay ? 'Силовой нет. Ходьба 45–60 минут спокойным шагом — так, чтобы можно было разговаривать.' : 'Силовой нет. Если хочется — спокойная прогулка 30–45 минут.'}</p>`;
    const next = nextTraining(now);
    if (next) h += `<p class="note">Следующая силовая — ${WD_FULL[next.d.getDay()]}: ${esc(next.day.name.toLowerCase())}.</p>`;
    h += '</div>';
  }
  h += '</div><div>' + vSteps(now) + '</div></div>';
  return h;
}
function nextTraining(now) {
  for (let i = 1; i <= 7; i++) { const d = addDays(now, i), p = planOf(d); if (isTrain(p)) return { d, day: D.program.days[p] }; }
  return null;
}

function vSteps(now) {
  const key = dk(now), goal = D.settings.stepsGoal, s = stepsOn(key), min = walkMinOn(key);
  let week = 0; const m = monday(now);
  for (let i = 0; i < 7; i++) week += stepsOn(dk(addDays(m, i)));
  const walkDay = planOf(now) === 'walk';
  return `<div class="card"><div class="card-h"><div><h2>Ходьба и шаги</h2>
      <div class="muted small">${walkDay ? 'Сегодня 45–60 мин' : 'По желанию 30–45 мин'}, темп разговора</div></div>
      ${min ? `<span class="tag acc">${min} мин</span>` : ''}</div>
    <div><span class="num big">${s.toLocaleString('ru-RU')}</span> <span class="muted">/ ${goal.toLocaleString('ru-RU')} шагов</span></div>
    <div class="bar"><i style="width:${Math.min(100, Math.round(s / goal * 100))}%"></i></div>
    <div class="stats"><div><div class="muted small">За неделю</div><div class="num">${steps(week)}</div></div>
      <div><div class="muted small">Цель недели</div><div class="num">${steps(goal * 7)}</div></div></div>
    <div class="row2"><button class="btn main" data-a="walk">Отметить</button><button class="btn" data-a="daysteps">Шаги за день</button></div>
    ${walksOn(key).length ? `<ul class="exl" style="margin:12px 0 0">${walksOn(key).map(w => `<li><div class="n"><b>${w.kind === 'day' ? 'Шаги за день' : `Ходьба ${w.min} мин`}</b>
      <span>${[w.steps ? w.steps.toLocaleString('ru-RU') + ' шагов' : '', w.km ? fmt(w.km) + ' км' : ''].filter(Boolean).join(' · ')}</span></div>
      <button class="ibtn" data-a="walkdel" data-id="${w.id}" aria-label="Удалить">×</button></li>`).join('')}</ul>` : ''}
  </div>`;
}

// ───── Программа ─────
function vProgram() {
  const P = D.program;
  let h = `<div class="top"><div><div class="muted">4 силовых в неделю</div><h1>Программа</h1></div></div>`;
  for (const id of Object.keys(P.days)) {
    const day = P.days[id], min = dayMinutes(day);
    const when = [1, 2, 3, 4, 5, 6, 0].filter(i => P.week[i] === id).map(i => WD[i]).join(', ') || 'не стоит в неделе';
    h += `<div class="card pday"><div class="card-h"><div><div class="muted small">${when}</div><h2>${esc(day.name)}</h2>
      <div class="meta"><span class="tag ${min > MAX_MIN ? 'warn' : ''}">≈ ${min} мин</span><span class="tag">${day.items.length} упр.</span></div></div></div>`;
    if (min > MAX_MIN) h += `<div class="warnbox">Выходит больше ${MAX_MIN} минут. Убери подход-другой или упражнение.</div>`;
    h += '<ul class="exl">';
    day.items.forEach((x, i) => {
      const e = EX[x.ex];
      h += `<li class="tap" data-a="edit" data-d="${id}" data-i="${i}"><div class="n"><b>${esc(e.name)}</b>
        <span>${repsLabel(x)} · отдых ${x.rest >= 120 ? fmt(x.rest / 60) + ' мин' : x.rest + ' с'}${x.pull ? ' · потом негативы' : ''}</span></div>
        <div class="w pick">›</div></li>`;
    });
    h += `</ul><button class="btn ghost" data-a="add" data-d="${id}">+ Упражнение</button></div>`;
  }
  h += `<div class="card"><h2 style="margin-bottom:8px">Дни недели</h2><ul class="sched">`;
  for (const i of [1, 2, 3, 4, 5, 6, 0]) {
    const opts = Object.keys(P.days).map(id => [id, P.days[id].name]).concat([['walk', 'Ходьба'], ['rest', 'Отдых']]);
    h += `<li><b>${WD[i]}</b><select class="inp" data-a="sched" data-wd="${i}">${opts.map(([v, t]) => `<option value="${v}"${P.week[i] === v ? ' selected' : ''}>${esc(t)}</option>`).join('')}</select></li>`;
  }
  h += `</ul></div><button class="btn ghost danger" data-a="progreset">Вернуть программу по умолчанию</button>`;
  return h;
}

function sheetEdit(dayId, i) {
  const x = D.program.days[dayId].items[i], e = EX[x.ex];
  const timed = e.type === 'time';
  const rests = [45, 60, 75, 90, 120, 150, 180];
  let h = `<h2>${esc(e.name)}</h2>
    <div class="field"><label>Подходы</label><div class="stepper"><button class="ibtn" data-a="ed-n" data-f="sets" data-v="-1">−</button>
      <input class="inp" id="f-sets" inputmode="numeric" value="${x.sets}"><button class="ibtn" data-a="ed-n" data-f="sets" data-v="1">+</button></div></div>
    <div class="row2"><div class="field"><label>${timed ? 'Секунд от' : 'Повторов от'}</label><input class="inp" id="f-lo" inputmode="numeric" value="${x.lo}"></div>
      <div class="field"><label>до</label><input class="inp" id="f-hi" inputmode="numeric" value="${x.hi}"></div></div>
    <div class="field"><label>Отдых между подходами</label><div class="chips">${rests.map(r => `<button class="chip${x.rest === r ? ' on' : ''}" data-a="ed-rest" data-v="${r}">${r >= 120 ? fmt(r / 60) + ' мин' : r + ' с'}</button>`).join('')}</div></div>`;
  if (e.type === 'w' || e.type === 'assist')
    h += `<div class="field"><label>Шаг ${e.type === 'assist' ? 'снижения помощи' : 'прибавки'}, кг${e.equip === 'dumbbell' ? ' (на гантель)' : ''}</label>
      <input class="inp" id="f-step" inputmode="decimal" value="${fmt(x.step != null ? x.step : e.step)}"></div>`;
  h += `<div class="field"><label>Заменить на</label><div class="chips">${replaceOptions(x.ex).map(id => `<button class="chip" data-a="ed-swap" data-ex="${id}">${esc(EX[id].name)}</button>`).join('')}</div></div>
    <button class="btn main" data-a="ed-save" data-d="${dayId}" data-i="${i}">Сохранить</button>
    <div class="row2" style="margin-top:8px"><button class="btn" data-a="ed-move" data-d="${dayId}" data-i="${i}" data-v="-1">↑ Выше</button>
      <button class="btn" data-a="ed-move" data-d="${dayId}" data-i="${i}" data-v="1">↓ Ниже</button></div>
    <button class="btn ghost danger" style="margin-top:8px" data-a="ed-del" data-d="${dayId}" data-i="${i}">Убрать из дня</button>`;
  edit = { dayId, i, rest: x.rest, ex: x.ex };
  openSheet(h);
}
let edit = null;
// Замены: сначала из справочника упражнения, потом остальные той же группы.
function replaceOptions(ex) {
  const e = EX[ex], out = e.subs.slice();
  for (const id in EX) if (id !== ex && !out.includes(id) && EX[id].group === e.group && id !== 'hang' && id !== 'neg') out.push(id);
  return out;
}

function sheetAdd(dayId) {
  let h = '<h2>Добавить упражнение</h2>';
  for (const g in GROUPS) {
    h += `<div class="sec">${GROUPS[g]}</div><ul class="exl ex-pick">`;
    for (const id in EX) if (EX[id].group === g && id !== 'neg')
      h += `<li data-a="add-ex" data-d="${dayId}" data-ex="${id}"><div class="n"><b>${esc(EX[id].name)}</b><span>${esc(EX[id].muscles)}</span></div><div class="w pick">+</div></li>`;
    h += '</ul>';
  }
  openSheet(h);
}

// ───── Техника упражнения ─────
function sheetTech(id) {
  const e = EX[id], src = n => `img/ex/${e.img}/${n}.jpg`;
  const subs = e.subs.map(s => `<button class="chip" data-a="tech" data-ex="${s}">${esc(EX[s].name)}</button>`).join('');
  openSheet(`<h2>${esc(e.name)}</h2>
    <div class="pics"><figure><img src="${src(0)}" alt="Старт" loading="lazy"><figcaption>Старт</figcaption></figure>
      <figure><img src="${src(1)}" alt="Финиш" loading="lazy"><figcaption>Финиш</figcaption></figure></div>
    ${e.photo ? `<p class="note" style="margin:0 0 8px">${esc(e.photo)}</p>` : ''}
    <div class="muted small">${esc(e.muscles)}</div>
    <div class="cue"><b>${esc(e.cue)}</b><span class="muted small">Темп: ${esc(e.tempo)}</span></div>
    <div class="sec">Техника</div><ol class="tech">${e.tech.map(t => `<li>${esc(t)}</li>`).join('')}</ol>
    <div class="sec">Дыхание</div><p style="margin:4px 0 0">${esc(e.breath)}</p>
    <div class="sec">Типичные ошибки</div><ul class="err">${e.errors.map(t => `<li>${esc(t)}</li>`).join('')}</ul>
    <div class="sec">Замены</div><div class="chips">${subs}</div>`);
}

// ───── Прогресс (этап 4) ─────
function vStats() {
  const n = D.workouts.filter(w => w.done).length;
  return `<div class="top"><div><div class="muted">графики, рекорды, путь к подтягиванию</div><h1>Прогресс</h1></div></div>
    <div class="card empty"><div class="num">${n}</div><div>тренировок записано</div>
    <p class="note">Графики появятся, когда будет что рисовать — после первых тренировок.</p></div>`;
}

// ───── Ещё ─────
function vMore() {
  const s = D.settings;
  return `<div class="top"><div><div class="muted">настройки и бэкап</div><h1>Ещё</h1></div></div>
    <div class="card"><h2 style="margin-bottom:12px">Настройки</h2>
      <div class="field"><label>Вес тела, кг</label><input class="inp" id="s-weight" inputmode="decimal" value="${s.weight != null ? fmt(s.weight) : ''}"></div>
      <div class="field"><label>Цель по шагам в день</label><input class="inp" id="s-goal" inputmode="numeric" value="${s.stepsGoal}"></div>
      <div class="field"><label>Плитка гравитрона, кг</label><input class="inp" id="s-plate" inputmode="decimal" value="${fmt(s.plate)}"></div>
      <button class="btn main" data-a="savesettings">Сохранить</button></div>
    <div class="card"><h2 style="margin-bottom:6px">Бэкап</h2>
      <p class="muted small" style="margin:0 0 12px">Все данные в одном файле JSON. Сохрани его в Google Диск или Telegram — и сможешь восстановить на любом телефоне.</p>
      <div class="row2"><button class="btn" data-a="export">Скачать бэкап</button><button class="btn" data-a="import">Загрузить</button></div>
      <input type="file" id="importfile" accept="application/json,.json" hidden></div>
    <p class="muted small" style="text-align:center">Тренер ${APP_VERSION} · фото упражнений — free-exercise-db (public domain)</p>`;
}

// ───── Нижний лист ─────
// Кнопка «Назад» на Android закрывает лист: при открытии кладём запись в историю.
// Окно, открытое без нажатия (приветствие), в историю не кладём — Chrome такую запись пропускает.
let sheetOpen = false, sheetPushed = false;
function openSheet(html) {
  $('#sheet').innerHTML = `<div class="sheet-bg" data-a="sheetbg"><div class="sheet" role="dialog"><div class="grip"></div>${html}</div></div>`;
  $('#sheet .sheet').scrollTop = 0;
  if (!sheetOpen && navigator.userActivation && navigator.userActivation.isActive) { history.pushState({ sheet: 1 }, ''); sheetPushed = true; }
  sheetOpen = true;
}
function hideSheet() { sheetOpen = false; $('#sheet').innerHTML = ''; edit = null; }
function closeSheet() { if (sheetPushed) { sheetPushed = false; history.back(); } hideSheet(); }
addEventListener('popstate', () => { if (sheetPushed) { sheetPushed = false; hideSheet(); } });

let toastT = 0;
function toast(t) {
  let el = $('.toast'); if (!el) { el = document.createElement('div'); el.className = 'toast'; document.body.appendChild(el); }
  el.textContent = t; clearTimeout(toastT); toastT = setTimeout(() => el.remove(), 2600);
}

// ───── Формы ─────
function sheetWalk() {
  openSheet(`<h2>Ходьба</h2>
    <div class="field"><label>Сколько минут</label><div class="chips" id="w-chips">${[30, 45, 60, 75].map(m => `<button class="chip" data-a="w-min" data-v="${m}">${m}</button>`).join('')}</div>
      <input class="inp" id="w-min" inputmode="numeric" placeholder="или впиши" style="margin-top:8px"></div>
    <div class="row2"><div class="field"><label>Шаги (по желанию)</label><input class="inp" id="w-steps" inputmode="numeric"></div>
      <div class="field"><label>Км (по желанию)</label><input class="inp" id="w-km" inputmode="decimal"></div></div>
    <button class="btn main" data-a="w-save">Сохранить</button>`);
}
function sheetDaySteps() {
  const cur = walksOn(dk(new Date())).find(w => w.kind === 'day');
  openSheet(`<h2>Шаги за день</h2><p class="muted small" style="margin:-4px 0 12px">Итог с шагомера телефона. Заменяет шаги из отметок ходьбы за сегодня.</p>
    <div class="field"><input class="inp" id="d-steps" inputmode="numeric" value="${cur ? cur.steps : ''}" placeholder="например, 9500"></div>
    <button class="btn main" data-a="d-save">Сохранить</button>`);
}
function sheetWelcome() {
  openSheet(`<h2>Привет, Андрей!</h2>
    <p class="muted" style="margin:0 0 14px">Один вопрос перед стартом: вес тела нужен для пути к подтягиванию — когда помощь в гравитроне станет меньше 30% веса, вис сменится негативами.</p>
    <div class="field"><label>Вес тела, кг</label><input class="inp" id="s-weight" inputmode="decimal" placeholder="82,5"></div>
    <div class="field"><label>Цель по шагам в день</label><input class="inp" id="s-goal" inputmode="numeric" value="${D.settings.stepsGoal}"></div>
    <button class="btn main" data-a="welcome">Готово</button>`);
}

// ───── Клики ─────
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
async function saveProgram() { await saveKV('program'); }

document.addEventListener('click', async ev => {
  const el = ev.target.closest('[data-a]'); if (!el) return;
  const a = el.dataset.a, ds = el.dataset;
  if (a === 'sheetbg') { if (ev.target === el) closeSheet(); return; }
  if (a === 'sched') return;
  switch (a) {
    case 'tab': tab = ds.k; render(); scrollTo(0, 0); break;
    case 'tech': sheetTech(ds.ex); break;
    case 'start': toast('Экран тренировки — следующий этап'); break;
    case 'walk': sheetWalk(); break;
    case 'daysteps': sheetDaySteps(); break;
    case 'w-min': $('#w-min').value = ds.v; document.querySelectorAll('#w-chips .chip').forEach(c => c.classList.toggle('on', c === el)); break;
    case 'w-save': {
      const min = num($('#w-min').value), st = num($('#w-steps').value), km = num($('#w-km').value);
      if (!min) { toast('Впиши минуты'); return; }
      const w = { id: uid(), date: dk(new Date()), kind: 'walk', min: Math.round(min), steps: st ? Math.round(st) : 0, km: km || 0 };
      D.walks.push(w); await dbPut('walks', w); closeSheet(); render(); toast('Ходьба записана'); break;
    }
    case 'd-save': {
      const st = num($('#d-steps').value), key = dk(new Date());
      const old = walksOn(key).find(w => w.kind === 'day');
      if (old) { D.walks = D.walks.filter(w => w !== old); await dbDel('walks', old.id); }
      if (st) { const w = { id: uid(), date: key, kind: 'day', min: 0, steps: Math.round(st), km: 0 }; D.walks.push(w); await dbPut('walks', w); }
      closeSheet(); render(); break;
    }
    case 'walkdel': D.walks = D.walks.filter(w => w.id !== ds.id); await dbDel('walks', ds.id); render(); break;

    case 'edit': sheetEdit(ds.d, +ds.i); break;
    case 'ed-n': { const f = $('#f-' + ds.f); f.value = Math.max(1, Math.min(8, (num(f.value) || 0) + +ds.v)); break; }
    case 'ed-rest': edit.rest = +ds.v; document.querySelectorAll('[data-a="ed-rest"]').forEach(c => c.classList.toggle('on', c === el)); break;
    case 'ed-swap': {
      const x = D.program.days[edit.dayId].items[edit.i], ne = EX[ds.ex];
      x.ex = ds.ex; delete x.step; delete x.pull;
      if (ne.type === 'time' && EX[edit.ex].type !== 'time') { x.lo = 30; x.hi = 45; }
      if (ne.type !== 'time' && EX[edit.ex].type === 'time') { x.lo = 10; x.hi = 15; }
      await saveProgram(); sheetEdit(edit.dayId, edit.i); render(); toast('Заменил на «' + ne.name + '»'); break;
    }
    case 'ed-save': {
      const x = D.program.days[ds.d].items[+ds.i];
      const sets = num($('#f-sets').value), lo = num($('#f-lo').value), hi = num($('#f-hi').value);
      if (!sets || !lo || !hi || lo > hi) { toast('Проверь подходы и диапазон'); return; }
      Object.assign(x, { sets: Math.round(sets), lo: Math.round(lo), hi: Math.round(hi), rest: edit.rest });
      const st = $('#f-step'); if (st) { const v = num(st.value); if (v && v !== EX[x.ex].step) x.step = v; else delete x.step; }
      await saveProgram(); closeSheet(); render();
      const min = dayMinutes(D.program.days[ds.d]);
      toast(min > MAX_MIN ? `Сохранил, но день выходит ≈ ${min} мин — больше ${MAX_MIN}` : 'Сохранил');
      break;
    }
    case 'ed-move': {
      const arr = D.program.days[ds.d].items, i = +ds.i, j = i + +ds.v;
      if (j < 0 || j >= arr.length) return;
      [arr[i], arr[j]] = [arr[j], arr[i]]; await saveProgram(); closeSheet(); render(); break;
    }
    case 'ed-del': {
      if (!confirm('Убрать упражнение из этого дня?')) return;
      D.program.days[ds.d].items.splice(+ds.i, 1); await saveProgram(); closeSheet(); render(); break;
    }
    case 'add': sheetAdd(ds.d); break;
    case 'add-ex': {
      const e = EX[ds.ex], day = D.program.days[ds.d];
      day.items.push(e.type === 'time' ? { ex: ds.ex, sets: 2, lo: 30, hi: 45, rest: 45 } : { ex: ds.ex, sets: 3, lo: e.base ? 8 : 10, hi: e.base ? 12 : 15, rest: e.base ? REST_BASE : REST_ISO });
      await saveProgram(); closeSheet(); render();
      const min = dayMinutes(day);
      toast(min > MAX_MIN ? `Добавил. День ≈ ${min} мин — больше ${MAX_MIN}` : 'Добавил'); break;
    }
    case 'progreset':
      if (!confirm('Вернуть программу по умолчанию? Твои правки программы пропадут, история тренировок останется.')) return;
      D.program = defaultProgram(); await saveProgram(); render(); toast('Программа по умолчанию'); break;

    case 'welcome': case 'savesettings': {
      const w = num($('#s-weight').value), g = num($('#s-goal').value), pl = $('#s-plate') ? num($('#s-plate').value) : D.settings.plate;
      if (!w || w < 35 || w > 250) { toast('Впиши вес тела в кг'); return; }
      Object.assign(D.settings, { weight: w, stepsGoal: g && g >= 1000 ? Math.round(g) : D.settings.stepsGoal, plate: pl || D.settings.plate });
      if (!D.settings.start) D.settings.start = dk(monday(new Date()));
      await saveKV('settings');
      if (a === 'welcome') closeSheet();
      render(); toast('Сохранил'); break;
    }
    case 'export': {
      const data = await dbExport();
      const url = URL.createObjectURL(new Blob([JSON.stringify(data)], { type: 'application/json' }));
      const l = document.createElement('a'); l.href = url; l.download = `trener-${dk(new Date())}.json`; l.click();
      setTimeout(() => URL.revokeObjectURL(url), 5000); break;
    }
    case 'import': $('#importfile').click(); break;
  }
});
document.addEventListener('change', async ev => {
  const el = ev.target;
  if (el.dataset.a === 'sched') { D.program.week[el.dataset.wd] = el.value; await saveProgram(); render(); }
  if (el.id === 'importfile' && el.files[0]) {
    try {
      const o = JSON.parse(await el.files[0].text());
      if (!confirm('Заменить все данные на этом телефоне данными из файла?')) return;
      await dbImport(o); render(); toast('Данные восстановлены');
    } catch (e) { toast(e.message || 'Не получилось прочитать файл'); }
  }
});

// ───── Запуск ─────
(async () => {
  try { await dbLoad(); }
  catch (e) { $('#app').innerHTML = `<div class="card">Не открылась база данных: ${esc(e.message)}</div>`; return; }
  render();
  if (D.settings.weight == null) sheetWelcome();
})();
