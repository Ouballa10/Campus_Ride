import React from "react";
import { MapArtwork } from "../components/Artwork";
import AppHeader from "../components/AppHeader";
import { Icon } from "../components/Icons";

const fields = [
  { key: "depart", label: "Lieu de depart", icon: "location" },
  { key: "destination", label: "Lieu d'arrivee", icon: "location" },
  { key: "date", label: "Date", icon: "calendar" },
  { key: "time", label: "Heure", icon: "clock" },
];

export default function SearchTrajet({ navigate, searchFilters, tripCount }) {
  return (
    <div className="screen">
      <AppHeader
        title="Recherche de trajet"
        leftIcon="arrow-left"
        onLeftClick={() => navigate("home")}
      />

      <div className="field-stack">
        {fields.map((field) => (
          <button className="field-card" key={field.key} type="button">
            <div>
              <span className="field-card__label">{field.label}</span>
              <strong>{searchFilters[field.key]}</strong>
            </div>
            <Icon name={field.icon} size={18} />
          </button>
        ))}
      </div>

      <MapArtwork />

      <div className="chip-row">
        {searchFilters.chips.map((chip) => (
          <span className="chip" key={chip}>
            {chip}
          </span>
        ))}
      </div>

      <div className="summary-card">
        <div>
          <strong>{tripCount} trajets trouves</strong>
          <span>Resultats autour de tes horaires campus</span>
        </div>
        <Icon name="route" size={18} />
      </div>

      <button
        className="primary-button"
        type="button"
        onClick={() => navigate("reservation")}
      >
        Voir les propositions
      </button>
    </div>
  );
}
