# SafarChat Café app · Accounts edition

This edition needs **sign up / sign in**. A new account starts empty: 0 Stars, no orders,
no history. The menu is the only built-in data. Every Star statement, order, gift and
message is recorded from real use of the app.

Customer ordering app for SafarChat Café (Dahab Tower, Mogadishu). It has five tabs:
**Home, Rewards, Order, Gifts and Account**. It is built in plain HTML, CSS and JavaScript,
so it needs no framework and no build step.

Colours, fonts, the camel seal and the cup colour system come from the SafarChat Brand
Identity Guidelines (Edition 01 · 2026).

## Run it

Open `index.html` in a browser. To test it on a phone over Wi‑Fi, serve the folder:

```bash
cd safarchat
python3 -m http.server 8000
# then open http://<your-computer-ip>:8000 on the phone
```

### Install on iPhone as an app
Host the folder on any static host (GitHub Pages, Netlify, Vercel, Cloudflare Pages).
Open the link in **Safari**, tap **Share → Add to Home Screen**, and it opens full
screen with the camel icon. `manifest.webmanifest` and the `apple-*` meta tags in
`index.html` make this work.

## Folder structure

```
index.html              App shell, brand SVG symbols, script load order
manifest.webmanifest    Home-screen app settings
css/styles.css          All styles; brand tokens are at the top (:root)
assets/                 camel.webp (seal artwork), app icons
js/
  core/helpers.js       $/$$/esc/money + business rules (STAR_USD, TAX, EARN_PER_USD, DELIVERY_FEE)
  core/icons.js         Inline SVG icons (I.home, I.star, …)
  core/art.js           SVG product illustrations (brand cups, iced cups, bottles, pastries, cakes…)
  core/time.js          Greeting by time, location from time zone, store hours (Mogadishu time)
  core/state.js         Accounts + per-account data (no sample data), save/load, birthday Stars
  core/cart-math.js     Subtotal, Stars discount, 5% tax, total
  data/menu.js          ► All products and prices. Edit the menu here.
  data/gifts.js         ► Gift occasions, bundles, boxes and prices
  data/regions.js       ► Somali regions and districts for the address form
  ui/overlays.js        Bottom sheets, full-screen pages, toasts
  ui/tabbar.js          Bottom tab bar + header cart/bell buttons
  pages/home.js         Home tab
  pages/rewards.js      Rewards tab (Redeem, Share, Star history + Load More)
  pages/order.js        Order tab (store picker, search, Featured/Drinks/Food)
  pages/product.js      Product options (size, sugar, sweetness, flavours, shots, warmed…)
  pages/cart.js         Cart ("suitcase")
  pages/checkout.js     Checkout, payment and order confirmation
  pages/gifts.js        Gifts tab
  pages/account.js      Account, Profile, Address, My Orders, QR code, Help, Sign out, Delete account
  pages/auth.js         Welcome, Create Account, Sign In, Reset Password screens
  app.js                Every button action (data-act="…") and app start-up
```

Scripts are classic `<script>` files that share one global scope, so the order in
`index.html` matters: core → data → ui → pages → app. If you add a file, add it to that list.

## How a button works
Every tappable element has `data-act="name"`. One click listener in `js/app.js` calls the
matching function in the `A` object. To add a new button, add `data-act="myThing"` in the
HTML string and an `A.myThing = el => { … }` handler.

## Business rules (change in `js/core/helpers.js`)
| Rule | Value |
|---|---|
| Star value | 100 Stars = $8.00 (`STAR_USD = 0.08`) |
| Earning | 2 Stars per $1 paid (`EARN_PER_USD`) |
| Tax | 5% after the Stars discount (`TAX`) |
| Delivery fee | $1.00 (`DELIVERY_FEE`) |
| Welcome Stars | 0 at sign-up (`WELCOME_STARS`) |
| Birthday Stars | 50, once a year on the date of birth in Profile (`BIRTHDAY_STARS`) |
| Store hours | 6:30 AM – 11:30 PM, Mogadishu time (`STORE` in `core/time.js`) |

## Accounts
- Sign up: full name, Somali mobile number, optional email, password (6+ characters).
- Sign in with phone number **or** email. Passwords are stored as salted SHA-256 hashes.
- Phone numbers are saved as `2526XXXXXXXX` and shown as `+252 61 234 5678` (`normPhone`, `fmtPhone` in helpers.js).
- Share Stars only works to a phone number that has an account. The Stars move to that
  account and both people get a message. Gifts sent to an account's number also notify them.

## What is simulated (needs a backend before launch)
Accounts and their data live on the phone (`localStorage`, key `safarchat.accounts.v1`).
Two people on different phones can't see each other yet.

- **Accounts**: move sign-up/sign-in to a server with SMS verification (OTP).
  "Forgot password" currently checks phone + full name; replace it with an SMS code.
- **Payments**: EVC Plus, eDahab and Premier Wallet show the approval step, but no money
  moves. Connect each provider's merchant API in `doPay()` (`js/pages/checkout.js`).
- **Share Stars / Gifts**: work between accounts on the same phone; a server is needed across phones.
- **Order status**: changes to "Ready" (or "On the way") after 45 seconds as a demo.
- **Location**: the city comes from the phone's time zone.
