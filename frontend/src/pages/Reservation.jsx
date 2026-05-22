import React, { useState } from "react";
import AppHeader from "../components/AppHeader";
import { Icon, Stars } from "../components/Icons";

export default function Reservation({
  navigate,
  onReserve,
  onTripSelect,
  onViewDriver,
  reservedTripIds,
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
        subtitle={`${selectedTrip.depart} → ${selectedTrip.destination}`}
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
              <strong>{selectedTrip.depart}</strong>
              <small>Depart</small>
            </div>
            <div>
              <strong>{selectedTrip.destination}</strong>
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
      <button
        className="res-cta"
        disabled={blocked || isSubmitting}
        type="button"
        onClick={handleReserve}
      >
        {alreadyReserved ? "✓ Deja reserve" : isUnavailable ? "Complet" : isSubmitting ? "Envoi..." : "Envoyer la demande"}
      </button>

      {/* Alternatives */}
      {alternatives.length > 0 ? (
        <div className="res-alternatives">
          <h4>Autres trajets disponibles</h4>
          {alternatives.map((trip) => (
            <button className="res-alt" key={trip.id} type="button" onClick={() => onTripSelect(trip.id)}>
              <div className="res-alt__info">
                <strong>{trip.driver}</strong>
                <span>{trip.depart} → {trip.destination}</span>
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
