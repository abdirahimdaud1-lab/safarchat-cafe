/* Sign up, sign in and password reset screens. Shown full screen until someone is signed in. */
'use strict';

const AUTH = { view:'welcome', show:{} };
const eye = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></svg>';
const eyeOff = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3l18 18M10.6 5.1A10 10 0 0 1 12 5c6.5 0 10 7 10 7a17 17 0 0 1-3.2 4.2M6.6 6.6A17 17 0 0 0 2 12s3.5 7 10 7a9.6 9.6 0 0 0 5.4-1.6M9.9 9.9a3 3 0 0 0 4.2 4.2"/></svg>';

function showAuth(view = 'welcome'){
  AUTH.view = view;
  const a = $('#auth'); a.hidden = false;
  $('.screens').hidden = true; $('#tabbar').hidden = true;
  renderAuth();
}
function hideAuth(){
  $('#auth').hidden = true; $('#auth').innerHTML = '';
  $('.screens').hidden = false; $('#tabbar').hidden = false;
}
const pwField = (id, label, ph, ac) => `<label class="field"><span>${label}</span><span class="pw"><input class="inp" id="${id}" type="${AUTH.show[id] ? 'text' : 'password'}" placeholder="${ph}" autocomplete="${ac}"><button type="button" class="pw-eye" data-act="pwEye" data-id="${id}" aria-label="${AUTH.show[id] ? 'Hide' : 'Show'} password">${AUTH.show[id] ? eyeOff : eye}</button></span></label>`;
const phoneField = (id, label) => `<label class="field"><span>${label}</span><span class="ph-in"><b>+252</b><input class="inp" id="${id}" inputmode="tel" placeholder="61 234 5678" autocomplete="tel-national" maxlength="20"></span></label>`;

/* On iPhone Safari (not yet installed) show how to add the app to the Home Screen. */
function installTip(){
  const ios = /iPhone|iPad|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const standalone = window.navigator.standalone || (window.matchMedia && matchMedia('(display-mode: standalone)').matches);
  if (!ios || standalone) return '';
  const share = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="width:16px;height:16px;vertical-align:-3px"><path d="M12 3v12M8 7l4-4 4 4"/><path d="M6 11H5v10h14V11h-1"/></svg>';
  return `<p class="aw-install">Use it like an app: tap ${share} <b>Share</b> in Safari, then <b>Add to Home Screen</b>.</p>`;
}
function renderAuth(){
  const a = $('#auth'), v = AUTH.view;
  if (v === 'welcome'){
    a.className = 'auth auth-welcome';
    a.innerHTML = `<div class="aw gut">
      <svg class="aw-seal" viewBox="0 0 100 100" aria-hidden="true"><use href="#sealFull"/></svg>
      <h1 class="aw-word">SAFARCHAT</h1><div class="aw-cafe">CAFÉ</div>
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
      <label class="field"><span>Full name</span><input class="inp" id="suName" placeholder="e.g. Hodan Ali" autocomplete="name"></label>
      ${phoneField('suPhone', 'Phone number')}
      <label class="field"><span>Email <em>(Optional)</em></span><input class="inp" id="suEmail" type="email" placeholder="e.g. name@email.com" autocomplete="email"></label>
      ${pwField('suPw', 'Password', 'At least 6 characters', 'new-password')}
      ${pwField('suPw2', 'Confirm password', 'Type it again', 'new-password')}
      <label class="agree"><input type="checkbox" id="suAgree"><span>I agree to the SafarChat Rewards terms and privacy policy.</span></label>
      <p class="err-msg" id="authErr" hidden></p>
      <button class="btn btn-green btn-block" type="submit" style="margin-top:18px">Create Account</button>
    </form>
    <p class="auth-alt">Already have an account? <button class="link" data-act="authGo" data-v="signin">Sign in</button></p>`;
  if (v === 'signin') body = `${head('Welcome back', 'Sign in with the phone number or email you registered with.')}
    <form id="authForm" novalidate>
      <label class="field"><span>Phone number or email</span><input class="inp" id="siId" placeholder="e.g. 61 234 5678" autocomplete="username"></label>
      ${pwField('siPw', 'Password', 'Your password', 'current-password')}
      <div style="text-align:right;margin-top:10px"><button type="button" class="link" data-act="authGo" data-v="forgot">Forgot password?</button></div>
      <p class="err-msg" id="authErr" hidden></p>
      <button class="btn btn-green btn-block" type="submit" style="margin-top:18px">Sign In</button>
    </form>
    <p class="auth-alt">New to SafarChat? <button class="link" data-act="authGo" data-v="signup">Create an account</button></p>`;
  if (v === 'forgot') body = `${head('Reset password', 'Confirm the phone number and full name on your account, then choose a new password.')}
    <form id="authForm" novalidate>
      ${phoneField('fpPhone', 'Phone number')}
      <label class="field"><span>Full name on the account</span><input class="inp" id="fpName" autocomplete="name"></label>
      ${pwField('fpPw', 'New password', 'At least 6 characters', 'new-password')}
      ${pwField('fpPw2', 'Confirm new password', 'Type it again', 'new-password')}
      <p class="err-msg" id="authErr" hidden></p>
      <button class="btn btn-green btn-block" type="submit" style="margin-top:18px">Reset Password</button>
      <p class="aw-hint">In the live app this step will send a code to your phone by SMS.</p>
    </form>`;
  a.innerHTML = `<div class="auth-bd gut">${body}</div>`;
  $('#authForm').addEventListener('submit', e => { e.preventDefault(); ({ signup:doSignUp, signin:doSignIn, forgot:doReset })[v](); });
}
function authErr(msg, fieldId){
  const e = $('#authErr'); e.textContent = msg; e.hidden = false;
  $$('#auth .inp.err').forEach(i => i.classList.remove('err'));
  if (fieldId){ const f = $('#' + fieldId); f.classList.add('err'); f.focus(); }
}
const val = id => ($('#' + id) || {}).value || '';

async function doSignUp(){
  const name = val('suName').trim().replace(/\s+/g, ' '), phone = normPhone(val('suPhone')), email = val('suEmail').trim().toLowerCase(), pw = val('suPw'), pw2 = val('suPw2');
  if (name.length < 2) return authErr('Enter your full name.', 'suName');
  if (!validPhone(val('suPhone'))) return authErr('Enter a Somali mobile number, e.g. 61 234 5678.', 'suPhone');
  if (findByPhone(phone)) return authErr('This phone number already has an account. Sign in instead.', 'suPhone');
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return authErr('That email doesn\'t look right. Leave it empty or use name@email.com.', 'suEmail');
  if (email && findByEmail(email)) return authErr('This email is already used by another account.', 'suEmail');
  if (pw.length < 6) return authErr('Your password needs at least 6 characters.', 'suPw');
  if (pw !== pw2) return authErr('The two passwords don\'t match.', 'suPw2');
  if (!$('#suAgree').checked) return authErr('Please agree to the terms to continue.');
  const id = 'u' + Date.now().toString(36) + uid(), salt = uid() + uid();
  const acc = { id, name, phone, email, salt, hash:await hashPw(pw, salt), created:Date.now() };
  DB.accounts[id] = acc;
  DB.data[id] = blankData(acc);
  startSession(id);
  notify(id, 'sparkle', `Welcome to SafarChat, ${name.split(' ')[0]}!`, 'You earn 2 Stars for every $1 you pay, and every 100 Stars takes $8.00 off. Choose a store and place your first order.');
  if (WELCOME_STARS){ S.stars += WELCOME_STARS; S.ledger.unshift({ id:uid(), t:Date.now(), kind:'bonus', title:'Welcome bonus', detail:'Thanks for joining SafarChat Rewards', stars:WELCOME_STARS }); }
  save(); AUTH.show = {};
  enterApp(`Account created. Welcome, ${name.split(' ')[0]}!`);
}
async function doSignIn(){
  const idv = val('siId').trim(), pw = val('siPw');
  if (!idv) return authErr('Enter your phone number or email.', 'siId');
  const acc = idv.includes('@') ? findByEmail(idv) : findByPhone(idv);
  if (!acc) return authErr('We couldn\'t find an account with that phone number or email.', 'siId');
  if (await hashPw(pw, acc.salt) !== acc.hash) return authErr('That password is incorrect. Try again or reset it.', 'siPw');
  startSession(acc.id); AUTH.show = {};
  enterApp(`Welcome back, ${acc.name.split(' ')[0]}`);
}
async function doReset(){
  const acc = findByPhone(val('fpPhone'));
  if (!acc) return authErr('No account uses that phone number.', 'fpPhone');
  if (val('fpName').trim().toLowerCase().replace(/\s+/g, ' ') !== acc.name.toLowerCase()) return authErr('The name doesn\'t match this account.', 'fpName');
  if (val('fpPw').length < 6) return authErr('Your new password needs at least 6 characters.', 'fpPw');
  if (val('fpPw') !== val('fpPw2')) return authErr('The two passwords don\'t match.', 'fpPw2');
  acc.salt = uid() + uid(); acc.hash = await hashPw(val('fpPw'), acc.salt); save();
  AUTH.show = {}; showAuth('signin'); toast('Password changed. Sign in with your new password.');
}
function enterApp(msg){
  hideAuth();
  ui.tab = 'home'; ui.otab = 'featured'; ui.q = ''; ui.ledgerN = 10; ui.tiersOpen = false;
  checkBirthday();
  go('home');
  if (msg) toast(msg);
}
function signOut(){
  closeAll(); const q = $('.qr-full'); if (q) q.remove();
  endSession();
  $$('.screen').forEach(s => s.innerHTML = '');
  showAuth('welcome');
}
