/* Server connection (Supabase). Fill these in from Supabase → Project Settings → API.
   The anon / publishable key is meant to be public: the security rules in supabase/schema.sql
   protect the data. NEVER put the service_role (secret) key in this file. */
'use strict';

const CONFIG = {
  SUPABASE_URL: 'https://hhkebtqwbesjmsjmvldh.supabase.co',
  SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhoa2VidHF3YmVzam1zam12bGRoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTI1OTY0MjQsImV4cCI6MjEwODE3MjQyNH0.claFntglYYskhKLElU0OoHsc9OMhUpo9s0Mo2YgLJ_Q',
  // Customers sign in with their phone number. Behind the scenes Supabase stores it as
  // p252XXXXXXXXX@<this domain>. Keep it unchanged once people have signed up.
  LOGIN_EMAIL_DOMAIN: 'users.safarchat.app'
};
