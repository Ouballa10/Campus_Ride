import React, { useState } from "react";
import AppHeader from "../components/AppHeader";
import { Icon } from "../components/Icons";
import { getStatusPillClass, isReservationHistory } from "../utils/statusUi";

function ReservationStatusSection({ children, count, title, tone }) {
  return (
    <section className={`reservation-status-section reservation-status-section--${tone}`}>
      <div className="reservation-status-section__header">
        <strong>{title}</strong>
        <span>{count}</span>
      </div>
      <div className="stack-list stack-list--records">{children}</div>
    </section>
  );
}

function ReservationCard({ busyId, navigate, onCancelReservation, reservation }) {
  const isCancellable = !["Annulee", "Terminee"].includes(reservation.status);
  const cancelLabel =
    reservation.status === "Annulee" || reservation.status === "Terminee"
      ? reservation.status
      : busyId === reservation.id
        ? "Annulation..."
        : "Annuler";

  return (
    <article className="list-card list-card--reservation" key={reservation.id}>
      <div className="list-card__row">
        <div>
          <h4>{reservation.route}</h4>
          <p>{reservation.date} - {reservation.time}</p>
        </div>
        <span className={getStatusPillClass(reservation.status)}>
          {reservation.status}
        </span>
      </div>

      <div className="card-note">
        <strong>{reservation.driver}</strong>
        <span>{reservation.pickup}</span>
      </div>

      {reservation.message ? (
        <div className="message-box message-box--soft">
          <strong>Ta note</strong>
          <p>{reservation.message}</p>
        </div>
      ) : null}

      <div className="trip-card__bottom">
        <span className="meta-chip">
          <Icon name="ticket" size={14} />
          {reservation.price} DH
        </span>

        <div className="button-row">
          <button
            className="mini-button mini-button--ghost"
            type="button"
            onClick={() => navigate("search")}
          >
            Rechercher
          </button>

          <button
            className="mini-button mini-button--ghost"
            disabled={!isCancellable || busyId === reservation.id}
            type="button"
            onClick={() => onCancelReservation(reservation.id)}
          >
            {cancelLabel}
          </button>
        </div>
      </div>
    </article>
  );
}

export default function MyReservations({
  navigate,
  onCancelReservation,
  reservations,
}) {
  const [busyId, setBusyId] = useState("");
  const [feedback, setFeedback] = useState({ message: "", tone: "" });
  const confirmedReservations = reservations.filter(
    (reservation) => reservation.status === "Confirmee",
  );
  const pendingReservations = reservations.filter(
    (reservation) => reservation.status === "En attente",
  );
  const historyReservations = reservations.filter((reservation) =>
    isReservationHistory(reservation.status),
  );

  async function handleCancelReservation(reservationId) {
    try {
      setBusyId(reservationId);
      setFeedback({ message: "", tone: "" });
      await onCancelReservation(reservationId);
      setFeedback({
        message: "Reservation annulee avec succes.",
        tone: "success",
      });
    } catch (error) {
      setFeedback({
        message: error.message || "Annulation impossible pour le moment.",
        tone: "error",
      });
    } finally {
      setBusyId("");
    }
  }

  return (
    <div className="screen screen--records">
      <AppHeader
        title="Mes reservations"
        subtitle="Suivi des trajets confirmes et en attente"
        leftIcon="arrow-left"
        onLeftClick={() => navigate("profile")}
      />

      <section className="records-hero">
        <div>
          <span className="eyebrow">Passager</span>
          <h3>Organise tes trajets reserves</h3>
          <p>
            Suis les conducteurs selectionnes, les points de rendez-vous et le
            statut de chaque reservation.
          </p>
        </div>

        <div className="summary-strip summary-strip--soft">
          <div>
            <strong>{reservations.length}</strong>
            <span>au total</span>
          </div>
          <div>
            <strong>{confirmedReservations.length}</strong>
            <span>confirmees</span>
          </div>
          <div>
            <strong>{pendingReservations.length}</strong>
            <span>en attente</span>
          </div>
        </div>
      </section>

      {feedback.message ? (
        <p className={`profile-editor-status profile-editor-status--${feedback.tone}`}>
          {feedback.message}
        </p>
      ) : null}

      {!reservations.length ? (
        <div className="message-box">
          <strong>Aucune reservation pour le moment</strong>
          <p>Quand tu reserves un trajet, il apparaitra ici avec son statut.</p>
        </div>
      ) : null}

      {reservations.length ? (
        <div className="reservation-page-board">
          {pendingReservations.length ? (
            <ReservationStatusSection
              count={pendingReservations.length}
              title="Demandes en attente"
              tone="pending"
            >
              {pendingReservations.map((reservation) => (
                <ReservationCard
                  busyId={busyId}
                  key={reservation.id}
                  navigate={navigate}
                  onCancelReservation={handleCancelReservation}
                  reservation={reservation}
                />
              ))}
            </ReservationStatusSection>
          ) : null}

          {confirmedReservations.length ? (
            <ReservationStatusSection
              count={confirmedReservations.length}
              title="Trajets confirmes"
              tone="confirmed"
            >
              {confirmedReservations.map((reservation) => (
                <ReservationCard
                  busyId={busyId}
                  key={reservation.id}
                  navigate={navigate}
                  onCancelReservation={handleCancelReservation}
                  reservation={reservation}
                />
              ))}
            </ReservationStatusSection>
          ) : null}

          {historyReservations.length ? (
            <ReservationStatusSection
              count={historyReservations.length}
              title="Historique"
              tone="history"
            >
              {historyReservations.map((reservation) => (
                <ReservationCard
                  busyId={busyId}
                  key={reservation.id}
                  navigate={navigate}
                  onCancelReservation={handleCancelReservation}
                  reservation={reservation}
                />
              ))}
            </ReservationStatusSection>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
