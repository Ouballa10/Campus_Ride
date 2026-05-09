import React, { useState } from "react";
import AppHeader from "../components/AppHeader";
import { Icon } from "../components/Icons";
import { getStatusPillClass, isReservationHistory } from "../utils/statusUi";

function ReservationGroup({ children, count, label, title, tone }) {
  return (
    <section className={`reservation-group reservation-group--${tone}`}>
      <div className="reservation-group__header">
        <div>
          <span>{label}</span>
          <strong>{title}</strong>
        </div>
        <b>{count}</b>
      </div>
      <div className="passenger-list">{children}</div>
    </section>
  );
}

function PassengerRow({ action, reservation }) {
  return (
    <div className="passenger-row" key={reservation.id}>
      <div className="avatar-badge">{reservation.passengerInitials}</div>
      <div className="passenger-row__copy">
        <strong>{reservation.passenger}</strong>
        <span>{reservation.phone || "Telephone non renseigne"}</span>
        {reservation.message ? <p>{reservation.message}</p> : null}
      </div>
      <div className="passenger-row__actions">
        <span className={getStatusPillClass(reservation.status)}>
          {reservation.status}
        </span>
        {action}
      </div>
    </div>
  );
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
  const confirmedPassengers = passengerReservations.filter(
    (reservation) => reservation.status === "Confirmee",
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
            Pilote tes departs, confirme les demandes passagers et garde une
            lecture nette des places restantes.
          </p>
        </div>

        <div className="summary-strip summary-strip--soft summary-strip--driver">
          <div>
            <strong>{publishedTrips.length}</strong>
            <span>annonces</span>
          </div>
          <div>
            <strong>{activeTrips}</strong>
            <span>actifs</span>
          </div>
          <div>
            <strong>{confirmedPassengers}</strong>
            <span>confirmes</span>
          </div>
          <div>
            <strong>{pendingRequests}</strong>
            <span>demandes</span>
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
          const confirmedReservations = reservations.filter(
            (reservation) => reservation.status === "Confirmee",
          );
          const pendingReservations = reservations.filter(
            (reservation) => reservation.status === "En attente",
          );
          const historyReservations = reservations.filter((reservation) =>
            isReservationHistory(reservation.status),
          );

          return (
            <article className="list-card list-card--trip" key={trip.id}>
              <div className="list-card__row">
                <div>
                  <h4>{trip.route}</h4>
                  <p>{trip.date} - {trip.time}</p>
                </div>
                <span className={getStatusPillClass(trip.status)}>
                  {trip.status}
                </span>
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

              <p className="card-note">
                {confirmedReservations.length} passager(s) confirmes
              </p>

              {reservations.length ? (
                <div className="reservation-board">
                  <ReservationGroup
                    count={confirmedReservations.length}
                    label="Confirmes"
                    title="Passagers confirmes"
                    tone="confirmed"
                  >
                    {confirmedReservations.length ? (
                      confirmedReservations.map((reservation) => (
                        <PassengerRow
                          key={reservation.id}
                          reservation={reservation}
                        />
                      ))
                    ) : (
                      <p className="reservation-empty">
                        Aucun passager confirme pour ce depart.
                      </p>
                    )}
                  </ReservationGroup>

                  <ReservationGroup
                    count={pendingReservations.length}
                    label="En attente"
                    title="Demandes a confirmer"
                    tone="pending"
                  >
                    {pendingReservations.length ? (
                      pendingReservations.map((reservation) => (
                        <PassengerRow
                          action={
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
                          }
                          key={reservation.id}
                          reservation={reservation}
                        />
                      ))
                    ) : (
                      <p className="reservation-empty">
                        Aucune demande en attente.
                      </p>
                    )}
                  </ReservationGroup>

                  {historyReservations.length ? (
                    <ReservationGroup
                      count={historyReservations.length}
                      label="Historique"
                      title="Reservations archivees"
                      tone="history"
                    >
                      {historyReservations.map((reservation) => (
                        <PassengerRow
                          key={reservation.id}
                          reservation={reservation}
                        />
                      ))}
                    </ReservationGroup>
                  ) : null}
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
