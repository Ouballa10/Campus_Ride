import { requireSupabase } from './supabaseClient';

function formatError(error, fallback) {
  return new Error(error?.message || fallback);
}

export async function listReservations(userId) {
  const client = requireSupabase();
  const { data, error } = await client
    .from('reservations')
    .select('*')
    .eq('passager_id', userId)
    .order('date_reservation', { ascending: false });
  if (error) throw formatError(error, 'Impossible de charger tes reservations.');

  const trajetIds = data.map(r => r.trajet_id).filter(Boolean);
  let trajetsMap = {};
  if (trajetIds.length) {
    const { data: trajets } = await client.from('trajets').select('*').in('id', trajetIds);
    trajetsMap = (trajets || []).reduce((m, t) => { m[t.id] = t; return m; }, {});
  }

  const conductorIds = [...new Set(Object.values(trajetsMap).map(t => t.conducteur_id).filter(Boolean))];
  let profilesMap = {};
  if (conductorIds.length) {
    const { data: profiles } = await client.from('profiles').select('*').in('id', conductorIds);
    profilesMap = (profiles || []).reduce((m, p) => { m[p.id] = p; return m; }, {});
  }

  return data.map(r => {
    const trajet = trajetsMap[r.trajet_id];
    const driver = trajet ? profilesMap[trajet.conducteur_id] : null;
    return {
      id: r.id,
      trajetId: r.trajet_id,
      route: trajet ? `${trajet.depart} - ${trajet.destination}` : 'Trajet inconnu',
      depart: trajet?.depart || '',
      destination: trajet?.destination || '',
      date: trajet?.departure_at ? new Date(trajet.departure_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }) : '',
      time: trajet?.departure_at ? `${new Date(trajet.departure_at).getHours().toString().padStart(2,'0')}:${new Date(trajet.departure_at).getMinutes().toString().padStart(2,'0')}` : '',
      driver: driver?.full_name || 'Conducteur',
      driverInitials: (driver?.full_name || 'C').split(' ').map(w=>w[0]).slice(0,2).join('').toUpperCase(),
      pickup: trajet?.pickup_note || 'Point de rendez-vous a confirmer',
      status: r.statut === 'en_attente' ? 'En attente' : r.statut === 'confirmee' ? 'Confirmee' : r.statut === 'annulee' ? 'Annulee' : r.statut === 'refusee' ? 'Refusee' : r.statut === 'terminee' ? 'Terminee' : r.statut,
      price: trajet?.prix_par_place || 0,
      seats: trajet?.places_disponibles || 0,
      message: r.message_passager || '',
    };
  });
}

export async function createReservation({ trajetId, passagerId, messagePassager = '' }) {
  const client = requireSupabase();
  const { data, error } = await client
    .from('reservations')
    .insert({
      trajet_id: trajetId,
      passager_id: passagerId,
      statut: 'en_attente',
      message_passager: messagePassager || null,
    })
    .select('*')
    .single();
  if (error) throw formatError(error, 'Impossible de creer la reservation.');

  // Decrement available seats
  const { data: trajet } = await client.from('trajets').select('places_disponibles').eq('id', trajetId).single();
  if (trajet) {
    await client.from('trajets').update({ places_disponibles: Math.max(0, trajet.places_disponibles - 1) }).eq('id', trajetId);
  }
  return data;
}

export async function cancelReservation({ reservationId, passagerId }) {
  const client = requireSupabase();
  const { data, error } = await client
    .from('reservations')
    .update({ statut: 'annulee' })
    .eq('id', reservationId)
    .eq('passager_id', passagerId)
    .select('*')
    .single();
  if (error) throw formatError(error, "Impossible d'annuler la reservation.");
  return data;
}
