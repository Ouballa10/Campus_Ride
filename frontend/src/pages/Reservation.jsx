import React, { useState } from "react";
import AppHeader from "../components/AppHeader";
import { Icon, Stars } from "../components/Icons";

function shortAddress(addr = "") {
  // Take only the first part before the first comma (or first 30 chars)
  const parts = addr.split(",");
  const short = parts[0]?.trim() || addr;
  return short.length > 35 ? short.slice(0, 35) + "..." : short;
}

export default function Reservation({
  navigate,
  onOpenChat,
  onReserve,
  onTripSelect,
  onViewDriver,
  reservedTripIds,
  reservations = [],
  selectedTrip,
  tripOptions,
}) {
  const [note, setNote] = useState("");
  const [feedback, setFeedback] = useState({ message: "", tone: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!selectedTrip) {
    return (
      <div className="screen screen--simple">
        <AppHeader title="Reservation" leftIcon="arrow-left" onLeftClick={() => navigate("search")} />
        <div className="empty-box">
          <Icon name="route" size={28} />
          <p>Selectionne un trajet d'abord</p>
        </div>
      </div>
    );
  }

  const alreadyReserved = reservedTripIds.includes(selectedTrip.id);
  const isUnavailable = selectedTrip.seats <= 0;
  const blocked = alreadyReserved || isUnavailable;

  async function handleReserve() {
    if (blocked) return;
    try {
      setIsSubmitting(true);
      setFeedback({ message: "", tone: "" });
      await onReserve(selectedTrip, note);
      setFeedback({ message: "Demande envoyee !", tone: "success" });
      setNote("");
      setTimeout(() => navigate("my-reservations"), 1000);
    } catch (e) {
      setFeedback({ message: e.message || "Erreur.", tone: "error" });
    } finally {
      setIsSubmitting(false);
    }
  }

  const alternatives = tripOptions.filter((t) => t.id !== selectedTrip.id).slice(0, 3);

  return (
    <div className="screen screen--simple">
      <AppHeader
        title="Reserver"
        subtitle={`${shortAddress(selectedTrip.depart)} → ${shortAddress(selectedTrip.destination)}`}
        leftIcon="arrow-left"
        onLeftClick={() => navigate("search")}
      />

      {/* Main trip card */}
      <div className="res-card">
        {/* Route */}
        <div className="res-route">
          <div className="res-route__line">
            <span className="res-route__dot res-route__dot--start" />
            <span className="res-route__connector" />
            <span className="res-route__dot res-route__dot--end" />
          </div>
          <div className="res-route__names">
            <div>
              <strong>{shortAddress(selectedTrip.depart)}</strong>
              <small>Depart</small>
            </div>
            <div>
              <strong>{shortAddress(selectedTrip.destination)}</strong>
              <small>Arrivee</small>
            </div>
          </div>
        </div>

        {/* Info grid */}
        <div className="res-info">
          <div className="res-info__item">
            <Icon name="clock" size={16} />
            <strong>{selectedTrip.time}</strong>
            <small>{selectedTrip.duration || "~30 min"}</small>
          </div>
          <div className="res-info__item">
            <Icon name="seat" size={16} />
            <strong>{selectedTrip.seats}</strong>
            <small>place{selectedTrip.seats > 1 ? "s" : ""}</small>
          </div>
          <div className="res-info__item res-info__item--price">
            <Icon name="ticket" size={16} />
            <strong>{selectedTrip.price} DH</strong>
            <small>/place</small>
          </div>
        </div>

        {/* Driver */}
        <div className="res-driver" onClick={() => onViewDriver?.(selectedTrip)}>
          <div className="res-driver__avatar">
            {selectedTrip.driverAvatar ? (
              <img alt={selectedTrip.driver} src={selectedTrip.driverAvatar} />
            ) : (
              selectedTrip.driverInitials || "?"
            )}
          </div>
          <div className="res-driver__info">
            <strong>{selectedTrip.driver}</strong>
            <span>{selectedTrip.car || "Vehicule"}</span>
            <Stars value={selectedTrip.rating} />
          </div>
          <Icon name="chevron-right" size={16} />
        </div>

        {/* Pickup */}
        {selectedTrip.pickup ? (
          <div className="res-pickup">
            <Icon name="location" size={14} />
            <span>{selectedTrip.pickup}</span>
          </div>
        ) : null}
      </div>

      {/* Note */}
      <div className="res-note">
        <label>
          <strong>Message au conducteur</strong>
          <small>Optionnel</small>
        </label>
        <textarea
          placeholder="Point de RDV, bagage, info utile..."
          rows="2"
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
      </div>

      {/* Feedback */}
      {feedback.message ? (
        <div className={`toast toast--${feedback.tone}`}>{feedback.message}</div>
      ) : null}

      {/* CTA */}
      {alreadyReserved ? (
        <div style={{ display: "grid", gap: "10px" }}>
          <button
            className="res-cta"
            disabled
            type="button"
            style={{ background: "#e5e7eb", color: "#6b7280", boxShadow: "none" }}
          >
            ✓ Deja reserve
          </button>
          <button
            className="res-cta"
            type="button"
            style={{ background: "linear-gradient(135deg, #1d4ed8, #2563eb)" }}
            onClick={() => {
              const matchedReservation = reservations.find((r) => r.trajetId === selectedTrip.id);
              onOpenChat?.({
                reservationId: matchedReservation?.id || "",
                otherName: selectedTrip.driver,
                otherAvatar: selectedTrip.driverAvatar || "",
                conducteurId: selectedTrip.conducteurId || "",
                tripRoute: `${shortAddress(selectedTrip.depart)} → ${shortAddress(selectedTrip.destination)}`,
                backRoute: "reservation",
              });
            }}
          >
            💬 Contacter le conducteur
          </button>
        </div>
      ) : (
        <button
          className="res-cta"
          disabled={blocked || isSubmitting}
          type="button"
          onClick={handleReserve}
        >
          {isUnavailable ? "Complet" : isSubmitting ? "Envoi..." : "Envoyer la demande"}
        </button>
      )}

      {/* Alternatives */}
      {alternatives.length > 0 ? (
        <div className="res-alternatives">
          <h4>Autres trajets disponibles</h4>
          {alternatives.map((trip) => (
            <button className="res-alt" key={trip.id} type="button" onClick={() => onTripSelect(trip.id)}>
              <div className="res-alt__info">
                <strong>{trip.driver}</strong>
                <span>{shortAddress(trip.depart)} → {shortAddress(trip.destination)}</span>
              </div>
              <div className="res-alt__meta">
                <span>{trip.price} DH</span>
                <span>{trip.seats} pl.</span>
              </div>
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
