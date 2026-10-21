/* Product sheet: size, milk, sugar, sweetness slider, ice, extra flavour, extra shot, warmed/normal. */
'use strict';

const FLAVOURS = [['Vanilla',0.40],['Caramel',0.40],['Hazelnut',0.40],['Cardamom',0.40],['Cinnamon',0.40],['Saffron',0.75]];
const SIZES = [['Regular','8 oz',0,'237 ml'],['Medium','12 oz',0.50,'355 ml'],['Large','16 oz',1.00,'473 ml']];
const MILKS = [['Whole',0],['Camel Milk',0.50],['Oat',0.60],['Almond',0.60]];
const SWEET = ['Normal','Medium','Too Sweet'];
const kindOf = p => DRINK_SUBS.includes(p.sub) ? (p.sub === 'bottled' ? 'bottle' : 'drink') : p.sub;
const hasShot = p => ['hotcoffee','icedcoffee','frappes','matcha'].includes(p.sub);
const isIced = p => p.art.startsWith('iced');
function defaultSel(p){
  return { pid:p.id, qty:1, size:'Regular', sugar:'Sugar', sweet:0, flav:{}, shots:0, milk:'Whole', ice:'Regular ice', warm:p.sub==='cakes'?'Normal':'Warmed', serve:'Slice', cheese:0, temp:'Chilled', note:'' };
}
function unitPrice(p, s){
  let u = p.price;
  const k = kindOf(p);
  if (k === 'drink'){
    u += SIZES.find(z => z[0] === s.size)[2];
    for (const [f, n] of Object.entries(s.flav)) u += (FLAVOURS.find(x => x[0] === f) || [0,0.4])[1] * n;
    u += s.shots * 0.75;
    if (p.m) u += (MILKS.find(m => m[0] === s.milk) || [0,0])[1];
  }
  if (k === 'cakes' && s.serve === 'Whole cake') u = p.price * 7;
  if (k === 'sandwiches') u += s.cheese * 0.50;
  return Math.round(u * 100) / 100;
}
function optLabel(p, s){
  const k = kindOf(p), a = [];
  if (k === 'drink'){
    a.push(s.size);
    if (p.m && s.milk !== 'Whole') a.push(s.milk);
    a.push(s.sugar); if (s.sugar !== 'No Sugar') a.push(SWEET[s.sweet] + ' sweet');
    if (isIced(p) && s.ice !== 'Regular ice') a.push(s.ice);
    for (const [f, n] of Object.entries(s.flav)) if (n) a.push(`+${n} ${f}`);
    if (s.shots) a.push(`+${s.shots} shot${s.shots>1?'s':''}`);
  } else if (k === 'bottle') a.push(s.temp);
  else {
    if (k === 'cakes') a.push(s.serve);
    a.push(s.warm);
    if (k === 'sandwiches' && s.cheese) a.push('+ extra cheese');
  }
  if (s.note) a.push('“' + s.note + '”');
  return a.join(' · ');
}
const segBtns = (opt, list, cur) => `<div class="seg">${list.map(v => { const [val, sm] = Array.isArray(v) ? v : [v]; return `<button data-act="pdOpt" data-opt="${opt}" data-val="${esc(val)}" class="${cur===val?'on':''}">${val}${sm ? `<small>${sm}</small>` : ''}</button>`; }).join('')}</div>`;
const stepper = (key, v, min = 0) => `<div class="stepper"><button data-act="pdStep" data-key="${key}" data-d="-1" class="${v<=min?'dis':''}" aria-label="Reduce">${I.minus}</button><span class="v" data-num="${key}">${v}</span><button data-act="pdStep" data-key="${key}" data-d="1" aria-label="Add">${I.plus}</button></div>`;
let PD = null;
function openProduct(pid, editIdx = null){
  const p = PBY[pid]; if (!p) return;
  PD = editIdx != null ? JSON.parse(JSON.stringify(S.cart[editIdx].sel)) : defaultSel(p);
  const k = kindOf(p), fav = S.favs.includes(pid);
  let opts = '';
  if (k === 'drink'){
    const cupC = p.art.startsWith('hot:') ? p.art.split(':')[1] : 'green';
    opts += `<div class="opt"><div class="opt-hd"><h4>Size</h4><span>Regular · Medium · Large</span></div><div class="seg seg-size">${SIZES.map((z, i) => { const h = [48, 62, 78][i]; return `<button data-act="pdOpt" data-opt="size" data-val="${z[0]}" class="${PD.size===z[0]?'on':''}"><span class="cupi" style="width:${h}px;height:${h}px;display:block">${artHot(cupC)}</span>${z[0]}<small>${z[1]} (${z[3]})</small><small>${z[2] ? '+' + money(z[2]) : 'Included'}</small></button>`; }).join('')}</div></div>`;
    if (p.m) opts += `<div class="opt"><div class="opt-hd"><h4>Milk</h4></div>${segBtns('milk', MILKS.map(m => [m[0], m[1] ? '+' + money(m[1]) : 'Included']), PD.milk)}</div>`;
    opts += `<div class="opt"><div class="opt-hd"><h4>Sugar</h4></div>${segBtns('sugar', ['Sugar','Diet Sugar','No Sugar'], PD.sugar)}</div>`;
    opts += `<div class="opt"><div class="opt-hd"><h4>Sweetness</h4><span>Slide to choose</span></div><div class="sweet ${PD.sugar==='No Sugar'?'off':''}" id="sweetBox"><div class="now">Sweetness: <span id="sweetNow">${SWEET[PD.sweet]}</span></div><input type="range" id="sweet" min="0" max="2" step="1" value="${PD.sweet}" ${PD.sugar==='No Sugar'?'disabled':''} aria-label="Sweetness"><div class="sl"><span>Normal</span><span>Medium</span><span>Too Sweet</span></div></div></div>`;
    if (isIced(p)) opts += `<div class="opt"><div class="opt-hd"><h4>Ice</h4></div>${segBtns('ice', ['Light ice','Regular ice','Extra ice'], PD.ice)}</div>`;
    opts += `<div class="opt"><div class="opt-hd"><h4>Extra flavour</h4><span>Pumps</span></div>${FLAVOURS.map(([f, c]) => `<div class="steprow"><div><b>${f}</b><small>+${money(c)} per pump</small></div>${stepper('flav:' + f, PD.flav[f] || 0)}</div>`).join('')}</div>`;
    if (hasShot(p)) opts += `<div class="opt"><div class="opt-hd"><h4>Extra coffee shot</h4></div><div class="steprow"><div><b>Espresso shot</b><small>+${money(0.75)} each</small></div>${stepper('shots', PD.shots)}</div></div>`;
  } else if (k === 'bottle'){
    opts += `<div class="opt"><div class="opt-hd"><h4>Serve</h4></div>${segBtns('temp', ['Chilled','Room temperature'], PD.temp)}</div>`;
  } else {
    if (k === 'cakes') opts += `<div class="opt"><div class="opt-hd"><h4>Portion</h4></div>${segBtns('serve', [['Slice', money(p.price)], ['Whole cake', '8 slices · ' + money(p.price*7)]], PD.serve)}</div>`;
    opts += `<div class="opt"><div class="opt-hd"><h4>How would you like it?</h4></div>${segBtns('warm', ['Warmed','Normal'], PD.warm)}</div>`;
    if (k === 'sandwiches') opts += `<div class="opt"><div class="opt-hd"><h4>Extras</h4></div><div class="steprow"><div><b>Extra cheese</b><small>+${money(0.50)}</small></div>${stepper('cheese', PD.cheese)}</div></div>`;
  }
  opts += `<div class="opt"><div class="opt-hd"><h4>Special instructions</h4><span>Optional</span></div><textarea class="ta" id="pdNote" placeholder="e.g. Extra hot, no foam">${esc(PD.note)}</textarea></div>`;
  const body = `<div class="pd-art">${art(p.art)}<button class="pd-fav" data-act="fav" data-id="${p.id}" aria-label="Favourite">${fav ? I.heartF : I.heart}</button></div>
    <div class="pd-title"><h2>${esc(p.name)}</h2><span class="p num">${money(p.price)}</span></div>
    <p class="pd-desc">${esc(p.desc)}</p>
    <div class="pd-meta"><span class="pill pill-grey">${SUBNAME[p.sub]}</span><span class="pill pill-grey">${p.kcal} kcal</span>${p.n?'<span class="pill pill-gold">NEW</span>':''}${p.sig?'<span class="pill pill-green">SIGNATURE</span>':''}<span class="pill pill-gold">Earn ${Math.floor(p.price*EARN_PER_USD)}★+</span></div>${opts}`;
  const foot = `<div class="pd-ft"><div class="stepper">${`<button data-act="pdStep" data-key="qty" data-d="-1" class="${PD.qty<=1?'dis':''}" aria-label="Fewer">${I.minus}</button><span class="v" data-num="qty">${PD.qty}</span><button data-act="pdStep" data-key="qty" data-d="1" aria-label="More">${I.plus}</button>`}</div>
    ${p.available === false ? '<button class="btn btn-green" disabled>Sold out today</button>' : `<button class="btn btn-green" data-act="pdAdd" data-edit="${editIdx == null ? '' : editIdx}">${editIdx == null ? 'Add to Order' : 'Update'} · <span class="js-pd-price num">${money(unitPrice(p, PD) * PD.qty)}</span></button>`}</div>`;
  const el = sheet('', body, foot, { noHead:true });
  el.querySelector('.sheet').insertAdjacentHTML('afterbegin', `<button class="x-btn" data-act="closeTop" aria-label="Close" style="position:absolute;top:14px;right:max(16px,env(safe-area-inset-right,0px));z-index:2">${I.x}</button>`);
  const sw = $('#sweet', el);
  if (sw) sw.addEventListener('input', () => { PD.sweet = +sw.value; $('#sweetNow', el).textContent = SWEET[PD.sweet]; });
  $('#pdNote', el).addEventListener('input', e => PD.note = e.target.value.slice(0, 120));
  el._pd = true;
}
function refreshPD(){
  const el = stack[stack.length - 1]; if (!el || !PD) return;
  const p = PBY[PD.pid];
  $$('[data-act="pdOpt"]', el).forEach(b => b.classList.toggle('on', PD[b.dataset.opt] === b.dataset.val));
  $$('[data-num]', el).forEach(n => { const k = n.dataset.num; const v = k.startsWith('flav:') ? (PD.flav[k.slice(5)] || 0) : PD[k]; n.textContent = v; n.previousElementSibling.classList.toggle('dis', v <= (k === 'qty' ? 1 : 0)); });
  const sb = $('#sweetBox', el);
  if (sb){ const off = PD.sugar === 'No Sugar'; sb.classList.toggle('off', off); $('#sweet', el).disabled = off; }
  $('.js-pd-price', el).textContent = money(unitPrice(p, PD) * PD.qty);
}
function addToCart(sel, editIdx){
  const p = PBY[sel.pid];
  const item = { key:'', pid:p.id, name:p.name, sel:JSON.parse(JSON.stringify(sel)), qty:sel.qty, unit:unitPrice(p, sel), opts:optLabel(p, sel) };
  item.key = p.id + '|' + item.opts;
  item.sel.qty = 1;
  if (editIdx != null && editIdx !== '' && S.cart[editIdx]) S.cart[editIdx] = item;
  else {
    const ex = S.cart.find(c => c.key === item.key);
    if (ex) ex.qty += item.qty; else S.cart.push(item);
  }
  save(); refreshBadges();
}
function needStore(then){
  if (S.store) return then();
  toast('Select a store first');
  openStorePicker(then);
}
