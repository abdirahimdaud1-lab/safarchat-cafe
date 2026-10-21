/* Cart (suitcase): quantities, delete, Stars, subtotal, tax and checkout button. */
'use strict';

function openCart(){
  const el = sheet('Your Order', '', '', { pre:`<div class="eyebrow">${S.store ? 'Dahab Tower · Mogadishu' : 'No store selected'}</div>` });
  el._cart = true;
  renderCart(el);
}
function renderCart(el){
  const bd = $('.sh-bd', el);
  let ft = $('.sh-ft', el);
  if (!S.cart.length){
    bd.innerHTML = `<div class="empty" style="padding:40px 12px"><div style="width:72px;height:72px;margin:0 auto 14px;color:var(--sand)">${I.suitcase}</div><b style="color:var(--brown);font-size:17px">Your suitcase is empty</b><p style="margin-top:6px">Pack it with something good for the road.</p><button class="btn btn-green" style="margin-top:18px" data-act="startOrder">Start an order</button></div>`;
    if (ft) ft.remove(); return;
  }
  const T = totals();
  const canStars = S.stars >= 100;
  const maxU = maxStarsUsable();
  bd.innerHTML = `${S.cart.map((c, i) => `<div class="ci"><button class="ca" data-act="editItem" data-i="${i}" aria-label="Edit ${esc(c.name)}">${art(PBY[c.pid].art)}</button><div>
      <div class="cr"><b>${esc(c.name)}</b><span class="cp num">${money(c.unit * c.qty)}</span></div>
      <div class="co">${esc(c.opts)}</div>
      <div class="cc"><div class="stepper"><button data-act="cq" data-i="${i}" data-d="-1" aria-label="Reduce">${I.minus}</button><span class="v num">${c.qty}</span><button data-act="cq" data-i="${i}" data-d="1" aria-label="Add">${I.plus}</button></div>
      <button class="del" data-act="cdel" data-i="${i}">${I.trash} Delete</button></div></div></div>`).join('')}
    <div style="display:flex;justify-content:space-between;margin-top:10px"><button class="link" data-act="startOrder">+ Add more items</button><button class="del" data-act="cclear">${I.trash} Delete all</button></div>
    <div class="starbox ${canStars ? 'gold' : 'grey'}">
      <div class="sbh">${I.star}<div style="flex:1"><b>Rewards: ${S.stars} Stars available</b><p>${canStars ? `Worth ${money(S.stars * STAR_USD)} · use in 100★ steps ($8.00 each)` : `You need ${100 - S.stars} more Stars to unlock $8.00 off`}</p></div></div>
      ${canStars ? `<div class="steprow" style="background:rgba(255,255,255,.6)"><div><b class="num">Use ${T.used}★</b><small class="num">${T.used ? '−' + money(T.disc) : maxU ? 'Tap + to apply' : 'Add more to your order to use Stars'}</small></div>
        <div class="stepper"><button data-act="ustar" data-d="-100" class="${T.used<=0?'dis':''}" aria-label="Use fewer Stars">${I.minus}</button><button data-act="ustar" data-d="100" class="${T.used>=maxU?'dis':''}" aria-label="Use more Stars">${I.plus}</button></div></div>` : ''}
    </div>
    <div class="sum num">
      <div><span>Subtotal</span><span>${money(T.sub)}</span></div>
      ${T.disc ? `<div class="disc"><span>Stars (${T.used}★)</span><span>−${money(T.disc)}</span></div>` : ''}
      <div><span>Tax (5%)</span><span>${money(T.tax)}</span></div>
      <div class="tot"><span>Total + Tax</span><span>${money(T.total)}</span></div>
    </div>`;
  const fh = `<button class="btn btn-green btn-block" data-act="checkout">Checkout · ${money(T.total)} USD</button>`;
  if (!ft){ el.querySelector('.sheet').insertAdjacentHTML('beforeend', `<div class="sh-ft gut">${fh}</div>`); }
  else ft.innerHTML = fh;
}
const cartEl = () => stack.find(e => e._cart);
