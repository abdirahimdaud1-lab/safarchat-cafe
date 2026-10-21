/* Welcome, Create Account, Sign In and Forgot Password screens, plus loading / offline / setup screens.
   Accounts live on the server (Supabase Auth); people sign in with their phone number and password. */
'use strict';

const AUTH = { view:'welcome', show:{}, busy:false };
const eye = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></svg>';
const eyeOff = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3l18 18M10.6 5.1A10 10 0 0 1 12 5c6.5 0 10 7 10 7a17 17 0 0 1-3.2 4.2M6.6 6.6A17 17 0 0 0 2 12s3.5 7 10 7a9.6 9.6 0 0 0 5.4-1.6M9.9 9.9a3 3 0 0 0 4.2 4.2"/></svg>';

function showAuth(view = 'welcome'){
  AUTH.view = view; AUTH.busy = false;
  $('#auth').hidden = false;
  $('.screens').hidden = true; $('#tabbar').hidden = true;
  renderAuth();
}
function hideAuth(){
  $('#auth').hidden = true; $('#auth').innerHTML = '';
  $('.screens').hidden = false; $('#tabbar').hidden = false;
}
/* On iPhone Safari (not yet installed) show how to add the app to the Home Screen. */
function installTip(){
  const ios = /iPhone|iPad|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const standalone = window.navigator.standalone || (window.matchMedia && matchMedia('(display-mode: standalone)').matches);
  if (!ios || standalone) return '';
  const share = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="width:16px;height:16px;vertical-align:-3px"><path d="M12 3v12M8 7l4-4 4 4"/><path d="M6 11H5v10h14V11h-1"/></svg>';
  return `<p class="aw-install">Use it like an app: tap ${share} <b>Share</b> in Safari, then <b>Add to Home Screen</b>.</p>`;
}
const brandBlock = () => `<svg class="aw-seal" viewBox="0 0 100 100" aria-hidden="true"><use href="#sealFull"/></svg>
  <h1 class="aw-word">SAFARCHAT</h1><div class="aw-cafe">CAFÉ</div>`;
const pwField = (id, label, ph, ac) => `<label class="field"><span>${label}</span><span class="pw"><input class="inp" id="${id}" type="${AUTH.show[id] ? 'text' : 'password'}" placeholder="${ph}" autocomplete="${ac}"><button type="button" class="pw-eye" data-act="pwEye" data-id="${id}" aria-label="${AUTH.show[id] ? 'Hide' : 'Show'} password">${AUTH.show[id] ? eyeOff : eye}</button></span></label>`;
const phoneField = (id, label) => `<label class="field"><span>${label}</span><span class="ph-in"><b>+252</b><input class="inp" id="${id}" inputmode="tel" placeholder="61 234 5678" autocomplete="tel-national" maxlength="20"></span></label>`;

function renderAuth(){
  const a = $('#auth'), v = AUTH.view;
  if (v === 'loading'){
    a.className = 'auth auth-welcome';
    a.innerHTML = `<div class="aw gut">${brandBlock()}<p class="serif aw-tag">A Better Journey in Every Cup</p><div class="spinner aw-spin" aria-label="Loading"></div></div>`;
    return;
  }
  if (v === 'offline' || v === 'setup'){
    a.className = 'auth auth-welcome';
    a.innerHTML = `<div class="aw gut">${brandBlock()}
      ${v === 'offline'
        ? `<p class="aw-msg">We couldn't reach SafarChat. Check your internet connection and try again.</p><div class="aw-btns"><button class="btn btn-milk btn-block" data-act="retryBoot">Try Again</button></div>`
        : `<p class="aw-msg">The app isn't connected to its server yet. If you run SafarChat, follow <b>SETUP.md</b> to add your Supabase address and key in <b>js/config.js</b>.</p>`}
      <p class="aw-note">Somali Tea &amp; Coffee House · Mogadishu</p></div>`;
    return;
  }
  if (v === 'welcome'){
    a.className = 'auth auth-welcome';
    a.innerHTML = `<div class="aw gut">${brandBlock()}
      <p class="serif aw-tag">A Better Journey in Every Cup</p>
      <ul class="aw-list"><li>${I.cup}Order ahead for pickup, car or delivery</li><li>${I.star}Earn 2 Stars for every $1. 100★ = $8.00</li><li>${I.gift}Send gifts and share Stars with friends</li></ul>
      <div class="aw-btns"><button class="btn btn-milk btn-block" data-act="authGo" data-v="signup">Create Account</button><button class="btn btn-block aw-line" data-act="authGo" data-v="signin">Sign In</button></div>
      ${installTip()}
      <p class="aw-note">Somali Tea &amp; Coffee House · Mogadishu</p></div>`;
    return;
  }
  a.className = 'auth';
  const head = (t, s) => `<div class="auth-hd"><button class="x-btn" data-act="authGo" data-v="welcome" aria-label="Back">${I.back}</button><svg viewBox="0 0 100 100" style="width:44px;height:44px"><use href="#seal"/></svg></div><h1 class="auth-t">${t}</h1><p class="auth-s">${s}</p>`;
  let body = '';
  if (v === 'signup') body = `${head('Create your account', 'Join SafarChat Rewards and start earning Stars on your first order.')}
    <form id="authForm" novalidate>
      <label class="field"><span>Full name</span><input class="inp" id="suName" placeholder="e.g. Hodan Ali" autocomplete="name" maxlength="60"></label>
      ${phoneField('suPhone', 'Phone number')}
      <label class="field"><span>Email <em>(Optional)</em></span><input class="inp" id="suEmail" type="email" placeholder="e.g. name@email.com" autocomplete="email"></label>
      ${pwField('suPw', 'Password', 'At least 8 characters', 'new-password')}
      ${pwField('suPw2', 'Confirm password', 'Type it again', 'new-password')}
      <label class="agree"><input type="checkbox" id="suAgree"><span>I agree to the SafarChat Rewards terms and privacy policy.</span></label>
      <p class="err-msg" id="authErr" hidden></p>
      <button class="btn btn-green btn-block" type="submit" style="margin-top:18px">Create Account</button>
    </form>
    <p class="auth-alt">Already have an account? <button class="link" data-act="authGo" data-v="signin">Sign in</button></p>`;
  if (v === 'signin') body = `${head('Welcome back', 'Sign in with the phone number you registered with.')}
    <form id="authForm" novalidate>
      ${phoneField('siPhone', 'Phone number')}
      ${pwField('siPw', 'Password', 'Your password', 'current-password')}
      <div style="text-align:right;margin-top:10px"><button type="button" class="link" data-act="authGo" data-v="forgot">Forgot password?</button></div>
      <p class="err-msg" id="authErr" hidden></p>
      <button class="btn btn-green btn-block" type="submit" style="margin-top:18px">Sign In</button>
    </form>
    <p class="auth-alt">New to SafarChat? <button class="link" data-act="authGo" data-v="signup">Create an account</button></p>`;
  if (v === 'forgot') body = `${head('Forgot your password?', 'For your security, the café resets passwords for you.')}
    <div class="menu" style="margin-top:20px">
      <div class="mi"><span class="mic">${I.store}</span><span class="t"><b>Visit ${esc(STORE.name)}</b><span>${esc(STORE.addr)}</span></span></div>
      <div class="mi"><span class="mic">${I.phone}</span><span class="t"><b style="user-select:all">${esc(STORE.phone)}</b><span>Or call / WhatsApp the café</span></span></div>
    </div>
    <p class="auth-s" style="margin-top:16px">Staff check that the phone number is yours, then set a new password you can change later. Your Stars and history stay safe.</p>
    <button class="btn btn-green btn-block" style="margin-top:20px" data-act="authGo" data-v="signin">Back to Sign In</button>`;
  a.innerHTML = `<div class="auth-bd gut">${body}</div>`;
  const f = $('#authForm');
  if (f) f.addEventListener('submit', e => { e.preventDefault(); if (!AUTH.busy) ({ signup:doSignUp, signin:doSignIn })[v](); });
}
function authErr(msg, fieldId){
  const e = $('#authErr'); e.textContent = msg; e.hidden = false;
  $$('#auth .inp.err').forEach(i => i.classList.remove('err'));
  if (fieldId){ const f = $('#' + fieldId); f.classList.add('err'); f.focus(); }
}
const val = id => ($('#' + id) || {}).value || '';
function authBusy(on, label){
  AUTH.busy = on;
  const b = $('#authForm button[type=submit]');
  if (b){ b.disabled = on; if (label) b.textContent = label; }
}

async function doSignUp(){
  const name = val('suName').trim().replace(/\s+/g, ' '), email = val('suEmail').trim().toLowerCase(), pw = val('suPw'), pw2 = val('suPw2');
  if (name.length < 2) return authErr('Enter your full name.', 'suName');
  if (!validPhone(val('suPhone'))) return authErr('Enter a Somali mobile number, e.g. 61 234 5678.', 'suPhone');
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return authErr('That email doesn\'t look right. Leave it empty or use name@email.com.', 'suEmail');
  if (pw.length < 8) return authErr('Your password needs at least 8 characters.', 'suPw');
  if (pw !== pw2) return authErr('The two passwords don\'t match.', 'suPw2');
  if (!$('#suAgree').checked) return authErr('Please agree to the terms to continue.');
  authBusy(true, 'Creating account…');
  try {
    await API.signUp({ name, phone:val('suPhone'), email, password:pw });
    AUTH.show = {};
    await enterApp(`Account created. Welcome, ${name.split(' ')[0]}!`);
  } catch (e) {
    authBusy(false, 'Create Account');
    authErr(errText(e), /registered/.test(e.message) ? 'suPhone' : null);
  }
}
async function doSignIn(){
  if (!validPhone(val('siPhone'))) return authErr('Enter the phone number you registered with, e.g. 61 234 5678.', 'siPhone');
  if (!val('siPw')) return authErr('Enter your password.', 'siPw');
  authBusy(true, 'Signing in…');
  try {
    await API.signIn(val('siPhone'), val('siPw'));
    AUTH.show = {};
    await enterApp();
    toast(`Welcome back, ${S.user.name.split(' ')[0]}`);
  } catch (e) {
    authBusy(false, 'Sign In');
    authErr(errText(e), /Invalid login/.test(e.message) ? 'siPw' : null);
  }
}
async function enterApp(msg){
  await refreshState();
  hideAuth();
  ui.tab = 'home'; ui.otab = 'featured'; ui.q = ''; ui.ledgerN = 10; ui.tiersOpen = false;
  go('home');
  startLive();
  if (msg) toast(msg);
  try {
    const b = await API.call('claim_birthday');
    if (b > 0){ await refreshState(true); toast(`Happy birthday! ${b} Stars added`); }
  } catch (e) {}
}
async function signOut(){
  closeAll(); const q = $('.qr-full'); if (q) q.remove();
  stopLive();
  await API.signOut();
  S = null; ME = null;
  $$('.screen').forEach(s => s.innerHTML = '');
  showAuth('welcome');
}
