/* Account tab: profile, address, My Orders, QR code to receive Stars, notifications, help. */
'use strict';

const initials = n => (n || '?').trim().split(/\s+/).map(w => w[0]).slice(0, 2).join('').toUpperCase();
const avatar = () => `<span class="avatar">${S.user.photo ? `<img src="${S.user.photo}" alt="">` : esc(initials(S.user.name))}</span>`;
const qrText = () => `SAFARCHAT:STARS;NAME:${S.user.name.replace(/[^\x20-\x7E]/g, '')};TEL:${S.user.phone.replace(/\s/g, '')}`;
function qrSVG(text){
  try {
    if (!window.qrcode) throw 0;
    const q = window.qrcode(0, 'H'); q.addData(text); q.make();
    const n = q.getModuleCount(); let d = '';
    for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) if (q.isDark(r, c)) d += `M${c},${r}h1v1h-1z`;
    return `<svg class="qr" viewBox="0 0 ${n} ${n}" shape-rendering="crispEdges" role="img" aria-label="QR code to receive Stars"><path d="${d}" fill="#0C361F"/></svg>`;
  } catch (e) {
    return `<svg class="qr" viewBox="0 0 21 21"><rect width="21" height="21" fill="#F5F0E6"/><text x="10.5" y="11.5" font-size="2" text-anchor="middle" fill="#7A6758">QR loading…</text></svg>`;
  }
}
function R_account(){
  const el = $('#s-account');
  const u = S.user;
  el.innerHTML = `<div class="shd gut"><div class="shd-row"><h1>Account</h1>${topBtns()}</div></div>
  <div class="gut">
    <button class="prof-btn" data-act="profile">${avatar()}<span class="t"><b>${esc(u.name)}</b><span>${esc(u.email || 'Add your email')}</span><span>${esc(u.phone)}</span></span><svg class="ch" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 6 6 6-6 6"/></svg></button>
    <div class="sec" style="margin-top:16px"><div class="menu">
      <button class="mi" data-act="myOrders"><span class="mic">${I.receipt}</span><span class="t"><b>My Orders</b><span>${S.orders.length} orders · history &amp; reorder</span></span>${I.chevR.replace('<svg','<svg class="ch"')}</button>
    </div></div>
    <div class="sec" style="margin-top:16px"><button class="qr-card" data-act="qrFull" aria-label="Open QR code full screen">
      <div class="eyebrow">Scan to send me Stars</div>
      <div class="qr-box" style="margin-top:8px">${qrSVG(qrText())}<svg class="qr-logo" viewBox="0 0 100 100"><use href="#seal"/></svg></div>
      <b>${esc(u.name)}</b><span class="ph">${esc(u.phone)}</span><span class="tap">TAP TO OPEN FULL SCREEN</span></button></div>
    <div class="sec" style="margin-top:16px"><div class="menu">
      <button class="mi" data-act="profile" data-focus="address"><span class="mic">${I.map}</span><span class="t"><b>Address</b><span>${u.address.building ? esc([u.address.building, u.address.floor && 'Floor ' + u.address.floor, u.address.door && 'Door ' + u.address.door, u.address.district].filter(Boolean).join(', ')) : 'Add your address for delivery'}</span></span>${I.chevR.replace('<svg','<svg class="ch"')}</button>
      <button class="mi" data-act="tab" data-tab="rewards"><span class="mic">${I.starO}</span><span class="t"><b>Rewards &amp; Stars</b><span>${S.stars}★ · ${money(S.stars*STAR_USD)}</span></span>${I.chevR.replace('<svg','<svg class="ch"')}</button>
      <button class="mi" data-act="payMethods"><span class="mic">${I.wallet}</span><span class="t"><b>Payment methods</b><span>EVC Plus · eDahab · Premier Wallet</span></span>${I.chevR.replace('<svg','<svg class="ch"')}</button>
      <button class="mi" data-act="bell"><span class="mic">${I.bell}</span><span class="t"><b>Notifications</b><span>${S.notes.filter(n => !n.read).length} unread</span></span>${I.chevR.replace('<svg','<svg class="ch"')}</button>
      <button class="mi" data-act="help"><span class="mic">${I.help}</span><span class="t"><b>Help &amp; store info</b><span>Hours, contact, FAQs</span></span>${I.chevR.replace('<svg','<svg class="ch"')}</button>
      <button class="mi" data-act="signOutAsk"><span class="mic">${I.back}</span><span class="t"><b>Sign out</b><span>Signed in as ${esc(fmtPhone(DB.accounts[ME].phone))}</span></span>${I.chevR.replace('<svg','<svg class="ch"')}</button>
      <button class="mi" data-act="deleteAsk"><span class="mic" style="color:var(--bad)">${I.trash}</span><span class="t"><b style="color:var(--bad)">Delete account</b><span>Remove your account and all its history</span></span>${I.chevR.replace('<svg','<svg class="ch"')}</button>
    </div></div>
    <p class="foot-note">SafarChat Café · Mogadishu<br><span class="serif" style="font-size:15px">A Better Journey in Every Cup</span><br>Member since ${fmtDate(DB.accounts[ME].created)}<br>Test version 2.0 · payments are simulated</p>
  </div>`;
}
function openProfile(focus){
  const u = JSON.parse(JSON.stringify(S.user));
  const el = page('Profile', '', `<button class="btn btn-green btn-block" data-act="saveProfile">Save Changes</button>`);
  el._u = u;
  renderProfile(el);
  if (focus === 'address') setTimeout(() => { const a = $('#addrSec', el); if (a) a.scrollIntoView({ behavior:'smooth', block:'start' }); }, 360);
}
function renderProfile(el){
  const u = el._u;
  const districts = REGIONS[u.address.region] || [];
  $('.page-bd', el).innerHTML = `
    <div class="form-sec" style="margin-top:0">Profile</div>
    <div class="field"><span>Profile Picture</span><div class="photo-row"><span class="avatar">${u.photo ? `<img src="${u.photo}" alt="">` : esc(initials(u.name))}</span>
      <div style="display:grid;gap:8px"><label class="btn btn-line btn-sm">${I.camera.replace('<svg','<svg width="16" height="16"')} ${u.photo ? 'Change photo' : 'Upload photo'}<input type="file" id="pfPhoto" accept="image/*"></label>${u.photo ? '<button class="del" data-act="pfNoPhoto">Remove photo</button>' : ''}</div></div></div>
    <label class="field"><span>Name</span><input class="inp" id="pfName" value="${esc(u.name)}" autocomplete="name"></label>
    <label class="field"><span>Contact Number</span><input class="inp" id="pfPhone" inputmode="tel" value="${esc(u.phone)}" autocomplete="tel"></label>
    <label class="field"><span>Contact Email <em>(Optional)</em></span><input class="inp" id="pfEmail" type="email" placeholder="e.g. name@email.com" value="${esc(u.email)}" autocomplete="email"></label>
    <div class="field"><span>Gender</span><div class="genders"><button class="${u.gender==='Male'?'on':''}" data-act="pfGender" data-g="Male">Male</button><button class="${u.gender==='Female'?'on':''}" data-act="pfGender" data-g="Female">Female</button></div></div>
    <div class="field"><span>Date of birth</span><div class="dob"><span id="dobTxt">${u.dob ? new Date(u.dob + 'T00:00').toLocaleDateString(undefined, { day:'numeric', month:'long', year:'numeric' }) : '<span style="color:var(--muted);font-weight:400">Not set</span>'}</span>
      <label>${I.cal} Select Date<input type="date" id="pfDob" value="${esc(u.dob)}" max="${new Date().toISOString().slice(0,10)}" aria-label="Select date of birth"></label></div>
      <p style="font-size:12px;color:var(--muted);margin-top:6px">Get 50 bonus Stars on your birthday.</p></div>
    <div class="form-sec" id="addrSec">Address</div>
    <label class="field"><span>Building</span><select class="inp" id="pfBuilding"><option value="" ${u.address.building?'':'selected'}>Select a building</option><option ${u.address.building==='Dahab Tower'?'selected':''}>Dahab Tower</option><option disabled>More buildings coming soon</option></select></label>
    <div class="two"><label class="field"><span>Floor Number</span><input class="inp" id="pfFloor" placeholder="e.g. 2 or 2A" value="${esc(u.address.floor)}" maxlength="6"></label>
    <label class="field"><span>Door Number</span><input class="inp" id="pfDoor" placeholder="e.g. A1" value="${esc(u.address.door)}" maxlength="8"></label></div>
    <label class="field"><span>Country</span><select class="inp" id="pfCountry"><option selected>Somalia</option></select></label>
    <label class="field"><span>Region</span><select class="inp" id="pfRegion"><option value="" ${u.address.region?'':'selected'}>Select a region</option>${Object.keys(REGIONS).map(r => `<option ${r===u.address.region?'selected':''}>${r}</option>`).join('')}</select></label>
    <label class="field"><span>District</span><select class="inp" id="pfDistrict" ${districts.length?'':'disabled'}>${districts.length ? '' : '<option value="">Select a region first</option>'}${districts.map(d => `<option ${d===u.address.district?'selected':''}>${esc(d)}</option>`).join('')}</select></label>
    <p class="err-msg" id="pfErr" hidden></p>`;
  const on = (id, f, ev = 'input') => { const i = $('#' + id, el); if (i) i.addEventListener(ev, f); };
  on('pfName', e => u.name = e.target.value);
  on('pfPhone', e => u.phone = e.target.value);
  on('pfEmail', e => u.email = e.target.value.trim());
  on('pfFloor', e => u.address.floor = e.target.value);
  on('pfDoor', e => u.address.door = e.target.value);
  on('pfBuilding', e => u.address.building = e.target.value, 'change');
  on('pfDob', e => { u.dob = e.target.value; $('#dobTxt', el).textContent = u.dob ? new Date(u.dob + 'T00:00').toLocaleDateString(undefined, { day:'numeric', month:'long', year:'numeric' }) : 'Not set'; }, 'change');
  on('pfRegion', e => { u.address.region = e.target.value; u.address.district = (REGIONS[u.address.region] || [''])[0]; renderProfile(el); }, 'change');
  on('pfDistrict', e => u.address.district = e.target.value, 'change');
  on('pfPhoto', e => {
    const f = e.target.files && e.target.files[0]; if (!f) return;
    const r = new FileReader();
    r.onload = () => { const img = new Image(); img.onload = () => { const c = document.createElement('canvas'); const s = 240; c.width = c.height = s; const x = c.getContext('2d'); const m = Math.min(img.width, img.height); x.drawImage(img, (img.width - m) / 2, (img.height - m) / 2, m, m, 0, 0, s, s); u.photo = c.toDataURL('image/jpeg', .82); renderProfile(el); }; img.src = r.result; };
    r.readAsDataURL(f);
  }, 'change');
}
function openMyOrders(){
  page('My Orders', S.orders.length ? S.orders.map(o => `<div class="oc"><div class="oh"><b class="num">${o.id}</b><span class="pill ${o.status==='Preparing'?'pill-gold':'pill-ok'}">${o.status}</span></div>
    <div class="om">${fmtDT(o.t)} · ${o.mode} · ${o.method}</div>
    <div class="oi">${o.items.map(i => `${i.qty}× ${esc(i.name)} <span style="color:var(--muted)">(${esc(i.opts)})</span>`).join('<br>')}</div>
    <div class="of"><span><b class="num">${money(o.total)}</b>${o.starsUsed ? ` <span style="font-size:12px;color:var(--gold)">· ${o.starsUsed}★ used</span>` : ''}</span><button class="btn btn-line btn-sm" data-act="reorder" data-id="${o.id}">Reorder</button></div></div>`).join('')
    : `<div class="empty">No orders yet. Your first one is a tap away.</div>`);
}
function openQRFull(){
  const el = document.createElement('div');
  el.className = 'qr-full';
  el.innerHTML = `<button class="x-btn" data-act="qrClose" aria-label="Close">${I.x}</button><div class="eyebrow" style="color:var(--sand)">Scan to send Stars</div>
    <div class="qr-box">${qrSVG(qrText())}<svg class="qr-logo" viewBox="0 0 100 100"><use href="#seal"/></svg></div>
    <b>${esc(S.user.name)}</b><span class="ph num">${esc(S.user.phone)}</span><p class="serif" style="color:var(--sand);margin-top:10px">A Better Journey in Every Cup</p>`;
  $('#app').appendChild(el);
}
function openNotes(){
  const el = sheet('Notifications', S.notes.length ? S.notes.map(n => `<div class="nt ${n.read?'':'unread'}"><span class="ni">${I[n.icon] || I.bell}</span><div><b>${esc(n.title)}</b><p>${esc(n.body)}</p><time>${ago(n.t)}</time></div></div>`).join('') : '<div class="empty">No messages yet.</div>',
    S.notes.some(n => !n.read) ? '<button class="btn btn-line btn-block" data-act="readAll">Mark all as read</button>' : '', { pre:'<div class="eyebrow">Messages from SafarChat</div>' });
  el._onClose = () => { S.notes.forEach(n => n.read = true); save(); refreshBadges(); if (ui.tab === 'account') R_account(); };
}
function openHelp(){
  const open = storeOpen();
  page('Help & store info', `<div class="store" style="pointer-events:none"><span class="sa">${seal()}</span><span><b>${esc(STORE.name)}</b><p>${esc(STORE.addr)}</p>
    <span class="meta"><span class="pill ${open?'pill-ok':'pill-bad'}">${open?'● Open Now':'● Closed'}</span><span>6:30 AM – 11:30 PM daily</span></span></span></div>
    <div class="menu" style="margin-top:14px"><div class="mi"><span class="mic">${I.phone}</span><span class="t"><b style="user-select:all">${STORE.phone}</b><span>Call or WhatsApp the store</span></span></div>
    <div class="mi"><span class="mic">${I.receipt}</span><span class="t"><b style="user-select:all">hello@safarchatcafe.com</b><span>Email us</span></span></div></div>
    <div class="sec"><div class="sec-hd"><h2>FAQs</h2></div><div class="faq">
      <details><summary>How do Stars work?</summary><p>You earn 2 Stars for every $1 you pay. Every 100 Stars is worth $8.00 off. Use them in the cart, pay a whole order with Stars, or share them with friends.</p></details>
      <details><summary>Which payments do you accept?</summary><p>EVC Plus, eDahab and Premier Wallet, plus your Star balance. You approve each payment on your phone.</p></details>
      <details><summary>How does Car Pickup work?</summary><p>Add your Taargo (plate number). When your order is ready a barista brings it out to your car in front of Dahab Tower.</p></details>
      <details><summary>Where do you deliver?</summary><p>Nearby Delivery currently covers Dahab Tower. More buildings are being added soon. Delivery is ${money(DELIVERY_FEE)}.</p></details>
      <details><summary>Is this the real app?</summary><p>This is a test version for review. Payments are simulated. Accounts, orders and history are saved on this phone, so share Stars and gifts work between accounts created on the same phone until the app is connected to a server.</p></details>
    </div></div>`);
}
