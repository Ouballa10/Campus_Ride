import {
  formatClock,
  formatDuration,
  formatRelativeDate,
  formatTimeWindow,
  getInitials,
} from "./appDataMappers";

/**
 * Build a demo trip card from a publish form payload (used in demo/offline mode)
 */
export function buildDemoTripCard(payload, user, conducteurId) {
  const departureAt = new Date(`${payload.date}T${payload.time}`).toISOString();
  const seats = Number(payload.seats || 1);
  const durationMinutes = Number(payload.durationMinutes || 30);
  const price = Number(payload.price || 0);
  const pickup = payload.pickupNote?.trim() || "Point de rendez-vous confirme apres reservation";

  return {
    id: `demo-trip-${Date.now()}`,
    depart: payload.depart.trim(),
    destination: payload.destination.trim(),
    routeLabel: `${payload.depart.trim()} - ${payload.destination.trim()}`,
    conducteurId,
    departureAt,
    durationMinutes,
    time: formatTimeWindow(departureAt, durationMinutes),
    driver: user.name,
    driverInitials: user.initials || getInitials(user.name),
    car: user.car || "Vehicule a renseigner",
    seats,
    totalSeats: seats,
    duration: formatDuration(durationMinutes),
    price,
    rating: Number(user.rating || 0),
    role: user.role,
    description: payload.description?.trim() || "",
    pickup,
    pickupNote: pickup,
  };
}

/**
 * Build a published trip summary from a trip card object
 */
export function buildPublishedTripFromCard(trip) {
  const seatsLeft = Number(trip.seats || 0);
  const totalSeats = Number(trip.totalSeats || trip.seats || 0);
  const isPast = new Date(trip.departureAt) < new Date();
  const status = isPast ? "Passe" : seatsLeft <= 0 ? "Complet" : "Actif";
  const passengerReservations = trip.passengerReservations || [];
  const passengers = buildPassengerSummary(passengerReservations, seatsLeft);

  return {
    id: trip.id,
    route: trip.routeLabel,
    date: formatRelativeDate(trip.departureAt),
    time: formatClock(trip.departureAt),
    price: trip.price,
    seats: `${seatsLeft}/${totalSeats}`,
    status,
    passengers,
    passengerReservations,
  };
}

/**
 * Build a passenger summary string from reservations
 */
export function buildPassengerSummary(passengerReservations = [], seatsLeft = 0) {
  const confirmedCount = passengerReservations.filter(
    (reservation) => reservation.status === "Confirmee",
  ).length;
  const pendingCount = passengerReservations.filter(
    (reservation) => reservation.status === "En attente",
  ).length;

  if (confirmedCount || pendingCount) {
    return [
      confirmedCount ? `${confirmedCount} confirme(s)` : "",
      pendingCount ? `${pendingCount} en attente` : "",
    ].filter(Boolean).join(" - ");
  }

  const remainingLabel = seatsLeft > 1 ? "places" : "place";
  return seatsLeft <= 0 ? "Liste complete" : `Encore ${seatsLeft} ${remainingLabel}`;
}

/**
 * Parse the available seats from a "X/Y" string
 */
export function parsePublishedSeatsLeft(seats = "0/0") {
  return Number(`${seats}`.split("/")[0] || 0);
}

/**
 * Apply passenger reservations to a published trip and recalculate summary
 */
export function applyPassengerReservationsToPublishedTrip(trip, passengerReservations) {
  return {
    ...trip,
    passengers: buildPassengerSummary(
      passengerReservations,
      parsePublishedSeatsLeft(trip.seats),
    ),
    passengerReservations,
  };
}

/**
 * Build a demo reservation object (used in demo/offline mode)
 */
export function buildDemoReservation(trip, message) {
  return {
    id: `demo-reservation-${Date.now()}`,
    trajetId: trip.id,
    route: trip.routeLabel,
    date: formatRelativeDate(trip.departureAt),
    time: formatClock(trip.departureAt),
    driver: trip.driver,
    pickup: trip.pickup,
    message: message.trim(),
    status: "En attente",
    price: trip.price,
  };
}

/**
 * Build a demo passenger reservation record (used in demo/offline mode)
 */
export function buildDemoPassengerReservation(reservation, user) {
  return {
    id: reservation.id,
    passenger: user.name,
    passengerInitials: user.initials,
    phone: user.phone,
    status: reservation.status,
    message: reservation.message,
    createdAt: new Date().toISOString(),
  };
}

/**
 * Check if a trip belongs to the current user
 */
export function isTripOwnedByCurrentUser(trip, user, sessionUserId) {
  if (!trip || !user) {
    return false;
  }

  if (sessionUserId && trip.conducteurId) {
    return trip.conducteurId === sessionUserId;
  }

  return (
    trip.driver?.trim().toLowerCase() === user.name?.trim().toLowerCase()
  );
}
