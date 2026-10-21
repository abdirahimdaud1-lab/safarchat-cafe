/* Bottom tab bar (Home, Rewards, Order, Gifts, Account) and the header cart/bell buttons. */
'use strict';

function renderTabbar(){
  const T = [['home','Home',I.home],['rewards','Rewards',I.starO],['order','Order',''],['gifts','Gifts',I.gift],['account','Account',I.user]];
  $('#tabbar').innerHTML = T.map(([k, l, ic]) => k === 'order'
    ? `<button class="tab tab-order ${ui.tab===k?'on':''}" data-act="tab" data-tab="order" aria-label="Order"><span class="orb"><svg viewBox="0 0 100 100"><use href="#sealFull"/></svg></span><span>Order</span></button>`
    : `<button class="tab ${ui.tab===k?'on':''}" data-act="tab" data-tab="${k}"><span class="ti">${k==='rewards' && ui.tab==='rewards' ? I.star : ic}</span><span>${l}</span></button>`).join('');
}
function go(tab){
  ui.tab = tab;
  $$('.screen').forEach(s => s.hidden = s.id !== 's-' + tab);
  renderTabbar();
  R[tab]();
  $('#s-' + tab).scrollTop = 0;
}
function topBtns(){
  const unread = S.notes.filter(n => !n.read).length;
  return `<div class="top-actions">
    <button class="icon-btn" data-act="cart" aria-label="Cart, ${cartCount()} items">${I.suitcase}<span class="badge js-cc" data-n="${cartCount()}">${cartCount()}</span></button>
    <button class="icon-btn" data-act="bell" aria-label="Notifications">${I.bell}${unread ? '<span class="dot js-dot"></span>' : ''}</button></div>`;
}
function refreshBadges(){
  $$('.js-cc').forEach(b => { b.textContent = cartCount(); b.dataset.n = cartCount(); });
  const unread = S.notes.filter(n => !n.read).length;
  $$('[data-act="bell"]').forEach(b => { const d = b.querySelector('.dot'); if (unread && !d) b.insertAdjacentHTML('beforeend','<span class="dot"></span>'); if (!unread && d) d.remove(); });
  const bar = $('#cartBar'); if (bar) renderCartBar();
}
