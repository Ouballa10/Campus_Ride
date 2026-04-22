import React from "react";
import AppHeader from "../components/AppHeader";
import { Icon, Stars } from "../components/Icons";

export default function Reservation({ navigate, tripOptions }) {
  const [featuredTrip, ...alternatives] = tripOptions;

  return (
    <div className="screen screen--reservation">
      <AppHeader
        title={`${featuredTrip.depart} - ${featuredTrip.destination}`}
        subtitle={featuredTrip.time}
        leftIcon="arrow-left"
        onLeftClick={() => navigate("search")}
      />

      <div className="screen-grid screen-grid--reservation">
        <div className="screen-panel screen-panel--primary">
          <div className="detail-card detail-card--highlight">
            <div className="trip-card__middle">
              <div className="avatar-badge avatar-badge--large">
                {featuredTrip.driverInitials}
              </div>
              <div className="trip-card__driver">
                <strong>{featuredTrip.driver}</strong>
                <span>{featuredTrip.role}</span>
                <span>{featuredTrip.car}</span>
              </div>
              <span className="pill pill--price">{featuredTrip.price} DH</span>
            </div>

            <div className="trip-card__meta">
              <span className="meta-chip">
                <Icon name="seat" size={14} />
                {featuredTrip.seats} places
              </span>
              <span className="meta-chip">
                <Icon name="clock" size={14} />
                {featuredTrip.duration}
              </span>
              <span className="meta-chip">
                <Icon name="location" size={14} />
                {featuredTrip.pickup}
              </span>
            </div>

            <Stars value={featuredTrip.rating} />
          </div>

          <div className="message-box">
            <strong>Message pour {featuredTrip.driver}</strong>
            <p>Optionnel: precise ton point de rendez-vous ou ton bagage.</p>
          </div>

          <button
            className="primary-button"
            type="button"
            onClick={() => navigate("my-reservations")}
          >
            Reserver
          </button>
        </div>

        <div className="screen-panel screen-panel--secondary">
          <div className="section-heading section-heading--compact">
            <div>
              <h3>Autres propositions</h3>
              <p>Compare vite les conducteurs disponibles</p>
            </div>
          </div>

          <div className="stack-list stack-list--options">
            {alternatives.map((trip) => (
              <article className="option-card" key={trip.id}>
                <div className="trip-card__middle">
                  <div className="avatar-badge">{trip.driverInitials}</div>
                  <div className="trip-card__driver">
                    <strong>{trip.driver}</strong>
                    <span>{trip.car}</span>
                  </div>
                  <button
                    className="check-circle"
                    type="button"
                    aria-label="Choisir"
                  >
                    <span />
                  </button>
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
