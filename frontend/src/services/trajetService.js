import {
  mapPublishedTrajet,
  mapTrajetToCard,
} from "../utils/appDataMappers";
import { requireSupabase } from "./supabaseClient";

function formatSupabaseError(error, fallbackMessage) {
  return new Error(error?.message || fallbackMessage);
}

async function fetchProfilesByIds(profileIds) {
  if (!profileIds.length) {
    return {};
  }

  const client = requireSupabase();
  const { data, error } = await client
    .from("profiles")
    .select("*")
    .in("id", profileIds);

  if (error) {
    throw formatSupabaseError(error, "Impossible de charger les profils.");
  }

  return data.reduce((profilesMap, profile) => {
    profilesMap[profile.id] = profile;
    return profilesMap;
  }, {});
}

async function fetchReservationCountsByTripIds(tripIds) {
  if (!tripIds.length) {
    return {};
  }

  const client = requireSupabase();
  const { data, error } = await client
    .from("reservations")
    .select("trajet_id")
    .in("trajet_id", tripIds);

  if (error) {
    throw formatSupabaseError(error, "Impossible de charger les reservations.");
  }

  return data.reduce((countMap, reservation) => {
    countMap[reservation.trajet_id] = (countMap[reservation.trajet_id] || 0) + 1;
    return countMap;
  }, {});
}

function buildDepartureAt(payload) {
  if (payload.departureAt) {
    return payload.departureAt;
  }

  if (!payload.date || !payload.time) {
    throw new Error("La date et l'heure du trajet sont obligatoires.");
  }

  return new Date(`${payload.date}T${payload.time}`).toISOString();
}

async function listAvailableTrajets() {
  const client = requireSupabase();
  const { data, error } = await client
    .from("trajets")
    .select("*")
    .gt("places_disponibles", 0)
    .gte("departure_at", new Date().toISOString())
    .order("departure_at", { ascending: true })
    .limit(12);

  if (error) {
    throw formatSupabaseError(error, "Impossible de charger les trajets.");
  }

  const profileIds = [...new Set(data.map((trajet) => trajet.conducteur_id).filter(Boolean))];
  const profilesById = await fetchProfilesByIds(profileIds);

  return data.map((trajet) =>
    mapTrajetToCard(trajet, profilesById[trajet.conducteur_id]),
  );
}

async function listPublishedTrajets(userId) {
  const client = requireSupabase();
  const { data, error } = await client
    .from("trajets")
    .select("*")
    .eq("conducteur_id", userId)
    .order("departure_at", { ascending: false });

  if (error) {
    throw formatSupabaseError(error, "Impossible de charger tes trajets.");
  }

  const reservationCounts = await fetchReservationCountsByTripIds(
    data.map((trajet) => trajet.id),
  );

  return data.map((trajet) =>
    mapPublishedTrajet(trajet, reservationCounts[trajet.id] || 0),
  );
}

async function createTrajet(payload, conducteurId) {
  const client = requireSupabase();
  const placesTotal = Number(payload.placesTotal || payload.places || 4);
  const payloadToInsert = {
    depart: payload.depart,
    destination: payload.destination,
    departure_at: buildDepartureAt(payload),
    duration_minutes: Number(payload.durationMinutes || 30),
    places_total: placesTotal,
    places_disponibles: Number(payload.placesDisponibles ?? placesTotal),
    prix_par_place: Number(payload.prixParPlace || payload.price || 0),
    description: payload.description || null,
    pickup_note: payload.pickupNote || null,
    conducteur_id: conducteurId,
  };

  const { data, error } = await client
    .from("trajets")
    .insert(payloadToInsert)
    .select("*")
    .single();

  if (error) {
    throw formatSupabaseError(error, "Impossible de publier le trajet.");
  }

  return data;
}

export const trajetService = {
  createTrajet,
  listAvailableTrajets,
  listPublishedTrajets,
};
