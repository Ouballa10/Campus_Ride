import React from "react";
import { Icon, Stars } from "./Icons";

export default function TrajetCard({ trip, ctaLabel = "Reserver", onClick, onViewDriver }) {
  const isUnavailable = trip.seats <= 0;

  return (
    <article className="trip-card">
      <div className="trip-card__top">
        <div>
          <h4>{trip.routeLabel || `${trip.depart} - ${trip.destination}`}</h4>
          <p>{trip.time}</p>
        </div>

        <span className="pill pill--price">{trip.price} DH<small>/place</small></span>
      </div>

      <div className="trip-card__middle">
        <div
          className="avatar-badge avatar-badge--clickable"
          role="button"
          tabIndex={0}
          title={`Voir le profil de ${trip.driver}`}
          onClick={(e) => { e.stopPropagation(); onViewDriver?.(trip); }}
          onKeyDown={(e) => { if (e.key === "Enter") { e.stopPropagation(); onViewDriver?.(trip); } }}
        >
          {trip.driverAvatar ? (
            <img alt={trip.driver} src={trip.driverAvatar} />
          ) : (
            trip.driverInitials
          )}
        </div>
        <div className="trip-card__driver">
          <strong
            className="trip-card__driver-name"
            role="button"
            tabIndex={0}
            onClick={(e) => { e.stopPropagation(); onViewDriver?.(trip); }}
            onKeyDown={(e) => { if (e.key === "Enter") { e.stopPropagation(); onViewDriver?.(trip); } }}
          >
            {trip.driver}
          </strong>
          <span>{trip.car}</span>
        </div>
      </div>

      <div className="trip-card__meta">
        <span className="meta-chip">
          <Icon name="seat" size={14} />
          {trip.seats} places
        </span>
        <span className="meta-chip">
          <Icon name="clock" size={14} />
          {trip.duration}
        </span>
        <span className="meta-chip">
          <Icon name="shield" size={14} />
          Campus
        </span>
      </div>

      <p className="card-note">{trip.pickup}</p>

      <div className="trip-card__bottom">
        <Stars value={trip.rating} />
        <button
          className="mini-button"
          disabled={isUnavailable}
          type="button"
          onClick={onClick}
        >
          {isUnavailable ? "Complet" : ctaLabel}
        </button>
      </div>
    </article>
  );
}
