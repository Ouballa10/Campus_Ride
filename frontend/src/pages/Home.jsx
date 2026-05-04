import React from "react";
import logo from "../assets/images/logo.png";
import { RideArtwork } from "../components/Artwork";
import AppHeader from "../components/AppHeader";
import { Icon } from "../components/Icons";
import ModeSwitch from "../components/ModeSwitch";
import TrajetCard from "../components/TrajetCard";
import { getStatusPillClass } from "../utils/statusUi";

export default function Home({
  mode,
  navigate,
  onModeChange,
  onTripSelect,
  publishedTrips = [],
  reservations = [],
  tripOptions,
  user,
}) {
  const isDriverMode = mode === "driver";
  const featuredTrips = tripOptions.slice(0, 3);
  const featuredPublishedTrips = publishedTrips.slice(0, 3);
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
        subtitle={`${user.name} - mode ${isDriverMode ? "driver" : "passager"}`}
        leftIcon="menu"
        onLeftClick={() => navigate("profile")}
      />

      <ModeSwitch mode={mode} onChange={onModeChange} />

      <section className="home-hero-card">
        <div className="home-hero-card__copy">
          <div className="home-brand-row">
            <img alt="CampusRide logo" className="home-brand-row__logo" src={logo} />
            <div>
              <span className="eyebrow">CampusRide</span>
              <h2>
                {isDriverMode
                  ? "Espace driver pour publier et suivre tes passagers"
                  : "Reserve un trajet campus simple, rapide et confirme"}
              </h2>
            </div>
          </div>

          <p>
            {isDriverMode
              ? "Gere tes annonces, les places restantes et les passagers confirmes depuis le meme tableau de bord."
              : "Compare les conducteurs disponibles, confirme ta place et garde ton trajet dans tes reservations."}
          </p>

          <div className="home-hero-card__stats">
            <div>
              <strong>{isDriverMode ? publishedTrips.length : tripOptions.length}</strong>
              <span>{isDriverMode ? "annonces" : "trajets ouverts"}</span>
            </div>
            <div>
              <strong>{isDriverMode ? activePublishedTrips : reservations.length}</strong>
              <span>{isDriverMode ? "actifs" : "reservations"}</span>
            </div>
            <div>
              <strong>{isDriverMode ? passengerCount : confirmedReservations}</strong>
              <span>{isDriverMode ? "passagers" : "confirmees"}</span>
            </div>
          </div>
        </div>

        <RideArtwork />
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
                    <p>{trip.date} - {trip.time}</p>
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
