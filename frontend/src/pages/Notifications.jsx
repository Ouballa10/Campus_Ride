import React, { useMemo } from "react";
import AppHeader from "../components/AppHeader";
import { Icon } from "../components/Icons";

function getNotificationTone(status = "") {
  if (status === "Confirmee" || status === "Actif") return "success";
  if (status === "En attente") return "pending";
  if (status === "message") return "chat";
  if (["Annulee", "Refusee"].includes(status)) return "danger";
  return "neutral";
}

export default function Notifications({
  mode = "passenger",
  navigate,
  onSelectNotification,
  publishedTrips = [],
  reservations = [],
  recentMessages = [],
}) {
  const items = useMemo(() => {
    // Message notifications
    const messageItems = recentMessages.map((msg) => ({
      id: `msg-${msg.id}`,
      type: "message",
      title: `💬 Message de ${msg.senderName || "Contact"}`,
      route: msg.tripRoute || "Conversation",
      driver: msg.senderName || "Contact",
      passenger: msg.senderName || "Contact",
      time: new Date(msg.created_at).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }),
      status: "message",
      tone: "chat",
      reservationId: msg.reservation_id,
      otherName: msg.senderName || "Contact",
      tripRoute: msg.tripRoute || "",
      backRoute: mode === "driver" ? "my-trips" : "my-reservations",
    }));

    const passengerItems = reservations.map((reservation) => ({
      id: `reservation-${reservation.id}`,
      type: "reservation",
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
      reservationId: reservation.id,
      otherName: reservation.driver,
      tripRoute: `${reservation.depart} → ${reservation.destination}`,
    }));

    const driverItems = publishedTrips.flatMap((trip) =>
      (trip.passengerReservations || []).map((reservation) => ({
        id: `driver-${trip.id}-${reservation.id}`,
        type: "driver-reservation",
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
        reservationId: reservation.id,
        otherName: reservation.passenger,
        tripRoute: trip.route || `${trip.depart} → ${trip.destination}`,
      })),
    );

    const reservationItems = mode === "driver" ? driverItems : passengerItems;

    // Messages first, then reservations
    return [...messageItems, ...reservationItems].slice(0, 50);
  }, [mode, publishedTrips, reservations, recentMessages]);

  const messageCount = recentMessages.length;
  const pendingCount = items.filter((item) => item.status === "En attente").length;

  return (
    <div className="screen screen--simple">
      <AppHeader
        title="Notifications"
        subtitle={
          messageCount > 0
            ? `${messageCount} message${messageCount > 1 ? "s" : ""} · ${pendingCount} en attente`
            : pendingCount > 0
              ? `${pendingCount} en attente`
              : "Tout est a jour"
        }
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
