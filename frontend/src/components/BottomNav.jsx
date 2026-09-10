import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Icon } from "./Icons";

// ── Nav definitions per role ─────────────────────────────────
const navDriver = [
  { route: "home",         label: "Accueil",  icon: "home" },
  { route: "demandes",     label: "Demandes", icon: "bookmark" },
  { route: "__publish__",  label: "Publier",  icon: "plus", featured: true },
  { route: "my-trips",     label: "Trajets",  icon: "route" },
  { route: "notifications",label: "Notifs",   icon: "bell" },
  { route: "profile",      label: "Profil",   icon: "user" },
];

const navPassenger = [
  { route: "home",              label: "Accueil",  icon: "home" },
  { route: "search",            label: "Chercher", icon: "search" },
  { route: "__demande__",       label: "Demander", icon: "plus", featured: true },
  { route: "my-reservations",   label: "Resas",    icon: "bookmark" },
  { route: "notifications",     label: "Notifs",   icon: "bell" },
  { route: "profile",           label: "Profil",   icon: "user" },
];

function getActiveTab(route, role) {
  const isDriver = role === "conducteur";

  if (route === "publish")          return "__publish__";
  if (route === "publish-demande")  return "__demande__";
  if (route === "reservation")      return "search";
  if (route === "my-demandes")      return "demandes";
  if (route === "trip-detail")      return isDriver ? "my-trips" : "my-reservations";
  return route;
}

export default function BottomNav({ role = "passager", notificationCount = 0, route, navigate }) {
  const isDriver = role === "conducteur";
  const navItems = isDriver ? navDriver : navPassenger;
  const activeTab = getActiveTab(route, role);
  const [showSheet, setShowSheet] = useState(false);
  const sheetRef = useRef(null);

  // Close on outside click / touch
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
    if (item.route === "__publish__" || item.route === "__demande__") {
      setShowSheet((v) => !v);
      return;
    }
    setShowSheet(false);
    navigate(item.route);
  }

  // Driver action sheet — only Publier trajet
  function goPublish() {
    setShowSheet(false);
    navigate("publish");
  }

  // Passenger action sheet — only Demander trajet
  function goDemande() {
    setShowSheet(false);
    navigate("publish-demande");
  }

  const actionIcon = showSheet ? "x" : "plus";

  return (
    <>
      {/* ── Action sheet via portal (escapes overflow:hidden) ─ */}
      {showSheet && createPortal(
        <div className="nav-sheet-overlay" onClick={() => setShowSheet(false)}>
          <div className="nav-sheet" ref={sheetRef} onClick={(e) => e.stopPropagation()}>
            <div className="nav-sheet__handle" />

            {isDriver ? (
              <>
                <p className="nav-sheet__title">Publier un trajet</p>
                <button className="nav-sheet__item" type="button" onClick={goPublish}>
                  <div className="nav-sheet__item-icon nav-sheet__item-icon--blue">
                    <Icon name="plus" size={22} />
                  </div>
                  <div className="nav-sheet__item-body">
                    <strong>Publier un trajet</strong>
                    <span>Propose des places à tes passagers</span>
                  </div>
                  <Icon name="chevron-right" size={16} />
                </button>
              </>
            ) : (
              <>
                <p className="nav-sheet__title">Demander un trajet</p>
                <button className="nav-sheet__item" type="button" onClick={goDemande}>
                  <div className="nav-sheet__item-icon nav-sheet__item-icon--orange">
                    <Icon name="search" size={22} />
                  </div>
                  <div className="nav-sheet__item-body">
                    <strong>Demander un trajet</strong>
                    <span>Propose ton prix, un conducteur accepte</span>
                  </div>
                  <Icon name="chevron-right" size={16} />
                </button>
              </>
            )}

            <button className="nav-sheet__cancel" type="button" onClick={() => setShowSheet(false)}>
              Annuler
            </button>
          </div>
        </div>,
        document.body
      )}

      {/* ── Bottom nav bar ─────────────────────────────────── */}
      <nav className="bottom-nav" aria-label="Navigation principale">
        {navItems.map((item) => {
          const isAction = item.route === "__publish__" || item.route === "__demande__";
          const isActive = activeTab === item.route ||
            (isAction && (activeTab === "__publish__" || activeTab === "__demande__"));

          return (
            <button
              className={`bottom-nav__button ${isActive ? "bottom-nav__button--active" : ""} ${
                item.featured ? "bottom-nav__button--featured" : ""
              } ${showSheet && item.featured ? "bottom-nav__button--featured-open" : ""}`}
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
          );
        })}
      </nav>
    </>
  );
}
