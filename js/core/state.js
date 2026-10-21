/* App state loaded from the server for the signed-in person. The cart and chosen store are
   kept on the phone (per account) until the order is placed. */
'use strict';

let ME = null;      // signed-in account id
let S = null;       // signed-in account's data (see applyState)
let SETTINGS = { evc_number:'617475902', edahab_number:'627475902', premier_number:'00252617475902', delivery_fee:1, birthday_stars:50, buildings:['Dahab Tower'] };
let GIFT_CATALOG = [];
const ui = { tab:'home', otab:'featured', sub:{ drinks:'hotcoffee', food:'pastry' }, q:'', tiersOpen:false, ledgerN:10, adIdx:0 };

const MODE_NAME = { store:'Store Pickup', car:'Car Pickup', delivery:'Nearby Delivery' };
const PM_NAME = { evc:'EVC Plus', edahab:'eDahab', premier:'Premier Wallet', stars:'Stars' };
const ORDER_STATUS = {
  payment_review:['Checking payment', 'pill-gold'], paid:['Paid', 'pill-ok'], preparing:['Preparing', 'pill-gold'],
  ready:['Ready', 'pill-ok'], on_the_way:['On the way', 'pill-ok'], completed:['Completed', 'pill-grey'],
  rejected:['Payment not found', 'pill-bad'], cancelled:['Cancelled', 'pill-bad']
};
const GIFT_STATUS = { payment_review:['Checking payment', 'pill-gold'], sent:['Sent', 'pill-ok'], rejected:['Payment not found', 'pill-bad'], redeemed:['Redeemed', 'pill-grey'] };

function applyMenu(m){
  PRODUCTS.length = 0;
  for (const k of Object.keys(PBY)) delete PBY[k];
  m.products.forEach(p => {
    const x = { id:p.id, sub:p.sub, name:p.name, price:+p.price, desc:p.description, art:p.art, m:p.milk, n:p.is_new, sig:p.signature, kcal:p.kcal, available:p.available };
    PRODUCTS.push(x); PBY[x.id] = x;
  });
  const s = m.stores[0];
  if (s) Object.assign(STORE, { id:s.id, name:s.name, addr:s.address, phone:s.phone || STORE.phone, open:s.open_min, close:s.close_min, closed:s.closed_override });
  Object.assign(SETTINGS, m.settings || {});
  SETTINGS.delivery_fee = +SETTINGS.delivery_fee;
  GIFT_CATALOG = m.gift_catalog || [];
}

function mapOrder(o){
  return {
    id:o.code, dbId:o.id, t:Date.parse(o.created_at),
    items:o.items.map(i => ({ name:i.name, qty:i.qty, opts:i.opts, price:+i.unit, pid:i.product_id })),
    lines:o.items.map(i => [i.product_id, i.qty]),
    modeKey:o.mode, mode:MODE_NAME[o.mode], time:o.pickup_time, method:PM_NAME[o.pay_method], methodKey:o.pay_method,
    total:+o.total, starsUsed:o.stars_used + o.stars_paid, starsEarned:o.stars_earned,
    statusKey:o.status, status:(ORDER_STATUS[o.status] || [o.status])[0], note:o.status_note,
    plate:o.plate, car:o.car, building:o.building, floor:o.floor, door:o.door, payPhone:o.pay_phone, payRef:o.pay_ref
  };
}
function applyState(d){
  const p = d.profile;
  const local = S && S.id === p.id ? { cart:S.cart, useStars:S.useStars, store:S.store } : loadLocal(p.id);
  S = Object.assign({
    id:p.id, role:p.role, created:Date.parse(p.created_at),
    user:{ name:p.name, phone:fmtPhone(p.phone), email:p.email || '', gender:p.gender || '', dob:p.dob || '', photo:p.photo || '',
      address:Object.assign({ building:'', floor:'', door:'', country:'Somalia', region:'', district:'' }, p.address || {}) },
    stars:p.stars,
    ledger:d.ledger.map(l => ({ id:l.id, t:Date.parse(l.created_at), kind:l.kind, title:l.title, detail:l.detail, stars:l.stars, usd:l.usd == null ? null : +l.usd })),
    orders:d.orders.map(mapOrder),
    notes:d.notes.map(n => ({ id:n.id, t:Date.parse(n.created_at), icon:n.icon, title:n.title, body:n.body, read:n.read })),
    gifts:d.gifts.map(g => ({ id:g.id, code:g.code, t:Date.parse(g.created_at), cat:g.cat, item:g.item, amt:+g.amount, to:g.to_name, phone:fmtPhone(g.to_phone), statusKey:g.status })),
    favs:d.favs
  }, local);
  ME = p.id;
}

/* Cart, Stars-to-use and store choice stay on this phone until checkout. */
function loadLocal(id){
  let v = null;
  try { v = JSON.parse(localStorage.getItem('safarchat.cart.' + id)); } catch (e) {}
  v = v && Array.isArray(v.cart) ? v : { cart:[], useStars:0, store:null };
  v.cart = v.cart.filter(c => PBY[c.pid]).map(c => Object.assign(c, { unit:unitPrice(PBY[c.pid], c.sel), name:PBY[c.pid].name }));
  return v;
}
function save(){
  if (!S) return;
  try { localStorage.setItem('safarchat.cart.' + S.id, JSON.stringify({ cart:S.cart, useStars:S.useStars, store:S.store })); } catch (e) {}
}

/* Reload everything for the signed-in person (after any change, and on live updates). */
let refreshing = null;
async function refreshState(quiet){
  if (refreshing) return refreshing;
  refreshing = (async () => {
    const before = S ? S.notes.filter(n => !n.read).map(n => n.id) : [];
    const d = await API.call('get_my_state');
    applyState(d);
    const fresh = S.notes.filter(n => !n.read && !before.includes(n.id));
    if (quiet && fresh.length) toast(fresh[0].title);
    if (quiet){
      const typing = document.activeElement && /INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName) && $('#app .screens').contains(document.activeElement);
      if (!typing) R[ui.tab]();
      refreshBadges();
      const mo = stack.find(e => e._orders); if (mo) renderMyOrders(mo);
    }
  })();
  try { await refreshing; } finally { refreshing = null; }
}

/* Live updates: new messages (order confirmed, ready, Stars received…) refresh the app. */
let liveCh = null, pollT = null;
function startLive(){
  stopLive();
  liveCh = API.listen('notifications', 'user_id=eq.' + ME, () => refreshState(true).catch(() => {}));
  pollT = setInterval(() => { if (S && document.visibilityState === 'visible') refreshState(true).catch(() => {}); }, 30000);
}
function stopLive(){ API.unlisten(liveCh); liveCh = null; clearInterval(pollT); }
document.addEventListener('visibilitychange', () => { if (S && document.visibilityState === 'visible') refreshState(true).catch(() => {}); });
