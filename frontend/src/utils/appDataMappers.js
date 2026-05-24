function toNumber(value, fallback = 0) {
  const numericValue = Number(value);
  return Number.isFinite(numericValue) ? numericValue : fallback;
}

function toDate(value) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function getInitials(fullName = "") {
  const parts = fullName
    .split(" ")
    .map((part) => part.trim())
    .filter(Boolean)
    .slice(0, 2);

  if (!parts.length) {
    return "CR";
  }

  return parts.map((part) => part[0]?.toUpperCase() ?? "").join("");
}

export function formatRole(role = "passager") {
  if (role === "conducteur") {
    return "Etudiant conducteur";
  }

  if (role === "admin") {
    return "Administrateur";
  }

  return "Etudiant passager";
}

function normalizeVehiclePhotos(value) {
  if (Array.isArray(value)) {
    return value.filter((item) => typeof item === "string" && item.trim());
  }

  if (typeof value === "string" && value.trim()) {
    try {
      const parsedValue = JSON.parse(value);

      if (Array.isArray(parsedValue)) {
        return normalizeVehiclePhotos(parsedValue);
      }
    } catch {
      return [value];
    }
  }

  return [];
}

function formatVehicleLabel(profile = {}) {
  const safeProfile = profile || {};
  const vehicleName = [safeProfile.vehicle_make, safeProfile.vehicle_model]
    .map((item) => `${item || ""}`.trim())
    .filter(Boolean)
    .join(" ");
  const vehicleDetails = [safeProfile.vehicle_color, safeProfile.vehicle_plate]
    .map((item) => `${item || ""}`.trim())
    .filter(Boolean);

  return [vehicleName, ...vehicleDetails].filter(Boolean).join(" - ") ||
    safeProfile.vehicle_label ||
    "";
}

export function formatRelativeDate(dateValue) {
  const date = toDate(dateValue);

  if (!date) {
    return "A venir";
  }

  const targetDay = new Date(date);
  targetDay.setHours(0, 0, 0, 0);

  const currentDay = new Date();
  currentDay.setHours(0, 0, 0, 0);

  const dayDifference = Math.round((targetDay - currentDay) / 86400000);

  if (dayDifference === 0) {
    return "Aujourd'hui";
  }

  if (dayDifference === 1) {
    return "Demain";
  }

  return date.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
  });
}

export function formatClock(dateValue) {
  const date = toDate(dateValue);

  if (!date) {
    return "--:--";
  }

  return date.toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatTimeWindow(dateValue, durationMinutes = 0) {
  const date = toDate(dateValue);

  if (!date) {
    return "Horaire a confirmer";
  }

  const start = formatClock(date);

  if (!durationMinutes) {
    return start;
  }

  const end = new Date(date.getTime() + toNumber(durationMinutes) * 60000);
  return `${start} - ${formatClock(end)}`;
}

export function formatDuration(durationMinutes = 0) {
  const safeDuration = toNumber(durationMinutes);

  if (!safeDuration) {
    return "Flexible";
  }

  const hours = Math.floor(safeDuration / 60);
  const minutes = safeDuration % 60;

  if (hours && minutes) {
    return `${hours}h ${minutes}min`;
  }

  if (hours) {
    return `${hours}h`;
  }

  return `${minutes} min`;
}

export function formatReservationStatus(status = "en_attente") {
  const normalizedStatus = `${status}`.trim().toLowerCase();

  if (normalizedStatus === "confirmee") {
    return "Confirmee";
  }

  if (normalizedStatus === "annulee") {
    return "Annulee";
  }

  if (normalizedStatus === "refusee") {
    return "Refusee";
  }

  if (normalizedStatus === "terminee") {
    return "Terminee";
  }

  return "En attente";
}

function formatTripStatus(trajet, availablePlaces, departureDate) {
  const rawStatus = `${trajet?.statut || trajet?.status || ""}`.trim().toLowerCase();

  if (rawStatus === "annule" || rawStatus === "annulee") {
    return "Annulee";
  }

  if (rawStatus === "ferme" || rawStatus === "closed") {
    return "Ferme";
  }

  if (rawStatus === "termine" || rawStatus === "terminee") {
    return "Terminee";
  }

  if (departureDate && departureDate < new Date()) {
    return "Passe";
  }

  if (availablePlaces <= 0) {
    return "Complet";
  }

  return "Actif";
}

export function buildCurrentUser(profile, stats = {}) {
  const fullName = profile?.full_name?.trim() || profile?.email || "CampusRide";
  const vehicleLabel = formatVehicleLabel(profile);

  return {
    name: fullName,
    initials: getInitials(fullName),
    role: formatRole(profile?.role),
    roleValue: profile?.role || "passager",
    email: profile?.email || "",
    phone: profile?.phone || "",
    photo: profile?.photo_profil || "",
    rating: toNumber(profile?.note_moyenne, 0),
    tripsCount: toNumber(stats.tripsCount, 0),
    reservationsCount: toNumber(stats.reservationsCount, 0),
    reviewCount: toNumber(stats.reviewCount, 0),
    car: vehicleLabel || "Vehicule a renseigner",
    bio: profile?.bio || "",
    campus: profile?.campus || "",
    vehicle: {
      color: profile?.vehicle_color || "",
      license: profile?.driver_license || "",
      make: profile?.vehicle_make || "",
      model: profile?.vehicle_model || "",
      photos: normalizeVehiclePhotos(profile?.vehicle_photos),
      plate: profile?.vehicle_plate || "",
      seats: toNumber(profile?.vehicle_seats, 0) || "",
    },
  };
}

export function mapTrajetToCard(trajet, driverProfile = {}) {
  const driverName = driverProfile.full_name || "Conducteur CampusRide";

  return {
    id: trajet.id,
    depart: trajet.depart,
    destination: trajet.destination,
    routeLabel: `${trajet.depart} - ${trajet.destination}`,
    conducteurId: trajet.conducteur_id || "",
    departureAt: trajet.departure_at,
    createdAt: trajet.created_at || "",
    durationMinutes: toNumber(trajet.duration_minutes, 0),
    time: formatTimeWindow(trajet.departure_at, trajet.duration_minutes),
    driver: driverName,
    driverInitials: getInitials(driverName || driverProfile.email),
    driverAvatar: driverProfile.photo_profil || "",
    driverPhone: driverProfile.phone || "",
    car: formatVehicleLabel(driverProfile) || "Vehicule a confirmer",
    seats: toNumber(trajet.places_disponibles, 0),
    totalSeats: toNumber(trajet.places_total, 0),
    duration: formatDuration(trajet.duration_minutes),
    price: toNumber(trajet.prix_par_place, 0),
    rating: toNumber(driverProfile.note_moyenne, 0),
    role: formatRole(driverProfile.role),
    description: trajet.description || "",
    pickup: trajet.pickup_note || "Point de rendez-vous confirme apres reservation",
    pickupNote: trajet.pickup_note || "",
  };
}

export function mapPublishedTrajet(trajet, reservations = null) {
  const totalPlaces = toNumber(trajet.places_total, 0);
  const availablePlaces = toNumber(trajet.places_disponibles, 0);
  const passengerReservations = Array.isArray(reservations) ? reservations : [];
  const confirmedReservations = passengerReservations.filter(
    (reservation) => reservation.status === "Confirmee",
  ).length;
  const pendingReservations = passengerReservations.filter(
    (reservation) => reservation.status === "En attente",
  ).length;
  const reservationsCount =
    typeof reservations === "number"
      ? reservations
      : Array.isArray(reservations)
        ? passengerReservations.filter(
            (reservation) => reservation.status !== "Annulee",
          ).length
        : null;
  const confirmedPassengers = reservationsCount ?? Math.max(totalPlaces - availablePlaces, 0);
  const passengerSummary = Array.isArray(reservations)
    ? [
        confirmedReservations ? `${confirmedReservations} confirme(s)` : "",
        pendingReservations ? `${pendingReservations} en attente` : "",
      ].filter(Boolean).join(" - ")
    : "";
  const departureDate = toDate(trajet.departure_at);
  const status = formatTripStatus(trajet, availablePlaces, departureDate);
  const payingReservations = passengerReservations.filter(
    (reservation) => !["Annulee", "Refusee"].includes(reservation.status),
  );

  return {
    id: trajet.id,
    depart: trajet.depart,
    destination: trajet.destination,
    departureAt: trajet.departure_at,
    durationMinutes: toNumber(trajet.duration_minutes, 0),
    pickup: trajet.pickup_note || "Point de rendez-vous a confirmer",
    description: trajet.description || "",
    route: `${trajet.depart} - ${trajet.destination}`,
    date: formatRelativeDate(trajet.departure_at),
    time: formatClock(trajet.departure_at),
    price: toNumber(trajet.prix_par_place, 0),
    availableSeats: availablePlaces,
    totalSeats: totalPlaces,
    seats: `${availablePlaces}/${totalPlaces}`,
    status,
    earningsEstimate: payingReservations.length * toNumber(trajet.prix_par_place, 0),
    reservationsCount: payingReservations.length,
    passengers: passengerSummary || (
      confirmedPassengers > 0
        ? `${confirmedPassengers} demande(s)`
        : `Encore ${availablePlaces} places`
    ),
    passengerReservations,
  };
}

export function mapReservationRecord(reservation, trajet, driverProfile = {}) {
  const driverName = driverProfile.full_name || "Conducteur CampusRide";

  return {
    id: reservation.id,
    trajetId: reservation.trajet_id || "",
    depart: trajet?.depart || "Depart a confirmer",
    destination: trajet?.destination || "Destination a confirmer",
    departureAt: trajet?.departure_at || "",
    route: trajet
      ? `${trajet.depart} - ${trajet.destination}`
      : "Trajet CampusRide",
    date: formatRelativeDate(trajet?.departure_at),
    time: formatClock(trajet?.departure_at),
    driver: driverName,
    driverInitials: getInitials(driverName || driverProfile.email),
    driverAvatar: driverProfile.photo_profil || "",
    driverPhone: driverProfile.phone || "",
    pickup: trajet?.pickup_note || "Point de rendez-vous a confirmer",
    message: reservation.message_passager || "",
    status: formatReservationStatus(reservation.statut),
    price: toNumber(trajet?.prix_par_place, 0),
    seats: `${toNumber(trajet?.places_disponibles, 0)}/${toNumber(trajet?.places_total, 0)}`,
    totalSeats: toNumber(trajet?.places_total, 0),
    paymentStatus: reservation.payment_status || "A regler",
    rideStatus: reservation.ride_status || formatTripStatus(
      trajet || {},
      toNumber(trajet?.places_disponibles, 0),
      toDate(trajet?.departure_at),
    ),
  };
}

export function mapDriverReservationRecord(reservation, passengerProfile = {}) {
  const passengerName =
    passengerProfile.full_name || passengerProfile.email || "Passager CampusRide";

  return {
    id: reservation.id,
    passengerId: reservation.passager_id || "",
    passenger: passengerName,
    passengerInitials: getInitials(passengerName),
    passengerAvatar: passengerProfile.photo_profil || "",
    phone: passengerProfile.phone || "",
    campus: passengerProfile.campus || "",
    message: reservation.message_passager || "",
    status: formatReservationStatus(reservation.statut),
    paymentStatus: reservation.payment_status || "A regler",
    rideStatus: reservation.ride_status || "",
    createdAt: reservation.date_reservation || "",
  };
}
