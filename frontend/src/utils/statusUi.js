const STATUS_CLASS_BY_LABEL = {
  Actif: "status-pill--live",
  Nouveau: "status-pill--new",
  Complet: "status-pill--full",
  Passe: "status-pill--history",
  Confirmee: "status-pill--confirmed",
  "En attente": "status-pill--pending",
  Annulee: "status-pill--cancelled",
  Terminee: "status-pill--history",
};

export function getStatusPillClass(status) {
  return ["status-pill", STATUS_CLASS_BY_LABEL[status]].filter(Boolean).join(" ");
}

export function isReservationHistory(status) {
  return status !== "Confirmee" && status !== "En attente";
}
