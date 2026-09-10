import React, { useEffect, useState } from "react";
import logo from "../assets/images/logo.png";
import { useAuth } from "../context/AuthContext";
import { Icon } from "./Icons";

const navDriver = [
  { route: "home",         label: "Accueil",            icon: "home" },
  { route: "publish",      label: "Publier un trajet",   icon: "plus" },
  { route: "demandes",     label: "Demandes passagers",  icon: "bookmark" },
  { route: "my-trips",     label: "Mes trajets",         icon: "route" },
  { route: "notifications",label: "Notifications",       icon: "bell" },
];

const navPassenger = [
  { route: "home",              label: "Accueil",            icon: "home" },
  { route: "search",            label: "Chercher un trajet", icon: "search" },
  { route: "publish-demande",   label: "Demander un trajet", icon: "plus" },
  { route: "my-reservations",   label: "Mes réservations",   icon: "bookmark" },
  { route: "notifications",     label: "Notifications",      icon: "bell" },
];

export default function AppMenu({ navigate, onThemeChange = () => {}, theme = "light", user }) {
  const { signOut } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const isDriver    = user?.roleValue === "conducteur";
  const navLinks    = isDriver ? navDriver : navPassenger;
  const displayName = user?.name || "CampusRide";
  const userEmail   = user?.email || "";
  const isDark      = theme === "dark";

  useEffect(() => {
    if (!isOpen) return;
    function onKey(e) { if (e.key === "Escape") setIsOpen(false); }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isOpen]);

  function openRoute(route) { navigate(route); setIsOpen(false); }

  async function handleLogout() {
    try {
      setIsLoggingOut(true);
      await signOut();
    } finally {
      setIsLoggingOut(false);
      setIsOpen(false);
      navigate("splash");
    }
  }

  return (
    <div className="app-menu">
      <button
        aria-expanded={isOpen}
        aria-label="Ouvrir le menu"
        className={`icon-button app-menu__trigger ${isOpen ? "app-menu__trigger--open" : ""}`.trim()}
        type="button"
        onClick={() => setIsOpen((v) => !v)}
      >
        <Icon name="menu" size={18} />
      </button>

      {isOpen && (
        <div className="app-menu-layer">
          <button aria-label="Fermer" className="app-menu__backdrop" type="button" onClick={() => setIsOpen(false)} />

          <aside className="app-menu__panel" aria-label="Menu">
            {/* Profile header */}
            <div className="app-menu__profile">
              <div className="app-menu__profile-avatar">
                {user?.photo ? <img alt={displayName} src={user.photo} /> : <span>{user?.initials || "CR"}</span>}
              </div>
              <div className="app-menu__profile-info">
                <strong>{displayName}</strong>
                <span className={`app-menu__role-badge app-menu__role-badge--${isDriver ? "driver" : "passenger"}`}>
                  <Icon name={isDriver ? "car" : "user"} size={12} />
                  {isDriver ? "Conducteur" : "Passager"}
                </span>
                {userEmail && <span style={{ fontSize: "0.72rem", color: "#94a3b8" }}>{userEmail}</span>}
              </div>
            </div>

            {/* Navigation */}
            <div className="app-menu__section">
              <h4 className="app-menu__section-label"><span className="app-menu__section-bar" />Navigation</h4>
              <nav className="app-menu__nav">
                {navLinks.map((link) => (
                  <button className="app-menu__item" key={link.route} type="button" onClick={() => openRoute(link.route)}>
                    <span className="app-menu__item-icon"><Icon name={link.icon} size={20} /></span>
                    <span className="app-menu__item-label">{link.label}</span>
                  </button>
                ))}
              </nav>
            </div>

            {/* Settings */}
            <div className="app-menu__section">
              <h4 className="app-menu__section-label"><span className="app-menu__section-bar" />Paramètres</h4>
              <div className="app-menu__nav">
                {/* Dark mode */}
                <div className="app-menu__item app-menu__item--toggle">
                  <span className="app-menu__item-icon"><Icon name="moon" size={20} /></span>
                  <span className="app-menu__item-label">Mode sombre</span>
                  <button
                    className={`app-menu__toggle ${isDark ? "app-menu__toggle--on" : ""}`}
                    type="button"
                    onClick={() => onThemeChange(isDark ? "light" : "dark")}
                    aria-label="Basculer le thème"
                  />
                </div>
                {/* Profile */}
                <button className="app-menu__item" type="button" onClick={() => openRoute("profile")}>
                  <span className="app-menu__item-icon"><Icon name="user" size={20} /></span>
                  <span className="app-menu__item-label">Mon profil</span>
                </button>
                {/* Sign out */}
                <button className="app-menu__item app-menu__item--danger" disabled={isLoggingOut} type="button" onClick={handleLogout}>
                  <span className="app-menu__item-icon"><Icon name="logout" size={20} /></span>
                  <span className="app-menu__item-label">{isLoggingOut ? "Déconnexion..." : "Se déconnecter"}</span>
                </button>
              </div>
            </div>

            {/* Logo footer */}
            <div className="app-menu__footer">
              <img alt="CampusRide" className="app-menu__logo" src={logo} />
              <span>CampusRide</span>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
