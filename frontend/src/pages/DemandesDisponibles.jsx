import React, { useCallback, useEffect, useState } from "react";
import AppHeader from "../components/AppHeader";
import { Icon, Stars } from "../components/Icons";
import { useAuth } from "../context/AuthContext";
import { demandeService } from "../services/demandeService";

function formatDate(iso) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("fr-FR", {
    weekday: "short", day: "numeric", month: "short",
    hour: "2-digit", minute: "2-digit",
  });
}

function StatusBadge({ statut }) {
  const config = {
    ouverte:  { bg: "#ecfdf5", color: "#059669", label: "Ouverte" },
    acceptee: { bg: "#eff6ff", color: "#2563eb", label: "Acceptée" },
    annulee:  { bg: "#fef2f2", color: "#dc2626", label: "Annulée" },
    expiree:  { bg: "#f9fafb", color: "#6b7280", label: "Expirée" },
  };
  const c = config[statut] || config.ouverte;
  return (
    <span style={{ background: c.bg, color: c.color, padding: "3px 10px", borderRadius: 8, fontSize: "0.72rem", fontWeight: 700 }}>
      {c.label}
    </span>
  );
}

function DemandeCard({ demande, sessionUserId, onAccept, onCancel, onOpenChat }) {
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState("");
  const isOwn = demande.passagerId === sessionUserId;
  const isAcceptedByMe = demande.conducteurId === sessionUserId;
  const canAccept = !isOwn && demande.statut === "ouverte" && !demande.conducteurId;

  async function handleAccept() {
    try {
      setBusy(true);
      setFeedback("");
      await onAccept(demande.id);
      setFeedback("✅ Demande acceptée !");
    } catch (e) {
      setFeedback(e.message || "Erreur.");
    } finally {
      setBusy(false);
    }
  }

  async function handleCancel() {
    try {
      setBusy(true);
      await onCancel(demande.id);
    } catch (e) {
      setFeedback(e.message || "Erreur.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <article className="dmd-card">
      {/* Header: passager + statut */}
      <div className="dmd-card__header">
        <div className="dmd-card__passager">
          <div className="dmd-card__avatar">
            {demande.passagerAvatar
              ? <img src={demande.passagerAvatar} alt={demande.passagerName} />
              : <span>{demande.passagerInitials}</span>
            }
          </div>
          <div>
            <strong>{demande.passagerName}</strong>
            {demande.passagerCampus && <small>{demande.passagerCampus}</small>}
            <Stars value={demande.passagerRating} size={12} />
          </div>
        </div>
        <StatusBadge statut={demande.statut} />
      </div>

      {/* Route */}
      <div className="dmd-card__route">
        <div className="dmd-card__route-line">
          <span className="dmd-dot dmd-dot--start" />
          <span className="dmd-connector" />
          <span className="dmd-dot dmd-dot--end" />
        </div>
        <div className="dmd-card__route-names">
          <span>{demande.depart}</span>
          <span>{demande.destination}</span>
        </div>
      </div>

      {/* Meta */}
      <div className="dmd-card__meta">
        <span><Icon name="calendar" size={13} /> {formatDate(demande.departureAt)}</span>
        <span className="dmd-card__price">
          <Icon name="ticket" size={13} /> <strong>{demande.prixPropose} DH</strong> proposés
        </span>
      </div>

      {demande.message && (
        <p className="dmd-card__message">"{demande.message}"</p>
      )}

      {/* Conducteur acceptant (si acceptée) */}
      {demande.statut === "acceptee" && demande.conducteurName && (
        <div className="dmd-card__accepted-by">
          <Icon name="check-badge" size={14} />
          <span>Accepté par <strong>{demande.conducteurName}</strong></span>
        </div>
      )}

      {feedback && (
        <p style={{ fontSize: "0.78rem", color: feedback.startsWith("✅") ? "#059669" : "#dc2626", margin: 0 }}>
          {feedback}
        </p>
      )}

      {/* Actions */}
      <div className="dmd-card__actions">
        {canAccept && (
          <button
            className="dmd-btn dmd-btn--accept"
            disabled={busy}
            type="button"
            onClick={handleAccept}
          >
            <Icon name="check-badge" size={16} />
            {busy ? "..." : "Accepter"}
          </button>
        )}

        {(isAcceptedByMe || isOwn) && demande.statut === "acceptee" && (
          <button
            className="dmd-btn dmd-btn--chat"
            type="button"
            onClick={() => onOpenChat?.(demande)}
          >
            <Icon name="chat" size={16} />
            Chat
          </button>
        )}

        {isOwn && demande.statut === "ouverte" && (
          <button
            className="dmd-btn dmd-btn--cancel"
            disabled={busy}
            type="button"
            onClick={handleCancel}
          >
            {busy ? "..." : "Annuler"}
          </button>
        )}

        <span className="dmd-card__time">{demande.timeAgo}</span>
      </div>
    </article>
  );
}

export default function DemandesDisponibles({ navigate, onOpenChat, sessionUserId }) {
  const { isConfigured } = useAuth();
  const [tab, setTab] = useState("available"); // available | mine
  const [demandes, setDemandes] = useState([]);
  const [myDemandes, setMyDemandes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    if (!isConfigured || !sessionUserId) return;
    try {
      setLoading(true);
      setError("");
      const [avail, mine] = await Promise.all([
        demandeService.listAvailableDemandes(sessionUserId),
        demandeService.listMyDemandes(sessionUserId),
      ]);
      setDemandes(avail);
      setMyDemandes(mine);
    } catch (e) {
      setError(e.message || "Chargement impossible.");
    } finally {
      setLoading(false);
    }
  }, [isConfigured, sessionUserId]);

  useEffect(() => { load(); }, [load]);

  async function handleAccept(demandeId) {
    await demandeService.acceptDemande(demandeId, sessionUserId);
    await load();
  }

  async function handleCancel(demandeId) {
    await demandeService.cancelDemande(demandeId, sessionUserId);
    await load();
  }

  function handleOpenChat(demande) {
    onOpenChat?.({
      reservationId: demande.id,
      otherName: tab === "mine" ? demande.conducteurName : demande.passagerName,
      otherAvatar: tab === "mine" ? demande.conducteurAvatar : demande.passagerAvatar,
      tripRoute: `${demande.depart} → ${demande.destination}`,
      backRoute: "demandes",
    });
  }

  const displayed = tab === "available" ? demandes : myDemandes;

  return (
    <div className="screen screen--simple page-enter">
      <AppHeader
        title="Demandes de trajet"
        subtitle={tab === "available"
          ? `${demandes.length} demande${demandes.length > 1 ? "s" : ""} ouverte${demandes.length > 1 ? "s" : ""}`
          : `${myDemandes.length} mes demandes`
        }
        leftIcon="arrow-left"
        onLeftClick={() => navigate("home")}
        rightLabel="+ Demander"
        onRightClick={() => navigate("publish-demande")}
      />

      {/* Tabs */}
      <div className="dmd-tabs">
        <button
          className={`dmd-tab ${tab === "available" ? "dmd-tab--active" : ""}`}
          type="button"
          onClick={() => setTab("available")}
        >
          <Icon name="search" size={15} /> Disponibles
          {demandes.length > 0 && <span className="dmd-tab__badge">{demandes.length}</span>}
        </button>
        <button
          className={`dmd-tab ${tab === "mine" ? "dmd-tab--active" : ""}`}
          type="button"
          onClick={() => setTab("mine")}
        >
          <Icon name="bookmark" size={15} /> Mes demandes
          {myDemandes.length > 0 && <span className="dmd-tab__badge">{myDemandes.length}</span>}
        </button>
      </div>

      {error && <div className="toast toast--error">{error}</div>}

      {loading ? (
        <div className="empty-box">
          <div className="refresh-indicator__spinner" />
          <p>Chargement...</p>
        </div>
      ) : displayed.length === 0 ? (
        <div className="empty-box">
          <Icon name={tab === "available" ? "search" : "bookmark"} size={28} />
          {tab === "available" ? (
            <>
              <p>Aucune demande ouverte pour l'instant</p>
              <small>Sois le premier à demander un trajet !</small>
              <button className="cta-btn" type="button" onClick={() => navigate("publish-demande")}>
                <Icon name="plus" size={16} /> Créer une demande
              </button>
            </>
          ) : (
            <>
              <p>Tu n'as pas encore de demandes</p>
              <button className="cta-btn" type="button" onClick={() => navigate("publish-demande")}>
                <Icon name="plus" size={16} /> Demander un trajet
              </button>
            </>
          )}
        </div>
      ) : (
        <div className="dmd-list">
          {displayed.map((d) => (
            <DemandeCard
              key={d.id}
              demande={d}
              sessionUserId={sessionUserId}
              onAccept={handleAccept}
              onCancel={handleCancel}
              onOpenChat={handleOpenChat}
            />
          ))}
        </div>
      )}
    </div>
  );
}
