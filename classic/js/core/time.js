/* Greeting by time of day, location from the phone time zone, store hours (Mogadishu time). */
'use strict';

function greeting(d = new Date()){
  const h = d.getHours();
  if (h >= 5 && h < 12) return 'Good morning';
  if (h >= 12 && h < 17) return 'Good afternoon';
  if (h >= 17 && h < 21) return 'Good evening';
  return 'Good night';
}
function place(){
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
    const M = {'Africa/Mogadishu':'Mogadishu, Somalia','Africa/Nairobi':'Nairobi, Kenya','Africa/Djibouti':'Djibouti','Africa/Addis_Ababa':'Addis Ababa, Ethiopia','Asia/Dubai':'Dubai, UAE','Asia/Riyadh':'Riyadh, Saudi Arabia','Europe/London':'London, UK','Europe/Istanbul':'Istanbul, Türkiye','America/New_York':'New York, USA','America/Chicago':'Minneapolis, USA','America/Toronto':'Toronto, Canada','Europe/Stockholm':'Stockholm, Sweden','Europe/Oslo':'Oslo, Norway'};
    if (M[tz]) return M[tz];
    const c = tz.split('/').pop().replace(/_/g, ' ');
    return c || 'Mogadishu, Somalia';
  } catch (e) { return 'Mogadishu, Somalia'; }
}
function mogMinutes(){
  try {
    const parts = new Intl.DateTimeFormat('en-GB', { timeZone:'Africa/Mogadishu', hour:'2-digit', minute:'2-digit', hourCycle:'h23' }).formatToParts(new Date());
    const h = +parts.find(p => p.type === 'hour').value, m = +parts.find(p => p.type === 'minute').value;
    return h * 60 + m;
  } catch (e) { const d = new Date(); return ((d.getUTCHours() + 3) % 24) * 60 + d.getUTCMinutes(); }
}
const STORE = { id:'dahab', name:'SafarChat Café · Dahab Tower', addr:'Dahab Tower, Ground Floor · KM4, Hodan, Mogadishu', phone:'+252 61 000 0000', open:390, close:1410, dist:'0.4 km' };
const storeOpen = () => { const m = mogMinutes(); return m >= STORE.open && m < STORE.close; };
const fmtDate = t => new Date(t).toLocaleDateString(undefined, { day:'numeric', month:'short', year:'numeric' });
const fmtDT = t => new Date(t).toLocaleString(undefined, { day:'numeric', month:'short', hour:'numeric', minute:'2-digit' });
function ago(t){
  const s = (Date.now() - t) / 1000;
  if (s < 60) return 'Just now';
  if (s < 3600) return Math.floor(s / 60) + ' min ago';
  if (s < 86400) return Math.floor(s / 3600) + ' h ago';
  if (s < 86400 * 7) return Math.floor(s / 86400) + ' d ago';
  return fmtDate(t);
}
