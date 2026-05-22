-- CampusRide chat messages table
-- Run this in Supabase SQL Editor

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  reservation_id uuid not null references public.reservations(id) on delete cascade,
  sender_id uuid not null references public.profiles(id) on delete cascade,
  content text not null check (char_length(content) > 0 and char_length(content) <= 1000),
  created_at timestamptz not null default timezone('utc', now())
);

alter table public.messages enable row level security;

grant select, insert on public.messages to authenticated;

-- Only the passenger and the driver of the trip can read messages
drop policy if exists "Users read messages on their reservations" on public.messages;
create policy "Users read messages on their reservations"
on public.messages
for select
to authenticated
using (
  exists (
    select 1 from public.reservations r
    join public.trajets t on t.id = r.trajet_id
    where r.id = messages.reservation_id
    and (r.passager_id = auth.uid() or t.conducteur_id = auth.uid())
  )
);

-- Only the passenger and the driver can send messages
drop policy if exists "Users send messages on their reservations" on public.messages;
create policy "Users send messages on their reservations"
on public.messages
for insert
to authenticated
with check (
  sender_id = auth.uid()
  and exists (
    select 1 from public.reservations r
    join public.trajets t on t.id = r.trajet_id
    where r.id = reservation_id
    and (r.passager_id = auth.uid() or t.conducteur_id = auth.uid())
  )
);

-- Enable realtime for messages
alter table public.messages replica identity full;

do $$
begin
  begin
    alter publication supabase_realtime add table public.messages;
  exception
    when duplicate_object then null;
    when undefined_object then null;
  end;
end
$$;

notify pgrst, 'reload schema';
