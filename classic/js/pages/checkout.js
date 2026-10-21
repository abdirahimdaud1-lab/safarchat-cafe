/* Checkout: Store Pickup / Car Pickup / Nearby Delivery, pickup time, payment (EVC Plus, eDahab, Premier Wallet, Stars) and order confirmation. */
'use strict';

const PMS = {
  evc:{ name:'EVC Plus', cls:'pm-evc', short:'EVC+', sub:'Hormuud mobile money', ussd:'*712#' },
  edahab:{ name:'eDahab', cls:'pm-edahab', short:'eDahab', sub:'Dahabshiil mobile wallet', ussd:'*110#' },
  premier:{ name:'Premier Wallet', cls:'pm-premier', short:'PREMIER', sub:'Premier Bank wallet', ussd:'the Premier Wallet app' },
  stars:{ name:'Stars', cls:'pm-stars', short:'', sub:'Pay with your Star balance' }
};
const pmLogo = k => `<span class="pm-logo ${PMS[k].cls}">${k === 'stars' ? I.star : PMS[k].short}</span>`;
let CO = null;
function openCheckout(){
  if (!S.cart.length) return;
  if (!S.store) return needStore(openCheckout);
  CO = { mode:'store', time:'Now', note:'', plate:'', car:'', building:'Dahab Tower', floor:'', door:'', method:null, revealed:false, phone:S.user.phone, err:{} };
  const el = page('Checkout', '', '<div id="coFoot"></div>');
  el._co = true;
  renderCheckout(el);
}
function coTotals(){ return totals(CO.mode === 'delivery' ? DELIVERY_FEE : 0); }
function renderCheckout(el){
  el = el || stack.find(e => e._co); if (!el) return;
  const T = coTotals(), open = storeOpen();
  const starsNeed = Math.ceil(T.total / STAR_USD);
  const spare = S.stars - T.used;
  const timeLbl = CO.mode === 'delivery' ? 'Delivery time' : 'Pick up time';
  const bd = $('.page-bd', el);
  bd.innerHTML = `
    <h1 class="co-title">How Would You Like Your Order</h1>
    <p class="co-sub">Choose your preferred way to receive</p>
    <div class="modes">
      <button class="mode ${CO.mode==='store'?'on':''}" data-act="coMode" data-m="store">${I.store}Store Pickup</button>
      <button class="mode ${CO.mode==='car'?'on':''}" data-act="coMode" data-m="car">${I.car}Car Pickup</button>
      <button class="mode ${CO.mode==='delivery'?'on':''}" data-act="coMode" data-m="delivery">${I.bike}Nearby Delivery</button>
    </div>
    ${open ? '' : `<div class="banner">${I.info}<span>Dahab Tower is closed right now (open 6:30 AM – 11:30 PM). You can still place this test order.</span></div>`}
    ${CO.mode === 'delivery' ? `<div class="blk"><h3>Delivery</h3><p class="hint">We deliver to buildings near Dahab Tower · ${money(DELIVERY_FEE)} fee</p>
      <label class="field"><span>Building Name</span><select class="inp" id="coBuilding"><option ${CO.building==='Dahab Tower'?'selected':''}>Dahab Tower</option></select></label>
      <div class="two"><label class="field"><span>Floor Number <em>(Optional)</em></span><input class="inp" id="coFloor" placeholder="e.g. 2 or 2A" value="${esc(CO.floor)}" maxlength="6"></label>
      <label class="field"><span>Door Number <em>(Optional)</em></span><input class="inp" id="coDoor" placeholder="e.g. A1" value="${esc(CO.door)}" maxlength="8"></label></div></div>` : ''}
    <div class="blk"><h3>${timeLbl}</h3>
      <div class="times">${['Now','5-10 min','10-15 min','15-20 min'].map(t => `<button class="${CO.time===t?'on':''}" data-act="coTime" data-t="${t}">${t}</button>`).join('')}</div></div>
    ${CO.mode === 'car' ? `<div class="blk"><h3>Car Details</h3><p class="hint">We'll bring your order to your car outside Dahab Tower</p>
      <label class="field"><span style="font-size:12px;color:var(--muted)">Taargo / Plate no.</span><input class="inp ${CO.err.plate?'err':''}" id="coPlate" placeholder="e.g. BN 4521" value="${esc(CO.plate)}" maxlength="12"></label>
      ${CO.err.plate ? '<p class="err-msg">Enter your plate number so the barista can find your car.</p>' : ''}
      <label class="field"><span>Car colour &amp; model <em>(Optional)</em></span><input class="inp" id="coCar" placeholder="e.g. White Toyota Noah" value="${esc(CO.car)}"></label></div>` : ''}
    <div class="blk"><h3>Note <span style="font-weight:400;color:var(--muted);font-size:14px">(Optional)</span></h3>
      <textarea class="ta" id="coNote" placeholder="e.g. Please call when it's ready" style="margin-top:10px">${esc(CO.note)}</textarea></div>
    <div class="blk"><h3>Payment</h3><p class="hint">Choose your payment method</p>
      <button class="paysel" data-act="coPick">${CO.method ? pmLogo(CO.method) : `<span class="pm-logo" style="background:var(--milk);color:var(--green)">${I.wallet.replace('<svg','<svg width="18" height="18"')}</span>`}<span class="pl ${CO.method?'':'ph'}">${CO.method ? PMS[CO.method].name : 'Select payment method'}</span><svg class="ch" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="m6 9 6 6 6-6"/></svg></button>
      ${CO.method ? `<button class="total-btn" data-act="coReveal"><span style="color:inherit;font-size:17px;font-weight:700">Total ${money(T.total)}</span><span>${CO.revealed ? 'Confirmed' : 'Tap to confirm'} ›</span></button>` : ''}
      ${CO.method && CO.revealed ? (CO.method === 'stars'
        ? `<div class="payphone"><div class="row">${pmLogo('stars')}<div><b class="num">${starsNeed}★</b><div style="font-size:12px;color:var(--muted)">will be taken from your ${spare}★</div></div></div><p>Stars left after paying: <b class="num">${spare - starsNeed}★</b></p></div>`
        : `<div class="payphone"><div class="row">${pmLogo(CO.method)}<div style="flex:1;min-width:0"><div style="font-size:12px;color:var(--muted)">Paying from your ${PMS[CO.method].name} number</div><input class="inp ${CO.err.phone?'err':''}" id="coPhone" inputmode="tel" value="${esc(CO.phone)}" style="margin-top:6px;font-weight:600;font-size:17px" aria-label="Payment phone number"></div></div>
          ${CO.err.phone ? '<p class="err-msg">Enter a valid Somali mobile number, e.g. +252 61 234 5678.</p>' : ''}
          <p>Filled in from your profile. You'll get a request on this number to approve ${money(T.total)}.</p></div>`) : ''}
    </div>
    <div class="co-sum num">
      ${S.cart.map(c => `<div class="it"><span>${c.qty}× ${esc(c.name)}</span><span>${money(c.unit*c.qty)}</span></div>`).join('')}
      <div style="border-top:1px dashed var(--line);margin:8px 0"></div>
      <div class="it"><span>Subtotal</span><span>${money(T.sub)}</span></div>
      ${T.disc ? `<div class="it" style="color:var(--gold)"><span>Stars (${T.used}★)</span><span>−${money(T.disc)}</span></div>` : ''}
      <div class="it"><span>Tax (5%)</span><span>${money(T.tax)}</span></div>
      ${T.fee ? `<div class="it"><span>Delivery</span><span>${money(T.fee)}</span></div>` : ''}
      <div class="it" style="font-weight:700;font-size:16px;color:var(--green);margin-top:4px"><span>Total + Tax</span><span>${money(T.total)}</span></div>
      <div class="it" style="color:var(--gold);font-size:12px"><span>Stars you'll earn</span><span>+${CO.method === 'stars' ? 0 : Math.floor(T.total * EARN_PER_USD)}★</span></div>
    </div>`;
  const ready = CO.method && CO.revealed;
  $('#coFoot', el).innerHTML = `<button class="btn btn-gold btn-block" data-act="coPay" ${ready ? '' : 'disabled'}>Pay ${money(T.total)}</button>${ready ? '' : '<p style="text-align:center;font-size:12px;color:var(--muted);margin-top:8px">Choose a payment method and confirm the total to pay</p>'}`;
  const bind = (id, k, f = v => v) => { const i = $('#' + id, el); if (i) i.addEventListener('input', e => { CO[k] = f(e.target.value); }); };
  bind('coFloor','floor'); bind('coDoor','door'); const pl = $('#coPlate', el); if (pl) pl.addEventListener('input', e => { const p = e.target.selectionStart; e.target.value = e.target.value.toUpperCase(); e.target.setSelectionRange(p, p); CO.plate = e.target.value; }); bind('coCar','car'); bind('coNote','note'); bind('coPhone','phone');
  const b = $('#coBuilding', el); if (b) b.addEventListener('change', e => CO.building = e.target.value);
}
function openPayPicker(){
  const T = coTotals(), need = Math.ceil(T.total / STAR_USD), spare = S.stars - T.used;
  const okStars = spare >= need;
  sheet('Payment method', `<div class="pms">
    ${['evc','edahab','premier','stars'].map(k => { const dis = k === 'stars' && !okStars; return `<button class="pm ${CO.method===k?'on':''} ${dis?'dis':''}" data-act="coSetPm" data-k="${k}">${pmLogo(k)}<span class="pt"><b>${PMS[k].name}</b><span>${k === 'stars' ? (okStars ? `Uses ${need}★ of your ${spare}★` : `Needs ${need}★ · you have ${spare}★`) : PMS[k].sub}</span></span><span class="radio"></span></button>`; }).join('')}</div>`);
}
const validPhone = v => /^(\+?252)?\s*0?6\d[\s-]?\d{3}[\s-]?\d{4}$/.test(v.replace(/\s+/g, ' ').trim()) || /^\+?\d[\d\s-]{7,15}$/.test(v.trim());
function doPay(){
  CO.err = {};
  if (CO.mode === 'car' && !CO.plate.trim()) CO.err.plate = 1;
  if (CO.method !== 'stars' && !validPhone(CO.phone || '')) CO.err.phone = 1;
  if (CO.err.plate || CO.err.phone){ renderCheckout(); toast('Check the highlighted fields'); return; }
  const T = coTotals();
  const pm = PMS[CO.method];
  const proc = sheet('', `<div class="proc"><div class="spinner"></div><h3>${CO.method === 'stars' ? 'Redeeming your Stars…' : 'Waiting for approval…'}</h3>
    <p>${CO.method === 'stars' ? 'Hold on while we apply your Stars.' : `We sent a ${money(T.total)} payment request to <b class="num">${esc(CO.phone)}</b>.<br>Approve it on your phone to finish.`}</p>
    ${CO.method !== 'stars' ? `<div class="ussd">${pm.name} · ${CO.method === 'premier' ? 'Open the Premier Wallet app' : 'Dial ' + pm.ussd}</div>` : ''}
    <p style="font-size:12px;margin-top:14px">Test mode: no real money is moved.</p></div>`, '', { noHead:true });
  proc.querySelector('.ov-bg').removeAttribute('data-act');
  setTimeout(() => finishOrder(T, proc), 2300);
}
function finishOrder(T, proc){
  const id = 'SC-' + (4200 + Math.floor(Math.random() * 5700));
  const starsPaid = CO.method === 'stars' ? Math.ceil(T.total / STAR_USD) : 0;
  const earned = CO.method === 'stars' ? 0 : Math.floor(T.total * EARN_PER_USD);
  const modeName = { store:'Store Pickup', car:'Car Pickup', delivery:'Nearby Delivery' }[CO.mode];
  const where = CO.mode === 'car' ? `Car ${CO.plate}${CO.car ? ' · ' + CO.car : ''}` : CO.mode === 'delivery' ? `${CO.building}${CO.floor ? ', Floor ' + CO.floor : ''}${CO.door ? ', Door ' + CO.door : ''}` : 'Dahab Tower counter';
  const order = { id, t:Date.now(), items:S.cart.map(c => ({ name:c.name, qty:c.qty, opts:c.opts, price:c.unit })), lines:S.cart.map(c => [c.pid, c.qty]), mode:modeName, where, time:CO.time, method:PMS[CO.method].name, total:T.total, starsUsed:T.used + starsPaid, status:'Preparing', note:CO.note };
  const now = Date.now();
  if (T.used) S.ledger.unshift({ id:uid(), t:now, kind:'redeem', title:'Redeemed Stars', detail:`${T.used}★ applied · ${money(T.disc)} off order ${id}`, stars:-T.used });
  if (starsPaid) S.ledger.unshift({ id:uid(), t:now, kind:'pay', title:'Paid with Stars', detail:`Order ${id} · ${money(T.total)}`, stars:-starsPaid });
  if (earned) S.ledger.unshift({ id:uid(), t:now + 1, kind:'earn', title:'Order at Dahab Tower', detail:order.items.map(i => i.name + (i.qty > 1 ? ' ×' + i.qty : '')).join(', ') + ' · ' + money(T.total), stars:earned, usd:T.total });
  S.stars = S.stars - T.used - starsPaid + earned;
  S.orders.unshift(order);
  S.notes.unshift({ id:uid(), t:now, icon:'receipt', title:`Order ${id} received`, body:`${modeName} · ${CO.time}. Paid ${money(T.total)} with ${PMS[CO.method].name}.${earned ? ` You earned ${earned} Stars.` : ''}`, read:false });
  S.cart = []; S.useStars = 0;
  save();
  closeAll();
  setTimeout(() => {
    page('Order placed', `<div class="success"><div class="check">${I.check}</div><h2>Thank you, ${esc(S.user.name.split(' ')[0])}!</h2><p class="serif">A Better Journey in Every Cup</p>
      ${earned ? `<div class="earned">${I.star} You earned ${earned} Stars</div>` : ''}
      <div class="receipt num">
        <div class="rr"><span>Order</span><b>${id}</b></div>
        <div class="rr"><span>How</span><span>${modeName}</span></div>
        <div class="rr"><span>Where</span><span style="text-align:right">${esc(where)}</span></div>
        <div class="rr"><span>${CO.mode==='delivery'?'Delivery':'Pick up'} time</span><span>${CO.time}</span></div>
        <div class="rr"><span>Paid with</span><span>${PMS[CO.method].name}${CO.method !== 'stars' ? ' · ' + esc(CO.phone) : ''}</span></div>
        <div style="border-top:1px dashed var(--line);margin:8px 0"></div>
        ${order.items.map(i => `<div class="rr"><span>${i.qty}× ${esc(i.name)}</span><span>${money(i.price*i.qty)}</span></div>`).join('')}
        <div class="rr" style="font-weight:700;color:var(--green);font-size:16px"><span style="color:inherit">Total paid</span><span>${money(T.total)}</span></div>
      </div></div>`,
      `<div class="two"><button class="btn btn-line" data-act="goHome">Back to Home</button><button class="btn btn-green" data-act="myOrdersFromDone">My Orders</button></div>`);
    refreshAll();
  }, 340);
  setTimeout(() => {
    const o = S.orders.find(x => x.id === id); if (!o) return;
    o.status = 'Ready';
    S.notes.unshift({ id:uid(), t:Date.now(), icon:'cup', title:`Order ${id} is ready`, body: CO && CO.mode === 'delivery' ? 'Your rider is on the way to you.' : 'Your order is waiting for you. Enjoy it with pleasure!', read:false });
    save(); refreshBadges(); toast(`Order ${id} is ready`);
  }, 45000);
}
