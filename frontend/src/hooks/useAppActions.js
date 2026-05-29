import { useCallback } from "react";
import { reservationService } from "../services/reservationService";
import { trajetService } from "../services/trajetService";
import {
  applyPassengerReservationsToPublishedTrip,
  buildDemoPassengerReservation,
  buildDemoReservation,
  buildDemoTripCard,
  buildPublishedTripFromCard,
} from "../utils/tripHelpers";

/**
 * Hook that provides all app actions (publish, reserve, cancel, confirm, reject, etc.)
 * Handles both Supabase mode and demo/offline mode.
 */
export function useAppActions({
  appData,
  setAppData,
  canUseSupabaseData,
  sessionUserId,
  currentUser,
  reservedTripIds,
  refresh,
}) {
  const handlePublish = useCallback(async (payload) => {
    if (canUseSupabaseData) {
      await trajetService.createTrajet(payload, sessionUserId);
      refresh();
      return;
    }

    const conducteurId = sessionUserId || "demo-current-user";
    const nextTrip = buildDemoTripCard(payload, currentUser, conducteurId);

    setAppData((currentData) => ({
      ...currentData,
      currentUser: {
        ...currentData.currentUser,
        tripsCount: currentData.currentUser.tripsCount + 1,
      },
      publishedTrips: [
        buildPublishedTripFromCard(nextTrip),
        ...currentData.publishedTrips,
      ],
      tripOptions: [nextTrip, ...currentData.tripOptions],
    }));
  }, [canUseSupabaseData, sessionUserId, currentUser, setAppData, refresh]);

  const handleReserve = useCallback(async (selectedTripOption, message) => {
    if (!selectedTripOption?.id) {
      throw new Error("Choisis d'abord un trajet avant de reserver.");
    }

    // Check profile completeness for passenger
    const user = appData.currentUser;
    const passengerMissing = [];
    if (!user?.name || user.name === "CampusRide") passengerMissing.push("nom complet");
    if (!user?.phone) {
      passengerMissing.push("telephone");
    } else {
      const phoneClean = user.phone.replace(/[\s\-\.]/g, "");
      const validPhone = /^(\+212|0)[5-7]\d{8}$/.test(phoneClean);
      if (!validPhone) passengerMissing.push("telephone valide (ex: +212 6XX XXX XXX)");
    }
    if (passengerMissing.length > 0) {
      throw new Error(`Complete ton profil avant de reserver : ${passengerMissing.join(", ")}. Va dans Profil.`);
    }

    if (reservedTripIds.includes(selectedTripOption.id)) {
      throw new Error("Ce trajet est deja present dans tes reservations.");
    }

    if (selectedTripOption.seats <= 0) {
      throw new Error("Ce trajet n'a plus de place disponible.");
    }

    if (canUseSupabaseData) {
      await reservationService.createReservation({
        trajetId: selectedTripOption.id,
        passagerId: sessionUserId,
        messagePassager: message,
      });
      refresh();
      return;
    }

    const nextReservation = buildDemoReservation(selectedTripOption, message);

    setAppData((currentData) => {
      const nextTripOptions = currentData.tripOptions.map((trip) =>
        trip.id === selectedTripOption.id
          ? { ...trip, seats: Math.max(Number(trip.seats) - 1, 0) }
          : trip,
      );
      const updatedTrip = nextTripOptions.find((trip) => trip.id === selectedTripOption.id);
      const nextPublishedTrips = currentData.publishedTrips.map((trip) => {
        if (trip.id !== selectedTripOption.id || !updatedTrip) return trip;

        const passengerReservations = [
          buildDemoPassengerReservation(nextReservation, currentUser),
          ...(trip.passengerReservations || []),
        ];

        return buildPublishedTripFromCard({
          ...updatedTrip,
          passengerReservations,
        });
      });

      return {
        ...currentData,
        currentUser: {
          ...currentData.currentUser,
          reservationsCount: currentData.currentUser.reservationsCount + 1,
        },
        publishedTrips: nextPublishedTrips,
        reservations: [nextReservation, ...currentData.reservations],
        tripOptions: nextTripOptions,
      };
    });
  }, [appData.currentUser, canUseSupabaseData, sessionUserId, currentUser, reservedTripIds, setAppData, refresh]);

  const handleCancelReservation = useCallback(async (reservationId) => {
    if (canUseSupabaseData) {
      await reservationService.cancelReservation({
        reservationId,
        passagerId: sessionUserId,
      });
      refresh();
      return;
    }

    const reservationToCancel = appData.reservations.find(
      (reservation) => reservation.id === reservationId,
    );

    if (!reservationToCancel) throw new Error("Reservation introuvable.");
    if (reservationToCancel.status === "Annulee") return;

    setAppData((currentData) => {
      const nextReservations = currentData.reservations.map((reservation) =>
        reservation.id === reservationId
          ? { ...reservation, status: "Annulee" }
          : reservation,
      );
      const nextTripOptions = currentData.tripOptions.map((trip) => {
        if (trip.id !== reservationToCancel.trajetId) return trip;
        return {
          ...trip,
          seats: Math.min(Number(trip.totalSeats || trip.seats), Number(trip.seats) + 1),
        };
      });
      const updatedTrip = nextTripOptions.find(
        (trip) => trip.id === reservationToCancel.trajetId,
      );
      const nextPublishedTrips = currentData.publishedTrips.map((trip) => {
        if (trip.id !== reservationToCancel.trajetId || !updatedTrip) return trip;
        const passengerReservations = (trip.passengerReservations || []).map((r) =>
          r.id === reservationId ? { ...r, status: "Annulee" } : r,
        );
        return buildPublishedTripFromCard({ ...updatedTrip, passengerReservations });
      });

      return {
        ...currentData,
        publishedTrips: nextPublishedTrips,
        reservations: nextReservations,
        tripOptions: nextTripOptions,
      };
    });
  }, [appData.reservations, canUseSupabaseData, sessionUserId, setAppData, refresh]);

  const handleConfirmPassengerReservation = useCallback(async (reservationId) => {
    if (canUseSupabaseData) {
      await reservationService.updateReservationStatus({
        conducteurId: sessionUserId,
        reservationId,
        statut: "confirmee",
      });
      refresh();
      return;
    }

    setAppData((currentData) => ({
      ...currentData,
      publishedTrips: currentData.publishedTrips.map((trip) => {
        const passengerReservations = (trip.passengerReservations || []).map((r) =>
          r.id === reservationId ? { ...r, status: "Confirmee" } : r,
        );
        return applyPassengerReservationsToPublishedTrip(trip, passengerReservations);
      }),
    }));
  }, [canUseSupabaseData, sessionUserId, setAppData, refresh]);

  const handleRejectPassengerReservation = useCallback(async (reservationId) => {
    if (canUseSupabaseData) {
      await reservationService.updateReservationStatus({
        conducteurId: sessionUserId,
        reservationId,
        statut: "refusee",
      });
      refresh();
      return;
    }

    setAppData((currentData) => ({
      ...currentData,
      publishedTrips: currentData.publishedTrips.map((trip) => {
        const passengerReservations = (trip.passengerReservations || []).map((r) =>
          r.id === reservationId ? { ...r, status: "Refusee" } : r,
        );
        return applyPassengerReservationsToPublishedTrip(trip, passengerReservations);
      }),
    }));
  }, [canUseSupabaseData, sessionUserId, setAppData, refresh]);

  const handleCloseTripReservations = useCallback(async (tripId) => {
    if (canUseSupabaseData) {
      await trajetService.closeTrajet(tripId, sessionUserId);
      refresh();
      return;
    }

    setAppData((currentData) => ({
      ...currentData,
      publishedTrips: currentData.publishedTrips.map((trip) =>
        trip.id === tripId ? { ...trip, seats: "0/0", status: "Ferme" } : trip,
      ),
      tripOptions: currentData.tripOptions.map((trip) =>
        trip.id === tripId ? { ...trip, seats: 0 } : trip,
      ),
    }));
  }, [canUseSupabaseData, sessionUserId, setAppData, refresh]);

  const handleDeleteTrip = useCallback(async (tripId) => {
    if (canUseSupabaseData) {
      await trajetService.deleteTrajet(tripId, sessionUserId);
      refresh();
      return;
    }

    setAppData((currentData) => ({
      ...currentData,
      publishedTrips: currentData.publishedTrips.filter((trip) => trip.id !== tripId),
      tripOptions: currentData.tripOptions.filter((trip) => trip.id !== tripId),
    }));
  }, [canUseSupabaseData, sessionUserId, setAppData, refresh]);

  return {
    handlePublish,
    handleReserve,
    handleCancelReservation,
    handleConfirmPassengerReservation,
    handleRejectPassengerReservation,
    handleCloseTripReservations,
    handleDeleteTrip,
  };
}
