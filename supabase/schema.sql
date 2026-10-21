-- =====================================================================
-- SafarChat Café · Supabase database
-- Run once in Supabase: SQL Editor → New query → paste this file → Run.
-- Safe to run again after updates (it replaces functions and keeps data).
--
-- Security model
--  * Every table has Row Level Security on. The app never writes tables
--    directly: it calls the functions below (Supabase "RPC"), which check
--    who is signed in, validate input and compute every price and Star
--    balance on the server.
--  * Customers can only read their own data. Staff and admins are set by
--    the `role` column in profiles; the owner phone in settings becomes
--    admin automatically on sign-up.
-- =====================================================================

create extension if not exists pgcrypto with schema extensions;

-- ---------- settings (one row) ----------
create table if not exists public.settings (
  id int primary key default 1 check (id = 1),
  owner_phone text not null default '252617475902',
  evc_number text not null default '617475902',
  edahab_number text not null default '627475902',
  premier_number text not null default '00252617475902',
  tax_rate numeric(5,4) not null default 0.05,
  star_usd numeric(6,4) not null default 0.08,
  earn_per_usd int not null default 2,
  delivery_fee numeric(6,2) not null default 1.00,
  welcome_stars int not null default 0,
  birthday_stars int not null default 50,
  buildings jsonb not null default '["Dahab Tower"]'::jsonb
);
insert into public.settings (id) values (1) on conflict (id) do nothing;

-- ---------- stores ----------
create table if not exists public.stores (
  id text primary key,
  name text not null,
  address text not null,
  phone text not null default '',
  open_min int not null default 390,     -- 6:30 AM, Mogadishu time
  close_min int not null default 1410,   -- 11:30 PM
  closed_override boolean not null default false,
  active boolean not null default true
);
insert into public.stores (id, name, address, phone)
values ('dahab', 'SafarChat Café · Dahab Tower', 'Dahab Tower, Ground Floor · KM4, Hodan, Mogadishu', '+252 61 747 5902')
on conflict (id) do nothing;

-- ---------- menu ----------
create table if not exists public.products (
  id text primary key,
  sub text not null,
  name text not null,
  price numeric(8,2) not null check (price >= 0),
  description text not null default '',
  art text not null default '',
  milk boolean not null default false,
  is_new boolean not null default false,
  signature boolean not null default false,
  kcal int not null default 0,
  available boolean not null default true,
  sort int not null default 0
);

create table if not exists public.gift_catalog (
  cat text not null,
  sub text not null check (sub in ('bundles','boxes')),
  name text not null,
  description text not null default '',
  price numeric(8,2) not null check (price > 0),
  primary key (cat, sub, name)
);

-- ---------- people ----------
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  phone text not null unique check (phone ~ '^252[679][0-9]{8}$'),
  name text not null check (char_length(name) between 2 and 60),
  email text check (email is null or char_length(email) <= 120),
  gender text not null default '' check (gender in ('', 'Male', 'Female')),
  dob date,
  photo text check (photo is null or char_length(photo) <= 300000),
  address jsonb not null default '{}'::jsonb,
  role text not null default 'customer' check (role in ('customer', 'staff', 'admin')),
  stars int not null default 0 check (stars >= 0),
  bday_year int,
  created_at timestamptz not null default now()
);

create table if not exists public.star_ledger (
  id bigserial primary key,
  user_id uuid not null references public.profiles (id) on delete cascade,
  kind text not null,
  title text not null,
  detail text not null default '',
  stars int not null,
  usd numeric(8,2),
  order_id bigint,
  created_at timestamptz not null default now()
);
create index if not exists star_ledger_user_idx on public.star_ledger (user_id, created_at desc);

create table if not exists public.notifications (
  id bigserial primary key,
  user_id uuid not null references public.profiles (id) on delete cascade,
  icon text not null default 'bell',
  title text not null,
  body text not null default '',
  read boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists notifications_user_idx on public.notifications (user_id, created_at desc);

create table if not exists public.favorites (
  user_id uuid not null references public.profiles (id) on delete cascade,
  product_id text not null references public.products (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, product_id)
);

-- ---------- orders ----------
create sequence if not exists public.order_code_seq start 1001;
create table if not exists public.orders (
  id bigserial primary key,
  code text not null unique default ('SC-' || nextval('public.order_code_seq')),
  user_id uuid references public.profiles (id) on delete set null,
  customer_name text not null,
  customer_phone text not null,
  store_id text not null references public.stores (id),
  items jsonb not null,
  mode text not null check (mode in ('store', 'car', 'delivery')),
  pickup_time text not null,
  plate text, car text, building text, floor text, door text, note text,
  subtotal numeric(8,2) not null,
  stars_used int not null default 0,
  discount numeric(8,2) not null default 0,
  tax numeric(8,2) not null,
  delivery_fee numeric(8,2) not null default 0,
  total numeric(8,2) not null,
  pay_method text not null check (pay_method in ('evc', 'edahab', 'premier', 'stars')),
  pay_phone text,
  pay_ref text,
  stars_paid int not null default 0,
  stars_earned int not null default 0,
  status text not null check (status in ('payment_review', 'paid', 'preparing', 'ready', 'on_the_way', 'completed', 'rejected', 'cancelled')),
  status_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists orders_user_idx on public.orders (user_id, created_at desc);
create index if not exists orders_status_idx on public.orders (status, created_at desc);

-- ---------- gifts ----------
create table if not exists public.gifts (
  id bigserial primary key,
  code text not null unique default ('G-' || upper(substr(md5(random()::text), 1, 6))),
  sender_id uuid references public.profiles (id) on delete set null,
  sender_phone text not null,
  cat text not null,
  kind text not null check (kind in ('card', 'bundles', 'boxes')),
  item text not null,
  amount numeric(8,2) not null,
  to_name text not null,
  to_phone text not null,
  message text not null default '',
  from_name text not null,
  recipient_id uuid references public.profiles (id) on delete set null,
  pay_method text not null check (pay_method in ('evc', 'edahab', 'premier')),
  pay_phone text not null,
  pay_ref text not null,
  status text not null default 'payment_review' check (status in ('payment_review', 'sent', 'rejected', 'redeemed')),
  status_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists gifts_sender_idx on public.gifts (sender_id, created_at desc);

-- =====================================================================
-- Helpers (internal: not callable from the app)
-- =====================================================================
create or replace function public._me() returns uuid
language plpgsql stable set search_path = public as $$
declare u uuid := auth.uid();
begin
  if u is null then raise exception 'not_signed_in'; end if;
  return u;
end $$;

create or replace function public._norm_phone(v text) returns text
language plpgsql immutable as $$
declare d text := regexp_replace(coalesce(v, ''), '[^0-9]', '', 'g');
begin
  if char_length(d) < 9 then return null; end if;
  d := '252' || right(d, 9);
  if d !~ '^252[679][0-9]{8}$' then return null; end if;
  return d;
end $$;

create or replace function public._fmt_phone(p text) returns text
language sql immutable as $$
  select case when p is null then '' else '+252 ' || substr(p, 4, 2) || ' ' || substr(p, 6, 3) || ' ' || substr(p, 9, 4) end
$$;

create or replace function public._mask_phone(p text) returns text
language sql immutable as $$
  select case when p is null then '' else '+252 ' || substr(p, 4, 2) || ' *** ' || substr(p, 9, 4) end
$$;

create or replace function public._notify(p_user uuid, p_icon text, p_title text, p_body text) returns void
language sql security definer set search_path = public as $$
  insert into notifications (user_id, icon, title, body)
  select p_user, p_icon, left(p_title, 140), left(p_body, 500) where p_user is not null
$$;

create or replace function public._ledger(p_user uuid, p_kind text, p_title text, p_detail text, p_stars int, p_usd numeric, p_order bigint) returns void
language sql security definer set search_path = public as $$
  insert into star_ledger (user_id, kind, title, detail, stars, usd, order_id)
  select p_user, p_kind, p_title, left(coalesce(p_detail, ''), 300), p_stars, p_usd, p_order where p_user is not null
$$;

create or replace function public.is_staff() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from profiles where id = auth.uid() and role in ('staff', 'admin'))
$$;

create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from profiles where id = auth.uid() and role = 'admin')
$$;

create or replace function public._require_staff() returns void
language plpgsql stable security definer set search_path = public as $$
begin
  if not public.is_staff() then raise exception 'not_staff'; end if;
end $$;

create or replace function public._require_admin() returns void
language plpgsql stable security definer set search_path = public as $$
begin
  if not public.is_admin() then raise exception 'not_admin'; end if;
end $$;

-- Price and label of one cart line. Mirrors js/pages/product.js; the server value is the one charged.
create or replace function public._line(pr public.products, sel jsonb, out unit numeric, out label text)
language plpgsql stable set search_path = public as $$
declare
  k text; v text; n int; fprice numeric; parts text[] := '{}'; f record; note text;
begin
  if jsonb_typeof(coalesce(sel, '{}'::jsonb)) <> 'object' then raise exception 'bad_option'; end if;
  sel := coalesce(sel, '{}'::jsonb);
  k := case
    when pr.sub in ('hotcoffee','icedcoffee','hottea','icedtea','matcha','refreshers','frappes','smoothies') then 'drink'
    when pr.sub = 'bottled' then 'bottle'
    else pr.sub end;
  unit := pr.price;
  if k = 'drink' then
    v := coalesce(sel->>'size', 'Regular');
    unit := unit + case v when 'Regular' then 0 when 'Medium' then 0.50 when 'Large' then 1.00 end;
    if unit is null then raise exception 'bad_option: size'; end if;
    parts := parts || v;
    if pr.milk then
      v := coalesce(sel->>'milk', 'Whole');
      unit := unit + case v when 'Whole' then 0 when 'Camel Milk' then 0.50 when 'Oat' then 0.60 when 'Almond' then 0.60 end;
      if unit is null then raise exception 'bad_option: milk'; end if;
      if v <> 'Whole' then parts := parts || v; end if;
    end if;
    v := coalesce(sel->>'sugar', 'Sugar');
    if v not in ('Sugar', 'Diet Sugar', 'No Sugar') then raise exception 'bad_option: sugar'; end if;
    parts := parts || v;
    n := coalesce((sel->>'sweet')::int, 0);
    if n not between 0 and 2 then raise exception 'bad_option: sweet'; end if;
    if v <> 'No Sugar' then parts := parts || ((array['Normal', 'Medium', 'Too Sweet'])[n + 1] || ' sweet'); end if;
    if pr.art like 'iced:%' then
      v := coalesce(sel->>'ice', 'Regular ice');
      if v not in ('Light ice', 'Regular ice', 'Extra ice') then raise exception 'bad_option: ice'; end if;
      if v <> 'Regular ice' then parts := parts || v; end if;
    end if;
    if sel ? 'flav' then
      if jsonb_typeof(sel->'flav') <> 'object' then raise exception 'bad_option: flavour'; end if;
      for f in select key, value from jsonb_each(sel->'flav') order by key loop
        n := (f.value #>> '{}')::int;
        fprice := case f.key when 'Vanilla' then 0.40 when 'Caramel' then 0.40 when 'Hazelnut' then 0.40
                             when 'Cardamom' then 0.40 when 'Cinnamon' then 0.40 when 'Saffron' then 0.75 end;
        if fprice is null or n is null or n not between 0 and 6 then raise exception 'bad_option: flavour'; end if;
        if n > 0 then unit := unit + fprice * n; parts := parts || ('+' || n || ' ' || f.key); end if;
      end loop;
    end if;
    n := coalesce((sel->>'shots')::int, 0);
    if n not between 0 and 4 or (n > 0 and pr.sub not in ('hotcoffee','icedcoffee','frappes','matcha')) then raise exception 'bad_option: shots'; end if;
    if n > 0 then unit := unit + 0.75 * n; parts := parts || ('+' || n || ' shot' || case when n > 1 then 's' else '' end); end if;
  elsif k = 'bottle' then
    v := coalesce(sel->>'temp', 'Chilled');
    if v not in ('Chilled', 'Room temperature') then raise exception 'bad_option: temp'; end if;
    parts := parts || v;
  else
    if k = 'cakes' then
      v := coalesce(sel->>'serve', 'Slice');
      if v not in ('Slice', 'Whole cake') then raise exception 'bad_option: serve'; end if;
      if v = 'Whole cake' then unit := pr.price * 7; end if;
      parts := parts || v;
    end if;
    v := coalesce(sel->>'warm', case when k = 'cakes' then 'Normal' else 'Warmed' end);
    if v not in ('Warmed', 'Normal') then raise exception 'bad_option: warm'; end if;
    parts := parts || v;
    if k = 'sandwiches' then
      n := coalesce((sel->>'cheese')::int, 0);
      if n not between 0 and 3 then raise exception 'bad_option: cheese'; end if;
      if n > 0 then unit := unit + 0.50 * n; parts := parts || ('+' || n || ' extra cheese'); end if;
    end if;
  end if;
  note := btrim(left(coalesce(sel->>'note', ''), 120));
  if note <> '' then parts := parts || ('“' || note || '”'); end if;
  unit := round(unit, 2);
  label := array_to_string(parts, ' · ');
end $$;

-- Totals for a cart. Used by quote_order (preview) and place_order (charge).
create or replace function public._order_calc(p jsonb) returns jsonb
language plpgsql stable security definer set search_path = public as $$
declare
  uid uuid := public._me();
  me profiles; st settings; it jsonb; pr products; ln record; q int;
  lines jsonb := '[]'::jsonb; sub numeric := 0; su int; disc numeric; taxable numeric; tax numeric; fee numeric; total numeric;
begin
  select * into me from profiles where id = uid;
  if not found then raise exception 'no_profile'; end if;
  select * into st from settings where id = 1;
  if jsonb_typeof(p->'items') <> 'array' or jsonb_array_length(p->'items') = 0 then raise exception 'empty_cart'; end if;
  if jsonb_array_length(p->'items') > 30 then raise exception 'too_many_items'; end if;
  for it in select value from jsonb_array_elements(p->'items') loop
    select * into pr from products where id = it->>'product_id';
    if not found then raise exception 'unknown_product'; end if;
    if not pr.available then raise exception 'unavailable: %', pr.name; end if;
    q := (it->>'qty')::int;
    if q is null or q not between 1 and 20 then raise exception 'bad_qty'; end if;
    select * into ln from public._line(pr, it->'sel');
    lines := lines || jsonb_build_object('product_id', pr.id, 'name', pr.name, 'qty', q, 'unit', ln.unit, 'opts', ln.label, 'art', pr.art);
    sub := sub + ln.unit * q;
  end loop;
  fee := case when coalesce(p->>'mode', 'store') = 'delivery' then st.delivery_fee else 0 end;
  su := coalesce((p->>'stars_used')::int, 0);
  if su < 0 or su % 100 <> 0 then raise exception 'bad_stars'; end if;
  if su > me.stars then raise exception 'not_enough_stars'; end if;
  if su * st.star_usd > sub then raise exception 'too_many_stars'; end if;
  disc := su * st.star_usd;
  taxable := sub - disc;
  tax := round(taxable * st.tax_rate, 2);
  total := round(taxable + tax + fee, 2);
  return jsonb_build_object(
    'items', lines, 'subtotal', round(sub, 2), 'stars_used', su, 'discount', round(disc, 2), 'tax', tax,
    'delivery_fee', fee, 'total', total, 'stars_needed', ceil(total / st.star_usd)::int,
    'stars_to_earn', floor(total * st.earn_per_usd)::int, 'balance', me.stars);
end $$;

-- =====================================================================
-- Public data (anyone, signed in or not)
-- =====================================================================
create or replace function public.get_menu() returns jsonb
language sql stable security definer set search_path = public as $$
  select jsonb_build_object(
    'products', coalesce((select jsonb_agg(to_jsonb(p) order by p.sort) from products p), '[]'::jsonb),
    'stores', coalesce((select jsonb_agg(jsonb_build_object(
        'id', s.id, 'name', s.name, 'address', s.address, 'phone', s.phone, 'open_min', s.open_min, 'close_min', s.close_min,
        'is_open', (not s.closed_override) and (extract(hour from now() at time zone 'Africa/Mogadishu') * 60
                    + extract(minute from now() at time zone 'Africa/Mogadishu')) between s.open_min and s.close_min - 1,
        'closed_override', s.closed_override)) from stores s where s.active), '[]'::jsonb),
    'settings', (select jsonb_build_object('evc_number', evc_number, 'edahab_number', edahab_number, 'premier_number', premier_number,
        'tax_rate', tax_rate, 'star_usd', star_usd, 'earn_per_usd', earn_per_usd, 'delivery_fee', delivery_fee,
        'birthday_stars', birthday_stars, 'buildings', buildings) from settings where id = 1),
    'gift_catalog', coalesce((select jsonb_agg(to_jsonb(g)) from gift_catalog g), '[]'::jsonb))
$$;

-- =====================================================================
-- Signed-in customer
-- =====================================================================
create or replace function public.get_my_state() returns jsonb
language plpgsql stable security definer set search_path = public as $$
declare uid uuid := public._me();
begin
  return jsonb_build_object(
    'profile', (select to_jsonb(p) - 'bday_year' from profiles p where p.id = uid),
    'ledger', coalesce((select jsonb_agg(to_jsonb(l) order by l.created_at desc, l.id desc) from
        (select * from star_ledger where user_id = uid order by created_at desc, id desc limit 300) l), '[]'::jsonb),
    'orders', coalesce((select jsonb_agg(to_jsonb(o) order by o.created_at desc) from
        (select * from orders where user_id = uid order by created_at desc limit 60) o), '[]'::jsonb),
    'notes', coalesce((select jsonb_agg(to_jsonb(n) order by n.created_at desc, n.id desc) from
        (select * from notifications where user_id = uid order by created_at desc, id desc limit 60) n), '[]'::jsonb),
    'gifts', coalesce((select jsonb_agg(to_jsonb(g) order by g.created_at desc) from
        (select * from gifts where sender_id = uid order by created_at desc limit 60) g), '[]'::jsonb),
    'favs', coalesce((select jsonb_agg(product_id order by created_at desc) from favorites where user_id = uid), '[]'::jsonb));
end $$;

create or replace function public.quote_order(p jsonb) returns jsonb
language sql stable security definer set search_path = public as $$
  select public._order_calc(p)
$$;

create or replace function public.place_order(p jsonb) returns jsonb
language plpgsql security definer set search_path = public as $$
declare
  uid uuid := public._me();
  c jsonb; me profiles; st settings; s stores; o orders;
  v_mode text; v_time text; v_plate text; v_car text; v_building text; v_floor text; v_door text; v_note text;
  v_method text; v_pay_phone text; v_ref text; v_status text; v_paid int := 0; v_su int; v_total numeric;
begin
  if (select count(*) from orders where user_id = uid and created_at > now() - interval '10 minutes') >= 8 then
    raise exception 'too_many_orders';
  end if;
  select * into me from profiles where id = uid for update;
  select * into st from settings where id = 1;
  c := public._order_calc(p);
  v_total := (c->>'total')::numeric;
  v_su := (c->>'stars_used')::int;
  if p ? 'expected_total' and (p->>'expected_total')::numeric <> v_total then raise exception 'price_changed'; end if;

  select * into s from stores where id = coalesce(p->>'store_id', 'dahab') and active;
  if not found then raise exception 'bad_store'; end if;

  v_mode := coalesce(p->>'mode', 'store');
  if v_mode not in ('store', 'car', 'delivery') then raise exception 'bad_mode'; end if;
  v_time := coalesce(p->>'pickup_time', 'Now');
  if v_time not in ('Now', '5-10 min', '10-15 min', '15-20 min') then raise exception 'bad_time'; end if;
  v_note := left(btrim(coalesce(p->>'note', '')), 200);
  if v_mode = 'car' then
    v_plate := upper(btrim(coalesce(p->>'plate', '')));
    if v_plate !~ '^[A-Z0-9][A-Z0-9 -]{1,11}$' then raise exception 'bad_plate'; end if;
    v_car := left(btrim(coalesce(p->>'car', '')), 40);
  elsif v_mode = 'delivery' then
    v_building := btrim(coalesce(p->>'building', ''));
    if not (st.buildings ? v_building) then raise exception 'bad_building'; end if;
    v_floor := left(btrim(coalesce(p->>'floor', '')), 8);
    v_door := left(btrim(coalesce(p->>'door', '')), 8);
  end if;

  v_method := p->>'pay_method';
  if v_method = 'stars' then
    v_paid := (c->>'stars_needed')::int;
    if me.stars - v_su < v_paid then raise exception 'not_enough_stars'; end if;
    v_status := 'paid';
  elsif v_method in ('evc', 'edahab', 'premier') then
    v_pay_phone := public._norm_phone(p->>'pay_phone');
    if v_pay_phone is null then raise exception 'bad_pay_phone'; end if;
    v_ref := btrim(coalesce(p->>'pay_ref', ''));
    if v_ref !~ '^[A-Za-z0-9-]{4,40}$' then raise exception 'bad_ref'; end if;
    if exists (select 1 from orders where pay_method = v_method and upper(pay_ref) = upper(v_ref) and status <> 'rejected')
       or exists (select 1 from gifts where pay_method = v_method and upper(pay_ref) = upper(v_ref) and status <> 'rejected') then
      raise exception 'ref_used';
    end if;
    v_status := 'payment_review';
  else
    raise exception 'bad_method';
  end if;

  update profiles set stars = stars - v_su - v_paid where id = uid;
  insert into orders (user_id, customer_name, customer_phone, store_id, items, mode, pickup_time, plate, car, building, floor, door, note,
                      subtotal, stars_used, discount, tax, delivery_fee, total, pay_method, pay_phone, pay_ref, stars_paid, status)
  values (uid, me.name, me.phone, s.id, c->'items', v_mode, v_time, v_plate, v_car, v_building, v_floor, v_door, nullif(v_note, ''),
          (c->>'subtotal')::numeric, v_su, (c->>'discount')::numeric, (c->>'tax')::numeric, (c->>'delivery_fee')::numeric, v_total,
          v_method, v_pay_phone, v_ref, v_paid, v_status)
  returning * into o;

  if v_su > 0 then
    perform public._ledger(uid, 'redeem', 'Redeemed Stars', v_su || '★ applied · $' || to_char(v_su * st.star_usd, 'FM9990.00') || ' off order ' || o.code, -v_su, null, o.id);
  end if;
  if v_paid > 0 then
    perform public._ledger(uid, 'pay', 'Paid with Stars', 'Order ' || o.code || ' · $' || to_char(v_total, 'FM9990.00'), -v_paid, null, o.id);
    perform public._notify(uid, 'receipt', 'Order ' || o.code || ' paid', 'Paid with ' || v_paid || ' Stars. We''re preparing it now.');
  else
    perform public._notify(uid, 'receipt', 'Order ' || o.code || ' received',
      'We''re checking your payment of $' || to_char(v_total, 'FM9990.00') || '. You''ll get a message as soon as it''s confirmed.');
  end if;
  return to_jsonb(o);
end $$;

create or replace function public.share_stars(p_phone text, p_amount int, p_message text default '') returns jsonb
language plpgsql security definer set search_path = public as $$
declare
  uid uuid := public._me();
  v_phone text := public._norm_phone(p_phone);
  me profiles; tgt profiles; msg text := left(btrim(coalesce(p_message, '')), 100);
begin
  if v_phone is null then raise exception 'bad_phone'; end if;
  if p_amount is null or p_amount < 10 or p_amount > 10000 then raise exception 'bad_amount'; end if;
  if (select count(*) from star_ledger where user_id = uid and kind = 'share' and created_at > now() - interval '1 hour') >= 10 then
    raise exception 'too_many_shares';
  end if;
  select * into tgt from profiles where phone = v_phone;
  if not found then raise exception 'no_account'; end if;
  if tgt.id = uid then raise exception 'self_share'; end if;
  -- lock both rows in a fixed order
  perform 1 from profiles where id in (uid, tgt.id) order by id for update;
  select * into me from profiles where id = uid;
  if me.stars < p_amount then raise exception 'not_enough_stars'; end if;
  update profiles set stars = stars - p_amount where id = uid;
  update profiles set stars = stars + p_amount where id = tgt.id;
  perform public._ledger(uid, 'share', 'Stars shared', 'To ' || tgt.name || ' · ' || public._mask_phone(tgt.phone) || case when msg <> '' then ' · “' || msg || '”' else '' end, -p_amount, null, null);
  perform public._ledger(tgt.id, 'receive', 'Stars received', 'From ' || me.name || ' · ' || public._mask_phone(me.phone) || case when msg <> '' then ' · “' || msg || '”' else '' end, p_amount, null, null);
  perform public._notify(uid, 'share', 'You sent ' || p_amount || ' Stars', tgt.name || ' (' || public._mask_phone(tgt.phone) || ') received ' || p_amount || '★.');
  perform public._notify(tgt.id, 'star', me.name || ' sent you ' || p_amount || ' Stars', p_amount || '★ are now in your Rewards.' || case when msg <> '' then ' “' || msg || '”' else '' end);
  return jsonb_build_object('stars', me.stars - p_amount, 'to_name', tgt.name);
end $$;

create or replace function public.send_gift(p jsonb) returns jsonb
language plpgsql security definer set search_path = public as $$
declare
  uid uuid := public._me();
  me profiles; g gifts; v_cat text := p->>'cat'; v_kind text := p->>'kind'; v_item text; v_amount numeric; v_cat_name text;
  v_to_phone text; v_pay_phone text; v_ref text; v_method text := p->>'pay_method';
begin
  select * into me from profiles where id = uid;
  if (select count(*) from gifts where sender_id = uid and created_at > now() - interval '1 hour') >= 10 then raise exception 'too_many_gifts'; end if;
  v_cat_name := case v_cat when 'birthday' then 'Birthday' when 'thanks' then 'Thank You' when 'congrats' then 'Congratulations'
                           when 'bye' then 'Bye Bye' when 'eid' then 'Eid Mubarak' when 'just' then 'Just Because' end;
  if v_cat_name is null then raise exception 'bad_gift'; end if;
  if v_kind = 'card' then
    v_amount := (p->>'amount')::numeric;
    if v_amount not in (5, 10, 25, 50) then raise exception 'bad_gift'; end if;
    v_item := v_cat_name || ' eGift Card';
  elsif v_kind in ('bundles', 'boxes') then
    select name, price into v_item, v_amount from gift_catalog where cat = v_cat and sub = v_kind and name = p->>'item';
    if not found then raise exception 'bad_gift'; end if;
  else
    raise exception 'bad_gift';
  end if;
  if p ? 'expected_amount' and (p->>'expected_amount')::numeric <> v_amount then raise exception 'price_changed'; end if;
  if char_length(btrim(coalesce(p->>'to_name', ''))) not between 1 and 40 then raise exception 'bad_to_name'; end if;
  v_to_phone := public._norm_phone(p->>'to_phone');
  if v_to_phone is null then raise exception 'bad_to_phone'; end if;
  if v_method not in ('evc', 'edahab', 'premier') then raise exception 'bad_method'; end if;
  v_pay_phone := public._norm_phone(p->>'pay_phone');
  if v_pay_phone is null then raise exception 'bad_pay_phone'; end if;
  v_ref := btrim(coalesce(p->>'pay_ref', ''));
  if v_ref !~ '^[A-Za-z0-9-]{4,40}$' then raise exception 'bad_ref'; end if;
  if exists (select 1 from orders where pay_method = v_method and upper(pay_ref) = upper(v_ref) and status <> 'rejected')
     or exists (select 1 from gifts where pay_method = v_method and upper(pay_ref) = upper(v_ref) and status <> 'rejected') then
    raise exception 'ref_used';
  end if;
  insert into gifts (sender_id, sender_phone, cat, kind, item, amount, to_name, to_phone, message, from_name, pay_method, pay_phone, pay_ref)
  values (uid, me.phone, v_cat, v_kind, v_item, v_amount, btrim(p->>'to_name'), v_to_phone, left(btrim(coalesce(p->>'message', '')), 140),
          coalesce(nullif(left(btrim(coalesce(p->>'from_name', '')), 40), ''), me.name), v_method, v_pay_phone, v_ref)
  returning * into g;
  perform public._notify(uid, 'gift', 'Gift received for checking', v_item || ' ($' || to_char(v_amount, 'FM9990.00') || ') for ' || g.to_name || '. We''ll send it as soon as your payment is confirmed.');
  return to_jsonb(g);
end $$;

create or replace function public.update_profile(p jsonb) returns jsonb
language plpgsql security definer set search_path = public as $$
declare
  uid uuid := public._me();
  st settings; a jsonb := coalesce(p->'address', '{}'::jsonb); v_email text; v_dob date; v_photo text;
begin
  select * into st from settings where id = 1;
  if char_length(btrim(coalesce(p->>'name', ''))) not between 2 and 60 then raise exception 'bad_name'; end if;
  v_email := nullif(lower(btrim(coalesce(p->>'email', ''))), '');
  if v_email is not null and (v_email !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' or char_length(v_email) > 120) then raise exception 'bad_email'; end if;
  if coalesce(p->>'gender', '') not in ('', 'Male', 'Female') then raise exception 'bad_gender'; end if;
  v_dob := nullif(p->>'dob', '')::date;
  if v_dob is not null and (v_dob > current_date or v_dob < date '1900-01-01') then raise exception 'bad_dob'; end if;
  v_photo := nullif(p->>'photo', '');
  if v_photo is not null and (v_photo !~ '^data:image/(jpeg|png|webp);base64,' or char_length(v_photo) > 300000) then raise exception 'bad_photo'; end if;
  if jsonb_typeof(a) <> 'object' then raise exception 'bad_address'; end if;
  if coalesce(a->>'building', '') <> '' and not (st.buildings ? (a->>'building')) then raise exception 'bad_building'; end if;
  update profiles set
    name = btrim(regexp_replace(p->>'name', '\s+', ' ', 'g')),
    email = v_email,
    gender = coalesce(p->>'gender', ''),
    dob = v_dob,
    photo = v_photo,
    address = jsonb_build_object(
      'building', coalesce(a->>'building', ''), 'floor', left(coalesce(a->>'floor', ''), 8), 'door', left(coalesce(a->>'door', ''), 8),
      'country', 'Somalia', 'region', left(coalesce(a->>'region', ''), 40), 'district', left(coalesce(a->>'district', ''), 40))
  where id = uid;
  return (select to_jsonb(pr) - 'bday_year' from profiles pr where pr.id = uid);
end $$;

create or replace function public.mark_notes_read() returns void
language sql security definer set search_path = public as $$
  update notifications set read = true where user_id = public._me() and not read
$$;

create or replace function public.toggle_fav(p_product text) returns boolean
language plpgsql security definer set search_path = public as $$
declare uid uuid := public._me();
begin
  if exists (select 1 from favorites where user_id = uid and product_id = p_product) then
    delete from favorites where user_id = uid and product_id = p_product;
    return false;
  end if;
  if not exists (select 1 from products where id = p_product) then raise exception 'unknown_product'; end if;
  insert into favorites (user_id, product_id) values (uid, p_product);
  return true;
end $$;

-- Once a year, on the date of birth in Profile (Mogadishu date).
create or replace function public.claim_birthday() returns int
language plpgsql security definer set search_path = public as $$
declare
  uid uuid := public._me(); me profiles; st settings;
  today date := (now() at time zone 'Africa/Mogadishu')::date;
begin
  select * into me from profiles where id = uid for update;
  select * into st from settings where id = 1;
  if me.dob is null or st.birthday_stars <= 0 then return 0; end if;
  if extract(month from me.dob) <> extract(month from today) or extract(day from me.dob) <> extract(day from today) then return 0; end if;
  if me.bday_year = extract(year from today) then return 0; end if;
  update profiles set stars = stars + st.birthday_stars, bday_year = extract(year from today) where id = uid;
  perform public._ledger(uid, 'bonus', 'Birthday treat', 'Happy birthday from SafarChat Café', st.birthday_stars, null, null);
  perform public._notify(uid, 'cake', 'Happy birthday, ' || split_part(me.name, ' ', 1) || '!', 'We added ' || st.birthday_stars || ' Stars to your account. Enjoy a treat on us.');
  return st.birthday_stars;
end $$;

create or replace function public.delete_my_account() returns void
language plpgsql security definer set search_path = public as $$
declare uid uuid := public._me();
begin
  begin
    delete from auth.users where id = uid;          -- removes the login and (by cascade) the profile
  exception when insufficient_privilege then
    delete from profiles where id = uid;            -- fallback: remove all personal data
  end;
end $$;

-- =====================================================================
-- Staff
-- =====================================================================
create or replace function public.staff_list_orders() returns jsonb
language plpgsql stable security definer set search_path = public as $$
begin
  perform public._require_staff();
  return coalesce((select jsonb_agg(to_jsonb(o) order by o.created_at desc) from (
    select * from orders
    where status in ('payment_review', 'paid', 'preparing', 'ready', 'on_the_way') or updated_at > now() - interval '24 hours'
    order by created_at desc limit 300) o), '[]'::jsonb);
end $$;

create or replace function public.staff_set_order_status(p_id bigint, p_status text, p_note text default null) returns jsonb
language plpgsql security definer set search_path = public as $$
declare
  o orders; st settings; s stores; v_earn int := 0; v_back int; v_take int; v_note text := nullif(left(btrim(coalesce(p_note, '')), 200), '');
  ok boolean;
begin
  perform public._require_staff();
  select * into st from settings where id = 1;
  select * into o from orders where id = p_id for update;
  if not found then raise exception 'unknown_order'; end if;
  select * into s from stores where id = o.store_id;
  ok := (o.status, p_status) in (
    ('payment_review', 'paid'), ('payment_review', 'rejected'),
    ('paid', 'preparing'), ('paid', 'cancelled'),
    ('preparing', 'ready'), ('preparing', 'on_the_way'), ('preparing', 'cancelled'),
    ('ready', 'completed'), ('on_the_way', 'completed'));
  if not ok then raise exception 'bad_transition'; end if;
  if o.user_id is not null then perform 1 from profiles where id = o.user_id for update; end if;

  if p_status = 'paid' then
    v_earn := floor(o.total * st.earn_per_usd)::int;
    if o.user_id is not null and v_earn > 0 then
      update profiles set stars = stars + v_earn where id = o.user_id;
      perform public._ledger(o.user_id, 'earn', 'Order at ' || split_part(s.name, '· ', 2),
        (select string_agg((i->>'name') || case when (i->>'qty')::int > 1 then ' ×' || (i->>'qty') else '' end, ', ') from jsonb_array_elements(o.items) i)
        || ' · $' || to_char(o.total, 'FM9990.00'), v_earn, o.total, o.id);
    end if;
    perform public._notify(o.user_id, 'check', 'Payment confirmed · ' || o.code,
      'Thank you! We''re preparing your order.' || case when v_earn > 0 then ' You earned ' || v_earn || ' Stars.' else '' end);
  elsif p_status = 'rejected' then
    if o.stars_used > 0 then
      update profiles set stars = stars + o.stars_used where id = o.user_id;
      perform public._ledger(o.user_id, 'refund', 'Stars returned', 'Order ' || o.code || ' was not completed', o.stars_used, null, o.id);
    end if;
    perform public._notify(o.user_id, 'info', 'Payment not confirmed · ' || o.code,
      coalesce(v_note, 'We couldn''t find your payment. Please check the transaction ID or contact the café.'));
  elsif p_status = 'cancelled' then
    v_back := o.stars_used + o.stars_paid;
    if v_back > 0 and o.user_id is not null then
      update profiles set stars = stars + v_back where id = o.user_id;
      perform public._ledger(o.user_id, 'refund', 'Stars returned', 'Order ' || o.code || ' was cancelled', v_back, null, o.id);
    end if;
    if o.stars_earned > 0 and o.user_id is not null then
      select least(stars, o.stars_earned) into v_take from profiles where id = o.user_id;
      if v_take > 0 then
        update profiles set stars = stars - v_take where id = o.user_id;
        perform public._ledger(o.user_id, 'reverse', 'Stars removed', 'Order ' || o.code || ' was cancelled', -v_take, null, o.id);
      end if;
    end if;
    perform public._notify(o.user_id, 'info', 'Order cancelled · ' || o.code,
      coalesce(v_note, 'Your order was cancelled. Contact the café about any money paid.'));
  elsif p_status = 'ready' then
    perform public._notify(o.user_id, 'cup', 'Order ' || o.code || ' is ready',
      case when o.mode = 'car' then 'We''re bringing it to your car (' || coalesce(o.plate, '') || ').' else 'It''s waiting for you at the counter. Enjoy it with pleasure!' end);
  elsif p_status = 'on_the_way' then
    perform public._notify(o.user_id, 'bike', 'Order ' || o.code || ' is on the way', 'Your rider is heading to ' || coalesce(o.building, 'you') || '.');
  end if;

  update orders set status = p_status, status_note = coalesce(v_note, status_note),
         stars_earned = case when p_status = 'paid' then v_earn when p_status = 'cancelled' then 0 else stars_earned end,
         updated_at = now()
  where id = p_id returning * into o;
  return to_jsonb(o);
end $$;

create or replace function public.staff_list_gifts() returns jsonb
language plpgsql stable security definer set search_path = public as $$
begin
  perform public._require_staff();
  return coalesce((select jsonb_agg(to_jsonb(g) order by g.created_at desc) from (
    select * from gifts where status in ('payment_review', 'sent') or updated_at > now() - interval '7 days'
    order by created_at desc limit 200) g), '[]'::jsonb);
end $$;

create or replace function public.staff_set_gift_status(p_id bigint, p_status text, p_note text default null) returns jsonb
language plpgsql security definer set search_path = public as $$
declare g gifts; r profiles; v_note text := nullif(left(btrim(coalesce(p_note, '')), 200), '');
begin
  perform public._require_staff();
  select * into g from gifts where id = p_id for update;
  if not found then raise exception 'unknown_gift'; end if;
  if (g.status, p_status) not in (('payment_review', 'sent'), ('payment_review', 'rejected'), ('sent', 'redeemed')) then
    raise exception 'bad_transition';
  end if;
  if p_status = 'sent' then
    select * into r from profiles where phone = g.to_phone;
    perform public._notify(r.id, 'gift', g.from_name || ' sent you a gift',
      g.item || ' ($' || to_char(g.amount, 'FM9990.00') || ')' || case when g.message <> '' then ': “' || g.message || '”' else '' end
      || '. Show gift code ' || g.code || ' at the counter to enjoy it.');
    perform public._notify(g.sender_id, 'gift', 'Gift sent to ' || g.to_name, 'Payment confirmed. ' || g.to_name || ' got gift code ' || g.code || '.');
    update gifts set status = 'sent', recipient_id = r.id, updated_at = now() where id = p_id returning * into g;
  elsif p_status = 'rejected' then
    perform public._notify(g.sender_id, 'info', 'Gift payment not confirmed', coalesce(v_note, 'We couldn''t find your payment for ' || g.item || '. Please contact the café.'));
    update gifts set status = 'rejected', status_note = v_note, updated_at = now() where id = p_id returning * into g;
  else
    update gifts set status = 'redeemed', updated_at = now() where id = p_id returning * into g;
  end if;
  return to_jsonb(g);
end $$;

-- =====================================================================
-- Admin
-- =====================================================================
create or replace function public.admin_update_product(p_id text, p_price numeric, p_available boolean) returns jsonb
language plpgsql security definer set search_path = public as $$
declare pr products;
begin
  perform public._require_admin();
  if p_price is null or p_price < 0 or p_price > 1000 then raise exception 'bad_price'; end if;
  update products set price = round(p_price, 2), available = coalesce(p_available, available) where id = p_id returning * into pr;
  if not found then raise exception 'unknown_product'; end if;
  return to_jsonb(pr);
end $$;

create or replace function public.admin_update_store(p_id text, p_open_min int, p_close_min int, p_closed_override boolean) returns jsonb
language plpgsql security definer set search_path = public as $$
declare s stores;
begin
  perform public._require_admin();
  if p_open_min not between 0 and 1439 or p_close_min not between 1 and 1440 or p_close_min <= p_open_min then raise exception 'bad_hours'; end if;
  update stores set open_min = p_open_min, close_min = p_close_min, closed_override = coalesce(p_closed_override, false) where id = p_id returning * into s;
  if not found then raise exception 'unknown_store'; end if;
  return to_jsonb(s);
end $$;

create or replace function public.admin_update_payments(p_evc text, p_edahab text, p_premier text) returns jsonb
language plpgsql security definer set search_path = public as $$
begin
  perform public._require_admin();
  if p_evc !~ '^[0-9]{6,15}$' or p_edahab !~ '^[0-9]{6,15}$' or p_premier !~ '^[0-9]{6,16}$' then raise exception 'bad_number'; end if;
  update settings set evc_number = p_evc, edahab_number = p_edahab, premier_number = p_premier where id = 1;
  return (select jsonb_build_object('evc_number', evc_number, 'edahab_number', edahab_number, 'premier_number', premier_number) from settings where id = 1);
end $$;

create or replace function public.admin_find_user(p_phone text) returns jsonb
language plpgsql stable security definer set search_path = public as $$
declare v text := public._norm_phone(p_phone); r jsonb;
begin
  perform public._require_admin();
  select jsonb_build_object('id', id, 'name', name, 'phone', phone, 'email', email, 'role', role, 'stars', stars, 'created_at', created_at,
         'orders', (select count(*) from orders where user_id = p.id)) into r
  from profiles p where phone = v;
  if r is null then raise exception 'no_account'; end if;
  return r;
end $$;

create or replace function public.admin_list_staff() returns jsonb
language plpgsql stable security definer set search_path = public as $$
begin
  perform public._require_admin();
  return coalesce((select jsonb_agg(jsonb_build_object('id', id, 'name', name, 'phone', phone, 'role', role) order by role, name)
                   from profiles where role in ('staff', 'admin')), '[]'::jsonb);
end $$;

create or replace function public.admin_set_role(p_user uuid, p_role text) returns jsonb
language plpgsql security definer set search_path = public as $$
declare r profiles;
begin
  perform public._require_admin();
  if p_role not in ('customer', 'staff', 'admin') then raise exception 'bad_role'; end if;
  if p_user = auth.uid() and p_role <> 'admin' then raise exception 'cannot_demote_self'; end if;
  update profiles set role = p_role where id = p_user returning * into r;
  if not found then raise exception 'no_account'; end if;
  return jsonb_build_object('id', r.id, 'name', r.name, 'role', r.role);
end $$;

create or replace function public.admin_adjust_stars(p_user uuid, p_delta int, p_reason text) returns int
language plpgsql security definer set search_path = public as $$
declare v int;
begin
  perform public._require_admin();
  if p_delta is null or p_delta = 0 or abs(p_delta) > 100000 then raise exception 'bad_amount'; end if;
  if char_length(btrim(coalesce(p_reason, ''))) < 3 then raise exception 'reason_required'; end if;
  update profiles set stars = stars + p_delta where id = p_user and stars + p_delta >= 0 returning stars into v;
  if v is null then raise exception 'not_enough_stars'; end if;
  perform public._ledger(p_user, case when p_delta > 0 then 'bonus' else 'reverse' end, 'Stars adjusted by SafarChat', left(btrim(p_reason), 200), p_delta, null, null);
  perform public._notify(p_user, 'star', case when p_delta > 0 then 'You received ' || p_delta || ' Stars' else abs(p_delta) || ' Stars removed' end, left(btrim(p_reason), 200));
  return v;
end $$;

create or replace function public.admin_reset_password(p_user uuid, p_password text) returns void
language plpgsql security definer set search_path = public, extensions as $$
begin
  perform public._require_admin();
  if char_length(coalesce(p_password, '')) < 8 then raise exception 'weak_password'; end if;
  begin
    update auth.users set encrypted_password = extensions.crypt(p_password, extensions.gen_salt('bf')), updated_at = now() where id = p_user;
  exception when insufficient_privilege then
    raise exception 'reset_unavailable';
  end;
  if not found then raise exception 'no_account'; end if;
end $$;

-- =====================================================================
-- New accounts: the app signs people up as p<phone>@<domain>; the phone
-- number comes from that address so nobody can claim someone else's number.
-- =====================================================================
create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
declare v_phone text; v_name text; v_email text; st settings;
begin
  v_phone := substring(new.email from '^p(252[679][0-9]{8})@');
  if v_phone is null then raise exception 'Please sign up from the SafarChat app'; end if;
  select * into st from settings where id = 1;
  v_name := left(btrim(regexp_replace(coalesce(new.raw_user_meta_data->>'name', ''), '\s+', ' ', 'g')), 60);
  if char_length(v_name) < 2 then v_name := 'SafarChat friend'; end if;
  v_email := nullif(lower(btrim(coalesce(new.raw_user_meta_data->>'contact_email', ''))), '');
  if v_email is not null and (v_email !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' or char_length(v_email) > 120) then v_email := null; end if;
  insert into profiles (id, phone, name, email, role, stars)
  values (new.id, v_phone, v_name, v_email, case when v_phone = st.owner_phone then 'admin' else 'customer' end, greatest(st.welcome_stars, 0));
  if st.welcome_stars > 0 then
    perform public._ledger(new.id, 'bonus', 'Welcome bonus', 'Thanks for joining SafarChat Rewards', st.welcome_stars, null, null);
  end if;
  perform public._notify(new.id, 'sparkle', 'Welcome to SafarChat, ' || split_part(v_name, ' ', 1) || '!',
    'You earn ' || st.earn_per_usd || ' Stars for every $1 you pay, and every 100 Stars takes $' || to_char(100 * st.star_usd, 'FM990.00') || ' off. Choose a store and place your first order.');
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- =====================================================================
-- Row Level Security and permissions
-- =====================================================================
alter table public.settings enable row level security;
alter table public.stores enable row level security;
alter table public.products enable row level security;
alter table public.gift_catalog enable row level security;
alter table public.profiles enable row level security;
alter table public.star_ledger enable row level security;
alter table public.notifications enable row level security;
alter table public.favorites enable row level security;
alter table public.orders enable row level security;
alter table public.gifts enable row level security;

revoke all on all tables in schema public from anon, authenticated;
revoke all on all sequences in schema public from anon, authenticated;

-- Read access only for live updates (Supabase Realtime); rows are filtered by the policies below.
grant select on public.orders, public.notifications to authenticated;
drop policy if exists orders_read on public.orders;
create policy orders_read on public.orders for select to authenticated using (user_id = auth.uid() or public.is_staff());
drop policy if exists notifications_read on public.notifications;
create policy notifications_read on public.notifications for select to authenticated using (user_id = auth.uid());

revoke execute on all functions in schema public from public, anon, authenticated;
grant execute on function public.get_menu() to anon, authenticated;
grant execute on function public.is_staff() to authenticated;
grant execute on function public.is_admin() to authenticated;
grant execute on function public.get_my_state() to authenticated;
grant execute on function public.quote_order(jsonb) to authenticated;
grant execute on function public.place_order(jsonb) to authenticated;
grant execute on function public.share_stars(text, int, text) to authenticated;
grant execute on function public.send_gift(jsonb) to authenticated;
grant execute on function public.update_profile(jsonb) to authenticated;
grant execute on function public.mark_notes_read() to authenticated;
grant execute on function public.toggle_fav(text) to authenticated;
grant execute on function public.claim_birthday() to authenticated;
grant execute on function public.delete_my_account() to authenticated;
grant execute on function public.staff_list_orders() to authenticated;
grant execute on function public.staff_set_order_status(bigint, text, text) to authenticated;
grant execute on function public.staff_list_gifts() to authenticated;
grant execute on function public.staff_set_gift_status(bigint, text, text) to authenticated;
grant execute on function public.admin_update_product(text, numeric, boolean) to authenticated;
grant execute on function public.admin_update_store(text, int, int, boolean) to authenticated;
grant execute on function public.admin_update_payments(text, text, text) to authenticated;
grant execute on function public.admin_find_user(text) to authenticated;
grant execute on function public.admin_list_staff() to authenticated;
grant execute on function public.admin_set_role(uuid, text) to authenticated;
grant execute on function public.admin_adjust_stars(uuid, int, text) to authenticated;
grant execute on function public.admin_reset_password(uuid, text) to authenticated;

-- Live updates for the staff board and customer notifications
do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    begin alter publication supabase_realtime add table public.orders; exception when duplicate_object then null; end;
    begin alter publication supabase_realtime add table public.notifications; exception when duplicate_object then null; end;
  end if;
end $$;

-- =====================================================================
-- Menu and gift prices (first run only: later price changes are made in the staff/admin screen)
-- =====================================================================
insert into public.products (id, sub, name, price, description, art, milk, is_new, signature, kcal, sort) values
  ('hc1', 'hotcoffee', 'Qaxwo · Cardamom Coffee', 1.50, 'Somali coffee brewed with crushed cardamom and a hint of ginger, the way Mogadishu drinks it.', 'hot:brown', false, false, true, 15, 1),
  ('hc2', 'hotcoffee', 'Espresso', 2.00, 'A double shot pulled short, dark and syrupy.', 'hot:brown', false, false, false, 10, 2),
  ('hc3', 'hotcoffee', 'Americano', 2.25, 'Espresso lengthened with hot water for a clean, bold cup.', 'hot:green', false, false, false, 15, 3),
  ('hc4', 'hotcoffee', 'Cappuccino', 3.00, 'Espresso, steamed milk and a deep, velvety layer of foam.', 'hot:green', true, false, false, 120, 4),
  ('hc5', 'hotcoffee', 'Caffè Latte', 3.25, 'Smooth espresso with plenty of silky steamed milk.', 'hot:milk', true, false, false, 190, 5),
  ('hc6', 'hotcoffee', 'Camel Milk Latte', 3.75, 'Our signature latte made with fresh, lightly sweet camel milk.', 'hot:milk', true, false, true, 170, 6),
  ('hc7', 'hotcoffee', 'Flat White', 3.25, 'Ristretto shots under a thin layer of micro-foam.', 'hot:green', true, false, false, 110, 7),
  ('hc8', 'hotcoffee', 'Caramel Macchiato', 3.75, 'Vanilla, steamed milk, espresso and a caramel crosshatch.', 'hot:gold', true, false, false, 240, 8),
  ('hc9', 'hotcoffee', 'Spiced Mocha', 3.50, 'Dark chocolate, espresso and a pinch of cinnamon.', 'hot:clay', true, false, false, 260, 9),
  ('ic1', 'icedcoffee', 'Iced Americano', 2.50, 'Espresso over ice and cold water.', 'iced:#3A2318:#5A3624', false, false, false, 15, 10),
  ('ic2', 'icedcoffee', 'Iced Latte', 3.50, 'Espresso and cold milk poured over ice.', 'iced:#6B4126:#EFE4CF', true, false, false, 130, 11),
  ('ic3', 'icedcoffee', 'Iced Spanish Latte', 3.75, 'Sweetened condensed milk, espresso and ice.', 'iced:#7A4A2B:#F2E2C4', true, false, false, 210, 12),
  ('ic4', 'icedcoffee', 'Saffron Iced Latte', 4.00, 'Golden saffron syrup, cold milk and a double shot. New this season.', 'iced:#C7922F:#F4DFB0', true, true, false, 190, 13),
  ('ic5', 'icedcoffee', 'Cold Brew', 3.25, 'Steeped for 18 hours for a smooth, low-acid finish.', 'iced:#2E1A10:#4A2C1C', false, false, false, 5, 14),
  ('ic6', 'icedcoffee', 'Iced Caramel Macchiato', 4.00, 'Vanilla milk, ice, espresso and caramel drizzle.', 'iced:#8A5A2E:#F3E7D2', true, false, false, 250, 15),
  ('ht1', 'hottea', 'Shaah Cadays', 1.50, 'Spiced milk tea: cardamom, clove and cinnamon simmered with fresh milk.', 'hot:sand', true, false, true, 140, 16),
  ('ht2', 'hottea', 'Shaah Bigays', 1.00, 'Black spiced tea, bright and fragrant.', 'hot:sand', false, false, false, 5, 17),
  ('ht3', 'hottea', 'Camel Milk Chai', 2.50, 'Our spiced chai slow-cooked in camel milk.', 'hot:milk', true, false, true, 160, 18),
  ('ht4', 'hottea', 'Ginger Lemon Tea', 1.75, 'Fresh ginger, lemon and a spoon of honey.', 'hot:clay', false, false, false, 40, 19),
  ('ht5', 'hottea', 'Fresh Mint Tea', 1.50, 'Green tea with a handful of fresh mint.', 'hot:green', false, false, false, 5, 20),
  ('ht6', 'hottea', 'Earl Grey', 1.75, 'Black tea scented with bergamot.', 'hot:sand', true, false, false, 5, 21),
  ('it1', 'icedtea', 'Iced Shaah Cadays', 2.00, 'Our spiced milk tea, chilled and poured over ice.', 'iced:#A8743F:#D9B98A', true, false, false, 150, 22),
  ('it2', 'icedtea', 'Iced Lemon Tea', 2.00, 'Black tea shaken with lemon and ice.', 'iced:#B9832A:#E2B85C', false, false, false, 80, 23),
  ('it3', 'icedtea', 'Peach Iced Tea', 2.25, 'Black tea with ripe peach.', 'iced:#D9823B:#F2B071', false, false, false, 90, 24),
  ('it4', 'icedtea', 'Hibiscus Iced Tea', 2.25, 'Tart hibiscus, a little sugar, lots of ice.', 'iced:#8E1F3A:#C4405C', false, false, false, 70, 25),
  ('it5', 'icedtea', 'Iced Mint Tea', 2.00, 'Green tea and fresh mint over ice.', 'iced:#6F8F3A:#A9C46A', false, false, false, 60, 26),
  ('mt1', 'matcha', 'Matcha Latte', 3.75, 'Ceremonial-grade matcha whisked into steamed milk.', 'hot:green', true, false, false, 180, 27),
  ('mt2', 'matcha', 'Iced Matcha Latte', 4.00, 'Matcha and cold milk over ice.', 'iced:#6E9A3C:#EEF0DC', true, false, false, 170, 28),
  ('mt3', 'matcha', 'Camel Milk Matcha', 4.25, 'Grassy matcha layered over cold camel milk. Our newest signature.', 'iced:#5F8F35:#F5F0E6', true, true, true, 160, 29),
  ('mt4', 'matcha', 'Strawberry Matcha', 4.50, 'Strawberry purée, milk and a matcha float.', 'iced:#D9586A:#7AA648', true, false, false, 220, 30),
  ('mt5', 'matcha', 'Coconut Matcha', 4.25, 'Matcha shaken with coconut milk.', 'iced:#79A447:#FFFFFF', true, false, false, 190, 31),
  ('rf1', 'refreshers', 'Mango Passion Refresher', 3.25, 'Mango and passion fruit shaken with ice.', 'iced:#F0A020:#F7C948', false, false, false, 90, 32),
  ('rf2', 'refreshers', 'Strawberry Açaí', 3.25, 'Strawberry and açaí with real fruit pieces.', 'iced:#C8344F:#E8687C', false, false, false, 100, 33),
  ('rf3', 'refreshers', 'Lime Mint Mojito', 3.00, 'Lime, mint and sparkling water. Alcohol-free.', 'iced:#8CBF4A:#C9E59A', false, false, false, 80, 34),
  ('rf4', 'refreshers', 'Pineapple Ginger', 3.25, 'Pineapple juice with a fresh ginger kick.', 'iced:#E6B93A:#F3D872', false, false, false, 95, 35),
  ('rf5', 'refreshers', 'Hibiscus Berry', 3.25, 'Hibiscus and mixed berries.', 'iced:#9B2240:#D0506D', false, false, false, 90, 36),
  ('fr1', 'frappes', 'Caramel Frappé', 4.00, 'Blended coffee, caramel, whipped cream.', 'frappe:#C49A6C:#B5741F', true, false, false, 380, 37),
  ('fr2', 'frappes', 'Mocha Frappé', 4.00, 'Coffee and chocolate blended with ice.', 'frappe:#6B4126:#3A2318', true, false, false, 370, 38),
  ('fr3', 'frappes', 'Java Chip Frappé', 4.25, 'Mocha frappé with chocolate chips.', 'frappe:#5A3624:#2B170E', true, false, false, 420, 39),
  ('fr4', 'frappes', 'Vanilla Cream Frappé', 3.75, 'Coffee-free vanilla cream, blended.', 'frappe:#EFE3C8:#E2C48A', true, false, false, 330, 40),
  ('fr5', 'frappes', 'Cardamom Date Frappé', 4.50, 'Medjool dates, cardamom and espresso blended with ice.', 'frappe:#A87447:#6A3B1C', true, true, true, 360, 41),
  ('sm1', 'smoothies', 'Mango Banana', 3.50, 'Mango, banana and yoghurt.', 'smoothie:#F2A93B:#F7D046', false, false, false, 240, 42),
  ('sm2', 'smoothies', 'Strawberry Banana', 3.50, 'Strawberry, banana and yoghurt.', 'smoothie:#E2566D:#F7D046', false, false, false, 230, 43),
  ('sm3', 'smoothies', 'Papaya Lime', 3.25, 'Somali papaya with fresh lime.', 'smoothie:#F08A4B:#8CBF4A', false, false, false, 180, 44),
  ('sm4', 'smoothies', 'Avocado Date', 3.75, 'Avocado, dates and milk.', 'smoothie:#A3B85A:#6A3B1C', false, false, false, 320, 45),
  ('sm5', 'smoothies', 'Mixed Berry', 3.75, 'Blueberry, raspberry and strawberry.', 'smoothie:#7B2D5B:#C8344F', false, false, false, 210, 46),
  ('sm6', 'smoothies', 'Guava Breeze', 3.25, 'Pink guava, lime and mint.', 'smoothie:#EF7F8F:#9CC45A', false, false, false, 190, 47),
  ('bt1', 'bottled', 'Water 300ml', 0.50, 'Still drinking water.', 'bottle:w300', false, false, false, 0, 48),
  ('bt2', 'bottled', 'Dasani Water', 0.75, 'Purified still water, 500ml.', 'bottle:dasani', false, false, false, 0, 49),
  ('bt3', 'bottled', 'Water 350ml', 0.60, 'Still drinking water.', 'bottle:w350', false, false, false, 0, 50),
  ('bt4', 'bottled', 'Sprite', 1.00, 'Lemon-lime soda, 330ml.', 'bottle:sprite', false, false, false, 140, 51),
  ('bt5', 'bottled', 'Coca-Cola', 1.00, 'Classic cola, 330ml can.', 'can:cola', false, false, false, 139, 52),
  ('bt6', 'bottled', 'Fanta Orange', 1.00, 'Orange soda, 330ml.', 'bottle:fanta', false, false, false, 150, 53),
  ('bt7', 'bottled', 'Sparkling Water', 1.25, 'Lightly carbonated mineral water.', 'bottle:spark', false, false, false, 0, 54),
  ('bt8', 'bottled', 'Fresh Orange Juice', 2.50, 'Pressed this morning, 330ml.', 'bottle:oj', false, false, false, 150, 55),
  ('pa1', 'pastry', 'Butter Croissant', 1.75, 'Flaky, golden, all-butter.', 'food:croissant', false, false, false, 270, 56),
  ('pa2', 'pastry', 'Chocolate Croissant', 2.25, 'Two batons of dark chocolate in laminated dough.', 'food:painchoc', false, false, false, 320, 57),
  ('pa3', 'pastry', 'Malawax with Honey', 2.00, 'Somali crêpes, stacked warm and finished with honey.', 'food:malawax', false, false, true, 310, 58),
  ('pa4', 'pastry', 'Sambuusa (3)', 1.50, 'Crisp triangles filled with spiced beef and onion.', 'food:sambuusa', false, false, false, 280, 59),
  ('pa5', 'pastry', 'Kac Kac', 1.00, 'Sweet fried dough bites dusted with sugar.', 'food:kackac', false, false, false, 220, 60),
  ('pa6', 'pastry', 'Cinnamon Roll', 2.50, 'Soft roll, cinnamon swirl, cream icing.', 'food:roll', false, false, false, 390, 61),
  ('pa7', 'pastry', 'Date Muffin', 2.25, 'Moist muffin studded with chopped dates.', 'food:muffin', false, false, false, 340, 62),
  ('pa8', 'pastry', 'Xalwo', 1.50, 'Traditional Somali halwa with cardamom and nutmeg.', 'food:xalwo', false, false, false, 200, 63),
  ('pa9', 'pastry', 'Cardamom Bun', 2.00, 'Knotted bun with cardamom sugar.', 'food:bun', false, false, false, 290, 64),
  ('ck1', 'cakes', 'Chocolate Fudge Cake', 3.50, 'Three layers of dark chocolate sponge and fudge.', 'cake:#4A2616:#6B3A22:#2E170C', false, false, false, 450, 65),
  ('ck2', 'cakes', 'Red Velvet', 3.75, 'Cocoa sponge with cream cheese frosting.', 'cake:#A3263A:#F5EFE6:#F5EFE6', false, false, false, 420, 66),
  ('ck3', 'cakes', 'Carrot Cake', 3.50, 'Spiced carrot sponge, walnuts, cream cheese.', 'cake:#C98A4A:#F3EAD8:#F3EAD8', false, false, false, 410, 67),
  ('ck4', 'cakes', 'New York Cheesecake', 4.00, 'Baked vanilla cheesecake with berry glaze.', 'cake:#F3E2BF:#F3E2BF:#C8344F', false, false, false, 430, 68),
  ('ck5', 'cakes', 'Date & Cardamom Cake', 3.25, 'Sticky date sponge with cardamom cream.', 'cake:#8A5A2E:#E9D7B5:#6A3B1C', false, false, true, 380, 69),
  ('ck6', 'cakes', 'Tiramisu', 4.25, 'Espresso-soaked sponge and mascarpone.', 'cake:#E9DCC4:#5A3624:#5A3624', false, false, false, 400, 70),
  ('ck7', 'cakes', 'Basbousa', 2.50, 'Semolina cake soaked in light syrup.', 'cake:#D9A556:#D9A556:#B8862F', false, false, false, 330, 71),
  ('sw1', 'sandwiches', 'Chicken Suqaar Wrap', 4.50, 'Sautéed spiced chicken, peppers and greens in a soft wrap.', 'food:wrap', false, false, false, 520, 72),
  ('sw2', 'sandwiches', 'Club Sandwich', 5.00, 'Chicken, egg, cheese, tomato and lettuce on toast.', 'food:sand', false, false, false, 610, 73),
  ('sw3', 'sandwiches', 'Halloumi & Tomato', 4.25, 'Grilled halloumi, tomato and herbs.', 'food:sand2', false, false, false, 480, 74),
  ('sw4', 'sandwiches', 'Tuna Melt', 4.50, 'Tuna, melted cheese and pickles.', 'food:sand3', false, false, false, 540, 75),
  ('sw5', 'sandwiches', 'Egg & Cheese Croissant', 3.75, 'Soft egg and cheddar in a butter croissant.', 'food:eggcroissant', false, false, false, 430, 76),
  ('sw6', 'sandwiches', 'Beef Sabaayad Roll', 4.75, 'Spiced beef rolled in flaky sabaayad flatbread.', 'food:wrap2', false, false, false, 580, 77)
on conflict (id) do nothing;

insert into public.gift_catalog (cat, sub, name, description, price) values
  ('birthday', 'bundles', 'Birthday Slice & Latte', 'Any cake slice + a Medium latte', 6.75),
  ('birthday', 'bundles', 'Celebration for Two', '2 drinks + 2 cake slices', 12.50),
  ('birthday', 'bundles', 'Whole Birthday Cake', 'Any whole cake, 8 slices, with a candle', 24.50),
  ('birthday', 'boxes', 'Sweet Birthday Box', '6 cake slices + 6 Kac Kac', 18.00),
  ('birthday', 'boxes', 'Coffee Lover Box', 'Qaxwo beans 250g + SafarChat mug', 16.00),
  ('thanks', 'bundles', 'Shaah & Sambuusa', 'Shaah Cadays + Sambuusa (3)', 3.00),
  ('thanks', 'bundles', 'Thank-You Coffee Break', 'Any coffee + any pastry', 5.50),
  ('thanks', 'bundles', 'Team Thank You (5)', '5 drinks for the whole team', 15.00),
  ('thanks', 'boxes', 'Shaah Spice Tin', 'Our cardamom, clove & cinnamon blend', 9.00),
  ('thanks', 'boxes', 'Xalwo Box', '500g traditional Somali xalwo', 8.00),
  ('congrats', 'bundles', 'Frappé Party (4)', '4 frappés of their choice', 15.50),
  ('congrats', 'bundles', 'Celebration Cake Box', 'Whole cake + 4 drinks', 36.00),
  ('congrats', 'boxes', 'Golden Gift Box', 'Saffron syrup, beans & mug', 22.00),
  ('congrats', 'boxes', 'Premium Dates & Coffee', 'Medjool dates + Qaxwo beans', 19.00),
  ('bye', 'bundles', 'Farewell Coffee Round', '6 drinks to send them off', 16.00),
  ('bye', 'bundles', 'One Last Malawax', 'Malawax with Honey + Shaah', 3.25),
  ('bye', 'boxes', 'Safe Journey Box', 'Travel mug, Qaxwo beans & xalwo', 21.00),
  ('bye', 'boxes', 'Take-Home Shaah Kit', 'Spice tin + 2 glasses', 14.00),
  ('eid', 'bundles', 'Eid Breakfast for Four', '4 drinks + 4 pastries', 14.00),
  ('eid', 'bundles', 'Eid Sweet Table', 'Xalwo, Basbousa & Kac Kac platter', 12.00),
  ('eid', 'boxes', 'Eid Hamper', 'Dates, xalwo, Qaxwo beans & mug', 28.00),
  ('eid', 'boxes', 'Shaah Spice Tin', 'Our signature tea spices', 9.00),
  ('just', 'bundles', 'Coffee on Me', 'Any drink, any size', 4.50),
  ('just', 'bundles', 'Little Treat', 'A pastry and a Shaah Cadays', 3.25),
  ('just', 'boxes', 'Mini Bean Bag', 'Qaxwo beans 125g', 7.00)
on conflict (cat, sub, name) do nothing;
