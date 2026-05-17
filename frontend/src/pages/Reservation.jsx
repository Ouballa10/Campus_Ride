import React, { useState } from "react";
import AppHeader from "../components/AppHeader";
import CampusMap from "../components/CampusMap";
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
      <div className="screen screen--reservation">
        <AppHeader
          title="Reservation"
          subtitle="Selectionne d'abord un trajet"
          leftIcon="arrow-left"
          onLeftClick={() => navigate("search")}
        />

        <div className="message-box">
          <strong>Aucun trajet selectionne</strong>
          <p>Choisis un trajet depuis la recherche ou depuis l'accueil.</p>
        </div>
      </div>
    );
  }

  const alternativeTrips = tripOptions
    .filter((trip) => trip.id !== selectedTrip.id)
    .slice(0, 4);
  const alreadyReserved = reservedTripIds.includes(selectedTrip.id);
  const isUnavailable = selectedTrip.seats <= 0;
  const reservationBlocked = alreadyReserved || isUnavailable;

  async function handleReserve() {
    if (reservationBlocked) {
      return;
    }

    try {
      setIsSubmitting(true);
      setFeedback({ message: "", tone: "" });
      await onReserve(selectedTrip, note);
      setFeedback({
        message: "Demande envoyee. Le driver peut la confirmer depuis ses trajets.",
        tone: "success",
      });
      setNote("");
      navigate("my-reservations");
    } catch (error) {
      setFeedback({
        message: error.message || "Reservation impossible pour le moment.",
        tone: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="screen screen--reservation">
      <AppHeader
        title={selectedTrip.routeLabel}
        subtitle={selectedTrip.time}
        leftIcon="arrow-left"
        onLeftClick={() => navigate("search")}
      />

      <div className="screen-grid screen-grid--reservation">
        <div className="screen-panel screen-panel--primary">
          <div className="detail-card detail-card--highlight detail-card--reservation">
            <div className="trip-card__middle">
              <div
                className="avatar-badge avatar-badge--large avatar-badge--clickable"
                role="button"
                tabIndex={0}
                title={`Voir le profil de ${selectedTrip.driver}`}
                onClick={() => onViewDriver?.(selectedTrip)}
                onKeyDown={(e) => { if (e.key === "Enter") onViewDriver?.(selectedTrip); }}
              >
                {selectedTrip.driverAvatar ? (
                  <img alt={selectedTrip.driver} src={selectedTrip.driverAvatar} />
                ) : (
                  selectedTrip.driverInitials
                )}
              </div>
              <div className="trip-card__driver">
                <strong
                  className="trip-card__driver-name"
                  role="button"
                  tabIndex={0}
                  onClick={() => onViewDriver?.(selectedTrip)}
                  onKeyDown={(e) => { if (e.key === "Enter") onViewDriver?.(selectedTrip); }}
                >
                  {selectedTrip.driver}
                </strong>
                <span>{selectedTrip.role}</span>
                <span>{selectedTrip.car}</span>
              </div>
              <span className="pill pill--price">{selectedTrip.price} DH</span>
            </div>

            <div className="trip-card__meta">
              <span className="meta-chip">
                <Icon name="seat" size={14} />
                {selectedTrip.seats} place(s) libre(s)
              </span>
              <span className="meta-chip">
                <Icon name="clock" size={14} />
                {selectedTrip.duration}
              </span>
              <span className="meta-chip">
                <Icon name="location" size={14} />
                {selectedTrip.pickup}
              </span>
            </div>

            <div className="reservation-route-grid">
              <div className="reservation-route-stop">
                <span className="reservation-route-stop__dot" />
                <div>
                  <strong>Depart</strong>
                  <span>{selectedTrip.depart}</span>
                </div>
              </div>

              <div className="reservation-route-stop">
                <span className="reservation-route-stop__dot reservation-route-stop__dot--end" />
                <div>
                  <strong>Arrivee</strong>
                  <span>{selectedTrip.destination}</span>
                </div>
              </div>
            </div>
          </div>

          <label className="reservation-note-card">
            <span className="profile-editor-field__label">Message au conducteur</span>
            <textarea
              placeholder="Optionnel: point de rendez-vous, bagage, ou info utile."
              rows="2"
              value={note}
              onChange={(event) => setNote(event.target.value)}
            />
          </label>

          {feedback.message ? (
            <p className={`profile-editor-status profile-editor-status--${feedback.tone}`}>
              {feedback.message}
            </p>
          ) : null}

          <div className="reservation-sticky-cta">
            <button
              className="primary-button"
              disabled={reservationBlocked || isSubmitting}
              type="button"
              onClick={handleReserve}
            >
              {alreadyReserved
                ? "Deja reserve"
                : isUnavailable
                  ? "Trajet complet"
                  : isSubmitting
                    ? "Envoi..."
                    : "Envoyer la demande"}
            </button>
          </div>
        </div>

        <div className="screen-panel screen-panel--secondary">
          <CampusMap
            compact
            selectedTrip={selectedTrip}
            trips={[selectedTrip, ...alternativeTrips]}
            onTripSelect={onTripSelect}
          />

          <div className="section-heading section-heading--compact">
            <div>
              <h3>Autres propositions</h3>
              <p>Change rapidement de conducteur si besoin.</p>
            </div>
          </div>

          {!alternativeTrips.length ? (
            <div className="message-box">
              <strong>Aucune autre proposition</strong>
              <p>Cette recherche contient un seul trajet disponible pour le moment.</p>
            </div>
          ) : null}

          <div className="stack-list stack-list--options">
            {alternativeTrips.map((trip) => (
              <article className="option-card option-card--interactive" key={trip.id}>
                <div className="trip-card__middle">
                  <div className="avatar-badge">{trip.driverInitials}</div>
                  <div className="trip-card__driver">
                    <strong>{trip.driver}</strong>
                    <span>{trip.car}</span>
                  </div>
                  <button
                    className="check-circle"
                    type="button"
                    aria-label={`Choisir ${trip.driver}`}
                    onClick={() => onTripSelect(trip.id)}
                  >
                    <span />
                  </button>
                </div>

                <div className="trip-card__meta">
                  <span className="meta-chip">
                    <Icon name="clock" size={14} />
                    {trip.time}
                  </span>
                  <span className="meta-chip">
                    <Icon name="seat" size={14} />
                    {trip.seats} place(s)
                  </span>
                </div>

                <div className="trip-card__bottom">
                  <Stars value={trip.rating} />
                  <span className="pill">{trip.price} DH</span>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
