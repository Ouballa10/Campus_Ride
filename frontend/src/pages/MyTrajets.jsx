import React, { useState } from "react";
import AppHeader from "../components/AppHeader";
import { Icon } from "../components/Icons";
import { isReservationHistory } from "../utils/statusUi";

function shortAddr(addr = "") {
  const parts = addr.split(",");
  return parts[0]?.trim().slice(0, 28) || addr.slice(0, 28);
}

export default function MyTrajets({
  navigate,
  onCloseTrip,
  onConfirmReservation,
  onDeleteTrip,
  onOpenChat,
  onRejectReservation,
  onViewPassenger,
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

  const activeTrips = publishedTrips.filter((trip) => trip.status !== "Passe");
  const expiredTrips = publishedTrips.filter((trip) => trip.status === "Passe");

  return (
    <div className="screen screen--simple page-enter">
      <AppHeader
        title="Mes trajets"
        subtitle="Espace conducteur"
        leftIcon="arrow-left"
        onLeftClick={() => navigate("home")}
        rightLabel="Publier +"
        onRightClick={() => navigate("publish")}
      />

      {feedback.message ? (
        <div className={`toast toast--${feedback.tone}`}>{feedback.message}</div>
      ) : null}

      {!activeTrips.length && !expiredTrips.length ? (
        <div className="empty-box">
          <Icon name="route" size={28} />
          <p>Aucun trajet publie</p>
          <button className="primary-button" type="button" onClick={() => navigate("publish")} style={{ marginTop: 12 }}>
            Publier mon premier trajet
          </button>
        </div>
      ) : (
        <div style={{ display: "grid", gap: "16px" }}>
          {/* Stats bar */}
          <div className="mt-stats">
            <div className="mt-stats__item">
              <strong>{activeTrips.length}</strong>
              <span>Actifs</span>
            </div>
            <div className="mt-stats__item">
              <strong>{activeTrips.reduce((sum, t) => sum + (t.passengerReservations || []).filter(r => r.status === "Confirmee").length, 0)}</strong>
              <span>Passagers</span>
            </div>
            <div className="mt-stats__item">
              <strong>{activeTrips.reduce((sum, t) => sum + (t.earningsEstimate || 0), 0)} DH</strong>
              <span>Revenus</span>
            </div>
          </div>

          {activeTrips.map((trip) => {
            const reservations = trip.passengerReservations || [];
            const pending = reservations.filter((r) => r.status === "En attente");
            const confirmed = reservations.filter((r) => r.status === "Confirmee");
            const isClosed = ["Ferme", "Passe", "Terminee"].includes(trip.status);
            const departureDate = trip.departureAt ? new Date(trip.departureAt) : null;
            const dateStr = departureDate ? departureDate.toLocaleDateString("fr-FR", { weekday: "short", day: "numeric", month: "short" }) : "";

            return (
              <div className="mt-card" key={trip.id}>
                {/* Card header */}
                <div className="mt-card__header">
                  <div className="mt-card__route-info">
                    <div className="mt-card__route-line">
                      <span className="mt-dot mt-dot--blue" />
                      <span className="mt-line" />
                      <span className="mt-dot mt-dot--green" />
                    </div>
                    <div className="mt-card__route-names">
                      <strong>{shortAddr(trip.depart || trip.route)}</strong>
                      <strong>{shortAddr(trip.destination)}</strong>
                    </div>
                  </div>
                  <span className={`mt-badge mt-badge--${trip.status === "Actif" ? "green" : "gray"}`}>
                    {trip.status}
                  </span>
                </div>

                {/* Meta */}
                <div className="mt-card__meta">
                  <span>🕐 {trip.time}</span>
                  {dateStr && <span>📅 {dateStr}</span>}
                  <span>💺 {trip.seats}</span>
                  <span>💰 {trip.earningsEstimate || 0} DH</span>
                </div>

                {/* Pending requests */}
                {pending.length > 0 && (
                  <div className="mt-section mt-section--pending">
                    <div className="mt-section__title">
                      <span className="mt-section__badge mt-section__badge--orange">{pending.length}</span>
                      Demande{pending.length > 1 ? "s" : ""} en attente
                    </div>
                    {pending.map((r) => (
                      <div className="mt-passenger" key={r.id}>
                        <div className="mt-passenger__left" onClick={() => onViewPassenger?.({ passengerId: r.passagerId, passenger: r.passenger, passengerAvatar: r.passengerAvatar || "", phone: r.phone, _backRoute: "my-trips" })}>
                          <div className="mt-avatar">
                            {r.passengerAvatar ? <img src={r.passengerAvatar} alt="" /> : <span>{(r.passenger || "?")[0]}</span>}
                          </div>
                          <div>
                            <strong>{r.passenger}</strong>
                            {r.message && <small>"{r.message}"</small>}
                          </div>
                        </div>
                        <div className="mt-passenger__actions">
                          <button className="mt-action-btn mt-action-btn--accept" disabled={busyAction === `a-${r.id}`} onClick={() => runAction(`a-${r.id}`, () => onConfirmReservation(r.id), "Accepte !")}>✓</button>
                          <button className="mt-action-btn mt-action-btn--reject" disabled={busyAction === `r-${r.id}`} onClick={() => runAction(`r-${r.id}`, () => onRejectReservation(r.id), "Refuse.")}>✕</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Confirmed passengers */}
                {confirmed.length > 0 && (
                  <div className="mt-section mt-section--confirmed">
                    <div className="mt-section__title">
                      <span className="mt-section__badge mt-section__badge--green">{confirmed.length}</span>
                      Passager{confirmed.length > 1 ? "s" : ""} confirme{confirmed.length > 1 ? "s" : ""}
                    </div>
                    {confirmed.map((r) => (
                      <div className="mt-passenger" key={r.id}>
                        <div className="mt-passenger__left" onClick={() => onViewPassenger?.({ passengerId: r.passagerId, passenger: r.passenger, passengerAvatar: r.passengerAvatar || "", phone: r.phone, _backRoute: "my-trips" })}>
                          <div className="mt-avatar">
                            {r.passengerAvatar ? <img src={r.passengerAvatar} alt="" /> : <span>{(r.passenger || "?")[0]}</span>}
                          </div>
                          <strong>{r.passenger}</strong>
                        </div>
                        <div className="mt-passenger__actions">
                          <button className="mt-action-btn mt-action-btn--chat" onClick={() => onOpenChat?.({ reservationId: r.id, otherName: r.passenger, otherAvatar: r.passengerAvatar || "", conducteurId: r.passagerId || "", tripRoute: `${shortAddr(trip.depart)} → ${shortAddr(trip.destination)}`, backRoute: "my-trips" })}>💬</button>
                          {r.phone && <a className="mt-action-btn mt-action-btn--call" href={`tel:${r.phone}`}>📞</a>}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* No passengers */}
                {!reservations.length && (
                  <div className="mt-empty">Aucune demande pour ce trajet</div>
                )}

                {/* Card actions */}
                <div className="mt-card__footer">
                  {!isClosed && (
                    <button className="mt-footer-btn" disabled={busyAction === `c-${trip.id}`} onClick={() => runAction(`c-${trip.id}`, () => onCloseTrip(trip.id), "Ferme.")}>
                      Fermer
                    </button>
                  )}
                  <button className="mt-footer-btn mt-footer-btn--danger" disabled={busyAction === `d-${trip.id}`} onClick={() => runAction(`d-${trip.id}`, () => onDeleteTrip(trip.id), "Supprime.")}>
                    Supprimer
                  </button>
                </div>
              </div>
            );
          })}

          {/* History */}
          {expiredTrips.length > 0 && (
            <div className="mt-history">
              <h4 className="mt-history__title">📋 Historique ({expiredTrips.length})</h4>
              {expiredTrips.map((trip) => (
                <div className="mt-history-item" key={trip.id}>
                  <div>
                    <strong>{shortAddr(trip.depart)} → {shortAddr(trip.destination)}</strong>
                    <small>{trip.time} · {trip.seats} · {trip.earningsEstimate || 0} DH</small>
                  </div>
                  <button className="mt-footer-btn mt-footer-btn--danger mt-footer-btn--sm" disabled={busyAction === `d-${trip.id}`} onClick={() => runAction(`d-${trip.id}`, () => onDeleteTrip(trip.id), "Supprime.")}>✕</button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
