import React, { useEffect, useState } from "react";
import logo from "../assets/images/logo.png";
import AppMenu from "../components/AppMenu";
import { Icon } from "../components/Icons";
import TrajetCard from "../components/TrajetCard";
import { getStatusPillClass } from "../utils/statusUi";
import "./Home.css";

function AnimatedCounter({ value, label, icon, delay = 0 }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <div className={`dh-stat-card ${visible ? "dh-stat-card--visible" : ""}`}>
      <div className="dh-stat-card__icon">
        <Icon name={icon} size={18} />
      </div>
      <div className="dh-stat-card__value">{value}</div>
      <div className="dh-stat-card__label">{label}</div>
    </div>
  );
}

function DriverTripCard({ trip, index }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 100 + index * 80);
    return () => clearTimeout(timer);
  }, [index]);

  return (
    <article className={`dh-trip-card ${visible ? "dh-trip-card--visible" : ""}`}>
      <div className="dh-trip-card__header">
        <div className="dh-trip-card__route">
          <div className="dh-trip-card__route-dots">
            <span className="dh-dot dh-dot--origin" />
            <span className="dh-dot-line" />
            <span className="dh-dot dh-dot--dest" />
          </div>
          <div className="dh-trip-card__route-info">
            <h4 className="dh-trip-card__title">{trip.route}</h4>
            <p className="dh-trip-card__datetime">
              <Icon name="calendar" size={13} />
              {trip.date} &middot; {trip.time}
            </p>
          </div>
        </div>
        <span className={`dh-status-badge ${getStatusPillClass(trip.status)}`}>
          {trip.status}
        </span>
      </div>

      <div className="dh-trip-card__details">
        <div className="dh-trip-card__chip">
          <Icon name="seat" size={14} />
          <span>{trip.seats} places</span>
        </div>
        <div className="dh-trip-card__chip">
          <Icon name="ticket" size={14} />
          <span>{trip.price} DH</span>
        </div>
      </div>

      <div className="dh-trip-card__footer">
        <div className="dh-trip-card__passengers">
          <Icon name="user" size={13} />
          <span>{trip.passengers}</span>
        </div>
      </div>
    </article>
  );
}

export default function Home({
  mode,
  navigate,
  onModeChange,
  onThemeChange,
  onTripSelect,
  publishedTrips = [],
  reservations = [],
  theme,
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

  const [heroVisible, setHeroVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setHeroVisible(true), 50);
    return () => clearTimeout(timer);
  }, []);

  const greeting = (() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Bonjour";
    if (hour < 18) return "Bon apres-midi";
    return "Bonsoir";
  })();

  return (
    <div className="dh-screen">
      {/* Top Bar */}
      <header className="dh-topbar">
        <AppMenu
          mode={mode}
          navigate={navigate}
          user={user}
          onModeChange={onModeChange}
          onThemeChange={onThemeChange}
          theme={theme}
        />
        <div className="dh-topbar__center">
          <img alt="CampusRide" className="dh-topbar__logo" src={logo} />
        </div>
        <button
          className="dh-topbar__notif"
          type="button"
          onClick={() => navigate("notifications")}
          aria-label="Notifications"
        >
          <Icon name="bell" size={20} />
        </button>
      </header>

      {/* Hero Section */}
      <section className={`dh-hero ${heroVisible ? "dh-hero--visible" : ""}`}>
        <div className="dh-hero__greeting">
          <h1 className="dh-hero__title">
            {greeting}, <span className="dh-hero__name">{user.name?.split(" ")[0]}</span>
          </h1>
          <p className="dh-hero__subtitle">
            {isDriverMode
              ? "Gerez vos trajets et passagers"
              : "Trouvez votre prochain trajet"}
          </p>
        </div>

        <div className="dh-hero__mode-pill">
          <span className="dh-hero__mode-icon">
            <Icon name={isDriverMode ? "car" : "user"} size={14} />
          </span>
          <span className="dh-hero__mode-text">
            {isDriverMode ? "Driver" : "Passager"}
          </span>
        </div>
      </section>

      {/* Stats Grid */}
      <section className="dh-stats">
        {isDriverMode ? (
          <>
            <AnimatedCounter
              value={publishedTrips.length}
              label="Annonces"
              icon="route"
              delay={100}
            />
            <AnimatedCounter
              value={activePublishedTrips}
              label="Actifs"
              icon="check-badge"
              delay={200}
            />
            <AnimatedCounter
              value={passengerCount}
              label="Passagers"
              icon="user"
              delay={300}
            />
          </>
        ) : (
          <>
            <AnimatedCounter
              value={tripOptions.length}
              label="Disponibles"
              icon="route"
              delay={100}
            />
            <AnimatedCounter
              value={reservations.length}
              label="Reservations"
              icon="bookmark"
              delay={200}
            />
            <AnimatedCounter
              value={confirmedReservations}
              label="Confirmees"
              icon="check-badge"
              delay={300}
            />
          </>
        )}
      </section>

      {/* Quick Search / CTA */}
      <button
        className="dh-search-bar"
        type="button"
        onClick={() => navigate(isDriverMode ? "my-trips" : "search")}
      >
        <span className="dh-search-bar__icon">
          <Icon name={isDriverMode ? "route" : "search"} size={18} />
        </span>
        <span className="dh-search-bar__text">
          {isDriverMode
            ? "Voir mes annonces et passagers..."
            : "Rechercher un trajet..."}
        </span>
        <span className="dh-search-bar__arrow">
          <Icon name="chevron-right" size={16} />
        </span>
      </button>

      {/* Action Cards */}
      <section className="dh-actions">
        <button
          className="dh-action-card dh-action-card--primary"
          type="button"
          onClick={() => navigate(isDriverMode ? "publish" : "search")}
        >
          <div className="dh-action-card__icon-wrap">
            <Icon name={isDriverMode ? "plus" : "search"} size={22} />
          </div>
          <div className="dh-action-card__content">
            <strong className="dh-action-card__title">
              {isDriverMode ? "Publier un trajet" : "Rechercher"}
            </strong>
            <span className="dh-action-card__desc">
              {isDriverMode
                ? "Creer une nouvelle annonce"
                : "Trouver un conducteur"}
            </span>
          </div>
          <span className="dh-action-card__chevron">
            <Icon name="chevron-right" size={16} />
          </span>
        </button>

        <button
          className="dh-action-card dh-action-card--secondary"
          type="button"
          onClick={() => navigate(isDriverMode ? "my-trips" : "my-reservations")}
        >
          <div className="dh-action-card__icon-wrap">
            <Icon name={isDriverMode ? "route" : "bookmark"} size={22} />
          </div>
          <div className="dh-action-card__content">
            <strong className="dh-action-card__title">
              {isDriverMode ? "Mes annonces" : "Mes reservations"}
            </strong>
            <span className="dh-action-card__desc">
              {isDriverMode
                ? "Places, statuts et passagers"
                : "Trajets confirmes"}
            </span>
          </div>
          <span className="dh-action-card__chevron">
            <Icon name="chevron-right" size={16} />
          </span>
        </button>
      </section>

      {/* Trips Section */}
      <section className="dh-section">
        <div className="dh-section__header">
          <div>
            <h2 className="dh-section__title">
              {isDriverMode ? "Vos annonces" : "Trajets disponibles"}
            </h2>
            <p className="dh-section__subtitle">
              {isDriverMode
                ? "Prochains departs et reservations"
                : "Departs verifies autour du campus"}
            </p>
          </div>
          <button
            className="dh-section__link"
            type="button"
            onClick={() => navigate(isDriverMode ? "my-trips" : "search")}
          >
            Tout voir
            <Icon name="chevron-right" size={14} />
          </button>
        </div>

        {/* Empty states */}
        {!isDriverMode && !featuredTrips.length && (
          <div className="dh-empty">
            <div className="dh-empty__icon">
              <Icon name="route" size={32} />
            </div>
            <strong className="dh-empty__title">Aucun trajet disponible</strong>
            <p className="dh-empty__text">
              Publie une annonce ou reviens plus tard pour de nouvelles offres.
            </p>
          </div>
        )}

        {isDriverMode && !featuredPublishedTrips.length && (
          <div className="dh-empty">
            <div className="dh-empty__icon">
              <Icon name="car" size={32} />
            </div>
            <strong className="dh-empty__title">Aucune annonce</strong>
            <p className="dh-empty__text">
              Publiez votre premier trajet pour recevoir des demandes.
            </p>
            <button
              className="dh-empty__cta"
              type="button"
              onClick={() => navigate("publish")}
            >
              <Icon name="plus" size={16} />
              Publier maintenant
            </button>
          </div>
        )}

        {/* Driver trip cards */}
        {isDriverMode && featuredPublishedTrips.length > 0 && (
          <div className="dh-trip-list">
            {featuredPublishedTrips.map((trip, index) => (
              <DriverTripCard key={trip.id} trip={trip} index={index} />
            ))}
          </div>
        )}

        {/* Passenger trip cards */}
        {!isDriverMode && featuredTrips.length > 0 && (
          <div className="dh-trip-list">
            {featuredTrips.map((trip) => (
              <TrajetCard
                ctaLabel="Voir le detail"
                key={trip.id}
                trip={trip}
                onClick={() => onTripSelect(trip.id)}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
