alter table public.reservations
add column if not exists message_passager text;

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
  select *
  into v_trajet
  from public.trajets
  where id = p_trajet_id
  for update;

  if not found then
    raise exception 'Trajet introuvable.';
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
