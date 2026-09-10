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
  demandes = [],
  navigate,
  onThemeChange,
  onTripSelect,
  onViewDriver,
  publishedTrips = [],
  reservations = [],
  theme,
  tripOptions,
  user,
}) {
  const featuredTrips = tripOptions.slice(0, 3);
  const featuredPublishedTrips = publishedTrips
    .filter((trip) => trip.status !== "Passe")
    .slice(0, 3);

  const activePublishedTrips = publishedTrips.filter((t) => t.status === "Actif").length;
  const pendingPassengerRequests = publishedTrips.reduce(
    (sum, trip) =>
      sum + (trip.passengerReservations || []).filter((r) => r.status === "En attente").length,
    0,
  );
  const passengerCount = publishedTrips.reduce(
    (total, trip) =>
      total +
      (trip.passengerReservations || []).filter((r) => r.status !== "Annulee").length,
    0,
  );
  const totalEarnings = publishedTrips.reduce((sum, trip) => sum + (trip.earningsEstimate || 0), 0);

  const confirmedReservations = reservations.filter((r) => r.status === "Confirmee").length;
  const pendingReservations = reservations.filter((r) => r.status === "En attente").length;

  const totalNotifBadge = pendingPassengerRequests + pendingReservations;
  const firstName = user.name?.split(" ")[0] || "CampusRider";

  const menuContextForHeader = { navigate, onThemeChange, theme, user };

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
            {totalNotifBadge > 0 && (
              <span className="home-topbar__notif-badge">{totalNotifBadge}</span>
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
              <span className="home-topbar__avatar-initials">{user.initials || "CR"}</span>
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
            Publie un trajet ou réserve une place — tout en un.
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
            CampusRide
          </span>

          <h2 className="home-hero__title">
            Vos <span>trajets</span> campus
          </h2>

          <p className="home-hero__desc">
            Publiez, réservez et voyagez avec vos camarades.
          </p>

          {/* Stats row — driver side */}
          <div className="home-hero__stats">
            <button
              className="home-hero__stat"
              type="button"
              onClick={() => navigate("my-trips")}
            >
              <strong>{publishedTrips.length}</strong>
              <span>Annonces</span>
            </button>
            <span className="home-hero__stat-divider" />
            <button
              className="home-hero__stat"
              type="button"
              onClick={() => navigate("my-trips")}
            >
              <strong>{passengerCount}</strong>
              <span>Passagers</span>
            </button>
            <span className="home-hero__stat-divider" />
            <button
              className="home-hero__stat"
              type="button"
              onClick={() => navigate("my-reservations")}
            >
              <strong>{reservations.length}</strong>
              <span>Réserv.</span>
            </button>
          </div>

          {/* Dual CTA */}
          <div className="home-hero__cta-row">
            <button
              className="home-hero__cta home-hero__cta--primary"
              type="button"
              onClick={() => navigate("publish")}
            >
              <Icon name="plus" size={18} />
              <span>Publier</span>
            </button>
            <button
              className="home-hero__cta home-hero__cta--secondary"
              type="button"
              onClick={() => navigate("search")}
            >
              <Icon name="search" size={18} />
              <span>Chercher</span>
            </button>
            <button
              className="home-hero__cta home-hero__cta--orange"
              type="button"
              onClick={() => navigate("publish-demande")}
            >
              <Icon name="bookmark" size={18} />
              <span>Demander</span>
            </button>
          </div>
        </div>
      </section>

      {/* ===== QUICK ACTIONS ===== */}
      <section className="home-actions">
        <h3 className="home-actions__title">
          <span className="home-actions__title-bar" />
          Actions rapides
        </h3>
        <div className="home-actions__grid">
          <button className="home-action-card" type="button" onClick={() => navigate("publish")}>
            <div className="home-action-card__icon home-action-card__icon--primary">
              <Icon name="plus" size={22} />
            </div>
            <div className="home-action-card__info">
              <strong>Publier</strong>
              <span>Nouveau trajet</span>
            </div>
          </button>

          <button className="home-action-card" type="button" onClick={() => navigate("search")}>
            <div className="home-action-card__icon home-action-card__icon--accent">
              <Icon name="search" size={22} />
            </div>
            <div className="home-action-card__info">
              <strong>Chercher</strong>
              <span>Trouver un trajet</span>
            </div>
          </button>

          <button className="home-action-card" type="button" onClick={() => navigate("my-trips")}>
            <div className="home-action-card__icon home-action-card__icon--secondary">
              <Icon name="route" size={22} />
            </div>
            <div className="home-action-card__info">
              <strong>Mes trajets</strong>
              <span>Gérer mes annonces</span>
            </div>
          </button>

          <button className="home-action-card" type="button" onClick={() => navigate("my-reservations")}>
            <div className="home-action-card__icon home-action-card__icon--muted">
              <Icon name="bookmark" size={22} />
            </div>
            <div className="home-action-card__info">
              <strong>Réservations</strong>
              <span>Mes réservations</span>
            </div>
          </button>

          <button className="home-action-card" type="button" onClick={() => navigate("demandes")}>
            <div className="home-action-card__icon home-action-card__icon--orange">
              <Icon name="search" size={22} />
            </div>
            <div className="home-action-card__info">
              <strong>Demandes</strong>
              <span>InDrive-style</span>
            </div>
          </button>
        </div>
      </section>

      {/* ===== BANNERS ===== */}
      {totalEarnings > 0 && (
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

      {pendingPassengerRequests > 0 && (
        <div className="home-banner home-banner--green card-animate">
          <div className="home-banner__icon">
            <Icon name="user" size={22} />
          </div>
          <div className="home-banner__body">
            <span>Demandes de passagers</span>
            <strong>
              {pendingPassengerRequests} en attente
            </strong>
          </div>
          <button
            className="home-banner__cta"
            type="button"
            onClick={() => navigate("my-trips")}
          >
            Gérer
            <Icon name="arrow-right" size={13} />
          </button>
        </div>
      )}

      {pendingReservations > 0 && (
        <div className="home-banner home-banner--orange card-animate">
          <div className="home-banner__icon home-banner__icon--orange">
            <Icon name="clock" size={22} />
          </div>
          <div className="home-banner__body">
            <span>En attente</span>
            <strong>
              {pendingReservations} réservation{pendingReservations > 1 ? "s" : ""}
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

      {/* ===== DRIVER SECTION — Mes annonces ===== */}
      <section className="home-section">
        <div className="home-section__header">
          <div>
            <h3 className="home-section__title">
              <span className="home-section__title-bar" />
              Mes annonces
            </h3>
            <p className="home-section__subtitle">
              {activePublishedTrips > 0
                ? `${activePublishedTrips} trajet${activePublishedTrips > 1 ? "s" : ""} actif${activePublishedTrips > 1 ? "s" : ""}`
                : "Tes prochains départs"}
            </p>
          </div>
          <button
            className="home-section__see-all"
            type="button"
            onClick={() => navigate("my-trips")}
          >
            Tout voir
            <Icon name="arrow-right" size={14} />
          </button>
        </div>

        {featuredPublishedTrips.length === 0 ? (
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
        ) : (
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
                      {trip.passengers} passager{(trip.passengers || 0) > 1 ? "s" : ""}
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

      {/* ===== PASSENGER SECTION — Trajets récents ===== */}
      <section className="home-section">
        <div className="home-section__header">
          <div>
            <h3 className="home-section__title">
              <span className="home-section__title-bar" />
              Trajets récents
            </h3>
            <p className="home-section__subtitle">Publiés récemment près du campus</p>
          </div>
          <button
            className="home-section__see-all"
            type="button"
            onClick={() => navigate("search")}
          >
            Tout voir
            <Icon name="arrow-right" size={14} />
          </button>
        </div>

        {featuredTrips.length === 0 ? (
          <div className="home-empty">
            <div className="home-empty__icon">
              <Icon name="car" size={40} />
            </div>
            <strong>Aucun trajet disponible</strong>
            <p>Les conducteurs n'ont pas encore publié.</p>
          </div>
        ) : (
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
      </section>

      {/* ===== MY RESERVATIONS SECTION ===== */}
      {reservations.length > 0 && (
        <section className="home-section">
          <div className="home-section__header">
            <div>
              <h3 className="home-section__title">
                <span className="home-section__title-bar" />
                Mes réservations
              </h3>
              <p className="home-section__subtitle">
                {confirmedReservations > 0
                  ? `${confirmedReservations} confirmée${confirmedReservations > 1 ? "s" : ""}`
                  : "En cours de traitement"}
              </p>
            </div>
            <button
              className="home-section__see-all"
              type="button"
              onClick={() => navigate("my-reservations")}
            >
              Tout voir
              <Icon name="arrow-right" size={14} />
            </button>
          </div>
          <div className="home-trips-list">
            {reservations.slice(0, 2).map((r, index) => {
              const statusColor =
                r.status === "Confirmee" ? "#059669" :
                r.status === "En attente" ? "#d97706" : "#dc2626";
              const statusIcon =
                r.status === "Confirmee" ? "✅" :
                r.status === "En attente" ? "🕐" : "❌";
              return (
                <div
                  className="home-res-card card-animate"
                  key={r.id}
                  style={{ animationDelay: `${index * 0.08}s`, borderLeftColor: statusColor }}
                  onClick={() => navigate("my-reservations")}
                  role="button"
                  tabIndex={0}
                >
                  <div className="home-res-card__route">
                    <strong>{r.depart}</strong>
                    <Icon name="arrow-right" size={12} />
                    <strong>{r.destination}</strong>
                  </div>
                  <div className="home-res-card__meta">
                    <span>{statusIcon} {r.status}</span>
                    <span>🕐 {r.time}</span>
                    <span>💰 {r.price} DH</span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}
      {/* ===== DEMANDES PASSAGERS SECTION (pour conducteurs) ===== */}
      <section className="home-section">
        <div className="home-section__header">
          <div>
            <h3 className="home-section__title">
              <span className="home-section__title-bar home-section__title-bar--orange" />
              Demandes passagers
            </h3>
            <p className="home-section__subtitle">
              {demandes.length > 0
                ? `${demandes.length} demande${demandes.length > 1 ? "s" : ""} ouverte${demandes.length > 1 ? "s" : ""}`
                : "Aucune demande pour l'instant"}
            </p>
          </div>
          <button
            className="home-section__see-all"
            type="button"
            onClick={() => navigate("demandes")}
          >
            Tout voir
            <Icon name="arrow-right" size={14} />
          </button>
        </div>

        {demandes.length === 0 ? (
          <div className="home-empty">
            <div className="home-empty__icon">
              <Icon name="search" size={36} />
            </div>
            <strong>Aucune demande ouverte</strong>
            <p>Les passagers publieront leurs demandes ici.</p>
          </div>
        ) : (
          <div className="home-trips-list">
            {demandes.slice(0, 3).map((d, index) => (
              <div
                className="home-demande-card card-animate"
                key={d.id}
                style={{ animationDelay: `${index * 0.08}s` }}
                onClick={() => navigate("demandes")}
                role="button"
                tabIndex={0}
              >
                {/* Avatar passager */}
                <div className="home-demande-card__passager">
                  <div className="home-demande-card__avatar">
                    {d.passagerAvatar
                      ? <img src={d.passagerAvatar} alt={d.passagerName} />
                      : <span>{d.passagerInitials || "P"}</span>
                    }
                  </div>
                  <div className="home-demande-card__passager-info">
                    <strong>{d.passagerName}</strong>
                    <small>{d.passagerCampus || "Campus"}</small>
                  </div>
                  <div className="home-demande-card__price">
                    <strong>{d.prixPropose} DH</strong>
                    <small>proposés</small>
                  </div>
                </div>

                {/* Route */}
                <div className="home-demande-card__route">
                  <span className="home-demande-card__dot home-demande-card__dot--start" />
                  <div className="home-demande-card__route-names">
                    <span>{d.depart}</span>
                    <span className="home-demande-card__arrow">→</span>
                    <span>{d.destination}</span>
                  </div>
                </div>

                {/* Meta */}
                <div className="home-demande-card__meta">
                  <span><Icon name="calendar" size={12} />
                    {d.departureAt ? new Date(d.departureAt).toLocaleDateString("fr-FR", { weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }) : ""}
                  </span>
                  <span className="home-demande-card__tag">Accepter →</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

    </div>
  );
}
