import React from "react";
import { Icon } from "./Icons";

const navItems = [
  { route: "home", label: "Accueil", icon: "home" },
  { route: "search", label: "Recherche", icon: "search" },
  { route: "publish", label: "Publier", icon: "plus", featured: true },
  { route: "my-trips", label: "Trajets", icon: "route" },
  { route: "notifications", label: "Notifs", icon: "bell" },
  { route: "profile", label: "Profil", icon: "user" },
];

function getActiveTab(route) {
  // reservation page highlights search tab
  if (route === "reservation") return "search";
  // my-reservations highlights my-trips tab (all trips/reservations accessible from there)
  if (route === "my-reservations") return "my-trips";
  return route;
}

export default function BottomNav({ notificationCount = 0, route, navigate }) {
  const activeTab = getActiveTab(route);

  return (
    <nav className="bottom-nav" aria-label="Navigation principale">
      {navItems.map((item) => (
        <button
          className={`bottom-nav__button ${
            activeTab === item.route ? "bottom-nav__button--active" : ""
          } ${item.featured ? "bottom-nav__button--featured" : ""}`}
          key={item.route}
          type="button"
          onClick={() => navigate(item.route)}
        >
          <span className="bottom-nav__icon">
            <Icon name={item.icon} size={18} />
            {item.route === "notifications" && notificationCount > 0 ? (
              <span className="bottom-nav__badge">
                {notificationCount > 9 ? "9+" : notificationCount}
              </span>
            ) : null}
          </span>
          <span>{item.label}</span>
        </button>
      ))}
    </nav>
  );
}
