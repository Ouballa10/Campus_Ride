import React from "react";
import { RideArtwork } from "../components/Artwork";
import AppHeader from "../components/AppHeader";
import { Icon } from "../components/Icons";
import TrajetCard from "../components/TrajetCard";

export default function Home({ navigate, tripOptions }) {
  return (
    <div className="screen">
      <AppHeader
        title="Accueil"
        leftIcon="menu"
        onLeftClick={() => navigate("profile")}
      />

      <button
        className="search-pill"
        type="button"
        onClick={() => navigate("search")}
      >
        <Icon name="search" size={18} />
        <span>Rechercher un trajet...</span>
      </button>

      <RideArtwork />

      <div className="action-grid">
        <button
          className="action-card action-card--green"
          type="button"
          onClick={() => navigate("search")}
        >
          <span className="action-card__icon">
            <Icon name="search" size={22} />
          </span>
          <strong>Rechercher</strong>
          <span>un trajet</span>
        </button>

        <button
          className="action-card action-card--orange"
          type="button"
          onClick={() => navigate("publish")}
        >
          <span className="action-card__icon">
            <Icon name="ticket" size={22} />
          </span>
          <strong>Publier</strong>
          <span>un trajet</span>
        </button>
      </div>

      <div className="section-heading">
        <div>
          <h3>Trajets disponibles</h3>
          <p>Des departs verifies autour du campus</p>
        </div>

        <button
          className="text-link"
          type="button"
          onClick={() => navigate("search")}
        >
          Voir tout
        </button>
      </div>

      <div className="stack-list">
        {tripOptions.slice(0, 2).map((trip) => (
          <TrajetCard
            key={trip.id}
            trip={trip}
            onClick={() => navigate("reservation")}
          />
        ))}
      </div>
    </div>
  );
}
