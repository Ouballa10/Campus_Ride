import React, { useState } from "react";
import AppHeader from "../components/AppHeader";
import { Icon } from "../components/Icons";

function getStatusClass(status = "") {
  return `status-pill status-pill--${status.toLowerCase().replace(/\s+/g, "-")}`;
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
  ).length;
  const pendingReservations = reservations.filter(
    (reservation) => reservation.status === "En attente",
  ).length;
  const activeReservations = reservations.filter(
    (reservation) => !["Annulee", "Terminee"].includes(reservation.status),
  );
  const historyReservations = reservations.filter(
    (reservation) => ["Annulee", "Terminee"].includes(reservation.status),
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

      <section className="ride-board">
        <div className="section-heading section-heading--compact">
          <div>
            <h3>Trajets actifs</h3>
            <p>Les demandes et reservations qui comptent maintenant.</p>
          </div>
          <span className="status-count">{activeReservations.length}</span>
        </div>

        <div className="stack-list stack-list--records">
          {activeReservations.map((reservation) => {
            const isCancellable = reservation.status !== "Annulee";

            return (
              <article className="list-card list-card--reservation ride-card" key={reservation.id}>
              <div className="list-card__row">
                <div>
                  <h4>{reservation.route}</h4>
                  <p>{reservation.date} - {reservation.time}</p>
                </div>
                <span className={getStatusClass(reservation.status)}>{reservation.status}</span>
              </div>

              <div className="ride-timeline">
                <div className="ride-timeline__stop">
                  <span className="ride-timeline__pin ride-timeline__pin--start" />
                  <div>
                    <strong>{reservation.route.split(" - ")[0] || "Depart"}</strong>
                    <span>{reservation.pickup}</span>
                  </div>
                </div>
                <div className="ride-timeline__stop">
                  <span className="ride-timeline__pin ride-timeline__pin--end" />
                  <div>
                    <strong>{reservation.route.split(" - ")[1] || "Destination"}</strong>
                    <span>{reservation.driver}</span>
                  </div>
                </div>
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
      </section>

      <section className="ride-board ride-board--history">
        <div className="section-heading section-heading--compact">
          <div>
            <h3>Historique</h3>
            <p>Les trajets termines ou annules restent propres ici.</p>
          </div>
          <span className="status-count">{historyReservations.length}</span>
        </div>

        {!historyReservations.length ? (
          <div className="message-box message-box--soft">
            <strong>Aucun historique encore</strong>
            <p>Les anciens trajets apparaitront ici apres annulation ou fin de course.</p>
          </div>
        ) : null}

        <div className="stack-list stack-list--records">
          {historyReservations.map((reservation) => (
            <article className="list-card list-card--reservation ride-card ride-card--muted" key={reservation.id}>
              <div className="list-card__row">
                <div>
                  <h4>{reservation.route}</h4>
                  <p>{reservation.date} - {reservation.time}</p>
                </div>
                <span className={getStatusClass(reservation.status)}>{reservation.status}</span>
              </div>
              <div className="trip-card__meta">
                <span className="meta-chip">
                  <Icon name="user" size={14} />
                  {reservation.driver}
                </span>
                <span className="meta-chip">
                  <Icon name="ticket" size={14} />
                  {reservation.price} DH
                </span>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
