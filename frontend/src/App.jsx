import React, { useEffect, useState } from "react";
import BottomNav from "./components/BottomNav";
import { useAuth } from "./context/AuthContext";
import {
  currentUser as defaultCurrentUser,
  profileLinks,
  publishedTrips as defaultPublishedTrips,
  publishDraft,
  reservations as defaultReservations,
  searchFilters,
  tripOptions as defaultTripOptions,
} from "./data/mockData";
import Home from "./pages/Home";
import Login from "./pages/Login";
import MyReservations from "./pages/MyReservations";
import MyTrajets from "./pages/MyTrajets";
import Profile from "./pages/Profile";
import PublishTrajet from "./pages/PublishTrajet";
import Register from "./pages/Register";
import Reservation from "./pages/Reservation";
import SearchTrajet from "./pages/SearchTrajet";
import Splash from "./pages/Splash";
import { reservationService } from "./services/reservationService";
import { trajetService } from "./services/trajetService";
import { buildCurrentUser } from "./utils/appDataMappers";

const authRoutes = ["splash", "login", "register"];

const appRoutes = [
  { route: "home", label: "Accueil", note: "recherche et trajets" },
  { route: "search", label: "Recherche", note: "filtres et carte" },
  { route: "publish", label: "Publier", note: "creation de trajet" },
  { route: "reservation", label: "Reservation", note: "details conducteur" },
  { route: "profile", label: "Profil", note: "compte et menus" },
  { route: "my-trips", label: "Mes trajets", note: "historique conducteur" },
  { route: "my-reservations", label: "Reservations", note: "suivi passager" },
];

const allRoutes = [...authRoutes, ...appRoutes.map((screen) => screen.route)];
const defaultAppData = {
  currentUser: defaultCurrentUser,
  publishedTrips: defaultPublishedTrips,
  reservations: defaultReservations,
  tripOptions: defaultTripOptions,
};

function getRouteFromHash(hash) {
  const raw = hash.replace(/^#\/?/, "");
  return allRoutes.includes(raw) ? raw : "splash";
}

function renderScreen(route, navigate, appData) {
  if (route === "splash") {
    return <Splash navigate={navigate} />;
  }

  if (route === "login") {
    return <Login navigate={navigate} />;
  }

  if (route === "register") {
    return <Register navigate={navigate} />;
  }

  if (route === "home") {
    return <Home navigate={navigate} tripOptions={appData.tripOptions} />;
  }

  if (route === "search") {
    return (
      <SearchTrajet
        navigate={navigate}
        searchFilters={searchFilters}
        tripCount={appData.tripOptions.length}
      />
    );
  }

  if (route === "publish") {
    return <PublishTrajet navigate={navigate} publishDraft={publishDraft} />;
  }

  if (route === "reservation") {
    return <Reservation navigate={navigate} tripOptions={appData.tripOptions} />;
  }

  if (route === "profile") {
    return (
      <Profile
        navigate={navigate}
        user={appData.currentUser}
        profileLinks={profileLinks}
      />
    );
  }

  if (route === "my-trips") {
    return (
      <MyTrajets
        navigate={navigate}
        user={appData.currentUser}
        publishedTrips={appData.publishedTrips}
      />
    );
  }

  return (
    <MyReservations
      navigate={navigate}
      reservations={appData.reservations}
    />
  );
}

function App() {
  const { isConfigured, loading: authLoading, profile, session } = useAuth();
  const [route, setRoute] = useState(() => {
    if (typeof window === "undefined") {
      return "splash";
    }

    return getRouteFromHash(window.location.hash);
  });
  const [appData, setAppData] = useState(defaultAppData);
  const [dataError, setDataError] = useState("");

  const sessionUserId = session?.user?.id || "";
  const demoMode = !isConfigured;
  const canUseSupabaseData = isConfigured && Boolean(sessionUserId);

  useEffect(() => {
    function handleHashChange() {
      setRoute(getRouteFromHash(window.location.hash));
    }

    if (!window.location.hash) {
      window.location.hash = "#/splash";
    }

    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  function navigate(nextRoute) {
    const normalizedRoute = allRoutes.includes(nextRoute)
      ? nextRoute
      : "splash";

    if (typeof window !== "undefined") {
      window.location.hash = `#/${normalizedRoute}`;
    }

    setRoute(normalizedRoute);
  }

  useEffect(() => {
    if (authLoading || !isConfigured) {
      return;
    }

    if (!sessionUserId && !authRoutes.includes(route)) {
      navigate("splash");
      return;
    }

    if (sessionUserId && authRoutes.includes(route)) {
      navigate("home");
    }
  }, [authLoading, isConfigured, route, sessionUserId]);

  useEffect(() => {
    if (!canUseSupabaseData) {
      setDataError("");
      setAppData(defaultAppData);
      return;
    }

    let isActive = true;

    async function loadSupabaseData() {
      try {
        const [availableTrajets, myTrajets, myReservations] = await Promise.all([
          trajetService.listAvailableTrajets(),
          trajetService.listPublishedTrajets(sessionUserId),
          reservationService.listReservations(sessionUserId),
        ]);

        if (!isActive) {
          return;
        }

        setDataError("");
        setAppData({
          currentUser: buildCurrentUser(profile, {
            reservationsCount: myReservations.length,
            reviewCount: 0,
            tripsCount: myTrajets.length,
          }),
          publishedTrips: myTrajets,
          reservations: myReservations,
          tripOptions: availableTrajets,
        });
      } catch (error) {
        if (!isActive) {
          return;
        }

        console.error("Supabase data sync failed:", error);
        setDataError(error.message || "Synchronisation Supabase impossible.");
        setAppData({
          currentUser: buildCurrentUser(profile, {
            reservationsCount: 0,
            reviewCount: 0,
            tripsCount: 0,
          }),
          publishedTrips: [],
          reservations: [],
          tripOptions: [],
        });
      }
    }

    loadSupabaseData();

    return () => {
      isActive = false;
    };
  }, [canUseSupabaseData, profile, sessionUserId]);

  const isAuthRoute = authRoutes.includes(route);
  const showNav = !isAuthRoute;

  return (
    <div className="app-shell">
      <section className="site-stage site-stage--single">
        <div className="stage-orb stage-orb--one" />
        <div className="stage-orb stage-orb--two" />

        <div className={`phone-shell ${isAuthRoute ? "phone-shell--auth" : "phone-shell--app"}`}>
          <div className="phone-shell__body">
            {dataError && !demoMode && !isAuthRoute ? (
              <div className="sync-banner sync-banner--error">{dataError}</div>
            ) : null}
            {renderScreen(route, navigate, appData)}
          </div>
          {showNav ? <BottomNav route={route} navigate={navigate} /> : null}
        </div>
      </section>
    </div>
  );
}

export default App;
