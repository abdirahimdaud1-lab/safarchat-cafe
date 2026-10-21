/* Actions for every button (data-act="...") and app start-up. Loaded last. */
'use strict';

const A = {
  tab: el => { closeAll(); go(el.dataset.tab); },
  closeTop,
  cart: () => openCart(),
  bell: () => openNotes(),
  readAll: () => { S.notes.forEach(n => n.read = true); save(); closeTop(); refreshBadges(); toast('All caught up'); },
  tiers: () => { ui.tiersOpen = !ui.tiersOpen; const b = $('.tier-tog'); b.setAttribute('aria-expanded', ui.tiersOpen); $('.tiers').hidden = !ui.tiersOpen; },
  prodOrder: el => { closeAll(); go('order'); openProduct(el.dataset.id); },
  prod: el => openProduct(el.dataset.id),
  quick: el => needStore(() => { const p = PBY[el.dataset.id]; addToCart(defaultSel(p)); toast(`${p.name} added`); }),
  startMode: el => { closeAll(); go('order'); if (!S.store) openStorePicker(); else toast({ store:'Store Pickup', car:'Car Pickup', delivery:'Nearby Delivery' }[el.dataset.mode] + ' · choose at checkout'); },
  startOrder: () => { closeAll(); go('order'); },
  pickStore: () => openStorePicker(),
  setStore: () => {
    S.store = 'dahab'; save();
    const top = stack[stack.length - 1]; const after = top && top._after;
    closeTop(); toast('Ordering from Dahab Tower');
    if (ui.tab === 'order') R_order();
    if (after) setTimeout(after, 200);
  },
  otab: el => { ui.otab = el.dataset.k; ui.q = ''; R_order(); },
  osub: el => { ui.sub[ui.otab] = el.dataset.k; renderMenu(); },
  clearQ: () => { ui.q = ''; R_order(); },
  fav: el => { const id = el.dataset.id; const i = S.favs.indexOf(id); if (i >= 0) S.favs.splice(i, 1); else S.favs.unshift(id); save(); el.innerHTML = i >= 0 ? I.heart : I.heartF; toast(i >= 0 ? 'Removed from favourites' : 'Saved to favourites'); if (ui.tab === 'order') renderMenu(); },
  pdOpt: el => { PD[el.dataset.opt] = el.dataset.val; refreshPD(); },
  pdStep: el => {
    const k = el.dataset.key, d = +el.dataset.d;
    if (k.startsWith('flav:')){ const f = k.slice(5); PD.flav[f] = Math.max(0, Math.min(6, (PD.flav[f] || 0) + d)); if (!PD.flav[f]) delete PD.flav[f]; }
    else { const min = k === 'qty' ? 1 : 0, max = k === 'qty' ? 20 : k === 'shots' ? 4 : 3; PD[k] = Math.max(min, Math.min(max, PD[k] + d)); }
    refreshPD();
  },
  pdAdd: el => {
    const edit = el.dataset.edit;
    needStore(() => {
      addToCart(PD, edit === '' ? null : +edit);
      const p = PBY[PD.pid];
      const top = stack[stack.length - 1]; if (top && top._pd) closeTop();
      const c = cartEl(); if (c) renderCart(c);
      toast(edit === '' ? `${PD.qty}× ${p.name} added to your order` : 'Item updated');
    });
  },
  editItem: el => { const i = +el.dataset.i; openProduct(S.cart[i].pid, i); },
  cq: el => { const i = +el.dataset.i, c = S.cart[i]; c.qty += +el.dataset.d; if (c.qty <= 0) S.cart.splice(i, 1); save(); renderCart(cartEl()); refreshBadges(); },
  cdel: el => { const c = S.cart.splice(+el.dataset.i, 1)[0]; save(); renderCart(cartEl()); refreshBadges(); toast(`${c.name} deleted`); },
  cclear: () => { S.cart = []; S.useStars = 0; save(); renderCart(cartEl()); refreshBadges(); toast('Order cleared'); },
  ustar: el => { S.useStars = Math.max(0, Math.min(maxStarsUsable(), totals().used + +el.dataset.d)); save(); renderCart(cartEl()); },
  checkout: () => openCheckout(),
  coMode: el => { CO.mode = el.dataset.m; CO.err = {}; renderCheckout(); },
  coTime: el => { CO.time = el.dataset.t; renderCheckout(); },
  coPick: () => openPayPicker(),
  coSetPm: el => { CO.method = el.dataset.k; CO.revealed = false; closeTop(); renderCheckout(); },
  coReveal: () => { CO.revealed = true; if (!CO.phone) CO.phone = S.user.phone; renderCheckout(); setTimeout(() => { const f = $('#coFoot'); if (f) f.scrollIntoView({ block:'end' }); const b = stack.find(e => e._co); if (b) { const bd = $('.page-bd', b); bd.scrollTo({ top:bd.scrollHeight, behavior:'smooth' }); } }, 50); },
  coPay: () => doPay(),
  goHome: () => { closeAll(); go('home'); },
  myOrdersFromDone: () => { closeAll(); go('account'); setTimeout(openMyOrders, 200); },
  myOrders: () => openMyOrders(),
  reorder: el => {
    const o = S.orders.find(x => x.id === el.dataset.id); if (!o) return;
    needStore(() => { o.lines.forEach(([pid, q]) => { const p = PBY[pid]; if (p) { const s = defaultSel(p); s.qty = q; addToCart(s); } }); closeAll(); toast('Added to your order'); setTimeout(openCart, 200); });
  },
  more: () => { ui.ledgerN += 10; const sc = $('#s-rewards').scrollTop; R_rewards(); $('#s-rewards').scrollTop = sc; },
  redeem: () => openRedeem(),
  applyRedeem: el => { const n = +el.dataset.n; S.useStars = n; save(); closeTop(); if (!S.cart.length){ toast(`${n}★ ($${(n*STAR_USD).toFixed(2)} off) ready for your next order`); go('order'); } else { openCart(); toast(`${n}★ applied`); } },
  shareStars: () => openShare(),
  shStep: el => { const sh = stack[stack.length - 1]; const st = sh._st; st.amt = Math.max(10, Math.min(S.stars, st.amt + +el.dataset.d)); updShare(sh); },
  shSet: el => { const sh = stack[stack.length - 1]; sh._st.amt = Math.min(+el.dataset.n, S.stars); updShare(sh); },
  shSend: () => {
    const sh = stack[stack.length - 1], st = sh._st, err = $('#shErr', sh);
    const ph = $('#shPhone', sh).value.trim(), nm = $('#shName', sh).value.trim(), msg = $('#shMsg', sh).value.trim();
    const bad = m => { err.textContent = m; err.hidden = false; };
    if (!validPhone(ph)) return bad('Enter the phone number of a SafarChat app user, e.g. +252 61 555 0101.');
    if (ph.replace(/\D/g, '').slice(-9) === S.user.phone.replace(/\D/g, '').slice(-9)) return bad('You can\'t send Stars to your own number.');
    if (st.amt < 10 || st.amt > S.stars) return bad('You can share between 10★ and ' + S.stars + '★.');
    S.stars -= st.amt; S.useStars = Math.min(S.useStars, Math.floor(S.stars / 100) * 100);
    const masked = ph.replace(/\d(?=\d{4})/g, '*');
    S.ledger.unshift({ id:uid(), t:Date.now(), kind:'share', title:'Stars shared', detail:`To ${nm || 'a friend'} · ${masked}${msg ? ' · “' + msg + '”' : ''}`, stars:-st.amt });
    S.notes.unshift({ id:uid(), t:Date.now(), icon:'share', title:`You sent ${st.amt} Stars`, body:`${nm || 'Your friend'} (${masked}) received ${st.amt}★ worth ${money(st.amt*STAR_USD)}.`, read:false });
    save(); closeTop(); refreshAll(); toast(`${st.amt}★ sent to ${nm || masked}`);
  },
  gcat: el => openGiftCat(el.dataset.k),
  gsub: el => { const p = stack[stack.length - 1]; p._gift.sub = el.dataset.s; renderGiftCat(p); },
  gpick: el => {
    const p = stack[stack.length - 1], { k, sub } = p._gift, cat = GCATS.find(c => c.k === k);
    if (el.dataset.type === 'card') openGiftCompose(cat, cat.name + ' eGift Card', +el.dataset.amt, true);
    else { const it = GITEMS[k][sub][+el.dataset.i]; openGiftCompose(cat, it[0], it[2], false); }
  },
  gAmt: el => { const s = stack[stack.length - 1]; s._g.amt = +el.dataset.a; $$('[data-act="gAmt"]', s).forEach(b => b.classList.toggle('on', b === el)); $('#gAmt', s).textContent = money(s._g.amt); $('#gBtnAmt', s).textContent = money(s._g.amt); $('.gcard .gamt', s).textContent = money(s._g.amt); },
  gPm: el => { const s = stack[stack.length - 1]; s._g.pm = el.dataset.k; $$('.pmchip', s).forEach(b => b.classList.toggle('on', b === el)); },
  gSend: () => {
    const s = stack[stack.length - 1], G = s._g, err = $('#gErr', s);
    G.to = $('#gTo', s).value.trim(); G.phone = $('#gPhone', s).value.trim(); G.msg = $('#gMsg', s).value.trim(); G.from = $('#gFrom', s).value.trim();
    if (!G.to){ err.textContent = 'Add the name of the person you are gifting.'; err.hidden = false; return; }
    if (!validPhone(G.phone)){ err.textContent = 'Enter their phone number so we can send the gift by SMS.'; err.hidden = false; return; }
    const btn = $('[data-act="gSend"]', s); btn.disabled = true; btn.innerHTML = `Approve on your ${PMS[G.pm].name} phone…`;
    setTimeout(() => {
      S.gifts.unshift({ id:uid(), t:Date.now(), cat:G.cat, item:G.item, amt:G.amt, to:G.to, phone:G.phone, msg:G.msg, pm:G.pm });
      S.notes.unshift({ id:uid(), t:Date.now(), icon:'gift', title:'Gift sent', body:`${G.item} (${money(G.amt)}) is on its way to ${G.to}. Paid with ${PMS[G.pm].name}.`, read:false });
      save(); closeAll(); go('gifts'); toast(`Gift sent to ${G.to}`);
    }, 1800);
  },
  profile: el => openProfile(el.dataset.focus),
  pfGender: el => { const p = stack[stack.length - 1]; p._u.gender = el.dataset.g; $$('[data-act="pfGender"]', p).forEach(b => b.classList.toggle('on', b === el)); },
  pfNoPhoto: () => { const p = stack[stack.length - 1]; p._u.photo = ''; renderProfile(p); },
  saveProfile: () => {
    const p = stack[stack.length - 1], u = p._u, err = $('#pfErr', p);
    if (!u.name.trim()){ err.textContent = 'Name can\'t be empty.'; err.hidden = false; err.scrollIntoView({ block:'center' }); return; }
    if (!validPhone(u.phone)){ err.textContent = 'Enter a valid contact number, e.g. +252 61 234 5678.'; err.hidden = false; err.scrollIntoView({ block:'center' }); return; }
    if (u.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(u.email)){ err.textContent = 'That email doesn\'t look right. Leave it empty or use name@email.com.'; err.hidden = false; err.scrollIntoView({ block:'center' }); return; }
    u.name = u.name.trim(); S.user = u; save(); closeTop(); refreshAll(); toast('Profile saved');
  },
  qrFull: () => openQRFull(),
  qrClose: () => { const q = $('.qr-full'); if (q) q.remove(); },
  payMethods: () => sheet('Payment methods', `<div class="pms">${['evc','edahab','premier','stars'].map(k => `<div class="pm" style="pointer-events:none">${pmLogo(k)}<span class="pt"><b>${PMS[k].name}</b><span>${k === 'stars' ? S.stars + '★ available' : PMS[k].sub + ' · ' + esc(S.user.phone)}</span></span></div>`).join('')}</div><p class="foot-note">Your contact number is used to send payment requests. Change it in Profile.</p>`),
  help: () => openHelp(),
  resetAsk: () => sheet('Reset test data?', `<p style="line-height:1.5;color:var(--brown-2)">This clears your cart, orders, gifts, profile edits and Star history on this phone, and restores the sample data.</p>`, `<div class="two"><button class="btn btn-line" data-act="closeTop">Cancel</button><button class="btn btn-green" style="background:var(--bad)" data-act="resetDo">Reset</button></div>`),
  resetDo: () => { S = seed(); save(); ui.ledgerN = 10; closeAll(); go('home'); toast('Test data reset'); }
};
function updShare(sh){
  const st = sh._st;
  $('#shAmt', sh).textContent = st.amt + '★'; $('#shVal', sh).textContent = 'Worth ' + money(st.amt * STAR_USD);
  $('#shBtn', sh).textContent = `Send ${st.amt}★`;
}
const R = { home:R_home, rewards:R_rewards, order:R_order, gifts:R_gifts, account:R_account };
function refreshAll(){ R[ui.tab](); refreshBadges(); }

document.addEventListener('click', e => {
  const el = e.target.closest('[data-act]');
  if (!el || el.disabled) return;
  const f = A[el.dataset.act];
  if (f){ e.preventDefault(); f(el, e); }
});
document.addEventListener('keydown', e => {
  if (e.key === 'Escape'){ const q = $('.qr-full'); if (q) q.remove(); else closeTop(); }
});

/* live greeting & clock */
setInterval(() => {
  const d = new Date();
  $$('.js-greet').forEach(g => g.textContent = greeting(d));
  $$('.js-clock').forEach(c => c.textContent = d.toLocaleTimeString(undefined, { hour:'numeric', minute:'2-digit' }));
}, 30000);

renderTabbar();
const hash = (location.hash || '').slice(1);
go(R[hash] ? hash : 'home');
window.addEventListener('load', () => { if (ui.tab === 'account') R_account(); });
