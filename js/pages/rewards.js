/* Rewards tab: Star balance, Redeem Stars, Share Stars, Star history with Load More. */
'use strict';

const LKIND = { earn:['plus', I.cup], bonus:['plus', I.sparkle], receive:['plus', I.gift], redeem:['minus', I.redeem], share:['minus', I.share], pay:['minus', I.wallet] };
function R_rewards(){
  const el = $('#s-rewards');
  const lvl = S.stars >= 500 ? 'Gold Traveller' : 'Green Traveller';
  const shown = S.ledger.slice(0, ui.ledgerN), left = S.ledger.length - shown.length;
  el.innerHTML = `<div class="shd gut"><div class="shd-row"><h1>Rewards</h1>${topBtns()}</div></div>
  <div class="gut">
    <div class="rw-hero"><div class="eyebrow">Stars left</div>
      <div class="big num">${I.star}${S.stars}</div>
      <div class="val">Worth <b>${money(S.stars * STAR_USD)}</b> at SafarChat Café</div>
      <div class="lvl"><span class="pill" style="background:rgba(245,240,230,.12);color:var(--gold-2)">${lvl}</span></div></div>
    <div class="rw-actions">
      <button class="btn btn-gold" data-act="redeem">${I.redeem.replace('<svg','<svg width="20" height="20"')}Redeem Stars</button>
      <button class="btn btn-line" data-act="shareStars">${I.share.replace('<svg','<svg width="20" height="20"')}Share Stars</button>
    </div>
    <div class="rw-how"><div><b>2★</b><span>per $1 spent</span></div><div><b>100★</b><span>= $8.00 off</span></div><div><b>+50★</b><span>birthday treat</span></div></div>
    <div class="sec"><div class="sec-hd"><h2>Star history</h2><span style="font-size:12px;color:var(--muted)">${S.ledger.length} statements</span></div>
      ${S.ledger.length ? '' : `<div class="empty" style="background:var(--card);border:1px solid var(--line);border-radius:16px"><div style="width:44px;height:44px;margin:0 auto 10px;color:var(--gold)">${I.star}</div><b style="color:var(--brown)">No Stars yet</b><p style="margin-top:6px">Your history starts with your first order. Every $1 you pay earns 2★.</p><button class="btn btn-green btn-sm" style="margin-top:14px" data-act="tab" data-tab="order">Start an order</button></div>`}
      <div class="ledger" ${S.ledger.length ? '' : 'hidden'}>${shown.map(l => { const [k, ic] = LKIND[l.kind] || LKIND.earn; return `<div class="lg"><div class="li ${k}">${ic}</div><div><b>${esc(l.title)}</b><p>${esc(l.detail)}</p><p>${fmtDT(l.t)}</p></div><div class="amt ${k}">${l.stars > 0 ? '+' : ''}${l.stars}★${l.usd ? `<small>${money(l.usd)}</small>` : ''}</div></div>`; }).join('')}</div>
      ${!S.ledger.length ? '' : left > 0 ? `<button class="btn btn-line btn-block more" data-act="more">Load More (${Math.min(10, left)} More)</button>` : `<p class="foot-note">You've reached the start of your Star history.</p>`}
    </div>
  </div>`;
}
function openRedeem(){
  const tiers = [100,200,300,500];
  const body = `<p style="color:var(--muted);line-height:1.5">Pick how many Stars to put toward your next order. Every 100★ takes $8.00 off. Stars are only deducted when you pay.</p>
    <div style="display:grid;gap:10px;margin-top:16px">${tiers.map(t => { const ok = S.stars >= t; return `<button class="pm ${ok?'':'dis'}" data-act="applyRedeem" data-n="${t}"><span class="pm-logo pm-stars">${I.star}</span><span class="pt"><b>${t} Stars</b><span>${money(t * STAR_USD)} off your order</span></span>${ok ? '<span class="pill pill-gold">Use</span>' : `<span class="pill pill-grey">${t - S.stars}★ short</span>`}</button>`; }).join('')}</div>`;
  sheet('Redeem Stars', body, '', { pre:`<div class="eyebrow">You have ${S.stars}★ · ${money(S.stars*STAR_USD)}</div>` });
}
function openShare(){
  const st = { amt:Math.min(50, S.stars) };
  const el = sheet('Share Stars', `
    <p style="color:var(--muted);line-height:1.5">Send Stars to another SafarChat app user. They arrive in their Rewards straight away.</p>
    <label class="field"><span>Recipient's phone number</span><input class="inp" id="shPhone" inputmode="tel" placeholder="e.g. +252 61 555 0101" autocomplete="off"></label>
    <label class="field"><span>Recipient's name <em>(Optional)</em></span><input class="inp" id="shName" placeholder="e.g. Ayaan"></label>
    <div class="field"><span>How many Stars?</span>
      <div class="steprow"><div><b class="num" id="shAmt">${st.amt}★</b><small id="shVal">Worth ${money(st.amt*STAR_USD)}</small></div>
      <div class="stepper"><button data-act="shStep" data-d="-10" aria-label="Fewer">${I.minus}</button><button data-act="shStep" data-d="10" aria-label="More">${I.plus}</button></div></div>
      <div class="amts" style="grid-template-columns:repeat(4,1fr)">${[10,25,50,100].map(n => `<button data-act="shSet" data-n="${n}" ${n > S.stars ? 'disabled style="opacity:.4"' : ''}>${n}★</button>`).join('')}</div></div>
    <label class="field"><span>Message <em>(Optional)</em></span><input class="inp" id="shMsg" placeholder="e.g. Shaah is on me!"></label>
    <div class="err-msg" id="shErr" hidden></div>`,
    `<button class="btn btn-gold btn-block" data-act="shSend" id="shBtn">Send ${st.amt}★</button>`);
  el._st = st;
}
