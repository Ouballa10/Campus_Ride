import React from "react";
import logo from "../assets/images/logo.png";
import AppMenu from "../components/AppMenu";
import { Icon } from "../components/Icons";
import TrajetCard from "../components/TrajetCard";
import { getStatusPillClass } from "../utils/statusUi";
import "./Home.css";

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Bonjour";
  if (hour < 18) return "Bon apres-midi";
  return "Bonsoir";
}

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
  const pendingReservations = reservations.filter(
    (reservation) => reservation.status === "En attente",
  ).length;
  const passengerCount = publishedTrips.reduce(
    (total, trip) =>
      total +
      (trip.passengerReservations || []).filter(
        (reservation) => reservation.status !== "Annulee",
      ).length,
    0,
  );
  const totalEarnings = publishedTrips.reduce(
    (sum, trip) => sum + (trip.earningsEstimate || 0), 0,
  );
  const firstName = user.name?.split(" ")[0] || "CampusRider";

  const menuContextForHeader = {
    mode,
    navigate,
    onModeChange,
    onThemeChange,
    theme,
    user,
  };

  return (
    <div className="screen screen--home page-enter">
      {/* ===== TOP HEADER ===== */}
      <header className="home-topbar">
        <div className="home-topbar__left">
          <AppMenu {...menuContextForHeader} />
        </div>
        <div className="home-topbar__center">
          <img src={logo} alt="CampusRide" className="home-topbar__logo" />
        </div>
        <div className="home-topbar__right">
          <div className="home-topbar__avatar" onClick={() => navigate("profile")} role="button" tabIndex={0} aria-label="Mon profil">
            {user.photo ? (
              <img src={user.photo} alt={user.name} />
            ) : (
              <span>{user.initials || "CR"}</span>
            )}
          </div>
        </div>
      </header>

      {/* ===== GREETING ===== */}
      <div className="home-greeting-bar">
        <span>{getGreeting()}, {firstName} 👋</span>
      </div>

      {/* ===== HERO CARD ===== */}
      <section className="home-hero-v2">
        {/* Animated background elements */}
        <div className="home-hero-v2__shimmer" aria-hidden="true" />
        <div className="home-hero-v2__orb home-hero-v2__orb--1" aria-hidden="true" />
        <div className="home-hero-v2__orb home-hero-v2__orb--2" aria-hidden="true" />
        <div className="home-hero-v2__grid-pattern" aria-hidden="true" />

        <div className="home-hero-v2__content">
          <div className="home-hero-v2__top-row">
            <span className="home-hero-v2__badge">
              <span className="home-hero-v2__badge-dot" />
              {isDriverMode ? "Conducteur" : "Passager"}
            </span>
          </div>

          <h2 className="home-hero-v2__title">
            {isDriverMode
              ? <>Gerez vos<br /><span>trajets</span></>
              : <>Trouvez votre<br /><span>trajet ideal</span></>}
          </h2>

          <p className="home-hero-v2__desc">
            {isDriverMode
              ? "Publiez, confirmez et suivez vos passagers en temps reel."
              : "Reservez en un clic, voyagez en toute serenite."}
          </p>

          {/* Stats */}
          <div className="home-hero-v2__stats">
            <button className="home-stat-pill" type="button" onClick={() => navigate(isDriverMode ? "my-trips" : "search")}>
              <strong>{isDriverMode ? publishedTrips.length : tripOptions.length}</strong>
              <span>{isDriverMode ? "Trajets" : "Offres"}</span>
            </button>
            <button className="home-stat-pill" type="button" onClick={() => navigate(isDriverMode ? "my-trips" : "my-reservations")}>
              <strong>{isDriverMode ? passengerCount : reservations.length}</strong>
              <span>{isDriverMode ? "Passagers" : "Reserv."}</span>
            </button>
            <button className="home-stat-pill" type="button" onClick={() => navigate(isDriverMode ? "my-trips" : "my-reservations")}>
              <strong>{isDriverMode ? activePublishedTrips : confirmedReservations}</strong>
              <span>{isDriverMode ? "Actifs" : "Confirm."}</span>
            </button>
          </div>
        </div>
      </section>

      {/* ===== QUICK ACTIONS GRID ===== */}
      <div className="home-actions-grid">
        <button
          className="home-qaction home-qaction--find"
          type="button"
          onClick={() => navigate(isDriverMode ? "publish" : "search")}
        >
          <div className="home-qaction__icon-wrap">
            <Icon name={isDriverMode ? "plus" : "search"} size={22} />
          </div>
          <strong>{isDriverMode ? "Publier" : "Chercher"}</strong>
          <span>{isDriverMode ? "Nouveau trajet" : "Un trajet"}</span>
        </button>

        <button
          className="home-qaction home-qaction--trips"
          type="button"
          onClick={() => navigate(isDriverMode ? "my-trips" : "my-reservations")}
        >
          <div className="home-qaction__icon-wrap">
            <Icon name={isDriverMode ? "route" : "bookmark"} size={22} />
          </div>
          <strong>{isDriverMode ? "Annonces" : "Reserv."}</strong>
          <span>{isDriverMode ? "Mes trajets" : "Mes trajets"}</span>
        </button>

        <button
          className="home-qaction home-qaction--profile"
          type="button"
          onClick={() => navigate("profile")}
        >
          <div className="home-qaction__icon-wrap">
            <Icon name="user" size={22} />
          </div>
          <strong>Profil</strong>
          <span>Mon compte</span>
        </button>

        <button
          className="home-qaction home-qaction--notif"
          type="button"
          onClick={() => navigate("notifications")}
        >
          <div className="home-qaction__icon-wrap">
            <Icon name="bell" size={22} />
          </div>
          <strong>Alertes</strong>
          <span>Notifications</span>
        </button>
      </div>

      {/* ===== CONTEXTUAL BANNER ===== */}
      {isDriverMode && totalEarnings > 0 && (
        <div className="home-banner home-banner--earnings card-animate">
          <div className="home-banner__icon">
            <Icon name="ticket" size={20} />
          </div>
          <div className="home-banner__body">
            <span>Revenus estimes</span>
            <strong>{totalEarnings} DH</strong>
          </div>
          <button className="home-banner__cta" type="button" onClick={() => navigate("my-trips")}>
            Voir <Icon name="arrow-right" size={12} />
          </button>
        </div>
      )}

      {!isDriverMode && pendingReservations > 0 && (
        <div className="home-banner home-banner--pending card-animate">
          <div className="home-banner__icon home-banner__icon--warning">
            <Icon name="clock" size={20} />
          </div>
          <div className="home-banner__body">
            <span>En attente</span>
            <strong>{pendingReservations} reservation{pendingReservations > 1 ? "s" : ""}</strong>
          </div>
          <button className="home-banner__cta home-banner__cta--warning" type="button" onClick={() => navigate("my-reservations")}>
            Voir <Icon name="arrow-right" size={12} />
          </button>
        </div>
      )}

      {/* ===== TRIPS SECTION ===== */}
      <section className="home-section">
        <div className="home-section__header">
          <div>
            <h3 className="home-section__title">
              {isDriverMode ? "Mes annonces" : "Trajets recents"}
            </h3>
            <p className="home-section__subtitle">
              {isDriverMode
                ? "Tes prochains departs"
                : "Publies recemment pres du campus"}
            </p>
          </div>
          <button
            className="home-section__link"
            type="button"
            onClick={() => navigate(isDriverMode ? "my-trips" : "search")}
          >
            Tout
            <Icon name="arrow-right" size={13} />
          </button>
        </div>

        {/* Empty states */}
        {!isDriverMode && !featuredTrips.length && (
          <div className="home-empty">
            <div className="home-empty__visual">
              <Icon name="car" size={32} />
            </div>
            <strong>Aucun trajet disponible</strong>
            <p>Les conducteurs n'ont pas encore publie. Reviens bientot.</p>
          </div>
        )}

        {isDriverMode && !featuredPublishedTrips.length && (
          <div className="home-empty">
            <div className="home-empty__visual">
              <Icon name="route" size={32} />
            </div>
            <strong>Aucune annonce</strong>
            <p>Publie ton premier trajet pour commencer.</p>
            <button className="home-empty__cta" type="button" onClick={() => navigate("publish")}>
              <Icon name="plus" size={15} />
              Publier
            </button>
          </div>
        )}

        {/* Trip cards - Passenger mode */}
        {!isDriverMode && featuredTrips.length > 0 && (
          <div className="home-trips-list">
            {featuredTrips.map((trip, index) => (
              <div className="card-animate" key={trip.id} style={{ animationDelay: `${index * 0.1}s` }}>
                <TrajetCard
                  ctaLabel="Reserver"
                  trip={trip}
                  onClick={() => onTripSelect(trip.id)}
                  onViewDriver={onViewDriver}
                />
              </div>
            ))}
          </div>
        )}

        {/* Trip cards - Driver mode */}
        {isDriverMode && featuredPublishedTrips.length > 0 && (
          <div className="home-trips-list">
            {featuredPublishedTrips.map((trip, index) => (
              <article className="home-driver-card card-animate" key={trip.id} style={{ animationDelay: `${index * 0.1}s` }}>
                <div className="home-driver-card__top">
                  <div className="home-driver-card__route">
                    <div className="home-driver-card__route-icon">
                      <Icon name="route" size={14} />
                    </div>
                    <h4>{trip.route}</h4>
                  </div>
                  <span className={getStatusPillClass(trip.status)}>
                    {trip.status}
                  </span>
                </div>

                <div className="home-driver-card__details">
                  <div className="home-driver-card__chip">
                    <Icon name="clock" size={12} />
                    {trip.time}
                  </div>
                  <div className="home-driver-card__chip">
                    <Icon name="seat" size={12} />
                    {trip.seats}
                  </div>
                  <div className="home-driver-card__chip home-driver-card__chip--price">
                    {trip.price} DH
                  </div>
                </div>

                <div className="home-driver-card__footer">
                  <span className="home-driver-card__passengers">
                    <Icon name="user" size={13} />
                    {trip.passengers}
                  </span>
                  <button
                    className="home-driver-card__cta"
                    type="button"
                    onClick={() => navigate("my-trips")}
                  >
                    Gerer
                    <Icon name="arrow-right" size={12} />
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
