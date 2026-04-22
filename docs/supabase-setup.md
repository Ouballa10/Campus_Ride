# Supabase Setup

## 1. Create the Supabase project

- Create a new Supabase project from the dashboard.
- In `SQL Editor`, run [`database/supabase_schema.sql`](/c:/Users/abdelmounaim/Desktop/Campus_Ride/database/supabase_schema.sql:1).

## 2. Add frontend environment variables

- Copy [`frontend/.env.example`](/c:/Users/abdelmounaim/Desktop/Campus_Ride/frontend/.env.example:1) to `.env.local` for local development.
- Add the same values in Vercel:
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_ANON_KEY`

## 3. Optional seed data

- Create test users from `Authentication > Users`.
- Replace the UUID placeholders in [`database/supabase_seed.sql`](/c:/Users/abdelmounaim/Desktop/Campus_Ride/database/supabase_seed.sql:1) and run it if you want sample trips.

## 4. Profile photos storage

- Run [`database/supabase_storage.sql`](/c:/Users/abdelmounaim/Desktop/Campus_Ride/database/supabase_storage.sql:1) in the Supabase SQL Editor.
- This creates the public `profile-photos` bucket and the policies needed for each user to upload only their own avatar.

## 5. Deploy

- The app stays in demo mode until the two `VITE_SUPABASE_*` variables are present.
- Once the keys are added, login/register and data loading switch to Supabase automatically.
