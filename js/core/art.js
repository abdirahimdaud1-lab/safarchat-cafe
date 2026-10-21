/* Product illustrations drawn as SVG: brand paper cups, iced cups, frappés, smoothies, bottles, pastries, cakes and sandwiches. */
'use strict';

let artN = 0;
const xl = y => 30 + 6 * (y - 24) / 68;
const trap = (y1, y2, i = 0) => { const a = xl(y1) + i, b = xl(y2) + i; return `${a},${y1} ${100 - a},${y1} ${100 - b},${y2} ${b},${y2}`; };
const CUPS = { green:['#0C361F','#F5F0E6'], brown:['#3A2318','#F5F0E6'], sand:['#D9C4A0','#F5F0E6'], milk:['#F5F0E6','#0C361F'], clay:['#9A4A2C','#F5F0E6'], gold:['#B8862F','#F5F0E6'] };
const PLATE = '<ellipse cx="50" cy="82" rx="45" ry="11" fill="#fff" stroke="#E6DAC6"/><ellipse cx="50" cy="81" rx="33" ry="7" fill="#F5F0E6"/>';
const SHADOW = '<ellipse cx="50" cy="94" rx="22" ry="3" fill="#3A2318" opacity=".12"/>';

function artHot(c){
  // Brand paper cup (see cup collection in the brand guide): coloured sleeve, Camel Milk base band,
  // white two-tier cap and the full camel seal. Camel Milk cups take a Safar Green band.
  const [body, band] = CUPS[c] || CUPS.green;
  const edge = c === 'milk' ? 'stroke="#E0D6C4" stroke-width=".8"' : '';
  return `<svg class="art" viewBox="0 0 100 100" aria-hidden="true">${SHADOW}
  <g class="steam" fill="none" stroke="#B9A88F" stroke-width="2" stroke-linecap="round"><path d="M42 10c-3-3 3-5 0-9"/><path d="M50 10c-3-3 3-5 0-9"/><path d="M58 10c-3-3 3-5 0-9"/></g>
  <path d="M27 27 L73 27 L66.5 92 L33.5 92 Z" fill="${body}" ${edge}/>
  <path d="M32.3 80 L67.7 80 L66.5 92 L33.5 92 Z" fill="${band}"/>
  <path d="M27 27 L34 27 L37.5 92 L33.5 92Z" fill="#000" opacity=".09"/>
  <path d="M58 27 L64 27 L61 92 L57 92Z" fill="#fff" opacity=".07"/>
  <path d="M73 27 L66 27 L62.8 92 L66.5 92Z" fill="#000" opacity=".1"/>
  <rect x="25" y="26.5" width="50" height="2.4" rx="1.2" fill="#E6E0D5"/>
  <rect x="23.5" y="20.5" width="53" height="7.5" rx="3.75" fill="#FFFFFF" stroke="#D9D2C5" stroke-width=".8"/>
  <path d="M28.5 20.8 L30.8 13.2 Q31.3 11.6 33.2 11.6 L66.8 11.6 Q68.7 11.6 69.2 13.2 L71.5 20.8Z" fill="#FFFFFF" stroke="#D9D2C5" stroke-width=".8"/>
  <path d="M30.2 17.6 H69.8" stroke="#ECE6DC" stroke-width="1.1"/>
  <rect x="55.5" y="13.4" width="9" height="2.4" rx="1.2" fill="#D3CBBE"/>
  <use href="#sealFull" x="33.5" y="37" width="33" height="33"/></svg>`;
}
function artIced(b, t, ice = true){
  return `<svg class="art" viewBox="0 0 100 100" aria-hidden="true">${SHADOW}
  <polygon points="${trap(34,91,1.6)}" fill="${t}"/>
  <polygon points="${trap(60,91,1.6)}" fill="${b}"/>
  <path d="M${xl(60)+1.6} 60 Q50 54 ${100-xl(60)-1.6} 60" fill="${b}" opacity=".55"/>
  ${ice ? '<g fill="#fff" opacity=".5" stroke="#fff" stroke-opacity=".8"><rect x="37" y="37" width="11" height="11" rx="2.5" transform="rotate(-14 42 42)"/><rect x="51" y="41" width="11" height="11" rx="2.5" transform="rotate(10 56 46)"/><rect x="42" y="50" width="10" height="10" rx="2.5" transform="rotate(24 47 55)"/></g>' : ''}
  <rect x="55" y="1" width="4.5" height="46" rx="2.2" fill="#0C361F" transform="rotate(11 57 24)"/>
  <polygon points="${trap(24,92)}" fill="#fff" fill-opacity=".16" stroke="#3A2318" stroke-opacity=".22" stroke-width="1.2"/>
  <polygon points="33,28 36.5,28 39.5,88 36.5,88" fill="#fff" opacity=".35"/>
  <rect x="25.5" y="19" width="49" height="7" rx="3.5" fill="#fff" stroke="#D9D2C5" stroke-width=".8"/>
  <use href="#sealFull" x="40.5" y="63" width="19" height="19"/></svg>`;
}
function artFrappe(c, d){
  return `<svg class="art" viewBox="0 0 100 100" aria-hidden="true">${SHADOW}
  <polygon points="${trap(36,91,1.6)}" fill="${c}"/>
  <path d="M38 48 q4 4 8 0 t8 0 t8 0" stroke="${d}" stroke-width="2" fill="none" opacity=".6"/>
  <path d="M38 62 q4 4 8 0 t8 0 t8 0" stroke="${d}" stroke-width="2" fill="none" opacity=".45"/>
  <rect x="53" y="0" width="6" height="44" rx="3" fill="#0C361F" transform="rotate(9 56 22)"/>
  <g fill="#FFFBF2" stroke="#EADCC2" stroke-width=".8"><circle cx="38" cy="31" r="8"/><circle cx="62" cy="31" r="8"/><circle cx="50" cy="27" r="10"/><circle cx="44" cy="22" r="6.5"/><circle cx="56" cy="21" r="6"/></g>
  <path d="M38 24 l6 6 l5 -9 l5 9 l6 -7" stroke="${d}" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M27 34 Q50 4 73 34" fill="#fff" fill-opacity=".22" stroke="#3A2318" stroke-opacity=".18" stroke-width="1"/>
  <polygon points="${trap(34,92)}" fill="#fff" fill-opacity=".14" stroke="#3A2318" stroke-opacity=".22" stroke-width="1.2"/>
  <polygon points="33,38 36.5,38 39.5,88 36.5,88" fill="#fff" opacity=".3"/>
  <use href="#sealFull" x="40.5" y="64" width="19" height="19"/></svg>`;
}
function artSmoothie(c, f){
  return `<svg class="art" viewBox="0 0 100 100" aria-hidden="true">${SHADOW}
  <polygon points="${trap(30,91,1.6)}" fill="${c}"/>
  <path d="M33 40 Q50 36 67 40" stroke="#fff" stroke-opacity=".3" stroke-width="2" fill="none"/>
  <rect x="44" y="2" width="5" height="44" rx="2.5" fill="#B8862F" transform="rotate(-10 46 24)"/>
  <polygon points="${trap(24,92)}" fill="#fff" fill-opacity=".14" stroke="#3A2318" stroke-opacity=".22" stroke-width="1.2"/>
  <polygon points="33,30 36.5,30 39.5,88 36.5,88" fill="#fff" opacity=".3"/>
  <circle cx="70" cy="25" r="10" fill="${f}"/><circle cx="70" cy="25" r="7" fill="#fff" opacity=".35"/><path d="M70 18v14M63 25h14M65 20l10 10M75 20 65 30" stroke="${f}" stroke-width=".8"/>
  <use href="#sealFull" x="40.5" y="63" width="19" height="19"/></svg>`;
}
const BOTTLES = {
  w300:{liq:'#D6ECF7',cap:'#2A6FB0',lab:'#fff',txt:'300ml',tc:'#2A6FB0',short:1},
  dasani:{liq:'#D6ECF7',cap:'#1F4FA0',lab:'#1F4FA0',txt:'DASANI',tc:'#fff'},
  w350:{liq:'#D6ECF7',cap:'#2A8FC7',lab:'#E8F4FB',txt:'350ml',tc:'#1F5F8A'},
  sprite:{liq:'#C4E6B0',cap:'#0B7A3A',lab:'#0B7A3A',txt:'Sprite',tc:'#F6E04B'},
  fanta:{liq:'#F39A1F',cap:'#1D4AA0',lab:'#1D4AA0',txt:'Fanta',tc:'#F7B23B'},
  spark:{liq:'#E3F1F6',cap:'#7A8C99',lab:'#0C361F',txt:'Sparkling',tc:'#F5F0E6'},
  oj:{liq:'#F6A623',cap:'#0C361F',lab:'#F5F0E6',txt:'Fresh OJ',tc:'#0C361F'}
};
function artBottle(k){
  if (k === 'cola') return `<svg class="art" viewBox="0 0 100 100" aria-hidden="true">${SHADOW}
    <rect x="33" y="16" width="34" height="76" rx="6" fill="#C8102E"/><ellipse cx="50" cy="17" rx="17" ry="4" fill="#C9CDD2"/><ellipse cx="50" cy="17" rx="12" ry="2.5" fill="#A9AEB4"/>
    <rect x="33" y="84" width="34" height="5" fill="#A00D25"/><rect x="36" y="22" width="5" height="60" rx="2.5" fill="#fff" opacity=".2"/>
    <text x="50" y="57" text-anchor="middle" font-family="Georgia,serif" font-style="italic" font-size="11" fill="#fff">Cola</text>
    <path d="M36 64 Q50 58 64 66" stroke="#fff" stroke-width="1.6" fill="none"/></svg>`;
  const b = BOTTLES[k] || BOTTLES.w300, top = b.short ? 22 : 8;
  const fs = b.txt.length > 7 ? 6.5 : 8;
  return `<svg class="art" viewBox="0 0 100 100" aria-hidden="true">${SHADOW}
  <path d="M44 ${top+8} h12 v6 q0 4 7 9 q4 4 4 10 v${84-top-33} q0 6 -6 6 h-22 q-6 0 -6 -6 v-${84-top-33} q0 -6 4 -10 q7 -5 7 -9z" fill="${b.liq}" fill-opacity=".85" stroke="#3A2318" stroke-opacity=".2"/>
  <rect x="43" y="${top}" width="14" height="9" rx="2" fill="${b.cap}"/>
  <rect x="33" y="52" width="34" height="20" fill="${b.lab}" stroke="#3A2318" stroke-opacity=".08"/>
  <text x="50" y="${64.5}" text-anchor="middle" font-family="Jost,sans-serif" font-weight="700" font-size="${fs}" letter-spacing=".5" fill="${b.tc}">${b.txt}</text>
  <rect x="36" y="${top+30}" width="4" height="40" rx="2" fill="#fff" opacity=".45"/></svg>`;
}
function artFood(k){
  let g = '';
  switch(k){
    case 'croissant': case 'eggcroissant':
      g = `${k==='eggcroissant'?'<path d="M24 66 Q50 58 76 66 L74 70 Q50 63 26 70Z" fill="#F4C430"/><path d="M28 64 Q50 56 72 64" stroke="#FFF4C2" stroke-width="3" fill="none"/>':''}
      <path d="M14 72 Q24 40 50 38 Q76 40 86 72 Q78 66 70 68 Q64 54 50 54 Q36 54 30 68 Q22 66 14 72Z" fill="#D89A4A" stroke="#A86A2C" stroke-width="1.2"/>
      <path d="M30 68 Q36 50 42 42M50 54V38M70 68 Q64 50 58 42M22 69 Q26 56 34 46M78 69 Q74 56 66 46" stroke="#A86A2C" stroke-width="1.2" fill="none"/>
      <path d="M40 44 Q50 40 60 44" stroke="#F3C987" stroke-width="2" fill="none" opacity=".7"/>`; break;
    case 'painchoc':
      g = `<rect x="22" y="50" width="56" height="24" rx="10" fill="#D38F45" stroke="#A86A2C"/><path d="M34 51v22M46 50v24M58 50v24M70 51v22" stroke="#B8762F" stroke-width="1.2"/><rect x="18" y="57" width="7" height="8" rx="2" fill="#3A2318"/><rect x="75" y="57" width="7" height="8" rx="2" fill="#3A2318"/><path d="M28 54 Q50 49 72 54" stroke="#F3C987" stroke-width="2" fill="none" opacity=".7"/>`; break;
    case 'malawax':
      g = `<ellipse cx="50" cy="73" rx="32" ry="8" fill="#E2AE62" stroke="#C48A3A"/><ellipse cx="50" cy="67" rx="31" ry="8" fill="#E7B66B" stroke="#C48A3A"/><ellipse cx="50" cy="61" rx="30" ry="8" fill="#EDBE74" stroke="#C48A3A"/><ellipse cx="50" cy="55" rx="29" ry="8" fill="#F0C47C" stroke="#C48A3A"/>
      <path d="M32 54 Q50 46 68 54 Q66 58 62 57 L61 64 Q59 66 58 63 L57 57 Q46 60 40 57 L39 62 Q37 64 36 61Z" fill="#C98B1D" opacity=".9"/><circle cx="54" cy="51" r="2" fill="#fff" opacity=".6"/>`; break;
    case 'sambuusa':
      g = `<g fill="#D4934A" stroke="#A8692B" stroke-width="1.2" stroke-linejoin="round"><polygon points="18,76 42,76 30,52"/><polygon points="58,76 82,76 70,52"/><polygon points="36,79 64,79 50,46"/></g><path d="M50 50 L44 74M50 50 L56 74" stroke="#E8B57A" stroke-width="1.2"/><circle cx="73" cy="88" r="0"/>`; break;
    case 'kackac':
      g = `<g fill="#E3AB62" stroke="#B67A35" stroke-width="1.1"><rect x="24" y="58" width="18" height="16" rx="5" transform="rotate(-12 33 66)"/><rect x="58" y="58" width="18" height="16" rx="5" transform="rotate(14 67 66)"/><rect x="40" y="52" width="20" height="18" rx="6"/><rect x="42" y="66" width="18" height="14" rx="5" transform="rotate(6 51 73)"/></g><g fill="#fff"><circle cx="46" cy="58" r="1"/><circle cx="53" cy="61" r="1"/><circle cx="30" cy="64" r="1"/><circle cx="66" cy="63" r="1"/><circle cx="49" cy="72" r="1"/></g>`; break;
    case 'roll':
      g = `<circle cx="50" cy="64" r="22" fill="#D79B55" stroke="#9A5F25"/><path d="M50 64 m-3 0 a3 3 0 1 1 6 0 a7 7 0 1 1 -14 0 a11 11 0 1 1 22 0 a15 15 0 1 1 -30 0" stroke="#9A5F25" stroke-width="2.4" fill="none"/><path d="M32 56 Q40 50 46 58 Q52 64 58 56 Q64 50 68 58" stroke="#FFF8EC" stroke-width="3" fill="none" stroke-linecap="round"/>`; break;
    case 'muffin':
      g = `<polygon points="32,62 68,62 63,82 37,82" fill="#8A5A2E"/><path d="M38 63 l2 19M44 63l1 19M50 63v19M56 63l-1 19M62 63l-2 19" stroke="#6E4523" stroke-width="1"/><path d="M28 64 Q28 38 50 38 Q72 38 72 64Z" fill="#A8692B" stroke="#7A4A1E"/><g fill="#3A2318"><ellipse cx="42" cy="50" rx="3" ry="2"/><ellipse cx="56" cy="46" rx="3" ry="2"/><ellipse cx="60" cy="56" rx="3" ry="2"/><ellipse cx="47" cy="58" rx="3" ry="2"/></g>`; break;
    case 'xalwo':
      g = `<g stroke="#4A1A0C" stroke-width="1"><rect x="26" y="56" width="18" height="18" rx="3" fill="#7A2E16" transform="rotate(45 35 65)"/><rect x="56" y="56" width="18" height="18" rx="3" fill="#7A2E16" transform="rotate(45 65 65)"/><rect x="41" y="48" width="18" height="18" rx="3" fill="#8A3A1E" transform="rotate(45 50 57)"/></g><g fill="#fff" opacity=".35"><circle cx="47" cy="52" r="2"/><circle cx="32" cy="61" r="2"/><circle cx="62" cy="61" r="2"/></g><g fill="#C9B26A"><circle cx="50" cy="58" r="1.3"/><circle cx="35" cy="66" r="1.3"/><circle cx="65" cy="66" r="1.3"/></g>`; break;
    case 'bun':
      g = `<circle cx="50" cy="62" r="21" fill="#D9A35C" stroke="#A86A2C"/><path d="M34 56 Q50 40 66 56 M32 66 Q50 52 68 66 M38 76 Q50 64 62 76" stroke="#B57A36" stroke-width="2.4" fill="none"/><g fill="#fff"><circle cx="44" cy="52" r="1.6"/><circle cx="56" cy="55" r="1.6"/><circle cx="48" cy="63" r="1.6"/><circle cx="58" cy="67" r="1.6"/><circle cx="41" cy="69" r="1.6"/></g>`; break;
    case 'wrap': case 'wrap2': {
      const fill = k === 'wrap' ? ['#7AAE46','#C8344F','#B9824A'] : ['#7AAE46','#E8C17A','#6B3A22'];
      g = `<rect x="18" y="46" width="46" height="24" rx="12" fill="#E8CF9F" stroke="#C49A5A" transform="rotate(-8 41 58)"/><rect x="34" y="58" width="44" height="22" rx="11" fill="#EBD5A7" stroke="#C49A5A"/>
      <ellipse cx="76" cy="69" rx="8" ry="11" fill="#F4E3C0" stroke="#C49A5A"/><circle cx="74" cy="65" r="3" fill="${fill[0]}"/><circle cx="78" cy="70" r="3" fill="${fill[1]}"/><circle cx="74" cy="73" r="2.6" fill="${fill[2]}"/>`; break; }
    case 'sand': case 'sand2': case 'sand3': {
      const id = 'cl' + (++artN);
      const L = k==='sand' ? ['#7AAE46','#C8344F','#F4C430','#E7A1A0'] : k==='sand2' ? ['#7AAE46','#D64545','#F1E6C8','#7AAE46'] : ['#E9D8A6','#F4C430','#B9A07A','#7AAE46'];
      g = `<defs><clipPath id="${id}"><polygon points="20,78 56,78 38,38"/></clipPath></defs>
      <polygon points="44,78 82,78 70,42" fill="#E9CF9A" stroke="#B9813E"/>
      <g clip-path="url(#${id})"><rect x="10" y="30" width="60" height="60" fill="#F3DFB5"/><rect x="10" y="50" width="60" height="5" fill="${L[0]}"/><rect x="10" y="55" width="60" height="5" fill="${L[1]}"/><rect x="10" y="60" width="60" height="4" fill="${L[2]}"/><rect x="10" y="64" width="60" height="5" fill="${L[3]}"/></g>
      <polygon points="20,78 56,78 38,38" fill="none" stroke="#B9813E" stroke-width="2.4" stroke-linejoin="round"/>`; break; }
  }
  return `<svg class="art" viewBox="0 0 100 100" aria-hidden="true">${PLATE}${g}</svg>`;
}
function artCake(s, c, t){
  return `<svg class="art" viewBox="0 0 100 100" aria-hidden="true">${PLATE}
  <polygon points="22,52 78,52 64,36" fill="${t}"/>
  <rect x="22" y="52" width="56" height="28" fill="${s}"/>
  <rect x="22" y="52" width="56" height="4" fill="${t}"/>
  <rect x="22" y="62" width="56" height="4" fill="${c}"/>
  <rect x="22" y="71" width="56" height="3.5" fill="${c}"/>
  <path d="M22 52 L64 36 L78 52" fill="none" stroke="#3A2318" stroke-opacity=".12"/>
  <circle cx="58" cy="40" r="5" fill="#fff" stroke="#E6DAC6"/><circle cx="58" cy="35.5" r="3.2" fill="#B3263E"/>
  <rect x="22" y="52" width="56" height="28" fill="none" stroke="#3A2318" stroke-opacity=".12"/></svg>`;
}
function art(spec){
  const [t, a, b] = spec.split(':');
  if (t === 'hot') return artHot(a);
  if (t === 'iced') return artIced(a, b);
  if (t === 'frappe') return artFrappe(a, b);
  if (t === 'smoothie') return artSmoothie(a, b);
  if (t === 'bottle') return artBottle(a);
  if (t === 'can') return artBottle('cola');
  if (t === 'food') return artFood(a);
  if (t === 'cake') { const p = spec.split(':'); return artCake(p[1], p[2], p[3]); }
  return '';
}
