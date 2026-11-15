/* ===== 8.7: «Заготовки» с учётом готовых пакетов =====
   В «Что дома» можно продиктовать: «РАСФАСОВАНО: курица 6 по 200 г, 2 по 150 г; свинина 3 по 200 г» — это пакеты из морозилки.
   Готовые пакеты неделимы: приложение раскладывает их по приёмам меню (один пакет на блюдо, два пакета вместе, пакет + свежая добавка,
   один раз разморозить и разделить большой пакет). Остальное — «расфасовать из купленного» по приёмам, без усреднения размеров. */
const bagsOf=ck=>(S.bags||{})[ck]||{};
const bagList=(ck,id)=>{const o=[];(bagsOf(ck)[id]||[]).forEach(b=>{for(let k=0;k<b.n;k++)o.push(b.q)});return o.sort((a,b)=>a-b)};
const bagTotal=(ck,id)=>(bagsOf(ck)[id]||[]).reduce((a,b)=>a+b.q*b.n,0);
function parseBags(text){const bags={},bad=[];
  const t=String(text||'').toLowerCase().replace(/ё/g,'е').replace(/(\d),(\d)/g,'$1.$2').replace(/^[\s:–-]+/,'');
  if(/^\s*(нет|ничего|пусто|ноль)\s*$/.test(t))return {bags,bad};
  let cur=null;
  t.split(/[;\n]/).forEach(seg=>{seg.split(',').forEach(piece=>{const ch=piece.trim();if(!ch)return;
    const hit=customHit(ch)||HOME_WORDS.find(([,re])=>re.test(ch));
    if(hit){cur=hit[0]}
    if(!cur){bad.push(ch);return}
    const add=(q,n)=>{if(!(q>=20&&n>=1))return;const A=bags[cur]=bags[cur]||[],e=A.find(b=>b.q===q);if(e)e.n+=n;else A.push({q,n})};
    let rest=ch,found=false;
    rest=rest.replace(/(\d+)\s*(?:пакет[а-я]*|шт[а-я]*|порц[а-я]*|штук[а-я]*)?\s*по\s*(\d+(?:\.\d+)?)\s*(кг|кило[а-я]*|г[а-я]*)?/g,(m,n,q,u)=>{found=true;add(Math.round(+q*(/кг|кило/.test(u||'')||+q<5?1000:1)),+n);return ' '});
    rest=rest.replace(/(\d+(?:\.\d+)?)\s*(кг|кило[а-я]*|гр[а-я]*|г(?![а-я]))/g,(m,q,u)=>{found=true;add(Math.round(+q*(/кг|кило/.test(u)?1000:1)),1);return ' '});
    rest.replace(/(^|[^\d.])(\d{2,4})(?![\d.])/g,(m,pre,q)=>{if(+q>=20){found=true;add(+q,1)}return m}); // голые числа — граммы: «курица 180, 173, 160»
    if(!found&&hit)bad.push(ch+' — сколько грамм?')})});
  Object.keys(bags).forEach(id=>bags[id].sort((a,b)=>a.q-b.q));
  return {bags,bad}}
const bagText=A=>A.map(b=>b.n>1?b.n+'×'+b.q+' г':b.q+' г').join(', ');
// какие продукты фасуем: мясо, рыба, фарш и т.п.; овощи и фрукты из лавки — нет
const PLANID=id=>{const p=PR[id];return !!(p&&p.u==='г'&&!p.keep&&!p.daily&&placeOf(id)!=='near'&&(BAGID(id)||PACKV.includes(id)))};
function prepPlan(cs){const ck=dkey(cs),needs={};
  for(let i=0;i<7;i++){const d=addDays(cs,i);dayPlan(d).meals.slice().sort((a,b)=>tmin(a.time)-tmin(b.time)).forEach(m=>m.items.forEach(it=>{if(PLANID(it.p))(needs[it.p]=needs[it.p]||[]).push({id:it.p,i,d,slot:m.slot,q:it.q,fz:i>=2})}))}
  const products=[];
  Object.keys(needs).forEach(id=>{
    const bags=bagList(ck,id).map(q=>({q,th:false,until:99})),rows=[];const take=b=>bags.splice(bags.indexOf(b),1);
    needs[id].forEach(n=>{const q=n.q,av=bags.filter(b=>n.i<=b.until);let r=null;
      // 1) один пакет подходит (±15%)
      let best=null;av.forEach(b=>{const x=Math.abs(b.q-q)/q;if(x<=0.15&&(!best||x<best.x))best={b,x}});
      if(best){take(best.b);rows.push(Object.assign({},n,{src:'bag',b:best.b.q,th:best.b.th}));return}
      // 2) два пакета вместе
      for(let a=0;a<av.length&&!r;a++)for(let c=a+1;c<av.length;c++){const s=av[a].q+av[c].q;if(Math.abs(s-q)/q<=0.15){r={a:av[a],c:av[c],s};break}}
      if(r){take(r.a);take(r.c);rows.push(Object.assign({},n,{src:'bag2',b:r.a.q,b2:r.c.q}));return}
      // 3) пакет меньше порции + свежая добавка
      const sm=av.filter(b=>b.q<q*0.85&&b.q>=q*0.4).sort((a,b)=>b.q-a.q)[0];
      if(sm&&q-sm.q>=30){take(sm);rows.push(Object.assign({},n,{src:'top',b:sm.q,add:Math.round((q-sm.q)/10)*10}));return}
      // 4) большой пакет: один раз разморозить и разделить
      const bg=av.filter(b=>!b.th&&b.q>=q*1.5&&b.q-q>=60).sort((a,b)=>a.q-b.q)[0];
      if(bg){take(bg);const rest=bg.q-q;rows.push(Object.assign({},n,{src:'split',b:bg.q,rest}));bags.push({q:rest,th:true,until:n.i+2});return}
      // 5) свежая порция
      rows.push(Object.assign({},n,{src:'fresh'}))});
    products.push({id,rows,left:bags.filter(b=>!b.th).map(b=>b.q),thawLeft:bags.filter(b=>b.th).map(b=>b.q),tot:needs[id].reduce((a,n)=>a+n.q,0)})});
  const ord=Object.keys(PR);products.sort((a,b)=>(BAGID(b.id)-BAGID(a.id))||ord.indexOf(a.id)-ord.indexOf(b.id));
  // готовые пакеты, которых в меню нет совсем
  const spare=[];Object.keys(bagsOf(ck)).forEach(id=>{if(!products.some(p=>p.id===id)&&(bagsOf(ck)[id]||[]).length)spare.push({id,bags:bagsOf(ck)[id]})});
  return {ck,products,spare,rows:products.flatMap(p=>p.rows)}}
const pfKey=r=>`pf|${r.id}|${r.i}|${r.slot}`;
function rowText(r){const nm=DAYS[wd(r.d)]+' '+r.d.getDate()+' · '+SLOTS[r.slot].toLowerCase(),w=r.fz?'<span class="tg fz">мороз.</span>':'<span class="tg fr">холод.</span>';
  if(r.src==='bag')return {l:nm,t:`пакет <b>${r.b} г</b>${Math.abs(r.b-r.q)>=10?` <small class="muted">(в меню ${r.q} г)</small>`:''}${r.th?' <small class="muted">(размороженный)</small>':''}`,todo:false};
  if(r.src==='bag2')return {l:nm,t:`два пакета <b>${r.b} + ${r.b2} г</b> <small class="muted">(в меню ${r.q} г)</small>`,todo:false};
  if(r.src==='top')return {l:nm,t:`пакет <b>${r.b} г</b> + свежего <b>${r.add} г</b> ${w}`,todo:true};
  if(r.src==='split')return {l:nm,t:`разморозить пакет ${r.b} г: взять <b>${r.q} г</b>, остаток ${r.rest} г — в холодильник, съесть в ближайшие 2 дня`,todo:true};
  return {l:nm,t:`расфасовать <b>${r.q} г</b> ${w}`,todo:true}}
function planCard(M,ck){const P=M.plan;if(!P||(!P.products.length&&!P.spare.length))return '';const D=prepDone(ck);
  const todo=P.rows.filter(r=>rowText(r).todo),done=todo.filter(r=>D[pfKey(r)]).length,ready=P.rows.filter(r=>!rowText(r).todo).length;
  let h=`<section class="card plan"><div class="bh"><h3>Фасовка на неделю</h3><span class="small muted">${done} из ${todo.length}</span></div><div class="prog"><i style="width:${todo.length?done/todo.length*100:100}%"></i></div>
  <div class="small muted" style="margin:4px 0 8px">Готовых пакетов в деле: ${ready}. Фасовать из купленного: ${todo.length}. Готовые пакеты не трогаем, они расписаны по дням. Если купили или расфасовали иначе, продиктуйте «РАСФАСОВАНО: …» в «Покупки → Что дома».</div>`;
  P.products.forEach(p=>{const nT=p.rows.filter(r=>rowText(r).todo).length,nB=p.rows.length-nT;
    h+=`<div class="ph">${esc(cap(PR[p.id].s))}${p.id==='thigh'?' <small class="muted">(снять кожу)</small>':''} <small class="muted">по меню ≈ ${esc(fq(p.tot,'г'))} · готово ${nB} · фасовать ${nT}</small></div><table class="bags plr">`;
    p.rows.forEach(r=>{const x=rowText(r),k=pfKey(r),on=!!D[k];
      h+=`<tr class="${x.todo?'':'ready'} ${on?'dn':''}"><td><b>${x.l}</b></td><td>${x.t}</td><td class="pfc">${x.todo?`<button class="pkb ${on?'on':''}" data-a="pfdone" data-d="${ck}" data-k="${esc(k)}" aria-pressed="${on}" aria-label="Готово: ${esc(x.l)}">${on?'✓':''}</button>`:'<span class="tg ok">готов</span>'}</td></tr>`});
    h+=`</table>`;
    if(p.left.length||p.thawLeft.length)h+=`<div class="small muted">В запас (в меню на эту неделю не нужны): ${esc(bagText(p.left.reduce((A,q)=>{const e=A.find(b=>b.q===q);if(e)e.n++;else A.push({q,n:1});return A},[])))}${p.thawLeft.length?' · размороженный остаток '+p.thawLeft.join(', ')+' г — использовать в ближайшие дни':''}</div>`});
  P.spare.forEach(s=>{h+=`<div class="small muted" style="margin-top:8px">${esc(cap(PR[s.id].s))}: ${esc(bagText(s.bags))} — в меню этой недели не используется, лежит в запасе</div>`});
  return h+`</section>`}
Object.assign(A,{
  pfdone:d=>{const D=(S.prepDone=S.prepDone||{})[d.d]=(S.prepDone[d.d]||{});if(D[d.k])delete D[d.k];else{D[d.k]=1;buzz()}save()}
});
