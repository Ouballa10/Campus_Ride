import React from "react";
import logo from "../assets/images/logo.png";
import AppMenu from "../components/AppMenu";
import { Icon } from "../components/Icons";
import TrajetCard from "../components/TrajetCard";
import { getStatusPillClass } from "../utils/statusUi";
import "./Home.css";

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Bonjour";
  if (h < 18) return "Bon après-midi";
  return "Bonsoir";
}

function getTodayDate() {
  return new Date().toLocaleDateString("fr-FR", {
    weekday: "long", day: "numeric", month: "long",
  });
}

function getCountdown(departureAt) {
  if (!departureAt) return null;
  const diffMs = new Date(departureAt) - new Date();
  if (diffMs <= 0) return null;
  const h = Math.floor(diffMs / 3600000);
  const m = Math.floor((diffMs % 3600000) / 60000);
  if (h > 24) return `Dans ${Math.floor(h / 24)}j`;
  if (h > 0)  return `Dans ${h}h${m > 0 ? m : ""}`;
  return `Dans ${m} min`;
}

function formatDate(iso) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("fr-FR", {
    weekday: "short", day: "numeric", month: "short",
    hour: "2-digit", minute: "2-digit",
  });
}

// ── DRIVER HOME ───────────────────────────────────────────────
function DriverHome({ user, publishedTrips, demandes, navigate, onThemeChange, theme }) {
  const activeTrips     = publishedTrips.filter((t) => t.status === "Actif").length;
  const pendingRequests = publishedTrips.reduce(
    (s, t) => s + (t.passengerReservations || []).filter((r) => r.status === "En attente").length, 0,
  );
  const totalPassengers = publishedTrips.reduce(
    (s, t) => s + (t.passengerReservations || []).filter((r) => r.status !== "Annulee").length, 0,
  );
  const totalEarnings   = publishedTrips.reduce((s, t) => s + (t.earningsEstimate || 0), 0);
  const firstName       = user.name?.split(" ")[0] || "Conducteur";
  const featuredTrips   = publishedTrips.filter((t) => t.status !== "Passe").slice(0, 3);

  return (
    <div className="screen screen--home page-enter">
      {/* Topbar */}
      <header className="home-topbar">
        <div className="home-topbar__left">
          <AppMenu navigate={navigate} onThemeChange={onThemeChange} theme={theme} user={user} />
        </div>
        <div className="home-topbar__center">
          <img src={logo} alt="CampusRide" className="home-topbar__logo" />
        </div>
        <div className="home-topbar__right">
          <button className="home-topbar__notif" type="button" onClick={() => navigate("notifications")} aria-label="Notifications">
            <Icon name="bell" size={20} />
            {pendingRequests > 0 && <span className="home-topbar__notif-badge">{pendingRequests}</span>}
          </button>
          <div className="home-topbar__avatar" onClick={() => navigate("profile")} role="button" tabIndex={0} aria-label="Mon profil">
            {user.photo ? <img src={user.photo} alt={user.name} /> : <span className="home-topbar__avatar-initials">{user.initials || "CR"}</span>}
            <span className="home-topbar__online-dot" aria-hidden="true" />
          </div>
        </div>
      </header>

      {/* Greeting */}
      <section className="home-greeting-card">
        <div className="home-greeting-card__content">
          <span className="home-greeting-card__date">{getTodayDate()}</span>
          <h2 className="home-greeting-card__name">{getGreeting()}, {firstName} 🚗</h2>
          <p className="home-greeting-card__subtitle">Gérez vos trajets et acceptez des passagers.</p>
        </div>
      </section>

      {/* Hero */}
      <section className="home-hero">
        <div className="home-hero__bg" aria-hidden="true">
          <div className="home-hero__orb home-hero__orb--1" /><div className="home-hero__orb home-hero__orb--2" />
          <div className="home-hero__orb home-hero__orb--3" /><div className="home-hero__shimmer" /><div className="home-hero__pattern" />
        </div>
        <div className="home-hero__content">
          <span className="home-hero__badge"><span className="home-hero__badge-dot" />Conducteur</span>
          <h2 className="home-hero__title">Gérez vos <span>trajets</span></h2>
          <p className="home-hero__desc">Publiez, acceptez des passagers et suivez vos revenus.</p>
          <div className="home-hero__stats">
            <button className="home-hero__stat" type="button" onClick={() => navigate("my-trips")}>
              <strong>{publishedTrips.length}</strong><span>Annonces</span>
            </button>
            <span className="home-hero__stat-divider" />
            <button className="home-hero__stat" type="button" onClick={() => navigate("my-trips")}>
              <strong>{totalPassengers}</strong><span>Passagers</span>
            </button>
            <span className="home-hero__stat-divider" />
            <button className="home-hero__stat" type="button" onClick={() => navigate("demandes")}>
              <strong>{demandes.length}</strong><span>Demandes</span>
            </button>
          </div>
          <div className="home-hero__cta-row">
            <button className="home-hero__cta home-hero__cta--primary" type="button" onClick={() => navigate("publish")}>
              <Icon name="plus" size={18} /><span>Publier un trajet</span>
            </button>
            <button className="home-hero__cta home-hero__cta--secondary" type="button" onClick={() => navigate("demandes")}>
              <Icon name="bookmark" size={18} /><span>Voir demandes</span>
            </button>
          </div>
        </div>
      </section>

      {/* Banners */}
      {totalEarnings > 0 && (
        <div className="home-banner home-banner--blue card-animate">
          <div className="home-banner__icon"><Icon name="ticket" size={22} /></div>
          <div className="home-banner__body"><span>Revenus estimés</span><strong>{totalEarnings} DH</strong></div>
          <button className="home-banner__cta" type="button" onClick={() => navigate("my-trips")}>Voir <Icon name="arrow-right" size={13} /></button>
        </div>
      )}
      {pendingRequests > 0 && (
        <div className="home-banner home-banner--orange card-animate">
          <div className="home-banner__icon"><Icon name="user" size={22} /></div>
          <div className="home-banner__body"><span>Demandes passagers</span><strong>{pendingRequests} en attente</strong></div>
          <button className="home-banner__cta home-banner__cta--orange" type="button" onClick={() => navigate("my-trips")}>Gérer <Icon name="arrow-right" size={13} /></button>
        </div>
      )}

      {/* Quick actions */}
      <section className="home-actions">
        <h3 className="home-actions__title"><span className="home-actions__title-bar" />Actions rapides</h3>
        <div className="home-actions__grid">
          <button className="home-action-card" type="button" onClick={() => navigate("publish")}>
            <div className="home-action-card__icon home-action-card__icon--primary"><Icon name="plus" size={22} /></div>
            <div className="home-action-card__info"><strong>Publier</strong><span>Nouveau trajet</span></div>
          </button>
          <button className="home-action-card" type="button" onClick={() => navigate("demandes")}>
            <div className="home-action-card__icon home-action-card__icon--orange"><Icon name="bookmark" size={22} /></div>
            <div className="home-action-card__info"><strong>Demandes</strong><span>Passagers InDrive</span></div>
          </button>
          <button className="home-action-card" type="button" onClick={() => navigate("my-trips")}>
            <div className="home-action-card__icon home-action-card__icon--secondary"><Icon name="route" size={22} /></div>
            <div className="home-action-card__info"><strong>Mes trajets</strong><span>Gérer annonces</span></div>
          </button>
          <button className="home-action-card" type="button" onClick={() => navigate("profile")}>
            <div className="home-action-card__icon home-action-card__icon--accent"><Icon name="user" size={22} /></div>
            <div className="home-action-card__info"><strong>Profil</strong><span>Mon compte</span></div>
          </button>
        </div>
      </section>

      {/* Demandes passagers */}
      <section className="home-section">
        <div className="home-section__header">
          <div>
            <h3 className="home-section__title"><span className="home-section__title-bar home-section__title-bar--orange" />Demandes passagers</h3>
            <p className="home-section__subtitle">{demandes.length > 0 ? `${demandes.length} demande${demandes.length > 1 ? "s" : ""} ouverte${demandes.length > 1 ? "s" : ""}` : "Aucune demande pour l'instant"}</p>
          </div>
          <button className="home-section__see-all" type="button" onClick={() => navigate("demandes")}>Tout voir <Icon name="arrow-right" size={14} /></button>
        </div>
        {demandes.length === 0 ? (
          <div className="home-empty">
            <div className="home-empty__icon"><Icon name="search" size={36} /></div>
            <strong>Aucune demande ouverte</strong>
            <p>Les passagers publieront leurs demandes ici.</p>
          </div>
        ) : (
          <div className="home-trips-list">
            {demandes.slice(0, 3).map((d, i) => (
              <div className="home-demande-card card-animate" key={d.id} style={{ animationDelay: `${i * 0.08}s` }}
                onClick={() => navigate("demandes")} role="button" tabIndex={0}>
                <div className="home-demande-card__passager">
                  <div className="home-demande-card__avatar">
                    {d.passagerAvatar ? <img src={d.passagerAvatar} alt={d.passagerName} /> : <span>{d.passagerInitials || "P"}</span>}
                  </div>
                  <div className="home-demande-card__passager-info">
                    <strong>{d.passagerName}</strong>
                    <small>{d.passagerCampus || "Campus"}</small>
                  </div>
                  <div className="home-demande-card__price">
                    <strong>{d.prixPropose} DH</strong><small>proposés</small>
                  </div>
                </div>
                <div className="home-demande-card__route">
                  <span className="home-demande-card__dot home-demande-card__dot--start" />
                  <div className="home-demande-card__route-names">
                    <span>{d.depart}</span><span className="home-demande-card__arrow">→</span><span>{d.destination}</span>
                  </div>
                </div>
                <div className="home-demande-card__meta">
                  <span><Icon name="calendar" size={12} /> {formatDate(d.departureAt)}</span>
                  <span className="home-demande-card__tag">Accepter →</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Mes annonces */}
      <section className="home-section">
        <div className="home-section__header">
          <div>
            <h3 className="home-section__title"><span className="home-section__title-bar" />Mes annonces</h3>
            <p className="home-section__subtitle">{activeTrips > 0 ? `${activeTrips} actif${activeTrips > 1 ? "s" : ""}` : "Tes prochains départs"}</p>
          </div>
          <button className="home-section__see-all" type="button" onClick={() => navigate("my-trips")}>Tout voir <Icon name="arrow-right" size={14} /></button>
        </div>
        {featuredTrips.length === 0 ? (
          <div className="home-empty">
            <div className="home-empty__icon"><Icon name="route" size={40} /></div>
            <strong>Aucune annonce</strong>
            <p>Publie ton premier trajet pour commencer.</p>
            <button className="home-empty__cta" type="button" onClick={() => navigate("publish")}><Icon name="plus" size={16} /> Publier</button>
          </div>
        ) : (
          <div className="home-trips-list">
            {featuredTrips.map((trip, i) => {
              const countdown = getCountdown(trip.departureAt);
              return (
                <article className="home-driver-card card-animate" key={trip.id} style={{ animationDelay: `${i * 0.08}s` }}>
                  <div className="home-driver-card__accent" data-status={trip.status?.toLowerCase()} />
                  <div className="home-driver-card__top">
                    <div className="home-driver-card__route">
                      <div className="home-driver-card__route-icon"><Icon name="route" size={16} /></div>
                      <h4>{trip.route}</h4>
                    </div>
                    <span className={getStatusPillClass(trip.status)}>{trip.status}</span>
                  </div>
                  <div className="home-driver-card__meta">
                    {countdown && <span className="home-driver-card__tag home-driver-card__tag--live">{countdown}</span>}
                    <span className="home-driver-card__tag"><Icon name="clock" size={13} /> {trip.time}</span>
                    <span className="home-driver-card__tag"><Icon name="seat" size={13} /> {trip.seats} places</span>
                    <span className="home-driver-card__tag home-driver-card__tag--price">{trip.price} DH</span>
                  </div>
                  <div className="home-driver-card__bottom">
                    <span className="home-driver-card__passengers"><Icon name="user" size={14} /> {trip.passengers} passager{(trip.passengers || 0) > 1 ? "s" : ""}</span>
                    <button className="home-driver-card__btn" type="button" onClick={() => navigate("my-trips")}>Gérer <Icon name="arrow-right" size={13} /></button>
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

// ── PASSENGER HOME ────────────────────────────────────────────
function PassengerHome({ user, tripOptions, reservations, navigate, onThemeChange, theme }) {
  const confirmedResas  = reservations.filter((r) => r.status === "Confirmee").length;
  const pendingResas    = reservations.filter((r) => r.status === "En attente").length;
  const featuredTrips   = tripOptions.slice(0, 3);
  const firstName       = user.name?.split(" ")[0] || "Passager";

  return (
    <div className="screen screen--home page-enter">
      {/* Topbar */}
      <header className="home-topbar">
        <div className="home-topbar__left">
          <AppMenu navigate={navigate} onThemeChange={onThemeChange} theme={theme} user={user} />
        </div>
        <div className="home-topbar__center">
          <img src={logo} alt="CampusRide" className="home-topbar__logo" />
        </div>
        <div className="home-topbar__right">
          <button className="home-topbar__notif" type="button" onClick={() => navigate("notifications")} aria-label="Notifications">
            <Icon name="bell" size={20} />
            {pendingResas > 0 && <span className="home-topbar__notif-badge">{pendingResas}</span>}
          </button>
          <div className="home-topbar__avatar" onClick={() => navigate("profile")} role="button" tabIndex={0} aria-label="Mon profil">
            {user.photo ? <img src={user.photo} alt={user.name} /> : <span className="home-topbar__avatar-initials">{user.initials || "CR"}</span>}
            <span className="home-topbar__online-dot" aria-hidden="true" />
          </div>
        </div>
      </header>

      {/* Greeting */}
      <section className="home-greeting-card">
        <div className="home-greeting-card__content">
          <span className="home-greeting-card__date">{getTodayDate()}</span>
          <h2 className="home-greeting-card__name">{getGreeting()}, {firstName} 👋</h2>
          <p className="home-greeting-card__subtitle">Trouvez votre prochain trajet facilement.</p>
        </div>
      </section>

      {/* Hero */}
      <section className="home-hero">
        <div className="home-hero__bg" aria-hidden="true">
          <div className="home-hero__orb home-hero__orb--1" /><div className="home-hero__orb home-hero__orb--2" />
          <div className="home-hero__orb home-hero__orb--3" /><div className="home-hero__shimmer" /><div className="home-hero__pattern" />
        </div>
        <div className="home-hero__content">
          <span className="home-hero__badge"><span className="home-hero__badge-dot" />Passager</span>
          <h2 className="home-hero__title">Trouvez votre <span>trajet idéal</span></h2>
          <p className="home-hero__desc">Réservez en un clic ou demandez un trajet InDrive-style.</p>
          <div className="home-hero__stats">
            <button className="home-hero__stat" type="button" onClick={() => navigate("search")}>
              <strong>{tripOptions.length}</strong><span>Offres</span>
            </button>
            <span className="home-hero__stat-divider" />
            <button className="home-hero__stat" type="button" onClick={() => navigate("my-reservations")}>
              <strong>{reservations.length}</strong><span>Réserv.</span>
            </button>
            <span className="home-hero__stat-divider" />
            <button className="home-hero__stat" type="button" onClick={() => navigate("my-reservations")}>
              <strong>{confirmedResas}</strong><span>Confirmés</span>
            </button>
          </div>
          <div className="home-hero__cta-row">
            <button className="home-hero__cta home-hero__cta--primary" type="button" onClick={() => navigate("search")}>
              <Icon name="search" size={18} /><span>Chercher un trajet</span>
            </button>
            <button className="home-hero__cta home-hero__cta--orange" type="button" onClick={() => navigate("publish-demande")}>
              <Icon name="bookmark" size={18} /><span>Demander</span>
            </button>
          </div>
        </div>
      </section>

      {/* Banners */}
      {pendingResas > 0 && (
        <div className="home-banner home-banner--orange card-animate">
          <div className="home-banner__icon home-banner__icon--orange"><Icon name="clock" size={22} /></div>
          <div className="home-banner__body"><span>En attente</span><strong>{pendingResas} réservation{pendingResas > 1 ? "s" : ""}</strong></div>
          <button className="home-banner__cta home-banner__cta--orange" type="button" onClick={() => navigate("my-reservations")}>Voir <Icon name="arrow-right" size={13} /></button>
        </div>
      )}

      {/* Quick actions */}
      <section className="home-actions">
        <h3 className="home-actions__title"><span className="home-actions__title-bar" />Actions rapides</h3>
        <div className="home-actions__grid">
          <button className="home-action-card" type="button" onClick={() => navigate("search")}>
            <div className="home-action-card__icon home-action-card__icon--primary"><Icon name="search" size={22} /></div>
            <div className="home-action-card__info"><strong>Chercher</strong><span>Trouver un trajet</span></div>
          </button>
          <button className="home-action-card" type="button" onClick={() => navigate("publish-demande")}>
            <div className="home-action-card__icon home-action-card__icon--orange"><Icon name="plus" size={22} /></div>
            <div className="home-action-card__info"><strong>Demander</strong><span>Style InDrive</span></div>
          </button>
          <button className="home-action-card" type="button" onClick={() => navigate("my-reservations")}>
            <div className="home-action-card__icon home-action-card__icon--secondary"><Icon name="bookmark" size={22} /></div>
            <div className="home-action-card__info"><strong>Réservations</strong><span>Mes trajets</span></div>
          </button>
          <button className="home-action-card" type="button" onClick={() => navigate("profile")}>
            <div className="home-action-card__icon home-action-card__icon--accent"><Icon name="user" size={22} /></div>
            <div className="home-action-card__info"><strong>Profil</strong><span>Mon compte</span></div>
          </button>
        </div>
      </section>

      {/* Trajets disponibles */}
      <section className="home-section">
        <div className="home-section__header">
          <div>
            <h3 className="home-section__title"><span className="home-section__title-bar" />Trajets disponibles</h3>
            <p className="home-section__subtitle">Publiés récemment près du campus</p>
          </div>
          <button className="home-section__see-all" type="button" onClick={() => navigate("search")}>Tout voir <Icon name="arrow-right" size={14} /></button>
        </div>
        {featuredTrips.length === 0 ? (
          <div className="home-empty">
            <div className="home-empty__icon"><Icon name="car" size={40} /></div>
            <strong>Aucun trajet disponible</strong>
            <p>Aucun conducteur n'a encore publié.</p>
            <button className="home-empty__cta" type="button" onClick={() => navigate("publish-demande")}><Icon name="plus" size={16} /> Demander un trajet</button>
          </div>
        ) : (
          <div className="home-trips-list">
            {featuredTrips.map((trip, i) => (
              <div className="card-animate" key={trip.id} style={{ animationDelay: `${i * 0.08}s` }}>
                <TrajetCard ctaLabel="Réserver" trip={trip} onClick={() => {}} onViewDriver={() => {}} />
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Mes réservations */}
      {reservations.length > 0 && (
        <section className="home-section">
          <div className="home-section__header">
            <div>
              <h3 className="home-section__title"><span className="home-section__title-bar" />Mes réservations</h3>
              <p className="home-section__subtitle">{confirmedResas > 0 ? `${confirmedResas} confirmée${confirmedResas > 1 ? "s" : ""}` : "En cours de traitement"}</p>
            </div>
            <button className="home-section__see-all" type="button" onClick={() => navigate("my-reservations")}>Tout voir <Icon name="arrow-right" size={14} /></button>
          </div>
          <div className="home-trips-list">
            {reservations.slice(0, 2).map((r, i) => {
              const statusColor = r.status === "Confirmee" ? "#059669" : r.status === "En attente" ? "#d97706" : "#dc2626";
              const statusIcon  = r.status === "Confirmee" ? "✅" : r.status === "En attente" ? "🕐" : "❌";
              return (
                <div className="home-res-card card-animate" key={r.id}
                  style={{ animationDelay: `${i * 0.08}s`, borderLeftColor: statusColor }}
                  onClick={() => navigate("my-reservations")} role="button" tabIndex={0}>
                  <div className="home-res-card__route">
                    <strong>{r.depart}</strong><Icon name="arrow-right" size={12} /><strong>{r.destination}</strong>
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
    </div>
  );
}

// ── MAIN EXPORT — dispatches by role ─────────────────────────
export default function Home({
  demandes = [],
  navigate,
  onThemeChange,
  onTripSelect,
  onViewDriver,
  publishedTrips = [],
  reservations = [],
  theme,
  tripOptions = [],
  user,
}) {
  const isDriver = user?.roleValue === "conducteur";

  if (isDriver) {
    return (
      <DriverHome
        user={user}
        publishedTrips={publishedTrips}
        demandes={demandes}
        navigate={navigate}
        onThemeChange={onThemeChange}
        theme={theme}
      />
    );
  }

  return (
    <PassengerHome
      user={user}
      tripOptions={tripOptions}
      reservations={reservations}
      navigate={navigate}
      onThemeChange={onThemeChange}
      theme={theme}
    />
  );
}
