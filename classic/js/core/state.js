/* App state, sample data and saving to the phone (localStorage). */
'use strict';

function seed(){
  const now = Date.now(), D = 86400000;
  const ledger = [];
  const buys = [
    ['Cappuccino, Sambuusa (3)', 4.50],['Shaah Cadays ×2', 3.00],['Camel Milk Latte, Malawax with Honey', 5.75],['Iced Latte', 3.50],
    ['Qaxwo · Cardamom Coffee, Xalwo', 3.00],['Club Sandwich, Fresh Orange Juice', 7.50],['Caramel Frappé', 4.00],['Matcha Latte, Date Muffin', 6.00],
    ['Shaah Cadays, Kac Kac ×2', 3.50],['Chocolate Fudge Cake, Espresso', 5.50],['Mango Banana smoothie', 3.50],['Chicken Suqaar Wrap, Sprite', 5.50],
    ['Cold Brew, Butter Croissant', 5.00],['Spiced Mocha', 3.50],['Camel Milk Chai ×2', 5.00],['Tiramisu, Flat White', 7.50],['Iced Spanish Latte', 3.75],
    ['Shaah Bigays, Sambuusa (3)', 2.50],['Peach Iced Tea, Cinnamon Roll', 4.75],['Americano, Chocolate Croissant', 4.50]
  ];
  let t = now - 2 * 3600000, bi = 0;
  for (let i = 0; i < 27; i++){
    if (i === 4) ledger.push({ id:uid(), t, kind:'bonus', title:'Double Stars Friday', detail:'Bonus on your Friday order', stars:12 });
    else if (i === 9) ledger.push({ id:uid(), t, kind:'redeem', title:'Redeemed Stars', detail:'100★ applied · $8.00 off order SC-3307', stars:-100 });
    else if (i === 13) ledger.push({ id:uid(), t, kind:'receive', title:'Stars received', detail:'From Ayaan · +252 61 *** 2210 · "Shaah on me!"', stars:50 });
    else if (i === 17) ledger.push({ id:uid(), t, kind:'share', title:'Stars shared', detail:'To Faisal · +252 61 *** 8841', stars:-25 });
    else if (i === 22) ledger.push({ id:uid(), t, kind:'bonus', title:'Welcome bonus', detail:'Thanks for joining SafarChat Rewards', stars:50 });
    else { const b = buys[bi++ % buys.length]; ledger.push({ id:uid(), t, kind:'earn', title:'Order at Dahab Tower', detail:b[0] + ' · ' + money(b[1]), stars:Math.floor(b[1] * EARN_PER_USD), usd:b[1] }); }
    t -= D * (1 + (i % 3)) - 3600000 * (i % 5);
  }
  return {
    v:1,
    user:{ name:'Hodan Ali', phone:'+252 61 234 5678', email:'', gender:'Female', dob:'', photo:'', address:{ building:'Dahab Tower', floor:'', door:'', country:'Somalia', region:'Banaadir', district:'Hodan' } },
    stars:485,
    ledger,
    cart:[],
    useStars:0,
    store:null,
    orders:[
      { id:'SC-4127', t:now - 2 * 3600000, items:[{ name:'Cappuccino', qty:1, opts:'Medium · Sugar', price:3.50 },{ name:'Sambuusa (3)', qty:1, opts:'Warmed', price:1.50 }], mode:'Store Pickup', time:'5-10 min', method:'EVC Plus', total:5.25, starsUsed:0, status:'Completed', lines:[['pa4',1],['hc4',1]] },
      { id:'SC-3990', t:now - 3 * 86400000, items:[{ name:'Shaah Cadays', qty:2, opts:'Regular · Sugar', price:1.50 }], mode:'Car Pickup', time:'Now', method:'eDahab', total:3.15, starsUsed:0, status:'Completed', lines:[['ht1',2]] },
      { id:'SC-3307', t:now - 12 * 86400000, items:[{ name:'Club Sandwich', qty:1, opts:'Warmed', price:5.00 },{ name:'Camel Milk Latte', qty:1, opts:'Large · No Sugar', price:4.75 }], mode:'Nearby Delivery', time:'10-15 min', method:'Premier Wallet', total:3.04, starsUsed:100, status:'Completed', lines:[['sw2',1],['hc6',1]] }
    ],
    notes:[
      { id:uid(), t:now - 25 * 60000, icon:'sparkle', title:'New: Saffron Iced Latte', body:'Golden saffron, cold milk and a double shot. Order today and earn double Stars until Sunday.', read:false },
      { id:uid(), t:now - 2 * 3600000, icon:'cup', title:'Order SC-4127 is ready', body:'Your Cappuccino and Sambuusa are waiting at the Dahab Tower counter.', read:false },
      { id:uid(), t:now - 26 * 3600000, icon:'star', title:'You earned 9 Stars', body:'Nice. You are 15 Stars away from your next $8 reward tier.', read:true },
      { id:uid(), t:now - 4 * 86400000, icon:'gift', title:'Send a Thank You', body:'Gift a Shaah & Sambuusa bundle for just $3.00. Paid with EVC Plus, eDahab or Premier Wallet.', read:true },
      { id:uid(), t:now - 9 * 86400000, icon:'clock', title:'Opening hours', body:'Dahab Tower is open every day from 6:30 AM to 11:30 PM.', read:true }
    ],
    gifts:[],
    favs:['hc6','ht1']
  };
}
let S;
function load(){ try { const s = JSON.parse(localStorage.getItem(KEY)); if (s && s.v === 1) return s; } catch (e) {} return seed(); }
function save(){ try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {} }
S = load();

const ui = { tab:'home', otab:'featured', sub:{ drinks:'hotcoffee', food:'pastry' }, q:'', tiersOpen:false, ledgerN:10, adIdx:0 };
