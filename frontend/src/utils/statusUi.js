const STATUS_CLASS_BY_LABEL = {
  Actif: "status-pill--live",
  Nouveau: "status-pill--new",
  Complet: "status-pill--full",
  Ferme: "status-pill--closed",
  Passe: "status-pill--history",
  Confirmee: "status-pill--confirmed",
  "En attente": "status-pill--pending",
  Annulee: "status-pill--cancelled",
  Refusee: "status-pill--refused",
  Terminee: "status-pill--history",
};

const STATUS_ICON_BY_LABEL = {
  Actif: "check-badge",
  Nouveau: "plus",
  Complet: "seat",
  Ferme: "shield",
  Passe: "clock",
  Confirmee: "check-badge",
  "En attente": "clock",
  Annulee: "x",
  Refusee: "x",
  Terminee: "check-badge",
};

export function getStatusPillClass(status) {
  return ["status-pill", STATUS_CLASS_BY_LABEL[status]].filter(Boolean).join(" ");
}

export function getStatusIcon(status) {
  return STATUS_ICON_BY_LABEL[status] || "shield";
}

export function isReservationHistory(status) {
  return status !== "Confirmee" && status !== "En attente";
}
