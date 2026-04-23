import { mapReservationRecord } from "../utils/appDataMappers";
import { requireSupabase } from "./supabaseClient";

function formatSupabaseError(error, fallbackMessage) {
  return new Error(error?.message || fallbackMessage);
}

function shouldFallbackFromRpc(error) {
  const message = `${error?.message || ""} ${error?.details || ""}`.toLowerCase();
  return (
    error?.code === "PGRST202" ||
    message.includes("could not find the function") ||
    message.includes("function public.reserve_trajet_seat") ||
    message.includes("function public.cancel_reservation_seat")
  );
}

function shouldRetryWithoutMessageColumn(error) {
  const message = `${error?.message || ""} ${error?.details || ""}`.toLowerCase();
  return message.includes("message_passager") && message.includes("column");
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

async function fetchTrajetById(trajetId) {
  const client = requireSupabase();
  const { data, error } = await client
    .from("trajets")
    .select("*")
    .eq("id", trajetId)
    .maybeSingle();

  if (error) {
    throw formatSupabaseError(error, "Impossible de charger le trajet.");
  }

  return data;
}

async function fetchReservationById(reservationId, passagerId) {
  const client = requireSupabase();
  const { data, error } = await client
    .from("reservations")
    .select("*")
    .eq("id", reservationId)
    .eq("passager_id", passagerId)
    .maybeSingle();

  if (error) {
    throw formatSupabaseError(error, "Impossible de charger la reservation.");
  }

  return data;
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

async function createReservationFallback({
  trajetId,
  passagerId,
  statut,
  messagePassager,
}) {
  const client = requireSupabase();
  const trajet = await fetchTrajetById(trajetId);

  if (!trajet) {
    throw new Error("Le trajet selectionne est introuvable.");
  }

  if (trajet.conducteur_id === passagerId) {
    throw new Error("Tu ne peux pas reserver ton propre trajet.");
  }

  if (Number(trajet.places_disponibles) <= 0) {
    throw new Error("Ce trajet est deja complet.");
  }

  const reservationPayload = {
    trajet_id: trajetId,
    passager_id: passagerId,
    message_passager: messagePassager || null,
    statut,
  };

  let insertResult = await client
    .from("reservations")
    .insert(reservationPayload)
    .select("*")
    .single();

  if (insertResult.error && shouldRetryWithoutMessageColumn(insertResult.error)) {
    insertResult = await client
      .from("reservations")
      .insert({
        trajet_id: trajetId,
        passager_id: passagerId,
        statut,
      })
      .select("*")
      .single();
  }

  const { data, error } = insertResult;

  if (error) {
    throw formatSupabaseError(error, "Impossible de creer la reservation.");
  }

  const updatedPlaces = Math.max(Number(trajet.places_disponibles) - 1, 0);
  const { data: updatedTrip, error: tripError } = await client
    .from("trajets")
    .update({ places_disponibles: updatedPlaces })
    .eq("id", trajetId)
    .eq("places_disponibles", trajet.places_disponibles)
    .select("id")
    .maybeSingle();

  if (tripError || !updatedTrip) {
    await client.from("reservations").delete().eq("id", data.id);
    throw formatSupabaseError(
      tripError,
      "Reservation creee mais mise a jour des places impossible.",
    );
  }

  return data;
}

async function createReservation({
  trajetId,
  passagerId,
  statut = "en_attente",
  messagePassager = "",
}) {
  const client = requireSupabase();
  const { data, error } = await client.rpc("reserve_trajet_seat", {
    p_message_passager: messagePassager || null,
    p_trajet_id: trajetId,
    p_passager_id: passagerId,
    p_statut: statut,
  });

  if (!error) {
    return data;
  }

  if (!shouldFallbackFromRpc(error)) {
    throw formatSupabaseError(error, "Impossible de creer la reservation.");
  }

  return createReservationFallback({
    trajetId,
    passagerId,
    statut,
    messagePassager,
  });
}

async function cancelReservationFallback({ reservationId, passagerId }) {
  const client = requireSupabase();
  const reservation = await fetchReservationById(reservationId, passagerId);

  if (!reservation) {
    throw new Error("Reservation introuvable.");
  }

  if (reservation.statut === "annulee") {
    return reservation;
  }

  const trajet = await fetchTrajetById(reservation.trajet_id);
  const { data, error } = await client
    .from("reservations")
    .update({ statut: "annulee" })
    .eq("id", reservationId)
    .eq("passager_id", passagerId)
    .select("*")
    .single();

  if (error) {
    throw formatSupabaseError(error, "Impossible d'annuler la reservation.");
  }

  if (!trajet) {
    return data;
  }

  const nextPlaces = Math.min(
    Number(trajet.places_total),
    Number(trajet.places_disponibles) + 1,
  );
  const { data: updatedTrip, error: tripError } = await client
    .from("trajets")
    .update({ places_disponibles: nextPlaces })
    .eq("id", trajet.id)
    .select("id")
    .maybeSingle();

  if (tripError || !updatedTrip) {
    await client
      .from("reservations")
      .update({ statut: reservation.statut })
      .eq("id", reservationId)
      .eq("passager_id", passagerId);

    throw formatSupabaseError(
      tripError,
      "Annulation impossible a finaliser sur le trajet.",
    );
  }

  return data;
}

async function cancelReservation({ reservationId, passagerId }) {
  const client = requireSupabase();
  const { data, error } = await client.rpc("cancel_reservation_seat", {
    p_reservation_id: reservationId,
    p_passager_id: passagerId,
  });

  if (!error) {
    return data;
  }

  if (!shouldFallbackFromRpc(error)) {
    throw formatSupabaseError(error, "Impossible d'annuler la reservation.");
  }

  return cancelReservationFallback({ reservationId, passagerId });
}

export const reservationService = {
  cancelReservation,
  createReservation,
  listReservations,
};
