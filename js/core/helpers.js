/* Shared helpers and business constants (Stars value, tax, delivery fee). */
'use strict';

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const money = n => '$' + (Math.round(n * 100) / 100).toFixed(2);
const STAR_USD = 0.08;            // 100 Stars = $8.00
const TAX = 0.05;
const EARN_PER_USD = 2;           // 2 Stars per $1
const DELIVERY_FEE = 1.00;
const KEY = 'safarchat.app.v1';
const uid = () => Math.random().toString(36).slice(2, 9);
const WELCOME_STARS = 0;          // Stars given at sign-up (set e.g. 50 to run a welcome offer)
const BIRTHDAY_STARS = 50;        // Stars given once a year on the customer's birthday

/* Somali mobile numbers: stored as 2526XXXXXXXX, shown as +252 61 234 5678 */
const normPhone = v => { const d = String(v || '').replace(/\D/g, ''); return d.length >= 9 ? '252' + d.slice(-9) : ''; };
const fmtPhone = n => { n = normPhone(n); return n ? `+252 ${n.slice(3,5)} ${n.slice(5,8)} ${n.slice(8)}` : ''; };
const validPhone = v => /^252[679]\d{8}$/.test(normPhone(v));
const maskPhone = v => { const f = fmtPhone(v); return f ? f.slice(0, 8) + '*** ' + f.slice(-4) : ''; };

/* Password hashing (SHA-256 with a per-account salt). A real launch should move accounts to a server. */
async function hashPw(pw, salt){
  const text = salt + ':' + pw;
  try {
    const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
    return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
  } catch (e) {
    let h1 = 0xdeadbeef, h2 = 0x41c6ce57;
    for (let i = 0; i < text.length; i++){ const c = text.charCodeAt(i); h1 = Math.imul(h1 ^ c, 2654435761); h2 = Math.imul(h2 ^ c, 1597334677); }
    return 'x' + (h1 >>> 0).toString(16) + (h2 >>> 0).toString(16);
  }
}
