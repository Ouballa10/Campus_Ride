import React, { useState } from "react";
import AppHeader from "../components/AppHeader";
import { Icon } from "../components/Icons";
import {
  getStatusIcon,
  getStatusPillClass,
  isReservationHistory,
} from "../utils/statusUi";

function PassengerAvatar({ passenger }) {
  return (
    <div className="avatar-badge">
      {passenger.passengerAvatar ? (
        <img alt={passenger.passenger} src={passenger.passengerAvatar} />
      ) : (
        passenger.passengerInitials || "?"
      )}
    </div>
  );
}

function TripCard({
  busyAction,
  onCloseTrip,
  onConfirmReservation,
  onDeleteTrip,
  onRejectReservation,
  runAction,
  trip,
}) {
  const [expanded, setExpanded] = useState(true);
  const reservations = trip.passengerReservations || [];
  const pendingReservations = reservations.filter((r) => r.status === "En attente");
  const confirmedReservations = reservations.filter((r) => r.status === "Confirmee");
  const historyReservations = reservations.filter((r) => isReservationHistory(r.status));
  const isClosed = ["Ferme", "Passe", "Terminee"].includes(trip.status);

  return (
    <article className="trip-detail-card">
      {/* Trip header */}
      <div className="trip-detail-card__header" onClick={() => setExpanded(!expanded)}>
        <div className="trip-detail-card__route">
          <div className="trip-detail-card__places">
            <Icon name="location" size={16} />
            <strong>{trip.depart || trip.route}</strong>
          </div>
          <Icon name="arrow-right" size={14} />
          <div className="trip-detail-card__places">
            <Icon name="route" size={16} />
            <strong>{trip.destination || ""}</strong>
          </div>
        </div>
        <span className={getStatusPillClass(trip.status)}>
          <Icon name={getStatusIcon(trip.status)} size={12} />
          {trip.status}
        </span>
      </div>

      {/* Trip info */}
      <div className="trip-detail-card__info">
        <span><Icon name="calendar" size={14} /> {trip.date}</span>
        <span><Icon name="clock" size={14} /> {trip.time}</span>
        <span><Icon name="seat" size={14} /> {trip.seats}</span>
        <span><Icon name="ticket" size={14} /> {trip.earningsEstimate || 0} DH</span>
      </div>

      {expanded ? (
        <>
          {/* Pending requests */}
          {pendingReservations.length > 0 ? (
            <div className="trip-detail-section trip-detail-section--pending">
              <div className="trip-detail-section__title">
                <Icon name="clock" size={15} />
                <span>Demandes en attente</span>
                <b>{pendingReservations.length}</b>
              </div>
              {pendingReservations.map((reservation) => (
                <div className="passenger-card" key={reservation.id}>
                  <div className="passenger-card__top">
                    <PassengerAvatar passenger={reservation} />
                    <div className="passenger-card__info">
                      <strong>{reservation.passenger}</strong>
                      <span>{reservation.phone || reservation.campus || ""}</span>
                    </div>
                  </div>
                  {reservation.message ? (
                    <p className="passenger-card__message">{reservation.message}</p>
                  ) : null}
                  <div className="passenger-card__actions">
                    <button
                      className="btn-accept"
                      disabled={busyAction === `accept-${reservation.id}`}
                      type="button"
                      onClick={() => runAction(
                        `accept-${reservation.id}`,
                        () => onConfirmReservation(reservation.id),
                        "Demande confirmee.",
                      )}
                    >
                      <Icon name="check-badge" size={15} />
                      {busyAction === `accept-${reservation.id}` ? "..." : "Accepter"}
                    </button>
                    <button
                      className="btn-reject"
                      disabled={busyAction === `reject-${reservation.id}`}
                      type="button"
                      onClick={() => runAction(
                        `reject-${reservation.id}`,
                        () => onRejectReservation(reservation.id),
                        "Demande refusee.",
                      )}
                    >
                      <Icon name="x" size={15} />
                      {busyAction === `reject-${reservation.id}` ? "..." : "Refuser"}
                    </button>
                    {reservation.phone ? (
                      <a className="btn-contact" href={`tel:${reservation.phone}`}>
                        <Icon name="phone" size={14} />
                      </a>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          ) : null}

          {/* Confirmed passengers */}
          {confirmedReservations.length > 0 ? (
            <div className="trip-detail-section trip-detail-section--confirmed">
              <div className="trip-detail-section__title">
                <Icon name="check-badge" size={15} />
                <span>Passagers confirmes</span>
                <b>{confirmedReservations.length}</b>
              </div>
              {confirmedReservations.map((reservation) => (
                <div className="passenger-card passenger-card--confirmed" key={reservation.id}>
                  <div className="passenger-card__top">
                    <PassengerAvatar passenger={reservation} />
                    <div className="passenger-card__info">
                      <strong>{reservation.passenger}</strong>
                      <span>{reservation.phone || reservation.campus || ""}</span>
                    </div>
                    {reservation.phone ? (
                      <a className="btn-contact" href={`tel:${reservation.phone}`}>
                        <Icon name="phone" size={14} />
                      </a>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          ) : null}

          {/* History */}
          {historyReservations.length > 0 ? (
            <div className="trip-detail-section trip-detail-section--history">
              <div className="trip-detail-section__title">
                <Icon name="shield" size={15} />
                <span>Historique</span>
                <b>{historyReservations.length}</b>
              </div>
              {historyReservations.map((reservation) => (
                <div className="passenger-card passenger-card--history" key={reservation.id}>
                  <div className="passenger-card__top">
                    <PassengerAvatar passenger={reservation} />
                    <div className="passenger-card__info">
                      <strong>{reservation.passenger}</strong>
                      <span className={getStatusPillClass(reservation.status)}>
                        {reservation.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : null}

          {/* No reservations */}
          {!reservations.length ? (
            <div className="trip-detail-empty">
              <Icon name="user" size={20} />
              <span>Aucune demande pour ce trajet</span>
            </div>
          ) : null}

          {/* Trip actions */}
          <div className="trip-detail-card__footer">
            {!isClosed ? (
              <button
                className="btn-secondary"
                disabled={busyAction === `close-${trip.id}`}
                type="button"
                onClick={() => runAction(
                  `close-${trip.id}`,
                  () => onCloseTrip(trip.id),
                  "Reservations fermees.",
                )}
              >
                <Icon name="shield" size={14} />
                Fermer
              </button>
            ) : null}
            <button
              className="btn-danger-outline"
              disabled={busyAction === `delete-${trip.id}`}
              type="button"
              onClick={() => runAction(
                `delete-${trip.id}`,
                () => onDeleteTrip(trip.id),
                "Trajet supprime.",
              )}
            >
              <Icon name="x" size={14} />
              Supprimer
            </button>
          </div>
        </>
      ) : null}
    </article>
  );
}

export default function MyTrajets({
  navigate,
  onCloseTrip,
  onConfirmReservation,
  onDeleteTrip,
  onRejectReservation,
  publishedTrips,
  user,
}) {
  const [busyAction, setBusyAction] = useState("");
  const [feedback, setFeedback] = useState({ message: "", tone: "" });

  async function runAction(actionKey, action, successMessage) {
    try {
      setBusyAction(actionKey);
      setFeedback({ message: "", tone: "" });
      await action();
      setFeedback({ message: successMessage, tone: "success" });
    } catch (error) {
      setFeedback({
        message: error.message || "Action impossible pour le moment.",
        tone: "error",
      });
    } finally {
      setBusyAction("");
    }
  }

  const totalPending = publishedTrips.reduce(
    (sum, trip) => sum + (trip.passengerReservations || []).filter((r) => r.status === "En attente").length,
    0,
  );

  return (
    <div className="screen screen--my-trips">
      <AppHeader
        title="Mes trajets"
        subtitle={`${user.name} - conducteur`}
        leftIcon="arrow-left"
        onLeftClick={() => navigate("home")}
        rightLabel="Publier"
        rightIcon="plus"
        onRightClick={() => navigate("publish")}
      />

      {/* Quick summary */}
      <div className="trips-summary">
        <div className="trips-summary__item">
          <strong>{publishedTrips.length}</strong>
          <span>Trajets</span>
        </div>
        <div className="trips-summary__item trips-summary__item--accent">
          <strong>{totalPending}</strong>
          <span>En attente</span>
        </div>
      </div>

      {feedback.message ? (
        <p className={`feedback-message feedback-message--${feedback.tone}`}>
          {feedback.message}
        </p>
      ) : null}

      {!publishedTrips.length ? (
        <div className="empty-state">
          <Icon name="route" size={32} />
          <strong>Aucun trajet publie</strong>
          <p>Publie ton premier trajet pour recevoir des demandes.</p>
          <button className="btn-primary" type="button" onClick={() => navigate("publish")}>
            <Icon name="plus" size={16} />
            Publier un trajet
          </button>
        </div>
      ) : (
        <div className="trips-list">
          {publishedTrips.map((trip) => (
            <TripCard
              busyAction={busyAction}
              key={trip.id}
              onCloseTrip={onCloseTrip}
              onConfirmReservation={onConfirmReservation}
              onDeleteTrip={onDeleteTrip}
              onRejectReservation={onRejectReservation}
              runAction={runAction}
              trip={trip}
            />
          ))}
        </div>
      )}
    </div>
  );
}
