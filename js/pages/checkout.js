/* Checkout: Store Pickup / Car Pickup / Nearby Delivery, pickup time, and payment.
   Totals always come from the server (quote_order). Mobile-money payments are sent by the customer
   to the café's number and confirmed by staff using the transaction ID ("payment check"). */
'use strict';

const PMS = {
  evc:{ name:'EVC Plus', cls:'pm-evc', short:'EVC+', sub:'Hormuud mobile money' },
  edahab:{ name:'eDahab', cls:'pm-edahab', short:'eDahab', sub:'Dahabshiil mobile wallet' },
  premier:{ name:'Premier Wallet', cls:'pm-premier', short:'PREMIER', sub:'Premier Bank wallet' },
  stars:{ name:'Stars', cls:'pm-stars', short:'', sub:'Pay with your Star balance' }
};
const pmLogo = k => `<span class="pm-logo ${PMS[k].cls}">${k === 'stars' ? I.star : PMS[k].short}</span>`;
const amtStr = n => String(Number((+n).toFixed(2)));
/* How to send money to the café for each wallet. */
function payGuide(k, total){
  if (k === 'evc') return { code:`*712*${SETTINGS.evc_number}*${amtStr(total)}#`, how:'Dial this on the phone with your EVC Plus account, then enter your PIN to approve.' };
  if (k === 'edahab') return { code:`*110*${SETTINGS.edahab_number}*${amtStr(total)}#`, how:'Dial this on the phone with your eDahab account, then enter your PIN to approve.' };
  return { code:SETTINGS.premier_number, how:`Open the Premier Wallet app → Send money → enter this number and ${money(total)}, then approve.` };
}
const payGuideHTML = (k, total) => { const g = payGuide(k, total); return `<p class="pg-how">${g.how}</p>
  <div class="dial"><code class="num" id="dialCode">${esc(g.code)}</code><button class="btn btn-sm btn-green" data-act="copyCode" data-code="${esc(g.code)}">Copy</button></div>`; };

let CO = null;
function orderPayload(){
  return {
    store_id:STORE.id, items:S.cart.map(c => ({ product_id:c.pid, qty:c.qty, sel:c.sel })),
    mode:CO.mode, pickup_time:CO.time, note:CO.note, plate:CO.plate, car:CO.car,
    building:CO.building, floor:CO.floor, door:CO.door, stars_used:totals().used,
    pay_method:CO.method, pay_phone:CO.phone, pay_ref:CO.ref
  };
}
function openCheckout(){
  if (!S.cart.length) return;
  if (!S.store) return needStore(openCheckout);
  const ad = S.user.address || {};
  CO = { mode:'store', time:'Now', note:'', plate:'', car:'', building:SETTINGS.buildings[0] || 'Dahab Tower', floor:ad.floor || '', door:ad.door || '',
         method:null, revealed:false, phone:S.user.phone, ref:'', err:{}, quote:null, qerr:null, busy:false };
  const el = page('Checkout', '', '<div id="coFoot"></div>');
  el._co = true;
  renderCheckout(el);
  requote();
}
async function requote(){
  CO.quote = null; CO.qerr = null; renderCheckout();
  try { CO.quote = await API.call('quote_order', { p:orderPayload() }); }
  catch (e) { CO.qerr = errText(e); }
  renderCheckout();
}
function renderCheckout(el){
  el = el || stack.find(e => e._co); if (!el || !CO) return;
  const Q = CO.quote, open = storeOpen();
  const timeLbl = CO.mode === 'delivery' ? 'Delivery time' : 'Pick up time';
  const spare = Q ? S.stars - Q.stars_used : 0;
  const bd = $('.page-bd', el);
  const keep = bd.scrollTop;
  bd.innerHTML = `
    <h1 class="co-title">How Would You Like Your Order</h1>
    <p class="co-sub">Choose your preferred way to receive</p>
    <div class="modes">
      <button class="mode ${CO.mode==='store'?'on':''}" data-act="coMode" data-m="store">${I.store}Store Pickup</button>
      <button class="mode ${CO.mode==='car'?'on':''}" data-act="coMode" data-m="car">${I.car}Car Pickup</button>
      <button class="mode ${CO.mode==='delivery'?'on':''}" data-act="coMode" data-m="delivery">${I.bike}Nearby Delivery</button>
    </div>
    ${open ? '' : `<div class="banner">${I.info}<span>${esc(STORE.name.split('· ')[1] || STORE.name)} is closed right now (open ${storeHours()}). Your order will be made when we open.</span></div>`}
    ${CO.mode === 'delivery' ? `<div class="blk"><h3>Delivery</h3><p class="hint">We deliver to buildings near Dahab Tower · ${money(SETTINGS.delivery_fee)} fee</p>
      <label class="field"><span>Building Name</span><select class="inp" id="coBuilding">${SETTINGS.buildings.map(b => `<option ${CO.building===b?'selected':''}>${esc(b)}</option>`).join('')}</select></label>
      <div class="two"><label class="field"><span>Floor Number <em>(Optional)</em></span><input class="inp" id="coFloor" placeholder="e.g. 2 or 2A" value="${esc(CO.floor)}" maxlength="6"></label>
      <label class="field"><span>Door Number <em>(Optional)</em></span><input class="inp" id="coDoor" placeholder="e.g. A1" value="${esc(CO.door)}" maxlength="8"></label></div></div>` : ''}
    <div class="blk"><h3>${timeLbl}</h3>
      <div class="times">${['Now','5-10 min','10-15 min','15-20 min'].map(t => `<button class="${CO.time===t?'on':''}" data-act="coTime" data-t="${t}">${t}</button>`).join('')}</div></div>
    ${CO.mode === 'car' ? `<div class="blk"><h3>Car Details</h3><p class="hint">We'll bring your order to your car outside Dahab Tower</p>
      <label class="field"><span style="font-size:12px;color:var(--muted)">Taargo / Plate no.</span><input class="inp ${CO.err.plate?'err':''}" id="coPlate" placeholder="e.g. BN 4521" value="${esc(CO.plate)}" maxlength="12"></label>
      ${CO.err.plate ? '<p class="err-msg">Enter your plate number so the barista can find your car.</p>' : ''}
      <label class="field"><span>Car colour &amp; model <em>(Optional)</em></span><input class="inp" id="coCar" placeholder="e.g. White Toyota Noah" value="${esc(CO.car)}" maxlength="40"></label></div>` : ''}
    <div class="blk"><h3>Note <span style="font-weight:400;color:var(--muted);font-size:14px">(Optional)</span></h3>
      <textarea class="ta" id="coNote" placeholder="e.g. Please call when it's ready" style="margin-top:10px" maxlength="200">${esc(CO.note)}</textarea></div>
    <div class="blk"><h3>Payment</h3><p class="hint">Choose your payment method</p>
      <button class="paysel" data-act="coPick" ${Q ? '' : 'disabled'}>${CO.method ? pmLogo(CO.method) : `<span class="pm-logo" style="background:var(--milk);color:var(--green)">${I.wallet.replace('<svg','<svg width="18" height="18"')}</span>`}<span class="pl ${CO.method?'':'ph'}">${CO.method ? PMS[CO.method].name : 'Select payment method'}</span><svg class="ch" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="m6 9 6 6 6-6"/></svg></button>
      ${CO.method && Q ? `<button class="total-btn" data-act="coReveal"><span style="color:inherit;font-size:17px;font-weight:700">Total ${money(Q.total)}</span><span>${CO.revealed ? 'Confirmed' : 'Tap to confirm'} ›</span></button>` : ''}
      ${CO.method && Q && CO.revealed ? (CO.method === 'stars'
        ? `<div class="payphone"><div class="row">${pmLogo('stars')}<div><b class="num">${Q.stars_needed}★</b><div style="font-size:12px;color:var(--muted)">will be taken from your ${spare}★</div></div></div><p>Stars left after paying: <b class="num">${spare - Q.stars_needed}★</b></p></div>`
        : `<div class="payguide">
            <div class="pg-step"><span class="n">1</span><div class="pg-b"><b>Send ${money(Q.total)} to SafarChat Café</b>${payGuideHTML(CO.method, Q.total)}</div></div>
            <div class="pg-step"><span class="n">2</span><div class="pg-b"><b>Number you paid from</b>
              <input class="inp ${CO.err.phone?'err':''}" id="coPhone" inputmode="tel" value="${esc(CO.phone)}" aria-label="Number you paid from">
              ${CO.err.phone ? '<p class="err-msg">Enter a valid Somali mobile number, e.g. 61 234 5678.</p>' : '<p class="pg-how">Filled in from your profile. Change it if you paid from another number.</p>'}</div></div>
            <div class="pg-step"><span class="n">3</span><div class="pg-b"><b>Transaction ID</b>
              <input class="inp ${CO.err.ref?'err':''}" id="coRef" value="${esc(CO.ref)}" placeholder="From your confirmation SMS" autocomplete="off" autocapitalize="characters" maxlength="40" aria-label="Transaction ID">
              ${CO.err.ref ? '<p class="err-msg">Enter the transaction ID from your payment SMS (letters and numbers).</p>' : '<p class="pg-how">The café checks this against the payment before making your order.</p>'}</div></div>
          </div>`) : ''}
    </div>
    <div class="co-sum num">
      ${CO.qerr ? `<div class="banner" style="margin:0">${I.info}<span>${esc(CO.qerr)} <button class="link" data-act="coRequote">Try again</button></span></div>`
      : !Q ? `<div style="display:flex;gap:10px;align-items:center;color:var(--muted)"><span class="spinner" style="width:20px;height:20px;border-width:3px;margin:0"></span>Getting your total…</div>`
      : `${Q.items.map(c => `<div class="it"><span>${c.qty}× ${esc(c.name)}</span><span>${money(c.unit*c.qty)}</span></div>`).join('')}
      <div style="border-top:1px dashed var(--line);margin:8px 0"></div>
      <div class="it"><span>Subtotal</span><span>${money(Q.subtotal)}</span></div>
      ${+Q.discount ? `<div class="it" style="color:var(--gold)"><span>Stars (${Q.stars_used}★)</span><span>−${money(Q.discount)}</span></div>` : ''}
      <div class="it"><span>Tax (5%)</span><span>${money(Q.tax)}</span></div>
      ${+Q.delivery_fee ? `<div class="it"><span>Delivery</span><span>${money(Q.delivery_fee)}</span></div>` : ''}
      <div class="it" style="font-weight:700;font-size:16px;color:var(--green);margin-top:4px"><span>Total + Tax</span><span>${money(Q.total)}</span></div>
      <div class="it" style="color:var(--gold);font-size:12px"><span>Stars you'll earn</span><span>+${CO.method === 'stars' ? 0 : Q.stars_to_earn}★</span></div>`}
    </div>`;
  bd.scrollTop = keep;
  const ready = Q && CO.method && CO.revealed && !CO.busy;
  const label = !Q ? 'Pay' : CO.method === 'stars' ? `Pay with ${Q.stars_needed}★` : `I've paid ${money(Q.total)} · Send order`;
  $('#coFoot', el).innerHTML = `<button class="btn btn-gold btn-block" data-act="coPay" ${ready ? '' : 'disabled'}>${CO.busy ? 'Sending…' : label}</button>${ready || CO.busy ? '' : '<p style="text-align:center;font-size:12px;color:var(--muted);margin-top:8px">Choose a payment method and confirm the total</p>'}`;
  const bind = (id, k) => { const i = $('#' + id, el); if (i) i.addEventListener('input', e => { CO[k] = e.target.value; }); };
  bind('coFloor','floor'); bind('coDoor','door'); bind('coCar','car'); bind('coNote','note'); bind('coPhone','phone');
  const up = (id, k) => { const i = $('#' + id, el); if (i) i.addEventListener('input', e => { const p = e.target.selectionStart; e.target.value = e.target.value.toUpperCase(); try { e.target.setSelectionRange(p, p); } catch (x) {} CO[k] = e.target.value; }); };
  up('coPlate', 'plate'); up('coRef', 'ref');
  const b = $('#coBuilding', el); if (b) b.addEventListener('change', e => CO.building = e.target.value);
}
function openPayPicker(){
  const Q = CO.quote; if (!Q) return;
  const need = Q.stars_needed, spare = S.stars - Q.stars_used, okStars = spare >= need;
  sheet('Payment method', `<div class="pms">
    ${['evc','edahab','premier','stars'].map(k => { const dis = k === 'stars' && !okStars; return `<button class="pm ${CO.method===k?'on':''} ${dis?'dis':''}" data-act="coSetPm" data-k="${k}">${pmLogo(k)}<span class="pt"><b>${PMS[k].name}</b><span>${k === 'stars' ? (okStars ? `Uses ${need}★ of your ${spare}★` : `Needs ${need}★ · you have ${spare}★`) : PMS[k].sub}</span></span><span class="radio"></span></button>`; }).join('')}</div>`);
}
async function doPay(){
  CO.err = {};
  if (CO.mode === 'car' && !/^[A-Z0-9][A-Z0-9 -]{1,11}$/.test(CO.plate.trim())) CO.err.plate = 1;
  if (CO.method !== 'stars'){
    if (!validPhone(CO.phone || '')) CO.err.phone = 1;
    if (!/^[A-Za-z0-9-]{4,40}$/.test((CO.ref || '').trim())) CO.err.ref = 1;
  }
  if (Object.keys(CO.err).length){ renderCheckout(); toast('Check the highlighted fields'); return; }
  CO.busy = true; renderCheckout();
  const p = Object.assign(orderPayload(), { expected_total:CO.quote.total, plate:CO.plate.trim(), pay_ref:(CO.ref || '').trim() });
  try {
    const o = await API.call('place_order', { p });
    S.cart = []; S.useStars = 0; save();
    await refreshState().catch(() => {});
    closeAll();
    setTimeout(() => showOrderPlaced(mapOrder(o)), 340);
    refreshAll();
  } catch (e) {
    CO.busy = false;
    if (/price_changed|too_many_stars|not_enough_stars/.test(e.message)){ toast(errText(e)); requote(); return; }
    renderCheckout(); toast(errText(e));
  }
}
function showOrderPlaced(o){
  const checking = o.statusKey === 'payment_review';
  const where = o.modeKey === 'car' ? `Car ${o.plate}${o.car ? ' · ' + o.car : ''}` : o.modeKey === 'delivery' ? `${o.building}${o.floor ? ', Floor ' + o.floor : ''}${o.door ? ', Door ' + o.door : ''}` : 'Dahab Tower counter';
  page('Order placed', `<div class="success"><div class="check">${I.check}</div><h2>Thank you, ${esc(S.user.name.split(' ')[0])}!</h2><p class="serif">A Better Journey in Every Cup</p>
    ${checking ? `<div class="earned" style="background:#F6EBD3">${I.clock} Checking your payment</div>
      <p style="color:var(--muted);margin-top:12px;line-height:1.5">The café is matching your transaction ID with the payment. You'll get a message as soon as it's confirmed, and then you'll earn your Stars.</p>`
      : `<div class="earned">${I.check} Paid with ${o.starsUsed}★ · we're preparing it</div>`}
    <div class="receipt num">
      <div class="rr"><span>Order</span><b>${o.id}</b></div>
      <div class="rr"><span>How</span><span>${o.mode}</span></div>
      <div class="rr"><span>Where</span><span style="text-align:right">${esc(where)}</span></div>
      <div class="rr"><span>${o.modeKey==='delivery'?'Delivery':'Pick up'} time</span><span>${o.time}</span></div>
      <div class="rr"><span>Payment</span><span>${o.method}${o.payRef ? ' · ' + esc(o.payRef) : ''}</span></div>
      <div style="border-top:1px dashed var(--line);margin:8px 0"></div>
      ${o.items.map(i => `<div class="rr"><span>${i.qty}× ${esc(i.name)}</span><span>${money(i.price*i.qty)}</span></div>`).join('')}
      <div class="rr" style="font-weight:700;color:var(--green);font-size:16px"><span style="color:inherit">Total</span><span>${money(o.total)}</span></div>
    </div></div>`,
    `<div class="two"><button class="btn btn-line" data-act="goHome">Back to Home</button><button class="btn btn-green" data-act="myOrdersFromDone">My Orders</button></div>`);
}
