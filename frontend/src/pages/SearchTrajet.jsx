import React, { useState } from "react";
import { MapArtwork } from "../components/Artwork";
import AppHeader from "../components/AppHeader";
import SearchBar from "../components/SearchBar";
import TrajetCard from "../components/TrajetCard";
import { Icon } from "../components/Icons";

const initialFilters = {
  depart: "",
  destination: "",
  date: "",
  time: "",
};

function normalize(value = "") {
  return value.trim().toLowerCase();
}

function getInputDateValue(dateValue) {
  if (!dateValue) {
    return "";
  }

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function matchesTrip(trip, filters) {
  const tripDate = trip.departureAt ? new Date(trip.departureAt) : null;
  const tripHour = tripDate
    ? `${`${tripDate.getHours()}`.padStart(2, "0")}:${`${tripDate.getMinutes()}`.padStart(2, "0")}`
    : "";
  const matchesDepart =
    !normalize(filters.depart) || normalize(trip.depart).includes(normalize(filters.depart));
  const matchesDestination =
    !normalize(filters.destination) ||
    normalize(trip.destination).includes(normalize(filters.destination));
  const matchesDate =
    !filters.date || getInputDateValue(trip.departureAt) === filters.date;
  const matchesTime = !filters.time || tripHour >= filters.time;

  return matchesDepart && matchesDestination && matchesDate && matchesTime;
}

export default function SearchTrajet({ navigate, onTripSelect, tripOptions }) {
  const [filters, setFilters] = useState(initialFilters);
  const filteredTrips = tripOptions.filter((trip) => matchesTrip(trip, filters));
  const activeFilters = Object.values(filters).filter(Boolean).length;

  function updateFilter(field, value) {
    setFilters((currentFilters) => ({
      ...currentFilters,
      [field]: value,
    }));
  }

  function resetFilters() {
    setFilters(initialFilters);
  }

  return (
    <div className="screen screen--search">
      <AppHeader
        title="Recherche de trajet"
        subtitle="Affiner les departs selon ton campus"
        leftIcon="arrow-left"
        onLeftClick={() => navigate("home")}
      />

      <div className="screen-grid screen-grid--search">
        <div className="screen-panel screen-panel--filters">
          <SearchBar values={filters} onChange={updateFilter} onReset={resetFilters} />

          <div className="summary-card">
            <div>
              <strong>{filteredTrips.length} trajets trouves</strong>
              <span>
                {activeFilters
                  ? `${activeFilters} filtre(s) actif(s) pour ta recherche.`
                  : "Toutes les propositions autour du campus sont affichees."}
              </span>
            </div>
            <Icon name="route" size={18} />
          </div>

          <div className="chip-row">
            {filters.depart ? <span className="chip">Depart: {filters.depart}</span> : null}
            {filters.destination ? (
              <span className="chip">Destination: {filters.destination}</span>
            ) : null}
            {filters.date ? <span className="chip">Date: {filters.date}</span> : null}
            {filters.time ? <span className="chip">Apres: {filters.time}</span> : null}
            {!activeFilters ? <span className="chip">Sans filtre</span> : null}
          </div>
        </div>

        <div className="screen-panel screen-panel--map">
          <MapArtwork />
        </div>
      </div>

      <div className="screen-panel">
        <div className="section-heading section-heading--compact">
          <div>
            <h3>Resultats</h3>
            <p>Choisis un trajet pour ouvrir le detail et reserver.</p>
          </div>
        </div>

        {!filteredTrips.length ? (
          <div className="message-box">
            <strong>Aucun trajet ne correspond a cette recherche</strong>
            <p>Essaie une autre zone, une autre date, ou reinitialise les filtres.</p>
          </div>
        ) : null}

        <div className="stack-list">
          {filteredTrips.map((trip) => (
            <TrajetCard
              ctaLabel="Reserver"
              key={trip.id}
              trip={trip}
              onClick={() => onTripSelect(trip.id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
