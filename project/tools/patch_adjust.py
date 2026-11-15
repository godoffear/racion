# -*- coding: utf-8 -*-
"""6.6: после записи съеденного — предложение подогнать остальные приёмы дня (общий решатель fSolve)."""
import pathlib, sys
root = pathlib.Path(__file__).resolve().parent.parent
p = root/'src/app.js'; s = p.read_text(encoding='utf-8')
a = s.index("  const tot=()=>{const t=Object.assign({},T);R.forEach")
b = s.index("  return {R,t,adj}}", a) + len("  return {R,t,adj}}")
core = s[a:b]
s = s[:a] + "  return fSolve(T,R)}\n// общий решатель: T — уже съеденное за день, R — открытые приёмы; правит граммы, чтобы день уложился в норму\nfunction fSolve(T,R){\n" + core + s[b:]
# fPlan теперь вызывает fSolve; fSolve определён сразу после неё
assert "function fSolve(T,R){" in s
s = s.replace("+mfHtml()+wizHtml();", "+mfHtml()+wizHtml()+adjHtml();", 1)
p.write_text(s, encoding='utf-8')

q = root/'src/ai.js'; t = q.read_text(encoding='utf-8')
old = "if(!L.length)delete S.extra[day];xOpen='';eatReset();cleanOld();save();toast('Записано: '+n)},"
assert old in t
t = t.replace(old, "if(!L.length)delete S.extra[day];xOpen='';eatReset();cleanOld();save();toast('Записано: '+n);adjOffer(day)},")
t += r'''
/* =====================  подгонка остальных приёмов дня после записи  ===================== */
let ADJ=null;
function adjOffer(day){try{
  const ms=dayPlan(pkey(day)).meals,today=day===dkey(appNow()),now=new Date(),nm=now.getHours()*60+now.getMinutes(),mn=nm<240?nm+1440:nm,T={k:0,p:0,f:0,c:0},add=x=>['k','p','f','c'].forEach(a=>T[a]+=x[a]||0);
  ms.filter(m=>S.done[dk_(day,m.slot)]).forEach(m=>add(macros(m.items)));((S.extra||{})[day]||[]).forEach(add);
  const R=ms.filter(m=>fOpen(day,m)&&(!today||tmin(m.time)>=mn-60)).map(m=>({slot:m.slot,items:m.items.map(i=>({p:i.p,q:i.q})),base:m.items.map(i=>({p:i.p,q:i.q}))}));
  if(!R.length){ADJ=null;return}
  const t0=Object.assign({},T);R.forEach(r=>{const x=macros(r.base);['k','p','f','c'].forEach(a=>t0[a]+=x[a])});
  const pl=fSolve(T,R);pl.t0=t0;pl.day=day;
  ADJ=pl.adj.length?pl:null}catch(_){ADJ=null}}
function adjHtml(){if(!ADJ||tab!=='today')return '';const pl=ADJ,t=pl.t,t0=pl.t0,ok=(v,a,b)=>v>=a&&v<=b,sg=v=>(v>0?'+':'−')+r0(Math.abs(v));
  const rows=pl.adj.map(a=>{const u=PR[a.p].u==='шт'?'шт':'г',tx=a.from===0?'+ '+a.to+' '+u:a.to===0?a.from+' → 0 '+u:a.from+' → '+a.to+' '+u;
    return `<li><span class="grow"><b>${SLOTS[a.slot]}</b> · ${esc(cap(PR[a.p].s))}<small class="im">${sg(a.m.k)} ккал${Math.abs(a.m.p)>=2?' · Б '+sg(a.m.p):''}${Math.abs(a.m.c)>=3?' · У '+sg(a.m.c):''}${Math.abs(a.m.f)>=3?' · Ж '+sg(a.m.f):''}</small></span><b>${tx}</b></li>`}).join('');
  const cell=(v,l,rg,good)=>`<div class="nt"><b class="${good?'':'over'}">${r0(v)}</b><div class="nl">${l}</div><div class="nn">${rg}</div></div>`,bad=!ok(t.k,1880,2010)||t.c>150||t.p<185;
  return `<div class="shbg" data-a="adjno"></div><section class="shp adjs" role="dialog" aria-label="Подогнать день"><div class="bh"><h3>Подогнать остальной день?</h3><button class="xcl" data-a="adjno" aria-label="Закрыть">✕</button></div>
  <div class="small">С учётом записанного день выходил бы на <b>${r0(t0.k)} ккал</b>${t0.k>2010?' — это больше нормы':''}. Предлагаю поправить:</div>
  <ul class="il">${rows}</ul>
  <div class="eh" style="margin-top:10px">День после подгонки<span>прогноз</span></div><div class="ng">${cell(t.k,'ккал','1900–2000',ok(t.k,1880,2010))}${cell(t.p,'белки, г','190–205',t.p>=185)}${cell(t.f,'жиры, г','55–60',t.f<=64)}${cell(t.c,'углев., г','120–145',t.c<=150)}</div>
  ${bad?'<div class="small flag" style="margin-top:6px">Полностью уложить день не получается — часть приёмов уже съедена. Можно применить как есть.</div>':''}
  <div class="btns" style="margin-top:10px"><button class="btn pri" data-a="adjapply">Подогнать</button><button class="btn ghost" data-a="adjno">Оставить как есть</button></div></section>`}
Object.assign(A,{
  adjno:()=>{ADJ=null},
  adjapply:()=>{const pl=ADJ;if(!pl)return true;const day=pl.day;let n=0;
    pl.R.forEach(r=>{if(r.items.some((i,k)=>!r.base[k]||i.q!==r.base[k].q)||r.items.length!==r.base.length){S.edits=S.edits||{};S.edits[dk_(day,r.slot)]=r.items.filter(i=>i.q>0).map(i=>[i.p,i.q]);n++}});
    ADJ=null;cleanOld();save();toast(n?'Подогнал приёмов: '+n:'Менять нечего')}
});
// ручной ввод («База») тоже предлагает подгонку, если запись добавилась
const _xsave=A.xsave;A.xsave=function(){const day=viewDate,n0=((S.extra||{})[day]||[]).length,r=_xsave.apply(this,arguments);if(((S.extra||{})[day]||[]).length>n0)adjOffer(day);return r};
'''
q.write_text(t, encoding='utf-8')
h = root/'src/head.html'; x = h.read_text(encoding='utf-8')
x = x.replace('.shl .dd{', '.adjs{max-height:90vh;overflow:auto}.shl .dd{', 1); h.write_text(x, encoding='utf-8')
print('ok')
