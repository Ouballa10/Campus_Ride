import React from "react";
import { Icon, Stars } from "../components/Icons";
import { useAuth } from "../context/AuthContext";

export default function Profile({ navigate, user, profileLinks }) {
  const { signOut } = useAuth();
  const displayUser = user || {
    car: "Vehicule a renseigner",
    initials: "CR",
    name: "CampusRide",
    rating: 0,
    reservationsCount: 0,
    reviewCount: 0,
    role: "Etudiant passager",
    tripsCount: 0,
  };

  async function handleLogout() {
    await signOut();
    navigate("splash");
  }

  return (
    <div className="screen screen--profile">
      <div className="screen-grid screen-grid--profile">
        <div className="screen-panel">
          <div className="profile-hero">
            <div className="profile-hero__top">
              <div className="avatar-badge avatar-badge--xl">{displayUser.initials}</div>

              <div className="profile-hero__copy">
                <h2>{displayUser.name}</h2>
                <p>{displayUser.role}</p>
                <Stars value={displayUser.rating} />
              </div>
            </div>

            <div className="stat-strip">
              <div>
                <strong>{displayUser.tripsCount}</strong>
                <span>trajets</span>
              </div>
              <div>
                <strong>{displayUser.reservationsCount}</strong>
                <span>reservations</span>
              </div>
              <div>
                <strong>{displayUser.reviewCount}</strong>
                <span>avis</span>
              </div>
            </div>
          </div>

          <div className="vehicle-card">
            <span className="vehicle-card__icon">
              <Icon name="car" size={18} />
            </span>
            <div>
              <strong>Car</strong>
              <p>{displayUser.car}</p>
            </div>
          </div>

          <button
            className="logout-card"
            type="button"
            onClick={handleLogout}
          >
            <span className="menu-card__icon">
              <Icon name="logout" size={18} />
            </span>
            <span className="menu-card__label">Se deconnecter</span>
          </button>
        </div>

        <div className="screen-panel">
          <div className="section-heading section-heading--compact">
            <div>
              <h3>Mon espace</h3>
              <p>Accede rapidement a tes trajets et activites</p>
            </div>
          </div>

          <div className="menu-list">
            {profileLinks.map((link) => (
              <button
                className="menu-card"
                key={link.id}
                type="button"
                onClick={() => navigate(link.route)}
              >
                <span className="menu-card__icon">
                  <Icon name={link.icon} size={18} />
                </span>
                <span className="menu-card__label">{link.label}</span>
                <Icon name="chevron-right" size={16} />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
