import React from "react";
import { Icon, Stars } from "./Icons";

export default function TrajetCard({ trip, ctaLabel = "Reserver", onClick }) {
  return (
    <article className="trip-card">
      <div className="trip-card__top">
        <div>
          <h4>{trip.depart} - {trip.destination}</h4>
          <p>{trip.time}</p>
        </div>

        <span className="pill pill--price">{trip.price} DH</span>
      </div>

      <div className="trip-card__middle">
        <div className="avatar-badge">{trip.driverInitials}</div>
        <div className="trip-card__driver">
          <strong>{trip.driver}</strong>
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

      <div className="trip-card__bottom">
        <Stars value={trip.rating} />
        <button className="mini-button" type="button" onClick={onClick}>
          {ctaLabel}
        </button>
      </div>
    </article>
  );
}
