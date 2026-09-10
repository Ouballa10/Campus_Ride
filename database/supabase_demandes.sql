-- ============================================================
--  CAMPUSRIDE — Demandes de trajet (InDrive-style)
--  Un passager publie une demande, un conducteur l'accepte.
-- ============================================================

-- Statuts possibles
do $$
begin
  if not exists (
    select 1 from pg_type where typname = 'demande_status'
  ) then
    create type public.demande_status as enum (
      'ouverte',      -- visible aux conducteurs
      'acceptee',     -- un conducteur a accepté
      'annulee',      -- passager a annulé
      'expiree'       -- date passée
    );
  end if;
end
$$;

-- Table principale
create table if not exists public.demandes (
  id               uuid primary key default gen_random_uuid(),
  passager_id      uuid not null references public.profiles (id) on delete cascade,
  conducteur_id    uuid references public.profiles (id) on delete set null,
  depart           text not null,
  destination      text not null,
  departure_at     timestamptz not null,
  prix_propose     numeric(10, 2) not null default 0 check (prix_propose >= 0),
  message          text,
  statut           public.demande_status not null default 'ouverte',
  created_at       timestamptz not null default timezone('utc', now()),
  updated_at       timestamptz
);

-- Index pour les requêtes fréquentes
create index if not exists demandes_passager_idx   on public.demandes (passager_id);
create index if not exists demandes_conducteur_idx on public.demandes (conducteur_id);
create index if not exists demandes_statut_idx     on public.demandes (statut);
create index if not exists demandes_departure_idx  on public.demandes (departure_at);

-- Realtime
alter table public.demandes replica identity full;

do $$
begin
  begin
    alter publication supabase_realtime add table public.demandes;
  exception
    when duplicate_object then null;
    when undefined_object then null;
  end;
end
$$;

-- ============================================================
--  ROW LEVEL SECURITY
-- ============================================================
alter table public.demandes enable row level security;

-- Tout le monde peut lire les demandes ouvertes
drop policy if exists "Demandes ouvertes lisibles" on public.demandes;
create policy "Demandes ouvertes lisibles"
  on public.demandes for select
  to anon, authenticated
  using (
    statut = 'ouverte'
    or passager_id = auth.uid()
    or conducteur_id = auth.uid()
  );

-- Seul le passager peut créer sa demande
drop policy if exists "Passager cree sa demande" on public.demandes;
create policy "Passager cree sa demande"
  on public.demandes for insert
  to authenticated
  with check (passager_id = auth.uid());

-- Le passager peut modifier/annuler sa demande
-- Le conducteur peut l'accepter (set conducteur_id + statut)
drop policy if exists "Mise a jour demande" on public.demandes;
create policy "Mise a jour demande"
  on public.demandes for update
  to authenticated
  using (
    passager_id = auth.uid()
    or (statut = 'ouverte' and conducteur_id is null)
  )
  with check (
    passager_id = auth.uid()
    or (auth.uid() is not null)
  );

-- ============================================================
--  RPC — Accepter une demande (atomique)
-- ============================================================
create or replace function public.accept_demande(
  p_demande_id  uuid,
  p_conducteur_id uuid
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Vérifier que la demande est encore ouverte
  if not exists (
    select 1 from public.demandes
    where id = p_demande_id
      and statut = 'ouverte'
      and conducteur_id is null
      and departure_at > now()
    for update
  ) then
    raise exception 'Cette demande n''est plus disponible.';
  end if;

  -- Vérifier que le conducteur ne prend pas sa propre demande
  if exists (
    select 1 from public.demandes
    where id = p_demande_id and passager_id = p_conducteur_id
  ) then
    raise exception 'Tu ne peux pas accepter ta propre demande.';
  end if;

  -- Accepter
  update public.demandes
  set
    conducteur_id = p_conducteur_id,
    statut        = 'acceptee',
    updated_at    = now()
  where id = p_demande_id;
end;
$$;

-- ============================================================
--  Auto-expire les demandes passées (trigger)
--  NOTE: fires only on INSERT (not UPDATE) to avoid recursion
-- ============================================================
create or replace function public.expire_old_demandes()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Only expire OTHER rows, never the row being inserted/updated
  update public.demandes
  set statut = 'expiree', updated_at = now()
  where statut = 'ouverte'
    and departure_at < now()
    and id <> NEW.id;  -- exclude the triggering row to break recursion
  return null;
end;
$$;

drop trigger if exists auto_expire_demandes on public.demandes;
create trigger auto_expire_demandes
  after insert on public.demandes          -- INSERT only, not UPDATE
  for each row
  execute function public.expire_old_demandes();
