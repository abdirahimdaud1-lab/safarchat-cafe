# SafarChat Café app

Customer ordering app and staff screen for **SafarChat Café** (Dahab Tower, Mogadishu).

- **Customers** (`index.html`): sign up / sign in with their phone number, order drinks and food for store pickup,
  car pickup or delivery, pay with EVC Plus, eDahab, Premier Wallet or Stars, collect Stars (2★ per $1, 100★ = $8),
  share Stars, send gifts, and get live updates on their orders.
- **Staff & admins** (`staff.html`): live order board with payment checks, gifts, and for admins: menu prices and
  sold-out, opening hours, payment numbers, staff roles, Star adjustments and password resets.

**First time? Follow [SETUP.md](SETUP.md).**

## How it's built
- Front end: plain HTML, CSS and JavaScript (no build step), hosted on GitHub Pages. Works on iPhone as a Home Screen app.
- Server: **Supabase** (Postgres database + authentication). All rules live in `supabase/schema.sql`.

### Security
- The app never writes database tables directly. It calls server functions that check who is signed in,
  validate every field, and **calculate every price, discount, tax and Star balance on the server**. A changed
  price or option in the browser is rejected.
- Row Level Security is on for every table. Customers can only see their own orders, Stars and messages.
- Staff/admin actions check the person's role on the server. Customers can't approve their own payments.
- A transaction ID can be used only once. Orders and shares are rate-limited.
- Passwords are handled by Supabase Auth (hashed, never stored by the app). Only the public anon key is in the code.

## Folder structure
```
index.html              Customer app
staff.html              Staff & admin screen
SETUP.md                Step-by-step server setup
supabase/schema.sql     Database, security rules and server functions (run in Supabase SQL Editor)
css/styles.css          Customer app styles (brand tokens at the top)
css/staff.css           Staff screen styles
assets/                 Camel seal artwork and app icons
js/
  config.js             Supabase address + public key  ← fill in during setup
  core/api.js           Server calls and friendly error messages
  core/state.js         Signed-in person's data, live updates, cart kept on the phone
  core/helpers.js       Small helpers + business constants
  core/icons.js         Icons
  core/art.js           SVG product drawings (brand cups etc.)
  core/time.js          Greeting, time zone, store hours
  core/cart-math.js     Cart preview totals (the server has the final say)
  data/menu.js          Menu categories (products come from the server)
  data/gifts.js         Gift occasions (prices checked by the server)
  data/regions.js       Somali regions and districts
  ui/overlays.js        Sheets, pages and toasts
  ui/tabbar.js          Bottom tab bar
  pages/*.js            One file per screen: home, rewards, order, product, cart, checkout, gifts, account, auth
  staff/staff.js        Staff screen
  app.js                Button actions and start-up
```

Scripts are classic `<script>` files sharing one scope; the order in `index.html` matters.

## Changing things
| What | Where |
|---|---|
| Prices, sold out | staff.html → Menu (admin) |
| Opening hours, payment numbers | staff.html → Store & payments (admin) |
| Tax, Star value, delivery fee, birthday Stars, buildings | Supabase → Table Editor → `settings` |
| New menu items | add a row to `products` (Table Editor) and, if it's a new kind of option, update `_line` in schema.sql and `js/pages/product.js` together |
| Look and feel | `css/styles.css` |

## Next steps
- **Automatic payments:** connect the WaafiPay (EVC Plus), eDahab and Premier Bank merchant APIs in a Supabase
  Edge Function, then mark orders paid automatically instead of the manual payment check.
- **SMS verification** of phone numbers at sign-up (Supabase phone auth + an SMS provider that delivers to Somalia).
- More stores and delivery buildings.
