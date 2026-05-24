import React from "react";
import logo from "../assets/images/logo.png";
import AppHeader from "../components/AppHeader";
import { Icon } from "../components/Icons";
import TrajetCard from "../components/TrajetCard";
import { getStatusPillClass } from "../utils/statusUi";

export default function Home({
  mode,
  navigate,
  onModeChange,
  onThemeChange,
  onTripSelect,
  onViewDriver,
  publishedTrips = [],
  reservations = [],
  theme,
  tripOptions,
  user,
}) {
  const isDriverMode = mode === "driver";
  const featuredTrips = tripOptions.slice(0, 3);
  const featuredPublishedTrips = publishedTrips.filter((trip) => trip.status !== "Passe").slice(0, 3);
  const activePublishedTrips = publishedTrips.filter((trip) => trip.status === "Actif").length;
  const confirmedReservations = reservations.filter(
    (reservation) => reservation.status === "Confirmee",
  ).length;
  const passengerCount = publishedTrips.reduce(
    (total, trip) =>
      total +
      (trip.passengerReservations || []).filter(
        (reservation) => reservation.status !== "Annulee",
      ).length,
    0,
  );

  return (
    <div className="screen screen--home">
      <AppHeader
        title="Accueil"
        subtitle={`${user.name} - ${isDriverMode ? "driver" : "passager"}`}
      />

      <section className="home-hero-card">
        <div className="home-hero-card__copy">
          <div className="home-brand-row">
            <img alt="CampusRide logo" className="home-brand-row__logo home-brand-row__logo--large" src={logo} />
            <div>
              <span className="home-mode-banner">
                <span className="home-mode-banner__icon">
                  <Icon name={isDriverMode ? "car" : "user"} size={16} />
                </span>
                {isDriverMode ? "Mode driver actif" : "Mode passager actif"}
              </span>
              <h2>
                {isDriverMode
                  ? "Espace driver"
                  : "CampusRide"}
              </h2>
              <p className="home-hero-card__lead">
                {isDriverMode
                  ? "Publie, confirme et suis tes passagers sans stress."
                  : "Trouve un trajet campus propre, rapide et confirme."}
              </p>
            </div>
          </div>

          <p className="home-hero-card__body">
            {isDriverMode
              ? "Tes annonces, places restantes, demandes et revenus restent dans le meme dashboard."
              : "Compare les conducteurs, reserve ta place et garde le point de rendez-vous a portee de main."}
          </p>

          <div className="home-hero-card__stats">
            <div className="home-hero-card__stat" onClick={() => navigate(isDriverMode ? "my-trips" : "search")} role="button" tabIndex={0}>
              <strong>{isDriverMode ? publishedTrips.length : tripOptions.length}</strong>
              <span>{isDriverMode ? "annonces" : "trajets ouverts"}</span>
            </div>
            <div className="home-hero-card__stat" onClick={() => navigate(isDriverMode ? "my-trips" : "my-reservations")} role="button" tabIndex={0}>
              <strong>{isDriverMode ? activePublishedTrips : reservations.length}</strong>
              <span>{isDriverMode ? "actifs" : "reservations"}</span>
            </div>
            <div className="home-hero-card__stat" onClick={() => navigate(isDriverMode ? "my-trips" : "my-reservations")} role="button" tabIndex={0}>
              <strong>{isDriverMode ? passengerCount : confirmedReservations}</strong>
              <span>{isDriverMode ? "passagers" : "confirmees"}</span>
            </div>
          </div>
        </div>

        <div className="home-ride-visual" aria-hidden="true">
          <div className="home-ride-visual__road" />
          <div className="home-ride-visual__car">
            <Icon name="car" size={38} />
          </div>
          <div className="home-ride-visual__pin">
            <Icon name="location" size={18} />
          </div>
        </div>
      </section>

      <button
        className="search-pill search-pill--hero"
        type="button"
        onClick={() => navigate(isDriverMode ? "my-trips" : "search")}
      >
        <Icon name={isDriverMode ? "route" : "search"} size={18} />
        <span>
          {isDriverMode
            ? "Ouvrir mes annonces et les passagers confirmes..."
            : "Rechercher un trajet par ville, campus ou horaire..."}
        </span>
      </button>

      <div className="action-grid action-grid--home">
        <button
          className="action-card action-card--green"
          type="button"
          onClick={() => navigate(isDriverMode ? "publish" : "search")}
        >
          <span className="action-card__icon">
            <Icon name={isDriverMode ? "plus" : "search"} size={22} />
          </span>
          <strong>{isDriverMode ? "Publier" : "Rechercher"}</strong>
          <span>
            {isDriverMode
              ? "Ajouter un trajet reservable par les passagers"
              : "Comparer les conducteurs disponibles"}
          </span>
        </button>

        <button
          className="action-card action-card--orange"
          type="button"
          onClick={() => navigate(isDriverMode ? "my-trips" : "my-reservations")}
        >
          <span className="action-card__icon">
            <Icon name={isDriverMode ? "route" : "bookmark"} size={22} />
          </span>
          <strong>{isDriverMode ? "Mes annonces" : "Mes reservations"}</strong>
          <span>
            {isDriverMode
              ? "Voir les places, statuts et passagers"
              : "Retrouver les trajets confirmes"}
          </span>
        </button>
      </div>

      <div className="screen-panel">
        <div className="section-heading">
          <div>
            <h3>{isDriverMode ? "Annonces driver" : "Trajets disponibles"}</h3>
            <p>
              {isDriverMode
                ? "Tes prochains departs et les reservations liees."
                : "Des departs verifies autour du campus, tries pour aujourd'hui."}
            </p>
          </div>

          <button
            className="text-link"
            type="button"
            onClick={() => navigate(isDriverMode ? "my-trips" : "search")}
          >
            Voir tout
          </button>
        </div>

        {!isDriverMode && !featuredTrips.length ? (
          <div className="message-box">
            <strong>Aucun trajet disponible pour le moment</strong>
            <p>Publie une annonce ou reviens plus tard pour voir de nouvelles offres.</p>
          </div>
        ) : null}

            {isDriverMode && !featuredPublishedTrips.length ? (
          <div className="message-box">
            <strong>Aucune annonce driver</strong>
            <p>Publie ton premier trajet pour recevoir des demandes passagers.</p>
          </div>
        ) : null}

        {!isDriverMode ? (
          <div className="stack-list stack-list--featured">
            {featuredTrips.map((trip) => (
              <TrajetCard
                ctaLabel="Voir le detail"
                key={trip.id}
                trip={trip}
                onClick={() => onTripSelect(trip.id)}
                onViewDriver={onViewDriver}
              />
            ))}
          </div>
        ) : (
          <div className="stack-list stack-list--featured">
            {featuredPublishedTrips.map((trip) => (
              <article className="list-card list-card--trip" key={trip.id}>
                <div className="list-card__row">
                  <div>
                    <h4>{trip.route}</h4>
                    <p>{trip.time}</p>
                  </div>
                  <span className={getStatusPillClass(trip.status)}>
                    {trip.status}
                  </span>
                </div>
                <div className="trip-card__meta">
                  <span className="meta-chip">
                    <Icon name="seat" size={14} />
                    {trip.seats} places
                  </span>
                  <span className="meta-chip">
                    <Icon name="ticket" size={14} />
                    {trip.price} DH
                  </span>
                </div>
                <p className="card-note">{trip.passengers}</p>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
