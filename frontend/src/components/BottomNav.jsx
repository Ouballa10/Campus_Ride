import React from "react";
import { Icon } from "./Icons";

const navItemsByMode = {
  passenger: [
    { route: "home", label: "Accueil", icon: "home" },
    { route: "search", label: "Recherche", icon: "search", featured: true },
    { route: "my-reservations", label: "Resas", icon: "bookmark" },
    { route: "notifications", label: "Notifs", icon: "bell" },
    { route: "profile", label: "Profil", icon: "user" },
  ],
  driver: [
    { route: "home", label: "Accueil", icon: "home" },
    { route: "publish", label: "Publier", icon: "plus", featured: true },
    { route: "my-trips", label: "Trajets", icon: "route" },
    { route: "notifications", label: "Notifs", icon: "bell" },
    { route: "profile", label: "Profil", icon: "user" },
  ],
};

function getActiveTab(route, mode) {
  if (route === "reservation") {
    return "search";
  }

  if (route === "my-reservations" && mode === "driver") {
    return "my-trips";
  }

  return route;
}

export default function BottomNav({ mode = "passenger", route, navigate }) {
  const activeTab = getActiveTab(route, mode);
  const navItems = navItemsByMode[mode] || navItemsByMode.passenger;

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
          </span>
          <span>{item.label}</span>
        </button>
      ))}
    </nav>
  );
}
