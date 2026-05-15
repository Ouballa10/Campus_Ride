insert into storage.buckets (id, name, public)
values
  ('avatars', 'avatars', true),
  ('vehicles', 'vehicles', true)
on conflict (id) do update
set public = excluded.public;

-- Backward-compatible bucket for old profile URLs already stored in profiles.photo_profil.
insert into storage.buckets (id, name, public)
values ('profile-photos', 'profile-photos', true)
on conflict (id) do update
set public = excluded.public;

drop policy if exists "Public profile photos are readable" on storage.objects;
drop policy if exists "Users upload their own profile photos" on storage.objects;
drop policy if exists "Users update their own profile photos" on storage.objects;
drop policy if exists "Users delete their own profile photos" on storage.objects;

drop policy if exists "CampusRide public images are readable" on storage.objects;
create policy "CampusRide public images are readable"
on storage.objects
for select
to anon, authenticated
using (bucket_id in ('avatars', 'vehicles', 'profile-photos'));

drop policy if exists "Users upload their own CampusRide images" on storage.objects;
create policy "Users upload their own CampusRide images"
on storage.objects
for insert
to authenticated
with check (
  bucket_id in ('avatars', 'vehicles', 'profile-photos')
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "Users update their own CampusRide images" on storage.objects;
create policy "Users update their own CampusRide images"
on storage.objects
for update
to authenticated
using (
  bucket_id in ('avatars', 'vehicles', 'profile-photos')
  and (storage.foldername(name))[1] = auth.uid()::text
)
with check (
  bucket_id in ('avatars', 'vehicles', 'profile-photos')
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "Users delete their own CampusRide images" on storage.objects;
create policy "Users delete their own CampusRide images"
on storage.objects
for delete
to authenticated
using (
  bucket_id in ('avatars', 'vehicles', 'profile-photos')
  and (storage.foldername(name))[1] = auth.uid()::text
);
