import React, { useMemo } from "react";
import AppHeader from "../components/AppHeader";
import { Icon } from "../components/Icons";
import { getStatusIcon, getStatusPillClass } from "../utils/statusUi";

function getNotificationTone(status = "") {
  if (status === "Confirmee" || status === "Actif") return "success";
  if (status === "En attente") return "pending";
  if (["Annulee", "Refusee"].includes(status)) return "danger";
  return "neutral";
}

function NotificationItem({ item, onSelect }) {
  return (
    <article
      className={`notification-item notification-item--${item.tone} notification-item--clickable`}
      onClick={() => onSelect(item)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect(item);
        }
      }}
    >
      <span className="notification-item__icon">
        <Icon name={item.icon} size={18} />
      </span>
      <div className="notification-item__copy">
        <div>
          <strong>{item.title}</strong>
          <span>{item.time}</span>
        </div>
        <p>{item.message}</p>
        {item.note ? <small>{item.note}</small> : null}
      </div>
      <div className="notification-item__right">
        <span className={getStatusPillClass(item.status)}>
          <Icon name={getStatusIcon(item.status)} size={13} />
          {item.status}
        </span>
        <Icon name="chevron-right" size={14} className="notification-item__chevron" />
      </div>
    </article>
  );
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
      icon: getStatusIcon(reservation.status),
      id: `reservation-${reservation.id}`,
      message: `${reservation.driver} - ${reservation.route}`,
      note: reservation.message || reservation.pickup,
      status: reservation.status,
      time: `${reservation.date} - ${reservation.time}`,
      title:
        reservation.status === "Confirmee"
          ? "Reservation acceptee"
          : reservation.status === "En attente"
            ? "Demande envoyee"
            : "Reservation mise a jour",
      tone: getNotificationTone(reservation.status),
    }));

    const driverItems = publishedTrips.flatMap((trip) =>
      (trip.passengerReservations || []).map((reservation) => ({
        icon: getStatusIcon(reservation.status),
        id: `driver-${trip.id}-${reservation.id}`,
        message: `${reservation.passenger} - ${trip.route}`,
        note: reservation.message || reservation.phone || "Nouvelle activite passager",
        status: reservation.status,
        time: trip.date ? `${trip.date} - ${trip.time}` : "A venir",
        title:
          reservation.status === "En attente"
            ? "Nouvelle demande passager"
            : reservation.status === "Confirmee"
              ? "Passager confirme"
              : "Demande traitee",
        tone: getNotificationTone(reservation.status),
      })),
    );

    return (mode === "driver" ? driverItems : passengerItems).slice(0, 40);
  }, [mode, publishedTrips, reservations]);

  const pendingCount = items.filter((item) => item.status === "En attente").length;
  const confirmedCount = items.filter((item) => item.status === "Confirmee").length;

  return (
    <div className="screen screen--records">
      <AppHeader
        title="Notifications"
        subtitle="Messages, demandes et changements"
        leftIcon="arrow-left"
        onLeftClick={() => navigate("home")}
      />

      <section className="records-hero notification-hero">
        <div>
          <span className="eyebrow">Centre d'activite</span>
          <h3>Tout ce qui bouge dans ton compte</h3>
          <p>
            Acceptations, nouvelles demandes, refus, messages passagers et notes utiles restent ici.
          </p>
        </div>
        <div className="summary-strip summary-strip--soft">
          <div>
            <strong>{items.length}</strong>
            <span>total</span>
          </div>
          <div>
            <strong>{pendingCount}</strong>
            <span>en attente</span>
          </div>
          <div>
            <strong>{confirmedCount}</strong>
            <span>confirmes</span>
          </div>
        </div>
      </section>

      {!items.length ? (
        <div className="empty-state-card">
          <span className="empty-state-card__icon">
            <Icon name="bell" size={22} />
          </span>
          <strong>Aucune notification</strong>
          <p>Les nouvelles demandes, confirmations et messages apparaitront ici.</p>
        </div>
      ) : (
        <div className="notification-list">
          {items.map((item) => (
            <NotificationItem
              item={item}
              key={item.id}
              onSelect={onSelectNotification}
            />
          ))}
        </div>
      )}
    </div>
  );
}
