import { requireSupabase } from './supabaseClient';

function formatError(error, fallback) {
  return new Error(error?.message || fallback);
}

async function fetchProfilesByIds(ids) {
  if (!ids.length) return {};
  const client = requireSupabase();
  const { data, error } = await client.from('profiles').select('*').in('id', ids);
  if (error) throw formatError(error, 'Impossible de charger les profils.');
  return data.reduce((map, p) => { map[p.id] = p; return map; }, {});
}

function mapTrajetToCard(trajet, profile) {
  const dep = new Date(trajet.departure_at);
  const endTime = new Date(dep.getTime() + (trajet.duration_minutes || 30) * 60000);
  const time = `${dep.getHours().toString().padStart(2,'0')}:${dep.getMinutes().toString().padStart(2,'0')} - ${endTime.getHours().toString().padStart(2,'0')}:${endTime.getMinutes().toString().padStart(2,'0')}`;
  const name = profile?.full_name || 'Conducteur';
  const initials = name.split(' ').map(w => w[0]).slice(0,2).join('').toUpperCase();

  return {
    id: trajet.id,
    depart: trajet.depart,
    destination: trajet.destination,
    routeLabel: `${trajet.depart} - ${trajet.destination}`,
    conducteurId: trajet.conducteur_id,
    departureAt: trajet.departure_at,
    durationMinutes: trajet.duration_minutes,
    time,
    driver: name,
    driverInitials: initials,
    car: profile?.vehicle_label || 'Vehicule non renseigne',
    seats: trajet.places_disponibles,
    totalSeats: trajet.places_total,
    duration: trajet.duration_minutes >= 60 ? `${Math.floor(trajet.duration_minutes/60)}h${trajet.duration_minutes%60||''}` : `${trajet.duration_minutes} min`,
    price: trajet.prix_par_place,
    rating: profile?.rating || 4.0,
    role: profile?.role === 'conducteur' ? 'Conducteur' : 'Passager',
    description: trajet.description || '',
    pickup: trajet.pickup_note || 'Point de rendez-vous a confirmer',
  };
}

export async function listAvailableTrajets() {
  const client = requireSupabase();
  const { data, error } = await client
    .from('trajets')
    .select('*')
    .gt('places_disponibles', 0)
    .gte('departure_at', new Date().toISOString())
    .order('departure_at', { ascending: true })
    .limit(50);
  if (error) throw formatError(error, 'Impossible de charger les trajets.');

  const profileIds = [...new Set(data.map(t => t.conducteur_id).filter(Boolean))];
  const profiles = await fetchProfilesByIds(profileIds);
  return data.map(t => mapTrajetToCard(t, profiles[t.conducteur_id]));
}

export async function listPublishedTrajets(userId) {
  const client = requireSupabase();
  const { data, error } = await client
    .from('trajets')
    .select('*')
    .eq('conducteur_id', userId)
    .order('departure_at', { ascending: false });
  if (error) throw formatError(error, 'Impossible de charger tes trajets.');
  return data;
}

export async function createTrajet(payload, conducteurId) {
  const client = requireSupabase();
  const departureAt = `${payload.date}T${payload.time}`;
  const { data, error } = await client
    .from('trajets')
    .insert({
      depart: payload.depart,
      destination: payload.destination,
      departure_at: new Date(departureAt).toISOString(),
      duration_minutes: Number(payload.durationMinutes || 30),
      places_total: Number(payload.seats || 4),
      places_disponibles: Number(payload.seats || 4),
      prix_par_place: Number(payload.price || 0),
      description: payload.description || null,
      pickup_note: payload.pickupNote || null,
      conducteur_id: conducteurId,
    })
    .select('*')
    .single();
  if (error) throw formatError(error, 'Impossible de publier le trajet.');
  return data;
}

export async function deleteTrajet(trajetId, conducteurId) {
  const client = requireSupabase();
  const { error } = await client
    .from('trajets')
    .delete()
    .eq('id', trajetId)
    .eq('conducteur_id', conducteurId);
  if (error) throw formatError(error, 'Impossible de supprimer ce trajet.');
}
