/* Actions for every button (data-act="...") and app start-up. Loaded last. */
'use strict';

const A = {
  tab: el => { closeAll(); go(el.dataset.tab); },
  closeTop,
  cart: () => openCart(),
  bell: () => openNotes(),
  readAll: () => { closeTop(); toast('All caught up'); },
  tiers: () => { ui.tiersOpen = !ui.tiersOpen; const b = $('.tier-tog'); b.setAttribute('aria-expanded', ui.tiersOpen); $('.tiers').hidden = !ui.tiersOpen; },
  prodOrder: el => { closeAll(); go('order'); openProduct(el.dataset.id); },
  prod: el => openProduct(el.dataset.id),
  quick: el => needStore(() => { const p = PBY[el.dataset.id]; if (!p || p.available === false) return toast('Sold out today'); addToCart(defaultSel(p)); toast(`${p.name} added`); }),
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
  fav: async el => {
    const id = el.dataset.id;
    try {
      const on = await API.call('toggle_fav', { p_product:id });
      S.favs = on ? [id].concat(S.favs.filter(x => x !== id)) : S.favs.filter(x => x !== id);
      el.innerHTML = on ? I.heartF : I.heart; toast(on ? 'Saved to favourites' : 'Removed from favourites');
      if (ui.tab === 'order') renderMenu();
    } catch (e) { toast(errText(e)); }
  },
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
  coMode: el => { const was = CO.mode; CO.mode = el.dataset.m; CO.err = {}; if ((was === 'delivery') !== (CO.mode === 'delivery')) requote(); else renderCheckout(); },
  coRequote: () => requote(),
  copyCode: el => copyText(el.dataset.code, el),
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
    needStore(() => {
      let skipped = 0;
      o.lines.forEach(([pid, q]) => { const p = PBY[pid]; if (p && p.available !== false) { const s = defaultSel(p); s.qty = q; addToCart(s); } else skipped++; });
      closeAll(); toast(skipped ? 'Added. Some items are sold out today.' : 'Added to your order'); setTimeout(openCart, 200);
    });
  },
  more: () => { ui.ledgerN += 10; const sc = $('#s-rewards').scrollTop; R_rewards(); $('#s-rewards').scrollTop = sc; },
  redeem: () => openRedeem(),
  applyRedeem: el => { const n = +el.dataset.n; S.useStars = n; save(); closeTop(); if (!S.cart.length){ toast(`${n}★ ($${(n*STAR_USD).toFixed(2)} off) ready for your next order`); go('order'); } else { openCart(); toast(`${n}★ applied`); } },
  shareStars: () => openShare(),
  shStep: el => { const sh = stack[stack.length - 1]; const st = sh._st; st.amt = Math.max(10, Math.min(S.stars, st.amt + +el.dataset.d)); updShare(sh); },
  shSet: el => { const sh = stack[stack.length - 1]; sh._st.amt = Math.min(+el.dataset.n, S.stars); updShare(sh); },
  shSend: async () => {
    const sh = stack[stack.length - 1], st = sh._st, err = $('#shErr', sh);
    const ph = $('#shPhone', sh).value.trim(), msg = $('#shMsg', sh).value.trim();
    const bad = m => { err.textContent = m; err.hidden = false; };
    if (S.stars < 10) return bad('You need at least 10 Stars to share. Every $1 you pay earns 2 Stars.');
    if (!validPhone(ph)) return bad('Enter the phone number of a SafarChat app user, e.g. 61 555 0101.');
    if (normPhone(ph) === normPhone(S.user.phone)) return bad('You can\'t send Stars to your own number.');
    if (st.amt < 10 || st.amt > S.stars) return bad('You can share between 10★ and ' + S.stars + '★.');
    const btn = $('#shBtn', sh); btn.disabled = true; btn.textContent = 'Sending…';
    try {
      const r = await API.call('share_stars', { p_phone:ph, p_amount:st.amt, p_message:msg });
      S.useStars = Math.min(S.useStars, Math.floor(r.stars / 100) * 100); save();
      await refreshState().catch(() => {});
      closeTop(); refreshAll(); toast(`${st.amt}★ sent to ${r.to_name}`);
    } catch (e) { btn.disabled = false; btn.textContent = `Send ${st.amt}★`; bad(errText(e)); }
  },
  gcat: el => openGiftCat(el.dataset.k),
  gsub: el => { const p = stack[stack.length - 1]; p._gift.sub = el.dataset.s; renderGiftCat(p); },
  gpick: el => {
    const p = stack[stack.length - 1], { k, sub } = p._gift, cat = GCATS.find(c => c.k === k);
    if (el.dataset.type === 'card') openGiftCompose(cat, cat.name + ' eGift Card', +el.dataset.amt, true);
    else { const it = GITEMS[k][sub][+el.dataset.i]; openGiftCompose(cat, it[0], giftPrice(k, sub, it[0], it[2]), false, sub); }
  },
  gAmt: el => { const s = stack[stack.length - 1]; s._g.amt = +el.dataset.a; $$('[data-act="gAmt"]', s).forEach(b => b.classList.toggle('on', b === el)); $('#gAmt', s).textContent = money(s._g.amt); $('#gBtnAmt', s).textContent = money(s._g.amt); $('.gcard .gamt', s).textContent = money(s._g.amt); refreshGiftGuide(s); },
  gPm: el => { const s = stack[stack.length - 1]; s._g.pm = el.dataset.k; $$('.pmchip', s).forEach(b => b.classList.toggle('on', b === el)); refreshGiftGuide(s); },
  gSend: async () => {
    const s = stack[stack.length - 1], G = s._g, err = $('#gErr', s);
    if (G.busy) return;
    const bad = m => { err.textContent = m; err.hidden = false; err.scrollIntoView({ block:'center' }); };
    const to = $('#gTo', s).value.trim(), phone = $('#gPhone', s).value.trim(), payPhone = $('#gPayPhone', s).value.trim(), ref = $('#gRef', s).value.trim();
    if (!to) return bad('Add the name of the person you are gifting.');
    if (!validPhone(phone)) return bad('Enter their phone number, e.g. 61 555 0101.');
    if (!validPhone(payPhone)) return bad('Enter the number you paid from, e.g. 61 234 5678.');
    if (!/^[A-Za-z0-9-]{4,40}$/.test(ref)) return bad('Enter the transaction ID from your payment SMS (letters and numbers).');
    const btn = $('[data-act="gSend"]', s); G.busy = true; btn.disabled = true; btn.textContent = 'Sending…';
    try {
      await API.call('send_gift', { p:{ cat:G.cat, kind:G.kind, item:G.item, amount:G.amt, expected_amount:G.amt, to_name:to, to_phone:phone,
        message:$('#gMsg', s).value.trim(), from_name:$('#gFrom', s).value.trim(), pay_method:G.pm, pay_phone:payPhone, pay_ref:ref } });
      await refreshState().catch(() => {});
      closeAll(); go('gifts'); toast(`Gift for ${to} sent for payment check`);
    } catch (e) {
      G.busy = false; btn.disabled = false; btn.innerHTML = `I've paid · Send Gift <span class="num" id="gBtnAmt">${money(G.amt)}</span>`;
      bad(errText(e));
    }
  },
  profile: el => openProfile(el.dataset.focus),
  pfGender: el => { const p = stack[stack.length - 1]; p._u.gender = el.dataset.g; $$('[data-act="pfGender"]', p).forEach(b => b.classList.toggle('on', b === el)); },
  pfNoPhoto: () => { const p = stack[stack.length - 1]; p._u.photo = ''; renderProfile(p); },
  saveProfile: async () => {
    const p = stack[stack.length - 1], u = p._u, err = $('#pfErr', p);
    const bad = m => { err.textContent = m; err.hidden = false; err.scrollIntoView({ block:'center' }); };
    if (u.name.trim().length < 2) return bad('Enter your name (at least 2 letters).');
    if (u.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(u.email)) return bad('That email doesn\'t look right. Leave it empty or use name@email.com.');
    const btn = $('[data-act="saveProfile"]', p); btn.disabled = true; btn.textContent = 'Saving…';
    try {
      await API.call('update_profile', { p:{ name:u.name.trim(), email:u.email || '', gender:u.gender || '', dob:u.dob || '', photo:u.photo || '', address:u.address } });
      await refreshState();
      closeTop(); refreshAll(); toast('Profile saved');
      const b = await API.call('claim_birthday').catch(() => 0);
      if (b > 0){ await refreshState(true); toast(`Happy birthday! ${b} Stars added`); }
    } catch (e) { btn.disabled = false; btn.textContent = 'Save Changes'; bad(errText(e)); }
  },
  qrFull: () => openQRFull(),
  qrClose: () => { const q = $('.qr-full'); if (q) q.remove(); },
  payMethods: () => sheet('Payment methods', `<div class="pms">${['evc','edahab','premier','stars'].map(k => `<div class="pm" style="pointer-events:none">${pmLogo(k)}<span class="pt"><b>${PMS[k].name}</b><span>${k === 'stars' ? S.stars + '★ available' : 'Pay to SafarChat: ' + esc(k === 'evc' ? SETTINGS.evc_number : k === 'edahab' ? SETTINGS.edahab_number : SETTINGS.premier_number)}</span></span></div>`).join('')}</div><p class="foot-note">At checkout the app shows the exact code to dial. After paying, enter the transaction ID from your SMS and the café confirms it.</p>`),
  help: () => openHelp(),
  signOutAsk: () => sheet('Sign out?', `<p style="line-height:1.5;color:var(--brown-2)">Your orders, Stars and history stay saved in your account. Sign in again any time, on any phone, with your phone number and password.</p>`, `<div class="two"><button class="btn btn-line" data-act="closeTop">Cancel</button><button class="btn btn-green" data-act="signOut">Sign Out</button></div>`),
  signOut: async () => { const n = S.user.name.split(' ')[0]; await signOut(); toast(`Signed out. See you soon, ${n}`); },
  deleteAsk: () => sheet('Delete account?', `<p style="line-height:1.5;color:var(--brown-2)">This permanently deletes your account, ${S.stars} Stars, ${S.orders.length} orders and all history. It can't be undone.</p><label class="field"><span>Type DELETE to confirm</span><input class="inp" id="delTxt" autocomplete="off"></label><p class="err-msg" id="delErr" hidden></p>`, `<div class="two"><button class="btn btn-line" data-act="closeTop">Cancel</button><button class="btn btn-green" style="background:var(--bad)" data-act="deleteDo">Delete</button></div>`),
  deleteDo: () => {
    const sh = stack[stack.length - 1];
    if ($('#delTxt', sh).value.trim().toUpperCase() !== 'DELETE'){ const e = $('#delErr', sh); e.textContent = 'Type DELETE in capitals to confirm.'; e.hidden = false; return; }
    const btn = $('[data-act="deleteDo"]', sh); btn.disabled = true; btn.textContent = 'Deleting…';
    API.call('delete_my_account').then(async () => {
      try { localStorage.removeItem('safarchat.cart.' + S.id); } catch (e) {}
      await signOut(true); toast('Your account was deleted');
    }).catch(e => { btn.disabled = false; btn.textContent = 'Delete'; const er = $('#delErr', sh); er.textContent = errText(e); er.hidden = false; });
  },
  authGo: el => { AUTH.show = {}; showAuth(el.dataset.v); },
  retryBoot: () => boot(),
  pwEye: el => { const id = el.dataset.id, i = $('#' + id); AUTH.show[id] = !AUTH.show[id]; i.type = AUTH.show[id] ? 'text' : 'password'; el.innerHTML = AUTH.show[id] ? eyeOff : eye; el.setAttribute('aria-label', (AUTH.show[id] ? 'Hide' : 'Show') + ' password'); }
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
  if (!S) return;
  const d = new Date();
  $$('.js-greet').forEach(g => g.textContent = greeting(d));
  $$('.js-clock').forEach(c => c.textContent = d.toLocaleTimeString(undefined, { hour:'numeric', minute:'2-digit' }));
}, 30000);

/* Copy a payment code; select the text if the clipboard is blocked. */
function copyText(text, btn){
  const done = () => { if (btn){ const t = btn.textContent; btn.textContent = 'Copied'; setTimeout(() => btn.textContent = t, 1600); } toast('Copied. Paste it in your phone app to dial.'); };
  try { navigator.clipboard.writeText(text).then(done, () => selectCode()); } catch (e) { selectCode(); }
  function selectCode(){ const c = $('#dialCode'); if (!c) return; const r = document.createRange(); r.selectNodeContents(c); const sel = getSelection(); sel.removeAllRanges(); sel.addRange(r); toast('Press and hold to copy the code'); }
}

/* Start-up: load the menu, then restore the signed-in session if there is one. */
async function boot(){
  renderTabbar();
  showAuth('loading');
  if (!API.init()) return showAuth('setup');
  try { applyMenu(await API.call('get_menu')); }
  catch (e) { return showAuth('offline'); }
  let id = null;
  try { id = await API.userId(); } catch (e) {}
  if (!id) return showAuth('welcome');
  try {
    await enterApp();
    const hash = (location.hash || '').slice(1);
    if (R[hash] && hash !== 'home') go(hash);
  } catch (e) {
    if (/not_signed_in|JWT|no_profile/.test(e.message)) { await API.signOut(); showAuth('welcome'); }
    else showAuth('offline');
  }
}
boot();
