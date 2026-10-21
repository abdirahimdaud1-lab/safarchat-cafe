/* Server connection (Supabase). Fill these in from Supabase → Project Settings → API.
   The anon / publishable key is meant to be public: the security rules in supabase/schema.sql
   protect the data. NEVER put the service_role (secret) key in this file. */
'use strict';

const CONFIG = {
  SUPABASE_URL: 'https://YOUR-PROJECT.supabase.co',
  SUPABASE_ANON_KEY: 'YOUR-ANON-KEY',
  // Customers sign in with their phone number. Behind the scenes Supabase stores it as
  // p252XXXXXXXXX@<this domain>. Keep it unchanged once people have signed up.
  LOGIN_EMAIL_DOMAIN: 'users.safarchat.app'
};
