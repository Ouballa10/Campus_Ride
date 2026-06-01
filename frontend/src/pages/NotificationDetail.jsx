import React from "react";
import AppHeader from "../components/AppHeader";
import { Icon } from "../components/Icons";
import { getStatusIcon, getStatusPillClass } from "../utils/statusUi";

function getDetailTone(status = "") {
  if (status === "Confirmee" || status === "Actif") return "success";
  if (status === "En attente") return "pending";
  if (["Annulee", "Refusee"].includes(status)) return "danger";
  return "neutral";
}

export default function NotificationDetail({ notification, navigate, mode }) {
  if (!notification) {
    return (
      <div className="screen screen--records">
        <AppHeader
          title="Détail"
          subtitle="Notification introuvable"
          leftIcon="arrow-left"
          onLeftClick={() => navigate("notifications")}
        />
        <div className="empty-state-card">
          <span className="empty-state-card__icon">
            <Icon name="bell" size={22} />
          </span>
          <strong>Notification introuvable</strong>
          <p>Cette notification n'existe plus ou a ete supprimee.</p>
        </div>
      </div>
    );
  }

  const tone = getDetailTone(notification.status);

  return (
    <div className="screen screen--records">
      <AppHeader
        title="Détail notification"
        subtitle={notification.title}
        leftIcon="arrow-left"
        onLeftClick={() => navigate("notifications")}
      />

      <section className="notification-detail">
        <div className={`notification-detail__card notification-detail__card--${tone}`}>
          <div className="notification-detail__header">
            <span className="notification-detail__icon">
              <Icon name={getStatusIcon(notification.status)} size={28} />
            </span>
            <div className="notification-detail__title-group">
              <h3>{notification.title}</h3>
              <span className={getStatusPillClass(notification.status)}>
                <Icon name={getStatusIcon(notification.status)} size={13} />
                {notification.status}
              </span>
            </div>
          </div>

          <div className="notification-detail__body">
            <div className="notification-detail__row">
              <Icon name="clock" size={16} />
              <span>{notification.time}</span>
            </div>

            <div className="notification-detail__row">
              <Icon name="route" size={16} />
              <span>{notification.message}</span>
            </div>

            {notification.note ? (
              <div className="notification-detail__row">
                <Icon name="shield" size={16} />
                <span>{notification.note}</span>
              </div>
            ) : null}
          </div>
        </div>

        <div className="notification-detail__actions">
          <button
            className="btn btn--outline"
            type="button"
            onClick={() => navigate("notifications")}
          >
            <Icon name="arrow-left" size={16} />
            Retour aux notifications
          </button>

          {mode === "passenger" && notification.status === "Confirmee" && (
            <button
              className="btn btn--primary"
              type="button"
              onClick={() => navigate("my-reservations")}
            >
              <Icon name="bookmark" size={16} />
              Voir mes réservations
            </button>
          )}

          {mode === "driver" && notification.status === "En attente" && (
            <button
              className="btn btn--primary"
              type="button"
              onClick={() => navigate("my-trips")}
            >
              <Icon name="route" size={16} />
              Gerer mes trajets
            </button>
          )}
        </div>
      </section>
    </div>
  );
}
