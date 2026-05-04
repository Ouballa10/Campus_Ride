import React from "react";
import { MapArtwork } from "./Artwork";
import { Icon } from "./Icons";

const googleMapsApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY?.trim();

function getTripLabel(trip) {
  if (!trip) {
    return "CampusRide";
  }

  return trip.routeLabel || trip.route || `${trip.depart} - ${trip.destination}`;
}

function buildMapUrl(trip) {
  const baseUrl = "https://www.google.com/maps/embed/v1";

  if (!googleMapsApiKey) {
    return "";
  }

  if (trip?.depart && trip?.destination) {
    const params = new URLSearchParams({
      key: googleMapsApiKey,
      origin: trip.depart,
      destination: trip.destination,
      mode: "driving",
    });

    return `${baseUrl}/directions?${params.toString()}`;
  }

  const params = new URLSearchParams({
    key: googleMapsApiKey,
    q: "UPM Marrakech",
  });

  return `${baseUrl}/place?${params.toString()}`;
}

export default function CampusMap({
  compact = false,
  onTripSelect,
  selectedTrip = null,
  trips = [],
}) {
  const visibleTrips = trips.filter(Boolean).slice(0, compact ? 2 : 4);
  const activeTrip = selectedTrip || visibleTrips[0] || null;
  const mapUrl = buildMapUrl(activeTrip);

  return (
    <section className={`campus-map ${compact ? "campus-map--compact" : ""}`.trim()}>
      <div className="campus-map__header">
        <div>
          <span className="eyebrow">Carte</span>
          <h3>{activeTrip ? getTripLabel(activeTrip) : "Autour du campus"}</h3>
        </div>
        <span className="campus-map__badge">
          <Icon name="location" size={15} />
          {mapUrl ? "Live" : "Plan"}
        </span>
      </div>

      <div className="campus-map__canvas">
        {mapUrl ? (
          <iframe
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            src={mapUrl}
            title={`Carte ${getTripLabel(activeTrip)}`}
          />
        ) : (
          <MapArtwork />
        )}
      </div>

      {visibleTrips.length ? (
        <div className="campus-map__routes">
          {visibleTrips.map((trip) => (
            <button
              className={`campus-map__route ${
                activeTrip?.id === trip.id ? "campus-map__route--active" : ""
              }`.trim()}
              key={trip.id}
              type="button"
              onClick={() => onTripSelect?.(trip.id)}
            >
              <span>{trip.time}</span>
              <strong>{getTripLabel(trip)}</strong>
            </button>
          ))}
        </div>
      ) : null}
    </section>
  );
}
