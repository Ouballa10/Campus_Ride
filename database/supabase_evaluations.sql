-- =========================
-- EVALUATIONS TABLE - Add trajet_id column
-- =========================
-- The evaluations table already exists with: id, utilisateur_id, conducteur_id, note, commentaire, created_at
-- We just need to add trajet_id and a unique constraint

-- Add trajet_id column if not exists
alter table public.evaluations
add column if not exists trajet_id uuid references public.trajets(id) on delete cascade;

-- Add unique constraint so one user can only rate once per trip
-- (drop first if exists to avoid errors on re-run)
do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'evaluations_trajet_utilisateur_unique'
  ) then
    alter table public.evaluations
    add constraint evaluations_trajet_utilisateur_unique unique (trajet_id, utilisateur_id);
  end if;
end $$;

-- Index for fast lookups
create index if not exists idx_evaluations_conducteur on public.evaluations(conducteur_id);
create index if not exists idx_evaluations_trajet on public.evaluations(trajet_id);
