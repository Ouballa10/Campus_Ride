-- =========================
-- EVALUATIONS TABLE
-- =========================
-- Stores passenger ratings/reviews for drivers after a trip

create table if not exists public.evaluations (
  id uuid default gen_random_uuid() primary key,
  trajet_id uuid not null references public.trajets(id) on delete cascade,
  conducteur_id uuid not null references public.profiles(id) on delete cascade,
  passager_id uuid not null references public.profiles(id) on delete cascade,
  note integer not null check (note >= 1 and note <= 5),
  commentaire text,
  created_at timestamptz default now(),

  -- One rating per passenger per trip
  unique(trajet_id, passager_id)
);

-- Add note_moyenne column to profiles if not exists
do $$
begin
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public'
      and table_name = 'profiles'
      and column_name = 'note_moyenne'
  ) then
    alter table public.profiles add column note_moyenne numeric(2,1) default 0;
  end if;
end $$;

-- RLS policies for evaluations
alter table public.evaluations enable row level security;

-- Anyone authenticated can read evaluations
drop policy if exists "Evaluations are readable by authenticated users" on public.evaluations;
create policy "Evaluations are readable by authenticated users"
on public.evaluations
for select
to authenticated
using (true);

-- Passengers can insert their own evaluations
drop policy if exists "Passengers can insert their own evaluations" on public.evaluations;
create policy "Passengers can insert their own evaluations"
on public.evaluations
for insert
to authenticated
with check (passager_id = auth.uid());

-- Passengers cannot rate themselves
drop policy if exists "Cannot self-rate" on public.evaluations;
create policy "Cannot self-rate"
on public.evaluations
for insert
to authenticated
with check (conducteur_id != auth.uid());

-- Index for fast lookups
create index if not exists idx_evaluations_conducteur on public.evaluations(conducteur_id);
create index if not exists idx_evaluations_trajet on public.evaluations(trajet_id);
