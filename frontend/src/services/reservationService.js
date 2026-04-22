import { mapReservationRecord } from "../utils/appDataMappers";
import { requireSupabase } from "./supabaseClient";

function formatSupabaseError(error, fallbackMessage) {
  return new Error(error?.message || fallbackMessage);
}

async function fetchTrajetsByIds(trajetIds) {
  if (!trajetIds.length) {
    return {};
  }

  const client = requireSupabase();
  const { data, error } = await client
    .from("trajets")
    .select("*")
    .in("id", trajetIds);

  if (error) {
    throw formatSupabaseError(error, "Impossible de charger les trajets reserves.");
  }

  return data.reduce((trajetsMap, trajet) => {
    trajetsMap[trajet.id] = trajet;
    return trajetsMap;
  }, {});
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
    throw formatSupabaseError(error, "Impossible de charger les conducteurs.");
  }

  return data.reduce((profilesMap, profile) => {
    profilesMap[profile.id] = profile;
    return profilesMap;
  }, {});
}

async function listReservations(userId) {
  const client = requireSupabase();
  const { data, error } = await client
    .from("reservations")
    .select("*")
    .eq("passager_id", userId)
    .order("date_reservation", { ascending: false });

  if (error) {
    throw formatSupabaseError(error, "Impossible de charger tes reservations.");
  }

  const trajetsById = await fetchTrajetsByIds(
    data.map((reservation) => reservation.trajet_id),
  );
  const conductorIds = [
    ...new Set(
      Object.values(trajetsById)
        .map((trajet) => trajet.conducteur_id)
        .filter(Boolean),
    ),
  ];
  const profilesById = await fetchProfilesByIds(conductorIds);

  return data.map((reservation) => {
    const trajet = trajetsById[reservation.trajet_id];
    return mapReservationRecord(
      reservation,
      trajet,
      profilesById[trajet?.conducteur_id],
    );
  });
}

async function createReservation({ trajetId, passagerId, statut = "en_attente" }) {
  const client = requireSupabase();
  const { data, error } = await client
    .from("reservations")
    .insert({
      trajet_id: trajetId,
      passager_id: passagerId,
      statut,
    })
    .select("*")
    .single();

  if (error) {
    throw formatSupabaseError(error, "Impossible de creer la reservation.");
  }

  return data;
}

export const reservationService = {
  createReservation,
  listReservations,
};
