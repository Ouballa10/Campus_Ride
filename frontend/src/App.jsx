import React, { lazy, Suspense, useEffect, useMemo, useState } from "react";
import { HashRouter, Navigate, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import BottomNav from "./components/BottomNav";
import logo from "./assets/images/logo.png";
import { useAuth } from "./context/AuthContext";
import { MenuProvider } from "./context/MenuContext";
import { profileLinks } from "./data/mockData";
import { useAppActions } from "./hooks/useAppActions";
import { useAppData } from "./hooks/useAppData";
import { useRealtime } from "./hooks/useRealtime";
import { applyModeToUser, appModeConfig, normalizeMode, persistMode, readInitialMode, routeModeHints } from "./utils/modeHelpers";
import { normalizeTheme, readInitialTheme } from "./utils/themeHelpers";
import { isTripOwnedByCurrentUser } from "./utils/tripHelpers";

// Lazy-loaded pages for code splitting
const Chat = lazy(() => import("./pages/Chat"));
const DriverProfile = lazy(() => import("./pages/DriverProfile"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const Home = lazy(() => import("./pages/Home"));
const Login = lazy(() => import("./pages/Login"));
const MyReservations = lazy(() => import("./pages/MyReservations"));
const MyTrajets = lazy(() => import("./pages/MyTrajets"));
const NotificationDetail = lazy(() => import("./pages/NotificationDetail"));
const Notifications = lazy(() => import("./pages/Notifications"));
const PassengerProfile = lazy(() => import("./pages/PassengerProfile"));
const Profile = lazy(() => import("./pages/Profile"));
const PublishTrajet = lazy(() => import("./pages/PublishTrajet"));
const Register = lazy(() => import("./pages/Register"));
const Reservation = lazy(() => import("./pages/Reservation"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const SearchTrajet = lazy(() => import("./pages/SearchTrajet"));
const Splash = lazy(() => import("./pages/Splash"));
const TripDetailPage = lazy(() => import("./pages/TripDetailPage"));

// Loading fallback for lazy pages
function PageLoader() {
  return (
    <div className="screen screen--simple" style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh" }}>
      <div style={{ textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: "16px" }}>
        <img src={logo} alt="CampusRide" style={{ width: "48px", opacity: 0.6 }} />
        <div className="refresh-indicator__spinner" />
      </div>
    </div>
  );
}

// Check if there's a persisted session in localStorage (instant, no async)
function hasPersistedSession() {
  if (typeof window === "undefined") return false;
  try {
    const stored = window.localStorage.getItem("campusride-auth");
    if (!stored) return false;
    const parsed = JSON.parse(stored);
    return Boolean(parsed?.access_token || parsed?.user);
  } catch {
    return false;
  }
}

function AppContent() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isConfigured, loading: authLoading, session } = useAuth();

  const sessionUserId = session?.user?.id || "";
  const isLoggedIn = Boolean(sessionUserId);

  // OAuth return detection (captured once)
  const [isOAuthReturn] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.location.search.includes("code=") ||
      window.location.hash.includes("access_token=");
  });

  // Loading timeout
  const [loadingTimedOut, setLoadingTimedOut] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setLoadingTimedOut(true), 6000);
    return () => clearTimeout(timer);
  }, []);

  // Mode management
  const currentPath = location.pathname.replace(/^\//, "");
  const [activeMode, setActiveMode] = useState(() => readInitialMode(currentPath));

  // Theme management
  const [theme, setTheme] = useState(readInitialTheme);

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.dataset.theme = theme;
    }
  }, [theme]);

  function handleThemeChange(nextTheme) {
    const normalized = normalizeTheme(nextTheme);
    setTheme(normalized);
    if (typeof window !== "undefined") {
      window.localStorage.setItem("campusride-theme", normalized);
    }
  }

  // Mode change handler
  function handleModeChange(nextMode, preferredRoute = "") {
    const normalizedMode = normalizeMode(nextMode);
    setActiveMode(normalizedMode);
    persistMode(normalizedMode);

    if (preferredRoute) {
      navigate(`/${preferredRoute}`);
      return;
    }

    const routeMode = routeModeHints[currentPath];
    if (routeMode && routeMode !== normalizedMode) {
      navigate(`/${appModeConfig[normalizedMode].defaultRoute}`);
    }
  }

  // Sync mode from route hints
  useEffect(() => {
    const hintedMode = routeModeHints[currentPath];
    if (hintedMode) {
      setActiveMode(hintedMode);
    }
  }, [currentPath]);

  // App data
  const { appData, setAppData, dataError, demoMode, canUseSupabaseData, refresh } = useAppData();

  // Realtime
  const { recentMessages } = useRealtime({
    canUseSupabaseData,
    sessionUserId,
    onRefresh: refresh,
  });

  // Current user with mode applied
  const currentUser = applyModeToUser(appData.currentUser, activeMode);

  // Discoverable trips (not owned by current user, with available seats)
  const discoverableTrips = useMemo(() =>
    appData.tripOptions
      .filter(
        (trip) => !isTripOwnedByCurrentUser(trip, currentUser, sessionUserId) && trip.seats > 0,
      )
      .sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt) : a.departureAt ? new Date(a.departureAt) : new Date(0);
        const dateB = b.createdAt ? new Date(b.createdAt) : b.departureAt ? new Date(b.departureAt) : new Date(0);
        return dateB - dateA;
      }),
    [appData.tripOptions, currentUser, sessionUserId],
  );

  // Reserved trip IDs
  const reservedTripIds = useMemo(() =>
    appData.reservations
      .filter((r) => r.status !== "Annulee")
      .map((r) => r.trajetId)
      .filter(Boolean),
    [appData.reservations],
  );

  // Notification count
  const notificationCount = recentMessages.length + (activeMode === "driver"
    ? appData.publishedTrips.reduce(
        (sum, trip) => sum + (trip.passengerReservations || []).filter((r) => r.status === "En attente").length,
        0,
      )
    : appData.reservations.filter((r) => r.status === "Confirmee" || r.status === "En attente").length);

  // Actions
  const actions = useAppActions({
    appData,
    setAppData,
    canUseSupabaseData,
    sessionUserId,
    currentUser,
    reservedTripIds,
    refresh,
  });

  // Navigation helpers
  const [selectedTripId, setSelectedTripId] = useState("");
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [selectedTripDetail, setSelectedTripDetail] = useState(null);
  const [chatContext, setChatContext] = useState(null);
  const [selectedDriverData, setSelectedDriverData] = useState(null);
  const [selectedPassengerData, setSelectedPassengerData] = useState(null);

  const selectedTrip = useMemo(() =>
    discoverableTrips.find((trip) => trip.id === selectedTripId)
    || appData.tripOptions.find((trip) => trip.id === selectedTripId)
    || null,
    [discoverableTrips, appData.tripOptions, selectedTripId],
  );

  function appNavigate(route) {
    navigate(`/${route}`);
  }

  function openTripReservation(tripId) {
    setSelectedTripId(tripId);
    navigate("/reservation");
  }

  function openNotificationDetail(notification) {
    if (notification.type === "message" || notification.id?.startsWith("msg-")) {
      setChatContext({
        reservationId: notification.reservationId,
        otherName: notification.otherName || notification.driver || notification.passenger || "Contact",
        tripRoute: notification.tripRoute || notification.route || "",
        backRoute: "notifications",
      });
      navigate("/chat");
      return;
    }

    if (notification.id?.startsWith("driver-")) {
      const fullId = notification.id.replace("driver-", "");
      const tripId = fullId.slice(0, 36);
      const trip = appData.publishedTrips.find((t) => t.id === tripId);
      if (trip) {
        setSelectedTripDetail({ ...trip, _backRoute: "notifications" });
        navigate("/trip-detail");
        return;
      }
      navigate("/my-trips");
      return;
    }

    if (notification.reservationId) {
      const reservation = appData.reservations.find((r) => r.id === notification.reservationId);
      if (reservation?.trajetId) {
        const trip = appData.tripOptions.find((t) => t.id === reservation.trajetId)
          || discoverableTrips.find((t) => t.id === reservation.trajetId);
        if (trip) {
          setSelectedTripId(trip.id);
          navigate("/reservation");
          return;
        }
      }
    }

    navigate("/my-reservations");
  }

  function openDriverProfile(tripData) {
    setSelectedDriverData(tripData);
    navigate("/driver-profile");
  }

  function openPassengerProfile(passengerInfo) {
    setSelectedPassengerData(passengerInfo);
    navigate("/passenger-profile");
  }

  function openChat(context) {
    setChatContext(context);
    navigate("/chat");
  }

  // Redirect logic
  useEffect(() => {
    if (authLoading || !isConfigured) return;
    const authRoutes = ["splash", "login", "register", "forgot-password", ""];
    if (sessionUserId && authRoutes.includes(currentPath)) {
      navigate("/home", { replace: true });
    }
  }, [authLoading, isConfigured, currentPath, sessionUserId, navigate]);

  // Determine UI state
  const hasStoredSession = Boolean(session) || hasPersistedSession();
  const isWaitingForOAuth = !isLoggedIn && isConfigured && !loadingTimedOut && (
    isOAuthReturn || (hasStoredSession && authLoading)
  );

  const authRoutes = ["splash", "login", "register", "forgot-password", "reset-password", ""];
  const isAuthRoute = authRoutes.includes(currentPath);
  const hideNavRoutes = ["chat", "trip-detail", "notification-detail", "driver-profile"];
  const showNav = !isAuthRoute && !hideNavRoutes.includes(currentPath) && isLoggedIn && !isWaitingForOAuth;
  const isSplashRoute = currentPath === "splash" || currentPath === "";

  // Menu context for child components
  const menuContextValue = useMemo(() => ({
    mode: activeMode,
    navigate: appNavigate,
    onModeChange: handleModeChange,
    onThemeChange: handleThemeChange,
    theme,
    user: currentUser,
  }), [activeMode, theme, currentUser]);

  // Loading screen (OAuth return)
  if (isWaitingForOAuth) {
    return (
      <MenuProvider value={menuContextValue}>
        <div className={`app-shell app-theme--${theme}`}>
          <section className="site-stage site-stage--single">
            <div className="stage-orb stage-orb--one" />
            <div className="stage-orb stage-orb--two" />
            <div className="phone-shell phone-shell--auth">
              <div className="phone-shell__body">
                <div className="screen screen--simple" style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "80vh" }}>
                  <div style={{ textAlign: "center" }}>
                    <img src={logo} alt="CampusRide" style={{ width: "120px" }} />
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </MenuProvider>
    );
  }

  // Not logged in — auth routes only
  if (!isLoggedIn) {
    return (
      <MenuProvider value={menuContextValue}>
        <div className={`app-shell app-theme--${theme}`}>
          <section className="site-stage site-stage--single">
            <div className="stage-orb stage-orb--one" />
            <div className="stage-orb stage-orb--two" />
            <div className={`phone-shell phone-shell--auth ${isSplashRoute ? "phone-shell--splash" : ""}`}>
              <div className={`phone-shell__body ${isSplashRoute ? "phone-shell__body--splash" : ""}`}>
                <Suspense fallback={<PageLoader />}>
                  <Routes>
                    <Route path="/login" element={<Login navigate={appNavigate} />} />
                    <Route path="/register" element={<Register navigate={appNavigate} />} />
                    <Route path="/forgot-password" element={<ForgotPassword navigate={appNavigate} />} />
                    <Route path="/reset-password" element={<ResetPassword navigate={appNavigate} />} />
                    <Route path="*" element={<Splash navigate={appNavigate} />} />
                  </Routes>
                </Suspense>
              </div>
            </div>
          </section>
        </div>
      </MenuProvider>
    );
  }

  // Logged in — app routes
  return (
    <MenuProvider value={menuContextValue}>
      <div className={`app-shell app-theme--${theme}`}>
        <section className="site-stage site-stage--single">
          <div className="stage-orb stage-orb--one" />
          <div className="stage-orb stage-orb--two" />
          <div className="phone-shell phone-shell--app">
            <div className="phone-shell__body">
              {dataError && !demoMode ? (
                <div className="sync-banner sync-banner--error">{dataError}</div>
              ) : null}
              <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route path="/home" element={
                  <Home
                    mode={activeMode}
                    navigate={appNavigate}
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
                } />
                <Route path="/search" element={
                  <SearchTrajet
                    navigate={appNavigate}
                    onOpenChat={openChat}
                    onTripSelect={openTripReservation}
                    onViewDriver={openDriverProfile}
                    reservedTripIds={reservedTripIds}
                    tripOptions={discoverableTrips}
                  />
                } />
                <Route path="/publish" element={
                  <PublishTrajet
                    navigate={appNavigate}
                    onPublish={actions.handlePublish}
                    user={currentUser}
                  />
                } />
                <Route path="/reservation" element={
                  <Reservation
                    navigate={appNavigate}
                    onOpenChat={openChat}
                    onReserve={actions.handleReserve}
                    onTripSelect={openTripReservation}
                    onViewDriver={openDriverProfile}
                    reservations={appData.reservations}
                    reservedTripIds={reservedTripIds}
                    selectedTrip={selectedTrip}
                    tripOptions={discoverableTrips}
                  />
                } />
                <Route path="/profile" element={
                  <Profile
                    mode={activeMode}
                    navigate={appNavigate}
                    onModeChange={handleModeChange}
                    onThemeChange={handleThemeChange}
                    profileLinks={profileLinks}
                    theme={theme}
                    user={currentUser}
                  />
                } />
                <Route path="/my-trips" element={
                  <MyTrajets
                    navigate={appNavigate}
                    onCloseTrip={actions.handleCloseTripReservations}
                    onConfirmReservation={actions.handleConfirmPassengerReservation}
                    onDeleteTrip={actions.handleDeleteTrip}
                    onOpenChat={openChat}
                    onRejectReservation={actions.handleRejectPassengerReservation}
                    onViewPassenger={openPassengerProfile}
                    publishedTrips={appData.publishedTrips}
                    user={currentUser}
                  />
                } />
                <Route path="/my-reservations" element={
                  <MyReservations
                    navigate={appNavigate}
                    onCancelReservation={actions.handleCancelReservation}
                    onOpenChat={openChat}
                    onViewDriver={openDriverProfile}
                    reservations={appData.reservations}
                    sessionUserId={sessionUserId}
                    tripOptions={appData.tripOptions}
                  />
                } />
                <Route path="/notifications" element={
                  <Notifications
                    mode={activeMode}
                    navigate={appNavigate}
                    onSelectNotification={openNotificationDetail}
                    publishedTrips={appData.publishedTrips}
                    recentMessages={recentMessages}
                    reservations={appData.reservations}
                  />
                } />
                <Route path="/notification-detail" element={
                  <NotificationDetail
                    mode={activeMode}
                    navigate={appNavigate}
                    notification={selectedNotification}
                  />
                } />
                <Route path="/driver-profile" element={
                  <DriverProfile
                    driverData={selectedDriverData}
                    navigate={appNavigate}
                  />
                } />
                <Route path="/passenger-profile" element={
                  <PassengerProfile
                    passengerData={selectedPassengerData}
                    navigate={appNavigate}
                    backRoute={selectedPassengerData?._backRoute || "my-trips"}
                  />
                } />
                <Route path="/trip-detail" element={
                  <TripDetailPage
                    navigate={appNavigate}
                    onConfirmReservation={actions.handleConfirmPassengerReservation}
                    onRejectReservation={actions.handleRejectPassengerReservation}
                    onCloseTrip={actions.handleCloseTripReservations}
                    onDeleteTrip={actions.handleDeleteTrip}
                    onViewPassenger={openPassengerProfile}
                    trip={selectedTripDetail}
                    refreshKey={0}
                    publishedTrips={appData.publishedTrips}
                  />
                } />
                <Route path="/chat" element={
                  <Chat
                    chatContext={chatContext}
                    navigate={appNavigate}
                    onViewProfile={(ctx) => {
                      if (ctx?.conducteurId) {
                        setSelectedDriverData({ conducteurId: ctx.conducteurId, driver: ctx.otherName, driverAvatar: ctx.otherAvatar || "" });
                        navigate("/driver-profile");
                      }
                    }}
                  />
                } />
                <Route path="/reset-password" element={
                  <ResetPassword navigate={appNavigate} />
                } />
                <Route path="*" element={<Navigate to="/home" replace />} />
              </Routes>
              </Suspense>
            </div>
            {showNav ? (
              <BottomNav
                mode={activeMode}
                notificationCount={notificationCount}
                route={currentPath}
                navigate={appNavigate}
              />
            ) : null}
          </div>
        </section>
      </div>
    </MenuProvider>
  );
}

function App() {
  return (
    <HashRouter>
      <AppContent />
    </HashRouter>
  );
}

export default App;
