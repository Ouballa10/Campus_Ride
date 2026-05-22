import React, { useState } from "react";
import AppHeader from "../components/AppHeader";
import { Icon, Stars } from "../components/Icons";

const initialFilters = {
  depart: "",
  destination: "",
};

function normalize(value = "") {
  return value.trim().toLowerCase();
}

function matchesTrip(trip, filters) {
  const matchesDepart =
    !normalize(filters.depart) || normalize(trip.depart).includes(normalize(filters.depart));
  const matchesDestination =
    !normalize(filters.destination) ||
    normalize(trip.destination).includes(normalize(filters.destination));
  return matchesDepart && matchesDestination;
}

function TripResult({ trip, onSelect, onViewDriver }) {
  const isUnavailable = trip.seats <= 0;
  const departureDate = trip.departureAt ? new Date(trip.departureAt) : null;
  const timeStr = departureDate
    ? departureDate.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })
    : trip.time || "";
  const dateStr = departureDate
    ? departureDate.toLocaleDateString("fr-FR", { weekday: "short", day: "numeric", month: "short" })
    : trip.date || "";

  return (
    <article className="find-card" onClick={() => !isUnavailable && onSelect(trip.id)}>
      {/* Time + Price header */}
      <div className="find-card__header">
        <div className="find-card__time">
          <strong>{timeStr}</strong>
          <small>{dateStr}</small>
        </div>
        <div className="find-card__price">
          <strong>{trip.price} DH</strong>
          <small>/place</small>
        </div>
      </div>

      {/* Route */}
      <div className="find-card__route">
        <div className="find-card__route-line">
          <span className="find-card__dot find-card__dot--start" />
          <span className="find-card__line" />
          <span className="find-card__dot find-card__dot--end" />
        </div>
        <div className="find-card__route-names">
          <span>{trip.depart}</span>
          <span>{trip.destination}</span>
        </div>
      </div>

      {/* Driver */}
      <div className="find-card__driver" onClick={(e) => { e.stopPropagation(); onViewDriver?.(trip); }}>
        <div className="find-card__avatar">
          {trip.driverAvatar ? (
            <img alt={trip.driver} src={trip.driverAvatar} />
          ) : (
            trip.driverInitials || "?"
          )}
        </div>
        <div className="find-card__driver-info">
          <strong>{trip.driver}</strong>
          <span>{trip.car || "Vehicule"}</span>
        </div>
        <div className="find-card__rating">
          <Stars value={trip.rating} />
        </div>
      </div>

      {/* Footer */}
      <div className="find-card__footer">
        <div className="find-card__tags">
          <span className="find-tag">
            <Icon name="seat" size={13} />
            {trip.seats} place{trip.seats > 1 ? "s" : ""}
          </span>
          <span className="find-tag">
            <Icon name="clock" size={13} />
            {trip.duration || "~30 min"}
          </span>
        </div>
        <button
          className={`find-card__cta ${isUnavailable ? "find-card__cta--disabled" : ""}`}
          type="button"
          disabled={isUnavailable}
          onClick={(e) => { e.stopPropagation(); onSelect(trip.id); }}
        >
          {isUnavailable ? "Complet" : "Reserver"}
        </button>
      </div>

      {/* Pickup note */}
      {trip.pickup ? (
        <div className="find-card__pickup">
          <Icon name="location" size={13} />
          <span>{trip.pickup}</span>
        </div>
      ) : null}
    </article>
  );
}

export default function SearchTrajet({ navigate, onTripSelect, onViewDriver, tripOptions }) {
  const [filters, setFilters] = useState(initialFilters);
  const [showFilters, setShowFilters] = useState(false);
  const filteredTrips = tripOptions.filter((trip) => matchesTrip(trip, filters));
  const hasFilters = Boolean(filters.depart || filters.destination);

  return (
    <div className="screen screen--simple">
      <AppHeader
        title="Trouver un trajet"
        subtitle={`${filteredTrips.length} disponible${filteredTrips.length > 1 ? "s" : ""}`}
        leftIcon="arrow-left"
        onLeftClick={() => navigate("home")}
      />

      {/* Search bar */}
      <div className="find-search">
        <div className="find-search__field">
          <Icon name="location" size={16} />
          <input
            type="text"
            placeholder="D'ou pars-tu ?"
            value={filters.depart}
            onChange={(e) => setFilters({ ...filters, depart: e.target.value })}
          />
        </div>
        <div className="find-search__divider" />
        <div className="find-search__field">
          <Icon name="route" size={16} />
          <input
            type="text"
            placeholder="Ou vas-tu ?"
            value={filters.destination}
            onChange={(e) => setFilters({ ...filters, destination: e.target.value })}
          />
        </div>
        {hasFilters ? (
          <button
            className="find-search__clear"
            type="button"
            onClick={() => setFilters(initialFilters)}
          >
            <Icon name="x" size={14} />
          </button>
        ) : null}
      </div>

      {/* Results */}
      {!filteredTrips.length ? (
        <div className="empty-box">
          <Icon name="search" size={28} />
          <p>Aucun trajet trouve</p>
          <small style={{ color: "#9ca3af" }}>Essaie un autre depart ou destination</small>
        </div>
      ) : (
        <div className="find-results">
          {filteredTrips.map((trip) => (
            <TripResult
              key={trip.id}
              trip={trip}
              onSelect={onTripSelect}
              onViewDriver={onViewDriver}
            />
          ))}
        </div>
      )}
    </div>
  );
}
