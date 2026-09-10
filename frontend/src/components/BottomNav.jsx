import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Icon } from "./Icons";

const navItems = [
  { route: "home",            label: "Accueil",   icon: "home" },
  { route: "search",          label: "Recherche", icon: "search" },
  { route: "__action__",      label: "Créer",     icon: "plus", featured: true },
  { route: "my-trips",        label: "Trajets",   icon: "route" },
  { route: "notifications",   label: "Notifs",    icon: "bell" },
  { route: "profile",         label: "Profil",    icon: "user" },
];

function getActiveTab(route) {
  if (route === "reservation")    return "search";
  if (route === "my-reservations") return "my-trips";
  if (route === "publish")         return "__action__";
  if (route === "publish-demande") return "__action__";
  if (route === "demandes")        return "my-trips";
  if (route === "my-demandes")     return "my-trips";
  return route;
}

export default function BottomNav({ notificationCount = 0, route, navigate }) {
  const activeTab = getActiveTab(route);
  const [showSheet, setShowSheet] = useState(false);
  const sheetRef = useRef(null);

  // Close on outside click
  useEffect(() => {
    if (!showSheet) return;
    function handle(e) {
      if (sheetRef.current && !sheetRef.current.contains(e.target)) {
        setShowSheet(false);
      }
    }
    document.addEventListener("mousedown", handle);
    document.addEventListener("touchstart", handle);
    return () => {
      document.removeEventListener("mousedown", handle);
      document.removeEventListener("touchstart", handle);
    };
  }, [showSheet]);

  function handleNavClick(item) {
    if (item.route === "__action__") {
      setShowSheet((v) => !v);
      return;
    }
    setShowSheet(false);
    navigate(item.route);
  }

  function goPublish() {
    setShowSheet(false);
    navigate("publish");
  }

  function goDemande() {
    setShowSheet(false);
    navigate("publish-demande");
  }

  return (
    <>
      {/* Action sheet — rendered via portal to escape overflow:hidden on phone-shell */}
      {showSheet && createPortal(
        <div className="nav-sheet-overlay" onClick={() => setShowSheet(false)}>
          <div
            className="nav-sheet"
            ref={sheetRef}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="nav-sheet__handle" />
            <p className="nav-sheet__title">Que veux-tu faire ?</p>

            <button className="nav-sheet__item" type="button" onClick={goPublish}>
              <div className="nav-sheet__item-icon nav-sheet__item-icon--blue">
                <Icon name="plus" size={22} />
              </div>
              <div className="nav-sheet__item-body">
                <strong>Publier un trajet</strong>
                <span>Tu es conducteur — propose des places</span>
              </div>
              <Icon name="chevron-right" size={16} />
            </button>

            <button className="nav-sheet__item" type="button" onClick={goDemande}>
              <div className="nav-sheet__item-icon nav-sheet__item-icon--orange">
                <Icon name="search" size={22} />
              </div>
              <div className="nav-sheet__item-body">
                <strong>Demander un trajet</strong>
                <span>Tu es passager — les conducteurs acceptent</span>
              </div>
              <Icon name="chevron-right" size={16} />
            </button>

            <button
              className="nav-sheet__cancel"
              type="button"
              onClick={() => setShowSheet(false)}
            >
              Annuler
            </button>
          </div>
        </div>,
        document.body
      )}

      <nav className="bottom-nav" aria-label="Navigation principale">
        {navItems.map((item) => (
          <button
            className={`bottom-nav__button ${
              activeTab === item.route ? "bottom-nav__button--active" : ""
            } ${item.featured ? "bottom-nav__button--featured" : ""} ${
              showSheet && item.featured ? "bottom-nav__button--featured-open" : ""
            }`}
            key={item.route}
            type="button"
            onClick={() => handleNavClick(item)}
            aria-label={item.label}
          >
            <span className="bottom-nav__icon">
              <Icon name={item.featured && showSheet ? "x" : item.icon} size={18} />
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
    </>
  );
}
