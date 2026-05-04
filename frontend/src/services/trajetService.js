<<<<<<< HEAD
<<<<<<< Updated upstream
export const trajetService = {};
=======
import {
  mapDriverReservationRecord,
=======
import {
>>>>>>> origin/main
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
<<<<<<< HEAD
    .in("trajet_id", tripIds)
    .neq("statut", "annulee");
=======
    .in("trajet_id", tripIds);
>>>>>>> origin/main

  if (error) {
    throw formatSupabaseError(error, "Impossible de charger les reservations.");
  }

  return data.reduce((countMap, reservation) => {
    countMap[reservation.trajet_id] = (countMap[reservation.trajet_id] || 0) + 1;
    return countMap;
  }, {});
}

<<<<<<< HEAD
async function fetchReservationsByTripIds(tripIds) {
  if (!tripIds.length) {
    return {};
  }

  const client = requireSupabase();
  const { data, error } = await client
    .from("reservations")
    .select("*")
    .in("trajet_id", tripIds)
    .order("date_reservation", { ascending: false });

  if (error) {
    throw formatSupabaseError(error, "Impossible de charger les passagers.");
  }

  const passengerIds = [...new Set(data.map((reservation) => reservation.passager_id).filter(Boolean))];
  const passengersById = await fetchProfilesByIds(passengerIds);

  return data.reduce((reservationMap, reservation) => {
    const tripReservations = reservationMap[reservation.trajet_id] || [];
    tripReservations.push(
      mapDriverReservationRecord(
        reservation,
        passengersById[reservation.passager_id],
      ),
    );
    reservationMap[reservation.trajet_id] = tripReservations;
    return reservationMap;
  }, {});
}

function buildDepartureAt(payload) {
  const departureAt = payload.departureAt || (
    payload.date && payload.time ? `${payload.date}T${payload.time}` : ""
  );

  if (!departureAt) {
    throw new Error("La date et l'heure du trajet sont obligatoires.");
  }

  const departureDate = new Date(departureAt);

  if (Number.isNaN(departureDate.getTime())) {
    throw new Error("La date et l'heure du trajet sont invalides.");
  }

  if (departureDate <= new Date()) {
    throw new Error("Choisis une date et une heure dans le futur pour que le trajet soit visible.");
  }

  return departureDate.toISOString();
=======
function buildDepartureAt(payload) {
  if (payload.departureAt) {
    return payload.departureAt;
  }

  if (!payload.date || !payload.time) {
    throw new Error("La date et l'heure du trajet sont obligatoires.");
  }

  return new Date(`${payload.date}T${payload.time}`).toISOString();
>>>>>>> origin/main
}

async function listAvailableTrajets() {
  const client = requireSupabase();
  const { data, error } = await client
    .from("trajets")
    .select("*")
    .gt("places_disponibles", 0)
    .gte("departure_at", new Date().toISOString())
    .order("departure_at", { ascending: true })
<<<<<<< HEAD
    .limit(50);
=======
    .limit(12);
>>>>>>> origin/main

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

<<<<<<< HEAD
  const tripIds = data.map((trajet) => trajet.id);

  try {
    const reservationsByTripId = await fetchReservationsByTripIds(tripIds);

    return data.map((trajet) =>
      mapPublishedTrajet(trajet, reservationsByTripId[trajet.id] || []),
    );
  } catch (passengerError) {
    console.warn("Passenger details sync failed:", passengerError);
    const reservationCounts = await fetchReservationCountsByTripIds(tripIds);

    return data.map((trajet) =>
      mapPublishedTrajet(trajet, reservationCounts[trajet.id] || 0),
    );
  }
=======
  const reservationCounts = await fetchReservationCountsByTripIds(
    data.map((trajet) => trajet.id),
  );

  return data.map((trajet) =>
    mapPublishedTrajet(trajet, reservationCounts[trajet.id] || 0),
  );
>>>>>>> origin/main
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
<<<<<<< HEAD
>>>>>>> Stashed changes
=======
>>>>>>> origin/main
