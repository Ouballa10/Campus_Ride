import React, { useMemo, useState } from "react";
import AppHeader from "../components/AppHeader";
import RatingModal from "../components/RatingModal";
import { Icon, Stars } from "../components/Icons";
import { isReservationHistory } from "../utils/statusUi";
import { evaluationService } from "../services/evaluationService";

function shortAddress(addr = "") {
  const parts = addr.split(",");
  const short = parts[0]?.trim() || addr;
  return short.length > 30 ? short.slice(0, 30) + "..." : short;
}

function statusConfig(status) {
  if (status === "Confirmee") return { color: "#059669", bg: "#ecfdf5", border: "#a7f3d0", icon: "✅", label: "Confirme" };
  if (status === "En attente") return { color: "#d97706", bg: "#fffbeb", border: "#fde68a", icon: "🕐", label: "En attente" };
  if (status === "Annulee") return { color: "#dc2626", bg: "#fef2f2", border: "#fecaca", icon: "❌", label: "Annule" };
  if (status === "Refusee") return { color: "#dc2626", bg: "#fef2f2", border: "#fecaca", icon: "🚫", label: "Refuse" };
  return { color: "#6b7280", bg: "#f9fafb", border: "#e5e7eb", icon: "📋", label: status };
}

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
    active: reservations.filter((r) => ["En attente", "Confirmee"].includes(r.status)),
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

  function viewDriver(r) {
    const match = tripOptions.find((t) => t.id === r.trajetId);
    onViewDriver?.(match || { conducteurId: r.conducteurId || "", driver: r.driver, driverAvatar: r.driverAvatar || "" });
  }

  async function handleSubmitRating({ rating, comment }) {
    if (!ratingTarget) return;
    const match = tripOptions.find((t) => t.id === ratingTarget.trajetId);
    const conducteurId = match?.conducteurId || ratingTarget.conducteurId || "";
    if (!conducteurId || !sessionUserId) throw new Error("Erreur d'identification.");
    await evaluationService.submitEvaluation({
      trajetId: ratingTarget.trajetId, conducteurId, utilisateurId: sessionUserId,
      note: rating, commentaire: comment,
    });
    setFeedback({ message: "Evaluation envoyee !", tone: "success" });
  }

  return (
    <div className="screen screen--simple">
      <AppHeader
        title="Mes reservations"
        subtitle={`${grouped.active.length} active${grouped.active.length > 1 ? "s" : ""}`}
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
        <div className="my-res-list">
          {/* Active reservations */}
          {grouped.active.map((r) => {
            const st = statusConfig(r.status);
            const canCancel = ["En attente", "Confirmee"].includes(r.status);
            const canRate = ["Confirmee", "Terminee"].includes(r.status);

            return (
              <div className="my-res-card" key={r.id} style={{ borderLeftColor: st.border }}>
                {/* Status badge */}
                <div className="my-res-card__status" style={{ background: st.bg, color: st.color }}>
                  <span>{st.icon} {st.label}</span>
                </div>

                {/* Route */}
                <div className="my-res-card__route">
                  <div className="my-res-card__from">
                    <span className="my-res-dot my-res-dot--start" />
                    <strong>{shortAddress(r.depart)}</strong>
                  </div>
                  <div className="my-res-card__to">
                    <span className="my-res-dot my-res-dot--end" />
                    <strong>{shortAddress(r.destination)}</strong>
                  </div>
                </div>

                {/* Info */}
                <div className="my-res-card__info">
                  <span>📅 {r.date}</span>
                  <span>🕐 {r.time}</span>
                  <span>💰 {r.price} DH</span>
                </div>

                {/* Driver */}
                <div className="my-res-card__driver" onClick={() => viewDriver(r)}>
                  <div className="my-res-avatar">
                    {r.driverAvatar ? <img alt={r.driver} src={r.driverAvatar} /> : (r.driverInitials || "?")}
                  </div>
                  <div>
                    <strong>{r.driver}</strong>
                    <small>{r.pickup || "Point de RDV confirme apres validation"}</small>
                  </div>
                </div>

                {/* Actions */}
                <div className="my-res-card__actions">
                  <button className="my-res-btn my-res-btn--chat" type="button" onClick={() => onOpenChat?.({
                    reservationId: r.id, otherName: r.driver, otherAvatar: r.driverAvatar || "",
                    conducteurId: r.conducteurId || "", tripRoute: `${shortAddress(r.depart)} → ${shortAddress(r.destination)}`,
                    backRoute: "my-reservations",
                  })}>
                    💬 Chat
                  </button>
                  {r.driverPhone ? (
                    <a className="my-res-btn my-res-btn--call" href={`tel:${r.driverPhone}`}>📞</a>
                  ) : null}
                  {canRate ? (
                    <button className="my-res-btn my-res-btn--rate" type="button" onClick={() => setRatingTarget(r)}>⭐</button>
                  ) : null}
                  {canCancel ? (
                    <button className="my-res-btn my-res-btn--cancel" type="button" disabled={busyId === r.id} onClick={() => handleCancel(r.id)}>
                      {busyId === r.id ? "..." : "Annuler"}
                    </button>
                  ) : null}
                </div>
              </div>
            );
          })}

          {/* History */}
          {grouped.history.length > 0 ? (
            <div className="my-res-history">
              <h4>Historique ({grouped.history.length})</h4>
              {grouped.history.map((r) => {
                const st = statusConfig(r.status);
                return (
                  <div className="my-res-history-item" key={r.id}>
                    <div>
                      <strong>{shortAddress(r.depart)} → {shortAddress(r.destination)}</strong>
                      <small>{r.driver} · {r.date}</small>
                    </div>
                    <span style={{ color: st.color, fontSize: "0.72rem", fontWeight: 700 }}>{st.icon} {st.label}</span>
                  </div>
                );
              })}
            </div>
          ) : null}
        </div>
      )}

      {ratingTarget ? (
        <RatingModal driverName={ratingTarget.driver} onClose={() => setRatingTarget(null)} onSubmit={handleSubmitRating} />
      ) : null}
    </div>
  );
}
