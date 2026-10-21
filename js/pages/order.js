/* Order tab: store selection, search, Featured / Drinks / Food menus. */
'use strict';

function R_order(){
  const el = $('#s-order');
  const open = storeOpen();
  el.innerHTML = `<div class="shd gut">
    <div class="shd-row"><h1>Order</h1>${topBtns()}</div>
    <div style="margin-top:10px">${S.store
      ? `<button class="store-sel" data-act="pickStore"><span class="sa" style="width:40px;height:40px">${seal()}</span><span class="sl"><b>${esc(STORE.name)}</b><span><span style="color:${open?'var(--ok)':'var(--bad)'};font-weight:600">${open?'Open Now':'Closed'}</span> · 6:30 AM – 11:30 PM</span></span><span class="chg">Change</span></button>`
      : `<button class="store-first" data-act="pickStore"><span class="sfi">${I.store}</span><span><b>Select a Store First</b><span>For item availability and pickup</span></span><span class="chev" style="width:20px;height:20px">${I.chevR}</span></button>`}</div>
    <label class="search">${I.search}<input id="q" type="text" enterkeyhint="search" placeholder="Search drinks, food…" value="${esc(ui.q)}" autocomplete="off" aria-label="Search menu"><button class="clear" data-act="clearQ" aria-label="Clear search" ${ui.q ? '' : 'hidden'}>${I.x}</button></label>
    <div class="otabs" role="tablist">${[['featured','Featured'],['drinks','Drinks'],['food','Food']].map(([k, l]) => `<button class="otab ${ui.otab===k && !ui.q?'on':''}" data-act="otab" data-k="${k}" role="tab">${l}</button>`).join('')}</div>
    <div class="subs" id="subs"></div>
  </div>
  <div class="gut"><div id="menuList"></div><div id="cartBarWrap"></div></div>`;
  $('#q').addEventListener('input', e => { ui.q = e.target.value; $('.clear', el).hidden = !ui.q; $$('.otab', el).forEach(b => b.classList.toggle('on', !ui.q && b.dataset.k === ui.otab)); renderMenu(); });
  renderMenu();
}
function pcard(p){
  const tag = p.n ? '<span class="pill pill-gold tag">NEW</span>' : p.sig ? '<span class="pill pill-green tag">SIGNATURE</span>' : '';
  return `<div class="pc"><button data-act="prod" data-id="${p.id}" style="text-align:left;display:flex;flex-direction:column;flex:1" aria-label="${esc(p.name)}">${tag}<div class="pa" style="width:100%">${art(p.art)}</div>
    <div class="pb" style="width:100%"><b>${esc(p.name)}</b><span class="kc">${p.kcal} kcal</span></div></button>
    <div class="pr" style="padding:0 12px 12px"><span class="price num">${money(p.price)}</span><button class="add" data-act="quick" data-id="${p.id}" aria-label="Add ${esc(p.name)}">${I.plus}</button></div></div>`;
}
function renderMenu(){
  const list = $('#menuList'), subs = $('#subs'); if (!list) return;
  if (ui.q.trim()){
    subs.innerHTML = '';
    const q = ui.q.trim().toLowerCase();
    const res = PRODUCTS.filter(p => (p.name + ' ' + p.desc + ' ' + SUBNAME[p.sub]).toLowerCase().includes(q));
    list.innerHTML = `<h3 class="list-title">Results<small>${res.length} for “${esc(ui.q)}”</small></h3>${res.length ? `<div class="grid">${res.map(pcard).join('')}</div>` : `<div class="empty">Nothing matches “${esc(ui.q)}”. Try “shaah”, “latte” or “cake”.</div>`}`;
  } else if (ui.otab === 'featured'){
    subs.innerHTML = '';
    const favs = S.favs.map(id => PBY[id]).filter(Boolean);
    list.innerHTML = `<div style="margin-top:16px"><button class="feat-hero" data-act="prod" data-id="ic4"><div><div class="eyebrow" style="color:#fff;opacity:.85">New this season</div><h3>Saffron Iced Latte</h3><p>Golden saffron, cold milk and a double shot.</p><span class="btn btn-milk btn-sm" style="margin-top:12px">Order · ${money(4)}</span></div><div class="fh-art">${art(PBY.ic4.art)}</div></button></div>
      ${favs.length ? `<h3 class="list-title">Your favourites</h3><div class="grid">${favs.map(pcard).join('')}</div>` : ''}
      <h3 class="list-title">Featured</h3><div class="grid">${FEATURED.map(id => pcard(PBY[id])).join('')}</div>
      <h3 class="list-title">Somali classics</h3><div class="grid">${['hc1','ht2','ht3','pa4','pa8','pa5'].map(id => pcard(PBY[id])).join('')}</div>`;
  } else {
    const cur = ui.sub[ui.otab];
    subs.innerHTML = `<div class="hscroll">${SUBS[ui.otab].map(([k, l]) => `<button class="chip ${k===cur?'on':''}" data-act="osub" data-k="${k}">${l}</button>`).join('')}</div>`;
    const items = PRODUCTS.filter(p => p.sub === cur);
    list.innerHTML = `<h3 class="list-title">${SUBNAME[cur]}<small>${items.length} items</small></h3><div class="grid">${items.map(pcard).join('')}</div>`;
  }
  renderCartBar();
}
function renderCartBar(){
  const w = $('#cartBarWrap'); if (!w) return;
  const n = cartCount();
  w.innerHTML = n ? `<button class="cart-bar" id="cartBar" data-act="cart"><span style="text-align:left"><b>${n} item${n>1?'s':''} in your order</b><br><span class="num">${money(cartSub())} before tax</span></span><span class="btn btn-gold btn-sm">View Order</span></button>` : '';
}
function openStorePicker(after){
  const open = storeOpen();
  const el = sheet('Choose a Store', `
    <button class="store ${S.store==='dahab'?'on':''}" data-act="setStore"><span class="sa">${seal()}</span><span>
      <b>${esc(STORE.name)}</b><p>${esc(STORE.addr)}</p>
      <span class="meta"><span class="pill ${open?'pill-ok':'pill-bad'}">${open?'● Open Now':'● Closed'}</span><span>${I.clock.replace('<svg','<svg width="14" height="14" style="vertical-align:-2px"')} 6:30 AM – 11:30 PM</span><span>${STORE.dist}</span></span>
      <span class="feats"><span class="pill pill-grey">Store Pickup</span><span class="pill pill-grey">Car Pickup</span><span class="pill pill-grey">Nearby Delivery</span></span>
    </span></button>
    <p class="foot-note">More SafarChat stores are coming soon.</p>`, '', { pre:'<div class="sp-small">For Item Availability</div>' });
  $('h2', el).className = 'sp-big';
  el._after = after;
}
