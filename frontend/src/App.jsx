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
import Notifications from "./pages/Notifications";
import NotificationDetail from "./pages/NotificationDetail";
import DriverProfile from "./pages/DriverProfile";
import TripDetailPage from "./pages/TripDetailPage";
import Chat from "./pages/Chat";
import Profile from "./pages/Profile";
import PublishTrajet from "./pages/PublishTrajet";
import Register from "./pages/Register";
import Reservation from "./pages/Reservation";
import SearchTrajet from "./pages/SearchTrajet";
import Splash from "./pages/Splash";
import { reservationService } from "./services/reservationService";
import { supabase } from "./services/supabaseClient";
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
  { route: "notifications", label: "Notifications" },
  { route: "notification-detail", label: "Detail notification" },
  { route: "driver-profile", label: "Profil conducteur" },
  { route: "trip-detail", label: "Detail trajet" },
  { route: "chat", label: "Chat" },
];

const allRoutes = [...authRoutes, ...appRoutes.map((screen) => screen.route)];
const defaultAppData = {
  currentUser: defaultCurrentUser,
  publishedTrips: defaultPublishedTrips,
  reservations: defaultReservations,
  tripOptions: defaultTripOptions,
};

const emptyAppData = {
  currentUser: {
    name: "",
    initials: "",
    role: "",
    roleValue: "passager",
    email: "",
    phone: "",
    photo: "",
    rating: 0,
    tripsCount: 0,
    reservationsCount: 0,
    reviewCount: 0,
    car: "",
    bio: "",
    campus: "",
    vehicle: null,
  },
  publishedTrips: [],
  reservations: [],
  tripOptions: [],
};

const appModeConfig = {
  passenger: {
    defaultRoute: "search",
    label: "Passager",
    role: "Etudiant passager",
    roleValue: "passager",
  },
  driver: {
    defaultRoute: "my-trips",
    label: "Driver",
    role: "Etudiant conducteur",
    roleValue: "conducteur",
  },
};

const routeModeHints = {
  publish: "driver",
  "my-trips": "driver",
  reservation: "passenger",
  search: "passenger",
  "my-reservations": "passenger",
};

function getRouteFromHash(hash) {
  const raw = hash.replace(/^#\/?/, "");
  return allRoutes.includes(raw) ? raw : "splash";
}

function normalizeMode(mode) {
  return mode === "driver" ? "driver" : "passenger";
}

function persistMode(mode) {
  if (typeof window !== "undefined") {
    window.localStorage.setItem("campusride-mode", normalizeMode(mode));
  }
}

function readInitialMode(initialRoute) {
  const hintedMode = routeModeHints[initialRoute];

  if (hintedMode) {
    return hintedMode;
  }

  if (typeof window !== "undefined") {
    return normalizeMode(window.localStorage.getItem("campusride-mode"));
  }

  return "passenger";
}

function applyModeToUser(user, mode) {
  const modeConfig = appModeConfig[normalizeMode(mode)];

  return {
    ...user,
    role: modeConfig.role,
    roleValue: modeConfig.roleValue,
  };
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
  const passengerReservations = trip.passengerReservations || [];
  const passengers = buildPassengerSummary(passengerReservations, seatsLeft);

  return {
    id: trip.id,
    route: trip.routeLabel,
    date: formatRelativeDate(trip.departureAt),
    time: formatClock(trip.departureAt),
    price: trip.price,
    seats: `${seatsLeft}/${totalSeats}`,
    status,
    passengers,
    passengerReservations,
  };
}

function normalizeTheme(theme) {
  return theme === "dark" ? "dark" : "light";
}

function readInitialTheme() {
  if (typeof window === "undefined") {
    return "light";
  }

  const savedTheme = window.localStorage.getItem("campusride-theme");

  if (savedTheme) {
    return normalizeTheme(savedTheme);
  }

  return window.matchMedia?.("(prefers-color-scheme: dark)")?.matches
    ? "dark"
    : "light";
}

function buildPassengerSummary(passengerReservations = [], seatsLeft = 0) {
  const confirmedCount = passengerReservations.filter(
    (reservation) => reservation.status === "Confirmee",
  ).length;
  const pendingCount = passengerReservations.filter(
    (reservation) => reservation.status === "En attente",
  ).length;

  if (confirmedCount || pendingCount) {
    return [
      confirmedCount ? `${confirmedCount} confirme(s)` : "",
      pendingCount ? `${pendingCount} en attente` : "",
    ].filter(Boolean).join(" - ");
  }

  const remainingLabel = seatsLeft > 1 ? "places" : "place";

  return seatsLeft <= 0 ? "Liste complete" : `Encore ${seatsLeft} ${remainingLabel}`;
}

function parsePublishedSeatsLeft(seats = "0/0") {
  return Number(`${seats}`.split("/")[0] || 0);
}

function applyPassengerReservationsToPublishedTrip(trip, passengerReservations) {
  return {
    ...trip,
    passengers: buildPassengerSummary(
      passengerReservations,
      parsePublishedSeatsLeft(trip.seats),
    ),
    passengerReservations,
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

function buildDemoPassengerReservation(reservation, user) {
  return {
    id: reservation.id,
    passenger: user.name,
    passengerInitials: user.initials,
    phone: user.phone,
    status: reservation.status,
    message: reservation.message,
    createdAt: new Date().toISOString(),
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
  const [activeMode, setActiveMode] = useState(() => {
    if (typeof window === "undefined") {
      return "passenger";
    }

    return readInitialMode(getRouteFromHash(window.location.hash));
  });
  const [appData, setAppData] = useState(() => isConfigured ? emptyAppData : defaultAppData);
  const [dataError, setDataError] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);
  const [selectedTripId, setSelectedTripId] = useState("");
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [selectedTripDetail, setSelectedTripDetail] = useState(null);
  const [chatContext, setChatContext] = useState(null);
  const [recentMessages, setRecentMessages] = useState([]);
  const [selectedDriverData, setSelectedDriverData] = useState(null);
  const [theme, setTheme] = useState(readInitialTheme);

  const sessionUserId = session?.user?.id || "";
  const demoMode = !isConfigured;
  const canUseSupabaseData = isConfigured && Boolean(sessionUserId);

  useEffect(() => {
    function handleHashChange() {
      const nextRoute = getRouteFromHash(window.location.hash);
      const hintedMode = routeModeHints[nextRoute];

      setRoute(nextRoute);

      if (hintedMode) {
        setActiveMode(hintedMode);
        // Don't persist — only explicit user mode switches persist
      }
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
    const hintedMode = routeModeHints[normalizedRoute];

    if (hintedMode) {
      setActiveMode(hintedMode);
      // Don't persist route-hinted mode — only explicit user switches persist
    }

    if (typeof window !== "undefined") {
      window.location.hash = `#/${normalizedRoute}`;
    }

    setRoute(normalizedRoute);
  }

  function handleModeChange(nextMode, preferredRoute = "") {
    const normalizedMode = normalizeMode(nextMode);
    setActiveMode(normalizedMode);
    persistMode(normalizedMode);

    if (preferredRoute) {
      navigate(preferredRoute);
      return;
    }

    const routeMode = routeModeHints[route];

    if (routeMode && routeMode !== normalizedMode) {
      navigate(appModeConfig[normalizedMode].defaultRoute);
    }
  }

  useEffect(() => {
    if (authLoading || !isConfigured) {
      return;
    }

    if (sessionUserId && authRoutes.includes(route)) {
      navigate("home");
      return;
    }

    if (!sessionUserId && !authRoutes.includes(route)) {
      navigate("splash");
    }
  }, [authLoading, isConfigured, route, sessionUserId]);

  useEffect(() => {
    if (authLoading) {
      return;
    }

    if (!canUseSupabaseData) {
      if (!isConfigured) {
        setDataError("");
        setAppData(defaultAppData);
      } else {
        setDataError("");
        setAppData(emptyAppData);
      }
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
  }, [authLoading, canUseSupabaseData, isConfigured, profile, refreshKey, sessionUserId]);

  useEffect(() => {
    if (!canUseSupabaseData || !supabase) {
      return undefined;
    }

    const refreshAppData = () => {
      setRefreshKey((currentKey) => currentKey + 1);
    };

    // Load recent messages on startup (last 24h)
    async function loadRecentMessages() {
      try {
        const since = new Date(Date.now() - 86400000).toISOString();
        const { data } = await supabase
          .from("messages")
          .select("*, profiles!messages_sender_id_fkey(full_name), reservations!messages_reservation_id_fkey(trajet_id, trajets(depart, destination))")
          .neq("sender_id", sessionUserId)
          .gte("created_at", since)
          .order("created_at", { ascending: false })
          .limit(30);
        if (data && data.length > 0) {
          const msgs = data.map((msg) => ({
            ...msg,
            senderName: msg.profiles?.full_name || "Contact",
            tripRoute: msg.reservations?.trajets ? `${msg.reservations.trajets.depart} → ${msg.reservations.trajets.destination}` : "",
            profiles: undefined,
            reservations: undefined,
          }));
          setRecentMessages(msgs);
        }
      } catch { /* ignore */ }
    }
    loadRecentMessages();

    const channel = supabase
      .channel(`campusride-live-${sessionUserId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "reservations" }, refreshAppData)
      .on("postgres_changes", { event: "*", schema: "public", table: "trajets" }, refreshAppData)
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "profiles" }, refreshAppData)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages" }, async (payload) => {
        const msg = payload.new;
        if (!msg || msg.sender_id === sessionUserId) return;
        try {
          const [profileRes, reservationRes] = await Promise.all([
            supabase.from("profiles").select("full_name").eq("id", msg.sender_id).maybeSingle(),
            supabase.from("reservations").select("*, trajets(depart, destination)").eq("id", msg.reservation_id).maybeSingle(),
          ]);
          setRecentMessages((prev) => {
            if (prev.some((m) => m.id === msg.id)) return prev;
            return [{
              ...msg,
              senderName: profileRes.data?.full_name || "Contact",
              tripRoute: reservationRes.data?.trajets ? `${reservationRes.data.trajets.depart} → ${reservationRes.data.trajets.destination}` : "",
            }, ...prev].slice(0, 30);
          });
        } catch {
          setRecentMessages((prev) => {
            if (prev.some((m) => m.id === msg.id)) return prev;
            return [{ ...msg, senderName: "Message", tripRoute: "" }, ...prev].slice(0, 30);
          });
        }
      })
      .subscribe();

    // Poll new messages every 5s
    let lastPoll = Date.now();
    const pollInterval = setInterval(async () => {
      try {
        const since = new Date(lastPoll - 2000).toISOString();
        const { data } = await supabase
          .from("messages")
          .select("*, profiles!messages_sender_id_fkey(full_name), reservations!messages_reservation_id_fkey(trajet_id, trajets(depart, destination))")
          .neq("sender_id", sessionUserId)
          .gte("created_at", since)
          .order("created_at", { ascending: false })
          .limit(10);
        lastPoll = Date.now();
        if (data && data.length > 0) {
          setRecentMessages((prev) => {
            const ids = new Set(prev.map((m) => m.id));
            const fresh = data.filter((m) => !ids.has(m.id)).map((msg) => ({
              ...msg,
              senderName: msg.profiles?.full_name || "Contact",
              tripRoute: msg.reservations?.trajets ? `${msg.reservations.trajets.depart} → ${msg.reservations.trajets.destination}` : "",
              profiles: undefined, reservations: undefined,
            }));
            if (!fresh.length) return prev;
            return [...fresh, ...prev].slice(0, 30);
          });
        }
      } catch { /* ignore */ }
    }, 5000);

    // Auto-refresh all app data every 5s (reservations, trips, etc.)
    const dataInterval = setInterval(refreshAppData, 5000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(pollInterval);
      clearInterval(dataInterval);
    };
  }, [canUseSupabaseData, sessionUserId]);

  const currentUser = applyModeToUser(appData.currentUser, activeMode);
  const discoverableTrips = appData.tripOptions.filter(
    (trip) => !isTripOwnedByCurrentUser(trip, currentUser, sessionUserId),
  );

  const notificationCount = recentMessages.length + (activeMode === "driver"
    ? appData.publishedTrips.reduce(
        (sum, trip) => sum + (trip.passengerReservations || []).filter((r) => r.status === "En attente").length,
        0,
      )
    : appData.reservations.filter((r) => r.status === "Confirmee" || r.status === "En attente").length);

  const reservedTripIds = appData.reservations
    .filter((reservation) => reservation.status !== "Annulee")
    .map((reservation) => reservation.trajetId)
    .filter(Boolean);

  const selectedTrip =
    discoverableTrips.find((trip) => trip.id === selectedTripId)
    || appData.tripOptions.find((trip) => trip.id === selectedTripId)
    || null;

  function openTripReservation(tripId) {
    setSelectedTripId(tripId);
    navigate("reservation");
  }

  function openNotificationDetail(notification) {
    // Message notification → open chat
    if (notification.type === "message" || notification.id?.startsWith("msg-")) {
      setChatContext({
        reservationId: notification.reservationId,
        otherName: notification.otherName || notification.driver || notification.passenger || "Contact",
        tripRoute: notification.tripRoute || notification.route || "",
        backRoute: "notifications",
      });
      navigate("chat");
      return;
    }

    // Driver notification → open trip detail
    if (notification.id?.startsWith("driver-")) {
      const fullId = notification.id.replace("driver-", "");
      const tripId = fullId.slice(0, 36);
      const trip = appData.publishedTrips.find((t) => t.id === tripId);
      if (trip) {
        setSelectedTripDetail({ ...trip, _backRoute: "notifications" });
        navigate("trip-detail");
        return;
      }
      navigate("my-trips");
      return;
    }

    // Passenger notification → open the specific trip reservation
    if (notification.reservationId) {
      const reservation = appData.reservations.find((r) => r.id === notification.reservationId);
      if (reservation?.trajetId) {
        const trip = appData.tripOptions.find((t) => t.id === reservation.trajetId)
          || discoverableTrips.find((t) => t.id === reservation.trajetId);
        if (trip) {
          setSelectedTripId(trip.id);
          navigate("reservation");
          return;
        }
      }
    }

    navigate("my-reservations");
  }

  function openDriverProfile(tripData) {
    setSelectedDriverData(tripData);
    navigate("driver-profile");
  }

  function openChat(context) {
    setChatContext(context);
    navigate("chat");
  }

  async function handlePublish(payload) {
    if (canUseSupabaseData) {
      try {
        await trajetService.createTrajet(payload, sessionUserId);
        setRefreshKey((currentKey) => currentKey + 1);
      } catch (publishError) {
        console.error("[CampusRide] Publication failed:", publishError);
        throw publishError;
      }
      return;
    }

    const conducteurId = sessionUserId || "demo-current-user";
    const nextTrip = buildDemoTripCard(payload, currentUser, conducteurId);

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
      const nextPublishedTrips = currentData.publishedTrips.map((trip) => {
        if (trip.id !== selectedTripOption.id || !updatedTrip) {
          return trip;
        }

        const passengerReservations = [
          buildDemoPassengerReservation(nextReservation, currentUser),
          ...(trip.passengerReservations || []),
        ];

        return buildPublishedTripFromCard({
          ...updatedTrip,
          passengerReservations,
        });
      });

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
      const nextPublishedTrips = currentData.publishedTrips.map((trip) => {
        if (trip.id !== reservationToCancel.trajetId || !updatedTrip) {
          return trip;
        }

        const passengerReservations = (trip.passengerReservations || []).map((reservation) =>
          reservation.id === reservationId
            ? { ...reservation, status: "Annulee" }
            : reservation,
        );

        return buildPublishedTripFromCard({
          ...updatedTrip,
          passengerReservations,
        });
      });

      return {
        ...currentData,
        publishedTrips: nextPublishedTrips,
        reservations: nextReservations,
        tripOptions: nextTripOptions,
      };
    });
  }

  function handleThemeChange(nextTheme) {
    const normalizedTheme = normalizeTheme(nextTheme);
    setTheme(normalizedTheme);

    if (typeof window !== "undefined") {
      window.localStorage.setItem("campusride-theme", normalizedTheme);
    }
  }

  useEffect(() => {
    if (typeof document === "undefined") {
      return;
    }

    document.documentElement.dataset.theme = theme;
  }, [theme]);

  async function handleConfirmPassengerReservation(reservationId) {
    if (canUseSupabaseData) {
      await reservationService.updateReservationStatus({
        conducteurId: sessionUserId,
        reservationId,
        statut: "confirmee",
      });
      setRefreshKey((currentKey) => currentKey + 1);
      return;
    }

    setAppData((currentData) => ({
      ...currentData,
      publishedTrips: currentData.publishedTrips.map((trip) => {
        const passengerReservations = (trip.passengerReservations || []).map((reservation) =>
          reservation.id === reservationId
            ? { ...reservation, status: "Confirmee" }
            : reservation,
        );

        return applyPassengerReservationsToPublishedTrip(trip, passengerReservations);
      }),
    }));
  }

  async function handleRejectPassengerReservation(reservationId) {
    if (canUseSupabaseData) {
      await reservationService.updateReservationStatus({
        conducteurId: sessionUserId,
        reservationId,
        statut: "refusee",
      });
      setRefreshKey((currentKey) => currentKey + 1);
      return;
    }

    setAppData((currentData) => ({
      ...currentData,
      publishedTrips: currentData.publishedTrips.map((trip) => {
        const passengerReservations = (trip.passengerReservations || []).map((reservation) =>
          reservation.id === reservationId
            ? { ...reservation, status: "Refusee" }
            : reservation,
        );

        return applyPassengerReservationsToPublishedTrip(trip, passengerReservations);
      }),
    }));
  }

  async function handleCloseTripReservations(tripId) {
    if (canUseSupabaseData) {
      await trajetService.closeTrajet(tripId, sessionUserId);
      setRefreshKey((currentKey) => currentKey + 1);
      return;
    }

    setAppData((currentData) => ({
      ...currentData,
      publishedTrips: currentData.publishedTrips.map((trip) =>
        trip.id === tripId ? { ...trip, seats: "0/0", status: "Ferme" } : trip,
      ),
      tripOptions: currentData.tripOptions.map((trip) =>
        trip.id === tripId ? { ...trip, seats: 0 } : trip,
      ),
    }));
  }

  async function handleDeleteTrip(tripId) {
    if (canUseSupabaseData) {
      await trajetService.deleteTrajet(tripId, sessionUserId);
      setRefreshKey((currentKey) => currentKey + 1);
      return;
    }

    setAppData((currentData) => ({
      ...currentData,
      publishedTrips: currentData.publishedTrips.filter((trip) => trip.id !== tripId),
      tripOptions: currentData.tripOptions.filter((trip) => trip.id !== tripId),
    }));
  }

  const isAuthRoute = authRoutes.includes(route);
  const isSplashRoute = route === "splash";
  const hideNavRoutes = ["chat", "trip-detail", "notification-detail", "driver-profile"];
  const showNav = !isAuthRoute && !hideNavRoutes.includes(route);
  let screen = null;

  // Don't block the UI - let pages handle their own loading states
  if (route === "splash") {
    screen = <Splash navigate={navigate} />;
  } else if (route === "login") {
    screen = <Login navigate={navigate} />;
  } else if (route === "register") {
    screen = <Register navigate={navigate} />;
  } else if (route === "home") {
    screen = (
      <Home
        mode={activeMode}
        navigate={navigate}
        onModeChange={handleModeChange}
        onThemeChange={handleThemeChange}
        onTripSelect={openTripReservation}
        onViewDriver={openDriverProfile}
        publishedTrips={appData.publishedTrips}
        reservations={appData.reservations}
        theme={theme}
        tripOptions={discoverableTrips}
        user={currentUser}
      />
    );
  } else if (route === "search") {
    screen = (
      <SearchTrajet
        navigate={navigate}
        onTripSelect={openTripReservation}
        onViewDriver={openDriverProfile}
        tripOptions={discoverableTrips}
      />
    );
  } else if (route === "publish") {
    screen = (
      <PublishTrajet
        navigate={navigate}
        onPublish={handlePublish}
        user={currentUser}
      />
    );
  } else if (route === "reservation") {
    screen = (
      <Reservation
        navigate={navigate}
        onReserve={handleReserve}
        onTripSelect={openTripReservation}
        onViewDriver={openDriverProfile}
        reservedTripIds={reservedTripIds}
        selectedTrip={selectedTrip}
        tripOptions={discoverableTrips}
      />
    );
  } else if (route === "profile") {
    screen = (
      <Profile
        mode={activeMode}
        navigate={navigate}
        onModeChange={handleModeChange}
        onThemeChange={handleThemeChange}
        profileLinks={profileLinks}
        theme={theme}
        user={currentUser}
      />
    );
  } else if (route === "my-trips") {
    screen = (
      <MyTrajets
        navigate={navigate}
        onCloseTrip={handleCloseTripReservations}
        onConfirmReservation={handleConfirmPassengerReservation}
        onDeleteTrip={handleDeleteTrip}
        onOpenChat={openChat}
        onRejectReservation={handleRejectPassengerReservation}
        publishedTrips={appData.publishedTrips}
        user={currentUser}
      />
    );
  } else if (route === "notifications") {
    screen = (
      <Notifications
        mode={activeMode}
        navigate={navigate}
        onSelectNotification={openNotificationDetail}
        publishedTrips={appData.publishedTrips}
        recentMessages={recentMessages}
        reservations={appData.reservations}
      />
    );
  } else if (route === "notification-detail") {
    screen = (
      <NotificationDetail
        mode={activeMode}
        navigate={navigate}
        notification={selectedNotification}
      />
    );
  } else if (route === "driver-profile") {
    screen = (
      <DriverProfile
        driverData={selectedDriverData}
        navigate={navigate}
      />
    );
  } else if (route === "trip-detail" && selectedTripDetail) {
    screen = (
      <TripDetailPage
        navigate={navigate}
        onConfirmReservation={handleConfirmPassengerReservation}
        onRejectReservation={handleRejectPassengerReservation}
        onCloseTrip={handleCloseTripReservations}
        onDeleteTrip={handleDeleteTrip}
        trip={selectedTripDetail}
        refreshKey={refreshKey}
        publishedTrips={appData.publishedTrips}
      />
    );
  } else if (route === "chat") {
    screen = (
      <Chat
        chatContext={chatContext}
        navigate={navigate}
        onViewProfile={(ctx) => {
          if (ctx?.conducteurId) {
            setSelectedDriverData({ conducteurId: ctx.conducteurId, driver: ctx.otherName, driverAvatar: ctx.otherAvatar || "" });
            navigate("driver-profile");
          }
        }}
      />
    );
  } else {
    screen = (
      <MyReservations
        navigate={navigate}
        onCancelReservation={handleCancelReservation}
        onOpenChat={openChat}
        onViewDriver={openDriverProfile}
        reservations={appData.reservations}
        sessionUserId={sessionUserId}
        tripOptions={appData.tripOptions}
      />
    );
  }

  return (
    <div className={`app-shell app-theme--${theme}`}>
      <section className="site-stage site-stage--single">
        <div className="stage-orb stage-orb--one" />
        <div className="stage-orb stage-orb--two" />

        <div
          className={[
            "phone-shell",
            isAuthRoute ? "phone-shell--auth" : "phone-shell--app",
            isSplashRoute ? "phone-shell--splash" : "",
          ].filter(Boolean).join(" ")}
        >
          <div
            className={[
              "phone-shell__body",
              isSplashRoute ? "phone-shell__body--splash" : "",
            ].filter(Boolean).join(" ")}
          >
            {dataError && !demoMode && !isAuthRoute ? (
              <div className="sync-banner sync-banner--error">{dataError}</div>
            ) : null}
            {screen}
          </div>
          {showNav ? (
            <BottomNav
              mode={activeMode}
              notificationCount={notificationCount}
              route={route}
              navigate={navigate}
            />
          ) : null}
        </div>
      </section>
    </div>
  );
}

export default App;
