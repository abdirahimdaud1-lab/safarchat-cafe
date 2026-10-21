/* Home tab: greeting, Star balance with reward tiers, featured, ads slider, how-to-order, discover, "Made for You". */
'use strict';

const ADS = [
  { pid:'ic4', eye:'New arrival', title:'Saffron Iced Latte', sub:'Golden saffron, cold milk and a double shot.', bg:'linear-gradient(135deg,#B8862F,#8A6216)' },
  { pid:'mt3', eye:'New signature', title:'Camel Milk Matcha', sub:'Grassy matcha layered over cold camel milk.', bg:'linear-gradient(135deg,#1E5E3A,#0C361F)' },
  { pid:'fr5', eye:'Limited edition', title:'Cardamom Date Frappé', sub:'Medjool dates, cardamom and espresso, blended.', bg:'linear-gradient(135deg,#9A4A2C,#6B2F1A)' },
  { pid:'pa3', eye:'Breakfast', title:'Malawax & Shaah', sub:'Warm honey malawax with a cup of Shaah Cadays.', bg:'linear-gradient(135deg,#5C3D2C,#3A2318)' }
];
function starCardHTML(){
  const nt = nextTier(), prevT = [0,100,200,300,500,1000].filter(t => t <= S.stars).pop() || 0;
  const pct = Math.min(100, ((S.stars - prevT) / (nt - prevT)) * 100);
  const tiers = [
    [100,'Any handcrafted drink + pastry','e.g. Camel Milk Latte & Malawax'],
    [200,'Breakfast for two','2 drinks, 2 pastries'],
    [300,'A whole cake slice box','Any 6 cake slices'],
    [500,'Coffee lover gift box','Qaxwo beans 250g + SafarChat mug']
  ];
  return `<div class="stars-card">
    <div class="sc-row"><div><div class="eyebrow" style="color:var(--sand)">Star balance</div>
      <div class="sc-bal num" style="margin-top:8px">${I.star}<span>${S.stars}</span></div>
      <div class="sc-sub">Worth ${money(S.stars * STAR_USD)} · 100★ = $8.00</div></div>
      <button class="btn btn-milk btn-sm" data-act="tab" data-tab="rewards">Rewards</button></div>
    <div class="prog"><i style="width:${pct}%"></i></div>
    <div class="prog-l num"><span>${S.stars}★</span><span>${nt - S.stars}★ more for ${money(nt * STAR_USD)} off</span></div>
    <button class="tier-tog" data-act="tiers" aria-expanded="${ui.tiersOpen}">What can my Stars get? ${I.chevD}</button>
    <div class="tiers" ${ui.tiersOpen ? '' : 'hidden'}>
      ${tiers.map(([s, t, e]) => { const ok = S.stars >= s; return `<div class="tier ${ok?'ok':''}"><div class="tier-st num">${s}<small>STARS</small></div>
        <div><b>${t}</b><p>${e}</p><p>${ok ? '<span class="pill pill-gold">Available now</span>' : `<span class="pill pill-grey">${s - S.stars}★ more</span>`}</p></div>
        <div class="tier-v num">${money(s * STAR_USD)}<br><small style="font-weight:400;font-size:11px;color:var(--muted)">off</small></div></div>`; }).join('')}
    </div></div>`;
}
function R_home(){
  const el = $('#s-home'); const d = new Date();
  const last = S.orders[0];
  el.innerHTML = `<div class="gut">
    <div class="home-top">
      <div class="greet"><h1><span class="js-greet">${greeting(d)}</span>,<br>${esc(S.user.name.split(' ')[0] || 'friend')}</h1>
        <div class="loc">${I.pin}<span>${esc(place())}</span><span aria-hidden="true">·</span><span class="js-clock num">${d.toLocaleTimeString(undefined,{hour:'numeric',minute:'2-digit'})}</span></div></div>
      ${topBtns()}
    </div>
    ${starCardHTML()}

    <div class="sec"><div class="sec-hd"><h2>Featured</h2><button class="link" data-act="tab" data-tab="order">Full menu</button></div>
      <div class="hscroll">
        <button class="menu-card" data-act="tab" data-tab="order"><div><h3>MENU</h3><p class="serif" style="font-size:15px;color:var(--sand)">A Better Journey in Every Cup</p><p>${PRODUCTS.length} drinks &amp; bites</p></div><span class="arrow">${I.arrowR}</span></button>
        ${FEATURED.map(id => { const p = PBY[id]; return `<button class="feat-card" data-act="prodOrder" data-id="${id}"><div class="fa">${art(p.art)}</div><div class="fb"><b>${esc(p.name)}</b><span class="num">${money(p.price)}</span></div></button>`; }).join('')}
      </div>
      <div class="svc">
        <button data-act="startMode" data-mode="store">${I.store}Store Pickup</button>
        <button data-act="startMode" data-mode="car">${I.car}Car Pickup</button>
        <button data-act="startMode" data-mode="delivery">${I.bike}Nearby Delivery</button>
      </div>
    </div>

    ${last ? `<div class="sec"><div class="sec-hd"><h2>Order again</h2><button class="link" data-act="myOrders">My orders</button></div>
      <div class="reorder"><div class="ra">${art(PBY[last.lines[0][0]].art)}</div><div class="t"><b>${esc(last.items.map(i => i.name).join(', '))}</b><span>${fmtDate(last.t)} · ${money(last.total)}</span></div><button class="btn btn-green btn-sm" data-act="reorder" data-id="${last.id}">Reorder</button></div></div>` : ''}

    <div class="sec ads"><div class="ad-track" id="adTrack">
      ${ADS.map(a => `<div class="ad" style="background:${a.bg}"><div><div class="eyebrow">${a.eye}</div><h3>${a.title}</h3><p>${a.sub}</p><button class="btn btn-milk" data-act="prodOrder" data-id="${a.pid}">Order Now</button></div><div class="ad-art">${art(PBY[a.pid].art)}</div></div>`).join('')}
    </div><div class="ad-dots" id="adDots">${ADS.map((_, i) => `<i class="${i===0?'on':''}"></i>`).join('')}</div></div>

    <div class="sec"><div class="sec-hd"><h2>How to order</h2></div>
      <div class="steps">
        <div class="step"><span class="n">1</span><div class="si">${I.phone}</div><b>Place your order</b><p>Pick drinks &amp; bites in the app</p></div>
        <div class="step"><span class="n">2</span><div class="si">${I.bag}</div><b>Pick up your order</b><p>In store, at your car or delivered</p></div>
        <div class="step"><span class="n">3</span><div class="si">${I.cup}</div><b>Enjoy it with pleasure</b><p>And collect Stars every time</p></div>
      </div></div>

    <div class="sec"><div class="discover">
      <div><div class="eyebrow">Discover</div><h3>Discover your new<span class="serif">Camel Milk Matcha</span></h3><p>Ceremonial matcha poured over cold, creamy camel milk. Light, earthy and very Somali.</p><button class="btn btn-green btn-sm" data-act="prodOrder" data-id="mt3">Try it · ${money(PBY.mt3.price)}</button></div>
      <div class="d-art">${art(PBY.mt3.art)}</div></div></div>
  </div>

  <div class="made">
    ${sceneSVG()}
    <div class="gut"><h2>Made for You</h2><p class="serif" style="font-size:20px;color:var(--sand);margin-top:4px">A Better Journey in Every Cup</p>
    <div class="rule">MOGADISHU</div><p class="slogan">SafarChat Café · Somali Tea &amp; Coffee House</p></div>
  </div>`;
  setupAds();
}

function sceneSVG(){
  const stripes = Array.from({ length:10 }, (_, i) => `<rect x="${i*40}" y="0" width="40" height="26" fill="${i%2?'#F5F0E6':'#0C361F'}"/><path d="M${i*40} 26 q10 10 20 0 q10 10 20 0z" fill="${i%2?'#F5F0E6':'#0C361F'}"/>`).join('');
  return `<svg class="scene" viewBox="0 0 400 280" role="img" aria-label="Illustration of a served table inside SafarChat Café">
  <rect width="400" height="280" fill="#EADCC2"/>
  <rect y="200" width="400" height="80" fill="#3A2318"/>
  <rect y="196" width="400" height="6" fill="#5C3D2C"/>
  <g transform="translate(26 44)"><path d="M0 150 V50 a46 46 0 0 1 92 0 V150z" fill="#0C361F"/><path d="M8 146 V52 a38 38 0 0 1 76 0 V146z" fill="#D9C4A0"/>
    <circle cx="62" cy="62" r="12" fill="#F3D27A" opacity=".9"/><path d="M8 120 Q30 104 46 112 T84 104 V146 H8z" fill="#C9A978"/>
    <path d="M30 146 V96 M30 96 q-14 -4 -18 4 M30 96 q-10 -12 -20 -8 M30 96 q8 -14 20 -10 M30 96 q14 -2 18 8 M30 96 q2 -14 -4 -20" stroke="#5C3D2C" stroke-width="2.5" fill="none" stroke-linecap="round"/>
    <path d="M46 0 V146 M8 90 H84" stroke="#0C361F" stroke-width="3"/></g>
  <g transform="translate(300 64)"><rect x="-8" y="-8" width="80" height="80" rx="6" fill="#5C3D2C"/><rect x="-3" y="-3" width="70" height="70" rx="3" fill="#F5F0E6"/><use href="#sealFull" x="2" y="2" width="60" height="60"/></g>
  ${stripes}
  <g stroke="#3A2318" stroke-width="1.5"><path d="M160 36 V70 M250 36 V58"/></g>
  <circle cx="160" cy="92" r="34" fill="#F3D27A" opacity=".18"/><circle cx="250" cy="80" r="28" fill="#F3D27A" opacity=".16"/>
  <path d="M146 70 h28 l8 16 h-44z" fill="#0C361F"/><ellipse cx="160" cy="87" rx="6" ry="3" fill="#FCE7A6"/>
  <path d="M238 58 h24 l7 14 h-38z" fill="#9A4A2C"/><ellipse cx="250" cy="73" rx="5" ry="2.6" fill="#FCE7A6"/>
  <ellipse cx="200" cy="206" rx="150" ry="16" fill="#2A170F" opacity=".5"/>
  <rect x="70" y="190" width="260" height="14" rx="7" fill="#5C3D2C"/>
  <rect x="80" y="186" width="240" height="8" rx="4" fill="#7A513B"/>
  <path d="M120 186 h160 l-10 8 h-140z" fill="#D9C4A0" opacity=".9"/>
  <rect x="190" y="204" width="20" height="70" fill="#4A2D20"/><rect x="150" y="268" width="100" height="8" rx="4" fill="#4A2D20"/>
  <g transform="translate(112 118) scale(.72)">${artHot('green').replace('class="art"','width="100" height="100"')}</g>
  <g transform="translate(176 138) scale(.5)">${artHot('brown').replace('class="art"','width="100" height="100"')}</g>
  <g transform="translate(222 128) scale(.68)">${artFood('malawax').replace('class="art"','width="100" height="100"')}</g>
  <g transform="translate(276 150) scale(.42)">${artFood('croissant').replace('class="art"','width="100" height="100"')}</g>
  <g transform="translate(92 160)"><path d="M6 26 h14 l-2 -24 h-10z" fill="#F5F0E6" stroke="#D9C4A0"/><path d="M13 4 q-10 -14 -8 -26 M13 4 q6 -16 14 -22 M13 4 q-2 -18 2 -28" stroke="#1E5E3A" stroke-width="2" fill="none"/><circle cx="5" cy="-22" r="4" fill="#B8862F"/><circle cx="27" cy="-18" r="4" fill="#9A4A2C"/><circle cx="15" cy="-24" r="4" fill="#F5F0E6"/></g>
  </svg>`;
}
let adTimer;
function setupAds(){
  const tr = $('#adTrack'); if (!tr) return;
  const dots = $$('#adDots i');
  const sync = () => { const i = Math.round(tr.scrollLeft / tr.clientWidth); ui.adIdx = i; dots.forEach((d, k) => d.classList.toggle('on', k === i)); };
  tr.addEventListener('scroll', () => { clearTimeout(tr._s); tr._s = setTimeout(sync, 60); }, { passive:true });
  let paused = false;
  tr.addEventListener('touchstart', () => paused = true, { passive:true });
  tr.addEventListener('touchend', () => setTimeout(() => paused = false, 4000), { passive:true });
  clearInterval(adTimer);
  adTimer = setInterval(() => {
    if (paused || ui.tab !== 'home' || stack.length || !document.body.contains(tr)) return;
    const n = (ui.adIdx + 1) % ADS.length;
    tr.scrollTo({ left:n * tr.clientWidth, behavior:'smooth' });
  }, 4200);
}
