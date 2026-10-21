# Setting up SafarChat Café (about 15 minutes)

The app has two parts:

| Part | Where it lives | Cost |
|---|---|---|
| **Website / app** (this folder) | GitHub Pages: `https://abdirahimdaud1-lab.github.io/safarchat-cafe/` | Free |
| **Server** (accounts, orders, Stars, security) | Supabase | Free plan to start |

## 1. Create the Supabase project
1. Go to **https://supabase.com** → **Start your project** → sign in with GitHub.
2. **New project** → name `safarchat-cafe`, choose a strong **database password** (save it somewhere safe),
   region closest to Somalia (e.g. *Frankfurt* or *Mumbai*) → **Create**. Wait ~2 minutes.

## 2. Create the database
1. In the project, open **SQL Editor** → **New query**.
2. Open `supabase/schema.sql` from this repository, copy **everything**, paste it in, and click **Run**.
   You should see "Success. No rows returned".

## 3. Sign-in settings
Open **Authentication → Sign In / Providers → Email** (older dashboards: **Authentication → Providers → Email**):
- **Confirm email: OFF.** Customers sign in with their phone number, not an inbox.
- **Minimum password length: 8.**

Leave **Allow new users to sign up** ON.

## 4. Connect the app to the server
1. Open **Project Settings → API** (or **API Keys**).
2. Copy the **Project URL** and the **anon public** key (also called *publishable* key).
   ⚠️ Never use or share the **service_role** / **secret** key.
3. Put them in `js/config.js`:
   ```js
   SUPABASE_URL: 'https://xxxxxxxx.supabase.co',
   SUPABASE_ANON_KEY: 'eyJ…',
   ```
   The anon key is designed to be public. The database rules protect the data.

## 5. Become the admin
Open the app and **Create Account** with the owner number **61 747 5902**. That number is set as the owner in
the database, so it becomes **Admin** automatically. (Change `owner_phone` in the `settings` table *before*
signing up if a different number should be the owner.)

Then open **`staff.html`** (also linked from Account → Staff screen) and sign in with the same number.

## 6. Add staff
Each barista creates a normal account in the app. In **staff.html → People**, find their number and set the
role to **Staff**. Staff can see orders and confirm payments; only Admins can change prices, hours, payment
numbers, roles, Stars and passwords.

## How payments work (until the bank APIs are connected)
1. At checkout the customer picks EVC Plus, eDahab or Premier Wallet. The app shows the exact code with the total,
   e.g. `*712*617475902*11.55#`.
2. They pay, then type the **transaction ID** from their SMS.
3. The order appears in **Check payment** on the staff screen with the amount, the number it came from and the ID.
4. Staff compare it with the payment SMS on the café phone and tap **Payment received** (or **Not found**).
5. The customer gets a message, earns their Stars, and the order moves to **To make**.

Each transaction ID can only be used once. Payments with Stars are confirmed automatically.

## Useful admin tasks
- **Sold out / price change:** staff.html → Menu.
- **Opening hours, "Closed today", payment numbers:** staff.html → Store & payments.
- **Forgot password:** staff.html → People → find the customer → Reset password (check it's really them first).
  If your Supabase project blocks this, reset it in **Supabase → Authentication → Users**.
- **Delivery buildings:** Supabase → Table Editor → `settings` → `buildings` (e.g. `["Dahab Tower","Another Tower"]`).
- **Backups:** Supabase → Database → Backups (daily on paid plans). On the free plan, export from Table Editor regularly.

## Updating the database later
`supabase/schema.sql` can be run again: it replaces the functions and keeps all customer data, menu prices and settings.
