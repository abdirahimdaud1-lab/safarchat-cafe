/* Staff screen: live order board with payment checks, gifts, and (for admins) menu prices,
   store hours, payment numbers and people. All changes go through server functions that
   check the signed-in person's role (see supabase/schema.sql). */
'use strict';

const ST = { role:null, me:null, tab:'orders', orders:[], gifts:[], menu:null, seen:null, sound:false, open:{}, person:null, staffList:[], q:'' };
const PM = { evc:'EVC Plus', edahab:'eDahab', premier:'Premier Wallet', stars:'Stars' };
const MODE = { store:'Store pickup', car:'Car pickup', delivery:'Delivery' };
const since = t => { const s = (Date.now() - Date.parse(t)) / 1000; return s < 60 ? 'just now' : s < 3600 ? Math.floor(s / 60) + ' min ago' : s < 86400 ? Math.floor(s / 3600) + ' h ago' : new Date(t).toLocaleDateString(); };
const clock = t => new Date(t).toLocaleTimeString(undefined, { hour:'numeric', minute:'2-digit' });
let toastT;
function toast(m){ const t = $('#toast'); t.textContent = m; t.classList.add('on'); clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove('on'), 2600); }

/* ---------- sign in ---------- */
function renderLogin(msg){
  $('#tabs').hidden = true; $('#who').innerHTML = '';
  $('#main').innerHTML = `<form class="card login" id="login" novalidate>
    <h1>Staff sign in</h1><p class="muted">Use your SafarChat account. An admin must give it staff access.</p>
    <label class="f"><span>Phone number</span><div class="ph"><b>+252</b><input id="lPhone" inputmode="tel" placeholder="61 234 5678" autocomplete="username"></div></label>
    <label class="f"><span>Password</span><input id="lPw" type="password" autocomplete="current-password"></label>
    <p class="err" id="lErr" ${msg ? '' : 'hidden'}>${esc(msg || '')}</p>
    <button class="btn green wide" type="submit">Sign In</button>
    <p class="muted small"><a href="index.html">Open the customer app</a></p></form>`;
  $('#login').addEventListener('submit', async e => {
    e.preventDefault();
    const err = $('#lErr'), b = $('#login button');
    if (!validPhone($('#lPhone').value)){ err.textContent = 'Enter your phone number, e.g. 61 234 5678.'; err.hidden = false; return; }
    b.disabled = true; b.textContent = 'Signing in…';
    try { await API.signIn($('#lPhone').value, $('#lPw').value); await start(); }
    catch (x) { b.disabled = false; b.textContent = 'Sign In'; err.textContent = errText(x); err.hidden = false; }
  });
}

/* ---------- start ---------- */
async function boot(){
  if (!API.init()){ $('#main').innerHTML = `<div class="card login"><h1>Not connected</h1><p class="muted">Add your Supabase address and key to js/config.js (see SETUP.md).</p></div>`; return; }
  const id = await API.userId().catch(() => null);
  if (!id) return renderLogin();
  start().catch(e => renderLogin(errText(e)));
}
async function start(){
  const isStaff = await API.call('is_staff');
  if (!isStaff){ await API.signOut(); return renderLogin('This account doesn\'t have staff access yet. Ask an admin to make you staff in People.'); }
  ST.role = (await API.call('is_admin')) ? 'admin' : 'staff';
  const st = await API.call('get_my_state');
  ST.me = st.profile;
  $('#who').innerHTML = `<span>${esc(ST.me.name)} · ${ST.role === 'admin' ? 'Admin' : 'Staff'}</span><button class="btn ghost sm" id="snd">${ST.sound ? 'Sound on' : 'Turn on sound'}</button><button class="btn ghost sm" id="out">Sign out</button>`;
  $('#out').onclick = async () => { await API.signOut(); location.reload(); };
  $('#snd').onclick = () => { ST.sound = !ST.sound; if (ST.sound) beep(); $('#snd').textContent = ST.sound ? 'Sound on' : 'Turn on sound'; };
  const tabs = [['orders','Orders'],['gifts','Gifts']].concat(ST.role === 'admin' ? [['menu','Menu'],['store','Store & payments'],['people','People']] : []);
  $('#tabs').innerHTML = tabs.map(([k, l]) => `<button data-tab="${k}" class="${ST.tab===k?'on':''}">${l}<span class="cnt" id="cnt-${k}"></span></button>`).join('');
  $('#tabs').hidden = false;
  $('#tabs').onclick = e => { const b = e.target.closest('[data-tab]'); if (!b) return; ST.tab = b.dataset.tab; $$('#tabs button').forEach(x => x.classList.toggle('on', x === b)); render(); };
  await loadAll();
  API.listen('orders', undefined, () => loadAll(true).catch(() => {}));
  setInterval(() => loadAll(true).catch(() => {}), 15000);
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') loadAll(true).catch(() => {}); });
}
let loading = null;
async function loadAll(quiet){
  if (loading) return loading;
  loading = (async () => {
    const [orders, gifts] = await Promise.all([API.call('staff_list_orders'), API.call('staff_list_gifts')]);
    const waiting = orders.filter(o => o.status === 'payment_review' || o.status === 'paid').map(o => o.id).concat(gifts.filter(g => g.status === 'payment_review').map(g => 'g' + g.id));
    if (ST.seen && waiting.some(id => !ST.seen.includes(id))){ beep(); toast('New order to check'); }
    ST.seen = waiting;
    ST.orders = orders; ST.gifts = gifts;
    if (ST.role === 'admin' && !ST.menu) ST.menu = await API.call('get_menu');
    counts();
    const typing = document.activeElement && /INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName);
    if (!quiet || !typing) render();
  })();
  try { await loading; } finally { loading = null; }
}
function counts(){
  const n = ST.orders.filter(o => ['payment_review','paid','preparing','ready','on_the_way'].includes(o.status)).length;
  const g = ST.gifts.filter(x => x.status === 'payment_review').length;
  const set = (k, v) => { const e = $('#cnt-' + k); if (e) e.textContent = v ? v : ''; };
  set('orders', n); set('gifts', g);
  document.title = (n + g ? `(${n + g}) ` : '') + 'SafarChat Staff';
}
let actx;
function beep(){
  if (!ST.sound) return;
  try {
    actx = actx || new (window.AudioContext || window.webkitAudioContext)();
    [0, .18].forEach(d => { const o = actx.createOscillator(), g = actx.createGain(); o.frequency.value = 880; o.connect(g); g.connect(actx.destination);
      g.gain.setValueAtTime(.0001, actx.currentTime + d); g.gain.exponentialRampToValueAtTime(.3, actx.currentTime + d + .02); g.gain.exponentialRampToValueAtTime(.0001, actx.currentTime + d + .16);
      o.start(actx.currentTime + d); o.stop(actx.currentTime + d + .17); });
    if (navigator.vibrate) navigator.vibrate([120, 80, 120]);
  } catch (e) {}
}
function render(){ ({ orders:renderOrders, gifts:renderGifts, menu:renderMenu, store:renderStore, people:renderPeople })[ST.tab](); }

/* ---------- orders ---------- */
const where = o => o.mode === 'car' ? `Car <b>${esc(o.plate || '')}</b>${o.car ? ' · ' + esc(o.car) : ''}` : o.mode === 'delivery' ? `<b>${esc(o.building || '')}</b>${o.floor ? ', floor ' + esc(o.floor) : ''}${o.door ? ', door ' + esc(o.door) : ''}` : 'Counter';
function orderCard(o){
  const next = {
    payment_review:[['paid','Payment received','green'],['rejected','Not found','red']],
    paid:[['preparing','Start making','green'],['cancelled','Cancel','red']],
    preparing:[[o.mode === 'delivery' ? 'on_the_way' : 'ready', o.mode === 'delivery' ? 'Send out' : 'Ready', 'green'],['cancelled','Cancel','red']],
    ready:[['completed', o.mode === 'car' ? 'Handed to car' : 'Picked up', 'green']],
    on_the_way:[['completed','Delivered','green']]
  }[o.status] || [];
  const pend = ST.open[o.id];
  return `<article class="oc st-${o.status}" data-id="${o.id}">
    <div class="oh"><b class="code">${esc(o.code)}</b><span class="tag">${MODE[o.mode]} · ${esc(o.pickup_time)}</span><span class="time" title="${new Date(o.created_at).toLocaleString()}">${clock(o.created_at)} · ${since(o.created_at)}</span></div>
    <div class="who2">${esc(o.customer_name)} · <span class="num">${esc(fmtPhone(o.customer_phone))}</span></div>
    <div class="where">${where(o)}</div>
    <ul class="items">${o.items.map(i => `<li><b>${i.qty}×</b> ${esc(i.name)}<small>${esc(i.opts)}</small></li>`).join('')}</ul>
    ${o.note ? `<div class="note">“${esc(o.note)}”</div>` : ''}
    <div class="pay ${o.status === 'payment_review' ? 'check' : ''}">
      <div><span class="muted small">Total</span><b class="num big">${money(+o.total)}</b></div>
      <div><span class="muted small">Paid with</span><b>${PM[o.pay_method]}</b>${o.pay_method === 'stars' ? `<span class="small num">${o.stars_paid}★</span>` : `<span class="small num">from ${esc(fmtPhone(o.pay_phone))}</span>`}</div>
      ${o.pay_ref ? `<div><span class="muted small">Transaction ID</span><b class="ref num">${esc(o.pay_ref)}</b></div>` : ''}
      ${o.stars_used ? `<div><span class="muted small">Stars used</span><b class="num">${o.stars_used}★</b></div>` : ''}
    </div>
    ${o.status === 'payment_review' ? `<p class="hint">Open your ${PM[o.pay_method]} messages and find <b>${money(+o.total)}</b> from <b class="num">${esc(fmtPhone(o.pay_phone))}</b> with ID <b class="num">${esc(o.pay_ref)}</b>.</p>` : ''}
    ${o.status_note && ['rejected','cancelled'].includes(o.status) ? `<p class="hint">Note: ${esc(o.status_note)}</p>` : ''}
    ${pend ? `<div class="reason"><input id="rs-${o.id}" placeholder="${pend === 'rejected' ? 'Tell the customer why (e.g. No payment found for this ID)' : 'Reason for cancelling'}" maxlength="200"><button class="btn red" data-act="confirm" data-id="${o.id}" data-st="${pend}">${pend === 'rejected' ? 'Send: payment not found' : 'Cancel order'}</button><button class="btn ghost" data-act="back" data-id="${o.id}">Back</button></div>`
      : next.length ? `<div class="acts">${next.map(([s, l, c]) => `<button class="btn ${c}" data-act="${c === 'red' ? 'ask' : 'set'}" data-id="${o.id}" data-st="${s}">${l}</button>`).join('')}</div>` : ''}
  </article>`;
}
function renderOrders(){
  const cols = [
    ['Check payment', o => o.status === 'payment_review', 'Orders waiting for you to confirm the money arrived'],
    ['To make', o => o.status === 'paid' || o.status === 'preparing', 'Paid orders'],
    ['Ready / on the way', o => o.status === 'ready' || o.status === 'on_the_way', ''],
    ['Done today', o => ['completed','rejected','cancelled'].includes(o.status), '']
  ];
  $('#main').innerHTML = `<div class="board">${cols.map(([t, f, h]) => { const list = ST.orders.filter(f); return `<section class="col"><h2>${t}<span class="n">${list.length}</span></h2>${h ? `<p class="muted small">${h}</p>` : ''}
    ${list.length ? list.map(orderCard).join('') : '<p class="empty">Nothing here.</p>'}</section>`; }).join('')}</div>`;
}
async function setStatus(id, status, note){
  const btns = $$(`[data-id="${id}"] button`); btns.forEach(b => b.disabled = true);
  try { await API.call('staff_set_order_status', { p_id:id, p_status:status, p_note:note || null }); delete ST.open[id]; toast('Updated'); }
  catch (e) { toast(errText(e)); }
  await loadAll();
}

/* ---------- gifts ---------- */
function renderGifts(){
  const q = ST.q.trim().toUpperCase();
  const list = ST.gifts.filter(g => !q || g.code.includes(q) || (g.to_phone || '').includes(q.replace(/\D/g, '') || '#'));
  const card = g => `<article class="oc st-${g.status}"><div class="oh"><b class="code">${esc(g.code)}</b><span class="tag">${esc(g.item)}</span><span class="time">${since(g.created_at)}</span></div>
    <div class="who2">From ${esc(g.from_name)} (${esc(fmtPhone(g.sender_phone))}) → <b>${esc(g.to_name)}</b> ${esc(fmtPhone(g.to_phone))}</div>
    ${g.message ? `<div class="note">“${esc(g.message)}”</div>` : ''}
    <div class="pay ${g.status === 'payment_review' ? 'check' : ''}"><div><span class="muted small">Amount</span><b class="num big">${money(+g.amount)}</b></div>
      <div><span class="muted small">Paid with</span><b>${PM[g.pay_method]}</b><span class="small num">from ${esc(fmtPhone(g.pay_phone))}</span></div>
      <div><span class="muted small">Transaction ID</span><b class="ref num">${esc(g.pay_ref)}</b></div></div>
    <div class="acts">${g.status === 'payment_review' ? `<button class="btn green" data-act="gift" data-id="${g.id}" data-st="sent">Payment received · send gift</button><button class="btn red" data-act="gift" data-id="${g.id}" data-st="rejected">Not found</button>`
      : g.status === 'sent' ? `<button class="btn green" data-act="gift" data-id="${g.id}" data-st="redeemed">Mark as used</button>` : `<span class="pill">${g.status === 'redeemed' ? 'Used' : 'Payment not found'}</span>`}</div></article>`;
  $('#main').innerHTML = `<div class="wrap"><div class="bar"><h2>Gifts</h2><input id="gq" placeholder="Search gift code or phone" value="${esc(ST.q)}"></div>
    <div class="grid">${list.length ? list.map(card).join('') : '<p class="empty">No gifts.</p>'}</div></div>`;
  $('#gq').addEventListener('input', e => { ST.q = e.target.value; const p = e.target.selectionStart; renderGifts(); const i = $('#gq'); i.focus(); i.setSelectionRange(p, p); });
}

/* ---------- admin: menu ---------- */
function renderMenu(){
  const P = ST.menu.products;
  const group = sub => P.filter(p => p.sub === sub);
  $('#main').innerHTML = `<div class="wrap"><div class="bar"><h2>Menu &amp; prices</h2><p class="muted small">Changes show in the app straight away. Turn off “Available” when something sells out.</p></div>
    ${[...SUBS.drinks, ...SUBS.food].map(([k, l]) => `<section class="card"><h3>${l}</h3><table class="tbl"><tbody>${group(k).map(p => `<tr data-pid="${p.id}">
      <td class="nm">${esc(p.name)}</td>
      <td><label class="money">$<input type="number" step="0.05" min="0" max="1000" value="${(+p.price).toFixed(2)}" aria-label="Price of ${esc(p.name)}"></label></td>
      <td><label class="sw"><input type="checkbox" ${p.available ? 'checked' : ''}> Available</label></td>
      <td><button class="btn green sm" data-act="saveProd" data-id="${p.id}">Save</button></td></tr>`).join('')}</tbody></table></section>`).join('')}</div>`;
}
/* ---------- admin: store & payments ---------- */
function renderStore(){
  const s = ST.menu.stores[0], set = ST.menu.settings;
  const t = m => String(Math.floor(m / 60) % 24).padStart(2, '0') + ':' + String(m % 60).padStart(2, '0');
  $('#main').innerHTML = `<div class="wrap narrow">
    <section class="card"><h3>${esc(s.name)}</h3><p class="muted small">Opening hours (Mogadishu time). The app shows Open Now / Closed from these.</p>
      <div class="row2"><label class="f"><span>Opens</span><input id="sOpen" type="time" value="${t(s.open_min)}"></label><label class="f"><span>Closes</span><input id="sClose" type="time" value="${t(s.close_min === 1440 ? 1439 : s.close_min)}"></label></div>
      <label class="sw big"><input id="sClosed" type="checkbox" ${s.closed_override ? 'checked' : ''}> Closed today (overrides the hours)</label>
      <button class="btn green" id="saveStore">Save hours</button></section>
    <section class="card"><h3>Where customers send money</h3><p class="muted small">These numbers appear in the dial codes customers see at checkout.</p>
      <label class="f"><span>EVC Plus number</span><input id="pEvc" inputmode="numeric" value="${esc(set.evc_number)}"></label>
      <label class="f"><span>eDahab number</span><input id="pEd" inputmode="numeric" value="${esc(set.edahab_number)}"></label>
      <label class="f"><span>Premier Wallet number</span><input id="pPw" inputmode="numeric" value="${esc(set.premier_number)}"></label>
      <p class="muted small">Customers dial *712*${esc(set.evc_number)}*AMOUNT# (EVC Plus) and *110*${esc(set.edahab_number)}*AMOUNT# (eDahab).</p>
      <button class="btn green" id="savePay">Save numbers</button></section></div>`;
  const toMin = v => { const [h, m] = v.split(':').map(Number); return h * 60 + m; };
  $('#saveStore').onclick = async () => {
    try { await API.call('admin_update_store', { p_id:s.id, p_open_min:toMin($('#sOpen').value), p_close_min:toMin($('#sClose').value), p_closed_override:$('#sClosed').checked }); ST.menu = await API.call('get_menu'); toast('Hours saved'); renderStore(); }
    catch (e) { toast(errText(e)); }
  };
  $('#savePay').onclick = async () => {
    try { await API.call('admin_update_payments', { p_evc:$('#pEvc').value.trim(), p_edahab:$('#pEd').value.trim(), p_premier:$('#pPw').value.trim() }); ST.menu = await API.call('get_menu'); toast('Payment numbers saved'); renderStore(); }
    catch (e) { toast(errText(e)); }
  };
}
/* ---------- admin: people ---------- */
async function renderPeople(){
  try { ST.staffList = await API.call('admin_list_staff'); } catch (e) {}
  const p = ST.person;
  $('#main').innerHTML = `<div class="wrap narrow">
    <section class="card"><h3>Find a customer</h3><div class="row2 tight"><div class="ph"><b>+252</b><input id="fPhone" inputmode="tel" placeholder="61 234 5678"></div><button class="btn green" id="find">Find</button></div><p class="err" id="fErr" hidden></p></section>
    ${p ? `<section class="card person"><h3>${esc(p.name)}</h3><p class="muted">${esc(fmtPhone(p.phone))}${p.email ? ' · ' + esc(p.email) : ''} · joined ${new Date(p.created_at).toLocaleDateString()} · ${p.orders} orders</p>
      <div class="stat"><b class="num">${p.stars}★</b><span>Stars</span></div>
      <h4>Role</h4><div class="row2 tight"><select id="pRole">${['customer','staff','admin'].map(r => `<option value="${r}" ${p.role===r?'selected':''}>${r[0].toUpperCase() + r.slice(1)}</option>`).join('')}</select><button class="btn green" id="saveRole">Save role</button></div>
      <h4>Adjust Stars</h4><div class="row2 tight"><input id="sDelta" type="number" step="1" placeholder="e.g. 50 or -20"><input id="sWhy" placeholder="Reason (customer sees this)" maxlength="200"><button class="btn green" id="saveStars">Apply</button></div>
      <h4>Reset password</h4><p class="muted small">Only after checking the person owns this phone number. Tell them the new password and ask them to keep it private.</p>
      <div class="row2 tight"><input id="nPw" type="text" placeholder="New password (8+ characters)" autocomplete="off"><button class="btn red" id="resetPw">Set password</button></div></section>` : ''}
    <section class="card"><h3>Staff &amp; admins</h3><ul class="plist">${ST.staffList.map(s => `<li><b>${esc(s.name)}</b><span class="num">${esc(fmtPhone(s.phone))}</span><span class="pill">${s.role}</span></li>`).join('') || '<li class="muted">Only you so far.</li>'}</ul>
      <p class="muted small">To add staff: they create a normal account in the app, then you find them here and set their role to Staff.</p></section></div>`;
  const find = async () => {
    const err = $('#fErr');
    try { ST.person = await API.call('admin_find_user', { p_phone:$('#fPhone').value }); renderPeople(); }
    catch (e) { err.textContent = errText(e); err.hidden = false; }
  };
  $('#find').onclick = find;
  $('#fPhone').addEventListener('keydown', e => { if (e.key === 'Enter') find(); });
  if (!p) return;
  const refresh = async () => { ST.person = await API.call('admin_find_user', { p_phone:p.phone }); renderPeople(); };
  $('#saveRole').onclick = async () => { try { await API.call('admin_set_role', { p_user:p.id, p_role:$('#pRole').value }); toast('Role saved'); refresh(); } catch (e) { toast(errText(e)); } };
  $('#saveStars').onclick = async () => { try { await API.call('admin_adjust_stars', { p_user:p.id, p_delta:parseInt($('#sDelta').value, 10), p_reason:$('#sWhy').value }); toast('Stars updated'); refresh(); } catch (e) { toast(errText(e)); } };
  $('#resetPw').onclick = async () => { try { await API.call('admin_reset_password', { p_user:p.id, p_password:$('#nPw').value }); toast('Password changed'); $('#nPw').value = ''; } catch (e) { toast(errText(e)); } };
}

/* ---------- clicks ---------- */
document.addEventListener('click', async e => {
  const b = e.target.closest('[data-act]'); if (!b || b.disabled) return;
  const id = +b.dataset.id, a = b.dataset.act;
  if (a === 'set') return setStatus(id, b.dataset.st);
  if (a === 'ask'){ ST.open[id] = b.dataset.st; renderOrders(); const i = $('#rs-' + id); if (i) i.focus(); return; }
  if (a === 'back'){ delete ST.open[id]; return renderOrders(); }
  if (a === 'confirm') return setStatus(id, b.dataset.st, ($('#rs-' + id) || {}).value);
  if (a === 'gift'){
    b.disabled = true;
    try { await API.call('staff_set_gift_status', { p_id:id, p_status:b.dataset.st, p_note:null }); toast('Updated'); } catch (x) { toast(errText(x)); }
    return loadAll();
  }
  if (a === 'saveProd'){
    const row = b.closest('tr'), pid = b.dataset.id;
    b.disabled = true;
    try {
      const r = await API.call('admin_update_product', { p_id:pid, p_price:parseFloat($('input[type=number]', row).value), p_available:$('input[type=checkbox]', row).checked });
      Object.assign(ST.menu.products.find(x => x.id === pid), r); toast('Saved ' + r.name);
    } catch (x) { toast(errText(x)); }
    b.disabled = false;
  }
});
boot();
