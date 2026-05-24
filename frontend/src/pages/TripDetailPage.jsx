import React, { useState } from "react";
import AppHeader from "../components/AppHeader";
import { Icon } from "../components/Icons";
import { isReservationHistory } from "../utils/statusUi";

function shortAddr(addr = "") {
  const parts = addr.split(",");
  return parts[0]?.trim().slice(0, 30) || addr.slice(0, 30);
}

export default function TripDetailPage({
  navigate,
  onConfirmReservation,
  onRejectReservation,
  onCloseTrip,
  onDeleteTrip,
  onViewPassenger,
  trip,
  publishedTrips,
}) {
  const [busyAction, setBusyAction] = useState("");
  const [feedback, setFeedback] = useState({ message: "", tone: "" });

  const freshTrip = publishedTrips?.find((t) => t.id === trip?.id) || trip;

  if (!freshTrip) {
    return (
      <div className="screen screen--simple">
        <AppHeader title="Trajet" leftIcon="arrow-left" onLeftClick={() => navigate("my-trips")} />
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
  const departureDate = freshTrip.departureAt ? new Date(freshTrip.departureAt) : null;
  const dateStr = departureDate
    ? departureDate.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })
    : "";
  const timeStr = departureDate
    ? departureDate.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })
    : freshTrip.time || "";

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
        title="Detail trajet"
        subtitle={`${shortAddr(freshTrip.depart)} → ${shortAddr(freshTrip.destination)}`}
        leftIcon="arrow-left"
        onLeftClick={() => navigate(freshTrip._backRoute || "my-trips")}
      />

      {/* Route card */}
      <div className="td2-route-card">
        <div className="td2-route">
          <div className="td2-route__line">
            <span className="td2-route__dot td2-route__dot--start" />
            <span className="td2-route__connector" />
            <span className="td2-route__dot td2-route__dot--end" />
          </div>
          <div className="td2-route__names">
            <div>
              <small className="td2-label">Depart</small>
              <strong>{shortAddr(freshTrip.depart || freshTrip.route)}</strong>
            </div>
            <div>
              <small className="td2-label">Destination</small>
              <strong>{shortAddr(freshTrip.destination)}</strong>
            </div>
          </div>
        </div>

        {/* Date & time */}
        {(dateStr || timeStr) && (
          <div className="td2-datetime">
            <Icon name="calendar" size={16} />
            <span>{dateStr}{dateStr && timeStr ? " a " : ""}{timeStr}</span>
          </div>
        )}

        {/* Stats */}
        <div className="td2-stats">
          <div className="td2-stat">
            <span className="td2-stat__icon">💺</span>
            <strong>{freshTrip.seats || "0"}</strong>
            <small>places</small>
          </div>
          <div className="td2-stat">
            <span className="td2-stat__icon">💰</span>
            <strong>{freshTrip.earningsEstimate || freshTrip.price || 0} DH</strong>
            <small>revenus</small>
          </div>
          <div className="td2-stat">
            <span className="td2-stat__icon">👥</span>
            <strong>{confirmed.length + pending.length}</strong>
            <small>demandes</small>
          </div>
        </div>

        {/* Status */}
        <div className="td2-status-row">
          <span className={`mt-badge mt-badge--${freshTrip.status === "Actif" ? "green" : "gray"}`}>
            {freshTrip.status}
          </span>
        </div>
      </div>

      {feedback.message && (
        <div className={`toast toast--${feedback.tone}`}>{feedback.message}</div>
      )}

      {/* Pending requests */}
      {pending.length > 0 && (
        <div className="td2-section">
          <div className="td2-section__header td2-section__header--orange">
            <span className="td2-section__badge" style={{ background: "#f59e0b" }}>{pending.length}</span>
            <h4>Demande{pending.length > 1 ? "s" : ""} en attente</h4>
          </div>
          {pending.map((r) => (
            <div className="td2-passenger" key={r.id}>
              <div className="td2-passenger__left" onClick={() => onViewPassenger?.({ passengerId: r.passagerId, passenger: r.passenger, passengerAvatar: r.passengerAvatar || "", phone: r.phone, _backRoute: "trip-detail" })}>
                <div className="mt-avatar">
                  {r.passengerAvatar ? <img src={r.passengerAvatar} alt="" /> : <span>{(r.passenger || "?")[0]}</span>}
                </div>
                <div>
                  <strong>{r.passenger}</strong>
                  {r.phone && <small>{r.phone}</small>}
                  {r.message && <small className="td2-msg">"{r.message}"</small>}
                </div>
              </div>
              <div className="td2-passenger__actions">
                <button className="mt-action-btn mt-action-btn--accept" disabled={busyAction === `a-${r.id}`} onClick={() => runAction(`a-${r.id}`, () => onConfirmReservation(r.id), "Accepte !")}>✓</button>
                <button className="mt-action-btn mt-action-btn--reject" disabled={busyAction === `r-${r.id}`} onClick={() => runAction(`r-${r.id}`, () => onRejectReservation(r.id), "Refuse.")}>✕</button>
                {r.phone && <a className="mt-action-btn mt-action-btn--call" href={`tel:${r.phone}`}>📞</a>}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Confirmed passengers */}
      {confirmed.length > 0 && (
        <div className="td2-section">
          <div className="td2-section__header td2-section__header--green">
            <span className="td2-section__badge" style={{ background: "#059669" }}>{confirmed.length}</span>
            <h4>Passager{confirmed.length > 1 ? "s" : ""} confirme{confirmed.length > 1 ? "s" : ""}</h4>
          </div>
          {confirmed.map((r) => (
            <div className="td2-passenger" key={r.id}>
              <div className="td2-passenger__left" onClick={() => onViewPassenger?.({ passengerId: r.passagerId, passenger: r.passenger, passengerAvatar: r.passengerAvatar || "", phone: r.phone, _backRoute: "trip-detail" })}>
                <div className="mt-avatar">
                  {r.passengerAvatar ? <img src={r.passengerAvatar} alt="" /> : <span>{(r.passenger || "?")[0]}</span>}
                </div>
                <div>
                  <strong>{r.passenger}</strong>
                  {r.phone && <small>{r.phone}</small>}
                </div>
              </div>
              <div className="td2-passenger__actions">
                {r.phone && <a className="mt-action-btn mt-action-btn--call" href={`tel:${r.phone}`}>📞</a>}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* History */}
      {history.length > 0 && (
        <div className="td2-section">
          <div className="td2-section__header td2-section__header--gray">
            <h4>Historique ({history.length})</h4>
          </div>
          {history.map((r) => (
            <div className="td2-passenger td2-passenger--muted" key={r.id}>
              <div className="td2-passenger__left">
                <div className="mt-avatar" style={{ opacity: 0.5 }}>
                  <span>{(r.passenger || "?")[0]}</span>
                </div>
                <strong>{r.passenger}</strong>
              </div>
              <span className="td2-history-status">{r.status}</span>
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!reservations.length && (
        <div className="td2-empty">
          <Icon name="user" size={24} />
          <p>Aucune demande pour ce trajet</p>
          <small>Les passagers verront ton trajet dans la recherche</small>
        </div>
      )}

      {/* Actions */}
      <div className="td2-actions">
        {!isClosed && (
          <button className="td2-action-btn" disabled={busyAction === `c-${freshTrip.id}`} onClick={() => runAction(`c-${freshTrip.id}`, () => onCloseTrip(freshTrip.id), "Ferme.")}>
            Fermer les reservations
          </button>
        )}
        <button className="td2-action-btn td2-action-btn--danger" disabled={busyAction === `d-${freshTrip.id}`} onClick={() => runAction(`d-${freshTrip.id}`, () => onDeleteTrip(freshTrip.id), "Supprime.")}>
          Supprimer ce trajet
        </button>
      </div>
    </div>
  );
}
