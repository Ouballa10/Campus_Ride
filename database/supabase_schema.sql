create extension if not exists "pgcrypto";

do $$
begin
  if not exists (
    select 1
    from pg_type
    where typname = 'app_role'
  ) then
    create type public.app_role as enum ('conducteur', 'passager', 'admin');
  end if;

  if not exists (
    select 1
    from pg_type
    where typname = 'reservation_status'
  ) then
    create type public.reservation_status as enum ('confirmee', 'annulee', 'en_attente');
  end if;
end
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
  statut public.reservation_status not null default 'en_attente',
  unique (trajet_id, passager_id)
);

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
    coalesce(new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1)),
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
    full_name = excluded.full_name,
    email = excluded.email,
    phone = excluded.phone,
    role = excluded.role;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

create or replace function public.refresh_conducteur_rating()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  target_conducteur_id uuid;
begin
  target_conducteur_id := coalesce(new.conducteur_id, old.conducteur_id);

  if target_conducteur_id is not null then
    update public.profiles
    set note_moyenne = coalesce((
      select round(avg(note)::numeric, 2)
      from public.evaluations
      where conducteur_id = target_conducteur_id
    ), 0)
    where id = target_conducteur_id;
  end if;

  return coalesce(new, old);
end;
$$;

drop trigger if exists on_evaluations_changed on public.evaluations;
create trigger on_evaluations_changed
after insert or update or delete on public.evaluations
for each row execute procedure public.refresh_conducteur_rating();

alter table public.profiles enable row level security;
alter table public.trajets enable row level security;
alter table public.reservations enable row level security;
alter table public.evaluations enable row level security;

drop policy if exists "Public profiles are readable" on public.profiles;
create policy "Public profiles are readable"
on public.profiles
for select
to anon, authenticated
using (true);

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
create policy "Passengers view their reservations"
on public.reservations
for select
to authenticated
using (passager_id = auth.uid());

drop policy if exists "Conductors view reservations on their trajets" on public.reservations;
create policy "Conductors view reservations on their trajets"
on public.reservations
for select
to authenticated
using (
  exists (
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
create policy "Passengers update reservations"
on public.reservations
for update
to authenticated
using (passager_id = auth.uid())
with check (passager_id = auth.uid());

drop policy if exists "Conductors update reservations on their trajets" on public.reservations;
create policy "Conductors update reservations on their trajets"
on public.reservations
for update
to authenticated
using (
  exists (
    select 1
    from public.trajets
    where trajets.id = reservations.trajet_id
      and trajets.conducteur_id = auth.uid()
  )
)
with check (
  exists (
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
