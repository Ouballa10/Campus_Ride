import React, { useState } from "react";
import AppHeader from "../components/AppHeader";
import { Icon } from "../components/Icons";

export default function MyReservations({
  navigate,
  onCancelReservation,
  reservations,
}) {
  const [busyId, setBusyId] = useState("");
  const [feedback, setFeedback] = useState({ message: "", tone: "" });
  const confirmedReservations = reservations.filter(
    (reservation) => reservation.status === "Confirmee",
  ).length;
  const pendingReservations = reservations.filter(
    (reservation) => reservation.status === "En attente",
  ).length;

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
            <strong>{confirmedReservations}</strong>
            <span>confirmees</span>
          </div>
          <div>
            <strong>{pendingReservations}</strong>
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

      <div className="stack-list stack-list--records">
        {reservations.map((reservation) => {
          const isCancellable = reservation.status !== "Annulee";

          return (
            <article className="list-card list-card--reservation" key={reservation.id}>
              <div className="list-card__row">
                <div>
                  <h4>{reservation.route}</h4>
                  <p>{reservation.date} - {reservation.time}</p>
                </div>
                <span className="pill">{reservation.status}</span>
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
                    onClick={() => handleCancelReservation(reservation.id)}
                  >
                    {reservation.status === "Annulee"
                      ? "Annulee"
                      : busyId === reservation.id
                        ? "Annulation..."
                        : "Annuler"}
                  </button>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
