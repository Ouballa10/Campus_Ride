import React from "react";
import logo from "../assets/images/logo.png";
import { RideArtwork } from "../components/Artwork";
import AppHeader from "../components/AppHeader";
import { Icon } from "../components/Icons";
import TrajetCard from "../components/TrajetCard";

export default function Home({ navigate, onTripSelect, tripOptions, user }) {
  const featuredTrips = tripOptions.slice(0, 3);

  return (
    <div className="screen screen--home">
      <AppHeader
        title="Accueil"
        subtitle={`${user.name} - ${user.role.toLowerCase()}`}
        leftIcon="menu"
        onLeftClick={() => navigate("profile")}
      />

      <section className="home-hero-card">
        <div className="home-hero-card__copy">
          <div className="home-brand-row">
            <img alt="CampusRide logo" className="home-brand-row__logo" src={logo} />
            <div>
              <span className="eyebrow">CampusRide</span>
              <h2>Plateforme de covoiturage campus plus professionnelle</h2>
            </div>
          </div>

          <p>
            Trouve rapidement un conducteur fiable, publie ton trajet et gere
            tes deplacements universitaires au meme endroit.
          </p>

          <div className="home-hero-card__stats">
            <div>
              <strong>{tripOptions.length}</strong>
              <span>trajets ouverts</span>
            </div>
            <div>
              <strong>{user.tripsCount}</strong>
              <span>trajets publies</span>
            </div>
            <div>
              <strong>{user.reservationsCount}</strong>
              <span>reservations</span>
            </div>
          </div>
        </div>

        <RideArtwork />
      </section>

      <button
        className="search-pill search-pill--hero"
        type="button"
        onClick={() => navigate("search")}
      >
        <Icon name="search" size={18} />
        <span>Rechercher un trajet par ville, campus ou horaire...</span>
      </button>

      <div className="action-grid action-grid--home">
        <button
          className="action-card action-card--green"
          type="button"
          onClick={() => navigate("search")}
        >
          <span className="action-card__icon">
            <Icon name="search" size={22} />
          </span>
          <strong>Rechercher</strong>
          <span>Comparer les conducteurs disponibles</span>
        </button>

        <button
          className="action-card action-card--orange"
          type="button"
          onClick={() => navigate("publish")}
        >
          <span className="action-card__icon">
            <Icon name="plus" size={22} />
          </span>
          <strong>Publier</strong>
          <span>Mettre une annonce claire et complete</span>
        </button>
      </div>

      <div className="screen-panel">
        <div className="section-heading">
          <div>
            <h3>Trajets disponibles</h3>
            <p>Des departs verifies autour du campus, tries pour aujourd'hui.</p>
          </div>

          <button
            className="text-link"
            type="button"
            onClick={() => navigate("search")}
          >
            Voir tout
          </button>
        </div>

        {!featuredTrips.length ? (
          <div className="message-box">
            <strong>Aucun trajet disponible pour le moment</strong>
            <p>Publie une annonce ou reviens plus tard pour voir de nouvelles offres.</p>
          </div>
        ) : null}

        <div className="stack-list stack-list--featured">
          {featuredTrips.map((trip) => (
            <TrajetCard
              ctaLabel="Voir le detail"
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
