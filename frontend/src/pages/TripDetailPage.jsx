import React, { useState } from "react";
import AppHeader from "../components/AppHeader";
import { Icon } from "../components/Icons";
import { isReservationHistory } from "../utils/statusUi";

export default function TripDetailPage({
  navigate,
  onConfirmReservation,
  onRejectReservation,
  onCloseTrip,
  onDeleteTrip,
  trip,
  publishedTrips,
}) {
  const [busyAction, setBusyAction] = useState("");
  const [feedback, setFeedback] = useState({ message: "", tone: "" });

  // Get fresh trip data from publishedTrips (in case it was updated)
  const freshTrip = publishedTrips?.find((t) => t.id === trip?.id) || trip;

  if (!freshTrip) {
    return (
      <div className="screen screen--simple">
        <AppHeader
          title="Trajet"
          leftIcon="arrow-left"
          onLeftClick={() => navigate("my-trips")}
        />
        <div className="empty-box">
          <Icon name="route" size={28} />
          <p>Trajet introuvable</p>
        </div>
      </div>
    );
  }

  const reservations = freshTrip.passengerReservations || [];
  const pending = reservations.filter((r) => r.status === "En attente");
  const confirmed = reservations.filter((r) => r.status === "Confirmee");
  const history = reservations.filter((r) => isReservationHistory(r.status));
  const isClosed = ["Ferme", "Passe", "Terminee"].includes(freshTrip.status);

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
        title={freshTrip.depart || "Trajet"}
        subtitle={`→ ${freshTrip.destination || ""}`}
        leftIcon="arrow-left"
        onLeftClick={() => navigate(freshTrip._backRoute || "my-trips")}
      />

      {/* Trip info card */}
      <div className="td-info">
        <div className="td-info__row">
          <span className="td-info__label">Depart</span>
          <strong>{freshTrip.depart || freshTrip.route}</strong>
        </div>
        <div className="td-info__row">
          <span className="td-info__label">Destination</span>
          <strong>{freshTrip.destination}</strong>
        </div>
        <div className="td-info__grid">
          <div><span>📅</span><strong>{freshTrip.date}</strong></div>
          <div><span>🕐</span><strong>{freshTrip.time}</strong></div>
          <div><span>💺</span><strong>{freshTrip.seats}</strong></div>
          <div><span>💰</span><strong>{freshTrip.earningsEstimate || 0} DH</strong></div>
        </div>
        <div className="td-info__status">
          <span className={`t-badge t-badge--${freshTrip.status === "Actif" ? "green" : freshTrip.status === "Ferme" ? "gray" : "blue"}`}>
            {freshTrip.status}
          </span>
        </div>
      </div>

      {feedback.message ? (
        <div className={`toast toast--${feedback.tone}`}>{feedback.message}</div>
      ) : null}

      {/* Pending requests */}
      {pending.length > 0 ? (
        <div className="td-section td-section--orange">
          <h3>🟡 Demandes en attente ({pending.length})</h3>
          {pending.map((r) => (
            <div className="td-passenger" key={r.id}>
              <div className="td-passenger__info">
                <strong>{r.passenger}</strong>
                <small>{r.phone || r.campus || ""}</small>
                {r.message ? <p>"{r.message}"</p> : null}
              </div>
              <div className="td-passenger__actions">
                <button
                  className="t-btn t-btn--green"
                  disabled={busyAction === `a-${r.id}`}
                  type="button"
                  onClick={() => runAction(`a-${r.id}`, () => onConfirmReservation(r.id), "Accepte !")}
                >
                  ✓ Accepter
                </button>
                <button
                  className="t-btn t-btn--red"
                  disabled={busyAction === `r-${r.id}`}
                  type="button"
                  onClick={() => runAction(`r-${r.id}`, () => onRejectReservation(r.id), "Refuse.")}
                >
                  ✕ Refuser
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
        <div className="td-section td-section--green">
          <h3>🟢 Passagers confirmes ({confirmed.length})</h3>
          {confirmed.map((r) => (
            <div className="td-passenger td-passenger--confirmed" key={r.id}>
              <div className="td-passenger__info">
                <strong>{r.passenger}</strong>
                <small>{r.phone || r.campus || ""}</small>
              </div>
              {r.phone ? (
                <a className="t-btn t-btn--ghost" href={`tel:${r.phone}`}>📞</a>
              ) : null}
            </div>
          ))}
        </div>
      ) : null}

      {/* History */}
      {history.length > 0 ? (
        <div className="td-section td-section--gray">
          <h3>⚪ Historique ({history.length})</h3>
          {history.map((r) => (
            <div className="td-passenger td-passenger--muted" key={r.id}>
              <div className="td-passenger__info">
                <strong>{r.passenger}</strong>
              </div>
              <small>{r.status}</small>
            </div>
          ))}
        </div>
      ) : null}

      {/* Empty */}
      {!reservations.length ? (
        <div className="empty-box" style={{ padding: "30px 20px" }}>
          <Icon name="user" size={24} />
          <p>Aucune demande pour ce trajet</p>
        </div>
      ) : null}

      {/* Actions */}
      <div className="td-actions">
        {!isClosed ? (
          <button
            className="t-btn t-btn--outline"
            disabled={busyAction === `c-${freshTrip.id}`}
            type="button"
            onClick={() => runAction(`c-${freshTrip.id}`, () => onCloseTrip(freshTrip.id), "Ferme.")}
          >
            Fermer les reservations
          </button>
        ) : null}
        <button
          className="t-btn t-btn--outline t-btn--outline-red"
          disabled={busyAction === `d-${freshTrip.id}`}
          type="button"
          onClick={() => runAction(`d-${freshTrip.id}`, () => onDeleteTrip(freshTrip.id), "Supprime.")}
        >
          Supprimer ce trajet
        </button>
      </div>
    </div>
  );
}
