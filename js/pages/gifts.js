/* Gifts tab: occasions, gift cards/bundles/boxes and the send-a-gift form. */
'use strict';

function gcard(cat, amt, big = false){
  return `<div class="gcard ${big?'lg':''}" style="background:${cat.bg}"><div class="gtop"><span>SafarChat Café</span><svg viewBox="0 0 100 100"><use href="#seal"/></svg></div>
    <div class="gmsg">${esc(cat.msg)}</div><div class="gamt num">${amt != null ? money(amt) : ''}</div></div>`;
}
function R_gifts(){
  const el = $('#s-gifts');
  el.innerHTML = `<div class="shd gut"><div class="shd-row"><h1>Gifts</h1>${topBtns()}</div><p style="color:var(--muted);margin-top:4px">Send a treat to someone special. They redeem it at Dahab Tower.</p></div>
  <div class="gut">
    <div class="gcats" style="margin-top:8px">${GCATS.map(c => `<button class="gcat" style="background:${c.bg}" data-act="gcat" data-k="${c.k}"><span class="gi" style="display:block;width:38px;height:38px">${I[c.ic]}</span><span><b>${c.name}</b><span>From ${money(c.from)}</span></span></button>`).join('')}</div>
    <div class="sec"><div class="sec-hd"><h2>Payment methods</h2></div>
      <div class="pms">${['evc','edahab','premier'].map(k => `<div class="pm" style="pointer-events:none">${pmLogo(k)}<span class="pt"><b>${PMS[k].name}</b><span>${PMS[k].sub}</span></span><span class="pill pill-ok">Accepted</span></div>`).join('')}</div></div>
    <div class="sec"><div class="sec-hd"><h2>Gifts you've sent</h2></div>
      ${S.gifts.length ? S.gifts.map(g => { const c = GCATS.find(x => x.k === g.cat) || GCATS[0], st = GIFT_STATUS[g.statusKey] || ['', 'pill-grey']; return `<div class="sent"><div class="sw">${gcard(c)}</div><div class="t"><b>${esc(g.item)} · ${money(g.amt)}</b><span>To ${esc(g.to)} · ${esc(g.phone)} · ${fmtDate(g.t)}${g.statusKey === 'sent' || g.statusKey === 'redeemed' ? ' · Code ' + esc(g.code) : ''}</span></div><span class="pill ${st[1]}">${st[0]}</span></div>`; }).join('') : `<div class="empty" style="background:var(--card);border:1px solid var(--line);border-radius:16px">No gifts sent yet. Pick an occasion above to send your first one.</div>`}
    </div>
  </div>`;
}
function openGiftCat(k, sub = 'cards'){
  const cat = GCATS.find(c => c.k === k);
  const el = page(cat.name, '');
  el._gift = { k, sub };
  renderGiftCat(el);
}
function renderGiftCat(el){
  const { k, sub } = el._gift, cat = GCATS.find(c => c.k === k), data = GITEMS[k];
  const diffs = { cards:'eGift Cards carry a money balance. Your friend chooses anything on the menu and pays with the card.', bundles:'Treat Bundles are a fixed set of drinks and bites, ready to collect at Dahab Tower.', boxes:'Gift Boxes are packed take-home presents: beans, spices, sweets and mugs.' };
  let items = '';
  if (sub === 'cards') items = [5,10,25,50].map(a => `<button class="gitem" data-act="gpick" data-type="card" data-amt="${a}"><div class="gw">${gcard(cat, a)}</div><div class="gb"><b>${cat.name} eGift</b><p>Spend on anything</p><span class="gp num">${money(a)}</span></div></button>`).join('');
  else items = (data[sub] || []).map(([n, d, p], i) => [n, d, giftPrice(k, sub, n, p), i]).map(([n, d, p, i]) => `<button class="gitem" data-act="gpick" data-type="${sub}" data-i="${i}"><div class="gw">${gcard(cat)}</div><div class="gb"><b>${esc(n)}</b><p>${esc(d)}</p><span class="gp num">${money(p)}</span></div></button>`).join('');
  $('.page-bd', el).innerHTML = `${gcard(cat, null, true)}
    <div class="gsubs" style="margin-top:16px">${GSUBS.map(([s, l]) => `<button class="chip ${s===sub?'on':''}" data-act="gsub" data-s="${s}">${l}</button>`).join('')}</div>
    <div class="diff">${diffs[sub]}</div><div class="gi-list">${items}</div>`;
}
/* Prices come from the server catalog when available. */
function giftPrice(cat, sub, name, fallback){
  const g = GIFT_CATALOG.find(x => x.cat === cat && x.sub === sub && x.name === name);
  return g ? +g.price : fallback;
}
function openGiftCompose(cat, item, amt, isCard, kind){
  const G = { cat:cat.k, kind:isCard ? 'card' : kind, item, amt, pm:'evc', payPhone:S.user.phone, ref:'', busy:false };
  const el = sheet('Send a gift', `
    ${gcard(cat, amt, true)}
    <p style="margin-top:12px;font-weight:600">${esc(item)} <span class="num" style="color:var(--green)">· <span id="gAmt">${money(amt)}</span></span></p>
    ${isCard ? `<div class="amts">${[5,10,25,50].map(a => `<button class="${a===amt?'on':''}" data-act="gAmt" data-a="${a}">${money(a)}</button>`).join('')}</div>` : ''}
    <label class="field"><span>To (name)</span><input class="inp" id="gTo" placeholder="e.g. Ayaan" maxlength="40"></label>
    <label class="field"><span>Their phone number</span><input class="inp" id="gPhone" inputmode="tel" placeholder="e.g. 61 555 0101"></label>
    <label class="field"><span>Message <em>(Optional)</em></span><input class="inp" id="gMsg" value="${esc(cat.msg)}" maxlength="140"></label>
    <label class="field"><span>From</span><input class="inp" id="gFrom" value="${esc(S.user.name)}" maxlength="40"></label>
    <div class="field"><span>Pay with</span><div class="pmchips">${['evc','edahab','premier'].map(k => `<button class="pmchip ${k==='evc'?'on':''}" data-act="gPm" data-k="${k}">${pmLogo(k)}${PMS[k].name}</button>`).join('')}</div></div>
    <div class="payguide" style="margin-top:12px">
      <div class="pg-step"><span class="n">1</span><div class="pg-b"><b>Send <span class="js-gamt">${money(amt)}</span> to SafarChat Café</b><div id="gGuide">${payGuideHTML('evc', amt)}</div></div></div>
      <div class="pg-step"><span class="n">2</span><div class="pg-b"><b>Number you paid from</b><input class="inp" id="gPayPhone" inputmode="tel" value="${esc(S.user.phone)}" aria-label="Number you paid from"></div></div>
      <div class="pg-step"><span class="n">3</span><div class="pg-b"><b>Transaction ID</b><input class="inp" id="gRef" placeholder="From your confirmation SMS" autocomplete="off" autocapitalize="characters" maxlength="40" aria-label="Transaction ID"><p class="pg-how">We send the gift as soon as the café confirms your payment.</p></div></div>
    </div>
    <p class="err-msg" id="gErr" hidden></p>`,
    `<button class="btn btn-green btn-block" data-act="gSend">I've paid · Send Gift <span class="num" id="gBtnAmt">${money(amt)}</span></button>`, { pre:`<div class="eyebrow">${cat.name}</div>` });
  el._g = G;
}
function refreshGiftGuide(s){
  const G = s._g;
  $('#gGuide', s).innerHTML = payGuideHTML(G.pm, G.amt);
  $$('.js-gamt', s).forEach(e => e.textContent = money(G.amt));
}
