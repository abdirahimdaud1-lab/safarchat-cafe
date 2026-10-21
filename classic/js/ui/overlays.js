/* Bottom sheets, full-screen pages and toast messages. */
'use strict';

const stack = [];
function openOv(inner, cls = ''){
  const el = document.createElement('div');
  el.className = 'ov ' + cls;
  el.innerHTML = `<div class="ov-bg" data-act="closeTop"></div>${inner}`;
  $('#overlays').appendChild(el);
  stack.push(el);
  requestAnimationFrame(() => requestAnimationFrame(() => el.classList.add('in')));
  return el;
}
function sheet(title, body, foot = '', opts = {}){
  return openOv(`<div class="sheet" role="dialog" aria-modal="true" aria-label="${esc(title || 'Sheet')}"><div class="grab"></div>
    ${opts.noHead ? '' : `<div class="sh-hd gut"><div>${opts.pre || ''}<h2>${title}</h2></div><button class="x-btn" data-act="closeTop" aria-label="Close">${I.x}</button></div>`}
    <div class="sh-bd gut">${body}</div>${foot ? `<div class="sh-ft gut">${foot}</div>` : ''}</div>`);
}
function page(title, body, foot = ''){
  return openOv(`<div class="page" role="dialog" aria-modal="true" aria-label="${esc(title)}"><div class="page-hd gut"><button class="x-btn" data-act="closeTop" aria-label="Back">${I.back}</button><h2>${title}</h2></div>
    <div class="page-bd gut">${body}</div>${foot ? `<div class="page-ft gut">${foot}</div>` : ''}</div>`, 'page-ov');
}
function closeTop(){
  const el = stack.pop(); if (!el) return;
  el.classList.remove('in');
  setTimeout(() => el.remove(), 320);
  if (el._onClose) el._onClose();
}
function closeAll(){ while (stack.length) closeTop(); }
let toastT;
function toast(msg){
  const t = $('#toast'); t.textContent = msg; t.classList.add('on');
  clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove('on'), 2400);
}
