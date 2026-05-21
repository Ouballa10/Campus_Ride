import React, { useMemo } from "react";
import AppHeader from "../components/AppHeader";
import { Icon } from "../components/Icons";

function getNotificationTone(status = "") {
  if (status === "Confirmee" || status === "Actif") return "success";
  if (status === "En attente") return "pending";
  if (["Annulee", "Refusee"].includes(status)) return "danger";
  return "neutral";
}

export default function Notifications({
  mode = "passenger",
  navigate,
  onSelectNotification,
  publishedTrips = [],
  reservations = [],
}) {
  const items = useMemo(() => {
    const passengerItems = reservations.map((reservation) => ({
      id: `reservation-${reservation.id}`,
      title: reservation.status === "Confirmee"
        ? "✅ Reservation acceptee"
        : reservation.status === "En attente"
          ? "🕐 Demande envoyee"
          : "📋 Reservation mise a jour",
      route: `${reservation.depart} → ${reservation.destination}`,
      driver: reservation.driver,
      time: `${reservation.date} · ${reservation.time}`,
      status: reservation.status,
      tone: getNotificationTone(reservation.status),
    }));

    const driverItems = publishedTrips.flatMap((trip) =>
      (trip.passengerReservations || []).map((reservation) => ({
        id: `driver-${trip.id}-${reservation.id}`,
        title: reservation.status === "En attente"
          ? "🔔 Nouvelle demande"
          : reservation.status === "Confirmee"
            ? "✅ Passager confirme"
            : "📋 Demande traitee",
        route: trip.route || `${trip.depart} → ${trip.destination}`,
        passenger: reservation.passenger,
        time: trip.date ? `${trip.date} · ${trip.time}` : "",
        status: reservation.status,
        tone: getNotificationTone(reservation.status),
      })),
    );

    return (mode === "driver" ? driverItems : passengerItems).slice(0, 40);
  }, [mode, publishedTrips, reservations]);

  const pendingCount = items.filter((item) => item.status === "En attente").length;

  return (
    <div className="screen screen--simple">
      <AppHeader
        title="Notifications"
        subtitle={pendingCount > 0 ? `${pendingCount} en attente` : "Tout est a jour"}
        leftIcon="arrow-left"
        onLeftClick={() => navigate("home")}
      />

      {!items.length ? (
        <div className="empty-box">
          <Icon name="bell" size={28} />
          <p>Aucune notification</p>
        </div>
      ) : (
        <div className="notif-list">
          {items.map((item) => (
            <button
              className={`notif-item notif-item--${item.tone}`}
              key={item.id}
              type="button"
              onClick={() => onSelectNotification(item)}
            >
              <div className="notif-item__content">
                <strong>{item.title}</strong>
                <span className="notif-item__route">{item.route}</span>
                <span className="notif-item__meta">
                  {item.driver || item.passenger} · {item.time}
                </span>
              </div>
              <Icon name="chevron-right" size={16} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
