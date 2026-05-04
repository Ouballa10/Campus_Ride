import React, { useState } from "react";
import AppHeader from "../components/AppHeader";
import { Icon } from "../components/Icons";

function getStatusClass(status = "") {
  return `status-pill status-pill--${status.toLowerCase().replace(/\s+/g, "-")}`;
}

export default function MyTrajets({
  navigate,
  onConfirmReservation,
  publishedTrips,
  user,
}) {
  const [busyReservationId, setBusyReservationId] = useState("");
  const [feedback, setFeedback] = useState({ message: "", tone: "" });
  const activeTrips = publishedTrips.filter((trip) => trip.status === "Actif").length;
  const passengerReservations = publishedTrips.flatMap(
    (trip) => trip.passengerReservations || [],
  );
  const activePassengers = passengerReservations.filter(
    (reservation) => reservation.status !== "Annulee",
  ).length;
  const pendingRequests = passengerReservations.filter(
    (reservation) => reservation.status === "En attente",
  ).length;

  async function handleConfirmReservation(reservationId) {
    try {
      setBusyReservationId(reservationId);
      setFeedback({ message: "", tone: "" });
      await onConfirmReservation(reservationId);
      setFeedback({
        message: "Demande confirmee et visible dans l'espace passager.",
        tone: "success",
      });
    } catch (error) {
      setFeedback({
        message: error.message || "Confirmation impossible pour le moment.",
        tone: "error",
      });
    } finally {
      setBusyReservationId("");
    }
  }

  return (
    <div className="screen screen--records">
      <AppHeader
        title="Mes trajets"
        subtitle={`${user.name} - espace conducteur`}
        leftIcon="arrow-left"
        onLeftClick={() => navigate("profile")}
        rightLabel="Publier"
        rightIcon="plus"
        onRightClick={() => navigate("publish")}
      />

      <section className="records-hero">
        <div>
          <span className="eyebrow">Conducteur</span>
          <h3>Suivi de tes annonces campus</h3>
          <p>
            Retrouve tes departs actifs, les demandes passagers et l'etat des
            places restantes.
          </p>
        </div>

        <div className="summary-strip summary-strip--soft">
          <div>
            <strong>{publishedTrips.length}</strong>
            <span>annonces</span>
          </div>
          <div>
            <strong>{activeTrips}</strong>
            <span>actifs</span>
          </div>
          <div>
            <strong>{activePassengers}</strong>
            <span>passagers</span>
          </div>
          <div>
            <strong>{pendingRequests}</strong>
            <span>a confirmer</span>
          </div>
        </div>
      </section>

      {feedback.message ? (
        <p className={`profile-editor-status profile-editor-status--${feedback.tone}`}>
          {feedback.message}
        </p>
      ) : null}

      {!publishedTrips.length ? (
        <div className="message-box">
          <strong>Aucun trajet publie pour le moment</strong>
          <p>Ton premier trajet apparaitra ici des que tu publies une annonce.</p>
        </div>
      ) : null}

      <div className="stack-list stack-list--records">
        {publishedTrips.map((trip) => {
          const reservations = trip.passengerReservations || [];
          const pendingReservations = reservations.filter(
            (reservation) => reservation.status === "En attente",
          );

          return (
            <article className="list-card list-card--trip ride-card ride-card--driver" key={trip.id}>
              <div className="list-card__row">
                <div>
                  <h4>{trip.route}</h4>
                  <p>{trip.date} - {trip.time}</p>
                </div>
                <span className={getStatusClass(trip.status)}>{trip.status}</span>
              </div>

              <div className="driver-trip-rail">
                <div>
                  <span>Places</span>
                  <strong>{trip.seats}</strong>
                </div>
                <div>
                  <span>Prix</span>
                  <strong>{trip.price} DH</strong>
                </div>
                <div>
                  <span>Demandes</span>
                  <strong>{reservations.length}</strong>
                </div>
              </div>

              <div className="trip-card__meta">
                <span className="meta-chip">
                  <Icon name="seat" size={14} />
                  {trip.seats} places
                </span>
                <span className="meta-chip">
                  <Icon name="ticket" size={14} />
                  {trip.price} DH
                </span>
                <span className="meta-chip">
                  <Icon name="user" size={14} />
                  {reservations.length} reservation(s)
                </span>
              </div>

              <p className="card-note">{trip.passengers}</p>

              {pendingReservations.length ? (
                <div className="driver-request-banner">
                  <div>
                    <strong>{pendingReservations.length} demande(s) a confirmer</strong>
                    <p>Traite les demandes avant le depart pour garder le trajet propre.</p>
                  </div>
                  <Icon name="send" size={20} />
                </div>
              ) : null}

              {reservations.length ? (
                <div className="passenger-list">
                  {reservations.map((reservation) => (
                    <div className="passenger-row passenger-row--request" key={reservation.id}>
                      <div className="avatar-badge">{reservation.passengerInitials}</div>
                      <div className="passenger-row__copy">
                        <strong>{reservation.passenger}</strong>
                        <span>{reservation.phone || "Telephone non renseigne"}</span>
                        {reservation.message ? <p>{reservation.message}</p> : null}
                      </div>
                      <div className="passenger-row__actions">
                        <span className={getStatusClass(reservation.status)}>{reservation.status}</span>
                        {reservation.status === "En attente" ? (
                          <button
                            className="mini-button mini-button--ghost"
                            disabled={busyReservationId === reservation.id}
                            type="button"
                            onClick={() => handleConfirmReservation(reservation.id)}
                          >
                            {busyReservationId === reservation.id
                              ? "Confirmation..."
                              : "Confirmer"}
                          </button>
                        ) : null}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="message-box message-box--soft">
                  <strong>Aucun passager pour ce trajet</strong>
                  <p>Des qu'une demande arrive, elle apparait ici.</p>
                </div>
              )}
            </article>
          );
        })}
      </div>
    </div>
  );
}
