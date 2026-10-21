/* Accounts and app state, saved on the phone (localStorage).
   There is no sample data: a new account starts empty and every record
   (orders, Star history, gifts, messages) is created by using the app.
   DB shape: { accounts:{ [id]:{ id, name, phone, email, salt, hash, created } },
               data:{ [id]: per-account app data (see blankData) }, session:id|null } */
'use strict';

const DBKEY = 'safarchat.accounts.v1';
function blankData(acc){
  return {
    v:2,
    user:{ name:acc.name, phone:fmtPhone(acc.phone), email:acc.email || '', gender:'', dob:'', photo:'',
      address:{ building:'', floor:'', door:'', country:'Somalia', region:'', district:'' } },
    stars:0, ledger:[], cart:[], useStars:0, store:null, orders:[], notes:[], gifts:[], favs:[], bdayYear:null
  };
}
function loadDB(){
  try { const d = JSON.parse(localStorage.getItem(DBKEY)); if (d && d.accounts && d.data) return d; } catch (e) {}
  return { accounts:{}, data:{}, session:null };
}
let DB = loadDB();
let ME = null;   // signed-in account id
let S = null;    // signed-in account's data
function save(){ try { localStorage.setItem(DBKEY, JSON.stringify(DB)); } catch (e) {} }
function startSession(id){ ME = id; S = DB.data[id]; DB.session = id; save(); }
function endSession(){ ME = null; S = null; DB.session = null; save(); }
if (DB.session && DB.accounts[DB.session] && DB.data[DB.session]) { ME = DB.session; S = DB.data[ME]; }

const findByPhone = v => { const n = normPhone(v); return n ? Object.values(DB.accounts).find(a => a.phone === n) : null; };
const findByEmail = v => { const e = String(v || '').trim().toLowerCase(); return e ? Object.values(DB.accounts).find(a => a.email === e) : null; };

/* Add a message to any account's notifications (used for gifts and shared Stars too). */
function notify(accId, icon, title, body){
  const d = DB.data[accId]; if (!d) return;
  d.notes.unshift({ id:uid(), t:Date.now(), icon, title, body, read:false });
}
/* Birthday treat: once a year, on the date of birth saved in Profile. */
function checkBirthday(){
  if (!S || !S.user.dob) return;
  const now = new Date(), [, m, d] = S.user.dob.split('-').map(Number);
  if (now.getMonth() + 1 === m && now.getDate() === d && S.bdayYear !== now.getFullYear()){
    S.bdayYear = now.getFullYear();
    S.stars += BIRTHDAY_STARS;
    S.ledger.unshift({ id:uid(), t:Date.now(), kind:'bonus', title:'Birthday treat', detail:'Happy birthday from SafarChat Café', stars:BIRTHDAY_STARS });
    notify(ME, 'cake', 'Happy birthday, ' + S.user.name.split(' ')[0] + '!', `We added ${BIRTHDAY_STARS} Stars to your account. Enjoy a treat on us.`);
    save();
  }
}

const ui = { tab:'home', otab:'featured', sub:{ drinks:'hotcoffee', food:'pastry' }, q:'', tiersOpen:false, ledgerN:10, adIdx:0 };
