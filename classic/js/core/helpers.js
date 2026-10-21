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
