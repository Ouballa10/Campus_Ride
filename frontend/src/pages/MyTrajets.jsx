import React, { useState } from "react";
import AppHeader from "../components/AppHeader";
import { Icon } from "../components/Icons";
import { isReservationHistory } from "../utils/statusUi";

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

  async function runAction(key, action, msg) {
    try {
      setBusyAction(key);
      setFeedback({ message: "", tone: "" });
      await action();
      setFeedback({ message: msg, tone: "success" });
    } catch (e) {
      setFeedback({ message: e.message || "Erreur.", tone: "error" });
    } finally {
      setBusyAction("");
    }
  }

  return (
    <div className="screen screen--simple">
      <AppHeader
        title="Mes trajets"
        subtitle="Espace conducteur"
        leftIcon="arrow-left"
        onLeftClick={() => navigate("home")}
        rightLabel="Publier"
        rightIcon="plus"
        onRightClick={() => navigate("publish")}
      />

      {feedback.message ? (
        <div className={`toast toast--${feedback.tone}`}>{feedback.message}</div>
      ) : null}

      {!publishedTrips.length ? (
        <div className="empty-box">
          <Icon name="route" size={28} />
          <p>Aucun trajet publie</p>
          <button className="cta-btn" type="button" onClick={() => navigate("publish")}>
            Publier un trajet
          </button>
        </div>
      ) : (
        <div className="card-list">
          {publishedTrips.map((trip) => {
            const reservations = trip.passengerReservations || [];
            const pending = reservations.filter((r) => r.status === "En attente");
            const confirmed = reservations.filter((r) => r.status === "Confirmee");
            const history = reservations.filter((r) => isReservationHistory(r.status));
            const isClosed = ["Ferme", "Passe", "Terminee"].includes(trip.status);

            return (
              <div className="t-card" key={trip.id}>
                {/* Route */}
                <div className="t-card__route">
                  <div className="t-card__dot t-card__dot--start" />
                  <div className="t-card__route-text">
                    <strong>{trip.depart || trip.route}</strong>
                    <small>{trip.date} · {trip.time}</small>
                  </div>
                </div>
                <div className="t-card__route">
                  <div className="t-card__dot t-card__dot--end" />
                  <div className="t-card__route-text">
                    <strong>{trip.destination || ""}</strong>
                    <small>{trip.seats} places · {trip.earningsEstimate || 0} DH</small>
                  </div>
                  <span className={`t-badge t-badge--${trip.status === "Actif" ? "green" : trip.status === "Ferme" ? "gray" : "blue"}`}>
                    {trip.status}
                  </span>
                </div>

                {/* Pending */}
                {pending.length > 0 ? (
                  <div className="t-section t-section--orange">
                    <div className="t-section__head">
                      <span>🟡 {pending.length} demande{pending.length > 1 ? "s" : ""} en attente</span>
                    </div>
                    {pending.map((r) => (
                      <div className="t-passenger" key={r.id}>
                        <div className="t-passenger__name">
                          <strong>{r.passenger}</strong>
                          {r.message ? <small>"{r.message}"</small> : null}
                        </div>
                        <div className="t-passenger__btns">
                          <button
                            className="t-btn t-btn--green"
                            disabled={busyAction === `a-${r.id}`}
                            type="button"
                            onClick={() => runAction(`a-${r.id}`, () => onConfirmReservation(r.id), "Accepte !")}
                          >
                            ✓
                          </button>
                          <button
                            className="t-btn t-btn--red"
                            disabled={busyAction === `r-${r.id}`}
                            type="button"
                            onClick={() => runAction(`r-${r.id}`, () => onRejectReservation(r.id), "Refuse.")}
                          >
                            ✕
                          </button>
                          {r.phone ? (
                            <a className="t-btn t-btn--ghost" href={`tel:${r.phone}`}>📞</a>
                          ) : null}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : null}

                {/* Confirmed */}
                {confirmed.length > 0 ? (
                  <div className="t-section t-section--green">
                    <div className="t-section__head">
                      <span>🟢 {confirmed.length} confirme{confirmed.length > 1 ? "s" : ""}</span>
                    </div>
                    {confirmed.map((r) => (
                      <div className="t-passenger t-passenger--confirmed" key={r.id}>
                        <strong>{r.passenger}</strong>
                        {r.phone ? (
                          <a className="t-btn t-btn--ghost" href={`tel:${r.phone}`}>📞</a>
                        ) : null}
                      </div>
                    ))}
                  </div>
                ) : null}

                {/* History */}
                {history.length > 0 ? (
                  <div className="t-section t-section--gray">
                    <div className="t-section__head">
                      <span>⚪ {history.length} archive{history.length > 1 ? "s" : ""}</span>
                    </div>
                    {history.map((r) => (
                      <div className="t-passenger t-passenger--muted" key={r.id}>
                        <strong>{r.passenger}</strong>
                        <small>{r.status}</small>
                      </div>
                    ))}
                  </div>
                ) : null}

                {/* No reservations */}
                {!reservations.length ? (
                  <div className="t-section t-section--empty">
                    <span>Aucune demande</span>
                  </div>
                ) : null}

                {/* Actions */}
                <div className="t-card__actions">
                  {!isClosed ? (
                    <button
                      className="t-btn t-btn--outline"
                      disabled={busyAction === `c-${trip.id}`}
                      type="button"
                      onClick={() => runAction(`c-${trip.id}`, () => onCloseTrip(trip.id), "Ferme.")}
                    >
                      Fermer
                    </button>
                  ) : null}
                  <button
                    className="t-btn t-btn--outline t-btn--outline-red"
                    disabled={busyAction === `d-${trip.id}`}
                    type="button"
                    onClick={() => runAction(`d-${trip.id}`, () => onDeleteTrip(trip.id), "Supprime.")}
                  >
                    Supprimer
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
