insert into storage.buckets (id, name, public)
values ('profile-photos', 'profile-photos', true)
on conflict (id) do nothing;

drop policy if exists "Public profile photos are readable" on storage.objects;
create policy "Public profile photos are readable"
on storage.objects
for select
to anon, authenticated
using (bucket_id = 'profile-photos');

drop policy if exists "Users upload their own profile photos" on storage.objects;
create policy "Users upload their own profile photos"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'profile-photos'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "Users update their own profile photos" on storage.objects;
create policy "Users update their own profile photos"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'profile-photos'
  and (storage.foldername(name))[1] = auth.uid()::text
)
with check (
  bucket_id = 'profile-photos'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "Users delete their own profile photos" on storage.objects;
create policy "Users delete their own profile photos"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'profile-photos'
  and (storage.foldername(name))[1] = auth.uid()::text
);
