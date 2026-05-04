-- CampusRide publish/reserve setup
-- Paste this whole file in Supabase SQL Editor, then run it once.
-- It is idempotent: it updates policies/functions without deleting your data.

create extension if not exists "pgcrypto";

do $$
begin
  if not exists (select 1 from pg_type where typname = 'app_role') then
    create type public.app_role as enum ('conducteur', 'passager', 'admin');
  end if;

  if not exists (select 1 from pg_type where typname = 'reservation_status') then
    create type public.reservation_status as enum ('confirmee', 'annulee', 'en_attente');
  end if;
end;
$$;

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null default '',
  email text unique,
  phone text,
  role public.app_role not null default 'passager',
  photo_profil text,
  note_moyenne numeric(3, 2) not null default 0,
  vehicle_label text,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.trajets (
  id uuid primary key default gen_random_uuid(),
  depart text not null,
  destination text not null,
  departure_at timestamptz not null,
  duration_minutes integer not null default 30 check (duration_minutes > 0),
  places_total integer not null default 4 check (places_total > 0),
  places_disponibles integer not null default 4
    check (places_disponibles >= 0 and places_disponibles <= places_total),
  prix_par_place numeric(10, 2) not null check (prix_par_place >= 0),
  description text,
  pickup_note text,
  conducteur_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.reservations (
  id uuid primary key default gen_random_uuid(),
  trajet_id uuid not null references public.trajets (id) on delete cascade,
  passager_id uuid not null references public.profiles (id) on delete cascade,
  date_reservation timestamptz not null default timezone('utc', now()),
  message_passager text,
  statut public.reservation_status not null default 'en_attente',
  unique (trajet_id, passager_id)
);

alter table public.reservations
add column if not exists message_passager text;

alter table public.reservations
alter column statut set default 'en_attente';

create table if not exists public.evaluations (
  id uuid primary key default gen_random_uuid(),
  utilisateur_id uuid not null references public.profiles (id) on delete cascade,
  conducteur_id uuid not null references public.profiles (id) on delete cascade,
  note numeric(2, 1) not null check (note >= 0 and note <= 5),
  commentaire text,
  created_at timestamptz not null default timezone('utc', now())
);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, email, phone, role)
  values (
    new.id,
    coalesce(
      nullif(new.raw_user_meta_data ->> 'full_name', ''),
      nullif(new.raw_user_meta_data ->> 'name', ''),
      split_part(coalesce(new.email, ''), '@', 1),
      'CampusRide'
    ),
    new.email,
    new.raw_user_meta_data ->> 'phone',
    case
      when new.raw_user_meta_data ->> 'role' in ('conducteur', 'passager', 'admin')
        then (new.raw_user_meta_data ->> 'role')::public.app_role
      else 'passager'::public.app_role
    end
  )
  on conflict (id) do update
  set
    full_name = coalesce(nullif(excluded.full_name, ''), public.profiles.full_name),
    email = coalesce(excluded.email, public.profiles.email),
    phone = coalesce(public.profiles.phone, excluded.phone);

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

-- Create missing profiles for accounts created before the trigger existed.
insert into public.profiles (id, full_name, email, phone, role)
select
  users.id,
  coalesce(
    nullif(users.raw_user_meta_data ->> 'full_name', ''),
    nullif(users.raw_user_meta_data ->> 'name', ''),
    split_part(coalesce(users.email, ''), '@', 1),
    'CampusRide'
  ),
  users.email,
  users.raw_user_meta_data ->> 'phone',
  case
    when users.raw_user_meta_data ->> 'role' in ('conducteur', 'passager', 'admin')
      then (users.raw_user_meta_data ->> 'role')::public.app_role
    else 'passager'::public.app_role
  end
from auth.users as users
on conflict (id) do update
set
  full_name = coalesce(nullif(excluded.full_name, ''), public.profiles.full_name),
  email = coalesce(excluded.email, public.profiles.email),
  phone = coalesce(public.profiles.phone, excluded.phone);

alter table public.profiles enable row level security;
alter table public.trajets enable row level security;
alter table public.reservations enable row level security;
alter table public.evaluations enable row level security;

grant usage on schema public to anon, authenticated;
grant select on public.profiles, public.trajets, public.evaluations to anon, authenticated;
grant select, insert, update on public.profiles to authenticated;
grant select, insert, update, delete on public.trajets to authenticated;
grant select, insert, update, delete on public.reservations to authenticated;
grant select, insert, update, delete on public.evaluations to authenticated;

drop policy if exists "Public profiles are readable" on public.profiles;
create policy "Public profiles are readable"
on public.profiles
for select
to anon, authenticated
using (true);

drop policy if exists "Users create their own profile" on public.profiles;
create policy "Users create their own profile"
on public.profiles
for insert
to authenticated
with check (auth.uid() = id);

drop policy if exists "Users update their own profile" on public.profiles;
create policy "Users update their own profile"
on public.profiles
for update
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);

drop policy if exists "Trajets are readable" on public.trajets;
create policy "Trajets are readable"
on public.trajets
for select
to anon, authenticated
using (true);

drop policy if exists "Conductors create their own trajets" on public.trajets;
create policy "Conductors create their own trajets"
on public.trajets
for insert
to authenticated
with check (conducteur_id = auth.uid());

drop policy if exists "Conductors update their own trajets" on public.trajets;
create policy "Conductors update their own trajets"
on public.trajets
for update
to authenticated
using (conducteur_id = auth.uid())
with check (conducteur_id = auth.uid());

drop policy if exists "Conductors delete their own trajets" on public.trajets;
create policy "Conductors delete their own trajets"
on public.trajets
for delete
to authenticated
using (conducteur_id = auth.uid());

drop policy if exists "Passengers view their reservations" on public.reservations;
drop policy if exists "Conductors view reservations on their trajets" on public.reservations;
drop policy if exists "Users view reservations linked to them" on public.reservations;
create policy "Users view reservations linked to them"
on public.reservations
for select
to authenticated
using (
  passager_id = auth.uid()
  or exists (
    select 1
    from public.trajets
    where trajets.id = reservations.trajet_id
      and trajets.conducteur_id = auth.uid()
  )
);

drop policy if exists "Passengers create reservations" on public.reservations;
create policy "Passengers create reservations"
on public.reservations
for insert
to authenticated
with check (passager_id = auth.uid());

drop policy if exists "Passengers update reservations" on public.reservations;
drop policy if exists "Conductors update reservations on their trajets" on public.reservations;
drop policy if exists "Users update reservations linked to them" on public.reservations;
create policy "Users update reservations linked to them"
on public.reservations
for update
to authenticated
using (
  passager_id = auth.uid()
  or exists (
    select 1
    from public.trajets
    where trajets.id = reservations.trajet_id
      and trajets.conducteur_id = auth.uid()
  )
)
with check (
  passager_id = auth.uid()
  or exists (
    select 1
    from public.trajets
    where trajets.id = reservations.trajet_id
      and trajets.conducteur_id = auth.uid()
  )
);

drop policy if exists "Reservations can be deleted by the passenger" on public.reservations;
create policy "Reservations can be deleted by the passenger"
on public.reservations
for delete
to authenticated
using (passager_id = auth.uid());

drop policy if exists "Evaluations are readable" on public.evaluations;
create policy "Evaluations are readable"
on public.evaluations
for select
to anon, authenticated
using (true);

drop policy if exists "Users create evaluations" on public.evaluations;
create policy "Users create evaluations"
on public.evaluations
for insert
to authenticated
with check (utilisateur_id = auth.uid());

drop policy if exists "Users update their evaluations" on public.evaluations;
create policy "Users update their evaluations"
on public.evaluations
for update
to authenticated
using (utilisateur_id = auth.uid())
with check (utilisateur_id = auth.uid());

drop policy if exists "Users delete their evaluations" on public.evaluations;
create policy "Users delete their evaluations"
on public.evaluations
for delete
to authenticated
using (utilisateur_id = auth.uid());

create or replace function public.reserve_trajet_seat(
  p_trajet_id uuid,
  p_passager_id uuid,
  p_statut public.reservation_status default 'en_attente',
  p_message_passager text default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_trajet public.trajets%rowtype;
  v_reservation_id uuid;
begin
  if auth.uid() is null or auth.uid() <> p_passager_id then
    raise exception 'Session invalide pour cette reservation.';
  end if;

  select *
  into v_trajet
  from public.trajets
  where id = p_trajet_id
  for update;

  if not found then
    raise exception 'Trajet introuvable.';
  end if;

  if v_trajet.departure_at < now() then
    raise exception 'Ce trajet est deja passe.';
  end if;

  if v_trajet.conducteur_id = p_passager_id then
    raise exception 'Tu ne peux pas reserver ton propre trajet.';
  end if;

  if v_trajet.places_disponibles <= 0 then
    raise exception 'Ce trajet est deja complet.';
  end if;

  insert into public.reservations (
    trajet_id,
    passager_id,
    message_passager,
    statut
  )
  values (
    p_trajet_id,
    p_passager_id,
    nullif(trim(coalesce(p_message_passager, '')), ''),
    p_statut
  )
  returning id into v_reservation_id;

  update public.trajets
  set places_disponibles = places_disponibles - 1
  where id = p_trajet_id;

  return v_reservation_id;
exception
  when unique_violation then
    raise exception 'Tu as deja une reservation pour ce trajet.';
end;
$$;

create or replace function public.cancel_reservation_seat(
  p_reservation_id uuid,
  p_passager_id uuid
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_reservation public.reservations%rowtype;
  v_trajet public.trajets%rowtype;
begin
  if auth.uid() is null or auth.uid() <> p_passager_id then
    raise exception 'Session invalide pour cette annulation.';
  end if;

  select *
  into v_reservation
  from public.reservations
  where id = p_reservation_id
    and passager_id = p_passager_id
  for update;

  if not found then
    raise exception 'Reservation introuvable.';
  end if;

  if v_reservation.statut = 'annulee' then
    return true;
  end if;

  select *
  into v_trajet
  from public.trajets
  where id = v_reservation.trajet_id
  for update;

  update public.reservations
  set statut = 'annulee'
  where id = p_reservation_id;

  if found and v_trajet.id is not null then
    update public.trajets
    set places_disponibles = least(places_total, places_disponibles + 1)
    where id = v_trajet.id;
  end if;

  return true;
end;
$$;

revoke all on function public.reserve_trajet_seat(uuid, uuid, public.reservation_status, text) from public;
grant execute on function public.reserve_trajet_seat(uuid, uuid, public.reservation_status, text) to authenticated;

revoke all on function public.cancel_reservation_seat(uuid, uuid) from public;
grant execute on function public.cancel_reservation_seat(uuid, uuid) to authenticated;

notify pgrst, 'reload schema';
