import React, { useEffect, useState } from "react";
import BottomNav from "./components/BottomNav";
import Home from "./pages/Home";
import MyReservations from "./pages/MyReservations";
import MyTrajets from "./pages/MyTrajets";
import Profile from "./pages/Profile";
import PublishTrajet from "./pages/PublishTrajet";
import Register from "./pages/Register";
import Reservation from "./pages/Reservation";
import SearchTrajet from "./pages/SearchTrajet";
import {
  currentUser,
  profileLinks,
  publishedTrips,
  publishDraft,
  reservations,
  searchFilters,
  tripOptions,
} from "./data/mockData";

const screenTabs = [
  { route: "welcome", label: "Bienvenue", note: "ecran d'inscription" },
  { route: "home", label: "Accueil", note: "recherche et trajets" },
  { route: "search", label: "Recherche", note: "filtres et carte" },
  { route: "publish", label: "Publier", note: "creation de trajet" },
  { route: "reservation", label: "Reservation", note: "details conducteur" },
  { route: "profile", label: "Profil", note: "compte et menus" },
  { route: "my-trips", label: "Mes trajets", note: "historique conducteur" },
  { route: "my-reservations", label: "Reservations", note: "suivi passager" },
];

function getRouteFromHash(hash) {
  const raw = hash.replace(/^#\/?/, "");
  const exists = screenTabs.some((screen) => screen.route === raw);
  return exists ? raw : "welcome";
}

function renderScreen(route, navigate) {
  if (route === "welcome") {
    return <Register navigate={navigate} />;
  }

  if (route === "home") {
    return <Home navigate={navigate} tripOptions={tripOptions} />;
  }

  if (route === "search") {
    return (
      <SearchTrajet
        navigate={navigate}
        searchFilters={searchFilters}
        tripCount={tripOptions.length}
      />
    );
  }

  if (route === "publish") {
    return (
      <PublishTrajet
        navigate={navigate}
        publishDraft={publishDraft}
      />
    );
  }

  if (route === "reservation") {
    return (
      <Reservation
        navigate={navigate}
        tripOptions={tripOptions}
      />
    );
  }

  if (route === "profile") {
    return (
      <Profile
        navigate={navigate}
        user={currentUser}
        profileLinks={profileLinks}
      />
    );
  }

  if (route === "my-trips") {
    return (
      <MyTrajets
        navigate={navigate}
        user={currentUser}
        publishedTrips={publishedTrips}
      />
    );
  }

  return (
    <MyReservations
      navigate={navigate}
      reservations={reservations}
    />
  );
}

function App() {
  const [route, setRoute] = useState(() => {
    if (typeof window === "undefined") {
      return "welcome";
    }

    return getRouteFromHash(window.location.hash);
  });

  useEffect(() => {
    function handleHashChange() {
      setRoute(getRouteFromHash(window.location.hash));
    }

    if (!window.location.hash) {
      window.location.hash = "#/welcome";
    }

    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  function navigate(nextRoute) {
    const normalizedRoute = screenTabs.some(
      (screen) => screen.route === nextRoute,
    )
      ? nextRoute
      : "welcome";

    if (typeof window !== "undefined") {
      window.location.hash = `#/${normalizedRoute}`;
    }

    setRoute(normalizedRoute);
  }

  const showNav = route !== "welcome";

  return (
    <div className="app-shell">
      <section
        className={`site-stage site-stage--single ${
          route === "welcome" ? "site-stage--welcome" : ""
        }`}
      >
        <div className="stage-orb stage-orb--one" />
        <div className="stage-orb stage-orb--two" />

        <div className="phone-shell">
          <div className="phone-shell__body">{renderScreen(route, navigate)}</div>
          {showNav ? <BottomNav route={route} navigate={navigate} /> : null}
        </div>
      </section>
    </div>
  );
}

export default App;
