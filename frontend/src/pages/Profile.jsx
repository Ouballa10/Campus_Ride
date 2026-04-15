import React from "react";
import { Icon, Stars } from "../components/Icons";

export default function Profile({ navigate, user, profileLinks }) {
  return (
    <div className="screen">
      <div className="profile-hero">
        <div className="profile-hero__top">
          <div className="avatar-badge avatar-badge--xl">{user.initials}</div>

          <div className="profile-hero__copy">
            <h2>{user.name}</h2>
            <p>{user.role}</p>
            <Stars value={user.rating} />
          </div>
        </div>

        <div className="stat-strip">
          <div>
            <strong>{user.tripsCount}</strong>
            <span>trajets</span>
          </div>
          <div>
            <strong>{user.reservationsCount}</strong>
            <span>reservations</span>
          </div>
          <div>
            <strong>{user.reviewCount}</strong>
            <span>avis</span>
          </div>
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


      <div className="vehicle-card">
        <span className="vehicle-card__icon">
          <Icon name="car" size={18} />
        </span>
        <div>

  
          <strong>Car</strong>
          <p>{user.car}</p>
        </div>

    
      </div>
      <button
        className="logout-card"
        type="button"
        onClick={() => navigate("welcome")}
      >
        <span className="menu-card__icon">
          <Icon name="logout" size={18} />
        </span>
        <span className="menu-card__label">Se deconnecter</span>
      </button>
    </div>
  );
}
