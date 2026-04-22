import React from "react";
import AppHeader from "../components/AppHeader";
import { Icon } from "../components/Icons";

const publishFields = [
  { key: "depart", label: "Lieu de depart", icon: "location" },
  { key: "destination", label: "Lieu d'arrivee", icon: "location" },
  { key: "date", label: "Date de depart", icon: "calendar" },
  { key: "time", label: "Heure", icon: "clock" },
];

export default function PublishTrajet({ navigate, publishDraft }) {
  return (
    <div className="screen screen--publish">
      <AppHeader
        title="Publier un trajet"
        leftIcon="arrow-left"
        onLeftClick={() => navigate("home")}
      />

      <div className="screen-grid screen-grid--publish">
        <div className="screen-panel screen-panel--fields">
          <div className="field-stack">
            {publishFields.map((field) => (
              <button className="field-card" key={field.key} type="button">
                <div>
                  <span className="field-card__label">{field.label}</span>
                  <strong>{publishDraft[field.key]}</strong>
                </div>
                <Icon name={field.icon} size={18} />
              </button>
            ))}
          </div>
        </div>

        <div className="screen-panel screen-panel--details">
          <div className="detail-card">
            <div className="section-heading section-heading--compact">
              <div>
                <h3>Places</h3>
                <p>Choisis la capacite disponible</p>
              </div>
              <span className="pill pill--price">{publishDraft.price} DH</span>
            </div>

            <div className="seat-row">
              {[1, 2, 3, 4, 5].map((seat) => (
                <button
                  className={`seat-chip ${
                    seat <= publishDraft.seats ? "seat-chip--active" : ""
                  }`}
                  key={seat}
                  type="button"
                >
                  {seat}
                </button>
              ))}
            </div>

            <div className="message-box">
              <strong>Note conducteur</strong>
              <p>{publishDraft.note}</p>
            </div>
          </div>

          <button
            className="primary-button"
            type="button"
            onClick={() => navigate("my-trips")}
          >
            Confirmer
          </button>

          <div className="summary-card">
            <div>
              <strong>Message rapide</strong>
              <span>{publishDraft.message}</span>
            </div>
            <Icon name="send" size={18} />
          </div>
        </div>
      </div>
    </div>
  );
}
