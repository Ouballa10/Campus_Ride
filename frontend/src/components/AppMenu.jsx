import React, { useEffect, useMemo, useState } from "react";
import logo from "../assets/images/logo.png";
import { useAuth } from "../context/AuthContext";
import { Icon } from "./Icons";
import ModeSwitch from "./ModeSwitch";

export default function AppMenu({
  mode = "passenger",
  navigate,
  onModeChange = () => {},
  user,
}) {
  const { signOut } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const isDriverMode = mode === "driver";
  const displayName = user?.name || "CampusRide";
  const roleLabel = isDriverMode ? "Mode driver" : "Mode passager";

  const menuLinks = useMemo(
    () => [
      { route: "home", label: "Accueil", icon: "home" },
      isDriverMode
        ? { route: "publish", label: "Publier un trajet", icon: "plus" }
        : { route: "search", label: "Rechercher un trajet", icon: "search" },
      isDriverMode
        ? { route: "my-trips", label: "Mes trajets", icon: "route" }
        : {
            route: "my-reservations",
            label: "Mes reservations",
            icon: "bookmark",
          },
      { route: "notifications", label: "Notifications", icon: "bell" },
      { route: "profile", label: "Parametres du compte", icon: "settings" },
    ],
    [isDriverMode],
  );

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    function handleEscape(event) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen]);

  function openRoute(route) {
    navigate(route);
    setIsOpen(false);
  }

  async function handleLogout() {
    try {
      setIsLoggingOut(true);
      const result = await signOut();

      if (result?.error) {
        console.warn("Session cleared locally after sign out error:", result.error);
      }

      setIsOpen(false);
      navigate("splash");
    } finally {
      setIsLoggingOut(false);
    }
  }

  return (
    <div className="app-menu">
      <button
        aria-expanded={isOpen}
        aria-label="Ouvrir le menu"
        className={`icon-button app-menu__trigger ${
          isOpen ? "app-menu__trigger--open" : ""
        }`.trim()}
        type="button"
        onClick={() => setIsOpen((currentValue) => !currentValue)}
      >
        <Icon name="menu" size={18} />
      </button>

      {isOpen ? (
        <div className="app-menu-layer">
          <button
            aria-label="Fermer le menu"
            className="app-menu__backdrop"
            type="button"
            onClick={() => setIsOpen(false)}
          />

          <aside className="app-menu__panel" aria-label="Menu principal">
            <div className="app-menu__header">
              <div className="app-menu__brand">
                <img alt="CampusRide" src={logo} />
                <div>
                  <strong>{displayName}</strong>
                  <span>{roleLabel}</span>
                </div>
              </div>

              <button
                aria-label="Fermer le menu"
                className="icon-button app-menu__close"
                type="button"
                onClick={() => setIsOpen(false)}
              >
                <Icon name="x" size={18} />
              </button>
            </div>

            <div className="app-menu__mode-card">
              <div className="app-menu__section-title">
                <span>Mode</span>
                <strong>{isDriverMode ? "Publier" : "Reserver"}</strong>
              </div>
              <ModeSwitch mode={mode} onChange={onModeChange} />
            </div>

            <nav className="app-menu__links" aria-label="Raccourcis">
              {menuLinks.map((link) => (
                <button
                  className="app-menu__link"
                  key={link.route}
                  type="button"
                  onClick={() => openRoute(link.route)}
                >
                  <span className="app-menu__link-icon">
                    <Icon name={link.icon} size={18} />
                  </span>
                  <span>{link.label}</span>
                  <Icon name="chevron-right" size={15} />
                </button>
              ))}
            </nav>

            <button
              className="app-menu__logout"
              disabled={isLoggingOut}
              type="button"
              onClick={handleLogout}
            >
              <span className="app-menu__logout-icon">
                <Icon name="logout" size={18} />
              </span>
              <span>{isLoggingOut ? "Deconnexion..." : "Se deconnecter"}</span>
            </button>

            <div className="app-menu__footer">
              <span>CampusRide</span>
              <strong>UPM Marrakech</strong>
            </div>
          </aside>
        </div>
      ) : null}
    </div>
  );
}
