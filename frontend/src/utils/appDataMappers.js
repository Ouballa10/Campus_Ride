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
  if (status === "confirmee") {
    return "Confirmee";
  }

  if (status === "annulee") {
    return "Annulee";
  }

  return "En attente";
}

export function buildCurrentUser(profile, stats = {}) {
  const fullName = profile?.full_name?.trim() || profile?.email || "CampusRide";

  return {
    name: fullName,
    initials: getInitials(fullName),
    role: formatRole(profile?.role),
    rating: toNumber(profile?.note_moyenne, 0),
    tripsCount: toNumber(stats.tripsCount, 0),
    reservationsCount: toNumber(stats.reservationsCount, 0),
    reviewCount: toNumber(stats.reviewCount, 0),
    car: profile?.vehicle_label || "Vehicule a renseigner",
  };
}

export function mapTrajetToCard(trajet, driverProfile = {}) {
  return {
    id: trajet.id,
    depart: trajet.depart,
    destination: trajet.destination,
    time: formatTimeWindow(trajet.departure_at, trajet.duration_minutes),
    driver: driverProfile.full_name || "Conducteur CampusRide",
    driverInitials: getInitials(driverProfile.full_name || driverProfile.email),
    car: driverProfile.vehicle_label || "Vehicule a confirmer",
    seats: toNumber(trajet.places_disponibles, 0),
    duration: formatDuration(trajet.duration_minutes),
    price: toNumber(trajet.prix_par_place, 0),
    rating: toNumber(driverProfile.note_moyenne, 0),
    role: formatRole(driverProfile.role),
    pickup: trajet.pickup_note || "Point de rendez-vous confirme apres reservation",
  };
}

export function mapPublishedTrajet(trajet, reservationsCount = null) {
  const totalPlaces = toNumber(trajet.places_total, 0);
  const availablePlaces = toNumber(trajet.places_disponibles, 0);
  const confirmedPassengers = reservationsCount ?? Math.max(totalPlaces - availablePlaces, 0);
  const departureDate = toDate(trajet.departure_at);

  let status = "Actif";

  if (availablePlaces <= 0) {
    status = "Complet";
  } else if (departureDate && departureDate < new Date()) {
    status = "Passe";
  }

  return {
    id: trajet.id,
    route: `${trajet.depart} - ${trajet.destination}`,
    date: formatRelativeDate(trajet.departure_at),
    time: formatClock(trajet.departure_at),
    price: toNumber(trajet.prix_par_place, 0),
    seats: `${availablePlaces}/${totalPlaces}`,
    status,
    passengers:
      confirmedPassengers > 0
        ? `${confirmedPassengers} passagers confirmes`
        : `Encore ${availablePlaces} places`,
  };
}

export function mapReservationRecord(reservation, trajet, driverProfile = {}) {
  return {
    id: reservation.id,
    route: trajet
      ? `${trajet.depart} - ${trajet.destination}`
      : "Trajet CampusRide",
    date: formatRelativeDate(trajet?.departure_at),
    time: formatClock(trajet?.departure_at),
    driver: driverProfile.full_name || "Conducteur CampusRide",
    pickup: trajet?.pickup_note || "Point de rendez-vous a confirmer",
    status: formatReservationStatus(reservation.statut),
    price: toNumber(trajet?.prix_par_place, 0),
  };
}
