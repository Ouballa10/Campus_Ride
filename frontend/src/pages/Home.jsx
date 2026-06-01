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
  if (hour < 18) return "Bon après-midi";
  return "Bonsoir";
}

function getTodayDate() {
  return new Date().toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

function getCountdown(departureAt) {
  if (!departureAt) return null;
  const now = new Date();
  const dep = new Date(departureAt);
  const diffMs = dep - now;
  if (diffMs <= 0) return null;
  const diffH = Math.floor(diffMs / 3600000);
  const diffM = Math.floor((diffMs % 3600000) / 60000);
  if (diffH > 24) {
    const days = Math.floor(diffH / 24);
    return `Dans ${days}j`;
  }
  if (diffH > 0) return `Dans ${diffH}h${diffM > 0 ? diffM : ""}`;
  return `Dans ${diffM} min`;
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
  const featuredPublishedTrips = publishedTrips
    .filter((trip) => trip.status !== "Passe")
    .slice(0, 3);
  const activePublishedTrips = publishedTrips.filter(
    (trip) => trip.status === "Actif",
  ).length;
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
    (sum, trip) => sum + (trip.earningsEstimate || 0),
    0,
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
          <button
            className="home-topbar__notif"
            type="button"
            onClick={() => navigate("notifications")}
            aria-label="Notifications"
          >
            <Icon name="bell" size={20} />
            {pendingReservations > 0 && (
              <span className="home-topbar__notif-badge">{pendingReservations}</span>
            )}
          </button>
          <div
            className="home-topbar__avatar"
            onClick={() => navigate("profile")}
            role="button"
            tabIndex={0}
            aria-label="Mon profil"
          >
            {user.photo ? (
              <img src={user.photo} alt={user.name} />
            ) : (
              <span className="home-topbar__avatar-initials">
                {user.initials || "CR"}
              </span>
            )}
            <span className="home-topbar__online-dot" aria-hidden="true" />
          </div>
        </div>
      </header>

      {/* ===== GREETING CARD ===== */}
      <section className="home-greeting-card">
        <div className="home-greeting-card__content">
          <span className="home-greeting-card__date">{getTodayDate()}</span>
          <h2 className="home-greeting-card__name">{getGreeting()}, {firstName} 👋</h2>
          <p className="home-greeting-card__subtitle">
            {isDriverMode
              ? "Prêt à publier un trajet aujourd'hui ?"
              : "Trouvez votre prochain trajet facilement."}
          </p>
        </div>
      </section>

      {/* ===== HERO CARD ===== */}
      <section className="home-hero">
        <div className="home-hero__bg" aria-hidden="true">
          <div className="home-hero__orb home-hero__orb--1" />
          <div className="home-hero__orb home-hero__orb--2" />
          <div className="home-hero__orb home-hero__orb--3" />
          <div className="home-hero__shimmer" />
          <div className="home-hero__pattern" />
        </div>

        <div className="home-hero__content">
          <span className="home-hero__badge">
            <span className="home-hero__badge-dot" />
            {isDriverMode ? "Conducteur" : "Passager"}
          </span>

          <h2 className="home-hero__title">
            {isDriverMode ? (
              <>
                Gérez vos <span>trajets</span>
              </>
            ) : (
              <>
                Trouvez votre <span>trajet idéal</span>
              </>
            )}
          </h2>

          <p className="home-hero__desc">
            {isDriverMode
              ? "Publiez et suivez vos passagers en temps réel."
              : "Réservez en un clic, voyagez sereinement."}
          </p>

          <div className="home-hero__stats">
            <button
              className="home-hero__stat"
              type="button"
              onClick={() =>
                navigate(isDriverMode ? "my-trips" : "search")
              }
            >
              <strong>
                {isDriverMode ? publishedTrips.length : tripOptions.length}
              </strong>
              <span>{isDriverMode ? "Trajets" : "Offres"}</span>
            </button>
            <span className="home-hero__stat-divider" />
            <button
              className="home-hero__stat"
              type="button"
              onClick={() =>
                navigate(isDriverMode ? "my-trips" : "my-reservations")
              }
            >
              <strong>
                {isDriverMode ? passengerCount : reservations.length}
              </strong>
              <span>{isDriverMode ? "Passagers" : "Réserv."}</span>
            </button>
            <span className="home-hero__stat-divider" />
            <button
              className="home-hero__stat"
              type="button"
              onClick={() =>
                navigate(isDriverMode ? "my-trips" : "my-reservations")
              }
            >
              <strong>
                {isDriverMode ? activePublishedTrips : confirmedReservations}
              </strong>
              <span>{isDriverMode ? "Actifs" : "Confirmés"}</span>
            </button>
          </div>

          <button
            className="home-hero__cta"
            type="button"
            onClick={() => navigate(isDriverMode ? "publish" : "search")}
          >
            <Icon name={isDriverMode ? "plus" : "search"} size={18} />
            <span>
              {isDriverMode ? "Publier un trajet" : "Chercher un trajet"}
            </span>
          </button>
        </div>
      </section>

      {/* ===== QUICK ACTIONS ===== */}
      <section className="home-actions">
        <h3 className="home-actions__title">
          <span className="home-actions__title-bar" />
          Actions rapides
        </h3>
        <div className="home-actions__grid">
          <button
            className="home-action-card"
            type="button"
            onClick={() => navigate("profile")}
          >
            <div className="home-action-card__icon home-action-card__icon--accent">
              <Icon name="user" size={22} />
            </div>
            <div className="home-action-card__info">
              <strong>Mon profil</strong>
              <span>Mon compte</span>
            </div>
          </button>

          <button
            className="home-action-card"
            type="button"
            onClick={() => navigate(isDriverMode ? "publish" : "search")}
          >
            <div className="home-action-card__icon home-action-card__icon--primary">
              <Icon name={isDriverMode ? "plus" : "search"} size={22} />
            </div>
            <div className="home-action-card__info">
              <strong>{isDriverMode ? "Publier" : "Chercher"}</strong>
              <span>{isDriverMode ? "Nouveau trajet" : "Trouver un trajet"}</span>
            </div>
          </button>

          <button
            className="home-action-card"
            type="button"
            onClick={() => navigate(isDriverMode ? "my-trips" : "my-reservations")}
          >
            <div className="home-action-card__icon home-action-card__icon--secondary">
              <Icon name={isDriverMode ? "route" : "bookmark"} size={22} />
            </div>
            <div className="home-action-card__info">
              <strong>{isDriverMode ? "Annonces" : "Réservations"}</strong>
              <span>{isDriverMode ? "Gérer mes trajets" : "Mes réservations"}</span>
            </div>
          </button>

          <button
            className="home-action-card"
            type="button"
            onClick={() => navigate("notifications")}
          >
            <div className="home-action-card__icon home-action-card__icon--muted">
              <Icon name="bell" size={22} />
            </div>
            <div className="home-action-card__info">
              <strong>Alertes</strong>
              <span>Notifications</span>
            </div>
          </button>
        </div>
      </section>

      {/* ===== CONTEXTUAL BANNER ===== */}
      {isDriverMode && totalEarnings > 0 && (
        <div className="home-banner home-banner--blue card-animate">
          <div className="home-banner__icon">
            <Icon name="ticket" size={22} />
          </div>
          <div className="home-banner__body">
            <span>Revenus estimés</span>
            <strong>{totalEarnings} DH</strong>
          </div>
          <button
            className="home-banner__cta"
            type="button"
            onClick={() => navigate("my-trips")}
          >
            Voir
            <Icon name="arrow-right" size={13} />
          </button>
        </div>
      )}

      {!isDriverMode && pendingReservations > 0 && (
        <div className="home-banner home-banner--orange card-animate">
          <div className="home-banner__icon home-banner__icon--orange">
            <Icon name="clock" size={22} />
          </div>
          <div className="home-banner__body">
            <span>En attente</span>
            <strong>
              {pendingReservations} réservation
              {pendingReservations > 1 ? "s" : ""}
            </strong>
          </div>
          <button
            className="home-banner__cta home-banner__cta--orange"
            type="button"
            onClick={() => navigate("my-reservations")}
          >
            Voir
            <Icon name="arrow-right" size={13} />
          </button>
        </div>
      )}

      {/* ===== TRIPS SECTION ===== */}
      <section className="home-section">
        <div className="home-section__header">
          <div>
            <h3 className="home-section__title">
              <span className="home-section__title-bar" />
              {isDriverMode ? "Mes annonces" : "Trajets récents"}
            </h3>
            <p className="home-section__subtitle">
              {isDriverMode
                ? "Tes prochains départs"
                : "Publiés récemment près du campus"}
            </p>
          </div>
          <button
            className="home-section__see-all"
            type="button"
            onClick={() => navigate(isDriverMode ? "my-trips" : "search")}
          >
            Tout voir
            <Icon name="arrow-right" size={14} />
          </button>
        </div>

        {/* Empty states */}
        {!isDriverMode && !featuredTrips.length && (
          <div className="home-empty">
            <div className="home-empty__icon">
              <Icon name="car" size={40} />
            </div>
            <strong>Aucun trajet disponible</strong>
            <p>Les conducteurs n'ont pas encore publié.</p>
          </div>
        )}

        {isDriverMode && !featuredPublishedTrips.length && (
          <div className="home-empty">
            <div className="home-empty__icon">
              <Icon name="route" size={40} />
            </div>
            <strong>Aucune annonce</strong>
            <p>Publie ton premier trajet pour commencer.</p>
            <button
              className="home-empty__cta"
              type="button"
              onClick={() => navigate("publish")}
            >
              <Icon name="plus" size={16} />
              Publier
            </button>
          </div>
        )}

        {/* Trip cards - Passenger mode */}
        {!isDriverMode && featuredTrips.length > 0 && (
          <div className="home-trips-list">
            {featuredTrips.map((trip, index) => (
              <div
                className="card-animate"
                key={trip.id}
                style={{ animationDelay: `${index * 0.08}s` }}
              >
                <TrajetCard
                  ctaLabel="Réserver"
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
            {featuredPublishedTrips.map((trip, index) => {
              const countdown = getCountdown(trip.departureAt);
              return (
                <article
                  className="home-driver-card card-animate"
                  key={trip.id}
                  style={{ animationDelay: `${index * 0.08}s` }}
                >
                  <div
                    className="home-driver-card__accent"
                    data-status={trip.status?.toLowerCase()}
                  />
                  <div className="home-driver-card__top">
                    <div className="home-driver-card__route">
                      <div className="home-driver-card__route-icon">
                        <Icon name="route" size={16} />
                      </div>
                      <h4>{trip.route}</h4>
                    </div>
                    <span className={getStatusPillClass(trip.status)}>
                      {trip.status}
                    </span>
                  </div>

                  <div className="home-driver-card__meta">
                    {countdown && (
                      <span className="home-driver-card__tag home-driver-card__tag--live">
                        {countdown}
                      </span>
                    )}
                    <span className="home-driver-card__tag">
                      <Icon name="clock" size={13} />
                      {trip.time}
                    </span>
                    <span className="home-driver-card__tag">
                      <Icon name="seat" size={13} />
                      {trip.seats} places
                    </span>
                    <span className="home-driver-card__tag home-driver-card__tag--price">
                      {trip.price} DH
                    </span>
                  </div>

                  <div className="home-driver-card__bottom">
                    <span className="home-driver-card__passengers">
                      <Icon name="user" size={14} />
                      {trip.passengers} passager
                      {(trip.passengers || 0) > 1 ? "s" : ""}
                    </span>
                    <button
                      className="home-driver-card__btn"
                      type="button"
                      onClick={() => navigate("my-trips")}
                    >
                      Gérer
                      <Icon name="arrow-right" size={13} />
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
