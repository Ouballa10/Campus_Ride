import React, { useMemo, useState } from "react";
import AppHeader from "../components/AppHeader";
import RatingModal from "../components/RatingModal";
import { Icon } from "../components/Icons";
import { isReservationHistory } from "../utils/statusUi";
import { evaluationService } from "../services/evaluationService";

export default function MyReservations({
  navigate,
  onCancelReservation,
  onOpenChat,
  onViewDriver,
  reservations,
  sessionUserId,
  tripOptions = [],
}) {
  const [busyId, setBusyId] = useState("");
  const [feedback, setFeedback] = useState({ message: "", tone: "" });
  const [ratingTarget, setRatingTarget] = useState(null);

  const grouped = useMemo(() => ({
    pending: reservations.filter((r) => r.status === "En attente"),
    confirmed: reservations.filter((r) => r.status === "Confirmee"),
    history: reservations.filter((r) => isReservationHistory(r.status)),
  }), [reservations]);

  async function handleCancel(id) {
    try {
      setBusyId(id);
      setFeedback({ message: "", tone: "" });
      await onCancelReservation(id);
      setFeedback({ message: "Reservation annulee.", tone: "success" });
    } catch (e) {
      setFeedback({ message: e.message || "Erreur.", tone: "error" });
    } finally {
      setBusyId("");
    }
  }

  function viewDriver(reservation) {
    const match = tripOptions.find((t) => t.id === reservation.trajetId);
    onViewDriver?.(match || {
      conducteurId: reservation.conducteurId || "",
      driver: reservation.driver,
      driverInitials: reservation.driverInitials || "",
      driverAvatar: reservation.driverAvatar || "",
      driverPhone: reservation.driverPhone || "",
      car: "",
      rating: 0,
    });
  }

  async function handleSubmitRating({ rating, comment }) {
    if (!ratingTarget) return;
    const match = tripOptions.find((t) => t.id === ratingTarget.trajetId);
    const conducteurId = match?.conducteurId || ratingTarget.conducteurId || "";
    if (!conducteurId || !sessionUserId) {
      throw new Error("Impossible d'identifier le conducteur.");
    }
    await evaluationService.submitEvaluation({
      trajetId: ratingTarget.trajetId,
      conducteurId,
      utilisateurId: sessionUserId,
      note: rating,
      commentaire: comment,
    });
    setFeedback({ message: "Evaluation envoyee !", tone: "success" });
  }

  function ResCard({ r }) {
    const canCancel = ["En attente", "Confirmee"].includes(r.status);
    const canRate = ["Confirmee", "Terminee"].includes(r.status);
    const statusColor = r.status === "Confirmee" ? "green" : r.status === "En attente" ? "orange" : "gray";

    return (
      <div className="r-card">
        {/* Route */}
        <div className="r-card__top">
          <div className="r-card__route">
            <strong>{r.depart}</strong>
            <span className="r-card__arrow">→</span>
            <strong>{r.destination}</strong>
          </div>
          <span className={`t-badge t-badge--${statusColor}`}>{r.status}</span>
        </div>

        {/* Info */}
        <div className="r-card__info">
          <span>📅 {r.date}</span>
          <span>🕐 {r.time}</span>
          <span>💰 {r.price} DH</span>
          <span>💺 {r.seats}</span>
        </div>

        {/* Driver */}
        <div className="r-card__driver" onClick={() => viewDriver(r)}>
          <div className="r-card__avatar">
            {r.driverAvatar ? (
              <img alt={r.driver} src={r.driverAvatar} />
            ) : (
              r.driverInitials || "?"
            )}
          </div>
          <div>
            <strong>{r.driver}</strong>
            <small>{r.pickup || "Point de RDV"}</small>
          </div>
        </div>

        {/* Message */}
        {r.message ? (
          <div className="r-card__msg">"{r.message}"</div>
        ) : null}

        {/* Actions */}
        <div className="r-card__actions">
          <button
            className="t-btn t-btn--chat"
            type="button"
            onClick={() => onOpenChat?.({
              reservationId: r.id,
              otherName: r.driver,
              tripRoute: `${r.depart} → ${r.destination}`,
              backRoute: "my-reservations",
            })}
          >
            💬 Chat
          </button>
          {r.driverPhone ? (
            <a className="t-btn t-btn--ghost" href={`tel:${r.driverPhone}`}>📞 Appeler</a>
          ) : null}
          {canRate ? (
            <button className="t-btn t-btn--star" type="button" onClick={() => setRatingTarget(r)}>
              ⭐ Evaluer
            </button>
          ) : null}
          {canCancel ? (
            <button
              className="t-btn t-btn--outline t-btn--outline-red"
              disabled={busyId === r.id}
              type="button"
              onClick={() => handleCancel(r.id)}
            >
              {busyId === r.id ? "..." : "Annuler"}
            </button>
          ) : null}
        </div>
      </div>
    );
  }

  return (
    <div className="screen screen--simple">
      <AppHeader
        title="Mes reservations"
        subtitle="Espace passager"
        leftIcon="arrow-left"
        onLeftClick={() => navigate("home")}
      />

      {feedback.message ? (
        <div className={`toast toast--${feedback.tone}`}>{feedback.message}</div>
      ) : null}

      {!reservations.length ? (
        <div className="empty-box">
          <Icon name="bookmark" size={28} />
          <p>Aucune reservation</p>
          <button className="cta-btn" type="button" onClick={() => navigate("search")}>
            Chercher un trajet
          </button>
        </div>
      ) : (
        <div className="card-list">
          {/* Pending */}
          {grouped.pending.length > 0 ? (
            <div className="section-block section-block--orange">
              <h3>🟡 En attente ({grouped.pending.length})</h3>
              {grouped.pending.map((r) => <ResCard key={r.id} r={r} />)}
            </div>
          ) : null}

          {/* Confirmed */}
          {grouped.confirmed.length > 0 ? (
            <div className="section-block section-block--green">
              <h3>🟢 Confirmes ({grouped.confirmed.length})</h3>
              {grouped.confirmed.map((r) => <ResCard key={r.id} r={r} />)}
            </div>
          ) : null}

          {/* History */}
          {grouped.history.length > 0 ? (
            <div className="section-block section-block--gray">
              <h3>⚪ Historique ({grouped.history.length})</h3>
              {grouped.history.map((r) => <ResCard key={r.id} r={r} />)}
            </div>
          ) : null}
        </div>
      )}

      {ratingTarget ? (
        <RatingModal
          driverName={ratingTarget.driver}
          onClose={() => setRatingTarget(null)}
          onSubmit={handleSubmitRating}
        />
      ) : null}
    </div>
  );
}
