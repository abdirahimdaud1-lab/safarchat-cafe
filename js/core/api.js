/* Talking to the server. Every read and write goes through Supabase "RPC" functions
   defined in supabase/schema.sql, which check permissions and calculate prices. */
'use strict';

class ApiError extends Error { constructor(e){ super((e && e.message) || String(e || 'error')); this.raw = e; } }

const API = {
  sb: null,
  configured(){ return !!(window.supabase && CONFIG.SUPABASE_URL && CONFIG.SUPABASE_ANON_KEY && !/YOUR-/.test(CONFIG.SUPABASE_URL + CONFIG.SUPABASE_ANON_KEY)); },
  init(){
    if (!this.configured()) return false;
    this.sb = window.supabase.createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_ANON_KEY, {
      auth:{ persistSession:true, autoRefreshToken:true, storageKey:'safarchat.session' } });
    return true;
  },
  loginEmail: phone => 'p' + normPhone(phone) + '@' + CONFIG.LOGIN_EMAIL_DOMAIN,
  async call(fn, args = {}){
    const { data, error } = await this.sb.rpc(fn, args);
    if (error) throw new ApiError(error);
    return data;
  },
  async userId(){
    const { data } = await this.sb.auth.getSession();
    return data && data.session ? data.session.user.id : null;
  },
  async signUp({ name, phone, email, password }){
    const email_ = this.loginEmail(phone);
    const { data, error } = await this.sb.auth.signUp({ email:email_, password, options:{ data:{ name, contact_email:email || '' } } });
    if (error) throw new ApiError(error);
    if (!data || !data.session){
      const r = await this.sb.auth.signInWithPassword({ email:email_, password });
      if (r.error) throw new ApiError({ message:'confirm_email_on' });
    }
  },
  async signIn(phone, password){
    const { error } = await this.sb.auth.signInWithPassword({ email:this.loginEmail(phone), password });
    if (error) throw new ApiError(error);
  },
  async signOut(localOnly){ try { await this.sb.auth.signOut(localOnly ? { scope:'local' } : undefined); } catch (e) {} },
  listen(table, filter, cb){
    try { return this.sb.channel('rt-' + table + '-' + uid()).on('postgres_changes', { event:'*', schema:'public', table, filter }, cb).subscribe(); }
    catch (e) { return null; }
  },
  unlisten(ch){ try { if (ch) this.sb.removeChannel(ch); } catch (e) {} }
};

/* Server error codes → messages people can act on. */
const ERR_TEXT = [
  ['User already registered', 'This phone number already has an account. Sign in instead.'],
  ['already been registered', 'This phone number already has an account. Sign in instead.'],
  ['Invalid login credentials', 'Phone number or password is incorrect.'],
  ['confirm_email_on', 'Your account was created, but the server still has email confirmation switched on. The café needs to switch it off in Supabase (see SETUP.md).'],
  ['Email not confirmed', 'The server still has email confirmation switched on. The café needs to switch it off in Supabase (see SETUP.md).'],
  ['Password should be', 'Choose a longer password (at least 8 characters).'],
  ['rate limit', 'Too many attempts. Wait a few minutes and try again.'],
  ['not_signed_in', 'Your session ended. Please sign in again.'],
  ['JWT expired', 'Your session ended. Please sign in again.'],
  ['not_enough_stars', 'You don\'t have enough Stars for that.'],
  ['too_many_stars', 'That\'s more Stars than this order needs. Use fewer Stars.'],
  ['price_changed', 'Prices were just updated. Check the new total and try again.'],
  ['ref_used', 'This transaction ID was already used. Check your payment SMS and try again.'],
  ['bad_ref', 'Enter the transaction ID from your payment SMS (letters and numbers only).'],
  ['bad_pay_phone', 'Enter the phone number you paid from, e.g. 61 234 5678.'],
  ['bad_plate', 'Enter your car plate number (Taargo).'],
  ['bad_building', 'Choose a building from the list.'],
  ['unavailable', 'Something in your order just sold out. Remove it and try again.'],
  ['unknown_product', 'Something in your order is no longer on the menu. Remove it and try again.'],
  ['too_many_orders', 'You placed several orders in a short time. Please wait a few minutes.'],
  ['too_many_shares', 'Please wait a little before sharing more Stars.'],
  ['too_many_gifts', 'Please wait a little before sending more gifts.'],
  ['no_account', 'There is no SafarChat account with this number yet. Ask them to sign up first.'],
  ['self_share', 'You can\'t send Stars to your own number.'],
  ['bad_gift', 'That gift isn\'t available. Pick another one.'],
  ['bad_to_phone', 'Enter the phone number of the person you\'re gifting.'],
  ['bad_to_name', 'Add the name of the person you\'re gifting.'],
  ['bad_email', 'That email doesn\'t look right. Leave it empty or use name@email.com.'],
  ['bad_name', 'Enter your name (2 to 60 characters).'],
  ['bad_photo', 'That photo can\'t be used. Try a different picture.'],
  ['bad_dob', 'Choose a real date of birth.'],
  ['not_staff', 'This account isn\'t staff. Ask an admin to give you access.'],
  ['not_admin', 'Only admins can do that.'],
  ['bad_transition', 'This was already updated by someone else. The list has been refreshed.'],
  ['cannot_demote_self', 'You can\'t remove your own admin access.'],
  ['reset_unavailable', 'This server doesn\'t allow password resets from the app. Reset it in Supabase → Authentication → Users.'],
  ['weak_password', 'Use at least 8 characters.'],
  ['reason_required', 'Write a short reason.'],
  ['bad_price', 'Enter a valid price.'],
  ['bad_hours', 'Closing time must be after opening time.'],
  ['bad_number', 'Enter numbers only.'],
  ['sign up from the SafarChat app', 'Sign-up failed. Check your phone number and try again.'],
  ['Database error saving new user', 'Sign-up failed. Check your phone number and try again.']
];
function errText(e){
  const m = String((e && e.message) || e || '');
  for (const [k, v] of ERR_TEXT) if (m.includes(k)) return v;
  if (/Failed to fetch|NetworkError|network|Load failed/i.test(m)) return 'No internet connection. Check your connection and try again.';
  return 'Something went wrong. Please try again.';
}
