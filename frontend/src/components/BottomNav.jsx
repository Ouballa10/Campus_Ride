import React from "react";
import { Icon } from "./Icons";

const navItems = [
  { route: "home", label: "Accueil", icon: "home" },
  { route: "search", label: "Recherche", icon: "search" },
  { route: "publish", label: "Publier", icon: "plus", featured: true },
  { route: "my-trips", label: "Trajets", icon: "route" },
  { route: "profile", label: "Profil", icon: "user" },
];

function getActiveTab(route) {
  if (route === "reservation") {
    return "search";
  }

  if (route === "my-reservations") {
    return "my-trips";
  }

  return route;
}

export default function BottomNav({ route, navigate }) {
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
          </span>
          <span>{item.label}</span>
        </button>
      ))}
    </nav>
  );
}
