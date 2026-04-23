import React, { useEffect, useState } from "react";
import BottomNav from "./components/BottomNav";
import { useAuth } from "./context/AuthContext";
import {
  currentUser as defaultCurrentUser,
  profileLinks,
  publishedTrips as defaultPublishedTrips,
  reservations as defaultReservations,
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
import {
  buildCurrentUser,
  formatClock,
  formatDuration,
  formatRelativeDate,
  formatTimeWindow,
  getInitials,
} from "./utils/appDataMappers";

const authRoutes = ["splash", "login", "register"];

const appRoutes = [
  { route: "home", label: "Accueil" },
  { route: "search", label: "Recherche" },
  { route: "publish", label: "Publier" },
  { route: "reservation", label: "Reservation" },
  { route: "profile", label: "Profil" },
  { route: "my-trips", label: "Mes trajets" },
  { route: "my-reservations", label: "Reservations" },
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

function buildDemoTripCard(payload, user, conducteurId) {
  const departureAt = new Date(`${payload.date}T${payload.time}`).toISOString();
  const seats = Number(payload.seats || 1);
  const durationMinutes = Number(payload.durationMinutes || 30);
  const price = Number(payload.price || 0);
  const pickup = payload.pickupNote?.trim() || "Point de rendez-vous confirme apres reservation";

  return {
    id: `demo-trip-${Date.now()}`,
    depart: payload.depart.trim(),
    destination: payload.destination.trim(),
    routeLabel: `${payload.depart.trim()} - ${payload.destination.trim()}`,
    conducteurId,
    departureAt,
    durationMinutes,
    time: formatTimeWindow(departureAt, durationMinutes),
    driver: user.name,
    driverInitials: user.initials || getInitials(user.name),
    car: user.car || "Vehicule a renseigner",
    seats,
    totalSeats: seats,
    duration: formatDuration(durationMinutes),
    price,
    rating: Number(user.rating || 0),
    role: user.role,
    description: payload.description?.trim() || "",
    pickup,
    pickupNote: pickup,
  };
}

function buildPublishedTripFromCard(trip) {
  const seatsLeft = Number(trip.seats || 0);
  const totalSeats = Number(trip.totalSeats || trip.seats || 0);
  const isPast = new Date(trip.departureAt) < new Date();
  const status = isPast ? "Passe" : seatsLeft <= 0 ? "Complet" : "Actif";
  const remainingLabel = seatsLeft > 1 ? "places" : "place";

  return {
    id: trip.id,
    route: trip.routeLabel,
    date: formatRelativeDate(trip.departureAt),
    time: formatClock(trip.departureAt),
    price: trip.price,
    seats: `${seatsLeft}/${totalSeats}`,
    status,
    passengers:
      seatsLeft <= 0
        ? "Liste complete"
        : `Encore ${seatsLeft} ${remainingLabel}`,
  };
}

function buildDemoReservation(trip, message) {
  return {
    id: `demo-reservation-${Date.now()}`,
    trajetId: trip.id,
    route: trip.routeLabel,
    date: formatRelativeDate(trip.departureAt),
    time: formatClock(trip.departureAt),
    driver: trip.driver,
    pickup: trip.pickup,
    message: message.trim(),
    status: "En attente",
    price: trip.price,
  };
}

function isTripOwnedByCurrentUser(trip, user, sessionUserId) {
  if (!trip || !user) {
    return false;
  }

  if (sessionUserId && trip.conducteurId) {
    return trip.conducteurId === sessionUserId;
  }

  return (
    trip.driver?.trim().toLowerCase() === user.name?.trim().toLowerCase()
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
  const [refreshKey, setRefreshKey] = useState(0);
  const [selectedTripId, setSelectedTripId] = useState("");

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
  }, [canUseSupabaseData, profile, refreshKey, sessionUserId]);

  const discoverableTrips = appData.tripOptions.filter(
    (trip) => !isTripOwnedByCurrentUser(trip, appData.currentUser, sessionUserId),
  );

  const reservedTripIds = appData.reservations
    .filter((reservation) => reservation.status !== "Annulee")
    .map((reservation) => reservation.trajetId)
    .filter(Boolean);

  const selectedTrip =
    discoverableTrips.find((trip) => trip.id === selectedTripId) || null;

  function openTripReservation(tripId) {
    setSelectedTripId(tripId);
    navigate("reservation");
  }

  async function handlePublish(payload) {
    if (canUseSupabaseData) {
      await trajetService.createTrajet(payload, sessionUserId);
      setRefreshKey((currentKey) => currentKey + 1);
      return;
    }

    const conducteurId = sessionUserId || "demo-current-user";
    const nextTrip = buildDemoTripCard(payload, appData.currentUser, conducteurId);

    setAppData((currentData) => ({
      ...currentData,
      currentUser: {
        ...currentData.currentUser,
        tripsCount: currentData.currentUser.tripsCount + 1,
      },
      publishedTrips: [
        buildPublishedTripFromCard(nextTrip),
        ...currentData.publishedTrips,
      ],
      tripOptions: [nextTrip, ...currentData.tripOptions],
    }));
  }

  async function handleReserve(selectedTripOption, message) {
    if (!selectedTripOption?.id) {
      throw new Error("Choisis d'abord un trajet avant de reserver.");
    }

    if (reservedTripIds.includes(selectedTripOption.id)) {
      throw new Error("Ce trajet est deja present dans tes reservations.");
    }

    if (selectedTripOption.seats <= 0) {
      throw new Error("Ce trajet n'a plus de place disponible.");
    }

    if (canUseSupabaseData) {
      await reservationService.createReservation({
        trajetId: selectedTripOption.id,
        passagerId: sessionUserId,
        messagePassager: message,
      });
      setRefreshKey((currentKey) => currentKey + 1);
      return;
    }

    const nextReservation = buildDemoReservation(selectedTripOption, message);

    setAppData((currentData) => {
      const nextTripOptions = currentData.tripOptions.map((trip) =>
        trip.id === selectedTripOption.id
          ? { ...trip, seats: Math.max(Number(trip.seats) - 1, 0) }
          : trip,
      );
      const updatedTrip = nextTripOptions.find((trip) => trip.id === selectedTripOption.id);
      const nextPublishedTrips = currentData.publishedTrips.map((trip) =>
        trip.id === selectedTripOption.id && updatedTrip
          ? buildPublishedTripFromCard(updatedTrip)
          : trip,
      );

      return {
        ...currentData,
        currentUser: {
          ...currentData.currentUser,
          reservationsCount: currentData.currentUser.reservationsCount + 1,
        },
        publishedTrips: nextPublishedTrips,
        reservations: [nextReservation, ...currentData.reservations],
        tripOptions: nextTripOptions,
      };
    });
  }

  async function handleCancelReservation(reservationId) {
    if (canUseSupabaseData) {
      await reservationService.cancelReservation({
        reservationId,
        passagerId: sessionUserId,
      });
      setRefreshKey((currentKey) => currentKey + 1);
      return;
    }

    const reservationToCancel = appData.reservations.find(
      (reservation) => reservation.id === reservationId,
    );

    if (!reservationToCancel) {
      throw new Error("Reservation introuvable.");
    }

    if (reservationToCancel.status === "Annulee") {
      return;
    }

    setAppData((currentData) => {
      const nextReservations = currentData.reservations.map((reservation) =>
        reservation.id === reservationId
          ? { ...reservation, status: "Annulee" }
          : reservation,
      );
      const nextTripOptions = currentData.tripOptions.map((trip) => {
        if (trip.id !== reservationToCancel.trajetId) {
          return trip;
        }

        return {
          ...trip,
          seats: Math.min(Number(trip.totalSeats || trip.seats), Number(trip.seats) + 1),
        };
      });
      const updatedTrip = nextTripOptions.find(
        (trip) => trip.id === reservationToCancel.trajetId,
      );
      const nextPublishedTrips = currentData.publishedTrips.map((trip) =>
        trip.id === reservationToCancel.trajetId && updatedTrip
          ? buildPublishedTripFromCard(updatedTrip)
          : trip,
      );

      return {
        ...currentData,
        publishedTrips: nextPublishedTrips,
        reservations: nextReservations,
        tripOptions: nextTripOptions,
      };
    });
  }

  const isAuthRoute = authRoutes.includes(route);
  const showNav = !isAuthRoute;
  let screen = null;

  if (route === "splash") {
    screen = <Splash navigate={navigate} />;
  } else if (route === "login") {
    screen = <Login navigate={navigate} />;
  } else if (route === "register") {
    screen = <Register navigate={navigate} />;
  } else if (route === "home") {
    screen = (
      <Home
        navigate={navigate}
        onTripSelect={openTripReservation}
        tripOptions={discoverableTrips}
        user={appData.currentUser}
      />
    );
  } else if (route === "search") {
    screen = (
      <SearchTrajet
        navigate={navigate}
        onTripSelect={openTripReservation}
        tripOptions={discoverableTrips}
      />
    );
  } else if (route === "publish") {
    screen = (
      <PublishTrajet
        navigate={navigate}
        onPublish={handlePublish}
        user={appData.currentUser}
      />
    );
  } else if (route === "reservation") {
    screen = (
      <Reservation
        navigate={navigate}
        onReserve={handleReserve}
        onTripSelect={openTripReservation}
        reservedTripIds={reservedTripIds}
        selectedTrip={selectedTrip}
        tripOptions={discoverableTrips}
      />
    );
  } else if (route === "profile") {
    screen = (
      <Profile
        navigate={navigate}
        profileLinks={profileLinks}
        user={appData.currentUser}
      />
    );
  } else if (route === "my-trips") {
    screen = (
      <MyTrajets
        navigate={navigate}
        publishedTrips={appData.publishedTrips}
        user={appData.currentUser}
      />
    );
  } else {
    screen = (
      <MyReservations
        navigate={navigate}
        onCancelReservation={handleCancelReservation}
        reservations={appData.reservations}
      />
    );
  }

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
            {screen}
          </div>
          {showNav ? <BottomNav route={route} navigate={navigate} /> : null}
        </div>
      </section>
    </div>
  );
}

export default App;
